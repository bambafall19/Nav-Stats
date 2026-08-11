-- =============================================================================
-- Mini-ligues v2 : lecture des ligues pour leurs membres, classement interne,
-- et jointure par code d'invitation via RPC sécurisée.
-- =============================================================================

-- 1) RPC : rejoindre une ligue avec un code d'invitation
create or replace function public.join_mini_ligue(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ligue public.mini_ligues%rowtype;
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Authentification requise';
  end if;

  select * into v_ligue
    from public.mini_ligues
    where upper(code_invitation) = upper(p_code)
    limit 1;

  if not found then
    raise exception 'Code d''invitation invalide';
  end if;

  insert into public.mini_ligue_members (ligue_id, user_id)
  values (v_ligue.id, v_user)
  on conflict (ligue_id, user_id) do nothing;

  return v_ligue.id;
end;
$$;

grant execute on function public.join_mini_ligue(text) to authenticated;

-- 2) Les membres d'une ligue peuvent lire cette ligue
create policy "Members can read their mini_ligues"
  on public.mini_ligues for select
  using (
    exists (
      select 1 from public.mini_ligue_members m
      where m.ligue_id = mini_ligues.id
        and m.user_id = auth.uid()
    )
  );

-- 3) Un membre d'une ligue peut voir tous les membres de cette ligue (classement)
create policy "Members can view mini_ligue members of their league"
  on public.mini_ligue_members for select
  using (
    exists (
      select 1 from public.mini_ligue_members mine
      where mine.ligue_id = mini_ligue_members.ligue_id
        and mine.user_id = auth.uid()
    )
  );
