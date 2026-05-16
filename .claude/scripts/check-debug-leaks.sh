#!/usr/bin/env bash
# Hook PostToolUse Edit/Write : warning sur console.log qui pourraient leaker
# des secrets (password, token, JWT, auth.user complet, etc.).

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
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) exit 0 ;;
esac

[[ -f "$file_path" ]] || exit 0

# Détection : console.log/info/debug avec mots sensibles
hits=$(grep -nE 'console\.(log|info|debug|warn|error)\([^)]*(password|passwd|secret|token|jwt|api[_-]?key|session|service[_-]?role)' "$file_path" || true)

if [[ -n "$hits" ]]; then
  echo "[check-debug-leaks] ATTENTION console.* avec terme sensible dans $file_path :" 1>&2
  echo "$hits" 1>&2
  echo "  → Risque de leak en production. Retirer ou masquer la valeur (ex. token.slice(0,8) + '…')." 1>&2
fi

# Détection : console.log d'objet complet user/session (souvent contient le JWT)
hits2=$(grep -nE 'console\.(log|info|debug)\([^)]*\b(user|session|auth\.user|data\.session)\b' "$file_path" || true)
if [[ -n "$hits2" ]]; then
  echo "[check-debug-leaks] ATTENTION log d'objet auth complet dans $file_path :" 1>&2
  echo "$hits2" 1>&2
  echo "  → user/session contient le JWT. Logger uniquement user.id / user.email." 1>&2
fi

exit 0
