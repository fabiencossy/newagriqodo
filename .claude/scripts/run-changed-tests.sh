#!/usr/bin/env bash
# Hook Stop : à la fin d'une réponse Claude, lance les tests Vitest pour les
# fichiers modifiés depuis le dernier commit (rapide, < 3s).
# N'exécute rien si aucun fichier app/src/ n'a été modifié.

set -euo pipefail

repo_root="$(dirname "$(dirname "$(realpath "$0")")")"
repo_root="$(dirname "$repo_root")"
cd "$repo_root" || exit 0

# Liste des fichiers modifiés (staged + unstaged) sous app/src/
changed=$(git diff --name-only HEAD -- 'app/src/**' 2>/dev/null | grep -E '\.(ts|tsx)$' || true)
untracked=$(git ls-files --others --exclude-standard 'app/src/**' 2>/dev/null | grep -E '\.(ts|tsx)$' || true)
all_changed="$changed
$untracked"

[[ -z "$(echo "$all_changed" | tr -d '[:space:]')" ]] && exit 0

cd "$repo_root/app" || exit 0

# Filtrer en chemins relatifs au dossier app/
related_files=()
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  rel="${f#app/}"
  related_files+=("$rel")
done <<< "$all_changed"

if [[ ${#related_files[@]} -eq 0 ]]; then
  exit 0
fi

# vitest related lance les tests qui dépendent des fichiers donnés
echo "[stop-tests] Lancement vitest related sur ${#related_files[@]} fichier(s) modifié(s)…" 1>&2
npx vitest related "${related_files[@]}" --run --reporter=default 2>&1 1>&2 || \
  echo "[stop-tests] Tests en erreur — corriger avant de continuer" 1>&2

exit 0
