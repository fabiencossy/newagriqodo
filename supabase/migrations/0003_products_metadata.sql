-- ========================================================================
-- Migration 0003 — Extension table products
-- ========================================================================
-- Le front a 3 sous-types (PhytoProduct, FertilizerProduct, SeedProduct)
-- avec des champs spécifiques. Plutôt que d'ajouter 10+ colonnes dont la
-- moitié seront NULL selon le sous-type, on stocke les champs spécifiques
-- au sous-type dans une colonne JSONB `metadata`.
--
-- Lecture côté client : on désérialise via le mapping rowToProduct() dans
-- products.store.ts. Évolutif sans nouvelle migration si on ajoute des
-- champs au sous-type.
-- ========================================================================

alter table public.products
  add column if not exists metadata jsonb not null default '{}'::jsonb;

-- Index GIN pour requêtes JSON éventuelles (ex: trouver phyto par
-- substance active, semence par variété)
create index if not exists products_metadata_idx on public.products using gin (metadata);
