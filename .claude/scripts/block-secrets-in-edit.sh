#!/usr/bin/env bash
# Hook PreToolUse Edit/Write : bloque l'écriture de secrets dans n'importe quel fichier.
#
# Détecte : JWT, clés API (Resend, Supabase service_role, Stripe, OpenAI...),
# private keys, mots de passe en clair dans des chaînes, etc.
#
# Exit 2 = blocage propre, le code expliquant pourquoi.

set -euo pipefail
payload=$(cat)

content=$(echo "$payload" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    ti = data.get('tool_input', {})
    # Write : tout le contenu. Edit : new_string.
    print(ti.get('content', '') or ti.get('new_string', ''))
except Exception:
    pass
")

file_path=$(echo "$payload" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('tool_input', {}).get('file_path', ''))
except Exception:
    pass
")

[[ -z "$content" ]] && exit 0

# Whitelist : fichiers où on accepte les exemples (jamais de vrais secrets dedans)
case "$file_path" in
  *.env.example|*/SECURITY.md|*/README.md|*/.claude/scripts/*|*/migrations/*|*/email-templates/*)
    # On laisse passer mais on garde la vigilance sur les patterns critiques
    strict=0
    ;;
  *)
    strict=1
    ;;
esac

# Patterns secrets — ordre du plus spécifique au plus large
declare -a critical_patterns=(
  # JWT (3 segments base64 séparés par .)
  'eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}'
  # Private keys
  '-----BEGIN (RSA |EC |OPENSSH |PGP |DSA )?PRIVATE KEY-----'
  # Resend
  're_[A-Za-z0-9]{20,}'
  # Stripe live
  'sk_live_[A-Za-z0-9]{20,}'
  'rk_live_[A-Za-z0-9]{20,}'
  # OpenAI / Anthropic
  'sk-[A-Za-z0-9]{32,}'
  'sk-ant-api[0-9]{2}-[A-Za-z0-9_-]{40,}'
  # AWS
  'AKIA[0-9A-Z]{16}'
  # GitHub PAT
  'gh[pousr]_[A-Za-z0-9]{36,}'
  # Generic high-entropy hex tokens (50+ chars hex = secret probable)
  'POSTGRES_PASSWORD[[:space:]]*=[[:space:]]*[a-f0-9]{32,}'
  'JWT_SECRET[[:space:]]*=[[:space:]]*[A-Za-z0-9+/=]{30,}'
)

for p in "${critical_patterns[@]}"; do
  # `-e` avant le pattern : évite que grep interprète un pattern commençant par '-' comme un flag
  if echo "$content" | grep -qE -e "$p"; then
    matched=$(echo "$content" | grep -oE -e "$p" | head -1)
    echo "[block-secrets] BLOQUÉ : secret détecté dans $file_path" 1>&2
    echo "  Motif : $p" 1>&2
    echo "  Échantillon : ${matched:0:30}…" 1>&2
    echo "" 1>&2
    echo "Les secrets doivent vivre dans .env / .env.local (gitignored)." 1>&2
    echo "Pour un fichier .env.example, utiliser un placeholder : 'replace-with-...'" 1>&2
    exit 2
  fi
done

# Patterns stricts (mots de passe en dur, etc.) — uniquement hors whitelist
if [[ $strict -eq 1 ]]; then
  declare -a strict_patterns=(
    # Password assigné en dur dans du code
    '(password|passwd|secret)[[:space:]]*[:=][[:space:]]*['"'"'"][A-Za-z0-9!@#$%^&*]{8,}['"'"'"]'
  )
  for p in "${strict_patterns[@]}"; do
    if echo "$content" | grep -qiE "$p"; then
      # Tolère les chaînes contenant "password" (form labels FR), regarde la valeur
      sample=$(echo "$content" | grep -iE "$p" | head -1)
      # Ignore les chaînes type "Mot de passe", "password placeholder", etc.
      if ! echo "$sample" | grep -qiE 'placeholder|label|aria-|t\(|i18n|input|min[[:space:]]*length'; then
        echo "[block-secrets] BLOQUÉ : mot de passe potentiellement en dur dans $file_path" 1>&2
        echo "  Ligne : $sample" 1>&2
        echo "" 1>&2
        echo "Si c'est intentionnel (mock test, fixture), commenter avec // dev-only et préfixer la valeur par 'test-'." 1>&2
        exit 2
      fi
    fi
  done
fi

exit 0
