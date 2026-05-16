#!/usr/bin/env bash
# Hook PostToolUse spécifique aux nouveaux composants React (app/src/components/).
# Vérifie les conventions du projet :
#   - Pas d'emoji dans le source
#   - Pas de border-radius en dur (sauf 50% / radius-pill)
#   - Pas de classe `dark:` (light only)
#   - Pas de référence à `Maplibre` ou `mapbox` (carte = Leaflet)
#   - Présence d'un fichier .test.tsx OU .test.ts dans le même dossier
# Affiche un rapport en stderr, non-bloquant.

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

# Filtre : seulement les .tsx/.ts dans app/src/components/
[[ -z "$file_path" ]] && exit 0
[[ "$file_path" != *"/app/src/components/"* ]] && exit 0
case "$file_path" in
  *.tsx|*.ts) ;;
  *) exit 0 ;;
esac
[[ ! -f "$file_path" ]] && exit 0

issues=0
report=""

# 1. Emoji (regex grossière sur plages Unicode emoji)
if grep -nE $'[\xF0\x9F][\x80-\xBF][\x80-\xBF][\x80-\xBF]' "$file_path" >/dev/null 2>&1; then
  report+=$'\n  - Emoji détecté (interdit, utiliser SVG inline style Lucide)'
  issues=$((issues+1))
fi

# 2. Radius en dur (rounded-md, rounded-lg, rounded-xl, rounded-[Xpx])
if grep -nE 'rounded-(md|lg|xl|2xl|3xl|sm|full|none|\[)' "$file_path" >/dev/null 2>&1; then
  report+=$'\n  - Radius Tailwind en dur — utiliser rounded-(--radius-sm|--radius|--radius-lg|--radius-pill)'
  issues=$((issues+1))
fi

# 3. dark: classes
if grep -nE '\bdark:' "$file_path" >/dev/null 2>&1; then
  report+=$'\n  - Classe dark: détectée (projet light only)'
  issues=$((issues+1))
fi

# 4. Maplibre/Mapbox
if grep -niE '(maplibre|mapbox)' "$file_path" >/dev/null 2>&1; then
  report+=$'\n  - Référence Maplibre/Mapbox — utiliser Leaflet (cf. CLAUDE.md)'
  issues=$((issues+1))
fi

# 5. Test associé : on cherche un .test.{ts,tsx} dans le même dossier
component_dir=$(dirname "$file_path")
component_base=$(basename "$file_path" .tsx)
component_base=${component_base%.ts}
if ! ls "$component_dir"/*.test.{ts,tsx} 2>/dev/null | grep -q .; then
  report+=$'\n  - Aucun fichier *.test.{ts,tsx} dans le dossier — penser à ajouter un test Vitest'
  issues=$((issues+1))
fi

if [[ $issues -gt 0 ]]; then
  echo "[component-check] $issues point(s) à vérifier sur $(basename "$file_path") :$report" 1>&2
fi

exit 0
