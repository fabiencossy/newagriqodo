# PHASE 1 — CLARIFICATIONS ACCEPTÉES PAR FABIEN

**Date:** 2026-05-15  
**Status:** ✅ CONFIRMÉES

---

## 1. Plan d'assolement

### Structure
- ✅ **UN plan global par ferme** (pas par parcelle)
  - Timeline centralisée pour toute l'exploitation
  - Visualisation croisée: toutes parcelles + rotations sur une même vue

### Timeline
- ✅ **Granularité: PAR ANNÉE** (rotation long-term)
  - Vue annuelle (Jan → Dec)
  - Pour planification pluriannuelle de rotations
  - *Pas* de detail mensuel/hebdo

### Source des données
- ✅ **Créées LOCALEMENT dans Agricodo** (éditable par utilisateur)
  - Pas de sync depuis Odoo
  - Données stockées en DB locale
  - Utilisateur complète le plan pour chaque année

### Coloration
- ✅ **Par CULTURE** (palette distincte par type)
  - Blé = Jaune #F4D03F
  - Maïs = Vert #52BE80
  - Orge = Marron #CD7F32
  - Betterave = Orange #E67E22
  - Tournesol = Or #F39C12
  - Colza = Rouge #E74C3C
  - Luzerne = Vert foncé #27AE60
  - Avoine = Tan #D2B48C
  - Soja = Pourpre #7D3C98
  - Jachère = Gris #95A5A6

---

## 2. FAB Contextuel

### Actions principales (toujours visibles)
- ✅ **4 actions** intégrées:
  1. Ajouter une parcelle
  2. Ajouter une intervention
  3. Ajouter observation/photo
  4. Voir carnet des champs

### Pattern
- ✅ **2-3 actions FIXES** (toujours accessibles)
  - + Menu contextuel déroulable
  - Actions change selon contexte (parcelle selected, map empty, etc.)
  - **Règle critique:** Les actions principales restent TOUJOURS accessibles
  - Pas de FAB qui disparaît selon contexte

### Comportement contextuel
```
MAP VIEW:
- Fixed: Ajouter parcelle + Ajouter intervention
- Contextual (parcelle selected): + Ajouter observation + Voir carnet

TABLE VIEW:
- Fixed: Ajouter parcelle + Ajouter intervention
- Contextual (row selected): + Ajouter observation

TRAVAUX:
- Fixed: Ajouter intervention
- Contextual (intervention selected): + Ajouter observation

TROUPEAU:
- Fixed: Ajouter animal
- Contextual (animal selected): + Ajouter événement + Voir historique
```

---

## 3. Parcelles — Visuels

### Couleurs
- ✅ **Par CULTURE** (définies ci-dessus)

### Labels
- ✅ **Au SURVOL UNIQUEMENT** (hover tooltip)
  - Affiche: "NOM — CULTURE · SURFACE ha"
  - Exemple: "PF-001 — Blé · 2.5 ha"
  - Au clic: ouvre AsideCard pour détails complets
  - **Pas** de labels permanents (trop chargé visuellement)

### Effects visuels
- ✅ Parcelle normal: Couleur culture, opacité normale
- ✅ OnHover: Border highlight (2px), pulse subtil
- ✅ OnSelect: Border glow (3px), shadow
- ✅ OnActive (aside): Extra shadow

---

## 4. RH — Congés

### Qui peut créer
- ✅ **SEULEMENT l'EMPLOYÉ pour LUI-MÊME**
  - Pas de création par Manager
  - Pas de création par Admin
  - Employé crée sa propre demande

### Workflow
1. Employé crée demande locale (dateFrom, dateTo, reason)
2. Status: `draft` localement
3. Employé clique "Soumettre" → sync Odoo
4. Status passe à `pending` (en attente approbation Odoo)
5. Manager approuve/rejette dans Odoo
6. Odoo webhook notifie Agricodo → update status
7. Employé voit status final (approved/rejected)

### Validation locale
- ✅ Check contre jours restants (from Odoo)
- ✅ Check contre jours fériés suisses
- ✅ Check contre heures contractuelles

### Data source
- ✅ Master data employé: READ-ONLY depuis Odoo
- ✅ Demandes congés: Créables LOCALEMENT + sync bidirectionnelle
- ✅ Approvals: SEULEMENT depuis Odoo (manager approuve there)

---

## 5. Colonnes Configurables

### Persistence
- ✅ **localStorage** (sauvegardé par navigateur)
  - Clé: `agricodo_columns_{userId}_{moduleName}`
  - Chaque utilisateur ses préférences propres
  - **Pas** de sync cross-device
  - **Pas** de stockage DB (overhead inutile)

### Scope
- ✅ **Par utilisateur** (chacun ses colonnes)
  - Pas global ferme (chacun personnalise sa vue)

### Colonnes verrouillées
- ✅ **"Nom" toujours visible** et non-removable
- ✅ Autres colonnes: librement show/hide

### UI Pattern
- ✅ Icône ⚙️ sur chaque tableau
- ✅ Click → Modal "Colonnes visibles"
- ✅ Checkboxes pour show/hide
- ✅ Save/Cancel buttons
- ✅ Auto-save en localStorage après modification

### Default columns par module
```typescript
{
  parcellaire: ['name', 'culture', 'surface', 'status', 'interventions'],
  travaux: ['name', 'date', 'type', 'parcelle', 'duration', 'status'],
  troupeau: ['name', 'type', 'age', 'health', 'lastEvent'],
  carnet: ['date', 'type', 'parcelle', 'culture', 'operation', 'notes']
}
```

---

## 🎯 APPROCHE DÉVELOPPEMENT

### Parallèle sur 2-3 fronts
- ✅ **Start simultanément:**
  - Assolement (major feature)
  - FAB contextuel (UX improvement)
  - Parcelles visuels (polish)
- ✅ **Puis:**
  - RH Congés (medium effort)
  - Colonnes (lower priority)

### Estimation
- Assolement: 1.5 semaines
- FAB: 4 jours
- Visuels: 2 jours
- Congés: 5 jours
- Colonnes: 3 jours
- Tests/Polish: 3 jours
- **Total: ~4 semaines**

---

## ✅ RÉSUMÉ DÉCISIONS

| Feature | Décision | Confirmé |
|---------|----------|----------|
| **Assolement — Structure** | Global par ferme | ✅ |
| **Assolement — Timeline** | Par année | ✅ |
| **Assolement — Source** | Local (pas Odoo) | ✅ |
| **Assolement — Couleurs** | Par culture | ✅ |
| **FAB — Pattern** | 2-3 fixed + contextual | ✅ |
| **FAB — Actions** | 4 principales toujours | ✅ |
| **Parcelles — Labels** | Hover only | ✅ |
| **Parcelles — Couleurs** | Par culture | ✅ |
| **Congés — Création** | Employé seulement | ✅ |
| **Congés — Sync** | Local + Odoo bidirectionnel | ✅ |
| **Colonnes — Persistence** | localStorage | ✅ |
| **Colonnes — Scope** | Per user | ✅ |
| **Approche** | Parallèle 2-3 fronts | ✅ |

---

## 🚀 PROCHAINES ÉTAPES

1. Copier `PHASE_1_PROMPT_CLAUDE_CODE.md` dans le projet
2. Lancer Claude Code avec le nouveau prompt
3. Claude Code implémente les 5 features parallèlement
4. Check-in quotidiens sur la progression
5. Tests + validation avant Phase 2

---

**Statut:** ✅ PRÊT POUR PHASE 1  
**Date:** 2026-05-15  
**Approuvé par:** Fabien Cossy

Allons-y! 🌾
