# Prompt de démarrage Agri Qodo — pour Claude Code

> **Mode d'emploi :** copie-colle TOUT ce qui se trouve sous la ligne de séparation ci-dessous dans Claude Code après avoir ouvert un dossier vide pour le projet (par exemple `~/projets/agri-qodo`). Place aussi le fichier `AgriQodo_SPEC_COMPLETE.md` dans ce même dossier avant de lancer le prompt — Claude Code ira le lire en premier.

---

# Mission : bootstrap d'Agri Qodo

Tu es chargé de démarrer **Agri Qodo**, une application SaaS open source destinée aux exploitations agricoles suisses, intégrée à Odoo Enterprise, fonctionnant en hors ligne, distribuée sur iOS, Android et web.

## Étape 0 — Lecture obligatoire avant toute action

Lis d'abord intégralement le fichier `AgriQodo_SPEC_COMPLETE.md` qui se trouve dans le dossier courant. Ce fichier est ta source de vérité unique pour toutes les décisions techniques, fonctionnelles, business et UX. Si une consigne de ce prompt entre en conflit avec la spec, c'est la spec qui prévaut — sauf indication contraire explicite.

Une fois la spec lue, confirme en une phrase ce que tu as compris du projet, puis attends mon « go » avant de démarrer l'étape 1.

## Étape 1 — Bootstrap du monorepo

Crée la structure suivante à la racine du dossier courant :

```
agri-qodo/
├── apps/
│   ├── web/          # Next.js 15 (App Router, TypeScript strict)
│   ├── mobile/       # React Native + Expo (TypeScript strict)
│   └── backend/      # NestJS (TypeScript strict)
├── packages/
│   ├── shared/       # types partagés, schémas zod, modèles
│   ├── ui/           # composants partagés web (shadcn/ui)
│   ├── odoo-client/  # lib XML-RPC + JSON-RPC Odoo
│   ├── agridata-client/  # placeholder pour V2
│   └── domain/       # logique métier pure (Suisse-Bilanz, calculs UGB, validation parcelle)
├── docs/
│   ├── SPEC_COMPLETE.md      # déplace AgriQodo_SPEC_COMPLETE.md ici
│   ├── ARCHITECTURE.md       # à rédiger
│   ├── modules/              # une fiche markdown par module M1...M16
│   └── adr/                  # Architecture Decision Records (commence avec ADR-001)
├── infra/
│   └── docker-compose.dev.yml
├── .github/workflows/        # CI lint + tests + build
├── .editorconfig
├── .gitignore
├── .nvmrc                    # Node 22 LTS
├── package.json              # workspace racine
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── README.md                 # public, FR, ton chaleureux mais pro
├── CONTRIBUTING.md           # FR
├── CODE_OF_CONDUCT.md        # Contributor Covenant 2.1 traduit
├── LICENSE                   # AGPL v3 — texte intégral
└── CLA.md                    # Contributor License Agreement
```

Configure :
- **pnpm** comme package manager (ajoute `"packageManager": "pnpm@9.x"` dans le `package.json` racine)
- **Turborepo** avec un `turbo.json` qui définit les pipelines `build`, `lint`, `test`, `dev`
- **TypeScript strict** partout (`"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`)
- **ESLint** avec `@typescript-eslint`, **Prettier**, **Husky** + **lint-staged** pour pre-commit
- **commitlint** avec conventional commits

Le `README.md` doit contenir : pitch en une phrase, statut « 🌱 alpha — early development », prérequis (Node 22, pnpm, Docker), commandes principales (`pnpm install`, `pnpm dev`, `pnpm test`, `pnpm build`), licence AGPL, lien CONTRIBUTING. Tout en français.

**Critère d'acceptation étape 1** : `pnpm install` puis `pnpm build` passent à vide. `pnpm lint` ne renvoie aucune erreur. Le repo est initialisé avec git, premier commit `chore: initial monorepo bootstrap`.

## Étape 2 — Backend NestJS

Dans `apps/backend/` :

- Setup NestJS 10+, TypeScript strict, structure modulaire (`src/modules/`)
- Modules initiaux : `health`, `auth`, `tenants`, `parcelles`, `interventions`, `partner-links`
- **Prisma** comme ORM, schema `prisma/schema.prisma` aligné sur la section 6 de la spec (Exploitation, Parcelle, Culture, Intervention, Animal, PartnerLink avec multi-tenant)
- **PostgreSQL 16** via docker-compose, **PostGIS** activé pour la géoloc des parcelles
- **Redis** via docker-compose (cache + BullMQ futur)
- Auth : **JWT** + refresh token, endpoint `/auth/login` + `/auth/refresh`. Préparer un slot pour CH-Login OIDC plus tard (ne pas l'implémenter encore)
- Middleware **multi-tenant strict** : chaque requête authentifiée porte un `tenantId`, Prisma filtre automatiquement (utilise `Prisma.middleware` ou `Prisma extends`)
- **OpenAPI** via `@nestjs/swagger`, exposé sur `/api/docs` en dev uniquement
- **Pino** pour logs structurés, **OpenTelemetry** pour la trace (config minimale)
- Tests : **Jest** avec une suite e2e pour `health` et `auth` — la couverture viendra plus tard

Le `docker-compose.dev.yml` à la racine du repo doit lancer : `postgres` (avec PostGIS), `redis`, `mailhog` pour les emails de dev.

**Critère d'acceptation étape 2** : `pnpm --filter backend dev` démarre le serveur sur `:3001`. `GET /health` retourne 200. `GET /api/docs` affiche Swagger UI. Migrations Prisma appliquées à la BDD locale.

## Étape 3 — Frontend web Next.js

Dans `apps/web/` :

- Next.js 15 App Router, TypeScript strict
- **Tailwind CSS** + **shadcn/ui** initialisé
- **TanStack Query** pour le client API
- **react-hook-form** + **zod**
- Layout de base avec un header simple, sidebar de navigation entre modules, page d'accueil « Bonjour [prénom] » qui liste 3 actions rapides (Saisir intervention / Voir bilan / Bons de commande)
- Page de login basique branchée au backend
- Configurer **RxDB** sur IndexedDB (placeholder pour le moment, juste l'init et un test « healthcheck » qui écrit/lit une entrée)
- Theme : couleurs `--green: #2E7D32`, `--green-dark: #1B5E20`, fond clair, vocabulaire métier dans les libellés

**Critère d'acceptation étape 3** : `pnpm --filter web dev` démarre sur `:3000`. Login fonctionne contre le backend local. La page d'accueil s'affiche. RxDB s'initialise sans erreur.

## Étape 4 — Frontend mobile React Native

Dans `apps/mobile/` :

- Expo (managed workflow), TypeScript strict
- **expo-router** (file-based)
- **NativeWind** pour Tailwind sur RN
- **WatermelonDB** initialisé sur SQLite, schéma calqué sur la section 6 de la spec
- Écran de login basique branché au backend
- Écran d'accueil minimaliste : 1 gros bouton vert « Saisir une intervention » + 2 boutons secondaires « Mes parcelles », « SRPA aujourd'hui »
- Configurer **expo-camera** et **expo-location** (permissions déclarées)
- Mode hors ligne : tout doit fonctionner sans réseau ; un indicateur de sync en haut de l'écran (pastille verte/orange)

**Critère d'acceptation étape 4** : `pnpm --filter mobile dev` lance Expo, l'app démarre sur simulateur iOS et Android. Mode avion : login échoue gracieusement avec message clair, l'utilisateur peut quand même naviguer si déjà loggé localement.

## Étape 5 — Module M1 Parcellaire (premier vrai module métier)

Implémente M1 de bout en bout, c'est le plus important — toutes les autres briques en dépendent.

Backend :
- Endpoints CRUD `/parcelles`, scoped par tenant
- Géométrie en PostGIS (`Point`, `Polygon`)
- Endpoint `/parcelles/import-gis` qui accepte un GeoJSON (placeholder pour les imports cantonaux)
- Calcul du respect de l'assolement régulier en module domaine

Web et mobile :
- Liste des parcelles avec carte (Leaflet sur web, react-native-maps sur mobile)
- Création / édition d'une parcelle (nom, surface, zone agricole — ZA/ZP/ZM/ZE, géométrie)
- Tout fonctionne hors ligne (RxDB / WatermelonDB), sync au retour

**Critère d'acceptation étape 5** : créer une parcelle hors ligne sur mobile, fermer l'app, rouvrir, reconnecter — la parcelle apparaît côté web. Les calculs d'assolement passent les tests unitaires (au moins 5 cas dans `packages/domain/`).

## Étape 6 — Modules M2, M6, M16 (l'ordre de priorité critique)

Implémente dans l'ordre :
1. **M2 Carnet des champs** — saisie d'intervention mobile en moins de 30 secondes, catalogue produits (table `Produit` avec quelques exemples seed). Permet une saisie phyto + une saisie fumure.
2. **M6 Bons de commande + facturation groupée** — création d'un bon de travail, accumulation par client, vue « Bons de commande à facturer », bouton « Facturer le mois ». Pour la sync Odoo : crée un connecteur dans `packages/odoo-client/` qui sait au moins authentifier et créer une `sale.order` via XML-RPC. Si Odoo n'est pas accessible en dev, mocke avec une fausse instance JSON.
3. **M16 Lien partenaire** — voir section 11 de la spec. Génère le code d'exploitation, demande de lien, autorisations granulaires, workflow validation. Cette étape est cruciale, ne la bâcle pas.

**Critères d'acceptation étape 6** :
- Saisir une intervention phyto sur mobile en moins de 30 secondes (chrono manuel)
- Créer un bon de travail, l'envoyer côté Odoo (ou mock), voir la `sale.order` créée
- M16 : créer un lien entre 2 tenants, valider une intervention, voir l'écriture dans le carnet champs du client + la ligne dans le bon de commande de l'entrepreneur

## Conventions et règles globales

1. **Vocabulaire métier en français** dans toute l'UI : « semis », « épandage », « vêlage » — jamais « créer enregistrement », « valider transaction ».
2. **TypeScript strict** sans aucune exception — pas de `any`, utilise `unknown` et narrow.
3. **Tests** : chaque module backend a des tests unitaires sur la logique métier critique. Cible 70 % de couverture sur `packages/domain/` qui doit être 100 % testé.
4. **Pas de breaking changes** côté API REST sans incrémenter la version majeure.
5. **ADR obligatoire** pour toute décision technique structurante (choix de lib, pattern d'archi). Format MADR dans `docs/adr/`.
6. **Conventional commits** stricts.
7. **Branches** : `main` protégée, PR obligatoire, CI verte avant merge. Pas de force push.
8. **Sécurité** : aucun secret en dur. `.env.example` à jour, `.env` git-ignoré. Données sensibles chiffrées au repos.
9. **nLPD compliance** : tout endpoint qui touche à des données personnelles est documenté dans `docs/data-protection.md`.

## Comportement attendu

- **Pose des questions clarificatrices** uniquement si une ambiguïté bloque réellement la progression. Sinon, prends la décision la plus alignée avec la spec et documente-la dans un ADR.
- **Préfère les itérations courtes** : commits fréquents, chaque étape = une PR (même si tu travailles sur main en local, structure le travail comme si chaque étape était un PR review-able).
- **Privilégie la simplicité** sur la complexité, surtout côté UX — la promesse produit est qu'un agriculteur de 60 ans utilise l'app sans formation.
- **Documente** au fur et à mesure dans `docs/modules/M{n}.md` ce que tu implémentes et les choix faits.

## En cas de blocage

Si tu rencontres un problème technique majeur (lib non disponible, contrainte légale floue, choix architectural lourd), **arrête-toi** et expose-moi clairement :
1. Le problème
2. Les options envisagées avec leurs trade-offs
3. Ta recommandation argumentée

Je trancherai. Ne fais pas de choix structurants seul si tu n'es pas sûr.

## C'est parti

Commence par confirmer que tu as lu et compris la spec, puis attends mon « go » pour lancer l'étape 1.
