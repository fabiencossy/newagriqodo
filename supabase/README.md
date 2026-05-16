# Supabase — NewagriQodo

Schéma SQL + RLS pour l'instance Supabase auto-hébergée (CH strict).

## Structure

```
supabase/
├── README.md                       (ce fichier)
├── migrations/
│   └── 0001_initial_schema.sql     (tables + RLS + triggers)
└── seed.sql                        (catalogue cultures Agridéa)
```

## Modèle de données

```
auth.users (Supabase)
    │
    ├── profiles            (1:1 — extension utilisateur)
    └── farm_members        (N:N — multi-exploitation)
            │
            └── farms
                  │
                  ├── parcels
                  │     └── parcel_group_members ─── parcel_groups
                  │
                  ├── assolement_segments     (1 segment = 1 culture / 1 parcelle / N jours)
                  │
                  ├── interventions           (carnet des champs)
                  │     ├── intervention_parcels    (N:N)
                  │     └── intervention_products   (N:N + dose/unité)
                  │
                  ├── products                (catalogue local à la farm)
                  ├── farm_workers            (équipe — distinct des comptes auth)
                  └── farm_invitations        (invitations email en attente)

public (lecture seule pour authenticated)
    └── cultures            (catalogue Agridéa partagé)
```

## RLS — Modèle de sécurité

Toute donnée d'une exploitation est accessible uniquement aux membres
de cette exploitation. Vérification via :

- `is_farm_member(farm_id)` — lecture/écriture standard
- `is_farm_admin(farm_id)`  — gestion des membres / config exploitation

Les fonctions sont `SECURITY DEFINER` pour éviter la récursion RLS
sur `farm_members`.

Le catalogue `cultures` est en lecture publique (toute personne
authentifiée). L'écriture est restreinte au superadmin (manuelle, pas
de policy d'écriture — c'est du référentiel maintenu côté projet).

## Application des migrations

### Sur l'instance auto-hébergée (VPS Infomaniak)

```bash
# Depuis le serveur, après docker compose up :
docker compose exec db psql -U postgres -d postgres \
  -f /supabase/migrations/0001_initial_schema.sql

docker compose exec db psql -U postgres -d postgres \
  -f /supabase/seed.sql
```

### En local (instance Supabase cloud de dev, optionnel)

Via le SQL Editor du dashboard Supabase : copier-coller le contenu
des deux fichiers dans l'ordre.

### Via la CLI Supabase (recommandé une fois la CLI installée)

```bash
supabase link --project-ref <ref>
supabase db push           # applique les migrations/
supabase db seed           # applique seed.sql
```

## Conventions

- **`farm_id`** est toujours présent et indexé sur toute table scope-farm.
  Ne jamais retirer cette colonne — elle conditionne toutes les RLS.
- **Triggers `updated_at`** : appliqués automatiquement à toute table
  qui possède la colonne (via `tg_set_updated_at()`).
- **Cascades** : `on delete cascade` depuis `farms` → toutes les
  tables enfants. Supprimer une farm supprime tout son contenu.
- **Idempotence** : toutes les migrations sont rejouables (DROP POLICY
  IF EXISTS / CREATE OR REPLACE FUNCTION / etc.).

## À faire avant prod

- [ ] Configurer Supabase Auth : email confirmé obligatoire, secret JWT
      custom, redirect URLs `/login` et `/reset-password` whitelistées
- [ ] Activer le SMTP Resend pour les emails transactionnels
- [ ] Restreindre les CORS au domaine `newagri.qodo.ch`
- [ ] Backup automatique quotidien (pg_dump → S3 Infomaniak)
- [ ] Sauvegarde manuelle avant chaque migration de prod
