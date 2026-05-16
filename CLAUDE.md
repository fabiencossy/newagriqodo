# CLAUDE.md — NewagriQodo v2

Brief de passation pour **Claude Cowork**. Pour le détail technique exhaustif, voir `docs/4_Phases/HANDOFF.md`.

## Projet

Refonte UX du module **Agri Qodo** de **Qodo Digital** (Fabien Cossy, fondateur).
- Apps pour exploitations agricoles suisses (Suisse romande, Échallens — Domaine Darval).
- Distinct de la prod actuelle `newagri.qodo.ch` (VPS Infomaniak `83.228.247.77`).
- Vit dans `app/` (Vite + React 19 + TS 6 strict + Tailwind v4 + Leaflet + React Router v7).
- Conventions strictes : light only, radius via variables CSS, pas d'emoji, pas de dark mode, icônes SVG inline style Lucide.

## Structure du repo

```
NewagriQodo/
├── .claude/             ← settings.json (hooks) + agents/ (component-validator, ux-reviewer, agronome-validator)
├── app/                 ← Source React/TS (Vite + Tailwind v4 + Leaflet)
├── docs/                ← Doc versionnée structurée (1_Overview → 8_Wireframes)
├── Phase0_Components/   ← Spec composants Phase 0
├── assets/              ← Logos
├── CLAUDE.md            ← Vous êtes ici
└── README.md            ← Entry point projet
```

## Où on en est (2026-05-16, fin session 3)

| Phase | État |
|---|---|
| **Phase 0** — 9 wireframes HTML validés par le PO | ✅ |
| **Phase 1** — 9 composants React + 55 tests Vitest (tous passent) | ✅ |
| **Phase 2** — App routée + module pilote **Parcellaire** + module **RH** | ✅ |
| **Phase 2.5** — Plan d'assolement, données réelles Darval, multi-sélection, import GeoJSON | ✅ MVP |
| **Session 3 (2026-05-16)** — Nettoyage docs, hooks Claude Code, agents, store partagé | ✅ |
| **Session 3 (suite)** — Module Carnet des champs (interventions, fumure réelle base) | ✅ |
| **Session 3 (suite)** — Module Fumure OEngrais (palier 2), onglets parcelle, stats, paramètres CRUD | ✅ |
| **Phase 3** — Intégration Odoo, dialog editing parcelle existante | À venir |

## Modules implémentés

### Parcellaire (`/parcellaire`)
- **27 parcelles réelles** du Domaine Darval (chargées depuis `app/src/modules/parcellaire/darval.geojson.json` — export VD GELAN 2026)
- Mapping affectation Agridéa → culture du catalogue (Blé d'automne, Maïs ensilage, Prairie temporaire, Prairie naturelle, Pâturage, Prairie extensive, Forêt, Surface improductive)
- 3 vues : Carte (Leaflet satellite Swisstopo) / Table / Dashboard
- SearchBar avec filtre par groupes de cultures (Blé, Orge, Maïs, Colza, Betterave, Prairie, Jachère)
- **Table avec multi-sélection** : checkbox + barre d'actions groupées (Fusionner, Dupliquer, Archiver, Exporter, Supprimer). Sur mobile : un seul bouton "Actions ⌄".
- **Panneau riche** au clic sur parcelle (carte) : Plan d'assolement (timeline 12 mois + culture du jour), Stade phéno (mock BBCH), Bilan de fumure N/P/K (mock), Dernières interventions (mock), Notes. Footer "Ouvrir la fiche complète".
- **Outils carte** (desktop uniquement) : Sélection, Dessiner une parcelle, Pin, Mesurer. Lasso supprimé. Group/layers retirés des defaults.
- **Dialog post-dessin** : après double-clic qui ferme un polygon, ouverture d'un modal pour saisir Nom / Code / Culture initiale / Notes. Surface calculée auto.
- **Kebab ⋮** : Importer GeoJSON / Importer Shapefile (.zip via shpjs) + Export PDF/Excel/CSV.

### Plan d'assolement (`/assolement`)
- Modèle : **segments temporels** (1 segment = 1 culture sur une période continue), N segments par parcelle/campagne.
- Catalogue Agridéa : **42 cultures** en 9 catégories, couleurs vives flashy pour contraste satellite.
- **Découpe automatique** : si on save un segment qui chevauche un existant → l'existant est coupé en deux ou tronqué (règle "pas deux cultures simultanées").
- **Fusion automatique** : segments adjacents même culture → fusionnés en un seul.
- 3 vues : Carte (parcelles peintes par culture dominante) / Timeline (Gantt 12 mois × parcelles) / Table.
- Sélecteur Campagne (2024 / 2025 / 2026).
- Panneau de détail (aside desktop / bottom-sheet mobile) : timeline détaillée, liste des segments éditables, formulaire d'édition (culture, variété, dates, notes).
- Table avec multi-sélection (Fusionner en un assolement commun, Appliquer un segment, Dupliquer le plan vers une autre campagne, Exporter).
- FAB : "Ajouter un segment" quand parcelle sélectionnée.
- Navigation contextuelle : `?parcel=PF-001` ouvre directement le panneau pour cette parcelle.

### Page détail parcelle (`/parcellaire/:id`) — onglets
- Header : Back + Titre + Status badge + icône fine Itinéraire + Kebab (Dupliquer / Archiver / Supprimer)
- FAB **unifié** standard (cf. `useStandardFabActions` plus bas), highlight `intervention`
- **6 onglets** :
  - **Aperçu** : Identification + Statut + mini-carte + 3 cards résumé cliquables (Assolement / Carnet / Fumure) + Notes
  - **Carnet** : InterventionList des interventions de cette parcelle (8 dernières + lien carnet complet)
  - **Assolement** : timeline cliquable + gros bouton "Ajouter un segment" sous la timeline + liste des segments éditables (modal `AssolementSegmentModal` réutilisable)
  - **Fumure** : `FumurePanel` (OEngrais 2024, cards N/P/K cliquables → drawer détail)
  - **Statistiques** : rendement par campagne, apports cumulés, compteurs interventions
  - **Localisation** : carte large + Itinéraire Google Maps

### Module Fumure (`fumure/`) — Palier 2 OEngrais 2024
- Besoins par culture (15 cultures référencées) — `cultureNeeds(culture)`
- Précédent cultural (résidus N selon culture précédente) — `previousCropResidualN()`
- Coefficients d'efficacité organique (lisier/fumier/compost × saison) — `organicEfficiencyCoef()`
- `computeFumureBalance()` : bilan complet avec apports disponibles 1re année (vs bruts)
- Cards **N / P / K cliquables** → drawer détail (`FumureDrawer`) : besoin/apports/solde, historique chronologique des apports, fenêtres BBCH conseillées, bouton "Ajouter un apport" → ouvre InterventionForm en mode fertilisation
- Reste à apporter **décomposé par élément** (plus de total flou)

### Page Paramètres (`/parametres`) — CRUD
- **Onglet Utilisateurs** : liste avec avatar coloré + édition/suppression + bouton "+ Nouvel utilisateur" → `UserEditModal` (nom, email, rôle Admin/Editor/Viewer, couleur avatar)
- **Onglet Catalogue produits** : filtrable par type (phyto/engrais/semences) + édition/suppression + bouton "+ Nouveau produit" → `ProductEditModal` (champs adaptés au type : n° OFAG pour phyto, composition N/P/K pour engrais, variété pour semence)
- **Onglet Sync Odoo** : à venir Phase 3

### Carnet des champs (`/carnet`)
- Modèle : **interventions datées** par parcelle, 9 catégories (semis, fertilisation, phyto, travail du sol, travaux culturaux, récolte, observation, irrigation, autre).
- ~80 interventions mock générées depuis les segments d'assolement Darval (semis blé/maïs, apports N, traitements, fauches prairies, récoltes).
- Champs riches : produit, dose+unité, N/P/K kg/ha, type phyto + délai d'attente, stade BBCH, rendement, opérateur, météo, notes.
- 2 vues : Table (multi-select, bulk actions) / Timeline (groupée par mois).
- SearchBar avec filtres par catégorie / produit / opérateur.
- FAB : Nouvelle intervention.
- Sélecteur Année.
- ExportButton (PDF/Excel/CSV).
- Section "Carnet des champs" intégrée dans `ParcelleDetailPage` : 8 dernières interventions + bouton "Voir le carnet complet" (→ `/carnet?parcel=ID`).
- FAB ParcelleDetailPage → ouvre `InterventionForm` (avec parcelle verrouillée), pas plus d'`alert()`.

### Modules secondaires
- RH (`/rh/heures`, `/rh/saisir`, `/rh/conges`) — Phase 2, inchangé
- Travaux, Troupeau, Paramètres — stubs

## Composants Phase 1 partagés

`SearchBar`, `ViewSwitcher`, `ExportButton`, `FieldPicker`, `AsideCard`, `HoursTableMonth`, `LeaveRequestList`, `TimesheetEntry`, `MapView` (Leaflet + outils + drawn layers).

**Ajoutés en Phase 2.5** :
- `DetailPanel` (aside/bottom-sheet générique, accepte children custom + footer)
- `BulkActionsBar` + `TableCheckbox` (multi-sélection tables, desktop inline / mobile menu compact)
- `AssolementTimeline` (frise 12 mois variantes row/detail — nom culture sur slot)
- `AssolementDetailPanel`, `AssolementSegmentEditor` (édition segments)
- `AssolementSegmentModal` (modal réutilisable d'édition de segment)
- `ParcelleSummaryPanel` (panneau riche carte Parcellaire avec édition assolement inline)

**Ajoutés en Session 3** :
- `Tabs` + `TabPanel` (composant réutilisable, onglets scrollables mobile)
- `EntityLink` + `ParcelLink` (liens internes standardisés, 3 variantes : chip / compact-button / tap-row, icône ↗)
- `InterventionTypeIcon` (icônes Lucide par catégorie carnet, avec ou sans bg)
- `InterventionList` (table + cards mobile structure fixe 4 lignes, multi-select)
- `InterventionForm` (modal — sélecteur visuel catégorie, ProductSelect auto-fill, n° OFAG, date récolte autorisée, UserSelect, aide BBCH, durée travail)
- `ProductSelect` (filtré par type + culture autorisée pour phyto)
- `UserSelect` + `UserChip` (avatar coloré + nom)
- `UserEditModal`, `ProductEditModal` (CRUD Paramètres)
- `FumurePanel` + `FumureDrawer` (Palier 2 OEngrais)
- `ParcelleStats` (rendement, apports cumulés, compteurs)
- `Fab` repensé : action highlight = `variant: 'primary'` (fond vert pâle + icône vert plein), action highlight remontée juste après "Créer une intervention" qui reste toujours #1
- `InterventionFormProvider` global → ouvre le form depuis n'importe quelle page sans navigation
- `useStandardFabActions(opts)` hook : set d'actions FAB standards (5 actions toujours présentes, highlight contextuel)
- `fab-icons.tsx` : 9 icônes Lucide-style (Pencil intervention, BookOpen carnet, Hexagon parcelle, etc.)

**Mobile cards** sur les 3 tables (Intervention, Parcellaire, Assolement) : desktop = table, mobile = cards verticales avec structure fixe 4 lignes (titre+date / catégorie+parcelle / dose+opérateur / notes).

## Comment reprendre

```bash
cd ~/Projects/NewagriQodo/app
npm install
npm run dev         # http://localhost:5173 (ou 5174 si 5173 occupé)
npm test            # 55 tests Vitest
npm run typecheck   # tsc strict
npm run lint        # ESLint (0 warning attendu)
```

**Pre-commit Husky** : `lint-staged` lance `eslint --fix` + `prettier` automatiquement.

**État git** : pas tout commité (voir `git status`). Session 3 = grosse réorg docs + nouveaux fichiers `.claude/`.

## Hooks Claude Code en place (session 3)

`.claude/settings.json` branche 9 scripts dans `.claude/scripts/` :

- **PreToolUse Bash** : `block-dangerous-bash.sh` (rm -rf, push --force, reset --hard, etc.)
- **PreToolUse Edit/Write** : `protect-darval.sh` (bloque modif darval.geojson.json)
- **PostToolUse Edit/Write** :
  - `post-edit-check.sh` — typecheck + lint sur fichiers app/src/
  - `check-no-emoji-global.sh` — interdit emoji partout dans app/src/
  - `check-component-conventions.sh` — radius CSS vars, dark, Lucide, test associé
  - `check-page-consistency.sh` — *Page.tsx doit avoir SearchBar + ViewSwitcher + FAB + Export
  - `validate-cultures.sh` — couleurs hex uniques + champs complets
- **Stop** : `run-changed-tests.sh` (vitest related sur fichiers modifiés)
- **SessionStart** : `session-start-recap.sh` (git status + last commit)

Tous non-bloquants sauf les Pre (qui exit 2 = blocage propre).

## Agents Claude Code en place (session 3)

`.claude/agents/` :

- **component-validator** — Audite un nouveau composant React (conventions visuelles, TS, tests, a11y).
- **ux-reviewer** — Audite une *Page.tsx (squelette, multi-select tables, z-index, responsive).
- **agronome-validator** — Vérifie cohérence agricole (cultures Agridéa, dates semis, normes OEngrais).

Invocation : `Task` tool avec `subagent_type: "component-validator"` etc.

## Prochaines priorités (en attente)

### Quick wins UX
- **Fusion v2 Timeline Parcellaire** : intégrer la vue Timeline Gantt assolement dans ParcellairePage (4 vues : Carte / Table / Timeline / Dashboard) + sélecteur Campagne conditionnel
- **ProductPicker modal** : remplacer le `<select>` natif par un modal plein écran avec recherche (vu qu'il y aura beaucoup de produits)
- **Calcul auto total dose** : sous le champ Dose, afficher le total absolu (ex. `180 grains/ha × 1.34 ha = 241 200 grains`)
- **Multi-sélection parcelles** dans InterventionForm + notion de "groupe de parcelles" persistant
- **FarmSwitcher** dropdown : changer d'exploitation (multi-tenancy MVP)
- **Carte plein écran** : onglet Localisation avec carte qui prend toute la hauteur disponible
- **Indicateur délai d'attente phyto** : `isUnderWithholding()` → badge rouge dans `ParcelleSummaryPanel` et `ParcelleDetailPage`

### Phase 3 — Intégration Odoo
- XML-RPC, `hr.attendance` (helper déjà en place), `hr.employee`, `res.users`, `agri.parcel` custom, `agri.intervention` custom, `agri.assolement.segment` custom, `product.product` (sync catalogue)
- Suisse-Bilanz export PDF officiel (autorités cantonales)
- Stade phéno réel BBCH (degrés-jours)
- Sync MétéoSuisse (auto-fill météo intervention)
- Pin avec info dialog (label/type/parcelle liée)
- Outil "Modifier parcelle existante" (drag sommets sur parcelle déjà créée)
- Menu contextuel sur éléments dessinés

### Modules à venir
- **Carnet des champs avancé** : photos d'observation, géolocalisation point d'observation
- **Module Travaux** (sortir du stub) : tâches + assignation + sync Odoo + facturation tiers (M11)
- **Module Troupeau** (sortir du stub) : animaux + événements + SRPA/SST
- **PWA / offline** : Parcellaire et Troupeau doivent fonctionner offline
- **Code splitting MapView** : `React.lazy()` Leaflet (~150 kB gzip à gagner)

## Fait en session 3 (2026-05-16)

### Infra
- **Nettoyage doc** : 30+ fichiers .md éparpillés à la racine → structure `docs/{1_Overview, 2_Architecture, 3_Features, 4_Phases, 5_Setup, 6_Agents, 7_References, 8_Wireframes}/`. Aucune perte d'info, archives obsolètes dans `docs/7_References/ARCHIVES/`.
- **`.claudecode.json` archivé** (référençait `frontend/`/`backend/` inexistants) → remplacé par `.claude/settings.json` propre.
- **Hooks Claude Code** : 9 scripts dans `.claude/scripts/` branchés via `.claude/settings.json`.
- **Agents projet** : 3 agents dans `.claude/agents/` (component-validator, ux-reviewer, agronome-validator).

### Modules livrés
- **Carnet des champs** : types, store pub/sub, ~80 interventions Darval, CarnetPage 2 vues, InterventionList mobile cards structure fixe 4 lignes, intégration ParcelleDetailPage, 16 tests Vitest, francisation subTypes (silage→Ensilage, mowing→Fauche, plowing→Labour…).
- **Users** : 5 mocks Darval, UserSelect/UserChip, UserEditModal CRUD, store add/update/remove.
- **Products** : 25 produits suisses (10 phyto OFAG, 8 engrais, 7 semences), ProductSelect avec auto-fill (type phyto / N/P/K depuis titre engrais — `nPerUnit` = kg élément/unité de dose, ex. lisier 4.5 kg N/m³), ProductEditModal CRUD.
- **Fumure (Palier 2 OEngrais 2024)** : besoins par culture, précédent cultural (résidus N), coefficients d'efficacité organique selon saison, computeFumureBalance complet, FumurePanel + FumureDrawer (cards N/P/K cliquables → détail avec historique + fenêtres BBCH + bouton "Ajouter un apport").
- **Assolement.store partagé** : édition inline depuis ParcelleDetailPage et ParcelleSummaryPanel via AssolementSegmentModal réutilisable. Plus de redirection vers /assolement.
- **Onglets ParcelleDetailPage** : 6 onglets (Aperçu / Carnet / Assolement / Fumure / Statistiques / Localisation). Aperçu enrichi avec mini-carte + 3 résumés cliquables.
- **ParcelleStats** : rendement par campagne, apports N/P/K cumulés, compteurs interventions par catégorie.
- **Page Paramètres** : Tabs Utilisateurs + Catalogue produits (CRUD complet, sync Odoo Phase 3).

### Composants partagés & UX
- **`useStandardFabActions(opts)`** : set FAB unifié (5 actions toujours présentes), `highlight` contextuel par page, action highlight remontée juste après "Créer une intervention" (toujours #1). Variant 'primary' = fond pâle + icône plein. Plus de badge "RECOMMANDÉ".
- **InterventionFormProvider** global dans AppLayout → clic FAB "Créer une intervention" ouvre directement le modal (plus de navigation `/carnet`).
- **EntityLink + ParcelLink** : liens internes standardisés (3 variantes), icône ↗.
- **Tabs + TabPanel** : composant réutilisable, onglets scrollables mobile.
- **Mobile cards** sur les 3 tables : structure fixe 4 lignes constantes.
- **HoursTableMonth** : prop `bordered` (défaut true) pour retirer le cadre wrapper.
- **InterventionForm** : sélecteur visuel catégorie (grille icônes), ProductSelect auto-fill, n° OFAG, date récolte autorisée, UserSelect, aide-bulle BBCH, champ durée travail (heures décimales). Validation au submit : si champs requis manquants, message contextuel sous le bouton.

### MapView
- **Snap auto** au 1er sommet pendant dessin parcelle (halo blanc/violet quand ≥3 sommets, clic <18px ferme polygon → dialog `NewParcelDialog` s'ouvre).
- **Drag des sommets** pendant dessin : chaque sommet est un marker draggable (icône divIcon violette ronde), update temps réel de la preview line.
- Nom culture affiché sur slots Timeline assolement (variant row aussi).
- Footer parcelle z-[1000] (chevauchement Leaflet corrigé).

### Quick fixes
- Bloc Stade phéno mock supprimé.
- Statuts exports parcelle francisés (Actif/Jachère/Archivé).
- Filtre Blé sur la carte : correction du matching groupe (cultureGroup au lieu de comparaison brute).
- Fusion nav v1 : entrée "Plan d'assolement" retirée de la nav (1 seule entrée Parcellaire visible).
- Bouton "Ajouter un segment" pattern unifié (gros bouton sous timeline via `onAdd`, plus de petit bouton en haut en doublon).
- 9 icônes FAB refaites (Pencil intervention parlant, BookOpen carnet, Hexagon parcelle…).
- Unité dose auto-remplie depuis produit sélectionné (override systématique).
- Calcul N/P/K corrigé pour engrais organiques.
- **2026-05-16 (en cours)** : durée travail dans intervention, validation form pédagogique, MesHeures sans cadre, EntityLink/Tabs/onglets parcelle/stats, module Fumure Palier 2 complet, Paramètres CRUD.

## Points d'attention techniques

- **Z-index avec Leaflet** : ses panes vont de 400 à 700. Tout overlay au-dessus de la carte doit être `z-[1000]+`. Dropdowns/menus à `z-[1200]` pour passer au-dessus du BasemapPicker (400) et drawers (1100).
- **MapView.activeTool** : mode mixte (prop + state interne). Le parent peut le contrôler mais le map maintient son état si on change via la toolbar.
- **MapView refs** : `parcelsRef`, `onSelectionRef`, `onDrawCompleteRef` — pour ne pas re-monter l'effet des outils pendant qu'on dessine.
- **Labels carte** : ne pas reconstruire le layer GeoJSON à chaque selection change — ça fait trembler les labels permanents. Utiliser `eachLayer().setStyle()`.
- **Toolbar carte** : cachée sur mobile (`isDesktop &&`) — trop complexe à utiliser au doigt.
- **Outil draw-parcel** : utilise `onDrawComplete` callback. Si non fourni, fallback en state local `drawnPolygons`. Coordonnées GeoJSON Polygon en [lng, lat] et ring fermé.
- **Catalogue cultures** : `app/src/modules/assolement/cultures.ts`. 42 entrées, 9 catégories. Ajout d'une nouvelle culture = ajouter une entrée avec key (en-tête anglais), label (FR), color (hex vif), category.
- **Mocks parcelles** : `parcellaire.mocks.ts` lit `darval.geojson.json` au build. Pour ajouter une parcelle de test, l'ajouter dans le geojson ou utiliser l'outil dessin + dialog.
- **resolveOverlaps + mergeAdjacentSameCulture** : helpers de `assolement.helpers.ts`. À appliquer dans cet ordre après chaque modification de segments.
- **Pas d'emoji** dans le code ou l'UI.
- **Tests visuels prioritaires** : Fabien valide via screenshots. Lancer `npm run dev` et synchroniser les attentes par captures.
- **Bascule de techno > patch infini** : si une lib pose 3 problèmes d'affilée, considérer un switch (cf. Maplibre → Leaflet en session 1).
- **Toutes les tables/listes futures** : prévoir d'emblée multi-sélection + actions groupées (cf. mémoire `feedback_tables_multi_select`).

## Références

- `docs/4_Phases/HANDOFF.md` — détail technique complet, hiérarchie z-index, structure code
- `Phase0_Components/PHASE_0_SUMMARY.md` — spec des 9 composants
- `docs/2_Architecture/SPEC.md` — source de vérité fonctionnelle
- `docs/3_Features/COMPOSANTS_REUSABLES.md` — props TS des composants Phase 1
- `~/.claude/projects/-Users-fabiencossy-Projects-NewagriQodo/memory/` — mémoire Claude (profil PO, règles UI, infra)
  - `feedback_tables_multi_select.md` — règle multi-sélection pour toutes les tables
  - `MEMORY.md` — index

## Profil PO en deux lignes

Fabien Cossy, fondateur Qodo Digital, exploitant du Domaine Darval (Échallens). Exigeant sur la cohérence visuelle, communique par screenshots, préfère que tu testes en local avant de déployer, n'aime pas les boucles de patch infinies. Toujours répondre en français.
