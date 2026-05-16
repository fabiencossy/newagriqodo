#!/usr/bin/env bash
# Hook PostToolUse pour Edit/Write/MultiEdit.
# Lit le path du fichier modifié sur stdin (JSON Claude Code), et si c'est dans
# app/src/**/*.{ts,tsx,css}, lance typecheck + lint sur le projet app/.
#
# Comportement : non-bloquant. Affiche les erreurs en stderr (visibles dans
# Claude Code) sans interrompre la conversation. Le but est pédagogique : tu
# vois un faux pas immédiatement.

set -euo pipefail

# Lit le payload JSON envoyé par Claude Code sur stdin
payload=$(cat)

# Extrait le file_path (peut être .tool_input.file_path ou .tool_input.path)
file_path=$(echo "$payload" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    ti = data.get('tool_input', {})
    print(ti.get('file_path') or ti.get('path') or '')
except Exception:
    pass
")

# Skip si pas un fichier ou pas dans app/src/
if [[ -z "$file_path" ]]; then exit 0; fi
if [[ "$file_path" != *"/app/src/"* ]]; then exit 0; fi

# Skip si extension non concernée
case "$file_path" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

# cwd dans app/
project_root="$(dirname "$(dirname "$(realpath "$0")")")"
project_root="$(dirname "$project_root")"
cd "$project_root/app" || exit 0

# Typecheck (rapide en incremental)
if ! npx tsc -b --noEmit 2>&1 | tail -20 1>&2; then
  echo "[post-edit-check] ⚠ typecheck en erreur (voir au-dessus)" 1>&2
fi

# Lint sur le fichier modifié uniquement (rapide)
rel_path="${file_path#*/app/}"
if [[ -f "$rel_path" ]]; then
  npx eslint "$rel_path" 2>&1 1>&2 || true
fi

exit 0
