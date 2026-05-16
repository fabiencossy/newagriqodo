# PHASE 1 — PROMPT POUR CLAUDE CODE

**Date:** 2026-05-15  
**Project:** NewagriQodo v2  
**Phase:** 1 (Semaines 4-8)  
**Focus:** Construire les features majeures basées sur Phase 0  
**Owner:** Claude Code  
**Validation:** Fabien Cossy

---

## 🎯 OBJECTIF

Implémenter les features manquantes identifiées après Phase 0:
1. **Plan d'assolement** — Timeline annuelle de rotations (ferme globale)
2. **FAB contextuel amélioré** — Actions rapides avec menu intelligent
3. **Parcelles visuels** — Couleurs par culture + labels au survol
4. **RH Congés** — Création locale + sync Odoo (employé seulement)
5. **Colonnes configurables** — Persistence localStorage par utilisateur

**Approche:** Développement parallèle sur 2-3 fronts simultanément.

**Délai:** 4 semaines  
**Sortie:** Features fonctionnelles, testées, prêtes pour Phase 2

---

## 📋 CLARIFICATIONS FINALES

Les questions ont été clarifiées avec Fabien. Voici les décisions:

### 1. Plan d'assolement
- **Structure:** Un plan GLOBAL par ferme (pas par parcelle)
- **Timeline:** Par ANNÉE (rotation long-term, pas monthly detail)
- **Données:** Créées LOCALEMENT dans Agricodo (éditable par utilisateur)
- **Sync Odoo:** Pas de sync bidirectionnelle — données locales seulement
- **Coloration:** Par CULTURE (blé=jaune, maïs=vert, orge=marron, jachère=gris, etc.)

### 2. FAB Contextuel
- **Actions à inclure:** 4 actions principales
  1. Ajouter une parcelle
  2. Ajouter une intervention
  3. Ajouter observation/photo
  4. Voir carnet des champs
- **Pattern:** 2-3 actions FIXES (toujours visibles) + MENU contextuel (apparaît selon contexte)
  - Exemples contextes: parcelle sélectionnée, vue vide, dans détail, etc.
  - Les actions principales restent TOUJOURS accessibles
- **Responsivité:** Sur mobile, FAB en bas à droite; sur desktop, position fixe

### 3. Parcelles — Visuels
- **Couleurs:** Par CULTURE (schema de couleurs distinctes)
- **Labels:** Au SURVOL UNIQUEMENT (hover tooltip)
  - Affiche: Nom parcelle + Surface (ha) + Culture
  - Au clic: ouvre AsideCard avec détails complets
- **Effects:** Pulse/highlight au survol pour indiquer interactivité

### 4. RH — Congés
- **Qui peut créer:** Seulement l'EMPLOYÉ pour LUI-MÊME
- **Workflow:**
  1. Employé crée demande locale dans Agricodo (date de/à, motif)
  2. Auto-sync vers Odoo (créer Attendance/Leave request)
  3. Approbation se fait dans Odoo (voir historique sync)
  4. Agricodo affiche status (pending/approved/rejected)
- **Validation locale:** Vérifier contre congés restants (from Odoo), jours fériés suisses
- **Data source:** Master data employé depuis Odoo (read-only), mais demandes créables localement

### 5. Colonnes Configurables
- **Persistence:** localStorage (sauvegardé par navigateur, utilisateur individuel)
- **Scope:** Chaque utilisateur ses préférences (pas global ferme)
- **Colonnes verrouillées:** "Nom" toujours visible et non-removable
- **UI:** Icône ⚙️ sur chaque tableau → modal de sélection colonnes (checkboxes, drag-to-reorder)
- **Sauvegarde:** Auto-save en localStorage après chaque modification

---

## ✅ PHASE 1 — TÂCHES DÉTAILLÉES

### Feature 1: Plan d'assolement (MAJOR)

#### A) Data Model (Prisma)
```typescript
// Nouveau model AssolementPlan
model AssolementPlan {
  id: String @id @default(cuid())
  farmId: String
  farm: Farm @relation(fields: [farmId], references: [id])
  
  year: Int                          // 2026, 2027, etc.
  
  phases: AssolementPhase[]          // Phases de rotation
  
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  deletedAt: DateTime?               // Soft delete for audit
  
  @@unique([farmId, year])           // Une seule plan par ferme/année
}

model AssolementPhase {
  id: String @id @default(cuid())
  planId: String
  plan: AssolementPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  
  parcelId: String
  parcel: Parcel @relation(fields: [parcelId], references: [id])
  
  cultureId: String                  // Quelle culture
  culture: Culture @relation(fields: [cultureId], references: [id])
  
  startMonth: Int                    // 1-12
  endMonth: Int                      // 1-12
  
  status: 'planned' | 'active' | 'completed'
  notes: String?
  
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}
```

#### B) API Endpoints
```
POST   /api/assolement/plans
       → Créer plan d'assolement pour année X

GET    /api/assolement/plans?year=2026&farmId=XXX
       → Récupérer plan avec toutes phases

PATCH  /api/assolement/plans/:planId
       → Modifier structure plan

POST   /api/assolement/phases
       → Ajouter phase rotation (parcelle + culture + période)

PATCH  /api/assolement/phases/:phaseId
       → Modifier phase (changement culture, dates, status)

DELETE /api/assolement/phases/:phaseId
       → Supprimer phase
```

#### C) Frontend Components
```
Components à créer:
1. AssolementTimeline.tsx
   - Timeline annuelle (Jan-Dec horizontal)
   - Rows = parcelles
   - Cells = phases colorées par culture
   - Click → éditer phase
   - Drag-to-resize pour changer dates (optionnel Phase 2)

2. AssolementForm.tsx
   - Modal: Ajouter/éditer phase
   - Sélectionner parcelle
   - Sélectionner culture (dropdown)
   - Date range picker (start/end month)
   - Notes optionnelles

3. AssolementModal.tsx
   - Wrapper pour ouvrir timeline
   - Buttons: Ajouter phase, Export PDF

TypeScript Types:
- AssolementPlan, AssolementPhase, AssolementTimelineProps, AssolementFormProps
```

#### D) UI/UX Details
```
Desktop:
┌────────────────────────────────────────────────┐
│ Plan d'assolement 2026              [+ Ajouter] │
├────────────────────────────────────────────────┤
│        │ Jan│ Fév│ Mar│ Avr│ Mai│ Jun│...     │
├────────┼────┼────┼────┼────┼────┼────┼─────┤
│ PF-001 │    blé (jaune) │ mais │            │
│ PF-002 │ orge (marron)  │      jachère     │
│ PF-003 │ betterave (orange)                 │
│ ...    │                                     │
└────────────────────────────────────────────────┘

Click cell → Modal édition phase
Drag cell border → Redimensionner phase (Phase 2)
```

#### E) Validation
- [x] Pas de chevauche pour même parcelle
- [x] Culture sélectionnée existe
- [x] Dates month valides (1-12)
- [x] Max une phase par parcelle/period (pas overlaps)

---

### Feature 2: FAB Contextuel Amélioré

#### A) FAB Pattern
```typescript
// Configuration FAB contextuelle
interface FABConfig {
  mainActions: FABAction[];      // 2-3 toujours visibles
  contextualActions?: FABAction[]; // Apparaissent selon contexte
  position: 'bottom-right' | 'bottom-center';
}

interface FABAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  context?: 'map-empty' | 'parcel-selected' | 'aside-open' | 'any';
  color?: string;
}

// State pour gérer FAB
const [fabOpen, setFabOpen] = useState(false);
const [currentContext, setCurrentContext] = useState<FABContext>('map-empty');
```

#### B) Règles de visibilité
```
MAP VIEW (Parcellaire):
├─ MainActions (fixes):
│  ├─ Ajouter parcelle
│  └─ Ajouter intervention
├─ ContextualActions:
│  ├─ IF (parcel selected): Ajouter observation, Voir carnet
│  └─ IF (map empty): Ajouter parcelle (highlight)

TABLE VIEW (Parcellaire):
├─ MainActions:
│  ├─ Ajouter parcelle
│  └─ Ajouter intervention
├─ Contextual:
│  └─ IF (row selected): Ajouter observation

TRAVAUX VIEW:
├─ Ajouter intervention
├─ Ajouter fiche travaux
└─ IF (intervention selected): Ajouter observation

TROUPEAU VIEW:
├─ Ajouter animal
├─ Ajouter événement
└─ IF (animal selected): Voir historique
```

#### C) Components
```
1. FABButton.tsx (refactored)
   - Anim: rotate FAB icon 45° quand open
   - Click outside → close
   - Keyboard: Escape close
   - Mobile: Prevent overlap avec autre UI

2. FABAction.tsx (new)
   - Action item avec label + icon
   - Anim stagger (apparition séquentielle actions)
   - Ripple effect au clic

3. contextualFAB.ts (hook)
   - Gère logic de visibilité contextuelle
   - Export: useFAB() → {actions, open, close}
```

---

### Feature 3: Parcelles — Visuels Améliorés

#### A) Color Palette (par culture)
```typescript
const CULTURE_COLORS = {
  'blé': '#F4D03F',           // Jaune
  'maïs': '#52BE80',          // Vert
  'orge': '#CD7F32',          // Marron
  'betterave': '#E67E22',     // Orange
  'tournesol': '#F39C12',     // Or
  'colza': '#E74C3C',         // Rouge
  'luzerne': '#27AE60',       // Vert foncé
  'avoine': '#D2B48C',        // Tan
  'soja': '#7D3C98',          // Pourpre
  'jachère': '#95A5A6',       // Gris
  'unknown': '#34495E'        // Gris foncé
};
```

#### B) Hover Tooltip
```
MapView.tsx modification:
├─ OnMouseEnter parcel polygon:
│  └─ Show tooltip: "PF-001 — Blé · 2.5 ha"
├─ OnMouseLeave:
│  └─ Hide tooltip
├─ OnClick parcel:
│  └─ Open AsideCard (détail complet)
```

#### C) Effects
```
- Parcel at rest: Normal opacity (1.0), culture color
- OnHover: Opacity increase (1.0 → 1.0), add border highlight (2px)
- OnSelect: Border glow (3px), shadow
- OnActive (in aside): Extra shadow, pulse animation (subtle)
```

---

### Feature 4: RH — Congés (Employé seulement)

#### A) Data Model
```typescript
model LeaveRequest {
  id: String @id @default(cuid())
  farmId: String
  farm: Farm @relation(fields: [farmId], references: [id])
  
  employeeId: String
  employee: EmployeeProfile @relation(fields: [employeeId], references: [id])
  
  dateFrom: DateTime
  dateTo: DateTime
  days: Int                    // Calculé: dateTo - dateFrom + 1
  
  reason?: String
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  
  odooRequestId?: String       // Sync avec Odoo leave_request
  odooSyncedAt?: DateTime
  
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  submittedAt?: DateTime       // Quand envoyé à Odoo
  deletedAt: DateTime?
}
```

#### B) API Endpoints
```
POST   /api/leave-requests
       → Créer demande congés (validations locales + Odoo sync)
       → Request: { dateFrom, dateTo, reason }
       → Validation: Check remaining days from Odoo, jours fériés

GET    /api/leave-requests?employeeId=XXX&year=2026
       → Récupérer demandes employé (avec status from Odoo)

PATCH  /api/leave-requests/:id
       → Modifier draft (avant soumission à Odoo)

POST   /api/leave-requests/:id/submit
       → Envoyer à Odoo (status: pending)
       → Sync bidirectionnelle

DELETE /api/leave-requests/:id
       → Supprimer draft seulement
```

#### C) Frontend Components
```
1. LeaveRequestForm.tsx (new)
   - Input: dateFrom, dateTo (date picker)
   - Textarea: reason (optional)
   - Display: Jours restants (from Odoo)
   - Validation: Check jours fériés, contractual hours
   - Buttons: Sauvegarder (draft), Soumettre (send to Odoo)

2. LeaveRequestList.tsx (existing, extended)
   - Filter: All, Pending, Approved, Rejected
   - Column: Dates, Days, Status, Reason (hover)
   - Row colors: Pending (amber), Approved (green), Rejected (red)
   - Click → Edit draft (si draft) ou view details

3. leaveSyncOdoo.ts (hook)
   - After submit → POST to Odoo leave_request API
   - Poll status (check every 5s if approved/rejected)
   - On completion: Update local status
```

#### D) Odoo Sync Flow
```
1. Employé crée demande
   → LeaveRequest.status = 'draft'

2. Employé soumet
   → POST to Odoo create_leave_request
   → LeaveRequest.status = 'pending'
   → Sauvegarde odooRequestId

3. Manager approuve dans Odoo
   → Odoo webhook notifie Agricodo
   → LeaveRequest.status = 'approved'

4. Employé voit status updated
```

---

### Feature 5: Colonnes Configurables

#### A) localStorage Structure
```typescript
// Clé: `agricodo_columns_{userId}_{moduleName}`
// Value: { columns: ['name', 'culture', 'surface'], order: 0 }

interface ColumnPreference {
  [moduleName: string]: {
    visible: string[];           // Column keys à afficher
    hidden: string[];            // Column keys cachées
    order?: string[];            // Ordre custom (drag-to-reorder Phase 2)
  }
}

// localStorage.setItem('agricodo_columns_user123_parcellaire', 
//   JSON.stringify({ 
//     visible: ['name', 'culture', 'surface', 'interventions'],
//     hidden: ['localization', 'notes']
//   })
// );
```

#### B) Components
```
1. ColumnPicker.tsx (new)
   - Modal/dialog avec checkboxes
   - Locked column (nom) always checked
   - Buttons: Save, Cancel
   - Animation: Smooth update après save

2. TableWithColumns.tsx (wrapper)
   - Accepte: columns config array
   - Lit localStorage pour user preference
   - Render seulement visible columns
   - Icon ⚙️ → ouvre ColumnPicker

3. useColumnPreference.ts (hook)
   - Read/write localStorage
   - Fallback à default si vide
   - Export: { visibleColumns, updateColumns }
```

#### C) Default Columns per Module
```typescript
const DEFAULT_COLUMNS = {
  parcellaire: ['name', 'culture', 'surface', 'status', 'interventions'],
  travaux: ['name', 'date', 'type', 'parcelle', 'duration', 'status'],
  troupeau: ['name', 'type', 'age', 'health', 'lastEvent'],
  carnet: ['date', 'type', 'parcelle', 'culture', 'operation', 'notes']
};
```

---

## 🔗 CLAUDE CODE HOOKS

Configuration hooks (`.claudecode.json`):

```json
{
  "hooks": {
    "onFilesChanged": {
      "tasks": [
        "npx prettier --write .",
        "npm run lint --fix"
      ]
    },
    "onTaskCompleted": {
      "tasks": [
        "npm run test",
        "npm run type-check",
        "npm run build"
      ]
    }
  }
}
```

**Auto-execution après chaque task:**
1. Code formé (Prettier)
2. Linted (ESLint)
3. Tests passés
4. TypeScript validé
5. Build réussi

---

## 📊 DELIVERABLES

### Per Feature:
- [ ] Frontend components (React + TypeScript)
- [ ] Backend API endpoints (Express)
- [ ] Prisma schema migrations
- [ ] Unit tests (Vitest/Jest)
- [ ] Integration tests (if applicable)
- [ ] TypeScript types (.types.ts files)

### Specific Files to Create/Modify:

**Assolement:**
- `src/components/AssolementTimeline.tsx`
- `src/components/AssolementForm.tsx`
- `src/types/assolement.types.ts`
- `backend/src/routes/assolement.ts`
- `prisma/migrations/XXX_assolement.sql`

**FAB:**
- `src/components/FABButton.tsx` (refactored)
- `src/components/FABAction.tsx` (new)
- `src/hooks/useFAB.ts` (new)
- `src/config/fabConfig.ts` (contextual rules)

**Parcelles Visuels:**
- `src/components/MapView.tsx` (enhanced)
- `src/hooks/useCultureColors.ts` (new)
- `src/styles/cultureColors.ts` (palette)

**RH Congés:**
- `src/components/LeaveRequestForm.tsx`
- `src/hooks/useLeaveSyncOdoo.ts`
- `backend/src/services/leaveSync.ts`
- `prisma/migrations/XXX_leave_requests.sql`

**Colonnes:**
- `src/components/ColumnPicker.tsx`
- `src/hooks/useColumnPreference.ts`
- `src/components/TableWithColumns.tsx` (wrapper)

---

## ⚠️ RÈGLES STRICTES

❌ **NE PAS:**
- Modifier données Odoo directement (API read + webhook seulement)
- Ajouter state global Redux/Context sans raison
- Ignorer tests
- Skip TypeScript strict mode

✅ **À FAIRE:**
- Tests pour chaque feature (jest/vitest minimum)
- Documentation JSDoc sur composants
- Validation Odoo sync avec retry logic
- WCAG AA accessibility check
- Mobile responsiveness test

---

## 📞 COMMUNICATION

**Daily status:**
- Chaque feature complétée → "✓ Assolement timeline working"
- Questions → "Fabien, pour [feature]..."
- Blockers → Escalade immédiatement

**PR format:**
- Branch name: `feat/assolement`, `feat/fab-contextuel`, etc.
- Commit messages: `feat: Add assolement timeline component`
- Include test coverage, no warnings

---

## 🚀 ESTIMATION

**Timeline par feature:**

| Feature | Effort | Durée |
|---------|--------|-------|
| Assolement | HIGH | 1.5 semaines |
| FAB contextuel | MEDIUM | 4 jours |
| Parcelles visuels | LOW | 2 jours |
| RH Congés | MEDIUM | 5 jours |
| Colonnes | LOW-MEDIUM | 3 jours |
| Tests + polish | MEDIUM | 3 jours |

**Total:** ~4 semaines (parallèle sur 2-3 fronts)

---

## ✨ SUCCESS CRITERIA

✅ Assolement fully functional (CRUD, timeline, Odoo read)  
✅ FAB contextuel working (2-3 fixed + contextual actions)  
✅ Parcelles avec couleurs + labels hover  
✅ Congés créables localement + sync Odoo  
✅ Colonnes persistantes localStorage  
✅ All tests pass  
✅ TypeScript strict mode  
✅ WCAG AA accessible  
✅ Lighthouse 90+  

---

## 📝 NOTES FINALES

**From Fabien:**
- Assolement important (timeline visibility de rotation)
- FAB doit rester accessible (2-3 fixes toujours)
- Parcelles flashy mais pas overload (labels hover only)
- Congés simple (employé seulement, pas manager complexity)
- Colonnes = luxury feature (localStorage ok, no DB overhead)

**Parallel approach:**
- Start Assolement + FAB + Visuels simultaneously
- Congés can be Phase 1.5
- Colonnes can be polished in Phase 2

---

**Status:** 🚀 READY FOR LAUNCH  
**Owner:** Claude Code  
**Estimated Duration:** 4 weeks  
**Next Milestone:** Phase 1 complete → Phase 2 (remaining modules: Travaux, Troupeau, advanced RH)

**C'est parti! 🌾**
