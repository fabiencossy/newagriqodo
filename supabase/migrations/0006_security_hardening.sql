-- ========================================================================
-- Migration 0006 — Durcissement sécurité post-audit
-- ========================================================================
-- Findings de l'audit security-auditor du 2026-05-16 :
--
-- 1. [HAUTE] farm_members_insert_admin autorisait `user_id = auth.uid()`
--    -> n'importe quel user authentifié pouvait s'ajouter à n'importe quelle
--       farm avec n'importe quel rôle. Devient : seuls les admin/owner
--       peuvent ajouter des membres. L'ajout self passe exclusivement par
--       la RPC `accept_farm_invitation` (SECURITY DEFINER, valide email).
--
-- 2. [HAUTE] farm_members_delete_admin_or_self : on garde le "or self"
--    car un membre doit pouvoir quitter une farm sans demander à l'admin.
--    (acceptable : il ne peut que supprimer son propre row, pas changer
--    son rôle pour escalader.)
-- ========================================================================

drop policy if exists "farm_members_insert_admin" on public.farm_members;
create policy "farm_members_insert_admin" on public.farm_members
  for insert with check (public.is_farm_admin(farm_id));

-- Note : un user qui accepte une invitation ne fait PAS d'INSERT direct,
-- il appelle la RPC accept_farm_invitation() qui s'exécute en SECURITY
-- DEFINER et fait l'INSERT côté server après avoir validé le token.
