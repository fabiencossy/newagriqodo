-- ========================================================================
-- Migration 0005 — Extension table interventions
-- ========================================================================
-- Pareil que pour products + parcels : on ajoute une colonne metadata jsonb
-- pour les champs spécifiques au sous-type (fertilisation -> N/P/K, phyto ->
-- type + délai + OFAG, récolte -> rendement, etc.).
--
-- + colonne `category` (texte) pour préserver la catégorie front granulaire
-- (front a 9 catégories, DB enum n'en a que 8 — on perd 'cultural' qui
-- est mappé sur 'autre' côté DB et restauré via metadata).
-- ========================================================================

alter table public.interventions
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists category text;

create index if not exists interventions_metadata_idx on public.interventions using gin (metadata);
create index if not exists interventions_category_idx on public.interventions (category);
