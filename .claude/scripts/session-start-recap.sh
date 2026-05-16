#!/usr/bin/env bash
# Hook SessionStart : affiche un récapitulatif au démarrage de Claude Code.
# - Branche actuelle
# - Dernier commit
# - Fichiers modifiés non commités
# - Statut tests (cached si récent)

set -euo pipefail

repo_root="$(dirname "$(dirname "$(realpath "$0")")")"
repo_root="$(dirname "$repo_root")"
cd "$repo_root" || exit 0

echo ""
echo "=== NewagriQodo v2 — Récap session ==="
echo ""
echo "Branche : $(git branch --show-current)"
echo "Dernier commit : $(git log -1 --pretty=format:'%h %s (%cr)')"
echo ""
echo "Modifs non commitées :"
git status --short | head -10
modified_count=$(git status --short | wc -l | tr -d ' ')
if [[ "$modified_count" -gt 10 ]]; then
  echo "  … et $((modified_count - 10)) autres"
fi
echo ""
echo "Pour reprendre : voir CLAUDE.md → 'Prochaines priorités'"
echo "===================================="
echo ""
exit 0
