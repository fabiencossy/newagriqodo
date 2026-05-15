# PHASE 0 — RÉCAPITULATIF (v2 après feedback)

**Date** : 2026-05-15
**Owner** : Claude Code (session terminal)
**Statut** : ✅ COMPLÉTÉE — révisée selon retours Fabien

---

## 🎯 Livrables

**9 composants** réutilisables esquissés (8 initiaux + 1 ajouté).
Pour chacun :
- Wireframe HTML interactif (desktop + mobile + états)
- Interface TypeScript stricte (`.types.ts`)
- Checklist de validation (`_CHECKLIST.md`)

### Index des composants

| # | Composant | Statut révision | Modules |
|---|---|---|---|
| 1 | **SearchBar** | 🔄 **Refonte complète style Odoo** | Toutes les listes |
| 2 | **ViewSwitcher** | 🔄 SVG light icons (plus d'emoji) | Toutes les listes |
| 3 | **ExportButton** | 🔄 Emoji retirés, SVG inline | Toutes les listes |
| 4 | **MapView** | 🔄 **Toolbar étendue** (lasso, dessin, points, mesure, groupe) | Parcellaire, Travaux |
| 5 | **AsideCard** | ✅ Inchangé (validé) | Tous modules |
| 6 | **TimesheetEntry** | 🔄 **Mode présence** (début/fin + pauses) | RH, Travaux |
| 7 | **HoursTableMonth** | ✅ Inchangé (validé) | RH |
| 8 | **LeaveRequestList** | ✅ Inchangé (validé) | RH |
| 9 | **FieldPicker** | 🆕 **Nouveau** | Tous (sélection lourde) |

---

## 🔁 Changements suite au feedback (v1 → v2)

### SearchBar — refonte complète style Odoo
Le composant générique input + filter pills devient le **SearchPanel Odoo** :
- Une seule barre avec **facets** (filtres actifs en chips bicolores `[champ | valeurs] [×]`)
- Au focus, **suggestions par champ** ("Rechercher 'darval' dans Nom / Code / …")
- Dropdown 3 colonnes : **Filtres** / **Regrouper** / **Favoris**
- Multi-valeur sur un champ → checkboxes (combinées en OR)
- Multi-champ → AND entre facets
- Favoris sauvegardables + partage

### ViewSwitcher — SVG light, plus d'emoji
- Icônes SVG inline style Lucide, 1.5 px stroke, 20 px
- 6 vues supportées : Table, Carte, Dashboard, Kanban, Liste, Calendrier
- Variantes : icon+label / icon-only / label-only

### ExportButton — sans emoji
- Tous les emoji remplacés par SVG inline
- Icônes : download, chevron, file-pdf/xlsx/csv, check
- Toast succès avec icône check SVG (au lieu de ✓ texte/emoji)

### MapView — toolbar enrichie
Nouvelle toolbar latérale gauche (7 outils) :
- **S** Sélection
- **L** Lasso (sélection multiple par zone)
- **P** Dessiner une parcelle (polygone)
- **M** Ajouter un point (intervention/observation/problème/note)
- **R** Mesurer (distance ou surface)
- **G** Grouper parcelles (rotation/secteur/lot)
- **Y** Couches

Types ajoutés : `MapTool`, `ParcelGroup`, `MapMarker`, `DrawEvent`. Markers colorés par type avec légende permanente.

### TimesheetEntry — mode présence
Deux modes au choix :
- **Total** (HH:MM ou décimal) — saisie rapide
- **Présence** — début + fin + **pauses** (N pauses possibles, catégorisables : repas / courte / technique)
  - Calcul auto live : `plage − pauses = total effectif`
  - Validation chevauchement de pauses
  - Validation fin > début (opt-in overnight)

Helpers ajoutés : `computePresenceHours`, `validateBreak`, `findOverlappingBreaks`, `durationMinutes`.

### FieldPicker — nouveau composant
Sélecteur plein écran pour relations lourdes (produits, parcelles, employés, …) :
- Trigger compact (chips en multi)
- Modal plein écran avec :
  - Barre de recherche en haut
  - Panneau **Catégories** à gauche (groupes hiérarchiques)
  - Liste **Résultats** à droite (single ou multi-select avec checkbox)
  - Footer : compteur + bouton "+ Créer" optionnel + Annuler/Valider
- Support : datasets sync (props `items`) ou async (`fetchItems`)
- `maxSelection`, `allowCreate`, `onCreate`, debounce…

---

## 🏗️ Standards (inchangés)

### Design tokens
```css
--primary: #2d5016        /* Vert Qodo */
--accent:  #875a7b        /* Aubergine Odoo (chips, outils actifs) */
--bg:      #fafaf7
--surface: #ffffff
--text:    #1a1a1a
--muted:   #6b6b6b
--border:  #e5e5e5
--radius:  6px
--success: #16a34a · --warning: #f59e0b · --error: #dc2626
```

### Icônes
**SVG inline uniquement**, style Lucide, 1.5 px stroke, currentColor.
Tailles : 14 px (sm), 16 px (default), 18 px (md), 20 px (lg).
Plus aucun emoji dans les composants.

### Cibles tactiles
- 44 px : boutons principaux mobile, inputs, trigger pickers
- 40 px : items de liste, boutons d'action
- 36 px : controls secondaires (zoom carte, segmented compact)
- 32 px : icônes inline (avec padding pour atteindre 32 effectif)

---

## ⚠️ Points à valider avec Fabien avant Phase 1

### 🔴 Bloquants Phase 1
1. **MapView — Tile server** : self-hosted (OpenMapTiles sur VPS) ou MapTiler Cloud (€) ?
2. **ExportButton — Logo Qodo** : SVG/PNG prêt ?
3. **TimesheetEntry — Endpoint Odoo** : URL + auth pour `hr.attendance` création ?
4. **TimesheetEntry mode Total → Attendance** : quelles bornes `check_in/check_out` ?
   Proposition : `08:00` + durée. À valider avec le métier.

### 🟡 Souhaitables
5. **SearchBar Favoris** : backend (table dédiée ? Odoo `ir.filters` ?)
6. **MapView groupes** : modèle de persistance (Odoo `agri.parcel.group` à créer ?)
7. **FieldPicker** : seuil de bascule async (>50 items ? >200 ?)
8. **FieldPicker création inline** : workflow validation côté Odoo ?

### 🟢 Esthétique
9. **MapView** : palette de couleurs par culture (à définir)
10. **TimesheetEntry pauses** : catégorie de pause = compte analytique distinct Odoo ?

---

## 📁 Structure finale

```
Phase0_Components/
├── SearchBar/          ← v2 (style Odoo)
├── ViewSwitcher/       ← v2 (SVG light)
├── ExportButton/       ← v2 (sans emoji)
├── MapView/            ← v2 (toolbar étendue)
├── AsideCard/          ← v1 validé
├── TimesheetEntry/     ← v2 (mode présence)
├── HoursTableMonth/    ← v1 validé
├── LeaveRequestList/   ← v1 validé
├── FieldPicker/        ← v2 NOUVEAU
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

**Inchangé** : validation des 4 bloquants par Fabien, puis scaffold (React + Vite + TS + Tailwind ?),
provisionner tile server, et commencer par les composants atomiques (Sprint 1).

Ordre suggéré révisé :
- **Sprint 1** (atomiques) : SearchBar (Odoo) · ViewSwitcher · ExportButton · FieldPicker
- **Sprint 2** (layout) : AsideCard · HoursTableMonth · LeaveRequestList
- **Sprint 3** (lourd) : MapView (Maplibre + draw + measure) · TimesheetEntry (Odoo Hook 1, 2 modes)

---

## ✅ Status

**Phase 0 v2 : COMPLÈTE**
**Prochaine étape** : Validation Fabien → kick-off Phase 1
