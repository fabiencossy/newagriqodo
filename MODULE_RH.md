# MODULE RH — TIMESHEET + GESTION CONGÉS

**COMPLÉMENT À SPEC.md**  
**Date:** 2026-05-15  
**Propriétaire:** Fabien Cossy

---

## 1. ARCHITECTURE GÉNÉRALE MODULE RH

### 1.1 Positionnement dans app
```
NEWAGRIQDODO V2 — NAVIGATION MENU HAMBURGER

┌─────────────────────┐
│ ≡ MENU              │
├─────────────────────┤
│ 📦 PARCELLAIRE      │
│    ├─ Parcelles     │
│    ├─ Carnet        │
│    ├─ Bilan fumure  │
│    └─ Assolement    │
├─────────────────────┤
│ 🚜 TRAVAUX TIERS    │
│    ├─ Commandes     │
│    ├─ Devis         │
│    └─ Facturation   │
├─────────────────────┤
│ 🐄 TROUPEAU         │
│    ├─ Animaux       │
│    ├─ Événements    │
│    └─ Historique    │
├─────────────────────┤
│ 👥 RH (NEW!)        │ ← MODULE NOUVEAU
│    ├─ Timesheet     │
│    ├─ Dashboard hrs │
│    ├─ Congés        │
│    └─ Employés      │
├─────────────────────┤
│ ⚙️ PARAMÈTRES       │
│ ❓ AIDE             │
└─────────────────────┘
```

### 1.2 Concept timesheet ultra-simple
- **Heures liées aux interventions** : quand on crée intervention (travaux ou carnet) → ajouter heures travaillées
- **Timesheet libre** : saisie indépendante directe (pas besoin d'intervention)
- **Agrégation automatique** : total heures/mois par employé
- **Dashboard simple** : heures travaillées vs heures dues (du mois)

---

## 2. SOUS-MODULE TIMESHEET

### 2.1 Saisie heures sur intervention (BIMODALE)

**Quand créer intervention (travaux ou carnet):**
```
┌─────────────────────────────────────┐
│ Créer intervention                  │
├─────────────────────────────────────┤
│ Date: [2026-05-15]                  │
│ Type: Épandage engrais              │
│ Parcelle: PF-2024-001               │
│ Quantité: [5] kilo/hectare          │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│ 📌 HEURES TRAVAILLÉES (optionnel)   │
│    Employé: [Select dropdown]       │
│    Heures: [__:__] HH:MM            │
│    (ex: 2:30 = 2h 30m)              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                     │
│ [Créer intervention]                │
└─────────────────────────────────────┘
```

**Comportement:**
- Champ heures est **optionnel** (pas obligatoire)
- Si rempli → crée TimesheetEntry automatiquement
- Employé peut saisir directement HH:MM (facile)
- Au submit → crée Intervention + TimesheetEntry lié

### 2.2 Saisie timesheet libre (standalone)

**Module RH → Timesheet:**
```
┌─────────────────────────────────────┐
│ 📋 TIMESHEET RAPIDE (saisie libre)  │
├─────────────────────────────────────┤
│ Mois: [Mai 2026 ▼]                  │
│                                     │
│ Employé: [Fabien Cossy ▼]           │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Date      │ Heures │ Projet      │ │
│ ├───────────┼────────┼─────────────┤ │
│ │ 2026-05-01│ 8:00   │ Parcellaire │ │
│ │ 2026-05-02│ 7:30   │ Travaux     │ │
│ │ 2026-05-03│ 8:00   │ Admin       │ │
│ │ [+]       │        │             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Total mois: 23:30 / 160:00 heures  │
│                                     │
│ [Enregistrer]                       │
└─────────────────────────────────────┘
```

**Comportement:**
- Chaque ligne = une journée (ou demi-journée)
- Heures format HH:MM (ou décimal 2.5)
- Projet = dropdown (Parcellaire, Travaux, Admin, Congé, Maladie, etc.)
- Auto-calcul total mensuel
- Validation : total heures/jour ≤ 12h (overtime = alert)

### 2.3 Modèles Prisma

```prisma
model TimesheetEntry {
  id                String   @id @default(cuid())
  farmId            String
  employeeId        String
  
  # Date & hours
  date              DateTime
  hoursWorked       Decimal  @db.Decimal(5, 2) // HH:MM decimal (2.5 = 2h30m)
  
  # Project/category
  projectType       String   // "parcellaire", "travaux", "admin", "conge", "maladie"
  description       String?
  
  # Linked intervention (optional)
  interventionId    String?
  
  # Approval
  approvedBy        String?  // Manager or Admin who approved
  approvedAt        DateTime?
  status            String   @default("pending") // pending, approved, rejected
  
  # Relations
  farm              Farm     @relation(fields: [farmId], references: [id], onDelete: Cascade)
  employee          EmployeeProfile @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  intervention      Intervention? @relation(fields: [interventionId], references: [id], onDelete: SetNull)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  syncedToOdooAt    DateTime?
  
  @@index([farmId])
  @@index([employeeId])
  @@index([date])
  @@index([status])
}

model EmployeeProfile {
  id                String   @id @default(cuid())
  farmId            String
  
  # Identity
  firstName         String
  lastName          String
  email             String
  phoneNumber       String?
  
  # Employment
  odooEmployeeId    Int?     // Link to Odoo employee
  contractType      String   // CDI, CDD, Freelance
  startDate         DateTime
  endDate           DateTime?
  
  # Working hours
  hoursPerWeek      Decimal  @db.Decimal(5, 2) // 40, 35, 20, etc.
  hoursPerMonth     Decimal  @db.Decimal(6, 2) // auto-calculated (hoursPerWeek * 52 / 12)
  
  # Status
  isActive          Boolean  @default(true)
  isSalaryEmployee  Boolean  @default(true) // vs contractor
  
  # Manager
  managerId         String?  // Reference to User who manages this employee
  
  # Relations
  farm              Farm     @relation(fields: [farmId], references: [id], onDelete: Cascade)
  timesheetEntries  TimesheetEntry[]
  leaveRequests     LeaveRequest[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  syncedFromOdooAt  DateTime?
  
  @@index([farmId])
  @@index([odooEmployeeId])
  @@index([email])
}

model LeaveRequest {
  id                String   @id @default(cuid())
  farmId            String
  employeeId        String
  
  # Dates
  startDate         DateTime
  endDate           DateTime
  leaveType         String   // "vacation", "sick", "personal", "unpaid"
  
  # Status (Odoo is source of truth)
  odooLeaveId       Int?
  status            String   @default("pending") // pending, approved, rejected
  approvedBy        String?  // Manager/Admin
  approvedAt        DateTime?
  
  # Notes
  reason            String?
  adminNotes        String?
  
  # Relations
  farm              Farm     @relation(fields: [farmId], references: [id], onDelete: Cascade)
  employee          EmployeeProfile @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  syncedFromOdooAt  DateTime?
  
  @@index([farmId])
  @@index([employeeId])
  @@index([status])
}
```

---

## 3. DASHBOARD HEURES

### 3.1 Vue employé (voit ses heures)

```
┌──────────────────────────────────────────┐
│ 📊 MES HEURES — Mai 2026                 │
├──────────────────────────────────────────┤
│                                          │
│  RÉSUMÉ MENSUEL                          │
│  ─────────────────────────────────       │
│  Heures travaillées : 162h 30m           │
│  Heures dues :       160h 00m            │
│  ───────────────────────────────────     │
│  ✅ HEURES SUPPLÉMENTAIRES : +2h 30m     │
│                                          │
│  ─────────────────────────────────────   │
│  DÉTAIL CONGÉS PRIS :                    │
│  • Vacances : 5 jours (40h)              │
│  • Maladie : 1 jour (8h)                 │
│  → Total déductions : 48h                │
│  → Heures attendues (sans congés) : 208h │
│                                          │
│  GRAPH : Progression hebdomadaire        │
│  S1 [████████░░] 40h/40h                 │
│  S2 [███████░░░] 35h/40h                 │
│  S3 [████████░░] 40h/40h (avec 1j congé)│
│  S4 [██████░░░░] 32h/40h (maladie)      │
│  S5 [████░░░░░░] 15h/40h (en cours)     │
│                                          │
│ [Timesheet détail] [Demande congé]      │
└──────────────────────────────────────────┘
```

### 3.2 Vue manager (voit équipe)

```
┌──────────────────────────────────────────┐
│ 👥 MON ÉQUIPE — Heures Mai 2026          │
├──────────────────────────────────────────┤
│                                          │
│ Employé         │ Travaillées │ Dues    │
│ ────────────────┼─────────────┼──────── │
│ Fabien Cossy    │ 162h 30m ✅ │ 160h    │
│ Martin Dubois   │ 155h 00m 🟡 │ 160h    │
│ Sophie Müller   │ 142h 00m 🔴 │ 160h    │
│ [Voir détail]   │             │         │
│                                          │
│ 🔴 ALERTS:                               │
│ • Sophie: -18h (nécessite discussion)    │
│ • Martin: -5h (dans les normes)          │
│                                          │
│ [Export paie] [Ajuster heures]           │
└──────────────────────────────────────────┘
```

### 3.3 Logique calculation heures dues

**Formule:**
```
Heures dues = (hoursPerMonth × jours_ouvrables_mois) / 22 - congés_pris - jours_fériés

Exemple Mai 2026 (22 jours ouvrables, CDI 40h/semaine):
- Heures base : (160h / 22) × 22 = 160h
- Moins vacances (5j) : -40h
- Moins fériés (Ascension 1.05.2026) : -8h
- = Heures attendues : 160h - 48h = 112h

Réel : 162h (avec supplémentaires)
Différence : +50h (payé en heures sup ou repos?)
```

**Data source:** Sync Odoo employee record
- hoursPerWeek (de contract Odoo)
- Congés approuvés (depuis Odoo leave requests)
- Jours fériés (farm settings ou Odoo)

---

## 4. GESTION CONGÉS

### 4.1 Flow congés (READ-ONLY from Odoo)

```
1. Employé demande congés dans Odoo
2. Manager approuve/refuse dans Odoo
3. NewagriQodo sync : pull leaveRequest Odoo → LeaveRequest table
4. Dashboard affiche congés approuvés
5. Heures dues recalculées automatiquement
```

**Note:** NewagriQodo NE CRÉE PAS les demandes (Odoo only)

### 4.2 API/Webhooks Odoo

```
Webhook: hr_leave_request.approve
→ POST /webhooks/odoo/leave-approved
→ enqueue("sync_leave_request", { leave_id: 123 })
→ Update LeaveRequest.status = "approved"
→ Recalculate EmployeeProfile.hoursPerMonth
```

### 4.3 Affichage dashboard

- Liste congés approuvés (date début/fin, type)
- Impact heures dues (automatique)
- Alertes si chevauchement d'absences
- Export pour paie (jours congés × taux horaire)

---

## 5. SYNC ODOO BIDIRECTIONNELLE

### 5.1 Sync → Odoo (NewagriQodo → Odoo)

**Quand:** Chaque soir (job quotidien) + après saisie timesheet

**Quoi:**
- Heures travaillées (TimesheetEntry) → Odoo attendance/timesheet
- Agrégation mensuelle par employé
- Format : date, employé, heures, projet

**Payload:**
```json
{
  "employee_id": 123,
  "date": "2026-05-15",
  "hours_worked": 8.5,
  "project": "parcellaire",
  "timesheet_id": "agricodo-ts-456"
}
```

### 5.2 Sync ← Odoo (Odoo → NewagriQodo)

**Quoi:**
- EmployeeProfile : sync employés, contrats, taux horaires
- LeaveRequest : sync congés approuvés, fériés
- Master data : modifications contracts

**Webhook Odoo:**
```
Event: hr.employee.create/update
→ POST /webhooks/odoo/employee-updated
→ Sync EmployeeProfile (create or upsert)

Event: hr.leave.approve
→ POST /webhooks/odoo/leave-approved
→ Sync LeaveRequest + recalc heures dues
```

### 5.3 Conflict resolution

**Si sync conflict (modification Odoo + NewagriQodo):**
- **Odoo wins** pour employee data (contrats, taux)
- **NewagriQodo wins** pour timesheet (source de saisie)
- Log conflict dans OdooSyncLog

---

## 6. PERMISSIONS RH

### 6.1 Rôles utilisateur

| Action | Admin | Manager | Employee | Viewer |
|--------|-------|---------|----------|--------|
| Voir ses heures | ✅ | ✅ | ✅ | ❌ |
| Voir heures équipe | ✅ | ✅ | ❌ | ❌ |
| Voir heures autres | ✅ | ❌ | ❌ | ❌ |
| Saisir ses heures | ✅ | ✅ | ✅ | ❌ |
| Saisir heures autres | ✅ | ✅ | ❌ | ❌ |
| Approuver timesheet | ✅ | ✅ | ❌ | ❌ |
| Gestion employés | ✅ | ❌ | ❌ | ❌ |
| Voir congés | ✅ | ✅ | ✅ | ❌ |
| Demander congé | ✅ | ✅ | ✅ | ❌ |
| Approuver congé | Odoo only | Odoo only | ❌ | ❌ |

### 6.2 Nouveau rôle "Manager"

```prisma
model UserFarm {
  role String @default("Viewer") 
  // "Admin", "Editor", "Viewer", "Manager" (NEW!)
}
```

**Manager:**
- Peut voir timesheet équipe (employees managedBy = him)
- Peut approuver timesheet de son équipe
- Peut voir congés équipe
- Peut exporter paie pour équipe
- NO user management, NO farm settings

---

## 7. EXPORT PAIE

**Qui peut:** Admin + Manager (pour sa team)

**Contenu:**
```
Employé | Heures travaillées | Heures dues | Différence | Congés pris | Taux/h | Brut mois
─────────────────────────────────────────────────────────────────────────────────────
Fabien  | 162h 30m           | 160h        | +2h 30m    | 5j (40h)   | CHF 22 | CHF 3570
Martin  | 155h 00m           | 160h        | -5h        | 0j         | CHF 20 | CHF 3100
```

**Format:**
- CSV (pour import Codomaster/paie)
- PDF (pour management)
- Excel pivot (analyse trends)

---

## 8. INTÉGRATION AVEC AUTRES MODULES

### 8.1 Intervention → Timesheet

Quand créer intervention (travaux ou carnet):
```
Intervention {
  ...
  employeeName: "Fabien",
  hoursWorked: 2.5
}
```

→ Auto-crée TimesheetEntry lié

### 8.2 Parcellaire + Travaux + RH

Dashboard vue agro:
- Parcelles avec interventions
- Chaque intervention montre : heures travaillées + coût RH

Exemple:
```
PF-2024-001 (Colza)
  Épandage 2026-05-15 : Fabien 2.5h → CHF 55 (coût RH)
  Labour 2026-05-20   : Martin 4h → CHF 80
  Total coût RH : CHF 135 pour cette parcelle
```

---

## 9. WIREFRAMES RH (À AJOUTER à WIREFRAMES.html)

À créer:
1. **Timesheet saisie rapide** (mobile + desktop)
2. **Dashboard heures employé** (graphe progression)
3. **Dashboard manager** (vue équipe + alerts)
4. **Menu RH** (burger menu avec sections)
5. **Création intervention** (champ heures ajout)

---

## 10. ROADMAP RH

### Phase 2+ (après parcellaire):
- [ ] Model EmployeeProfile + sync Odoo
- [ ] TimesheetEntry saisie libre
- [ ] Dashboard heures (employé + manager)
- [ ] Webhook Odoo leave-requests

### Phase 3+:
- [ ] Intégration heures sur interventions
- [ ] Export paie (CSV + PDF)
- [ ] Rôle "Manager" complet
- [ ] Alertes surtemps (+ heures, - heures)

### Phase 4+:
- [ ] Timesheet validation workflow
- [ ] Reporting RH avancé
- [ ] Intégration Codomaster paie

---

## 11. POINTS CLÉ MODULE RH

✅ **Ultra simple** : saisie HH:MM directe (no dropdown hell)  
✅ **Liée aux interventions** : mais AUSSI indépendante (flexible)  
✅ **Sync Odoo** : employee data + leave requests (bidirectionnelle)  
✅ **Manager** : peut approuver + voir équipe  
✅ **Export paie** : CSV ready pour Codomaster  
✅ **Dashboard intuitif** : heures travaillées vs dues (clair)  
✅ **Responsive** : mobile-friendly timesheet entry  

---

**FIN MODULE RH**

À intégrer dans SPEC.md + PRISMA.md + ROADMAP.md + WIREFRAMES.html
