#!/usr/bin/env bash
# Hook PostToolUse Edit/Write : warning sur CORS wildcard (*) dans confs serveur.
# Bloque si on touche au Caddyfile / docker-compose / kong.yml.

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

case "$file_path" in
  */Caddyfile|*/docker-compose*.yml|*/docker-compose*.yaml|*/kong.yml|*/nginx*.conf|Caddyfile|docker-compose*.yml|kong.yml)
    ;;
  *) exit 0 ;;
esac

[[ -f "$file_path" ]] || exit 0

# Patterns wildcard CORS
if grep -nE 'Access-Control-Allow-Origin[^a-zA-Z0-9]+\*|allow_origin[[:space:]]*[:=][[:space:]]*['"'"'"]?\*' "$file_path" >/dev/null; then
  hits=$(grep -nE 'Access-Control-Allow-Origin[^a-zA-Z0-9]+\*|allow_origin[[:space:]]*[:=][[:space:]]*['"'"'"]?\*' "$file_path")
  echo "[check-cors-wildcard] ATTENTION CORS wildcard (*) dans $file_path :" 1>&2
  echo "$hits" 1>&2
  echo "  → Toute origine peut faire des requêtes authentifiées vers ton API." 1>&2
  echo "  → Restreindre à https://newagri.qodo.ch (et http://localhost:5173 pour le dev uniquement)." 1>&2
fi

# Patterns ports DB exposés
if grep -nE '^[[:space:]]*-[[:space:]]*['"'"'"]?0\.0\.0\.0:5432' "$file_path" >/dev/null; then
  echo "[check-cors-wildcard] CRITIQUE port Postgres 5432 exposé sur 0.0.0.0 dans $file_path" 1>&2
  echo "  → N'importe qui sur Internet peut tenter une connexion à ta DB." 1>&2
  echo "  → Utiliser 127.0.0.1:5432:5432 (accès via SSH tunnel uniquement)." 1>&2
fi

exit 0
