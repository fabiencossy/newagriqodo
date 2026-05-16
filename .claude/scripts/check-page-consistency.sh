#!/usr/bin/env bash
# Hook PostToolUse : vérifie qu'une *Page.tsx dans app/src/modules/ respecte
# la structure standard du projet :
#   - SearchBar en haut
#   - ViewSwitcher (sélecteur de vues) en haut à droite
#   - useFabActions (FAB) en bas à droite
#   - PageContainer ou structure flex h-full flex-col
#
# Demande explicite du PO (toutes les pages doivent partager le même squelette).
# Non-bloquant — affiche un rapport.

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
# Cible : app/src/modules/**/SomethingPage.tsx
[[ "$file_path" != *"/app/src/modules/"* ]] && exit 0
[[ "$file_path" != *Page.tsx ]] && exit 0
[[ ! -f "$file_path" ]] && exit 0

# Stub pages sont exemptés (pages "à venir" qui n'ont pas encore de contenu)
if grep -q 'StubPage' "$file_path"; then
  exit 0
fi

issues=0
report=""
basename=$(basename "$file_path")

# 1. SearchBar
if ! grep -qE 'SearchBar' "$file_path"; then
  report+=$'\n  - Manque <SearchBar> (toutes les pages doivent avoir une barre de recherche)'
  issues=$((issues+1))
fi

# 2. ViewSwitcher
if ! grep -qE 'ViewSwitcher' "$file_path"; then
  report+=$'\n  - Manque <ViewSwitcher> (sélecteur de vues map/table/dashboard)'
  issues=$((issues+1))
fi

# 3. FAB
if ! grep -qE 'useFabActions' "$file_path"; then
  report+=$'\n  - Manque useFabActions (le FAB contextuel doit être déclaré, même si vide)'
  issues=$((issues+1))
fi

# 4. ExportButton (toutes les pages avec data ont un ExportButton)
if ! grep -qE 'ExportButton' "$file_path"; then
  report+=$'\n  - Manque <ExportButton> (exports PDF/Excel/CSV — standard du projet)'
  issues=$((issues+1))
fi

if [[ $issues -gt 0 ]]; then
  echo "[page-consistency] $issues point(s) sur $basename — squelette de page incomplet :$report" 1>&2
  echo "  Référence : ParcellairePage.tsx ou AssolementPage.tsx" 1>&2
fi
exit 0
