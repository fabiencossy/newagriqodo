# ADDENDUM — ONBOARDING & USER ROLES

**COMPLÉMENT À SPEC.md**  
**Date:** 2026-05-15  
**Propriétaire:** Fabien Cossy

---

## 1. SYSTÈME D'ONBOARDING GUIDÉ

### 1.1 Objectif UX
**Les agriculteurs sans formation peuvent utiliser l'app.**

- Nouveau user → Onboarding overlay step-by-step
- Chaque step = highlight UI element + instruction texte claire
- Skip possible à tout moment
- User peut relancer onboarding depuis Paramètres

### 1.2 Onboarding Flow (5 steps)

**Step 1: Bienvenue + infos exploitation**
```
┌─────────────────────────────────┐
│  Bienvenue dans Agricodo! 🌾    │
│                                 │
│  Créons votre exploitation.     │
│                                 │
│  Numéro cantonal: [___________] │
│  Nom exploitation: [___________] │
│  Commune: [___________]         │
│  Programmes:                    │
│   [x] SRPA                      │
│   [ ] SST                       │
│                                 │
│  [Suivant →]  [Passer tour]     │
└─────────────────────────────────┘
```
- Pointer vers "numéro cantonal" avec tooltip
- Texte aide : "C'est le numéro que vous utilisez à l'administration cantonale pour l'agriculture"
- Sauvegarde en base
- Rôle user : auto-Admin pour premier utilisateur

---

**Step 2: Créer première parcelle**
```
┌─────────────────────────────────┐
│  Créons votre première parcelle │
│                                 │
│  Vous allez dessiner une        │
│  parcelle sur la carte.         │
│                                 │
│  [Afficher carte]               │
│  ├─ Cliquez sur le [+]          │
│  ├─ Sélectionnez "Parcelle"    │
│  └─ Dessinez sur la carte      │
│                                 │
│  [J'ai créé une parcelle →]    │
│  [Passer cette étape]           │
└─────────────────────────────────┘
```
- Highlight bouton "+" avec pulse animation
- Pointer vers "Créer parcelle" option
- Attendre que user crée parcelle (JS listens for new parcel)
- Auto-avancer quand crée

---

**Step 3: Ajouter activité (intervention)**
```
┌─────────────────────────────────┐
│  Notez votre première activité  │
│                                 │
│  Cliquez sur votre parcelle     │
│  puis cliquez [+] et choisissez │
│  "Ajouter intervention"         │
│                                 │
│  Date, type (labour, semis...)  │
│  Quantité (en kg ou kg/ha)      │
│                                 │
│  [J'ai ajouté une activité →]  │
│  [Passer cette étape]           │
└─────────────────────────────────┘
```
- Highlight parcelle sur carte (overlay pulsant)
- Pointer vers bouton "+"
- Attendre nouvelle intervention

---

**Step 4: Voir le bilan de fumure**
```
┌─────────────────────────────────┐
│  Voyez votre bilan de fumure!  │
│                                 │
│  Sur l'accueil, vous voyez     │
│  3 indicateurs : N, P, K       │
│                                 │
│  - Vert = bon                  │
│  - Orange = attention          │
│  - Rouge = dépassé             │
│                                 │
│  Cliquez pour voir le détail.   │
│                                 │
│  [Voir accueil] [Passer]        │
└─────────────────────────────────┘
```
- Navigate vers accueil si pas déjà
- Pointer tuile "Azote (N)"

---

**Step 5: Fin + paramètres**
```
┌─────────────────────────────────┐
│  Bravo! 🎉                      │
│                                 │
│  Votre exploitation est prête!  │
│                                 │
│  Vous pouvez maintenant :       │
│  • Ajouter plus de parcelles    │
│  • Noter vos activités          │
│  • Ajouter des utilisateurs     │
│  • Consulter votre bilan        │
│                                 │
│  Questions? → Paramètres → Aide │
│                                 │
│  [Terminer tour] [Recommencer]  │
└─────────────────────────────────┘
```

### 1.3 Technical implementation

**Database model:**
```prisma
model UserOnboarding {
  id                String   @id @default(cuid())
  userId            String
  farmId            String
  
  # Progression
  currentStep       Int      @default(0)  // 0-5 (0=not started, 5=completed)
  completedAt       DateTime?
  skippedAt         DateTime?
  
  # Can be relaunched
  dismissedAt       DateTime?
  releaseCount      Int      @default(0)
  
  user              User     @relation(fields: [userId], references: [id])
  farm              Farm     @relation(fields: [farmId], references: [id])
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([userId, farmId])
}
```

**Frontend state (Zustand):**
```typescript
// useOnboarding.ts
export const useOnboarding = create((set) => ({
  currentStep: 0,
  isVisible: true,
  skipOnboarding: () => set({ isVisible: false }),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  relaunchtOnboarding: () => set({ currentStep: 0, isVisible: true }),
  setCompleted: () => set({ currentStep: 5, isVisible: false }),
}));
```

**Component:**
```typescript
// Onboarding.tsx
function Onboarding() {
  const { currentStep, isVisible, skipOnboarding, nextStep, setCompleted } = useOnboarding();
  
  if (!isVisible) return null;
  
  const steps = [
    <OnboardingFarmInfo />,     // Step 1
    <OnboardingParcel />,        // Step 2
    <OnboardingIntervention />,  // Step 3
    <OnboardingBalance />,       // Step 4
    <OnboardingComplete />,      // Step 5
  ];
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <OnboardingModal>
        {steps[currentStep]}
        <div className="flex gap-4">
          <button onClick={skipOnboarding}>Passer tour</button>
          <button onClick={currentStep === 4 ? setCompleted : nextStep}>
            {currentStep === 4 ? "Terminer" : "Suivant →"}
          </button>
        </div>
      </OnboardingModal>
    </div>
  );
}
```

**"Rappeler onboarding" button:**
```
Paramètres → Aide → "Relancer le tour guidé"
```

### 1.4 Mobile adaptation
- Fullscreen modal (not aside)
- Large readable font (18px+)
- Touch-friendly buttons (48px+)
- Animations smooth (Framer Motion)
- Instructions une ligne max

---

## 2. USER ROLES & PERMISSIONS

### 2.1 Role model

**Admin**
- Full CRUD : parcelles, interventions, bilan, assolement
- User management : invite, change role, delete users
- Farm settings : edit exploitation infos, programs, Odoo link
- Parameter access : all panels
- Billing : view invoices (Codomaster link)
- **Perms table:** All = true

**Editor**
- CRUD parcelles, interventions, bilan, assolement (own farm)
- NO user management
- NO farm settings (read-only)
- NO billing
- **Perms table:** Data = true, Admin = false

**Viewer**
- Read-only : can see all parcelles, carnet, bilan, assolement
- NO create, edit, delete
- NO user management, settings, billing
- **Perms table:** Data = read-only, All else = false

### 2.2 Database model

```prisma
model UserFarm {
  id                String   @id @default(cuid())
  userId            String
  farmId            String
  
  # NEW: role field
  role              String   @default("Viewer") // "Admin", "Editor", "Viewer"
  
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  farm              Farm     @relation(fields: [farmId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([userId, farmId])
}
```

### 2.3 Permission checks (backend)

```typescript
// middleware/authorize.ts
export function requireRole(allowedRoles: string[]) {
  return async (req, res, next) => {
    const { userId, farmId } = req;
    const userFarm = await db.userFarm.findUnique({
      where: { userId_farmId: { userId, farmId } },
    });
    
    if (!userFarm || !allowedRoles.includes(userFarm.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    req.userRole = userFarm.role;
    next();
  };
}

// Usage
app.post('/api/v1/farms/:farmId/parcels',
  authenticate,
  requireRole(['Admin', 'Editor']),
  createParcel
);

app.put('/api/v1/farms/:farmId/settings',
  authenticate,
  requireRole(['Admin']),
  updateFarmSettings
);
```

### 2.4 Frontend permission checks

```typescript
// usePermission.ts
export function usePermission() {
  const { currentFarm, userRole } = useAuthStore();
  
  return {
    canCreate: ['Admin', 'Editor'].includes(userRole),
    canEdit: ['Admin', 'Editor'].includes(userRole),
    canDelete: ['Admin', 'Editor'].includes(userRole),
    canManageUsers: userRole === 'Admin',
    canEditSettings: userRole === 'Admin',
  };
}

// Usage
function ParcelCard({ parcel }) {
  const { canDelete } = usePermission();
  
  return (
    <div>
      {parcel.name}
      {canDelete && <button onClick={delete}>Supprimer</button>}
    </div>
  );
}
```

### 2.5 First user auto-Admin

```typescript
// During signup
if (farm.users.length === 0) {
  // First user = auto Admin
  userFarm.role = "Admin";
}
```

### 2.6 UI visibility per role

| Feature | Admin | Editor | Viewer |
|---------|-------|--------|--------|
| View parcelles | ✅ | ✅ | ✅ |
| Create parcelle | ✅ | ✅ | ❌ |
| Edit parcelle | ✅ | ✅ | ❌ |
| Delete parcelle | ✅ | ✅ | ❌ |
| View interventions | ✅ | ✅ | ✅ |
| Add intervention | ✅ | ✅ | ❌ |
| View bilan | ✅ | ✅ | ✅ |
| View paramètres | ✅ | ❌ | ❌ |
| Invite users | ✅ | ❌ | ❌ |
| Change user role | ✅ | ❌ | ❌ |

---

## 3. ONBOARDING FLOW IN SIGNUP

```
1. User email + password
2. Create User record
3. Create Farm (empty name, needs completing)
4. Create UserFarm (role = "Admin" for first)
5. Redirect → Onboarding Step 1 (farm infos)
6. User completes onboarding
7. After Step 5 → Dashboard
```

---

## 4. SIMPLICITÉ DESIGN PRINCIPLES

Pour que l'app soit utilisable sans formation:

1. **Labels clairs**
   - ❌ "Intervenant"
   - ✅ "Ajouter activité"

2. **Icons + texte**
   - ❌ Juste icon
   - ✅ Icon + "Créer parcelle"

3. **Help tooltips**
   - Hovers sur labels → aide court (1-2 phrases max)
   - "Numéro cantonal : identifiant agriculteur du canton"

4. **Defaults**
   - Parcelle : surface auto-calculée si geom
   - Intervention : date = today
   - Quantité : default "kg/hectare" (agriculteur comprend ça)

5. **Confirmations**
   - Supprimer parcelle → "Êtes-vous sûr? Cette action ne peut pas être annulée"

6. **Mobile-first**
   - Fullscreen par défaut
   - Buttons ≥48px
   - Texte ≥16px

---

**FIN ADDENDUM**

À intégrer dans SPEC.md + PRISMA.md finaux.
