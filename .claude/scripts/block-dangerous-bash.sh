#!/usr/bin/env bash
# Hook PreToolUse Bash : bloque les commandes destructives sans confirmation.
# - rm -rf
# - git push --force / --force-with-lease
# - git reset --hard
# - npm install -g (suspect, doit être explicite)
#
# Le hook lit la commande dans tool_input.command et exit 2 si match.

set -euo pipefail
payload=$(cat)
command=$(echo "$payload" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('tool_input', {}).get('command', ''))
except Exception:
    pass
")

[[ -z "$command" ]] && exit 0

# Patterns dangereux
patterns=(
  'rm[[:space:]]+-rf'
  'rm[[:space:]]+-fr'
  'git[[:space:]]+push.*--force'
  'git[[:space:]]+push.*-f([[:space:]]|$)'
  'git[[:space:]]+reset[[:space:]]+--hard'
  'git[[:space:]]+clean[[:space:]]+-f'
  'git[[:space:]]+branch[[:space:]]+-D'
  'npm[[:space:]]+install[[:space:]]+-g'
  'sudo[[:space:]]+rm'
  ':(>)/dev/sda'
)

for p in "${patterns[@]}"; do
  if echo "$command" | grep -qE "$p"; then
    echo "[block-dangerous-bash] BLOQUÉ : commande potentiellement destructive." 1>&2
    echo "Commande : $command" 1>&2
    echo "Motif : $p" 1>&2
    echo "Si l'action est intentionnelle, demande à l'utilisateur de désactiver ce hook ou utilise un chemin différent." 1>&2
    exit 2
  fi
done

exit 0
