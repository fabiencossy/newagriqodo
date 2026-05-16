# Supabase self-hosted — VPS Infomaniak

Stack Docker pour héberger Supabase sur le VPS Infomaniak (`83.228.247.77`),
conforme RGPD/LPD (toutes les données restent en Suisse).

## Architecture

```
                  HTTPS
   Internet ───────────────────►  Caddy (port 443)
                                      │
                                      ▼
                                  Kong (8000, localhost)
                                      │
              ┌───────────┬───────────┼───────────┬───────────┐
              ▼           ▼           ▼           ▼           ▼
            Auth        REST       Realtime   Storage      Studio
          (GoTrue)  (PostgREST)
              │           │           │           │           │
              └───────────┴───────────┼───────────┴───────────┘
                                      ▼
                                  Postgres (5432, localhost)
                                      │
                                      ▼
                              Volume db-data (persistant)
```

## Mise en route (VPS Infomaniak)

### 1. Prérequis serveur

```bash
# SSH sur le VPS
ssh root@83.228.247.77

# Installer Docker + Compose v2 (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin caddy

# Créer le user de service
useradd -r -m -s /bin/bash newagri
usermod -aG docker newagri

# Cloner le repo
mkdir -p /opt/newagri
chown newagri:newagri /opt/newagri
sudo -u newagri git clone https://github.com/<votre-org>/NewagriQodo.git /opt/newagri
```

### 2. DNS Infomaniak

Créer 2 enregistrements A pointant vers `83.228.247.77` :
- `newagri.qodo.ch`           (l'app, déployée séparément)
- `supabase.newagri.qodo.ch`  (cette stack)

### 3. Générer les secrets

```bash
cd /opt/newagri/infra/supabase
cp .env.example .env
chmod 600 .env

# Générer les secrets fortement aléatoires
openssl rand -base64 32             # JWT_SECRET
openssl rand -hex 32                # POSTGRES_PASSWORD
openssl rand -hex 16                # REALTIME_ENC_KEY (32 bytes hex)
openssl rand -base64 64             # REALTIME_SECRET_KEY_BASE
```

Générer `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_KEY` :
- Utiliser https://jwt.io avec l'algorithme **HS256** et le `JWT_SECRET`.
- Payload anon :  `{"role":"anon","iss":"supabase","iat":<now>,"exp":<+10ans>}`
- Payload service : idem avec `"role":"service_role"`.
- Coller le résultat dans `.env`.

Renseigner aussi les variables SMTP (cf. sprint S3 — Resend).

### 4. Démarrer la stack

```bash
docker compose up -d
docker compose ps          # vérifier que tout est healthy
docker compose logs -f db  # premier démarrage : observer l'init
```

Les migrations SQL (`supabase/migrations/*.sql`) et le seed sont
appliqués automatiquement par Postgres au **premier démarrage** via
`/docker-entrypoint-initdb.d/`. Pour rejouer une migration plus tard :

```bash
docker compose exec db psql -U postgres -f /docker-entrypoint-initdb.d/migrations/0001_initial_schema.sql
```

### 5. Reverse proxy Caddy

```bash
cp /opt/newagri/infra/supabase/Caddyfile /etc/caddy/Caddyfile
systemctl reload caddy
# Caddy demande un certificat Let's Encrypt automatiquement
# (port 80 + 443 doivent être ouverts sur le firewall)
```

### 6. Backup automatique

```bash
chmod +x /opt/newagri/infra/supabase/scripts/backup.sh
crontab -u newagri -e
# Ajouter :
# 15 3 * * * /opt/newagri/infra/supabase/scripts/backup.sh >> /var/log/newagri-backup.log 2>&1
```

### 7. Configurer l'app NewagriQodo

Dans `app/.env.local` (côté dev) ou via les variables d'env du serveur
de prod :

```bash
VITE_SUPABASE_URL=https://supabase.newagri.qodo.ch
VITE_SUPABASE_ANON_KEY=<le anon JWT généré à l'étape 3>
```

## Maintenance courante

| Tâche                   | Commande                                                              |
| ----------------------- | --------------------------------------------------------------------- |
| Voir les logs           | `docker compose logs -f <service>`                                    |
| Restart un service      | `docker compose restart auth`                                         |
| Mettre à jour les images| `docker compose pull && docker compose up -d`                         |
| Restaurer un backup     | `gunzip -c backup.sql.gz \| docker compose exec -T db psql -U postgres`|
| Accès direct Postgres   | `docker compose exec db psql -U postgres`                             |
| Studio (admin UI)       | SSH tunnel `ssh -L 3000:127.0.0.1:3000 root@vps` puis http://localhost:3000 |

## Sécurité — checklist

- [x] Postgres + Kong exposés uniquement sur `127.0.0.1` (pas `0.0.0.0`)
- [x] HTTPS obligatoire via Caddy (auto-renew Let's Encrypt)
- [x] CORS restreint à `newagri.qodo.ch` côté Caddy
- [x] Headers de sécurité (HSTS, X-Frame-Options, etc.)
- [x] RLS activée sur toutes les tables (cf. `supabase/migrations/`)
- [x] Backups quotidiens avec rotation 14 jours
- [ ] Push backups vers S3 Infomaniak Swiss Backup (rclone, optionnel)
- [ ] Monitoring uptime (sprint S7)
- [ ] Fail2ban sur SSH (recommandé, hors scope)

## Versions épinglées

| Service         | Version                |
| --------------- | ---------------------- |
| supabase/postgres | 15.6.1.146           |
| supabase/gotrue   | v2.158.1             |
| postgrest/postgrest | v12.2.0            |
| supabase/realtime | v2.30.34             |
| supabase/storage-api | v1.11.13          |
| supabase/studio    | 20240729-ce42139    |
| supabase/postgres-meta | v0.83.2         |
| kong              | 2.8.1                |

Ne pas utiliser `latest` — un changement breaking pourrait casser la prod
sans préavis. Mettre à jour explicitement et tester en staging d'abord.
