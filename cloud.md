# CLOUD.MD — PRINCIPES ARCHITECTURAUX NEWAGRIQDODO V2

**Date:** 2026-05-15  
**Outil:** Ce fichier guide TOUS les agents de développement

---

## PRINCIPES FONDAMENTAUX

### 1. ZÉRO MODIFICATION ODOO
**Règle inviolable** : Aucune modification côté Odoo. NewagriQodo parle uniquement via:
- **REST API Odoo** (lectures/écritures via `xmlrpc` ou `/api/`)
- **Webhooks Odoo** (Odoo → NewagriQodo, événements push)

**Implication:** Toute nouvelle donnée Odoo doit être mappée, validée et stockée localement en NewagriQodo.

### 2. SCALABILITÉ 2000+ USERS
Penser à l'échelle dès la fondation:
- **Requêtes N+1 éliminées** : toujours jointure SQL
- **Pagination systématique** : listes jamais complètes en mémoire
- **Caching agressif** : Redis pour cultures, produits phyto (qui changent rarement)
- **Lazy loading** : cartes, grandes listes
- **Compression données** : GeoJSON compressé pour parcelles
- **Indexes PostgreSQL** : `farm_id`, `user_id`, `parcel_id` everywhere

### 3. MOBILE-FIRST
La carte est la vue primaire (80% utilisation mobile estimé):
- **Responsive primaire** : XS (mobile) → SM → MD → LG
- **Touch-friendly** : boutons ≥48px, spacing ample
- **Offline-first** (phase 2+) : service worker + cache local pour données critiques
- **Perf mobile** : < 3s page load, lazy images
- **Carte fullscreen** : pas de sidebar sur XS

### 4. ISOLATION MULTI-TENANT
Chaque requête doit vérifier `farmId` avant accès données:
```typescript
// ❌ MAUVAIS
SELECT * FROM parcels WHERE ...

// ✅ BON
SELECT * FROM parcels WHERE farm_id = $1 AND ...
```

**Au backend:**
```typescript
// Middleware
app.use((req, res, next) => {
  const farmId = req.user.currentFarmId;
  req.farmId = farmId; // Inject everywhere
  next();
});

// Requête
parcels = await db.parcel.findMany({
  where: { farmId: req.farmId }
});
```

### 5. COMPOSANTS RÉUTILISABLES
Chaque composant = fichier `.tsx` indépendant:
```
components/
├── SearchBar.tsx (≤200 lignes)
├── ViewSwitcher.tsx
├── MapView.tsx
├── AsideCard.tsx
├── ParameterPanel.tsx
└── hooks/
   ├── useSearchFilters.ts
   ├── useMapState.ts
   └── useMultiTenant.ts
```

**Hooks réutilisables:**
- `useSearchFilters(entityType, farmId)` → state + setters
- `useMapState()` → selected, zoom, center
- `useMultiTenant()` → currentFarm, switchFarm

### 6. DATA CONSISTENCY & WEBHOOKS
**Webhook dans NewagriQodo:**
1. Reçois event Odoo (article créé)
2. **Valide signature** (HMAC-SHA256)
3. **Idempotent** : crée ou update local si existe (upsert)
4. **Async job queue** (Bull) : retry automatique
5. **Audit log** : log webhook + réponse

**Pattern:**
```typescript
POST /webhooks/odoo/article-updated
Authorization: Bearer {signature}
Body: { article_id, name, tags, ... }

→ enqueue("sync_article", { article_id, ... })
→ Job retry si failure (3x)
→ Log "article#123 synced OK" ou "failed"
```

### 7. VALIDATION MÉTIER
**Agent Agronome** valide avant deploy:
- Délais attente conformes suisse?
- Bilan fumure calculs corrects (normes OEngrais)?
- Programmes (SRPA/SST) appliqués correctement?

**Checklists:**
```
[] Délai d'attente = 21j si SRPA, 14j si Swiss Gap
[] Bilan N : -20 ≤ N ≤ +20 pour vert
[] Saisie bimodale : kilo/ha conversion <0.01 erreur?
```

---

## ARCHITECTURE API

### Endpoints Key Pattern

**Ressources:**
```
GET    /api/v1/farms/{farmId}/parcels          → List
POST   /api/v1/farms/{farmId}/parcels          → Create
GET    /api/v1/farms/{farmId}/parcels/{id}    → Detail
PUT    /api/v1/farms/{farmId}/parcels/{id}    → Update
DELETE /api/v1/farms/{farmId}/parcels/{id}    → Delete

GET    /api/v1/farms/{farmId}/interventions
POST   /api/v1/farms/{farmId}/interventions
...
```

**Filtres:**
```
GET /api/v1/farms/123/parcels?
  search=colza&
  culture_id=45&
  surface__gte=5&
  surface__lte=10&
  limit=20&
  offset=0
```

### Response format
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "limit": 20,
    "offset": 0
  },
  "error": null
}
```

### Auth
- JWT (local first)
- Token refresh = 24h (long-lived)
- SSO Odoo (phase 2+)

---

## DATABASE SCHEMA PRINCIPLES

### 1. Denormalization OK pour perf
```sql
-- ✅ OK : stocker surface calculée (geo-based)
-- pour requêtes filtre surface_gte 5 rapides
CREATE TABLE parcel (
  id UUID,
  farm_id UUID,
  geom GEOMETRY,
  surface_ha DECIMAL(10,2) -- cached/computed
);
```

### 2. Soft deletes pour audit
```sql
CREATE TABLE parcel (
  ...
  deleted_at TIMESTAMP NULL
  -- Queries : WHERE deleted_at IS NULL
);
```

### 3. Timestamps everywhere
```sql
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
synced_at TIMESTAMP -- last Odoo sync
```

---

## ERROR HANDLING & OBSERVABILITY

### Log levels
- **INFO** : user action (parcelle créée, sync OK)
- **WARN** : rate limit, webhook retry
- **ERROR** : validation failed, DB error
- **DEBUG** : query params, response times (dev only)

### Monitoring
- **Error tracker** : Sentry (js + node)
- **APM** : New Relic ou Datadog (perf)
- **Logs** : ELK ou DataDog logs (centralisé)

### Key metrics to track
- Webhook success rate (target: 99.5%)
- Bilan fumure calcul time (target: <500ms)
- Map load time (target: <2s)
- Search response time (target: <200ms)

---

## DEPLOYMENT & VERSIONING

### Git strategy
- **Main** : production (protected)
- **Develop** : staging
- **Feature/[task-id]** : branches de dev
- PR review = Agent Dev + Agent Validation UI

### Deployments
1. Push feature branch
2. Agent Spec & Docs : valide spec alignment
3. Agent Validation UI : tests visuels (screenshots)
4. Agent Dev : code review + tests
5. Agent Agronome : métier validation
6. Merge → auto-deploy staging
7. Manual promote staging → prod (Fabien)

### Versioning
```
v2.0.0 - Parcellaire core
v2.1.0 - Assolement + Odoo sync
v2.2.0 - Travaux agricoles module
v2.3.0 - Troupeau module
```

---

## TESTING STRATEGY

### Frontend (React)
- Unit : Vitest (composants simples)
- Integration : Playwright (flows entiers)
- E2E : Cypress (user journeys)
- Visual regressions : Percy.io ou local snapshots

### Backend (Node)
- Unit : Jest (business logic)
- Integration : Jest + PostgreSQL test DB
- Load : k6 (webhook stress, 1000 req/s)

### Coverage targets
- Backend : 80%+ coverage
- Frontend : 60%+ (mobile first, snapshot tests)

---

## BREAKING CHANGES POLICY

**Zéro breaking changes** dans API tant que clients live:
- Versioning strict : `/api/v1/`, `/api/v2/`
- Deprecation : 3 mois de warning avant suppression
- Migration path clair : docs + examples

---

## DOCUMENTATION STANDARDS

### Code comments
```typescript
/**
 * Calcule bilan azote pour parcelle.
 * Formule OEngrais v2024.
 * 
 * @param parcelId - UUID parcelle
 * @param year - Année fiscale (YYYY)
 * @returns BalanceResult { apport_kg, export_kg, bilan_kg, status: "vert"|"orange"|"rouge" }
 * 
 * @example
 * const balance = await calculateNitrogenBalance('parcel-123', 2026);
 * console.log(balance.bilan_kg); // -5 (vert)
 */
export async function calculateNitrogenBalance(
  parcelId: string,
  year: number
): Promise<BalanceResult> { ... }
```

### API docs
- Swagger/OpenAPI (auto-generated from code)
- Examples JSON pour webhooks
- Error codes documentés (400, 401, 422, 500)

---

## SECURITY

### Input validation
- **Frontend** : Zod schemas (parsing + validation)
- **Backend** : Zod + DB constraints
- **Database** : types stricts (no TEXT où INT expected)

### API security
- Rate limiting : 100 req/min per user (auth)
- CORS : `https://newagri.qodo.ch` only (prod)
- HTTPS only
- CSRF token si cookies (JWT = pas besoin)

### Data privacy
- No logs user.email, produits phyto dangerous
- Audit trail : qui a modifié quoi, quand
- GDPR : export data, delete account workflows

---

## HOOKS & VALIDATION (PER FABIEN)

**Custom hooks pour validation:**
- `useSearchFilters()` : récupère + filtre data basé sur searchTerms
- `useMapState()` : gère zoom/center/selected parcel
- `useBilanFumure()` : calcule bilan en temps réel
- `useOdooSync()` : gère webhook queue + retry

**Validation hooks:**
- Parcelle : surface > 0, geom valide GeoJSON
- Intervention : date ≤ today, quantité > 0, produit existe
- Bilan fumure : calcul <= 5s, no NaN results

**Hook exiting (custom pattern):**
```typescript
// Si validation échoue, exit hook + affiche erreur
if (!searchTerm) {
  setError("Recherche vide");
  return; // Exit
}
```

---

## PERFORMANCE CHECKLIST

- [ ] Paginated lists everywhere (20-50 items per page)
- [ ] Lazy load images
- [ ] Cache HTTP headers (cultures = 24h, parcels = 5min)
- [ ] Index DB : farm_id, user_id, parcel_id, culture_id
- [ ] No N+1 queries
- [ ] Compress GeoJSON (minify)
- [ ] Bundle splitting (route-based)
- [ ] Code splitting (modals, heavy components)

---

**FIN cloud.md**

Ce fichier guide TOUS les agents. Chaque commit doit le respecter.
