# ROADMAP.MD — PHASES DE DÉVELOPPEMENT NEWAGRIQDODO V2

**Date:** 2026-05-15  
**Horizon:** 12 semaines estimé  
**Statut:** DRAFT - À valider

---

## OVERVIEW PHASES

```
┌─────────────────────────────────────────────────────────┐
│ PHASE 0 (Sem 1): FONDATIONS + DESIGN                    │
├─────────────────────────────────────────────────────────┤
│ ✅ Setup infra, repo, auth, design wireframes           │
├─────────────────────────────────────────────────────────┤
│ PHASE 1 (Sem 2-3): COMPOSANTS CORE + CARTOGRAPHIE      │
├─────────────────────────────────────────────────────────┤
│ ✅ SearchBar, ViewSwitcher, MapView, AsideCard          │
├─────────────────────────────────────────────────────────┤
│ PHASE 2 (Sem 4-6): PARCELLAIRE BUSINESS LOGIC           │
├─────────────────────────────────────────────────────────┤
│ ✅ CRUD Parcelles, Carnet, Bilan Fumure MVP             │
├─────────────────────────────────────────────────────────┤
│ PHASE 3 (Sem 7-9): ODOO SYNC + ASSOLEMENT              │
├─────────────────────────────────────────────────────────┤
│ ✅ Webhooks Odoo, Synchronisation bidirectionnelle      │
│ ✅ Plan Assolement + carte dynamique                    │
├─────────────────────────────────────────────────────────┤
│ PHASE 4 (Sem 10-12): POLISH + ONBOARDING + ADD-ONS     │
├─────────────────────────────────────────────────────────┤
│ ✅ UX refinement, Onboarding guidé, Travaux, Troupeau   │
│ ✅ Perf optimization, Tests E2E, Déploiement production │
└─────────────────────────────────────────────────────────┘
```

---

## PHASE 0 (SEMAINES 1) — FONDATIONS + DESIGN

### Objectif
Poser les fondations : infra, auth, design validé.

### Tâches

**A) Infrastructure**
- [ ] Repo GitHub setup (branches main/develop/feature/*)
- [ ] Docker Compose (Node + PostgreSQL + Redis)
- [ ] Env vars (.env.example, secrets management)
- [ ] CI/CD pipeline (GitHub Actions basic)
- [ ] Database init (PostgreSQL + PostGIS extension)

**B) Backend foundation**
- [ ] Express server setup (TypeScript)
- [ ] Prisma init + schema DRAFT
- [ ] Auth middleware (JWT local)
- [ ] Multi-tenant middleware (farmId injection)
- [ ] Error handling + logging (Winston ou Pino)
- [ ] API versioning (`/api/v1/...`)

**C) Frontend foundation**
- [ ] React + Vite setup
- [ ] Tailwind + shadcn/ui init
- [ ] Router setup (React Router v6)
- [ ] State management (Zustand ou Redux)
- [ ] Component structure (`/src/components/...`)

**D) Design & Wireframes**
- [ ] **Agent Validation UI + Fabien** : créent wireframes HTML interactives :
  - SearchBar (mobile + desktop)
  - ViewSwitcher
  - MapView (fullscreen, buttons, aside)
  - AsideCard
  - ParameterPanel
  - Onboarding overlay examples
- [ ] Design tokens finalisés (couleurs, spacing, fonts)
- [ ] Accessibility checklist (WCAG AA)

**E) Prisma schema**
- [ ] Agent Spec & Docs : finalise PRISMA.md complètement
- [ ] Core models : User, Farm, UserFarm, Parcel
- [ ] Indexes + constraints validés

### Deliverables
- Repo push-ready (main/develop branches)
- Docker Compose working locally
- Wireframes HTML interactives validées
- PRISMA.md finalisé
- Figma/design tokens documentés

### Success Criteria
- ✅ `npm install && docker-compose up` = working dev environment
- ✅ Wireframes match Fabien vision
- ✅ Zero technical debt de base

---

## PHASE 1 (SEMAINES 2-3) — COMPOSANTS CORE + CARTOGRAPHIE

### Objectif
Construire les briques réutilisables : recherche, vues, carte, aside.

### Tâches

**A) SearchBar composant**
- [ ] Agent Dev : React SearchBar.tsx
  - Input texte + icon filtre
  - Dropdown filtres dynamiques (apparaissent seulement si data)
  - Favorite filters (localStorage)
  - Mobile responsive (icon-only XS)
- [ ] Agent Validation UI : teste visual + mobile touch
- [ ] Hook useSearchFilters (Zustand store)
- [ ] Unit tests (Vitest)
- [ ] API backend : `GET /api/v1/farms/{farmId}/parcels?search=...&filters=...`

**B) ViewSwitcher composant**
- [ ] Icons : 📋 📊 🎯 🗺️ 📅
- [ ] State persistence (localStorage)
- [ ] Smooth transitions
- [ ] Keyboard accessible (arrow keys)
- [ ] Mobile responsive

**C) MapView composant (KEY)**
- [ ] Maplibre GL integration
- [ ] Satellite tiles (OSM or Mapbox)
- [ ] Parcel rendering (GeoJSON polygons)
- [ ] Color scheme (saturated, high contrast)
- [ ] Click select parcel
- [ ] Zoom to feature
- [ ] Mobile fullscreen, desktop aside layout
- [ ] Touch interactions (pinch zoom, drag pan)
- [ ] Responsive
- [ ] Agent Validation UI : perf test (map load < 2s)

**D) AsideCard composant**
- [ ] Detail panel (parcel/intervention/animal)
- [ ] Edit/delete actions
- [ ] Responsive (side on desktop, bottom sheet on mobile)
- [ ] Scroll internal si contenu long

**E) MapView FloatingBar**
- [ ] SearchBar + ViewSwitcher floating above map
- [ ] z-index=100
- [ ] Responsive (full width XS, partial width SM+)

### APIs à implémenter
```
GET /api/v1/farms/{farmId}/parcels           → list + filters
POST /api/v1/farms/{farmId}/parcels          → create
GET /api/v1/farms/{farmId}/parcels/{id}     → detail
PUT /api/v1/farms/{farmId}/parcels/{id}     → update
DELETE /api/v1/farms/{farmId}/parcels/{id}  → delete

GET /api/v1/farms/{farmId}/cultures         → list (cached)
```

### Deliverables
- SearchBar + ViewSwitcher + MapView + AsideCard composants
- Fonctionnels + testés + accessible
- Performance baseline (Core Web Vitals)

### Success Criteria
- ✅ SearchBar filtre dynamique OK (affiche seulement si data)
- ✅ MapView load < 2s (mobile 3G), satellite défaut
- ✅ AsideCard smooth animations
- ✅ Mobile fullscreen, desktop layout OK
- ✅ Zero accessibility violations (WCAG AA)

---

## PHASE 2 (SEMAINES 4-6) — PARCELLAIRE BUSINESS LOGIC

### Objectif
Implémenter la logique métier core : parcelles, carnet, bilan fumure.

### Tâches

**A) Parcel CRUD complet**
- [ ] Create parcel (geometry drawing on map)
- [ ] Edit parcel (name, surface, notes, access info)
- [ ] Delete parcel (soft delete)
- [ ] Points of interest (borne, regard, piquet)
- [ ] Photos/attachments (v2+)
- [ ] API + UI + validation
- [ ] Cadastre number lookup (intégration suisse)

**B) Carnet d'interventions (Interventions)**
- [ ] Create intervention (date, type, parcelle, culture)
- [ ] **BIMODAL QUANTITY**:
  - Input kilo OU kilo/hectare
  - Auto-calcul total = kilo/ha × parcel_surface
  - Display both values
  - Conversion accuracy < 0.01%
- [ ] Phyto product selection
- [ ] **AUTO ALERT délai d'attente** :
  - Select product → affiche alert
  - Adapt délai selon programme (SRPA, SST, Swiss Gap)
  - Display "Date récolte possible: XX"
- [ ] List + filters
- [ ] Delete

**C) Bilan de Fumure (Nitrogen, Phosphor, Potassium)**
- [ ] Calculator backend (business logic)
  - Input : interventions, animals, cultures
  - Output : apport, export, bilan, status (vert/orange/rouge)
- [ ] Dashboard accueil (3 tuiles N, P, K)
- [ ] Detail view (cliquable tuile)
- [ ] Export PDF rapport annuel
- [ ] Agent Agronome : valide calculs OEngrais v2024
- [ ] Tests : scenarios réalistes (colza SRPA, blé SST, etc.)

**D) Vues complètes**
- [ ] Vue Liste (table scrollable, colonnes param)
- [ ] Vue Grille (3-col cards)
- [ ] Vue Kanban (colonnes par statut)
- [ ] Vue Calendrier (timeline interventions)
- [ ] Chaque vue queryable + filtrable

**E) Onboarding system**
- [ ] Modal onboarding step-by-step (créer parcelle, intervalle, etc.)
- [ ] Overlay pointers (highlight element + instruction)
- [ ] Skip/Finish button
- [ ] "Rappeler onboarding" dans paramètres
- [ ] User preference (dismissed_at timestamp)
- [ ] Mobile-friendly (fullscreen, readable)

### APIs à implémenter
```
INTERVENTION:
GET /api/v1/farms/{farmId}/interventions
POST /api/v1/farms/{farmId}/interventions
PUT /api/v1/farms/{farmId}/interventions/{id}
DELETE /api/v1/farms/{farmId}/interventions/{id}

BALANCE:
GET /api/v1/farms/{farmId}/fertilizer-balance/{year}
POST /api/v1/farms/{farmId}/fertilizer-balance/{year}/recalculate

CULTURES:
GET /api/v1/farms/{farmId}/cultures (avec filter/search)

PHYTO PRODUCTS:
GET /api/v1/farms/{farmId}/phyto-products
GET /api/v1/farms/{farmId}/phyto-products/{id}/delai-attente?program=SRPA
```

### Deliverables
- Parcellaire module 80% feature-complete
- Bilan fumure MVP
- Onboarding guidé working
- Vues multiples fonctionnelles

### Success Criteria
- ✅ Bimodal quantity conversion < 0.01% erreur
- ✅ Bilan fumure calcul = OEngrais (Agent Agronome sign-off)
- ✅ Délai d'attente alert OK
- ✅ Onboarding UX simple (agriculteur sans formation peut utiliser)
- ✅ Performance : API < 200ms, React render < 16ms

---

## PHASE 3 (SEMAINES 7-9) — ODOO SYNC + ASSOLEMENT

### Objectif
Intégrer Odoo bidirectionnelle + planning assolement.

### Tâches

**A) Odoo API setup**
- [ ] Agent Sync Odoo : REST API Odoo connection (auth, endpoints)
- [ ] Initial sync : pull cultures (articles), produits phyto
- [ ] Mapping logic : Odoo article → NewagriQodo culture
- [ ] Store `odooArticleId`, `odooProductId` lokalement

**B) Webhooks Odoo**
- [ ] Agent Sync Odoo : setup webhook listener
  - `POST /webhooks/odoo/culture-updated`
  - `POST /webhooks/odoo/product-updated`
- [ ] Signature validation (HMAC-SHA256)
- [ ] Job queue (Bull) + retry logic
- [ ] Idempotency (upsert local)
- [ ] Audit log (OdooSyncLog)

**C) Phyto products sync**
- [ ] Pull délai d'attente from Odoo
- [ ] Handle `delai_srpa`, `delai_swiss_gap` fields
- [ ] Update alerts dynamiquement
- [ ] Agent Validation UI : test alert display

**D) Plan d'Assolement (NEW)**
- [ ] Timeline UI (parcelles × mois × années)
- [ ] Drag-drop culture sur parcelle × period
- [ ] Multi-year navigation
- [ ] Save/update assolement plan
- [ ] API CRUD

**E) Carte couleurs dynamiques**
- [ ] Intégration plan assolement + carte
- [ ] Parcelles colorées selon culture à date courante
- [ ] Navigation temporelle change colors
- [ ] Agent Validation UI : test visual + perf

**F) Odoo master data**
- [ ] Ensure ZERO modifications Odoo (verify!)
- [ ] Document Odoo setup (fields custom nécessaires)
- [ ] Test bidirectional sync scenarios

### APIs à implémenter
```
ASSOLEMENT:
GET /api/v1/farms/{farmId}/assolement-plans/{year}
POST /api/v1/farms/{farmId}/assolement-plans
PUT /api/v1/farms/{farmId}/assolement-plans/{id}

SYNC:
POST /webhooks/odoo/culture-updated
POST /webhooks/odoo/product-updated
GET /api/v1/farms/{farmId}/sync-status
```

### Deliverables
- Odoo bidirectional sync working
- Plan assolement module
- Carte avec couleurs dynamiques
- Webhooks + retry logic robust

### Success Criteria
- ✅ Webhook 99.5% success rate
- ✅ Sync < 5s end-to-end
- ✅ Zero Odoo modifications (zéro change detected in Odoo)
- ✅ Assolement colors change smoothly

---

## PHASE 4 (SEMAINES 10-12) — POLISH + ONBOARDING + ADD-ONS

### Objectif
Finir MVP + modules add-on + déployer production.

### Tâches

**A) Polish & UX**
- [ ] ParameterPanel refonte (Odoo-like sidebar nav)
- [ ] Farm infos : numéro cantonal, programmes SRPA/SST/Bio
- [ ] Edit programs → délais d'attente update auto
- [ ] Mobile fullscreen map default
- [ ] Responsive all views (XS, SM, MD, LG)
- [ ] Accessibility pass (WCAG AA full audit)

**B) Onboarding finalisé**
- [ ] Step 1: Créer exploitation (numéro cantonal, programmes)
- [ ] Step 2: Créer première parcelle
- [ ] Step 3: Ajouter intervention
- [ ] Step 4: Voir bilan fumure
- [ ] Animations smooth
- [ ] Mobile-friendly
- [ ] "Rappeler" button dans settings

**C) User roles & permissions**
- [ ] Role model : Admin, Editor, Viewer
- [ ] Admin : full access + user management
- [ ] Editor : create/edit/delete own data
- [ ] Viewer : read-only
- [ ] API checks (farmId + role)
- [ ] UI hiding actions user can't do

**D) Perf optimization**
- [ ] Bundle splitting (routes, modals)
- [ ] Lazy load images
- [ ] Cache HTTP headers (24h cultures, 5min parcels)
- [ ] Database indexes (farm_id, parcel_id, date)
- [ ] Lighthouse 90+ on all pages

**E) Module Travaux Agricoles**
- [ ] Create/edit work orders
- [ ] Client selection (Odoo partners)
- [ ] Status tracking
- [ ] Invoicing integration (Codomaster)
- [ ] API + UI

**F) Module Troupeau**
- [ ] Create/edit animals
- [ ] Breeds, types
- [ ] Entry/exit/death tracking
- [ ] Intégration bilan fumure
- [ ] API + UI

**G) Testing**
- [ ] Unit tests : Jest backend (80%+ coverage)
- [ ] Integration tests : Jest + test DB
- [ ] E2E tests : Cypress (user flows)
- [ ] Visual regressions : Percy ou snapshots
- [ ] Load test : k6 (100 req/s minimum)

**H) Documentation**
- [ ] API docs (Swagger/OpenAPI)
- [ ] Onboarding guide (for farmers)
- [ ] Admin guide (user management)
- [ ] Setup Odoo document
- [ ] Troubleshooting guide

**I) Deployment**
- [ ] Production Docker image
- [ ] Environment variables all set
- [ ] Database backup strategy
- [ ] Monitoring setup (Sentry, New Relic)
- [ ] Deployment checklist
- [ ] Blue-green deployment (if possible)

### Deliverables
- MVP v2 production-ready
- Travaux + Troupeau modules
- Full testing coverage
- Documentation complete

### Success Criteria
- ✅ All Phase 2-4 features = working + tested
- ✅ Lighthouse 90+
- ✅ Zero critical bugs
- ✅ Onboarding UX : farmers can use without training
- ✅ Accessible WCAG AA
- ✅ Load tested 100 req/s
- ✅ Deployed production

---

## POST-MVP (PHASE 5+)

### Nice-to-have features (après v2.0)
- [ ] Offline mode (Service Worker + IndexedDB)
- [ ] Native mobile apps (React Native)
- [ ] Notifications (email alerts délai attente)
- [ ] Analytics (Posthog)
- [ ] Multi-language (FR/DE/IT)
- [ ] API docs + public API (SaaS integration)
- [ ] Advanced forecasting (machine learning pour yields)
- [ ] Drone/satellite data integration
- [ ] GDPR compliance (data export, delete)
- [ ] Team collaboration (shared notes, assignments)

---

## DEPENDENCIES ENTRE PHASES

```
Phase 0 ──→ Phase 1 (infra ready)
           ├→ Phase 2 (composants core ready)
           │  ├→ Phase 3 (parcellaire ready)
           │  │  └→ Phase 4 (everything ready)
           │  │
           │  └─→ Phase 4 (can start travaux + troupeau parallel)

Phase 1 & 2 : pas dependent, might be parallel sur Agent Dev
Phase 2 & 3 : phase 3 need parcellaire done (data model)
Phase 3 & 4 : can be parallel (Polish != Async features)
```

---

## TESTING STRATEGY BY PHASE

| Phase | Frontend | Backend | E2E |
|-------|----------|---------|-----|
| 0 | - | - | - |
| 1 | Vitest (components) | Jest (utils) | - |
| 2 | Vitest 80%+ | Jest 80%+ | Cypress (basic flows) |
| 3 | Vitest 85%+ | Jest 85%+ | Cypress (sync flows) |
| 4 | Vitest 85%+ | Jest 85%+ | Cypress full (all flows) |
| | Percy (visual) | k6 (load) | - |

---

**FIN ROADMAP.md**

Timeline aggressive mais realistic avec 5 agents working in parallel.
