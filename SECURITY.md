# Politique de sécurité — NewagriQodo

## Données concernées et exigences

NewagriQodo manipule :

- Données d'exploitation (parcelles, cultures, géométries) — propriété de l'exploitation cliente
- Carnet des champs (interventions, produits phytosanitaires utilisés, numéros d'homologation OFAG) — secret professionnel
- Données employés (équipe, heures travaillées) — données personnelles (LPD/RGPD)
- Authentification (emails, mots de passe hachés, JWT)

Hébergement strict : **Suisse uniquement** (VPS Infomaniak, Plan-les-Ouates).
Aucune réplication à l'étranger. Conforme LPD (Suisse) et RGPD (UE).

## Modèle de menaces

| Asset                              | Menace principale                          | Mitigation                                              |
| ---------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| Données d'une farm                 | Lecture/modif inter-tenant (autre farm)    | Row-Level Security (RLS) via `is_farm_member()`         |
| JWT utilisateur                    | Vol par XSS, leak via logs                 | CSP, sanitization, pas de log de session entière        |
| Service role JWT                   | Exposition côté front                      | Hook bloquant + revue code (cf. `block-service-key-front.sh`) |
| Mots de passe                      | Brute force, leak via reset                | bcrypt côté GoTrue, rate limit, token reset 1h          |
| Numéros OFAG, doses phyto          | Modif non autorisée                        | RLS + traçabilité `created_by` + audit logs (V2)        |
| Postgres                           | Exposition publique                        | `127.0.0.1:5432` uniquement, accès via SSH tunnel       |

## Architecture de sécurité

### Front (React)
- **Aucune clé `service_role`** — uniquement `ANON_KEY` (JWT non privilégié)
- **localStorage** : Supabase gère le stockage du token via son storage adapter
- **Mode démo** : pattern dual-mode, n'appelle JAMAIS Supabase (sandbox local)
- **Pas de `dangerouslySetInnerHTML`** non sanitizé
- **CSP minimale** : à compléter via Caddy en V2

### Backend (Supabase auto-hébergé)
- **RLS activée sur toutes les tables farm-scope**
- Helpers `SECURITY DEFINER` avec `set search_path = public`
- Fonctions RPC validant `auth.uid()` avant écriture
- Email confirmation obligatoire (`GOTRUE_MAILER_AUTOCONFIRM=false`)
- Reset password : token 1h, redirect whitelisté

### Infra (VPS Infomaniak)
- Postgres : `127.0.0.1:5432` (jamais `0.0.0.0`)
- Kong : `127.0.0.1:8000` (HTTP interne uniquement)
- Caddy : HTTPS forcé (Let's Encrypt), HSTS, CORS limité à `newagri.qodo.ch`
- Firewall : UFW (80/443 + SSH uniquement)
- fail2ban : actif sur SSH
- SSH : clé uniquement, pas de mot de passe
- Backups : pg_dump quotidien chiffré, rotation 14 jours

## Hooks Claude Code (sécurité)

Les hooks dans `.claude/scripts/` s'exécutent automatiquement à chaque action de l'agent. À fusionner dans `.claude/settings.json` (cf. `.claude/settings.security.json` pour le template).

### Bloquants (PreToolUse — exit 2)
| Hook                          | Bloque                                                            |
| ----------------------------- | ----------------------------------------------------------------- |
| `block-dangerous-bash.sh`     | `rm -rf`, `git push --force`, `git reset --hard`, etc.            |
| `protect-darval.sh`           | Modification de `darval.geojson.json`                             |
| `block-secrets-in-edit.sh`    | Écriture de JWT, clés API, private keys, passwords en dur         |
| `block-env-files.sh`          | Édition de `.env`, `.env.local`, etc. (autorise `.env.example`)   |
| `block-service-key-front.sh`  | Usage de `SERVICE_KEY`/`service_role`/`supabase.auth.admin` dans `app/src/` |

### Informatifs (PostToolUse — warning sans bloquer)
| Hook                          | Vérifie                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| `check-rls-coverage.sh`       | Table créée dans migration → policy RLS associée                   |
| `check-xss-risks.sh`          | `dangerouslySetInnerHTML`, `eval`, `.innerHTML =`, redirections dynamiques |
| `check-debug-leaks.sh`        | `console.log` avec password/token/session                          |
| `check-cors-wildcard.sh`      | CORS `*` dans Caddyfile/docker-compose/kong, ports DB exposés      |
| `check-deps-audit.sh`         | CVE high+ après modif `package.json`                               |

## Agents Claude Code (sécurité)

À invoquer via `Task` tool avec `subagent_type` :

| Agent              | Quand l'utiliser                                                  |
| ------------------ | ----------------------------------------------------------------- |
| `security-auditor` | Audit complet avant chaque deploy prod ou après changement auth/RLS |
| `rls-reviewer`     | Review d'une migration SQL touchant les RLS                        |
| `secrets-scanner`  | Avant chaque push public, après incident, audit périodique         |

## Process

### Avant chaque deploy prod
1. Lancer l'agent `security-auditor` sur le diff
2. Vérifier `npm audit` côté `app/` et `website/`
3. Vérifier que `git log -p -- supabase/migrations/` ne révèle aucune dégradation de RLS

### Après chaque modification d'auth ou de RLS
1. Lancer `rls-reviewer` sur la migration
2. Écrire un test SQL d'isolation (cf. template dans l'agent)
3. Valider en staging avant prod

### Périodique (mensuel)
1. Lancer `secrets-scanner` sur tout l'historique git
2. Rotation des secrets non critiques (clés API services tiers)
3. Vérifier les CVE Resend, Supabase, Postgres et patcher si besoin

## Signalement d'une vulnérabilité

**Ne pas ouvrir d'issue publique sur GitHub.**

Envoyer un email à `security@qodo.ch` (à créer) avec :
- Description du problème
- Étapes pour reproduire
- Impact estimé
- Si possible, un proof-of-concept

Engagement : réponse sous 72h, correction selon criticité :
- CRITIQUE : sous 24h, hotfix immédiat
- HAUTE : sous 7 jours
- MOYENNE : sous 30 jours

## Réponse à incident

En cas de fuite de secret ou de compromission suspectée :

1. **Révoquer immédiatement** le secret côté Supabase / Resend / Infomaniak
2. **Rotate** : générer un nouveau secret, le déployer (`bootstrap.sh` regénère)
3. **Auditer les logs** : `docker compose logs auth | grep <email-suspect>`
4. **Notifier les exploitations concernées** sous 72h (obligation LPD/RGPD)
5. **Post-mortem** : documenter cause racine, ajouter un hook ou test pour prévenir la récurrence

## Checklist de pré-prod (à valider avant de mettre en ligne)

- [ ] `supabase/migrations/` : toutes les tables farm-scope ont RLS + policies
- [ ] `.env` non committé (`git ls-files | grep '\.env$'` → vide)
- [ ] Postgres `127.0.0.1:5432` (pas `0.0.0.0`)
- [ ] Caddy HTTPS forcé + HSTS + CORS limité à `newagri.qodo.ch`
- [ ] Email confirmation obligatoire dans GoTrue
- [ ] Backups quotidiens activés (cron + script `backup.sh`)
- [ ] `npm audit --audit-level=high` : 0 vuln
- [ ] Aucun `service_role` côté front (`git grep service_role app/src/` → vide)
- [ ] `security-auditor` lancé, rapport vert
- [ ] Mentions légales + politique de confidentialité publiées
- [ ] Sentry/monitoring configuré (V2)
