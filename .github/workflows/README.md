# GitHub Actions — NewagriQodo

3 workflows :

| Fichier              | Déclenchement                              | Action                                                |
| -------------------- | ------------------------------------------ | ----------------------------------------------------- |
| `ci.yml`             | push main + PR                             | typecheck, lint, tests, build (app + website)         |
| `deploy-app.yml`     | manuel (workflow_dispatch) ou tag `v*`     | build + rsync app/dist/ vers /var/www/newagri-app/    |
| `deploy-website.yml` | push main qui touche `website/**`          | build + rsync website/dist/ vers /var/www/newagri-website/ |

## Secrets à configurer

Settings → Secrets and variables → Actions → **New repository secret**

| Secret                | Valeur                                                 |
| --------------------- | ------------------------------------------------------ |
| `VPS_HOST`            | `83.228.247.77`                                        |
| `VPS_USER`            | `ubuntu` (ou un user dédié `deploy`)                   |
| `VPS_SSH_KEY`         | clé privée OpenSSH (cf. ci-dessous)                    |
| `SUPABASE_URL`        | `https://supabase.newagri.qodo.ch`                     |
| `SUPABASE_ANON_KEY`   | (clé JWT anon générée par `bootstrap.sh`)              |

### Générer la clé SSH dédiée au déploiement

Sur ta machine :

```bash
ssh-keygen -t ed25519 -f ~/.ssh/newagri-deploy -C "github-actions@newagri" -N ""
```

Copier la **clé publique** sur le VPS dans le `authorized_keys` du user de déploiement :

```bash
ssh-copy-id -i ~/.ssh/newagri-deploy.pub ubuntu@83.228.247.77
```

Copier la **clé privée** dans le secret `VPS_SSH_KEY` :

```bash
cat ~/.ssh/newagri-deploy
# Coller le contenu (BEGIN OPENSSH PRIVATE KEY ... END OPENSSH PRIVATE KEY) dans le secret
```

## Configuration Caddy pour servir app + website

Compléter `/etc/caddy/Caddyfile` avec :

```caddy
newagri.qodo.ch {
  root * /var/www/newagri-app
  try_files {path} /index.html
  file_server
  encode gzip zstd
}

# Optionnel — site marketing sur un sous-domaine séparé
# www.newagri.qodo.ch {
#   root * /var/www/newagri-website
#   try_files {path} {path}/index.html =404
#   file_server
#   encode gzip zstd
# }
```

Puis créer les dossiers :

```bash
sudo mkdir -p /var/www/newagri-app /var/www/newagri-website
sudo chown -R ubuntu:ubuntu /var/www
sudo systemctl reload caddy
```

## Tests en local

```bash
# Simuler le job CI app
cd app
npm ci
npm run typecheck && npm run lint && npm test -- --run && npm run build

# Simuler le job CI website
cd website
npm ci && npm run build
```

## Monitoring (à brancher en V2)

- Uptime : [uptime-kuma](https://github.com/louislam/uptime-kuma) self-hosté sur le VPS, ou
  [Better Uptime](https://betteruptime.com) (plan gratuit suffit pour 1 site)
- Logs : Caddy écrit dans `/var/log/caddy/`. Pour les agréger ailleurs, brancher
  Loki + Grafana plus tard.
- Erreurs front : [Sentry](https://sentry.io) (plan gratuit 5k events/mois) — à ajouter dans
  `app/src/main.tsx` avec `Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN })`.
