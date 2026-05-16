#!/usr/bin/env bash
# Hook PostToolUse : valide cultures.ts après modification.
# - Toutes les couleurs hex doivent être uniques (sinon collision visuelle carte).
# - Vérifie présence des champs obligatoires (key, label, color, category).

set -euo pipefail
payload=$(cat)
file_path=$(echo "$payload" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    ti = data.get('tool_input', {})
    print(ti.get('file_path') or ti.get('path') or '')
except Exception:
    pass
")

[[ "$file_path" != *"/cultures.ts"* ]] && exit 0
[[ ! -f "$file_path" ]] && exit 0

issues=0

# 1. Couleurs uniques (hex #RRGGBB)
duplicates=$(grep -oE "color:\s*'#[0-9a-fA-F]{6}'" "$file_path" | sort | uniq -d)
if [[ -n "$duplicates" ]]; then
  echo "[validate-cultures] Couleurs hex dupliquées détectées (collision carte possible) :" 1>&2
  echo "$duplicates" 1>&2
  issues=$((issues+1))
fi

# 2. Compte les entrées (heuristique : combien de `key:` vs `label:` vs `color:` vs `category:`)
keys=$(grep -cE "^\s*key:\s*'" "$file_path" || echo 0)
labels=$(grep -cE "^\s*label:\s*'" "$file_path" || echo 0)
colors=$(grep -cE "^\s*color:\s*'" "$file_path" || echo 0)
categories=$(grep -cE "^\s*category:\s*'" "$file_path" || echo 0)

if [[ "$keys" -ne "$labels" ]] || [[ "$keys" -ne "$colors" ]] || [[ "$keys" -ne "$categories" ]]; then
  echo "[validate-cultures] Champs manquants : keys=$keys labels=$labels colors=$colors categories=$categories" 1>&2
  echo "Toutes les cultures doivent avoir key+label+color+category." 1>&2
  issues=$((issues+1))
fi

if [[ $issues -eq 0 ]]; then
  echo "[validate-cultures] OK — $keys cultures, couleurs uniques." 1>&2
fi
exit 0
