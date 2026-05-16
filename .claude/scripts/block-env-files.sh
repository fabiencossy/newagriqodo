#!/usr/bin/env bash
# Hook PreToolUse Edit/Write : bloque l'écriture/édition des fichiers .env réels.
# Autorise uniquement .env.example (sans secrets, par convention).

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

[[ -z "$file_path" ]] && exit 0

basename=$(basename "$file_path")

# .env.example, .env.test.example → OK
if [[ "$basename" =~ \.example$ ]] || [[ "$basename" =~ ^\.env\.example ]]; then
  exit 0
fi

# .env, .env.local, .env.production, .env.development → blocage
if [[ "$basename" =~ ^\.env$ ]] || [[ "$basename" =~ ^\.env\. ]]; then
  echo "[block-env-files] BLOQUÉ : édition d'un fichier .env réel ($file_path)." 1>&2
  echo "" 1>&2
  echo "Les fichiers .env contiennent des secrets de production. Ils ne doivent jamais être" 1>&2
  echo "édités par un agent automatisé ni committés." 1>&2
  echo "" 1>&2
  echo "Si tu veux documenter une nouvelle variable d'env, édite .env.example à la place." 1>&2
  echo "Si tu veux que l'utilisateur configure une variable, fournis-lui la commande à exécuter" 1>&2
  echo "à la main dans son terminal." 1>&2
  exit 2
fi

exit 0
