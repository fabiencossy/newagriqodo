# docs/2_Architecture — Index

Stack technique, schéma DB, patterns scalabilité.

## Fichiers

- **[SPEC.md](SPEC.md)** ⭐ — Source de vérité fonctionnelle (modules, features, stack).
- **[PRISMA.md](PRISMA.md)** — Schéma PostgreSQL complet (User, Farm, Parcel, Culture, etc.).
- **[cloud.md](cloud.md)** — Principes architecturaux (multi-tenancy, caching, webhooks, no N+1).
- **[SPEC_COMPLETE_LEGACY.md](SPEC_COMPLETE_LEGACY.md)** — Ancienne version exhaustive de SPEC (référence historique).

## Config Claude Code

- `.claude/settings.json` à la racine du projet — hooks PostToolUse (typecheck/lint sur Edit dans `app/src/`).
