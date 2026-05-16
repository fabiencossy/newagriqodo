-- ========================================================================
-- Migration 0000 — Rôles Postgres requis par les services Supabase
-- ========================================================================
-- Doit être jouée AVANT toutes les autres migrations.
--
-- L'image supabase/postgres est livrée sans les rôles spécifiques que
-- chaque service Supabase attend pour se connecter avec un user dédié
-- (least privilege). Sans ces rôles, auth/rest/realtime/storage
-- redémarrent en boucle avec "role does not exist" ou "password failed".
--
-- Le mot de passe utilisé est ${POSTGRES_PASSWORD} (variable du compose),
-- mais on ne peut pas l'interpoler en SQL pur — on lit donc la variable
-- d'env côté shell et on substitue avant exec :
--
--   docker compose exec -e PG_PASS="$POSTGRES_PASSWORD" db sh -c \
--     "sed 's|__PG_PASS__|'\"$PG_PASS\"'|g' /supabase/migrations/0000_supabase_roles.sql | psql -U postgres"
--
-- Ou plus simple : on l'applique via le bootstrap shell qui sait
-- substituer (cf. bootstrap.sh).
-- ========================================================================

-- supabase_admin : rôle superuser pour les opérations de maintenance,
-- utilisé par realtime + postgres-meta.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'supabase_admin') then
    create role supabase_admin login password '__PG_PASS__' superuser createdb createrole replication bypassrls;
  else
    alter role supabase_admin with login password '__PG_PASS__';
  end if;
end $$;

-- supabase_auth_admin : utilisé par GoTrue. Doit avoir accès au schéma
-- auth (créé par Supabase lui-même).
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    create role supabase_auth_admin login password '__PG_PASS__' noinherit createrole;
  else
    alter role supabase_auth_admin with login password '__PG_PASS__';
  end if;
end $$;

-- supabase_storage_admin : utilisé par storage-api.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'supabase_storage_admin') then
    create role supabase_storage_admin login password '__PG_PASS__' noinherit createrole;
  else
    alter role supabase_storage_admin with login password '__PG_PASS__';
  end if;
end $$;

-- authenticator : utilisé par PostgREST. Peut "set role" vers anon ou
-- authenticated selon le JWT reçu.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'authenticator') then
    create role authenticator login password '__PG_PASS__' noinherit;
  else
    alter role authenticator with login password '__PG_PASS__';
  end if;
end $$;

-- anon et authenticated : rôles "logiques" assumés par PostgREST
-- via SET ROLE. Pas de login direct.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end $$;

-- authenticator peut switcher vers anon, authenticated, service_role
grant anon, authenticated, service_role to authenticator;

-- Schémas attendus par les services
create schema if not exists auth authorization supabase_auth_admin;
create schema if not exists storage authorization supabase_storage_admin;
create schema if not exists realtime;
create schema if not exists _realtime;

grant all on schema auth to supabase_auth_admin;
grant all on schema storage to supabase_storage_admin;
grant all on schema realtime, _realtime to supabase_admin;

-- Permettre aux rôles applicatifs de lire les schémas standards
grant usage on schema public to anon, authenticated, service_role;

-- ========================================================================
-- Transfert d'ownership des schémas système à leurs admins respectifs
-- ========================================================================
-- L'image supabase/postgres pré-crée auth.uid()/role()/email() au démarrage
-- en owner=postgres. GoTrue (qui se connecte en supabase_auth_admin) doit
-- pouvoir CREATE OR REPLACE ces fonctions lors de ses migrations.
-- Sans transfert d'ownership : "must be owner of function uid (SQLSTATE 42501)".

alter schema auth owner to supabase_auth_admin;
alter schema storage owner to supabase_storage_admin;

do $$
declare obj record;
begin
  -- Tables/sequences/vues du schéma auth
  for obj in
    select c.relname, c.relkind from pg_class c
    join pg_namespace n on c.relnamespace = n.oid
    where n.nspname = 'auth' and c.relkind in ('r', 'S', 'v')
  loop
    if obj.relkind = 'S' then
      execute format('alter sequence auth.%I owner to supabase_auth_admin', obj.relname);
    else
      execute format('alter table auth.%I owner to supabase_auth_admin', obj.relname);
    end if;
  end loop;

  -- Fonctions du schéma auth (signature complète obligatoire)
  for obj in
    select p.proname, pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on p.pronamespace = n.oid
    where n.nspname = 'auth'
  loop
    execute format('alter function auth.%I(%s) owner to supabase_auth_admin', obj.proname, obj.args);
  end loop;

  -- Tables/sequences/vues du schéma storage
  for obj in
    select c.relname, c.relkind from pg_class c
    join pg_namespace n on c.relnamespace = n.oid
    where n.nspname = 'storage' and c.relkind in ('r', 'S', 'v')
  loop
    if obj.relkind = 'S' then
      execute format('alter sequence storage.%I owner to supabase_storage_admin', obj.relname);
    else
      execute format('alter table storage.%I owner to supabase_storage_admin', obj.relname);
    end if;
  end loop;

  -- Fonctions du schéma storage
  for obj in
    select p.proname, pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on p.pronamespace = n.oid
    where n.nspname = 'storage'
  loop
    execute format('alter function storage.%I(%s) owner to supabase_storage_admin', obj.proname, obj.args);
  end loop;
end $$;
