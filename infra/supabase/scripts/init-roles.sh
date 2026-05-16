#!/usr/bin/env bash
# ============================================================================
# init-roles.sh — Crée/aligne les rôles Postgres pour les services Supabase
# ============================================================================
# L'image supabase/postgres crée les rôles standards (supabase_auth_admin,
# authenticator, etc.) avec un password qu'elle choisit. Nos services se
# connectent avec ${POSTGRES_PASSWORD} : il faut les aligner.
#
# Idempotent : peut être rejoué autant de fois que nécessaire.
#
# Usage (depuis le VPS, en sudo) :
#   sudo bash /opt/newagri/infra/supabase/scripts/init-roles.sh
# ============================================================================

set -euo pipefail

COMPOSE_DIR=${COMPOSE_DIR:-/opt/newagri/infra/supabase}
ENV_FILE="$COMPOSE_DIR/.env"
SQL_FILE="$COMPOSE_DIR/sql/init-roles.sql"

[[ -f "$ENV_FILE" ]] || { echo "ERREUR: $ENV_FILE introuvable" >&2; exit 1; }
[[ -f "$SQL_FILE" ]]  || { echo "ERREUR: $SQL_FILE introuvable" >&2; exit 1; }

# Extraire le password depuis le .env
PG_PASS=$(grep -E '^POSTGRES_PASSWORD=' "$ENV_FILE" | cut -d= -f2-)
[[ -n "$PG_PASS" ]] || { echo "ERREUR: POSTGRES_PASSWORD vide dans $ENV_FILE" >&2; exit 1; }

cd "$COMPOSE_DIR"

# Vérifier que Postgres est healthy
if ! docker compose ps db | grep -q healthy; then
  echo "ATTENTION: Postgres pas encore healthy, attente 10s..."
  sleep 10
fi

# Substituer __PG_PASS__ puis exécuter en superuser via le user postgres
echo "[init-roles] Alignement des rôles Supabase avec le POSTGRES_PASSWORD courant..."
sed "s|__PG_PASS__|${PG_PASS}|g" "$SQL_FILE" \
  | docker compose exec -T db psql -U postgres -d postgres -v ON_ERROR_STOP=1

echo "[init-roles] Rôles alignés. Restart des services applicatifs..."
docker compose restart auth realtime rest storage

echo "[init-roles] Attente 15s que les services se reconnectent..."
sleep 15

echo "[init-roles] État final :"
docker compose ps
