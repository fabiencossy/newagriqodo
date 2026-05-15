# CLAUDE.md — NewagriQodo v2

Brief de passation pour **Claude Cowork**. Pour le détail technique exhaustif, voir `HANDOFF.md`.

## 🎯 Projet

Refonte UX du module **Agri Qodo** de **Qodo Digital** (Fabien Cossy, fondateur).
- Apps pour exploitations agricoles suisses (Suisse romande, Lausanne/Échallens).
- Distinct de la prod actuelle `newagri.qodo.ch` (VPS Infomaniak `83.228.247.77`).
- Vit dans `app/` (Vite + React 19 + TS 6 strict + Tailwind v4 + Leaflet + React Router v7).
- Conventions strictes : light only, radius via variables CSS, pas d'emoji, pas de dark mode, icônes SVG inline style Lucide.

## 📍 Où on en est aujourd'hui (2026-05-15)

| Phase | État |
|---|---|
| **Phase 0** — 9 wireframes HTML validés par le PO | ✅ |
| **Phase 1** — 9 composants React + 37 tests Vitest (tous passent) | ✅ |
| **Phase 2** — App routée + module pilote **Parcellaire** + module **RH** complet | ✅ fonctionnel |
| **Phase 2.5** — Intégration Odoo + Carnet des champs + Plan d'assolement + Import GELAN/Acorda | 🔜 prochaine étape |

## 🧱 Ce que la session sortante a fait

### Phase 1 (composants Phase 0 → React + Tests)
- `ViewSwitcher`, `SearchBar` (style Odoo SearchPanel), `ExportButton` (CSV natif), `FieldPicker`, `AsideCard` (aside / bottom sheet), `HoursTableMonth`, `LeaveRequestList`, `TimesheetEntry`, `MapView`.
- Helper `splitPresenceIntoAttendances` côté Timesheet (1 saisie = N `hr.attendance` Odoo, les pauses ≠ enregistrées).
- 37 tests Vitest, ESLint + Prettier + Husky + lint-staged en place. 0 warning.

### Phase 2 (routing + modules)
- React Router v7 : `AppLayout` (sidebar desktop / drawer mobile) + `Outlet`.
- Module **Parcellaire** : pages `/parcellaire` (carte / table / dashboard) et `/parcellaire/:id` (édition fiche). 12 parcelles mock autour de Lausanne.
- Module **RH** : `/rh/heures` (`HoursTableMonth`), `/rh/saisir` (`TimesheetEntry`), `/rh/conges` (`LeaveRequestList`).
- Modules stubbés : Travaux, Troupeau, Paramètres.
- **FAB centralisé** via `FabContext` + `useFabActions(actions)` (chaque page publie ses actions contextuelles ; bottom-sheet drawer).

### Carte (saga douloureuse → résolue)
- Maplibre + OpenFreeMap initialement ✅
- Switch ESRI / Google sat / EOX Sentinel-2 → tous **blancs** chez Fabien (réseau / adblock).
- Multiples patches timing (`mapReady`, RAF, ResizeObserver, `triggerRepaint`, `offsetHeight > 0` wait) → carte restait blanche au reload froid.
- **Solution finale (commit `28a0c5e`)** : **switch Maplibre → Leaflet** + raster Swisstopo WMTS (`ch.swisstopo.swissimage` / `pixelkarte-farbe`). Plus de WebGL fragile. Fonctionne immédiatement.

### Itération polish UX Parcellaire (cette session, non commité)
Retours du PO via screenshots (images 47 → 57), traités successivement :

| # | Demande | Fix |
|---|---|---|
| 47 | Boutons toolbar map ne marchent pas | Acté comme stubs Phase 2.5 (notés dans HANDOFF) |
| 48 | Sélection parcelle → actions contextuelles + Carnet des champs | FAB devient contextuel : Ouvrir fiche / Intervention / Carnet / Observation |
| 49 | SearchBar dropdown ne s'ouvre pas | z-[1000] sur SuggestionsList/FiltersDropdown (au-dessus des panes Leaflet) |
| 50 | Map chevauche le hamburger | Drawer mobile z-[1100], FAB z-[1050]/sheet z-[1110] |
| 51 | Labels visibles seulement au dézoom | Masquage labels sous zoom 15 (classe `qodo-labels-hidden`) |
| 52 | Parcelles peu visibles + labels proportionnels | `fillOpacity 0.6`, `weight 3`, contour = couleur culture + CSS var `--qodo-label-size` pilotée par zoom |
| 53 | Date semis → Plan d'assolement + bottomsheet doit s'agrandir | Champ retiré de la fiche + bouton "agrandir" plein écran sur AsideCard |
| 54 | FAB + chevauche bouton Enregistrer du bottomsheet | `useHideFab` (nouveau hook) : FAB masqué quand bottomsheet visible mobile |
| 54 | Labels parcelles instables (tremblent) | Layer GeoJSON ne se reconstruit plus sur selection change. Restyle via `eachLayer().setStyle()` + refs |
| 55 | Crayon de la bottomsheet doit ouvrir la page détail complète | Nouvelle prop `onEdit` sur `AsideCard` ; `ParcellairePage` passe `() => navigate('/parcellaire/'+id)` |
| 56-57 | FAB + chevauche Enregistrer sur la page détail | `useHideFab(true)` sur ParcelleDetailPage ; actions (Itinéraire / Intervention / Dupliquer) migrées en header |

## 🚀 Comment reprendre

```bash
cd ~/Projects/NewagriQodo/app
npm install         # si nécessaire
npm run dev         # → http://localhost:5173
npm test            # 37 tests Vitest
npm run typecheck   # tsc strict
npm run lint        # ESLint (0 warning attendu)
```

**Pre-commit Husky** : `lint-staged` lance `eslint --fix` + `prettier` automatiquement.

**État git** : beaucoup de fichiers modifiés non committés (toute la session de polish). À committer en premier.

## 🔴 Prochaines priorités (Phase 2.5)

1. **Module Plan d'assolement** (demande explicite PO image 53) — pilote couleur des parcelles sur la carte. Entité `Assolement` par parcelle/campagne (culture + variété + date semis + date récolte). Page dédiée. Refactor `parcellaire.mocks.ts` → `getCurrentAssolement(parcelId)`.
2. **Carnet des champs** — module dédié par parcelle. Liste interventions (semis, traitements, récolte). Lié à `ParcelleDetailPage`.
3. **Import parcellaire** — `shpjs` déjà installé. File picker GeoJSON/Shapefile → fusion dans `parcels` state.
4. **Outils dessin carte** — `leaflet-draw` ou `react-leaflet-draw` pour brancher la toolbar map.
5. **Intégration Odoo** — XML-RPC, `hr.attendance` (helper en place), `hr.employee`, `agri.parcel` (modèle custom à créer côté Odoo).

## ⚠️ Points d'attention

- **Z-index avec Leaflet** : ses panes vont de 400 à 700. Tout overlay au-dessus de la carte doit être `z-[1000]+`. Hiérarchie dans HANDOFF.md.
- **Labels carte** : ne pas reconstruire le layer GeoJSON à chaque selection change — ça fait trembler les labels permanents. Utiliser `eachLayer().setStyle()`.
- **Pas d'emoji** dans le code ou l'UI (sauf si le PO les demande explicitement).
- **Tests visuels prioritaires** : Fabien valide via screenshots. Lancer `npm run dev` et synchroniser les attentes par captures.
- **Cohérence radius / icônes / couleurs** : variables CSS uniquement, pas de valeurs en dur.
- **Bascule de techno > patch infini** : si une lib pose 3 problèmes d'affilée, considérer un switch (cf. Maplibre → Leaflet).

## 📚 Références

- `HANDOFF.md` — détail technique complet, hiérarchie z-index, structure code
- `Phase0_Components/PHASE_0_SUMMARY.md` — spec des 9 composants
- `~/.claude/projects/-Users-fabiencossy/memory/` — mémoire Claude (profil PO, règles UI, infra)
  - `project_newagriqodo_v2.md`
  - `feedback_design_consistency.md`
  - `reference_vps.md`, `reference_agri_qodo_prod.md`

## 🧠 Profil PO en deux lignes

Fabien Cossy, fondateur Qodo Digital. Exigeant sur la cohérence visuelle, communique par screenshots, préfère que tu testes en local avant de déployer, n'aime pas les boucles de patch infinies. Toujours répondre en français.
