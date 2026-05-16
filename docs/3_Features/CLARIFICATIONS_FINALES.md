# CLARIFICATIONS FINALES — NEWAGRIQDODO V2

**Date:** 2026-05-15  
**Statut:** ✅ VALIDÉ PAR FABIEN  
**Purpose:** Corriger les specs avant Phase 0

---

## 1. HOOKS OBLIGATOIRES (Claude Code)

### Définition
Un **hook** = contrainte système OBLIGATOIRE pour Claude Code durant dev.  
Contrairement à CLAUDE.md (lecture optionnelle), les hooks forcent comportement.

### Hooks NewagriQodo v2

#### Hook 1: Timesheet → Présence Odoo
```
TRIGGER: User creates TimesheetEntry in NewagriQodo
ACTION:  Automatically create Attendance record in Odoo
  - employeeId → employee_id
  - date → date
  - hoursWorked → calcul presence_ids (morning/afternoon)
  - projectType → tag (Parcellaire/Travaux/Troupeau/RH)
SYNC:    Bidirectional webhook + retry logic
RETRY:   3x exponential backoff if Odoo fails
IDEMPOTENCY: If duplicate timesheet, merge entries
```

#### Hook 2: Questions de Clarification Obligatoires
```
TRIGGER: During feature dev, if ambiguity found
ACTION:  Claude Code MUST ask Fabien
  - Scope unclear? Ask
  - Business logic ambiguous? Ask
  - Two implementation paths? Ask both options
  - Not specified in spec? Ask before coding
RESPONSE: Wait for answer before continuing feature
ESCALATION: If no response in 4h, pause work, escalate
```

#### Hook 3: Export Functionality
```
TRIGGER: Any list/table in UI
ACTION:  Must support:
  - PDF export (via pdf library)
  - CSV export (all lists)
TRIGGER: Carnet des champs specifically
ACTION:  Must support:
  - PDF export
  - Excel export (.xlsx)
VALIDATION: Exports must include all visible columns + metadata
```

#### Hook 4: Odoo Dependency Validation
```
TRIGGER: Each module deployment
ACTION:  Check Odoo requirement:
  - Parcellaire: CAN work offline (Odoo optional)
  - Troupeau: CAN work offline (Odoo optional)
  - Travaux: CANNOT work without Odoo (fail fast)
VALIDATION: Block release if Travaux + no Odoo connection
```

---

## 2. MENU & ARCHITECTURE (CORRIGÉ)

### ❌ À SUPPRIMER
```
❌ Devis (manage in Odoo only)
❌ Commandes (manage in Odoo only)
❌ Facturation (manage in Odoo only)
❌ Dashboard HR complet (voir Houdou)
❌ Vue Manager d'heures (pas needed)
```

### ✅ À GARDER
```
✅ PARCELLAIRE (core)
   ├─ Parcelles
   ├─ Carnet
   ├─ Bilan fumure
   └─ Assolement

✅ TRAVAUX (add-on) — MANAGEMENT ONLY
   ├─ Gestion des tâches (créer, assigner)
   ├─ Suivi progression
   ├─ Coûts (read-only from Odoo)
   └─ Export

✅ TROUPEAU (add-on)
   ├─ Animaux
   ├─ Événements
   └─ Historique

✅ RH (add-on) — EMPLOYEE DASHBOARD ONLY
   ├─ Timesheet (entry + history)
   ├─ Dashboard Heures (tableau par mois)
   ├─ Congés (my requests only)
   └─ Profil (my info only)

✅ PARAMÈTRES (admin)
   ├─ Exploitation
   ├─ Utilisateurs
   ├─ Master data
   └─ Intégrations
```

---

## 3. MODULE RH — CORRECTIONS

### ❌ SUPPRIMER
- Dashboard with manager view (voir équipe)
- Graphique d'heures (charts)
- Historique détaillé des absences

### ✅ GARDER

#### Dashboard Heures = TABLEAU SIMPLE
```
DISPLAY:
┌─────────────────────────────────┐
│ Bilan Heures 2026               │
├─────────────────────────────────┤
│ Mois           │ Travaillées │ Dues │ Solde │
├────────────────┼─────────────┼──────┼───────┤
│ Janvier        │    150h     │ 145h │ +5h   │
│ Février        │    142h     │ 140h │ +2h   │
│ Mars           │    145h     │ 145h │ 0h    │
│ Avril          │    148h     │ 145h │ +3h   │
│ Mai            │    152h     │ 147h │ +5h   │
├────────────────┼─────────────┼──────┼───────┤
│ YTD TOTAL      │    737h     │ 722h │ +15h  │
└─────────────────────────────────┘

Calcul automatique:
- Travaillées = SUM(TimesheetEntry.hoursWorked)
- Dues = Employee.hoursPerMonth × number of months - congés pris - jours fériés
- Solde = Travaillées - Dues
```

#### Timesheet Entry = ULTRA SIMPLE
```
FORM:
  - Date [pick date]
  - Heures travaillées [HH:MM decimal input]
  - Type de travail [dropdown: Parcellaire/Travaux/Troupeau/RH]
  - Intervention liée [optional, autocomplete]
  
BEHAVIOR:
  - On save → Auto create Attendance record in Odoo
  - Show confirmation "✓ Présence créée dans Odoo"
  - If Odoo fails → Show error, allow retry
```

#### Congés = READ-ONLY FROM ODOO
```
DISPLAY:
  - Liste mes demandes de congés
  - Status: Pending / Approved / Rejected
  - Dates: From → To
  - Remaining days this year
  - Read-only (cannot request here, only view)
```

---

## 4. MODULE TRAVAUX — CORRECTIONS

### SCOPE
✅ Gestion des travaux pour tiers = Task management only
```
FEATURES:
  ├─ Créer tâche (titre, description, date, assigné)
  ├─ Assigner à employé
  ├─ Marquer complété
  ├─ Ajouter heures estimées vs réelles
  └─ Export (PDF + CSV)

❌ Pas de:
  - Devis (Odoo only)
  - Commandes (Odoo only)
  - Facturations (Odoo only)
  - Coûts (read-only from Odoo si besoin)
```

### ODOO DEPENDENCY
```
⚠️ TRAVAUX cannot function without Odoo
  - Task creation → auto-create in Odoo (employee record needed)
  - Task completion → sync status back to Odoo
  - Fail fast if no Odoo connection

ACTION: Block module if Odoo unavailable
        Show: "Module Travaux requires Odoo connection"
```

---

## 5. DÉPENDANCES ODOO PAR MODULE

### Parcellaire
```
Status: ✅ WORKS OFFLINE
  - Create/edit parcelles: YES (local DB)
  - Carnet interventions: YES (local DB)
  - Bilan fumure: YES (calculated locally)
  - Assolement planning: YES (local DB)

Odoo OPTIONAL for:
  - Master data sync (cultures, phyto products)
  - Facturation of work
```

### Troupeau
```
Status: ✅ WORKS OFFLINE
  - Create/edit animals: YES
  - Log events: YES
  - History view: YES

Odoo OPTIONAL for:
  - Animal registry sync (future)
  - Sale/purchase tracking (future)
```

### Travaux
```
Status: ❌ REQUIRES ODOO
  - Cannot create tasks without employee reference
  - Cannot sync status without Odoo API
  - Fail fast if Odoo unavailable

ACTION: Check Odoo connectivity before showing module
```

### RH
```
Status: ⚠️ REQUIRES ODOO FOR SOME FEATURES
  - Timesheet entry: YES (can create locally)
  - Sync to Odoo: YES (auto-sync on create)
  - Dashboard hours: REQUIRES employee master data from Odoo
  - Congés: READ-ONLY from Odoo
  
ACTION: If Odoo unavailable:
  - Can still enter timesheets (queue locally)
  - Cannot see congés or hours due
  - Show: "HR sync currently unavailable"
```

---

## 6. EXPORTS — SPÉCIFICATIONS

### All Lists (Parcellaire, Troupeau, Travaux)
```
FORMAT: PDF + CSV
  - PDF: Pretty formatted, logo, date, user
  - CSV: Raw data, importable
  
COLUMNS: All visible columns in table
FILTERS: Include applied filters in export name
EXAMPLE: "Parcelles_2026-05-15_filtered.csv"
```

### Carnet des Champs (SPECIFIC)
```
FORMAT: PDF + Excel + CSV
  - PDF: Pretty formatted with map if geometry available
  - Excel: Structured with formulas for calculations
  - CSV: Raw data
  
EXAMPLE:
  - "Carnet_Parcelle_PF-2024-001.pdf"
  - "Carnet_Parcelle_PF-2024-001.xlsx"
  - "Carnet_Parcelle_PF-2024-001.csv"
```

---

## 7. COMPOSANTS RÉUTILISABLES À VALIDER

**Avant Phase 1, valider ces composants:**

1. ✅ **SearchBar** — filtrage dynamique toutes les listes
2. ✅ **ViewSwitcher** — table/carte/dashboard toggle
3. ✅ **MapView** — parcelles sur carte (satellite, mobile fullscreen)
4. ✅ **AsideCard** — détails panel quand sélection
5. ✅ **ExportButton** — PDF + CSV/Excel trigger

Plus:
6. ✅ **TimesheetEntry** — ultra-simple form HH:MM
7. ✅ **HoursTableMonth** — tableau bilan heures par mois
8. ✅ **LeaveRequestList** — liste congés read-only

---

## 8. CHECKLIST AVANT PHASE 1

### Clarifications Resolved ✅
- [x] Menu supprime devis/commandes/facturations
- [x] RH dashboard = tableau simple par mois (no graphs)
- [x] No manager view in app
- [x] Travaux = task management only (no billing)
- [x] Parcellaire + Troupeau = work offline
- [x] Travaux = require Odoo (fail fast)
- [x] Timesheet → auto-create Odoo attendance
- [x] Exports = PDF+CSV all lists, +Excel for Carnet
- [x] Hooks = obligatory (questions + export + Odoo checks)

### Ready for Dev
- [x] Composants réutilisables identifiés (8)
- [x] Architecture Odoo dépendances claire
- [x] Menu final validé
- [x] Exports spécifications précises
- [x] Hooks obligatoires documentés

---

## 9. NEXT STEP: PHASE 0 — COMPOSANTS

**Ordre de validation (avec Claude Code):**

1. **SearchBar** — filtering all lists
2. **ViewSwitcher** — toggle views
3. **MapView** — parcelles on map
4. **ExportButton** — PDF/CSV/Excel
5. **TimesheetEntry** — simple form
6. **HoursTableMonth** — tableau heures
7. **LeaveRequestList** — congés read-only
8. **AsideCard** — detail panel

**Pour chaque composant:**
- [ ] Wireframe validé (design)
- [ ] Props/inputs documentés
- [ ] Export strategy clear
- [ ] Responsive (mobile + desktop)
- [ ] Accessibility (WCAG AA)
- [ ] Edge cases handled

---

## COMMUNICATION HOOK

**Claude Code doit, à chaque ambi­guïté:**
```
"Fabien, j'ai une question avant de coder [feature]:

[Context]

Deux options:
  A) [Option 1 + implications]
  B) [Option 2 + implications]

Quelle approche tu préfères?"

→ Wait for answer
→ Then code
```

---

**Status:** ✅ READY FOR PHASE 0  
**Focus:** Composants réutilisables validation

Allons-y ! 🚀

