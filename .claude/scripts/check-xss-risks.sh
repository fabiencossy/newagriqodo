#!/usr/bin/env bash
# Hook PostToolUse Edit/Write : warning sur les patterns à risque XSS / injection.
#
# Non bloquant : on autorise les cas légitimes (ex. dangerouslySetInnerHTML pour
# du HTML statique connu), on signale juste pour relecture.

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

# Cibler le code front uniquement (TS/TSX/JS/JSX)
case "$file_path" in
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) exit 0 ;;
esac

[[ -f "$file_path" ]] || exit 0

warned=0

# 1. dangerouslySetInnerHTML
if grep -nE 'dangerouslySetInnerHTML' "$file_path" >/dev/null; then
  lines=$(grep -nE 'dangerouslySetInnerHTML' "$file_path")
  echo "[check-xss-risks] ATTENTION dangerouslySetInnerHTML dans $file_path :" 1>&2
  echo "$lines" 1>&2
  echo "  → Vérifie que le HTML injecté est issu d'une source de confiance ET sanitizé (DOMPurify minimum)." 1>&2
  warned=1
fi

# 2. eval / new Function
if grep -nE '\beval\(|new[[:space:]]+Function\(' "$file_path" >/dev/null; then
  lines=$(grep -nE '\beval\(|new[[:space:]]+Function\(' "$file_path")
  echo "[check-xss-risks] ATTENTION eval/new Function dans $file_path :" 1>&2
  echo "$lines" 1>&2
  echo "  → Quasi-jamais nécessaire. Cherche une alternative (JSON.parse, lookup table, etc.)." 1>&2
  warned=1
fi

# 3. window.location = userInput (open redirect)
if grep -nE 'window\.location[[:space:]]*=[[:space:]]*[^"'"'"']*\$\{|location\.href[[:space:]]*=[[:space:]]*.*\+' "$file_path" >/dev/null; then
  echo "[check-xss-risks] ATTENTION redirection dynamique dans $file_path" 1>&2
  echo "  → Risque d'open redirect si l'URL vient d'une input utilisateur. Valider le domaine cible." 1>&2
  warned=1
fi

# 4. innerHTML = en JS pur
if grep -nE '\.innerHTML[[:space:]]*=[[:space:]]*' "$file_path" >/dev/null; then
  # Hors JSX (.tsx) on alerte plus fort
  case "$file_path" in
    *.ts|*.js)
      lines=$(grep -nE '\.innerHTML[[:space:]]*=' "$file_path")
      echo "[check-xss-risks] ATTENTION .innerHTML = dans $file_path :" 1>&2
      echo "$lines" 1>&2
      echo "  → Préférer textContent ou un rendu React/Astro." 1>&2
      warned=1
      ;;
  esac
fi

# 5. SQL raw concaténé (côté store)
if grep -nE 'supabase\.from\([^)]*\)\.select\(.*\$\{' "$file_path" >/dev/null; then
  echo "[check-xss-risks] ATTENTION select() avec interpolation dans $file_path" 1>&2
  echo "  → Si la chaîne contient des inputs utilisateur, risque d'injection PostgREST." 1>&2
  echo "  → Préférer .eq(col, value) / .filter(col, op, value) avec paramètres séparés." 1>&2
  warned=1
fi

exit 0
