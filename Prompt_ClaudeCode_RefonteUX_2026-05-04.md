# Prompt Claude Code — Refonte UX Agri Qodo (mai 2026)

> À coller tel quel dans Claude Code (mode développeur) au lancement d'une nouvelle session sur le repo `agri-qodo`.

---

## Contexte (à lire avant tout)

Tu travailles sur le repo **agri-qodo** (https://github.com/fabiencossy/agri-qodo, AGPL-3.0).
Local : `/Users/fabiencossy/Documents/agri-qodo`.
Stack : Turborepo + pnpm workspaces, NestJS + Prisma + Postgres 16/PostGIS + Redis + BullMQ, Next.js 15 (App Router) + Tailwind + shadcn/ui + RxDB, React Native + Expo (mobile, hors scope sauf si explicitement demandé).
Prod live depuis 2026-04-30 sur https://newagri.qodo.ch (frontend Vercel) + https://api.newagri.qodo.ch (backend VPS Infomaniak Genève, 83.228.247.77).

**État courant** : la branche `feat/pages-legales-cgu` est en cours sur la PR-F (pages légales + CGU). Cette refonte UX est un chantier **séparé**, à mener sur 6 nouvelles branches indépendantes après merge de la PR-F (ou en parallèle si tu rebases).

### Règles dures non-négociables

À respecter sur **chaque PR**, sans exception :

1. **JAMAIS de push direct sur `main`** — toujours via PR + review.
2. **Branche par feature**, format `feat/...` ou `fix/...`. Une PR = un scope cohérent.
3. **Connection Odoo per-tenant** : `@agri-qodo/odoo-client` est une fabrique, pas un singleton. Pas de `ODOO_URL` globale. Credentials chiffrés AES-256-GCM par tenant.
4. **Multi-version Odoo** (v19/v20/v21+) via `version-adapter.ts`. Pas de hard-code de version.
5. **Workspace packages backend = CommonJS + Node**. Si tu ajoutes un package partagé, vérifier les 3 `COPY` du Dockerfile.
6. **Toute nouvelle env var** doit être ajoutée **simultanément** dans `env.schema.ts`, `.env.production.example` et `docker-compose.prod.yml`.
7. **`.env` gitignored** ≠ `.env.example` committé (vide).
8. **Pas de violet dans l'UI** — palette terre/foin (amber).
9. **Saisie HHMM qodo-clock** : tout champ heures accepte `720` = 7h20, `7.5` = 7h30. Composant déjà existant à réutiliser.
10. **CSV export** : helper existant avec BOM UTF-8 + `;` (compat Excel CH/FR). Ne pas réinventer.
11. **Postgres user prod = `agriqodo`** (pas `postgres`).
12. **Endpoint health = `/health`** (pas `/api/health`).
13. **Header AGPL-3.0** en tête de tout nouveau fichier source.

### Architecture Intervention/Travail (cas A/B/C)

À respecter pour le mapping Odoo dans les PRs G2, G4 et G6 :

- **Cas A** — sur ma parcelle → saisie Intervention, carnet SELF, pas d'Odoo.
- **Cas B** — sur parcelle partenaire → saisie Intervention, carnet client (PENDING), Travail + sale.order brouillon Odoo.
- **Cas C** — hors parcelle → saisie Travail, pas de carnet, sale.order Odoo si client.

Modèle `Materiel` = catalogue ETA suisse, mappé Odoo `product.product type=service`. `Intervention.linkedTravailId` (1-1).

### Comptes seed pour test

- `demo@demo.ch` / `demo` — EMPLOYE, tenant `AQ-VD-DEMO-PUBLIC` (10 parcelles Bottens, ~435 animaux, 6 travaux). **À utiliser pour valider chaque PR.**
- `admin@admin.ch` / `admin` — Admin OWNER (vide).
- `marie@ferme-rolet.test` / `DemoPassword123!` — OWNER vide.

---

## Découpage en 6 PR

Refonte issue d'une revue terrain Fabien (2026-05-04). Chaque PR est indépendante et mergeable séparément. Ordre conseillé : **G1 → G2 → G3 → G4 → G5 → G6**.

---

### PR-G1 — Renommage global "Prestation → Travail pour tiers" + iconographie tracteur

**Branche** : `feat/refonte-naming-icones-travaux-tiers`

**Objectif** : aligner la terminologie sur le vocabulaire métier agricole suisse. "Prestation" est trop abstrait, "Travail pour tiers" est le terme officiel utilisé dans la facturation ETA (entrepreneurs de travaux agricoles).

**Tâches** :

1. Remplacer le texte **"Prestation"** par **"Travail pour tiers"** (singulier) et **"Prestations"** par **"Travaux pour tiers"** (pluriel) sur tous les écrans web. Inclure :
   - Onglets Activités (`apps/web/app/(authenticated)/activites/...`)
   - Modal FAB "Que veux-tu saisir ?" — bouton "Saisir une prestation" → "Saisir un travail pour tiers"
   - Headers de page (`/activites` onglet "Prestations" → "Travaux pour tiers")
   - Labels de formulaires, badges, statuts
   - Notifications/toasts
   - Emails transactionnels (si touchés)
2. Remplacer **toutes les icônes** "valise" / `Briefcase` / `Clipboard` actuellement utilisées pour les prestations par l'icône Lucide **`Tractor`**. Si la version de `lucide-react` installée ne contient pas `Tractor` (intro v0.408 environ), bumper le package. Vérifier dans `apps/web/package.json` et `packages/ui/package.json` (ou équivalent).
3. Remplacer le **logo dans le header** Agri Qodo (actuellement icône Sprout/feuille verte à côté du texte "Agri Qodo") par l'icône Lucide **`Tractor`** (toujours en vert primary).
4. Garder les **routes URL inchangées** pour ne pas casser les liens existants : `/activites?tab=prestations` peut rester, seul le label affiché change. (Sinon prévoir une redirection 301.)
5. Migration de données : aucune (changement purement UI).
6. i18n : si une clé `prestation` / `prestations` existe dans les fichiers de traduction (FR/DE), modifier la valeur (pas la clé, pour limiter le diff).

**Fichiers probables à toucher** :
- `apps/web/components/layout/Header.tsx` (logo)
- `apps/web/app/(authenticated)/activites/page.tsx`
- `apps/web/components/activites/PrestationCard.tsx` → renommer `TravailTierCard.tsx` si symbole exporté
- Modal FAB : `apps/web/components/fab/FabModal.tsx` ou similaire
- Locales : `apps/web/locales/fr.json` (si i18n présent)
- Tous les imports `import { Briefcase } from 'lucide-react'` → `import { Tractor } from 'lucide-react'` (sur les usages liés aux travaux pour tiers, **pas** sur les autres usages éventuels de Briefcase)

**Critères d'acceptation** :
- [ ] Aucune occurrence de "prestation" / "Prestation" visible dans l'UI web (sauf URL routes inchangées).
- [ ] Logo header = tracteur Lucide vert primary.
- [ ] Toutes les cartes/listes de travaux tiers affichent l'icône tracteur.
- [ ] `pnpm typecheck` + `pnpm lint` + `pnpm build` passent.
- [ ] Test visuel sur les comptes `demo@demo.ch` et `admin@admin.ch`.

---

### PR-G2 — Parcelles : vue Carte par défaut, GPS Google Maps, FAB pré-rempli

**Branche** : `feat/parcelles-carte-default-gps-fab`

**Objectif** : rendre l'écran "Mes parcelles" plus visuel par défaut, donner un accès direct à la navigation routière vers chaque parcelle, et fluidifier la saisie d'interventions/travaux contextuels.

**Tâches** :

1. **Inverser le défaut Liste/Carte** sur `/parcelles` : **vue Carte par défaut**. Le toggle Liste/Carte reste visible. Persister le dernier choix utilisateur en `localStorage` clé `agriqodo:parcelles:view` (`carte` | `liste`). Première visite : carte.
2. **Header de la fiche parcelle** : ajouter un bouton "📍 Itinéraire" qui ouvre Google Maps dans un nouvel onglet avec les coordonnées du **centroïde de la parcelle** (calculé depuis `Parcelle.geom` via PostGIS `ST_Centroid`). URL pattern : `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`. Utiliser `target="_blank" rel="noopener noreferrer"`.
   - Si `Parcelle.geom` est null (parcelle sans contour tracé), masquer le bouton.
   - Backend : exposer `lat` / `lng` du centroïde dans `GET /api/parcelles/:id` (champ calculé, pas stocké).
3. **FAB de la fiche parcelle** (`/parcelles/:id`) : transformer le bouton "+" actuel en menu avec deux options :
   - "Nouvelle intervention" (cas A — sur ma parcelle, pré-remplir `parcelleId`)
   - "Nouveau travail pour tiers" (cas B/C, pré-remplir `parcelleId`)
   Les deux flows doivent **pré-remplir la parcelle** dans le formulaire (champ initialisé, modifiable).
4. **FAB de la liste/carte parcelles** (`/parcelles`) : au clic, ouvrir directement le formulaire "Nouvelle parcelle" (comportement actuel — pas de changement).
5. **Modal FAB global "Que veux-tu saisir ?"** : optionnellement, ajouter une étape de sélection de parcelle quand on clique "Travail pour tiers" depuis l'accueil (pas obligatoire si compliqué).

**Fichiers probables à toucher** :
- `apps/web/app/(authenticated)/parcelles/page.tsx` (toggle défaut + localStorage)
- `apps/web/app/(authenticated)/parcelles/[id]/page.tsx` (header GPS + FAB menu)
- `apps/web/components/parcelles/ParcelleHeader.tsx`
- `apps/web/components/fab/ParcelleFab.tsx` (nouveau ou refactor)
- `apps/api/src/parcelles/parcelles.controller.ts` (centroïde dans réponse)
- `apps/api/src/parcelles/parcelles.service.ts` (`ST_Centroid` Prisma raw)

**Critères d'acceptation** :
- [ ] Première visite `/parcelles` → vue Carte affichée.
- [ ] Toggle Liste persiste après rechargement.
- [ ] Sur la fiche `Champ Bénézit` (compte demo), bouton Itinéraire visible et ouvre Google Maps centré sur la parcelle.
- [ ] FAB sur fiche parcelle propose 2 options.
- [ ] Saisie d'intervention depuis FAB fiche parcelle → champ Parcelle = "Champ Bénézit" pré-rempli.
- [ ] Tests existants passent.

---

### PR-G3 — Carnet des champs : vue Liste, recherche, fix filtres mobile

**Branche** : `feat/carnet-champs-vue-liste-recherche`

**Objectif** : aligner le carnet des champs sur le pattern Liste/Carte des autres ressources et corriger un bug bloquant sur mobile.

**Tâches** :

1. **Ajouter une vue Liste** sur `/carnet-des-champs` (actuellement seulement carte/feed). Toggle Liste / Carte (icônes shadcn). Default = Liste si bureau, Carte si mobile (auto-default mobile, pattern déjà présent ailleurs — cf. PR #92 `ResourceView` mode "card").
2. **Ajouter une barre de recherche** plein-texte qui filtre sur : titre intervention, parcelle, culture, type d'intervention, produits utilisés. Debounce 300ms. Réutiliser le composant `<SearchBar>` existant si présent (cf. activités).
3. **Fix bug filtres mobile** : sur mobile, le bouton "ouvrir les filtres" du carnet ne fonctionne pas correctement (modal ne s'ouvre pas ou s'ouvre derrière le drawer). Diagnostiquer — probablement un conflit z-index avec le drawer (drawer = 9100, vérifier que la modal filtres > 9100, ou utiliser un portal différent).
4. **Pattern unifié** : si `<ResourceView>` (PR #92) gère déjà liste/carte/recherche/filtres, brancher le carnet dessus plutôt que dupliquer.

**Fichiers probables à toucher** :
- `apps/web/app/(authenticated)/carnet-des-champs/page.tsx`
- `apps/web/components/carnet/CarnetList.tsx` (nouveau)
- `apps/web/components/carnet/CarnetSearchBar.tsx` (nouveau ou réutilisation)
- `apps/web/components/filters/FiltersModal.tsx` (fix z-index)
- API : `GET /api/interventions?search=...` si pas déjà supporté

**Critères d'acceptation** :
- [ ] Toggle Liste/Carte visible et fonctionnel.
- [ ] Recherche "fumure" affiche la fumure organique du Champ Bénézit.
- [ ] Sur Safari mobile (iPhone), bouton filtres ouvre la modal correctement.
- [ ] Default mobile = carte, default desktop = liste.

---

### PR-G4 — Travaux pour tiers : vue Planning Kanban + édition post-saisie

**Branche** : `feat/travaux-tiers-planning-kanban-edition`

**Objectif** : transformer l'onglet Travaux pour tiers en outil de planification quotidienne pour entrepreneurs ETA, et permettre l'édition de toute saisie après création.

**Tâches** :

1. **Vue Planning Kanban** sur `/activites` onglet Travaux pour tiers :
   - Nouvelle vue accessible via le toggle de vues (Liste / Cards / Planning).
   - **Colonnes par défaut = par date** : `À planifier` (sans date) | `Aujourd'hui` | `Demain` | `J+2` | `J+3` | … | `J+7`. Au-delà de J+7 : colonne `Plus tard`.
   - Sélecteur **"Regrouper par"** : `Date` (défaut) / `Statut` (Brouillon, Validé, Facturé) / `Parcelle` / `Client`. Le choix change les colonnes affichées.
   - Drag & drop d'une carte d'une colonne à une autre = update du champ correspondant en base (date / statut / parcelle / client).
   - Carte Kanban affiche : titre, client, parcelle, durée, montant CHF, badge statut, icône matériel principal.
   - Sur clic carte : ouvre le détail du travail pour édition.
2. **Édition post-saisie généralisée** :
   - Toute Intervention et tout Travail doit être **éditable après validation** (pas seulement à l'état brouillon).
   - Permissions :
     - OWNER peut tout éditer.
     - EMPLOYE peut éditer ses propres saisies + (cas B) celles saisies par un tiers sur ses parcelles.
     - Partenaire externe (cas B) peut éditer ses propres saisies tant que pas validées par le propriétaire.
   - Audit trail : créer une table `EditHistory` (`id`, `entityType`, `entityId`, `userId`, `tenantId`, `fieldName`, `oldValue`, `newValue`, `editedAt`) pour conformité LPD/nFADP. Migration Prisma.
   - UI : bouton "Modifier" visible sur la fiche détail, ouvre le formulaire en mode édition (pas un nouveau formulaire).
3. **Visibilité accrue cas B** sur la fiche parcelle :
   - Distinguer visuellement les interventions saisies par un tiers (cas B) — badge "Saisie par [Nom du partenaire]" + couleur de bordure différente (amber, pas violet).
   - Boutons Modifier / Supprimer accessibles côté propriétaire de la parcelle.

**Fichiers probables à toucher** :
- `apps/web/app/(authenticated)/activites/page.tsx`
- `apps/web/components/activites/PlanningKanban.tsx` (nouveau)
- `apps/web/components/activites/KanbanCard.tsx` (nouveau)
- `apps/web/components/activites/KanbanGroupSelector.tsx` (nouveau)
- `apps/web/components/travaux/TravailEditForm.tsx`
- `apps/api/src/travaux/travaux.controller.ts` (PATCH endpoint si pas permissif)
- `apps/api/src/intervention/intervention.controller.ts` (PATCH idem)
- `apps/api/prisma/schema.prisma` (table `EditHistory`)
- Migration : `prisma/migrations/YYYYMMDD_add_edit_history/migration.sql`

**Critères d'acceptation** :
- [ ] Onglet Travaux pour tiers propose la vue Planning.
- [ ] Drag & drop d'une carte de "Aujourd'hui" à "Demain" → date du travail mise à jour en DB.
- [ ] Sélecteur "Regrouper par" → Statut affiche colonnes Brouillon / Validé / Facturé.
- [ ] Travail validé peut être édité (champs déverrouillés en mode édition).
- [ ] Modification d'un travail crée une ligne dans `EditHistory`.
- [ ] Sur fiche parcelle, intervention cas B affiche badge "Saisie par X".

---

### PR-G5 — Présences : refonte UX qodo-clock

**Branche** : `feat/presences-refonte-qodo-clock`

**Objectif** : simplifier radicalement l'écran Présences. Aligner sur l'UX qodo-clock (déjà éprouvée et appréciée).

**Tâches** :

1. **Supprimer** la grille "Type de présence" (Chantier/Déplacement/Repas/Pause/Bureau/Autre) de l'écran principal. Le type sera déduit du contexte (prestation liée) ou laissé optionnel en édition avancée.
2. **Nouvelle UI** sur `/presences` :
   - Un seul **gros bouton Play** (vert primary, large, centré, icône Lucide `Play` ou `Tractor`).
   - Au clic Play : démarrage immédiat du pointage (entrée). Bouton devient **Stop** (rouge).
   - Au clic Stop : enregistre la présence (heure début = clic Play, heure fin = clic Stop).
   - Sous le bouton, **3 champs éditables** : Date / Heure de début / Heure de fin. Tous en saisie HHMM qodo-clock (composant existant). Champs pré-remplis avec les valeurs du pointage en cours, modifiables avant le Stop.
   - Sélecteur "Travail pour tiers lié (optionnel)" reste, en dessous des 3 champs.
3. **Reprendre exactement le composant Timer de qodo-clock** : si publié dans un package partagé, l'importer ; sinon dupliquer le code source en respectant la même UX (animation, typographie, couleurs accent).
4. **Édition post-saisie** : appliquer la règle PR-G4 — toute présence est éditable après création.

**Fichiers probables à toucher** :
- `apps/web/app/(authenticated)/presences/page.tsx` (refonte complète)
- `apps/web/components/presences/PresenceTimer.tsx` (nouveau ou import qodo-clock)
- Suppression : `apps/web/components/presences/TypePresenceGrid.tsx` (si existe)
- Migration Prisma : si le champ `Presence.type` devient optionnel, adapter le schéma

**Critères d'acceptation** :
- [ ] Écran `/presences` n'affiche plus la grille de types.
- [ ] Bouton Play unique fonctionnel : Play → Stop → enregistré.
- [ ] Champs Date/Début/Fin éditables avant Stop.
- [ ] Saisie HHMM `720` = 7h20 fonctionne.
- [ ] Présence créée éditable après coup.
- [ ] UX visuellement comparable à qodo-clock (à valider sur screenshot).

---

### PR-G6 — Mapping Odoo Field Service Management (FSM)

**Branche** : `feat/odoo-fsm-mapping`

**Objectif** : étendre le mapping Odoo pour pousser les travaux pour tiers dans **Field Service** (`industry.fsm.task`) en plus du `sale.order` actuel, selon la nature des produits saisis.

**Tâches** :

1. **Ajout du connecteur FSM** dans `@agri-qodo/odoo-client` :
   - Méthodes : `createFsmTask`, `updateFsmTask`, `linkFsmTaskToSaleOrder`.
   - Modèle Odoo cible : `industry.fsm.task` (Field Service module Enterprise).
   - Vérifier que le tenant a le module FSM installé avant de tenter (sinon fallback graceful : log warning + skip FSM, garder le sale.order).
2. **Logique de routage** lors du push d'un Travail :
   - Pour chaque ligne produit du travail :
     - Si `product.product.type = 'consu'` ou `'product'` (= **bien**) → ajouter à la `industry.fsm.task` **ET** à la `sale.order`.
     - Si `product.product.type = 'service'` → ajouter à la `sale.order` uniquement.
   - Donc : 1 sale.order toujours créé + 1 industry.fsm.task **si au moins un produit bien**. Lien bidirectionnel via `sale_order_id` sur la fsm.task.
3. **UI Agri Qodo** : pas de changement dans le formulaire — l'agriculteur saisit indifféremment biens et services dans le même flow. La distinction se fait **côté backend** au moment du push Odoo.
4. **Multi-version Odoo** : utiliser `version-adapter.ts` pour gérer les variations de champs FSM entre v19/v20/v21+ (ex : `industry.fsm.task` était `project.task` avec `is_fsm=True` dans v17, à vérifier sur les versions cibles).
5. **Tests d'intégration** sur le mapping (mock Odoo) :
   - Travail avec 2 biens + 1 service → 1 sale.order avec 3 lignes + 1 fsm.task avec 2 lignes.
   - Travail avec 0 bien → 1 sale.order seulement, 0 fsm.task.
   - Travail avec 0 service → 1 sale.order avec biens + 1 fsm.task avec biens.
   - Tenant sans FSM installé → 1 sale.order, fallback gracieux, log warning.

**Fichiers probables à toucher** :
- `packages/odoo-client/src/fsm.ts` (nouveau)
- `packages/odoo-client/src/version-adapter.ts` (étendre pour FSM)
- `apps/api/src/travaux/travaux.service.ts` (logique de routage push)
- `apps/api/src/travaux/__tests__/push-odoo.spec.ts` (tests intégration)
- `packages/odoo-client/src/index.ts` (exports)
- Documentation : `docs/odoo-mapping.md` mise à jour

**Critères d'acceptation** :
- [ ] Push d'un travail avec biens + services crée 1 sale.order + 1 fsm.task.
- [ ] Push d'un travail full-service crée 1 sale.order + 0 fsm.task.
- [ ] Tenant sans FSM installé : push ne crash pas, log warning, sale.order créé normalement.
- [ ] Tests intégration verts sur Odoo v19 mock + v20 mock.
- [ ] Doc à jour.

---

## Backlog futur (PAS dans cette refonte)

À noter pour plus tard, **ne pas implémenter** dans ces 6 PR :

- **Couleur "flashy" sur les parcelles dans la vue Assolement** : à implémenter quand le module `/assolement/{annee}` sera développé (cf. backlog non-mois "plan d'assolement spatial" + "Intervention.geom Polygon? trou bloquant"). Couleur saturée par culture/campagne pour visualisation rapide.
- **Annuaire partenaires** (recherche nom+adresse style Facebook).
- **i18n DE** (Mois 2).
- **Audit logs** complets LPD/nFADP (Mois 2 — partiellement amorcé via `EditHistory` PR-G4).

---

## Workflow de livraison

Pour **chaque** PR :

1. `git checkout main && git pull`
2. `git checkout -b feat/...` (nom de branche indiqué dans la PR).
3. Implémenter les tâches.
4. `pnpm typecheck && pnpm lint && pnpm test && pnpm build` doivent passer.
5. Test manuel sur compte `demo@demo.ch` (parcelles Bottens, ~435 animaux, 6 travaux).
6. Commits : messages conventionnels (`feat: ...`, `fix: ...`).
7. `git push origin feat/...`
8. Ouvrir PR sur GitHub avec description du scope, captures avant/après si UX, checklist des critères d'acceptation.
9. **Ne pas merger sans review.** Pas de push direct sur `main`.
10. Une fois mergée :
    - Vercel rebuild auto le frontend.
    - Backend à redéployer manuellement via SSH :
      ```bash
      ssh ubuntu@83.228.247.77
      cd /opt/agri-qodo && git pull
      docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build backend
      ```
    - Migrations Prisma : appliquées **automatiquement** au démarrage du container.
    - Vérifier `curl https://api.newagri.qodo.ch/health` après redéploiement.

Bon courage.
