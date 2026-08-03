-- =============================================================================
-- Migration: Feature Enhancements for NavéStats
-- Adds tables for mini-ligues, team follows, match reports, and supporting indexes
-- =============================================================================

-- -----------------------------------------------------------------------------
-- MINI-LIGUES (Classement entre amis / ligues privées)
-- -----------------------------------------------------------------------------

create table if not exists public.mini_ligues (
  id                  uuid primary key default gen_random_uuid(),
  nom                 text not null,
  code_invitation     text unique not null,
  createur_id         uuid references public.profiles(id) on delete set null,
  is_public           boolean default true,
  description         text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.mini_ligue_members (
  id          uuid primary key default gen_random_uuid(),
  ligue_id    uuid not null references public.mini_ligues(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  joined_at   timestamptz not null default now(),
  unique(ligue_id, user_id)
);

create index if not exists idx_mini_ligue_members_user on public.mini_ligue_members(user_id);
create index if not exists idx_mini_ligue_members_ligue on public.mini_ligue_members(ligue_id);

-- -----------------------------------------------------------------------------
-- TEAM FOLLOWS (Favoris — suivre une ASC/équipe)
-- -----------------------------------------------------------------------------

create table if not exists public.team_follows (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  equipe_id   uuid not null references public.equipes(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(user_id, equipe_id)
);

create index if not exists idx_team_follows_user on public.team_follows(user_id);
create index if not exists idx_team_follows_equipe on public.team_follows(equipe_id);

-- -----------------------------------------------------------------------------
-- MATCH REPORTS (Gestion des reports / reports de match)
-- -----------------------------------------------------------------------------

create table if not exists public.match_reports (
  id            uuid primary key default gen_random_uuid(),
  match_id      uuid not null references public.matchs(id) on delete cascade,
  reported_by   uuid references public.profiles(id) on delete set null,
  reason        text not null,
  new_date_match date,
  new_heure_match text,
  statut        text not null default 'pending',  -- pending | approved | rejected
  resolved_by   uuid references auth.users(id) on delete set null,
  resolution    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_match_reports_match on public.match_reports(match_id);
create index if not exists idx_match_reports_statut on public.match_reports(statut);
create index if not exists idx_match_reports_created on public.match_reports(created_at desc);

-- -----------------------------------------------------------------------------
-- NOTIFICATION PREFERENCES (for match reminders, team follows, etc.)
-- -----------------------------------------------------------------------------

create table if not exists public.notification_preferences (
  user_id              uuid primary key references public.profiles(id) on delete cascade,
  match_reminder       boolean default true,   -- 1h avant fermeture pronostic
  team_notification    boolean default true,   -- notifications des équipes suivies
  ranking_change       boolean default true,   -- notifications de changement de classement
  community_mentions   boolean default true,   -- when someone mentions you
  push_enabled         boolean default true,
  updated_at           timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- RLS POLICIES
-- -----------------------------------------------------------------------------

-- Enable RLS
alter table public.mini_ligues enable row level security;
alter table public.mini_ligue_members enable row level security;
alter table public.team_follows enable row level security;
alter table public.match_reports enable row level security;
alter table public.notification_preferences enable row level security;

-- Mini-ligues policies
create policy "Users can read public mini_ligues"
  on public.mini_ligues for select
  using (is_public = true or createur_id = auth.uid());

create policy "Users can create mini_ligues"
  on public.mini_ligues for insert
  with check (auth.uid() = createur_id);

create policy "Creators can update their mini_ligues"
  on public.mini_ligues for update
  using (createur_id = auth.uid());

create policy "Creators can delete their mini_ligues"
  on public.mini_ligues for delete
  using (createur_id = auth.uid());

-- Mini-ligue members policies
create policy "Members can view their mini_ligue membership"
  on public.mini_ligue_members for select
  using (user_id = auth.uid());

create policy "Users can join mini_ligues"
  on public.mini_ligue_members for insert
  with check (auth.uid() = user_id);

create policy "Members can leave mini_ligues"
  on public.mini_ligue_members for delete
  using (user_id = auth.uid());

-- Team follows policies
create policy "Users can read their own team follows"
  on public.team_follows for select
  using (user_id = auth.uid());

create policy "Users can follow teams"
  on public.team_follows for insert
  with check (auth.uid() = user_id);

create policy "Users can unfollow teams"
  on public.team_follows for delete
  using (user_id = auth.uid());

-- Match reports policies
create policy "Users can create match reports"
  on public.match_reports for insert
  with check (auth.uid() = reported_by);

create policy "Everyone can read match reports"
  on public.match_reports for select
  using (true);

create policy "Admins can update match reports"
  on public.match_reports for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- Notification preferences policies
create policy "Users can read their own notification preferences"
  on public.notification_preferences for select
  using (user_id = auth.uid());

create policy "Users can manage their own notification preferences"
  on public.notification_preferences for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Auto-create notification preferences for new users
create or replace function public.handle_new_user_notification_prefs()
returns trigger
language plpgsql
as $$
begin
  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists handle_new_user_notification_prefs on public.profiles;
create trigger handle_new_user_notification_prefs
  after insert on public.profiles
  for each row
  execute function public.handle_new_user_notification_prefs();

-- -----------------------------------------------------------------------------
-- MATCH REPORT RESOLUTION TRIGGER
-- When a match report is approved, update the match and notify affected users
-- -----------------------------------------------------------------------------

create or replace function public.handle_match_report_resolution()
returns trigger
language plpgsql
as $$
begin
  -- When a report is approved and has new date/time
  if NEW.statut = 'approved' and NEW.new_date_match is not null then
    update public.matchs
      set date_match = NEW.new_date_match,
          heure_match = NEW.new_heure_match || ':00',
          statut = 'a_venir',
          updated_at = now()
    where id = NEW.match_id;

    -- Notify users who have a pronostic on this match
    insert into public.notifications (user_id, titre, message, type, lien)
    select
      p.user_id,
      '⚽ Match reporté',
      'Le match a été reporté à une nouvelle date.',
      'match',
      '/matchs/' || NEW.match_id
    from public.pronostics p
    where p.match_id = NEW.match_id;
  end if;

  return NEW;
end;
$$;

drop trigger if exists handle_match_report_resolution on public.match_reports;
create trigger handle_match_report_resolution
  after update on public.match_reports
  for each row
  when (old.statut is distinct from new.statut)
  execute function public.handle_match_report_resolution();
