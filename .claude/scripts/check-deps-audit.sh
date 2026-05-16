#!/usr/bin/env bash
# Hook PostToolUse Edit/Write : npm audit sur les CVE high+ après modif de package.json.
# Non bloquant — affiche le résumé pour relecture humaine.

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
  */package.json|package.json) ;;
  *) exit 0 ;;
esac

dir=$(dirname "$file_path")
[[ -d "$dir/node_modules" ]] || exit 0

cd "$dir"

# Audit niveau high — non bloquant, juste informatif
audit=$(npm audit --audit-level=high --json 2>/dev/null || true)
if [[ -z "$audit" ]]; then
  exit 0
fi

high=$(echo "$audit" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    md = data.get('metadata', {}).get('vulnerabilities', {})
    print(f\"{md.get('high', 0)} high / {md.get('critical', 0)} critical\")
except Exception:
    print('?')
")

if [[ "$high" != "0 high / 0 critical" ]] && [[ "$high" != "?" ]]; then
  echo "[check-deps-audit] CVE détectées dans $file_path : $high" 1>&2
  echo "  → Lancer 'npm audit' pour détail, 'npm audit fix' si possible." 1>&2
  echo "  → Pour les CVE qu'on accepte de garder (faux positif, pas exploitable côté front)," 1>&2
  echo "    documenter dans SECURITY.md la justification." 1>&2
fi

exit 0
