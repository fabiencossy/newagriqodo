-- ========================================================================
-- Migration 0004 — Extension table parcels
-- ========================================================================
-- Ajout d'une colonne metadata jsonb pour les champs front qui n'ont pas
-- de colonne dédiée : varietyName, sowingDate, year (campagne par défaut),
-- import_external_props (toutes les props GELAN/Acorda pour traçabilité).
-- ========================================================================

alter table public.parcels
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists parcels_metadata_idx on public.parcels using gin (metadata);
