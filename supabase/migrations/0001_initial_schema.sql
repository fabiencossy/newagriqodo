-- ========================================================================
-- NewagriQodo v2 — Schéma initial Supabase
-- ========================================================================
-- Architecture multi-tenant : 1 user auth -> N exploitations (farms),
-- chaque exploitation a ses parcelles, segments d'assolement, carnet
-- des champs, catalogue produits et équipe.
--
-- Sécurité : RLS activée partout. L'accès à toute donnée d'une farm
-- nécessite d'en être membre (table farm_members). La fonction
-- is_farm_member() est utilisée par toutes les policies.
--
-- Idempotent : safe à rejouer (CREATE TABLE IF NOT EXISTS, DROP POLICY
-- IF EXISTS avant CREATE POLICY).
-- ========================================================================

-- ------------------------------------------------------------------------
-- Extensions
-- ------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------
-- Helper : trigger updated_at
-- ------------------------------------------------------------------------
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ========================================================================
-- 1. Profiles (extension de auth.users)
-- ========================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  locale text default 'fr-CH',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.tg_set_updated_at();

-- Création automatique d'un profile à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ========================================================================
-- 2. Farms (exploitations) + membership
-- ========================================================================
create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  address text,
  postal_code text,
  city text,
  country text default 'CH',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users
);

drop trigger if exists farms_set_updated_at on public.farms;
create trigger farms_set_updated_at
before update on public.farms
for each row execute function public.tg_set_updated_at();

do $$ begin
  create type public.farm_role as enum ('owner', 'admin', 'manager', 'worker', 'viewer');
exception when duplicate_object then null; end $$;

create table if not exists public.farm_members (
  farm_id uuid not null references public.farms on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role public.farm_role not null default 'worker',
  invited_by uuid references auth.users,
  invited_at timestamptz not null default now(),
  joined_at timestamptz default now(),
  primary key (farm_id, user_id)
);

create index if not exists farm_members_user_idx on public.farm_members (user_id);

-- Invitations en attente (envoyées par email avant que l'utilisateur ait un compte)
create table if not exists public.farm_invitations (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms on delete cascade,
  email text not null,
  role public.farm_role not null default 'worker',
  token text unique not null,
  invited_by uuid references auth.users,
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists farm_invitations_email_idx on public.farm_invitations (email);
create index if not exists farm_invitations_farm_idx on public.farm_invitations (farm_id);

-- ------------------------------------------------------------------------
-- Helper RLS : suis-je membre de cette farm ?
-- SECURITY DEFINER pour éviter la récursion RLS sur farm_members.
-- ------------------------------------------------------------------------
create or replace function public.is_farm_member(farm_uuid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.farm_members
    where farm_id = farm_uuid and user_id = auth.uid()
  );
$$;

create or replace function public.is_farm_admin(farm_uuid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.farm_members
    where farm_id = farm_uuid
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

-- ========================================================================
-- 3. Catalogue cultures (référentiel public — partagé entre toutes farms)
-- ========================================================================
create table if not exists public.cultures (
  key text primary key,
  label text not null,
  color text not null,
  category text not null,
  scientific_name text,
  created_at timestamptz not null default now()
);

-- ========================================================================
-- 4. Catalogue produits (scope farm)
-- ========================================================================
do $$ begin
  create type public.product_type as enum (
    'engrais_mineral',
    'engrais_organique',
    'phyto',
    'semence',
    'autre'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms on delete cascade,
  type public.product_type not null,
  sub_type text,
  name text not null,
  brand text,
  unit text not null default 'kg',
  n_per_unit numeric,
  p_per_unit numeric,
  k_per_unit numeric,
  homologation_number text,
  delai_avant_recolte_jours int,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_farm_idx on public.products (farm_id);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.tg_set_updated_at();

-- ========================================================================
-- 5. Équipe de l'exploitation (workers) — distinct des comptes auth
-- ========================================================================
-- Permet de tracer "qui a fait" sans obliger chaque ouvrier à avoir un
-- compte Supabase. Un worker peut être lié à un user_id (s'il a un
-- compte) ou rester anonyme.
create table if not exists public.farm_workers (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms on delete cascade,
  user_id uuid references auth.users on delete set null,
  first_name text not null,
  last_name text not null,
  email text,
  role text,
  hourly_rate_chf numeric,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists farm_workers_farm_idx on public.farm_workers (farm_id);

drop trigger if exists farm_workers_set_updated_at on public.farm_workers;
create trigger farm_workers_set_updated_at
before update on public.farm_workers
for each row execute function public.tg_set_updated_at();

-- ========================================================================
-- 6. Parcelles + groupes
-- ========================================================================
do $$ begin
  create type public.parcel_status as enum ('active', 'archived', 'planned');
exception when duplicate_object then null; end $$;

create table if not exists public.parcels (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms on delete cascade,
  code text,
  name text not null,
  surface_ha numeric not null,
  geometry jsonb,         -- GeoJSON Polygon [lng, lat]
  centroid jsonb,         -- {lat, lng}
  culture_key text references public.cultures(key),
  status public.parcel_status not null default 'active',
  notes text,
  imported_from text,     -- 'gelan' | 'acorda' | 'manual' | 'drawn'
  external_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists parcels_farm_idx on public.parcels (farm_id);
create index if not exists parcels_culture_idx on public.parcels (culture_key);

drop trigger if exists parcels_set_updated_at on public.parcels;
create trigger parcels_set_updated_at
before update on public.parcels
for each row execute function public.tg_set_updated_at();

create table if not exists public.parcel_groups (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms on delete cascade,
  name text not null,
  color text,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists parcel_groups_farm_idx on public.parcel_groups (farm_id);

drop trigger if exists parcel_groups_set_updated_at on public.parcel_groups;
create trigger parcel_groups_set_updated_at
before update on public.parcel_groups
for each row execute function public.tg_set_updated_at();

create table if not exists public.parcel_group_members (
  group_id uuid not null references public.parcel_groups on delete cascade,
  parcel_id uuid not null references public.parcels on delete cascade,
  primary key (group_id, parcel_id)
);

create index if not exists parcel_group_members_parcel_idx on public.parcel_group_members (parcel_id);

-- ========================================================================
-- 7. Segments d'assolement (1 segment = 1 culture sur 1 parcelle sur N jours)
-- ========================================================================
create table if not exists public.assolement_segments (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms on delete cascade,
  parcel_id uuid not null references public.parcels on delete cascade,
  campaign int not null,
  culture_key text not null references public.cultures(key),
  variety text,
  start_date date not null,
  end_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index if not exists assolement_segments_parcel_campaign_idx
  on public.assolement_segments (parcel_id, campaign);
create index if not exists assolement_segments_farm_idx
  on public.assolement_segments (farm_id);

drop trigger if exists assolement_segments_set_updated_at on public.assolement_segments;
create trigger assolement_segments_set_updated_at
before update on public.assolement_segments
for each row execute function public.tg_set_updated_at();

-- ========================================================================
-- 8. Carnet des champs (interventions)
-- ========================================================================
do $$ begin
  create type public.intervention_type as enum (
    'semis',
    'fertilisation',
    'phyto',
    'travail_sol',
    'irrigation',
    'recolte',
    'observation',
    'autre'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.interventions (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms on delete cascade,
  date date not null,
  type public.intervention_type not null,
  sub_type text,
  duration_hours numeric,
  worker_id uuid references public.farm_workers on delete set null,
  notes text,
  bbch_stage text,
  weather text,
  created_by uuid references auth.users,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists interventions_farm_date_idx on public.interventions (farm_id, date desc);

drop trigger if exists interventions_set_updated_at on public.interventions;
create trigger interventions_set_updated_at
before update on public.interventions
for each row execute function public.tg_set_updated_at();

-- Lien N:N intervention <-> parcelles (une intervention peut couvrir plusieurs parcelles)
create table if not exists public.intervention_parcels (
  intervention_id uuid not null references public.interventions on delete cascade,
  parcel_id uuid not null references public.parcels on delete cascade,
  primary key (intervention_id, parcel_id)
);

create index if not exists intervention_parcels_parcel_idx on public.intervention_parcels (parcel_id);

-- Apports détaillés (produits utilisés)
create table if not exists public.intervention_products (
  id uuid primary key default gen_random_uuid(),
  intervention_id uuid not null references public.interventions on delete cascade,
  product_id uuid not null references public.products,
  dose numeric not null,
  unit text not null,
  total_quantity numeric,
  created_at timestamptz not null default now()
);

create index if not exists intervention_products_intervention_idx
  on public.intervention_products (intervention_id);

-- ========================================================================
-- RLS — activation + policies
-- ========================================================================
alter table public.profiles enable row level security;
alter table public.farms enable row level security;
alter table public.farm_members enable row level security;
alter table public.farm_invitations enable row level security;
alter table public.cultures enable row level security;
alter table public.products enable row level security;
alter table public.farm_workers enable row level security;
alter table public.parcels enable row level security;
alter table public.parcel_groups enable row level security;
alter table public.parcel_group_members enable row level security;
alter table public.assolement_segments enable row level security;
alter table public.interventions enable row level security;
alter table public.intervention_parcels enable row level security;
alter table public.intervention_products enable row level security;

-- ------------------------ profiles ------------------------
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_farm_members_select" on public.profiles;
create policy "profiles_farm_members_select" on public.profiles
  for select using (
    exists (
      select 1 from public.farm_members fm1
      join public.farm_members fm2 on fm1.farm_id = fm2.farm_id
      where fm1.user_id = auth.uid() and fm2.user_id = profiles.id
    )
  );

-- ------------------------ farms ------------------------
drop policy if exists "farms_select_members" on public.farms;
create policy "farms_select_members" on public.farms
  for select using (public.is_farm_member(id));

drop policy if exists "farms_insert_any_auth" on public.farms;
create policy "farms_insert_any_auth" on public.farms
  for insert with check (auth.uid() = created_by);

drop policy if exists "farms_update_admin" on public.farms;
create policy "farms_update_admin" on public.farms
  for update using (public.is_farm_admin(id)) with check (public.is_farm_admin(id));

drop policy if exists "farms_delete_owner" on public.farms;
create policy "farms_delete_owner" on public.farms
  for delete using (
    exists (
      select 1 from public.farm_members
      where farm_id = farms.id and user_id = auth.uid() and role = 'owner'
    )
  );

-- Trigger : créateur de farm devient owner automatiquement
create or replace function public.handle_new_farm()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.created_by is not null then
    insert into public.farm_members (farm_id, user_id, role, joined_at)
    values (new.id, new.created_by, 'owner', now())
    on conflict (farm_id, user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_farm_created on public.farms;
create trigger on_farm_created
after insert on public.farms
for each row execute function public.handle_new_farm();

-- ------------------------ farm_members ------------------------
drop policy if exists "farm_members_select_co_members" on public.farm_members;
create policy "farm_members_select_co_members" on public.farm_members
  for select using (public.is_farm_member(farm_id));

drop policy if exists "farm_members_insert_admin" on public.farm_members;
create policy "farm_members_insert_admin" on public.farm_members
  for insert with check (public.is_farm_admin(farm_id) or user_id = auth.uid());

drop policy if exists "farm_members_update_admin" on public.farm_members;
create policy "farm_members_update_admin" on public.farm_members
  for update using (public.is_farm_admin(farm_id)) with check (public.is_farm_admin(farm_id));

drop policy if exists "farm_members_delete_admin_or_self" on public.farm_members;
create policy "farm_members_delete_admin_or_self" on public.farm_members
  for delete using (public.is_farm_admin(farm_id) or user_id = auth.uid());

-- ------------------------ farm_invitations ------------------------
drop policy if exists "farm_invitations_select_admin" on public.farm_invitations;
create policy "farm_invitations_select_admin" on public.farm_invitations
  for select using (public.is_farm_admin(farm_id));

drop policy if exists "farm_invitations_manage_admin" on public.farm_invitations;
create policy "farm_invitations_manage_admin" on public.farm_invitations
  for all using (public.is_farm_admin(farm_id)) with check (public.is_farm_admin(farm_id));

-- ------------------------ cultures (référentiel public en lecture) ------------------------
drop policy if exists "cultures_select_authenticated" on public.cultures;
create policy "cultures_select_authenticated" on public.cultures
  for select to authenticated using (true);

-- ------------------------ Policies génériques scope farm ------------------------
-- Helper macro virtuelle : pour chaque table farm-scoped, on définit
-- select=member, all-write=member. (À durcir plus tard : worker = lecture,
-- manager+ = écriture si le PO le souhaite.)

-- products
drop policy if exists "products_member_select" on public.products;
create policy "products_member_select" on public.products
  for select using (public.is_farm_member(farm_id));
drop policy if exists "products_member_write" on public.products;
create policy "products_member_write" on public.products
  for all using (public.is_farm_member(farm_id)) with check (public.is_farm_member(farm_id));

-- farm_workers
drop policy if exists "workers_member_select" on public.farm_workers;
create policy "workers_member_select" on public.farm_workers
  for select using (public.is_farm_member(farm_id));
drop policy if exists "workers_admin_write" on public.farm_workers;
create policy "workers_admin_write" on public.farm_workers
  for all using (public.is_farm_admin(farm_id)) with check (public.is_farm_admin(farm_id));

-- parcels
drop policy if exists "parcels_member_select" on public.parcels;
create policy "parcels_member_select" on public.parcels
  for select using (public.is_farm_member(farm_id));
drop policy if exists "parcels_member_write" on public.parcels;
create policy "parcels_member_write" on public.parcels
  for all using (public.is_farm_member(farm_id)) with check (public.is_farm_member(farm_id));

-- parcel_groups
drop policy if exists "groups_member_select" on public.parcel_groups;
create policy "groups_member_select" on public.parcel_groups
  for select using (public.is_farm_member(farm_id));
drop policy if exists "groups_member_write" on public.parcel_groups;
create policy "groups_member_write" on public.parcel_groups
  for all using (public.is_farm_member(farm_id)) with check (public.is_farm_member(farm_id));

-- parcel_group_members (jointure — accès via parcel.farm_id)
drop policy if exists "group_members_via_parcel" on public.parcel_group_members;
create policy "group_members_via_parcel" on public.parcel_group_members
  for all using (
    exists (select 1 from public.parcels p where p.id = parcel_id and public.is_farm_member(p.farm_id))
  ) with check (
    exists (select 1 from public.parcels p where p.id = parcel_id and public.is_farm_member(p.farm_id))
  );

-- assolement_segments
drop policy if exists "segments_member_select" on public.assolement_segments;
create policy "segments_member_select" on public.assolement_segments
  for select using (public.is_farm_member(farm_id));
drop policy if exists "segments_member_write" on public.assolement_segments;
create policy "segments_member_write" on public.assolement_segments
  for all using (public.is_farm_member(farm_id)) with check (public.is_farm_member(farm_id));

-- interventions
drop policy if exists "interventions_member_select" on public.interventions;
create policy "interventions_member_select" on public.interventions
  for select using (public.is_farm_member(farm_id));
drop policy if exists "interventions_member_write" on public.interventions;
create policy "interventions_member_write" on public.interventions
  for all using (public.is_farm_member(farm_id)) with check (public.is_farm_member(farm_id));

-- intervention_parcels (jointure)
drop policy if exists "intervention_parcels_via_intervention" on public.intervention_parcels;
create policy "intervention_parcels_via_intervention" on public.intervention_parcels
  for all using (
    exists (select 1 from public.interventions i where i.id = intervention_id and public.is_farm_member(i.farm_id))
  ) with check (
    exists (select 1 from public.interventions i where i.id = intervention_id and public.is_farm_member(i.farm_id))
  );

-- intervention_products (jointure)
drop policy if exists "intervention_products_via_intervention" on public.intervention_products;
create policy "intervention_products_via_intervention" on public.intervention_products
  for all using (
    exists (select 1 from public.interventions i where i.id = intervention_id and public.is_farm_member(i.farm_id))
  ) with check (
    exists (select 1 from public.interventions i where i.id = intervention_id and public.is_farm_member(i.farm_id))
  );

-- ========================================================================
-- Grants — exposition au rôle authenticated via PostgREST
-- ========================================================================
grant usage on schema public to anon, authenticated;
grant select on public.cultures to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
grant execute on function public.is_farm_member(uuid) to authenticated;
grant execute on function public.is_farm_admin(uuid) to authenticated;
