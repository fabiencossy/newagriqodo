#!/usr/bin/env bash
# Hook PostToolUse Edit/Write : warning si une migration SQL ajoute une table
# mais oublie la policy RLS associée.
#
# Non bloquant (exit 0 même si warning) — affiche juste un avertissement dans la
# console de l'agent pour qu'il corrige.

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

# Cibler uniquement les migrations Supabase
case "$file_path" in
  */supabase/migrations/*.sql|supabase/migrations/*.sql) ;;
  *) exit 0 ;;
esac

[[ -f "$file_path" ]] || exit 0

# Tables créées dans ce fichier
tables=$(grep -ioE 'create table( if not exists)? (public\.)?[a-z_][a-z0-9_]*' "$file_path" \
  | sed -E 's/create table( if not exists)? (public\.)?//I' \
  | sort -u)

if [[ -z "$tables" ]]; then
  exit 0
fi

missing=""
for t in $tables; do
  # Tables système ou de référentiel partagé exemptées
  case "$t" in
    cultures) continue ;;
  esac

  # On considère couverte si une policy mentionne la table
  if ! grep -qiE "policy[^;]*on[[:space:]]+(public\.)?${t}\b" "$file_path"; then
    missing="$missing $t"
  fi
  # On vérifie aussi que RLS est explicitement activée
  if ! grep -qiE "alter[[:space:]]+table[[:space:]]+(public\.)?${t}[[:space:]]+enable[[:space:]]+row[[:space:]]+level[[:space:]]+security" "$file_path"; then
    missing="$missing ${t}(rls-disabled)"
  fi
done

if [[ -n "$missing" ]]; then
  echo "" 1>&2
  echo "[check-rls-coverage] ATTENTION : tables sans policy RLS dans $file_path :" 1>&2
  echo " $missing" 1>&2
  echo "" 1>&2
  echo "Ajoute pour chaque table :" 1>&2
  echo "  alter table public.<nom> enable row level security;" 1>&2
  echo "  create policy \"<nom>_member_select\" on public.<nom>" 1>&2
  echo "    for select using (public.is_farm_member(farm_id));" 1>&2
  echo "  create policy \"<nom>_member_write\" on public.<nom>" 1>&2
  echo "    for all using (public.is_farm_member(farm_id)) with check (public.is_farm_member(farm_id));" 1>&2
  echo "" 1>&2
fi

# Vérif additionnelle : pas de GRANT ALL TO anon
if grep -qiE 'grant[[:space:]]+all[[:space:]]+on[[:space:]]+.*to[[:space:]]+anon' "$file_path"; then
  echo "[check-rls-coverage] ATTENTION : GRANT ALL TO anon détecté." 1>&2
  echo "  Le rôle anon ne devrait JAMAIS avoir d'écriture sur des tables farm-scope." 1>&2
fi

exit 0
