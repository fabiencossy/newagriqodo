# PHASE 0 — RÉCAPITULATIF (v4)

**Date** : 2026-05-15
**Owner** : Claude Code (session terminal)
**Statut** : ✅ COMPLÈTE — 4 itérations de feedback intégrées

---

## 🎯 Livrables

**9 composants** réutilisables esquissés + assets logo. Pour chaque composant :
- Wireframe HTML interactif (desktop + mobile + états)
- Interface TypeScript stricte (`.types.ts`)
- Checklist de validation (`_CHECKLIST.md`)

### Index des composants

| # | Composant | État v4 | Modules |
|---|---|---|---|
| 1 | **SearchBar** | 🔄 **Light par défaut** (dark = opt-in) | Toutes les listes |
| 2 | **ViewSwitcher** | ✅ v2 SVG light | Toutes les listes |
| 3 | **ExportButton** | ✅ v2 sans emoji | Toutes les listes |
| 4 | **MapView** | ✅ v2 toolbar + 🆕 reco tile server | Parcellaire, Travaux |
| 5 | **AsideCard** | ✅ v1 | Tous |
| 6 | **TimesheetEntry** | ✅ v3 présence + 🆕 doc Odoo | RH, Travaux |
| 7 | **HoursTableMonth** | ✅ v1 | RH |
| 8 | **LeaveRequestList** | ✅ v1 | RH |
| 9 | **FieldPicker** | 🔄 **Mobile : chips si ≤5 cats, dropdown si >5** | Tous |

### Assets ajoutés

| Asset | Chemin | Source |
|---|---|---|
| Logo horizontal light | `assets/logo/qodo_logo_h_light.svg` | Drive Qodo Branding |
| Logo horizontal dark | `assets/logo/qodo_logo_h_dark.svg` | Drive Qodo Branding |
| Picto light | `assets/logo/qodo_logo_p_light.svg` | Drive Qodo Branding |
| Picto dark | `assets/logo/qodo_logo_p_dark.svg` | Drive Qodo Branding |

---

## 🔁 Changements v3 → v4

### SearchBar — light par défaut
- Theme `'light'` par défaut (au lieu de `'dark'`)
- Variante `dark` reste disponible (`.sb.dark` ou `theme: 'dark'`)
- Le visuel de référence (image Fabien) reste reproduit, juste sur fond clair

### FieldPicker — règle de bascule catégories mobile
- **≤ 5 catégories** → chips horizontales (comportement v3)
- **> 5 catégories** → dropdown vertical large (toute la largeur)
- **Plusieurs groupes nommés** → toujours dropdown (les chips ne supportent pas la hiérarchie)
- Configurable via prop `mobileCategoryDropdownThreshold` (défaut 5)
- 2 nouveaux wireframes mobile illustrant chaque cas

### TimesheetEntry — pause = absence de timbrage
- Une pause **n'est pas un objet métier** — c'est juste une absence de timbrage entre 2 présences continues.
- Côté Odoo : créer **N `hr.attendance`** (une par segment de présence continue), pas une seule avec champ "pauses".
- Exemple : `07:30 → 17:30` avec pauses `10:00-10:15` et `12:00-13:00`
  = 3 `hr.attendance` (07:30-10:00, 10:15-12:00, 13:00-17:30)
- Helper `splitPresenceIntoAttendances(start, end, breaks)` retourne les segments
- Fidèle au modèle natif Odoo (rapports, dashboards existants marchent direct)
- **Mapping user Qodo ↔ hr.employee Odoo** : table de mapping côté backend (hors scope composant)

### MapView — recommandation tile server
- ✅ Décision Fabien : **Self-hosted OpenMapTiles** sur VPS Qodo
- Setup ~½ journée, coût récurrent 0, souveraineté complète des données GPS
- Stack simple : container `tileserver-gl` + `.mbtiles` Switzerland + styles custom
- Détaillé dans `MapView_CHECKLIST.md` (section "Infra Phase 1")

### Logo — récupéré du Drive
- 4 variantes SVG copiées dans `assets/logo/` (horizontal/picto × light/dark, sans fond)
- Prêt à câbler dans ExportButton (PDF header) en Phase 1

---

## 🏗️ Standards

### Design tokens
```css
/* Couleurs */
--primary: #2d5016        /* Vert Qodo */
--accent:  #875a7b        /* Aubergine Odoo */
--bg:      #fafaf7
--surface: #ffffff
--text:    #1a1a1a
--muted:   #6b6b6b
--border:  #e5e5e5
--success: #16a34a · --warning: #f59e0b · --error: #dc2626

/* Border radius — système unifié (v6) */
--radius-sm:   6px      /* Petits éléments inline (hover bg interne, divers) */
--radius:     10px      /* Boutons, inputs, cards, conteneurs principaux */
--radius-lg:  16px      /* Modals, bottom sheets, grosses cards */
--radius-pill: 999px    /* Chips, facets, badges, balance pills */
```

**Règle de cohérence** :
- Plus aucune valeur de `border-radius` en dur dans les wireframes (sauf `50%` pour cercles : FAB, dots)
- Boutons & inputs & cards : `var(--radius)` (10 px)
- Chips et tags : `var(--radius-pill)` (pill complète)
- Petits éléments (hover bg de boutons icône) : `var(--radius-sm)`
- Conteneurs modaux mobile : `var(--radius-lg)`

/* Dark (SearchBar opt-in) */
--bar-bg:      #1f242b
--bar-bg-hover:#262c34
--bar-fg:      #e8eaed
--bar-muted:   #8a93a0
--bar-border:  #2d343d
```

### Icônes
SVG inline uniquement, style Lucide, 1.5 px stroke, currentColor.
Plus aucun emoji dans les wireframes.

### Cibles tactiles
- 44 px : boutons principaux mobile, inputs, trigger pickers, items mobile
- 40 px : items popup desktop, trigger compact
- 36 px : segmented control desktop, barre compact
- 26-32 px : preset buttons, chips catégories

---

## ✅ Points résolus (v3 → v4)

| Point | Statut |
|---|---|
| Logo Qodo prêt ? | ✅ SVG dispo dans `assets/logo/` |
| MapView tile server | ✅ Self-hosted OpenMapTiles |
| Mapping user Qodo ↔ hr.employee Odoo | ✅ Table de mapping côté backend |
| Stockage pauses Odoo | ✅ Pas de stockage, calcul Qodo uniquement |

## ⚠️ Points restants pour Phase 1

### 🟡 Souhaitables
- **SearchBar Favoris** : backend Odoo (`ir.filters` natif ou table custom) ?
- **MapView groupes** : modèle `agri.parcel.group` à créer côté Odoo ?
- **FieldPicker** : seuil large dataset pour bascule async (>50, >200) ?
- **FieldPicker** : workflow de validation Odoo pour création inline ?

### 🟢 Esthétique / Phase 1
- **MapView** : palette par culture (générée auto ou définie en master data ?)
- **TimesheetEntry** : catégories de pauses (`meal/short/technical`) — utiliser ou simplifier ?
- **SearchBar** : `theme: 'auto'` → suit `prefers-color-scheme` côté navigateur ou variable CSS parent ?

---

## 📁 Structure finale

```
NewagriQodo/
├── assets/
│   └── logo/
│       ├── qodo_logo_h_light.svg
│       ├── qodo_logo_h_dark.svg
│       ├── qodo_logo_p_light.svg
│       └── qodo_logo_p_dark.svg
└── Phase0_Components/
    ├── SearchBar/          ← v4 (light par défaut)
    ├── ViewSwitcher/       ← v2 (SVG light)
    ├── ExportButton/       ← v2 (sans emoji)
    ├── MapView/            ← v2 + reco tile server
    ├── AsideCard/          ← v1
    ├── TimesheetEntry/     ← v3 + doc Odoo précise
    ├── HoursTableMonth/    ← v1
    ├── LeaveRequestList/   ← v1
    ├── FieldPicker/        ← v4 (mobile dropdown >5 cats)
    └── PHASE_0_SUMMARY.md  ← vous êtes ici
```

Total : **9 dossiers composants + 1 dossier assets · ~30 fichiers livrables**.

---

## 🌐 Aperçu local

Serveur sur http://localhost:8765/ (Phase0_Components/).

Pour stopper : `pkill -f 'http.server 8765'`.

---

## ➡️ Next : Phase 1

Plus de bloquants 🔴 — toutes les questions clés sont tranchées.

Ordre suggéré :
- **Sprint 1** (atomiques) : SearchBar (light) · ViewSwitcher · ExportButton · FieldPicker
- **Sprint 2** (layout) : AsideCard · HoursTableMonth · LeaveRequestList
- **Sprint 3** (lourd) : MapView (Maplibre + tile server self-hosted) · TimesheetEntry (Odoo Hook 1, mapping employé)

---

## ✅ Status

**Phase 0 v4 : COMPLÈTE — prête pour scaffold Phase 1**
