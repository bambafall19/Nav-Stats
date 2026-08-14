-- Résultats + option forfait pour les matchs cadets et seniors

-- Cadets : scores, statut et forfait
alter table public.cadet_matchs
  add column if not exists score_a integer,
  add column if not exists score_b integer,
  add column if not exists statut text not null default 'a_venir',
  add column if not exists forfait text;

-- Seniors : forfait (indique quelle équipe a déclaré forfait : 'a' ou 'b')
alter table public.matchs
  add column if not exists forfait text;
