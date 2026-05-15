# PHASE 0 — RÉCAPITULATIF

**Date** : 2026-05-15
**Owner** : Claude Code (session terminal)
**Statut** : ✅ COMPLÉTÉE
**Délai** : 1 session

---

## 🎯 Livrables

8 composants réutilisables esquissés. Pour chacun :
- ✅ Wireframe HTML interactif (desktop + mobile + états)
- ✅ Interface TypeScript stricte (`.types.ts`)
- ✅ Checklist de validation (`_CHECKLIST.md`)

### Index des composants

| # | Composant | Modules consommateurs | Fichiers |
|---|---|---|---|
| 1 | **SearchBar** | Toutes les listes | `SearchBar/` |
| 2 | **ViewSwitcher** | Toutes les listes | `ViewSwitcher/` |
| 3 | **ExportButton** | Toutes les listes | `ExportButton/` |
| 4 | **MapView** | Parcellaire, Travaux | `MapView/` |
| 5 | **AsideCard** | Tous modules | `AsideCard/` |
| 6 | **TimesheetEntry** | RH, Travaux | `TimesheetEntry/` |
| 7 | **HoursTableMonth** | RH | `HoursTableMonth/` |
| 8 | **LeaveRequestList** | RH | `LeaveRequestList/` |

---

## 🔑 Décisions clés prises (sans clarification)

> Mode autonome : Fabien a demandé de proceeder sans poser de questions, "fais toi même".
> Toutes les décisions ci-dessous sont documentées dans les checklists et sont **révisables avant Phase 1**.

### SearchBar
- Filter pills affichés sous la barre (réversible via prop)
- Debounce 300 ms par défaut
- Composant **générique** : presets de filtres définis par chaque module

### ViewSwitcher
- Icônes 20 px
- Délai tooltip 400 ms
- Segmented control ≥ 768 px, dropdown < 768 px

### ExportButton
- Dropdown si plusieurs formats, bouton direct sinon
- PDF avec logo + filtres + timestamp
- CSV avec séparateur `;` + BOM UTF-8 (compat Excel FR)
- Excel raw data + en-tête figé (pas de formules en Phase 0)

### MapView
- Tiles **Maplibre GL self-hosted** (URL placeholder, à provisionner Phase 1)
- Zoom range 5–20
- Mode dessin **opt-in** (prop)
- Desktop : map + aside 320 px · Mobile : plein écran + bottom sheet

### AsideCard
- Animation 250 ms (respecte `prefers-reduced-motion`)
- Layout consistant, contenu piloté par `FieldConfig[]`
- Mode édition opt-in via `editable: true`
- Largeur desktop 360 px

### TimesheetEntry
- Max **16 h/jour**
- Dates passées **≤ 90 jours**, futures **bloquées** par défaut
- Format `HH:MM` ou décimal (helper `parseHoursInput`)
- Hook 1 (Attendance Odoo auto) câblé via `onSubmit` côté parent

### HoursTableMonth
- Ligne YTD en bas (par défaut)
- Colonnes triables (mois / travaillées / dues / solde)
- Format `HH:MM` par défaut, option décimale
- Card view ≤ 600 px
- Color coding ± toujours accompagné d'un signe (a11y daltonisme)

### LeaveRequestList
- **Read-only** strict (création dans Odoo)
- Manager notes / commentaires **masqués** (vue employé)
- Solde annuel en pill (haut)
- Bannière dégradée si sync Odoo down

---

## 🏗️ Standards appliqués partout

### TypeScript
- Strict mode (pas de `any`)
- `*.types.ts` séparé du composant (réutilisable côté store / API)
- `*_DEFAULTS` exporté pour chaque composant
- Helpers utilitaires colocalisés (ex: `parseHoursInput`, `computeYtd`)

### Accessibilité (WCAG AA)
- `role` ARIA approprié sur chaque conteneur
- `aria-label` explicite sur tous les boutons icône-seule
- `aria-busy` durant loading
- `aria-invalid` + `aria-describedby` pour erreurs
- `aria-sort` sur colonnes triables
- Cibles tactiles ≥ 44 px (mobile), 36–40 px (desktop)
- Contraste texte vérifié ≥ 4.5:1
- Signes (+/−/0) accompagnent toujours le color coding
- `prefers-reduced-motion` respecté pour les animations

### Design tokens (cohérents inter-composants)
```css
--primary: #2d5016        /* Vert Qodo */
--primary-hover: #1f3a0e
--bg: #fafaf7
--surface: #ffffff
--text: #1a1a1a
--muted: #6b6b6b
--border: #e5e5e5
--accent: #f4a261        /* Orange (parcelles map) */
--success: #16a34a
--warning: #f59e0b
--error: #dc2626
--radius: 6px
```

### Breakpoint
- Mobile-first
- Desktop kicks in @ `min-width: 768px` (sauf cas spéciaux : tableau heures 600 px, AsideCard 768 px)

---

## ⚠️ Points à clarifier / réviser avec Fabien avant Phase 1

Ces points ont été tranchés par défaut raisonnable, mais méritent une validation explicite :

### 🔴 Bloquant Phase 1
1. **MapView — Tile server** : self-hosted (Phase 1 = setup OpenMapTiles sur VPS) ou MapTiler Cloud ($) ?
2. **ExportButton — Logo Qodo** : avons-nous un asset prêt (SVG/PNG) pour le PDF ?
3. **TimesheetEntry — Endpoint Odoo** : URL + auth pour création Attendance (Hook 1) ?

### 🟡 Souhaitable mais pas bloquant
4. **SearchBar — Sync URL params** : `?q=darval&culture=ble` à supporter dès Phase 1 ?
5. **AsideCard — Sauvegarde optimistic** : UI update immédiat puis rollback si erreur, ou attendre la réponse ?
6. **LeaveRequestList — Pagination** : seuil pour passer en lazy load (50 ? 100 ?) ?

### 🟢 Esthétique / nice-to-have
7. **MapView — Couleurs parcelles** : palette par culture à définir (Phase 1 ou plus tard)
8. **ExportButton — Excel formules** : pertinent pour Carnet uniquement, ou jamais ?
9. **HoursTableMonth — Graphique** : confirmé "no graphs" dans le spec, OK pour Phase 0/1 ?

---

## 📁 Structure finale

```
Phase0_Components/
├── SearchBar/
│   ├── SearchBar.html
│   ├── SearchBar.types.ts
│   └── SearchBar_CHECKLIST.md
├── ViewSwitcher/
├── ExportButton/
├── MapView/
├── AsideCard/
├── TimesheetEntry/
├── HoursTableMonth/
├── LeaveRequestList/
└── PHASE_0_SUMMARY.md  ← vous êtes ici
```

Total : **8 dossiers · 24 fichiers livrables + 1 résumé**.

---

## ➡️ Next : Phase 1

### Pré-requis avant code
1. Validation par Fabien des décisions ci-dessus (en particulier les 3 bloquants 🔴)
2. Setup du repo : `npm init` + scaffold (React + Vite + TypeScript suggéré)
3. Provisionner tile server Maplibre (VPS) — peut démarrer en parallèle
4. Dependencies à installer : `react`, `maplibre-gl`, `jspdf`, `papaparse`, `exceljs`, framework UI (Tailwind ?), tests (Vitest + RTL)
5. ESLint + Prettier + Husky (`.claudecode.json` hooks à activer)

### Ordre d'implémentation suggéré (Phase 1)
Reprend l'ordre Phase 0, mais regroupé par effort :

**Sprint 1 — Atomiques** (≈1 semaine)
- SearchBar
- ViewSwitcher
- ExportButton

**Sprint 2 — Layout** (≈1 semaine)
- AsideCard
- HoursTableMonth
- LeaveRequestList

**Sprint 3 — Lourd** (≈2 semaines)
- MapView (intégration Maplibre + drawing)
- TimesheetEntry (intégration Odoo Hook 1)

### Critères de done Phase 1 (par composant)
- [ ] Implémentation React fonctionnelle
- [ ] Storybook (1 story par état du wireframe)
- [ ] Tests unitaires (≥ 80 % coverage)
- [ ] Test a11y automatisé (jest-axe)
- [ ] Pris dans un module pilote

---

## ✅ Status

**Phase 0 : COMPLÈTE**
**Prochaine étape** : Validation Fabien → kick-off Phase 1
