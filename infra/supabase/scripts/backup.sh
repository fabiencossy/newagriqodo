#!/usr/bin/env bash
# ============================================================================
# Backup quotidien Postgres Supabase
# ============================================================================
# Crontab suggéré (à 03:15 chaque nuit) :
#   15 3 * * * /opt/newagri/infra/supabase/scripts/backup.sh >> /var/log/newagri-backup.log 2>&1
#
# Rotation : conserve 14 jours en local + push S3 Infomaniak (optionnel).
# ============================================================================

set -euo pipefail

BACKUP_DIR=${BACKUP_DIR:-/var/backups/newagri-supabase}
RETENTION_DAYS=${RETENTION_DAYS:-14}
COMPOSE_DIR=${COMPOSE_DIR:-/opt/newagri/infra/supabase}

mkdir -p "$BACKUP_DIR"
TS=$(date -u +%Y%m%d-%H%M%S)
FILE="$BACKUP_DIR/supabase-$TS.sql.gz"

cd "$COMPOSE_DIR"

echo "[$(date -Iseconds)] Dump Postgres -> $FILE"
docker compose exec -T db pg_dump -U postgres --clean --if-exists --no-owner postgres \
  | gzip -9 > "$FILE"

# Rotation locale
find "$BACKUP_DIR" -name 'supabase-*.sql.gz' -mtime +"$RETENTION_DAYS" -delete

echo "[$(date -Iseconds)] Backup OK ($(du -h "$FILE" | cut -f1))"

# Optionnel — push S3 Infomaniak Swiss Backup
# Décommenter et configurer rclone si activé :
# if command -v rclone >/dev/null && [ -n "${RCLONE_REMOTE:-}" ]; then
#   rclone copy "$FILE" "$RCLONE_REMOTE/newagri-supabase/" --quiet
#   echo "[$(date -Iseconds)] Push S3 OK"
# fi
