create table if not exists public.cadet_matchs (
  id uuid primary key default gen_random_uuid(),
  journee integer not null check (journee > 0),
  date_match date not null,
  poule text not null,
  equipe_a_id uuid references public.equipes(id) on delete set null,
  equipe_b_id uuid references public.equipes(id) on delete set null,
  equipe_a text not null,
  equipe_b text not null,
  terrain text not null,
  ordre text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cadet_matchs
  add column if not exists equipe_a_id uuid references public.equipes(id) on delete set null,
  add column if not exists equipe_b_id uuid references public.equipes(id) on delete set null;

alter table public.cadet_matchs enable row level security;

drop policy if exists "Cadet matchs are readable by everyone" on public.cadet_matchs;
create policy "Cadet matchs are readable by everyone"
  on public.cadet_matchs for select
  using (true);

drop policy if exists "Admins can manage cadet matchs" on public.cadet_matchs;
create policy "Admins can manage cadet matchs"
  on public.cadet_matchs for all
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
    )
  );

drop trigger if exists update_cadet_matchs_updated_at on public.cadet_matchs;
create trigger update_cadet_matchs_updated_at
  before update on public.cadet_matchs
  for each row
  execute function update_updated_at_column();

with source (journee, date_match, poule, equipe_a, equipe_b, terrain, ordre, key_a, key_b) as (
  values
    (1, '2026-08-08'::date, 'A', 'ASC BOKK-JOM', 'ASC ENTENTE C.S', 'RAIL', null, 'bokk', 'entente'),
    (1, '2026-08-08'::date, 'A', 'ASC MAGG-DANE', 'ASC MANKO', 'JAPPO', null, 'magg', 'manko'),
    (1, '2026-08-08'::date, 'B', 'ASC ESPOIRS', 'ASC JUBBO', 'DIAMBAR', null, 'espoirs', 'jubbo'),
    (1, '2026-08-08'::date, 'B', 'ASC WALYDANE', 'ASC RAIL', 'MAAG-DAAN', null, 'waly', 'rail'),
    (1, '2026-08-09'::date, 'B&C', 'ASC KAIRE', 'ASC LAT-DIOR', 'DIAPPO', null, 'kair', 'lat'),
    (1, '2026-08-09'::date, 'B&C', 'ASC KHAIGUI', 'ASC THILLA', 'RAIL', null, 'kha', 'thilla'),
    (1, '2026-08-09'::date, 'C', 'ASC DIAMBARS', 'YAKAAR', 'MAAG-DAAN', null, 'diambars', 'yakaar'),
    (1, '2026-08-09'::date, 'C', 'ASC RAKADIOU', 'ASC JAPPO', 'DIAMBARS', null, 'rakadiou', 'jappo'),
    (2, '2026-08-11'::date, 'A', 'ASC MANKO', 'ASC ENTENTE C.S', 'MAAG-DAAN', null, 'manko', 'entente'),
    (2, '2026-08-11'::date, 'A', 'ASC MAGG-DANE', 'ASC BOKK-JOM', 'RAIL', null, 'magg', 'bokk'),
    (2, '2026-08-11'::date, 'B', 'ASC JUBBO', 'ASC KHAIGUI', 'JAPPO', null, 'jubbo', 'kha'),
    (2, '2026-08-11'::date, 'B', 'ASC ESPOIRS', 'ASC WALYDANE', 'MAAG-DAAN', null, 'espoirs', 'waly'),
    (2, '2026-08-12'::date, 'B&C', 'ASC GUINAW RAIL', 'ASC THILLA', 'MAAG-DAAN', null, 'guinaw', 'thilla'),
    (2, '2026-08-12'::date, 'B&C', 'ASC KAIRE', 'ASC DIAMBARS', 'JAPPO', null, 'kair', 'diambars'),
    (2, '2026-08-12'::date, 'C', 'ASC LAT-DIOR', 'RAKADIOU', 'DIAMBARS', null, 'lat', 'rakadiou'),
    (2, '2026-08-12'::date, 'C', 'ASC YAKAAR', 'ASC JAPPO', 'MAAG-DAAN', null, 'yakaar', 'jappo'),
    (3, '2026-08-15'::date, 'A', 'ASC MAGG-DANE', 'ASC ENTENTE C.S', 'RAIL', null, 'magg', 'entente'),
    (3, '2026-08-15'::date, 'A', 'ASC BOKK-JOM', 'ASC MANKO', 'DIAMBARS', null, 'bokk', 'manko'),
    (3, '2026-08-15'::date, 'B', 'ASC JUBBO', 'ASC THILLA', 'MAAG-DAAN', null, 'jubbo', 'thilla'),
    (3, '2026-08-15'::date, 'B', 'ASC RAIL', 'ASC ESPOIRS', 'JAPPO', null, 'rail', 'espoirs'),
    (3, '2026-08-16'::date, 'B&C', 'WALYDANE', 'ASC KHAIGUI', 'MAAG-DAAN', null, 'waly', 'kha'),
    (3, '2026-08-16'::date, 'B&C', 'ASC YAKAAR', 'ASC KAIRE', 'JAPPO', null, 'yakaar', 'kair'),
    (3, '2026-08-16'::date, 'C', 'ASC LAT-DIOR', 'ASC JAPPO', 'DIAMBARS', null, 'lat', 'jappo'),
    (3, '2026-08-16'::date, 'C', 'ASC DIAMBARS', 'ASC RAKADIOU', 'RAIL', null, 'diambars', 'rakadiou'),
    (4, '2026-08-19'::date, 'B', 'ASC ESPOIRS', 'ASC THILLA', 'DIAMBARS', '1ere H', 'espoirs', 'thilla'),
    (4, '2026-08-19'::date, 'B', 'ASC WALYDANE', 'ASC JUBBO', 'DIAMBARS', '2e H', 'waly', 'jubbo'),
    (4, '2026-08-19'::date, 'B&C', 'ASC RAKADIOU', 'ASC YAKAAR', 'JAPPO', '1ere H', 'rakadiou', 'yakaar'),
    (4, '2026-08-19'::date, 'B&C', 'ASC RAIL', 'ASC KHAIGUI', 'JAPPO', '2e H', 'rail', 'kha'),
    (4, '2026-08-19'::date, 'C', 'ASC LAT-DIOR', 'ASC DIAMBARS', 'MAAG-DAAN', '1ere H', 'lat', 'diambars'),
    (4, '2026-08-19'::date, 'C', 'ASC JAPPO', 'ASC KAIRE', 'MAAG-DAAN', '2e H', 'jappo', 'kair'),
    (5, '2026-08-22'::date, 'B', 'ASC KHAIGUI', 'ASC ESPOIRS', 'DIAMBARS', '1ere H', 'kha', 'espoirs'),
    (5, '2026-08-22'::date, 'B', 'ASC RAIL', 'ASC JUBBO', 'DIAMBARS', '2e H', 'rail', 'jubbo'),
    (5, '2026-08-22'::date, 'B&C', 'ASC WALYDANE', 'ASC THILLA', 'JAPPO', '1ere H', 'waly', 'thilla'),
    (5, '2026-08-22'::date, 'B&C', 'ASC RAKADIOU', 'ASC KAIRE', 'JAPPO', '2e H', 'rakadiou', 'kair'),
    (5, '2026-08-22'::date, 'C', 'ASC LAT-DIOR', 'ASC YAKAAR', 'RAIL', '1ere H', 'lat', 'yakaar'),
    (5, '2026-08-22'::date, 'C', 'ASC DIAMBARS', 'ASC JAPPO', 'RAIL', '2e H', 'diambars', 'jappo')
)
insert into public.cadet_matchs (journee, date_match, poule, equipe_a_id, equipe_b_id, equipe_a, equipe_b, terrain, ordre)
select
  source.journee,
  source.date_match,
  source.poule,
  equipe_a.id,
  equipe_b.id,
  coalesce(equipe_a.nom, source.equipe_a),
  coalesce(equipe_b.nom, source.equipe_b),
  source.terrain,
  source.ordre
from source
left join public.equipes equipe_a on lower(equipe_a.nom) like '%' || source.key_a || '%' or lower(coalesce(equipe_a.sigle, '')) like '%' || source.key_a || '%'
left join public.equipes equipe_b on lower(equipe_b.nom) like '%' || source.key_b || '%' or lower(coalesce(equipe_b.sigle, '')) like '%' || source.key_b || '%'
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('asc-logos', 'asc-logos', true)
on conflict (id) do update set public = true;

drop policy if exists "ASC logos are readable by everyone" on storage.objects;
create policy "ASC logos are readable by everyone"
  on storage.objects for select
  using (bucket_id = 'asc-logos');

drop policy if exists "Admins can upload ASC logos" on storage.objects;
create policy "Admins can upload ASC logos"
  on storage.objects for insert
  with check (
    bucket_id = 'asc-logos'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
    )
  );

drop policy if exists "Admins can update ASC logos" on storage.objects;
create policy "Admins can update ASC logos"
  on storage.objects for update
  using (
    bucket_id = 'asc-logos'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
    )
  );
