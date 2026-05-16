#!/usr/bin/env bash
# ============================================================================
# Bootstrap VPS Ubuntu Infomaniak — Supabase self-host NewagriQodo
# ============================================================================
# Installe Docker, Caddy, clone le repo, génère les secrets, démarre la stack.
#
# Usage (sur le VPS, en root) :
#   curl -fsSL https://raw.githubusercontent.com/<org>/NewagriQodo/main/infra/supabase/scripts/bootstrap.sh | bash
#
# ou en local après git clone :
#   sudo bash /opt/newagri/infra/supabase/scripts/bootstrap.sh
#
# Prérequis :
#   - Ubuntu 22.04+ ou Debian 12+
#   - Accès root ou sudo
#   - DNS supabase.newagri.qodo.ch déjà pointé sur l'IP du VPS
# ============================================================================

set -euo pipefail

# --- Couleurs pour les logs ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $*"; }
warn() { echo -e "${YELLOW}[$(date +%H:%M:%S)] WARN${NC} $*"; }
err() { echo -e "${RED}[$(date +%H:%M:%S)] ERROR${NC} $*" >&2; }

# --- Vérifs préalables ---
if [ "$EUID" -ne 0 ]; then
  err "Lancez ce script en root (sudo)."
  exit 1
fi

REPO_URL="${REPO_URL:-https://github.com/CHANGE-ME/NewagriQodo.git}"
REPO_DIR="${REPO_DIR:-/opt/newagri}"
COMPOSE_DIR="$REPO_DIR/infra/supabase"
DOMAIN="${DOMAIN:-supabase.newagri.qodo.ch}"
APP_DOMAIN="${APP_DOMAIN:-newagri.qodo.ch}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@qodo.ch}"

# ============================================================================
# 1. Mise à jour système + paquets de base
# ============================================================================
log "Étape 1/7 — Mise à jour du système"
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl ca-certificates gnupg lsb-release git ufw fail2ban

# ============================================================================
# 2. Docker + Compose v2
# ============================================================================
if ! command -v docker >/dev/null; then
  log "Étape 2/7 — Installation Docker"
  curl -fsSL https://get.docker.com | sh
else
  log "Étape 2/7 — Docker déjà installé ($(docker --version))"
fi
apt-get install -y -qq docker-compose-plugin

# ============================================================================
# 3. Caddy (reverse proxy + TLS auto)
# ============================================================================
if ! command -v caddy >/dev/null; then
  log "Étape 3/7 — Installation Caddy"
  apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  apt-get update -qq
  apt-get install -y -qq caddy
else
  log "Étape 3/7 — Caddy déjà installé ($(caddy version))"
fi

# ============================================================================
# 4. Firewall — n'ouvrir que SSH, HTTP, HTTPS
# ============================================================================
log "Étape 4/7 — Configuration firewall (UFW)"
ufw --force reset >/dev/null
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp comment 'HTTP (Let''s Encrypt + redirect)' >/dev/null
ufw allow 443/tcp comment 'HTTPS' >/dev/null
ufw --force enable >/dev/null

systemctl enable --now fail2ban

# ============================================================================
# 5. Cloner le repo
# ============================================================================
if [ ! -d "$REPO_DIR/.git" ]; then
  log "Étape 5/7 — Clone du repo NewagriQodo"
  if [ "$REPO_URL" = "https://github.com/CHANGE-ME/NewagriQodo.git" ]; then
    err "REPO_URL non configurée. Relancez avec : REPO_URL=https://github.com/<org>/NewagriQodo.git bash bootstrap.sh"
    exit 1
  fi
  git clone "$REPO_URL" "$REPO_DIR"
else
  log "Étape 5/7 — Repo déjà cloné"
  # `git pull` peut échouer si l'agent SSH n'est pas forwardé sous sudo.
  # Pas grave : le repo a été cloné juste avant par l'utilisateur, il est à jour.
  # Pour mettre à jour plus tard : faire `cd /opt/newagri && git pull` SANS sudo.
  if git -C "$REPO_DIR" pull --ff-only 2>/dev/null; then
    log "Pull OK"
  else
    warn "git pull a échoué (probablement agent SSH non disponible sous sudo) — on continue avec l'état actuel du repo"
  fi
fi

# ============================================================================
# 6. Générer les secrets .env (si pas déjà fait)
# ============================================================================
ENV_FILE="$COMPOSE_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  log "Étape 6/7 — Génération des secrets .env"

  POSTGRES_PASSWORD=$(openssl rand -hex 32)
  JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n' | cut -c1-64)
  REALTIME_ENC_KEY=$(openssl rand -hex 16)
  REALTIME_SECRET_KEY_BASE=$(openssl rand -base64 64 | tr -d '\n')

  # Génération des JWT anon + service_role via Python (déjà installé sur Ubuntu)
  generate_jwt() {
    local role=$1
    python3 -c "
import hmac, hashlib, base64, json, time
secret = '$JWT_SECRET'.encode()
header = {'alg':'HS256','typ':'JWT'}
payload = {'role':'$role','iss':'supabase','iat':int(time.time()),'exp':int(time.time())+(60*60*24*365*10)}
def b64(d): return base64.urlsafe_b64encode(json.dumps(d, separators=(',',':')).encode()).rstrip(b'=').decode()
h, p = b64(header), b64(payload)
sig = base64.urlsafe_b64encode(hmac.new(secret, f'{h}.{p}'.encode(), hashlib.sha256).digest()).rstrip(b'=').decode()
print(f'{h}.{p}.{sig}')
"
  }

  ANON_KEY=$(generate_jwt anon)
  SERVICE_KEY=$(generate_jwt service_role)

  cat > "$ENV_FILE" <<EOF
# Généré automatiquement par bootstrap.sh — NE PAS COMMIT
SUPABASE_PUBLIC_URL=https://$DOMAIN
APP_PUBLIC_URL=https://$APP_DOMAIN
ADDITIONAL_REDIRECT_URLS=https://$APP_DOMAIN/login,https://$APP_DOMAIN/reset-password,https://$APP_DOMAIN/accept-invite,http://localhost:5173/login,http://localhost:5173/reset-password,http://localhost:5173/accept-invite

POSTGRES_PASSWORD=$POSTGRES_PASSWORD
JWT_SECRET=$JWT_SECRET
SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_KEY=$SERVICE_KEY

REALTIME_ENC_KEY=$REALTIME_ENC_KEY
REALTIME_SECRET_KEY_BASE=$REALTIME_SECRET_KEY_BASE

# SMTP — À RENSEIGNER MANUELLEMENT après création compte Resend
SMTP_ADMIN_EMAIL=$ADMIN_EMAIL
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=REPLACE_WITH_RESEND_API_KEY
SMTP_SENDER_NAME=NewagriQodo
EOF

  chmod 600 "$ENV_FILE"
  warn "Secrets générés dans $ENV_FILE"
  warn "ANON_KEY (à mettre dans app/.env.local côté front) :"
  echo "  $ANON_KEY"
else
  log "Étape 6/7 — .env existe déjà, on garde les secrets actuels"
fi

# ============================================================================
# 7. Démarrer la stack Docker
# ============================================================================
log "Étape 7/7 — Démarrage de la stack Supabase"
cd "$COMPOSE_DIR"
docker compose pull
docker compose up -d

log "Attente que Postgres soit healthy…"
for i in {1..30}; do
  if docker compose ps db | grep -q healthy; then
    log "Postgres healthy"
    break
  fi
  sleep 2
done

# --- Alignement des rôles Postgres (auth, rest, realtime, storage) ---
log "Alignement des rôles Postgres avec le POSTGRES_PASSWORD"
bash "$COMPOSE_DIR/scripts/init-roles.sh" || warn "init-roles a échoué — relance manuellement : sudo bash $COMPOSE_DIR/scripts/init-roles.sh"

# --- Caddy ---
log "Configuration Caddy"
cp "$COMPOSE_DIR/Caddyfile" /etc/caddy/Caddyfile
# Remplace email + domaines si différents des defaults
sed -i "s|admin@qodo.ch|$ADMIN_EMAIL|g" /etc/caddy/Caddyfile
# enable --now : démarre si arrêté, restart si déjà running. Plus robuste que reload.
systemctl enable --now caddy
systemctl reload caddy 2>/dev/null || systemctl restart caddy

# --- Backup quotidien ---
log "Activation backup quotidien (cron 03:15)"
chmod +x "$COMPOSE_DIR/scripts/backup.sh"
CRON_LINE="15 3 * * * $COMPOSE_DIR/scripts/backup.sh >> /var/log/newagri-backup.log 2>&1"
( crontab -l 2>/dev/null | grep -v 'newagri-backup' ; echo "$CRON_LINE" ) | crontab -

# ============================================================================
# Récap
# ============================================================================
echo ""
log "==============================================================="
log "  Bootstrap terminé."
log "==============================================================="
echo ""
echo "  Stack Supabase :   https://$DOMAIN"
echo "  Studio (admin) :   ssh -L 3000:127.0.0.1:3000 root@$(curl -s ifconfig.me 2>/dev/null || echo VPS_IP)"
echo "                     puis http://localhost:3000"
echo ""
echo "  À FAIRE MAINTENANT :"
echo "    1. Créer un compte Resend (https://resend.com), vérifier le domaine qodo.ch"
echo "    2. Coller la clé API Resend dans $ENV_FILE (SMTP_PASS=...)"
echo "    3. docker compose restart auth"
echo "    4. Côté app : VITE_SUPABASE_URL=https://$DOMAIN et VITE_SUPABASE_ANON_KEY=<ci-dessus>"
echo ""
echo "  Vérifs santé : docker compose ps  (tout doit être healthy)"
echo "  Logs : docker compose logs -f"
echo ""
