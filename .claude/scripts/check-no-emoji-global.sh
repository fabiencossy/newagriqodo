#!/usr/bin/env bash
# Hook PostToolUse : interdit les emoji dans tout app/src/.
# Règle stricte du PO (cf. CLAUDE.md). Non-bloquant — affiche un avertissement.

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

[[ -z "$file_path" ]] && exit 0
[[ "$file_path" != *"/app/src/"* ]] && exit 0
case "$file_path" in
  *.ts|*.tsx|*.css|*.html) ;;
  *) exit 0 ;;
esac
[[ ! -f "$file_path" ]] && exit 0

# Détection emoji : plages Unicode emoji courantes
matches=$(LC_ALL=C grep -nP '[\x{1F000}-\x{1FFFF}]|[\x{2600}-\x{27BF}]|[\x{2300}-\x{23FF}]' "$file_path" 2>/dev/null || true)

if [[ -n "$matches" ]]; then
  echo "[no-emoji] Emoji détecté dans $(basename "$file_path") (interdit, utiliser SVG inline style Lucide) :" 1>&2
  echo "$matches" | head -5 1>&2
fi
exit 0
