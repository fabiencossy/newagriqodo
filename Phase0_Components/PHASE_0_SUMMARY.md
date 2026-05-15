# PHASE 0 — RÉCAPITULATIF (v3)

**Date** : 2026-05-15
**Owner** : Claude Code (session terminal)
**Statut** : ✅ COMPLÈTE — 3 itérations de feedback intégrées

---

## 🎯 Livrables

**9 composants** réutilisables esquissés. Pour chacun :
- Wireframe HTML interactif (desktop + mobile + états)
- Interface TypeScript stricte (`.types.ts`)
- Checklist de validation (`_CHECKLIST.md`)

### Index des composants

| # | Composant | v1 → v2 → v3 | Modules |
|---|---|---|---|
| 1 | **SearchBar** | v1 input/pills → v2 Odoo SearchPanel → **v3 dark compact** | Toutes les listes |
| 2 | **ViewSwitcher** | v1 emoji → v2 SVG light | Toutes les listes |
| 3 | **ExportButton** | v1 emoji → v2 SVG inline | Toutes les listes |
| 4 | **MapView** | v1 basique → v2 toolbar 7 outils | Parcellaire, Travaux |
| 5 | **AsideCard** | v1 validé | Tous |
| 6 | **TimesheetEntry** | v1 décimal → v2 Total+Présence → **v3 présence uniquement** | RH, Travaux |
| 7 | **HoursTableMonth** | v1 validé | RH |
| 8 | **LeaveRequestList** | v1 validé | RH |
| 9 | **FieldPicker** | v2 modal fullscreen → **v3 popup desktop + mobile fullscreen** | Tous |

---

## 🔁 Changements de v2 → v3

### SearchBar — dark compact (réf. image)
- Une seule ligne horizontale, fond sombre `#1f242b`
- Loupe + icône entonnoir à gauche
- Facets aubergine inline + input
- Chevron à droite pour ouvrir Filtres / Regrouper / Favoris
- Variante claire (`.sb.light`) pour pages au fond clair
- Hauteur 36 px desktop / 40 px mobile

### FieldPicker — popup desktop + mobile fullscreen
- **Desktop** : popup attaché sous le trigger (~480 px), max-height 280 px
  - Catégories en onglets horizontaux compacts (plus de panneau latéral)
- **Mobile** : reste plein écran
  - Header iOS-style (retour à gauche, OK à droite)
  - Catégories en chips pill scrollables
  - Items 44 px tactiles
- Nouveau prop `layout: 'auto' | 'popup' | 'fullscreen'` (défaut `auto`)
- Breakpoint configurable (`fullscreenBreakpointPx: 600`)

### TimesheetEntry — toujours présence (Total retiré)
- Mode "Total" supprimé : toujours **début + fin + pauses**
- Calcul auto en direct (Plage − Pauses = Effectif)
- **Nouveau** : raccourcis horaires (preset buttons) sous chaque champ
- Helper `isBreakWithinRange()` ajouté pour valider la cohérence pauses ↔ plage
- Cohérent avec sémantique Odoo `hr.attendance` (check_in / check_out)

---

## 🏗️ Standards (inchangés)

### Design tokens
```css
--primary: #2d5016        /* Vert Qodo */
--accent:  #875a7b        /* Aubergine Odoo */
--bg:      #fafaf7
--surface: #ffffff
--text:    #1a1a1a
--muted:   #6b6b6b
--border:  #e5e5e5
--radius:  6px
--success: #16a34a · --warning: #f59e0b · --error: #dc2626

/* Dark variant (SearchBar) */
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
- 36 px : segmented control desktop, barre dark compact
- 26-32 px : preset buttons, chips catégories

---

## ⚠️ Points à valider avec Fabien avant Phase 1

### 🔴 Bloquants Phase 1
1. **MapView — Tile server** : self-hosted (OpenMapTiles sur VPS) ou MapTiler Cloud (€) ?
2. **ExportButton — Logo Qodo** : SVG/PNG prêt ?
3. **TimesheetEntry — Endpoint Odoo** : URL + auth pour `hr.attendance` création ?
4. **TimesheetEntry — Stockage pauses Odoo** : modèle custom `hr.attendance.break`, JSON field, ou plusieurs attendances ?

### 🟡 Souhaitables
5. **SearchBar Favoris** : backend (`ir.filters` Odoo ?)
6. **MapView groupes** : modèle `agri.parcel.group` à créer Odoo ?
7. **FieldPicker** : seuil large dataset pour bascule async (>50, >200) ?
8. **FieldPicker** : création inline → workflow de validation Odoo ?

### 🟢 Esthétique
9. **MapView** : palette par culture
10. **TimesheetEntry** : catégorie de pause = compte analytique distinct ?
11. **SearchBar** : choix entre theme `dark` global ou par contexte (page sombre vs claire) ?

---

## 📁 Structure finale

```
Phase0_Components/
├── SearchBar/          ← v3 (dark compact, réf. image)
├── ViewSwitcher/       ← v2 (SVG light)
├── ExportButton/       ← v2 (sans emoji)
├── MapView/            ← v2 (toolbar étendue)
├── AsideCard/          ← v1 validé
├── TimesheetEntry/     ← v3 (présence uniquement)
├── HoursTableMonth/    ← v1 validé
├── LeaveRequestList/   ← v1 validé
├── FieldPicker/        ← v3 (popup desktop + mobile fullscreen)
└── PHASE_0_SUMMARY.md  ← vous êtes ici
```

Total : **9 dossiers · 27 fichiers livrables + 1 résumé**.

---

## 🌐 Aperçu local

Serveur lancé via `python3 -m http.server 8765` dans `Phase0_Components/`.

- Index : http://localhost:8765/
- Composants :
  - http://localhost:8765/SearchBar/SearchBar.html
  - http://localhost:8765/ViewSwitcher/ViewSwitcher.html
  - http://localhost:8765/ExportButton/ExportButton.html
  - http://localhost:8765/MapView/MapView.html
  - http://localhost:8765/AsideCard/AsideCard.html
  - http://localhost:8765/TimesheetEntry/TimesheetEntry.html
  - http://localhost:8765/HoursTableMonth/HoursTableMonth.html
  - http://localhost:8765/LeaveRequestList/LeaveRequestList.html
  - http://localhost:8765/FieldPicker/FieldPicker.html

Pour stopper : `pkill -f 'http.server 8765'`.

---

## ➡️ Next : Phase 1

Validation des 4 bloquants par Fabien, puis scaffold (React + Vite + TS + Tailwind ?),
provisionner tile server, démarrer les composants atomiques.

Ordre suggéré :
- **Sprint 1** (atomiques) : SearchBar (dark) · ViewSwitcher · ExportButton · FieldPicker
- **Sprint 2** (layout) : AsideCard · HoursTableMonth · LeaveRequestList
- **Sprint 3** (lourd) : MapView (Maplibre + draw + measure) · TimesheetEntry (Odoo Hook 1)

---

## ✅ Status

**Phase 0 v3 : COMPLÈTE**
**Prochaine étape** : Validation Fabien → kick-off Phase 1
