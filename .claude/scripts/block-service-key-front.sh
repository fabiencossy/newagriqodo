#!/usr/bin/env bash
# Hook PreToolUse Edit/Write : empêche l'usage de la clé SERVICE_ROLE Supabase
# (ou d'API admin) dans le code front (app/src/).
#
# Le service_role bypass la RLS — exposé côté navigateur, il donne accès à
# TOUTES les données de TOUTES les exploitations. Bug de sécurité critique.

set -euo pipefail
payload=$(cat)

file_path=$(echo "$payload" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('tool_input', {}).get('file_path', ''))
except Exception:
    pass
")

# On ne s'applique qu'au code front
case "$file_path" in
  */app/src/*|app/src/*) ;;
  *) exit 0 ;;
esac

content=$(echo "$payload" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    ti = data.get('tool_input', {})
    print(ti.get('content', '') or ti.get('new_string', ''))
except Exception:
    pass
")

[[ -z "$content" ]] && exit 0

# Patterns interdits côté front
declare -a forbidden=(
  'VITE_SUPABASE_SERVICE_KEY'
  'SUPABASE_SERVICE_KEY'
  'SUPABASE_SERVICE_ROLE'
  'service_role'
  'supabase\.auth\.admin\.'
  'serviceRole[[:space:]]*:[[:space:]]*true'
)

for p in "${forbidden[@]}"; do
  if echo "$content" | grep -qE "$p"; then
    matched=$(echo "$content" | grep -E "$p" | head -1)
    echo "[block-service-key-front] BLOQUÉ : usage du SERVICE_ROLE Supabase détecté dans $file_path" 1>&2
    echo "  Ligne : $matched" 1>&2
    echo "" 1>&2
    echo "Le service_role JWT bypass la RLS. Si tu l'exposes côté front, n'importe quel visiteur" 1>&2
    echo "peut lire/modifier/supprimer toutes les données de toutes les exploitations." 1>&2
    echo "" 1>&2
    echo "Côté front, n'utiliser QUE le ANON_KEY. Les opérations privilégiées doivent passer par :" 1>&2
    echo "  - une RPC Postgres SECURITY DEFINER (cf. accept_farm_invitation)" 1>&2
    echo "  - une Edge Function Supabase qui valide l'auth + applique le service_role côté serveur" 1>&2
    exit 2
  fi
done

exit 0
