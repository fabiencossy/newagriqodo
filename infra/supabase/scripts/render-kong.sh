#!/usr/bin/env bash
# ============================================================================
# render-kong.sh — Génère kong.rendered.yml avec les vraies valeurs des
# variables d'env. Kong 2.x ne fait PAS d'interpolation $VAR dans les
# fichiers yaml de config déclarative, il faut le pré-rendre côté hôte.
# ============================================================================

set -euo pipefail

COMPOSE_DIR=${COMPOSE_DIR:-/opt/newagri/infra/supabase}
ENV_FILE="$COMPOSE_DIR/.env"
TEMPLATE="$COMPOSE_DIR/kong.yml"
RENDERED="$COMPOSE_DIR/kong.rendered.yml"

[[ -f "$ENV_FILE" ]] || { echo "ERREUR: $ENV_FILE introuvable" >&2; exit 1; }
[[ -f "$TEMPLATE" ]] || { echo "ERREUR: $TEMPLATE introuvable" >&2; exit 1; }

ANON_KEY=$(grep -E '^SUPABASE_ANON_KEY=' "$ENV_FILE" | cut -d= -f2-)
SERVICE_KEY=$(grep -E '^SUPABASE_SERVICE_KEY=' "$ENV_FILE" | cut -d= -f2-)

[[ -n "$ANON_KEY" ]]    || { echo "ERREUR: SUPABASE_ANON_KEY vide" >&2; exit 1; }
[[ -n "$SERVICE_KEY" ]] || { echo "ERREUR: SUPABASE_SERVICE_KEY vide" >&2; exit 1; }

sed \
  -e "s|\$SUPABASE_ANON_KEY|${ANON_KEY}|g" \
  -e "s|\$SUPABASE_SERVICE_KEY|${SERVICE_KEY}|g" \
  "$TEMPLATE" > "$RENDERED"

# Protection : kong.rendered.yml contient les clés en clair → 600
chmod 600 "$RENDERED"

echo "[render-kong] $RENDERED généré ($(wc -l < "$RENDERED") lignes)"
