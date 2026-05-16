-- ========================================================================
-- RPC : accepter une invitation farm
-- ========================================================================
-- Appelé côté front depuis AcceptInvitePage après que l'utilisateur a
-- finalisé son compte. Vérifie le token, ajoute l'utilisateur au
-- farm_members, marque l'invitation comme acceptée.
--
-- Sécurité : SECURITY DEFINER pour pouvoir écrire dans farm_members
-- malgré la RLS, mais valide explicitement que :
--   - l'invitation existe et n'est pas expirée
--   - l'email de l'invitation matche celui de l'utilisateur courant
-- ========================================================================

create or replace function public.accept_farm_invitation(invitation_token text)
returns table (farm_id uuid, farm_name text, role public.farm_role)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.farm_invitations%rowtype;
  v_user_email text;
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Non authentifié.' using errcode = '42501';
  end if;

  select email into v_user_email from auth.users where id = v_user_id;

  select * into v_invitation
  from public.farm_invitations
  where token = invitation_token
    and accepted_at is null
    and expires_at > now();

  if not found then
    raise exception 'Invitation invalide ou expirée.' using errcode = 'P0002';
  end if;

  if lower(v_invitation.email) <> lower(v_user_email) then
    raise exception 'Cette invitation a été envoyée à une autre adresse email.'
      using errcode = '42501';
  end if;

  insert into public.farm_members (farm_id, user_id, role, invited_by, joined_at)
  values (v_invitation.farm_id, v_user_id, v_invitation.role, v_invitation.invited_by, now())
  on conflict (farm_id, user_id) do update
    set role = excluded.role,
        joined_at = coalesce(public.farm_members.joined_at, now());

  update public.farm_invitations
    set accepted_at = now()
    where id = v_invitation.id;

  return query
  select f.id, f.name, v_invitation.role
  from public.farms f
  where f.id = v_invitation.farm_id;
end;
$$;

grant execute on function public.accept_farm_invitation(text) to authenticated;
