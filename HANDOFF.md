# NewagriQodo v2 — Rapport de passation (Cowork)

**Date** : 2026-05-15
**Owner sortant** : session Claude #1 (Opus 4.7 — 1M ctx)
**Repo** : `~/Projects/NewagriQodo` · branche `main`
**Dernier commit avant cette session** : `28a0c5e` (Switch Maplibre → Leaflet)
**État** : non commité (à fusionner avec ce qui suit ci-dessous)

---

## ⚡ TL;DR

Refonte UX du module **Agri Qodo** (Qodo Digital, applis pour exploitations agricoles suisses). Distinct de la prod actuelle `newagri.qodo.ch` (VPS Infomaniak `83.228.247.77`) — c'est une **nouvelle version 2** sous `app/`.

État courant :
- Phase 0 : 9 composants UI esquisses HTML validées (`Phase0_Components/`)
- Phase 1 : 9 composants React livrés + 37 tests Vitest
- Phase 2 : app routée + module pilote **Parcellaire** fonctionnel + module **RH** complet (Mes heures / Mes congés / Saisir)
- **Carte fonctionne** depuis le switch Maplibre → Leaflet (commit `28a0c5e`)
- **Session itérative en cours** : polish UX Parcellaire après retours visuels du PO (images 47 → 57). Cf. section dédiée plus bas.

---

## 🏗️ Stack technique

| Outil | Version | Pourquoi |
|---|---|---|
| Vite | 8 | Build moderne, HMR rapide |
| React | 19 | Standard |
| TypeScript | 6 strict + `noUncheckedIndexedAccess` | Sécurité types |
| Tailwind | v4 | Design tokens via `@theme` dans `src/index.css` |
| React Router | v7 | `BrowserRouter` dans `main.tsx` |
| TanStack Query | 5 | Installé, **pas encore wired** (Phase 2.5 = data Odoo) |
| Zustand | 5 | Installé, **pas encore utilisé** |
| **Leaflet** | latest | Carte raster Swisstopo (a remplacé maplibre-gl) |
| Vitest | 4 | 37 tests qui passent |
| ESLint + Prettier + Husky + lint-staged | — | Pre-commit auto, 0 warning |

---

## 📁 Structure de l'app (`app/src/`)

```
src/
├── App.tsx               ← React Router setup
├── main.tsx              ← BrowserRouter + StrictMode + createRoot
├── index.css             ← Tailwind v4 + @theme design tokens
│
├── components/           ← 9 composants Phase 1 livrés
│   ├── ViewSwitcher/
│   ├── SearchBar/        ← style Odoo SearchPanel (light)
│   │                       NB: z-[1000] sur SuggestionsList/FiltersDropdown
│   │                       (sinon caché par les panes Leaflet)
│   ├── ExportButton/     ← kebab menu, CSV natif fonctionnel
│   ├── FieldPicker/      ← popup desktop / fullscreen mobile
│   ├── AsideCard/        ← aside / bottom sheet
│   │                       + bouton "agrandir" (expand plein écran sur bottomsheet)
│   │                       + prop `onEdit` pour rediriger vers page détail
│   ├── HoursTableMonth/
│   ├── LeaveRequestList/
│   ├── TimesheetEntry/
│   └── MapView/          ← LEAFLET + Swisstopo
│
├── layouts/
│   ├── AppLayout.tsx     ← sidebar desktop / drawer mobile (z-[1100])
│   ├── FabContext.tsx    ← actions + `hidden` flag
│   ├── useFab.ts         ← hooks useFab + useFabActions + useHideFab
│   ├── Fab.tsx           ← bouton rond (z-[1050]) + bottom-sheet (z-[1110])
│   └── nav-items.tsx
│
├── modules/
│   ├── _shared/          ← PageContainer, PageHeader, StubPage
│   ├── parcellaire/
│   │   ├── ParcellairePage.tsx       ← Carte / Table / Dashboard
│   │   ├── ParcelleDetailPage.tsx    ← /parcellaire/:id édition
│   │   │                                Actions en header (Itinéraire / Intervention / Dupliquer)
│   │   │                                FAB masqué (useHideFab(true))
│   │   ├── ParcellaireTable.tsx
│   │   ├── parcellaire.mocks.ts      ← 12 parcelles mock (Lausanne)
│   │   └── filtering.ts
│   ├── travaux/         ← StubPage + FAB action
│   ├── troupeau/        ← StubPage + FAB actions
│   ├── rh/
│   │   ├── RHLayout.tsx
│   │   ├── MesHeuresPage.tsx
│   │   ├── SaisirPresencePage.tsx
│   │   └── MesCongesPage.tsx
│   └── parametres/      ← StubPage
│
├── hooks/
│   ├── useDebounced.ts
│   └── useMediaQuery.ts  ← useIsDesktop helper
│
└── test/setup.ts         ← jest-dom + matchMedia polyfill
```

---

## 🎨 Design tokens (cohérence stricte exigée par Fabien)

Dans `src/index.css` via `@theme` :

```css
--color-primary: #2d5016         /* Vert Qodo */
--color-accent:  #875a7b         /* Aubergine Odoo */
--color-bg: #fafaf7 · --color-surface: #ffffff · --color-text: #1a1a1a
--color-muted: #6b6b6b · --color-border: #e5e5e5
--color-success/warning/error: #16a34a / #f59e0b / #dc2626

--radius-sm: 6px · --radius: 10px · --radius-lg: 16px · --radius-pill: 9999px
```

**Règle absolue** : aucune valeur de border-radius en dur (sauf `50%` pour les cercles). Utiliser exclusivement les variables.

**Icônes** : SVG inline style Lucide, 1.5–1.75 px stroke, `currentColor`. **Pas d'emoji**.

**Cibles tactiles** : 44 px mobile, 36–40 px desktop.

---

## 🗺️ Carte — état actuel

Lib : **Leaflet** (basculée depuis Maplibre après échec persistant). Raster Swisstopo WMTS.

```
satellite : ch.swisstopo.swissimage
street    : ch.swisstopo.pixelkarte-farbe
topo      : ch.swisstopo.pixelkarte-farbe (idem street pour l'instant)
```

API publique du composant inchangée — `parcels`, `selectedId`, `selectedIds`, `onSelectionChange`, `basemap`, `activeTool`, `onToolChange`, `enabledTools`, `markers`, `center`, `zoom`, `height`, `interactive`.

### Rendu parcelles (cette session)

- **Couleurs plus vives** : `fillOpacity 0.6`, `weight 3`, contour = couleur de la culture (au lieu de noir terne).
- **Sélection** : contour blanc épais (4px) + fill vert primaire à 0.7.
- **Labels permanents** centrés via `bindTooltip({ permanent: true, direction: 'center', className: 'qodo-parcel-label' })`.
- **Font-size pilotée par zoom** : variable CSS `--qodo-label-size` mise à jour à chaque `zoomend` (zoom 15 → 11px ; zoom 20+ → 21px).
- **Masquage sous zoom 15** : la classe `qodo-labels-hidden` est togglée sur le conteneur ; règle CSS `display: none` sur les labels.
- **Stabilité du label** : le layer GeoJSON n'est plus reconstruit à chaque sélection. Création du layer dépend uniquement de `parcels`. Le re-style sur sélection passe par `setStyle()` itéré (`layer.eachLayer(...)`), via deux refs (`selectionRef`, `onSelectionRef`) pour ne pas invalider la closure du listener `click`. ⇒ plus de flash/tremblement.
- **CSS labels** : `transition: none !important` pour figer la position.

### Toolbar (lasso, dessiner, marker, mesure, grouper)
Tous **stubs UI** sauf "Sélection". À brancher Phase 2.5 avec `leaflet-draw` + `@turf/turf`.

---

## 🧩 Modifs réalisées cette session (à committer)

### Carte & UX parcelles (images 47 → 52)
- ⚡ **Labels parcelles stables** (suppression flash de reconstruction layer GeoJSON).
- 📐 **Labels proportionnels au zoom** (CSS var `--qodo-label-size`).
- 👁️ **Labels masqués sous zoom 15** (classe `qodo-labels-hidden`).
- 🎨 **Parcelles plus contrastées** (fill 0.6, weight 3, contour = couleur culture).
- 📍 **Légende basemap picker** intacte.
- 🔘 **FAB contextuel** : actions différentes selon sélection (Ouvrir fiche / Intervention / Carnet / Observation vs Nouvelle parcelle / Importer).

### Bottom sheet AsideCard (images 53 → 57)
- ➕ **Bouton "agrandir"** dans le header : passe en plein écran (z-[1100], `inset-0`).
- 👆 **Handle cliquable** : alterne expand/collapse.
- 🖋️ **Bouton crayon → page détail** : nouvelle prop `onEdit` côté AsideCard. Côté ParcellairePage, on passe `onEdit={() => navigate('/parcellaire/' + id)}` pour ne plus éditer inline (le PO veut la page complète).
- 🚫 **FAB masqué quand bottomsheet visible** sur mobile : `useHideFab(!isDesktop && Boolean(selectedId))`.

### Page détail parcelle (images 56-57)
- 🚫 **FAB masqué** sur cette page (`useHideFab(true)`) pour ne plus chevaucher le bouton Enregistrer du footer sticky.
- 🛠️ **Actions migrées en header** : "Itinéraire", "Intervention", "Dupliquer" comme boutons compacts à côté du badge statut.
- 🗓️ **Champ "Date semis" retiré** (sera dans le futur module **Plan d'assolement**). Petite mention sous "Culture en place" qui explique : « La date de semis et l'historique de culture seront gérés depuis le module Plan d'assolement (à venir). Les couleurs des parcelles sur la carte refléteront l'assolement courant (instant T). ».
- ⚠️ Le champ `sowingDate` reste dans le mock `ParcelDetail` car il sera consommé par Plan d'assolement plus tard.

### Z-index (image 49-50)
Hiérarchie finale (Leaflet utilise z-400 à z-700 sur ses panes — il faut passer **au-dessus**) :
```
SearchBar dropdown / suggestions        z-[1000]
AsideCard bottomsheet (collapsed)        z-[1000]
Fab bouton +                             z-[1050]
AsideCard bottomsheet (expanded)         z-[1100]
Drawer mobile (sidebar)                  z-[1100]
Fab backdrop                             z-[1100]
Fab bottom-sheet drawer                  z-[1110]
```

---

## 🏗️ Module **Plan d'assolement** (à créer — important pour le PO)

C'est le **prochain module clé** côté PO :
- Source de vérité de la **culture courante** et de l'**historique** par parcelle, par campagne agricole.
- **Pilote les couleurs** des parcelles sur la carte (couleur = culture à l'instant T).
- Reprend la **date de semis** (champ retiré de la fiche parcelle, à raison).
- Inclura : rotation pluri-annuelle, vue par campagne (timeline ou calendrier agricole), édition rapide.
- Données mock à modéliser : `{ parcelId, campagne (ex: '2025-2026'), culture, variety, sowingDate, harvestDate?, status }`.
- Modèle Odoo cible : à confirmer (probablement `agri.assolement` custom).

---

## ✅ Décisions techniques validées

| Sujet | Décision | Raison |
|---|---|---|
| Tile server | **Swisstopo public** (geo.admin.ch) | Périmètre suisse, gratuit, fiable. |
| Lib carte | **Leaflet** (pas Maplibre) | Raster simple, pas de WebGL timing issues. |
| TimesheetEntry pauses | Pas stockées dans Odoo | Pause = absence de timbrage. 1 saisie → N `hr.attendance`. Helper `splitPresenceIntoAttendances`. |
| Mapping user Qodo ↔ employé Odoo | Table de mapping côté backend | Hors scope composant front. |
| Style global | **Light only** | Préférence Fabien. |
| FAB | Centralisé via `useFabActions` | Chaque page publie ses actions. Bouton rond + bottom-sheet drawer. |
| FAB masquable | `useHideFab` | Pages avec footer sticky / bottomsheet ouvert. |
| Routing | React Router v7 | `/parcellaire`, `/parcellaire/:id`, `/rh/heures`, `/rh/saisir`, `/rh/conges`, etc. |
| Édition parcelle | Page dédiée (pas inline) | Le crayon de la bottomsheet redirige vers `/parcellaire/:id`. |
| Date semis | Hors fiche parcelle | Sera dans Plan d'assolement. |

---

## 🐛 Bugs / Limitations connus

1. **MapView toolbar** (Lasso, Dessiner parcelle, Marker, Mesure, Grouper, Couches) : tous stubs UI. À brancher Phase 2.5 avec `leaflet-draw` + `@turf/turf`.
2. **Import GELAN / Acorda** : `shpjs` installé, bouton non câblé.
3. **Aucune intégration Odoo réelle** : tout est mock (`PARCELLES`, `HOURS_DATA`, `LEAVES`). Phase 2.5.
4. **Code splitting MapView** : 700 kB à gagner avec `React.lazy()` sur Leaflet.
5. **Topo = même tile que Carte** : OK pour MVP, overlay relief possible plus tard.

---

## 📋 À faire ensuite (priorisé)

### 🔴 Bloquants Phase 2.5
1. **Module Plan d'assolement** — voir section dédiée plus haut. C'est ce qui pilote les couleurs des parcelles sur la carte (le PO l'a explicitement demandé image 53). À modéliser : entité `Assolement` par parcelle/campagne avec culture + variété + date semis + date récolte estimée. Page dédiée (timeline ou cards par campagne), couleurs liées au référentiel cultures.
2. **Carnet des champs** — module/page dédiée par parcelle, avec liste des interventions (semis, traitements, récolte). Lié à `ParcelleDetailPage` (placeholder existant à compléter). Le PO a parlé de "menu du carnet des champs" qu'il veut voir apparaître depuis la sélection d'une parcelle.
3. **Import parcellaire** : bouton "Importer" dans Parcellaire → file picker (`.geojson`, `.json`, `.zip` pour shapefile) → parser (shpjs déjà installé) → convertir en `ParcelDetail[]` → fusionner avec `parcels` state.
4. **Outils de dessin de parcelle** : `leaflet-draw` (ou `react-leaflet-draw`). Outil "Dessiner parcelle" doit créer un polygone GeoJSON.
5. **Intégration Odoo** : client XML-RPC pour `hr.attendance` (Hook 1 — `splitPresenceIntoAttendances`), `hr.employee` mapping, `agri.parcel` (modèle custom à créer côté Odoo Phase 2.5).

### 🟡 Souhaitables
6. **Module Travaux** : sortir du stub. Liste de tâches + assignation employés + sync Odoo.
7. **Module Troupeau** : sortir du stub.
8. **Module Paramètres** : exploitation, mapping employés Odoo, master data.
9. **Code splitting** : `React.lazy()` sur MapView pour réduire le bundle initial (~150 kB gzip).
10. **Demande de congé** : `alert()` actuel à remplacer par ouverture Odoo (nouvel onglet).

### 🟢 Polish
11. **PWA / offline** : Parcellaire et Troupeau doivent fonctionner offline.
12. **Storybook** : pas urgent.

---

## 🚀 Comment continuer

```bash
cd ~/Projects/NewagriQodo/app
npm install         # si jamais
npm run dev         # → http://localhost:5173
npm test            # 37 tests
npm run build       # prod build
npm run lint        # ESLint (0 warning attendu)
npm run typecheck   # tsc strict
```

**Pre-commit** : Husky lance `lint-staged` (eslint --fix + prettier) automatiquement.

### Reprise immédiate suggérée

1. **Commiter les changements en cours** (cf. `git status` — beaucoup de fichiers modifiés non committés).
2. Engager le **module Plan d'assolement** : créer `app/src/modules/assolement/` avec page, mock, modèle, navigation. Tirer la couleur des parcelles depuis l'assolement courant (refactor mineur de `parcellaire.mocks.ts` → ajouter une fonction `getCurrentAssolement(parcelId)` qui retourne la culture + couleur).
3. Aborder le **Carnet des champs** : ajouter un onglet `/parcellaire/:id/carnet` ou intégrer la liste des interventions dans `ParcelleDetailPage`.

---

## 🧠 Profil du PO (Fabien Cossy)

- Fondateur de **Qodo Digital** (suite d'applis pour exploitations agricoles suisses + outils internes).
- Très exigeant sur la **cohérence visuelle** (radius unifié, pas d'emoji, pas de mélange carré/arrondi, light only).
- Préfère qu'on teste **en local d'abord** avant de déployer.
- Domaine cible : **Suisse romande** (Lausanne / Échallens). Utilise GELAN, Acorda, Odoo.
- Tile server préféré : **Swisstopo** (confirmé).
- Communication : iterations courtes, screenshots fréquents, retours visuels directs. Ne mâche pas ses mots quand un fix patine ; bascule de techno plutôt que de continuer à patcher.
- Préfère un **bottom sheet qui peut s'ouvrir en plein écran** plutôt qu'une dépose accidentelle à 50%.
- Pour les **fiches parcelle** : page dédiée plutôt qu'édition inline (cf. image 55).

---

## 📦 Memory persistante

Voir `~/.claude/projects/-Users-fabiencossy/memory/` :
- `project_newagriqodo_v2.md` — état projet
- `feedback_design_consistency.md` — règles UI strictes
- `reference_vps.md` — accès VPS prod
- `reference_agri_qodo_prod.md` — infra prod

---

## ✋ Points d'attention pour le successeur

1. **Cache navigateur** : après un gros refactor (ex: switch lib), penser à demander un `Cmd+Shift+R` au PO.
2. **Tests visuels** : Fabien préfère valider visuellement. Lancer `npm run dev` et lui envoyer des screenshots / liens.
3. **Pre-commit strict** : si Husky échoue, lire la sortie. Souvent un eslint-disable inutile ou prettier qui réécrit.
4. **Z-index avec Leaflet** : Leaflet utilise z-400 à z-700 sur ses panes. Tout overlay au-dessus de la carte doit être `z-[1000]+`. Voir hiérarchie plus haut.
5. **Tooltips Leaflet** : si vous reconstruisez le layer GeoJSON à chaque rerender React (selection change), les labels "tremblent". Solution actuelle : layer créé une seule fois sur `parcels`, sélection ré-appliquée via `eachLayer(...).setStyle()` + closure click via refs.
6. **FAB contextuel** : actions selon la page. Sur Parcellaire vue Carte, les actions changent selon si une parcelle est sélectionnée ou non (`useMemo([selectedId])`). Sur Parcellaire détail et bottomsheet visible mobile : FAB masqué.
7. **Plan d'assolement** : le PO le verra comme une **fonctionnalité distincte** importante. Ne pas le fusionner avec Parcellaire. Les couleurs des parcelles sur la map devront venir de l'assolement courant.
