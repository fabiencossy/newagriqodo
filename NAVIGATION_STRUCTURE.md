# NAVIGATION STRUCTURE — MENU HAMBURGER + SIDEBAR

**COMPLÉMENT À SPEC.md**  
**Date:** 2026-05-15  
**Propriétaire:** Fabien Cossy

---

## 1. STRUCTURE GÉNÉRALE

### 1.1 Deux layouts selon device

**Mobile (XS/SM):**
- Header top avec logo + hamburger icon (☰)
- Content main (plein écran)
- Menu hamburger = overlay/sidebar gauche (slide-in)
- FAB button (+) contextuels

**Desktop (MD+):**
- Sidebar gauche permanent (200px, navigation)
- Header top avec branding
- Content main (flex 1)
- Compact quand au minimum

---

## 2. MENU HAMBURGER (MOBILE)

### 2.1 Structure hiérarchique

```
┌──────────────────────────────┐
│ ≡  NEWAGRIQDODO        X          │ ← Header hamburger ouvert
├──────────────────────────────┤
│                              │
│ 👤 Fabien Cossy              │ ← User section (profil rapide)
│ 🏠 Exploitation: "Cossy SARL" │
│ [Changer exploitation]        │
│                              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                              │
│ 📦 PARCELLAIRE (core)        │ ← Module sections (collapsible)
│    ├─ Parcelles              │
│    ├─ Carnet                 │
│    ├─ Bilan fumure           │
│    └─ Assolement             │
│                              │
│ 🚜 TRAVAUX TIERS (add-on)   │
│    ├─ Commandes              │
│    ├─ Devis                  │
│    └─ Facturation            │
│                              │
│ 🐄 TROUPEAU (add-on)        │
│    ├─ Animaux                │
│    ├─ Événements             │
│    └─ Historique             │
│                              │
│ 👥 RH (add-on)              │ ← NEW MODULE
│    ├─ Timesheet              │
│    ├─ Dashboard heures       │
│    ├─ Congés                 │
│    └─ Employés               │
│                              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                              │
│ ⚙️ PARAMÈTRES                │ ← Settings/Admin
│    ├─ Mon exploitation       │
│    ├─ Utilisateurs           │
│    ├─ Employés               │
│    ├─ Master data            │
│    └─ Intégrations           │
│                              │
│ ❓ AIDE & SUPPORT            │
│    ├─ Relancer onboarding    │
│    ├─ FAQ                    │
│    ├─ Contact support        │
│    └─ À propos               │
│                              │
│ 🚪 DÉCONNEXION              │
│                              │
└──────────────────────────────┘
```

### 2.2 Comportement

**Ouverture:**
- Tap hamburger icon (☰) top-left
- Slide-in from left (smooth animation)
- Overlay semi-transparent background

**Fermeture:**
- Tap X (top-right of menu)
- Tap outside menu (overlay)
- Navigate to item (auto-close)

**Sections collapsible:**
- Parcellaire, Travaux, Troupeau, RH = expandable
- Flèche chevron (> ou ∨) indique état
- Click = toggle expand/collapse
- État mémorisé (localStorage)

**Highlights:**
- Item actif = highlight couleur (background léger + icône emphasize)
- "Parcelles" actif → background #e8f5e9

### 2.3 Mobile menu specs

- **Width:** 80% viewport (max 320px)
- **Animation:** 300ms slide-in from left
- **Font:** 14px (readable on mobile)
- **Touch padding:** 12px items (easy tap)
- **Scroll:** interne si contenu > height (rare)

---

## 3. SIDEBAR (DESKTOP)

### 3.1 Layout principal

```
┌─────────┬──────────────────────────────────┐
│ SIDEBAR │                                  │
│ (200px) │  MAIN CONTENT                    │
│         │  (flex: 1)                       │
├─────────┤                                  │
│         │                                  │
│ NEWAGRIQDODO│  Header                          │
│ Logo    │  ─────────────────────────       │
│ (40px)  │  SearchBar + ViewSwitcher        │
│         │                                  │
│ ━━━━━━━ │  ─────────────────────────────  │
│         │                                  │
│ 👤      │  Content area                    │
│ Fabien  │  (carte, liste, dashboard, etc.) │
│ Cossy   │                                  │
│         │                                  │
│ Farm:   │                                  │
│ Cossy   │                                  │
│ SARL    │                                  │
│ [Change]│                                  │
│         │                                  │
│ ━━━━━━━ │                                  │
│         │                                  │
│ 📦 Parc.│                                  │
│ 🚜 Trav.│                                  │
│ 🐄 Troup│                                  │
│ 👥 RH   │                                  │
│         │                                  │
│ ⚙️ Param│                                  │
│ ❓ Aide │                                  │
│         │                                  │
│ ━━━━━━━ │                                  │
│         │                                  │
│ 🚪 Déco │                                  │
│         │                                  │
└─────────┴──────────────────────────────────┘
```

### 3.2 Sidebar desktop structure

```
┌────────────────────────┐
│ NEWAGRIQDODO               │  ← Logo + branding
│ 🌾                     │  (40px height)
├────────────────────────┤
│                        │
│ 👤 FABIEN COSSY       │  ← Current user
│ 🏠 Cossy SARL         │  ← Current farm
│ [Changer farm]        │  ← Switch farm link
│                        │
├────────────────────────┤
│                        │
│ 📦 PARCELLAIRE        │  ← Collapsible sections
│   ├─ Parcelles        │
│   ├─ Carnet           │
│   ├─ Bilan            │
│   └─ Assolement       │
│                        │
│ 🚜 TRAVAUX TIERS      │
│   ├─ Commandes        │
│   ├─ Devis            │
│   └─ Facturation      │
│                        │
│ 🐄 TROUPEAU           │
│   ├─ Animaux          │
│   ├─ Événements       │
│   └─ Historique       │
│                        │
│ 👥 RH                 │
│   ├─ Timesheet        │
│   ├─ Dashboard hrs    │
│   ├─ Congés           │
│   └─ Employés         │
│                        │
├────────────────────────┤
│                        │
│ ⚙️ PARAMÈTRES         │
│ ❓ AIDE               │
│                        │
├────────────────────────┤
│                        │
│ 🚪 DÉCONNEXION       │
│                        │
└────────────────────────┘
```

### 3.3 Desktop sidebar specs

- **Width:** 200px (collapsed: 60px avec icons only)
- **Position:** fixed left
- **Background:** #f5f5f5
- **Scroll:** internal scrollbar (if content > height)
- **Font:** 13px nav items, 11px section labels
- **Active item:** border-left 3px solid #2d5016 + background white
- **Hover:** subtle background change

### 3.4 Collapse toggle (desktop)

**Optional feature (phase 2+):**
```
┌─────┬─────────────────────┐
│ <── │ NEWAGRIQDODO            │  ← Collapsed (show icons only)
├──┤  │
│ 📦 │ Content              │
│ 🚜 │                      │
│ 🐄 │                      │
│ 👥 │                      │
│    │                      │
│ ⚙️ │                      │
│ ❓ │                      │
│    │                      │
│ 🚪 │                      │
└─────┴─────────────────────┘

Tap <── → expand à 200px
Tap sidebar collapse icon → shrink à 60px
```

---

## 4. MODULES & SUBMENU ORGANIZATION

### 4.1 Parcellaire (CORE)

**Submenu items:**
- **Parcelles** → `/app/parcellaire/parcelles` (liste/carte vue)
- **Carnet** → `/app/parcellaire/carnet` (interventions)
- **Bilan fumure** → `/app/parcellaire/bilan` (dashboard N/P/K)
- **Assolement** → `/app/parcellaire/assolement` (timeline planning)

### 4.2 Travaux Tiers (ADD-ON)

**Visible only if module bought**
- **Commandes** → `/app/travaux/commandes` (list + create)
- **Devis** → `/app/travaux/devis` (draft + send)
- **Facturation** → `/app/travaux/facturation` (invoices sent to Codomaster)

### 4.3 Troupeau (ADD-ON)

**Visible only if module bought**
- **Animaux** → `/app/troupeau/animaux` (list + profiles)
- **Événements** → `/app/troupeau/evenements` (naissances, ventes)
- **Historique** → `/app/troupeau/historique` (timeline)

### 4.4 RH (ADD-ON) — NEW

**Visible only if module bought**
- **Timesheet** → `/app/rh/timesheet` (saisie rapide)
- **Dashboard heures** → `/app/rh/dashboard` (heures travaillées vs dues)
- **Congés** → `/app/rh/conges` (view leave requests)
- **Employés** → `/app/rh/employes` (profiles, contracts, managers)

### 4.5 Paramètres (ADMIN ONLY)

**Visible only to Admin users**
- **Mon exploitation** → `/app/settings/farm` (numéro cantonal, programs, contact)
- **Utilisateurs** → `/app/settings/users` (roles, invites, permissions)
- **Employés** → `/app/settings/employees` (RH master data)
- **Master data** → `/app/settings/master` (cultures, produits phyto)
- **Intégrations** → `/app/settings/integrations` (Odoo, Codomaster, status)

### 4.6 Aide & Support

- **Relancer onboarding** → Trigger UserOnboarding.currentStep = 0
- **FAQ** → Static page avec questions fréquentes
- **Contact support** → Link email ou form
- **À propos** → Version app, terms, privacy

---

## 5. PERMISSION-BASED MENU VISIBILITY

### 5.1 Per-module visibility

| Module | Admin | Editor | Viewer | Manager |
|--------|-------|--------|--------|---------|
| Parcellaire | ✅ | ✅ | ✅ | ✅ |
| Travaux | ✅ | ✅ | ✅ | ✅ |
| Troupeau | ✅ | ✅ | ✅ | ✅ |
| RH | ✅ | ✅ | ✅ | ✅ |
| Paramètres | ✅ | ❌ | ❌ | ❌ |

### 5.2 Implementation

```typescript
// Nav items generation based on role + modules
const navItems = [
  {
    module: 'parcellaire',
    icon: '📦',
    label: 'Parcellaire',
    visible: true, // Always
    items: [...]
  },
  {
    module: 'travaux',
    icon: '🚜',
    label: 'Travaux Tiers',
    visible: farm.hasTravauxModule, // Feature flag
    items: [...]
  },
  {
    module: 'rh',
    icon: '👥',
    label: 'RH',
    visible: farm.hasRHModule, // Feature flag
    items: [...]
  },
  {
    module: 'settings',
    icon: '⚙️',
    label: 'Paramètres',
    visible: userRole === 'Admin',
    items: [...]
  },
];
```

---

## 6. MOBILE NAVIGATION FLOW

### 6.1 Typical flow

```
1. Tap ☰ hamburger
   → Menu slides in from left
   
2. Tap "Parcellaire"
   → (if collapsed) expand submenu
   → (if expanded) collapse submenu
   
3. Tap "Parcelles"
   → Navigate to /app/parcellaire/parcelles
   → Menu auto-closes
   → Show content
   
4. Tap ☰ again
   → Menu slides out

5. (Back navigation)
   → Browser back button
   → Or back arrow in header
```

### 6.2 Breadcrumb (optional, phase 2+)

```
┌────────────────────────────────┐
│ Parcellaire > Parcelles        │ ← Breadcrumb shows path
│ PARCELLES                      │
├────────────────────────────────┤
│ [list/carte]                   │
└────────────────────────────────┘
```

---

## 7. NOTIFICATION BADGE

### 7.1 Indicators

Nav items peut afficher badges pour:
- **RH:** Timesheet pending approval
- **Travaux:** Invoices ready to send
- **Troupeau:** Birth/death events

Exemple:
```
👥 RH
   ├─ Timesheet ⚫2    ← 2 pending
   ├─ Dashboard hrs
   ├─ Congés
   └─ Employés

🚜 TRAVAUX TIERS
   ├─ Commandes
   ├─ Devis ⚫1        ← 1 ready
   └─ Facturation
```

---

## 8. DARK MODE (FUTURE)

Sidebar adapts to dark mode (phase 3+):
- Background: #1a1a1a
- Text: #ffffff
- Active item: border still #2d5016 (or lighter accent)

---

## 9. WIREFRAMES TO CREATE

**Pour validation:**
1. Mobile menu hamburger (open state)
2. Mobile menu hamburger (closed state)
3. Desktop sidebar (full)
4. Desktop sidebar (collapsed icons-only)
5. Menu with all modules (Parcellaire + Travaux + Troupeau + RH)
6. Active states (which item highlighted)
7. Submenu expand/collapse states

---

## 10. ACCESSIBILITY

### 10.1 Mobile navigation
- Menu toggle = `<button aria-label="Menu" aria-expanded="false">`
- Semantic nav: `<nav role="navigation">`
- Keyboard: Tab → navigate items, Enter → select
- Screen reader: announce "Menu opened/closed"

### 10.2 Desktop sidebar
- Sidebar = `<aside role="navigation">`
- Active link: `aria-current="page"`
- Skip nav link: `<a href="#main-content" class="sr-only">Skip to content</a>`

---

## 11. CSS STRUCTURE

```
components/
├── Navigation/
│   ├── HamburgerMenu.tsx      (mobile)
│   ├── Sidebar.tsx             (desktop)
│   ├── NavItem.tsx             (recursive, supports expand/collapse)
│   ├── NavBadge.tsx            (notifications)
│   └── styles/
│       └── navigation.module.css
│
hooks/
├── useNavigation.ts            (state + visibility logic)
├── useMenuState.ts             (burger open/close)
└── useActiveRoute.ts           (highlight current item)
```

---

**FIN NAVIGATION STRUCTURE**

À valider avec wireframes interactifs.
