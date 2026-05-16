#!/usr/bin/env bash
# Hook PreToolUse : bloque toute modification du fichier darval.geojson.json.
# Source de vérité des 27 parcelles réelles du Domaine Darval (export VD GELAN).
#
# Pour modifier ce fichier, l'utilisateur doit explicitement utiliser un autre
# outil ou demander à Claude de débloquer ce hook.

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

if [[ "$file_path" == *"darval.geojson.json"* ]]; then
  echo "[protect-darval] BLOQUÉ : modification de darval.geojson.json refusée." 1>&2
  echo "Ce fichier contient les 27 parcelles réelles du Domaine Darval (source de vérité)." 1>&2
  echo "Pour le modifier intentionnellement, demande à l'utilisateur de désactiver ce hook." 1>&2
  exit 2
fi
exit 0
