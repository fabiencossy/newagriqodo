# MapView — Validation Checklist (v2 — outils étendus)

**Composant** : 4/9
**Statut** : ✅ Refonte avec toolbar enrichie

## Outils ajoutés (suite au feedback)

| Outil | Raccourci | Description |
|---|---|---|
| **Sélection** | `S` | Cliquer une parcelle / marker. Ctrl+clic pour ajouter à la sélection. |
| **Lasso** | `L` | Tracer une zone → sélection multiple de parcelles. |
| **Dessiner parcelle** | `P` | Polygone : clics pour ajouter sommets, double-clic pour fermer, Esc annule. |
| **Ajouter point** | `M` | Pose un marker (intervention / observation / problème / note / custom). |
| **Mesurer** | `R` | Trace une ligne ou un polygone → affiche distance / surface. |
| **Grouper** | `G` | Action sur la sélection : crée un `ParcelGroup` (rotation, secteur, lot…). |
| **Couches** | `Y` | Toggle visibilité : parcelles, markers, groupes, mesures, étiquettes. |

## Décisions prises

| Question | Réponse |
|---|---|
| Sélection multiple | Lasso + Ctrl+clic. Badge en bas-centre avec actions contextuelles. |
| Groupage | Création d'un `ParcelGroup` (kind : `rotation` / `sector` / `lot` / `custom`). Teinte aubergine sur les parcelles du groupe. |
| Markers : types prédéfinis | `intervention` (vert) · `observation` (orange) · `problem` (rouge) · `note` (bleu) · `custom` (aubergine). Légende toujours visible. |
| Mesure : affichage | Surface en hectares pour polygone, mètres pour ligne. Étiquette persistante jusqu'au changement d'outil. |
| Mobile | Toolbar horizontale en bas (icônes seules + flex). |
| Raccourcis clavier | Une seule lettre par outil, mappés dans `TOOL_SHORTCUTS`. Esc annule l'outil actif. |

## Design & UX
- [x] Wireframe : 6 scénarios (sélection, lasso, dessin parcelle, ajout point, groupe, mobile)
- [x] Toolbar latérale gauche (desktop), horizontale bas (mobile)
- [x] Barre contextuelle (top-left) affiche actions de l'outil actif
- [x] Badge de sélection multiple (bas-centre) avec action "Grouper" / "Tout désélectionner"
- [x] Légende markers persistante
- [x] Cibles tactiles 40 px (toolbar), 36 px (controls)
- [x] Icônes SVG inline style Lucide, 1.5 px stroke

## Code
- [x] `MapTool` strict union (7 outils)
- [x] `ParcelGroup` + `MapMarker` typés
- [x] `DrawEvent` unifié pour `draw-parcel` / `add-marker` / `measure`
- [x] `selectedIds: ReadonlyArray<string>` (multi-sélection)
- [x] `onSelectionChange` + `onCreateGroup` + `onDissolveGroup` callbacks
- [x] `TOOL_SHORTCUTS` + `MARKER_COLORS` constants
- [x] Pas de `any`
- [ ] Implémentation Maplibre GL → Phase 1

## Accessibilité
- [x] Toolbar : `role="toolbar"` + chaque outil `aria-pressed` + `aria-label`
- [x] Tooltip au hover (data-tip CSS), raccourci clavier annoncé
- [x] Sélection multiple visible (badge + count)
- [x] Légende texte (pas couleur seule)
- [x] Esc annule l'outil
- [x] Navigation clavier : raccourcis + Tab dans la toolbar

## Edge cases
- [x] Dessin polygone < 3 sommets → bouton "Valider" disabled
- [x] Lasso sur zone vide → message "Aucune parcelle dans la zone"
- [x] Groupage avec parcelles déjà groupées → choix : remplacer / ajouter
- [x] Mesure : auto-conversion m² ↔ ha quand > 5000 m²
- [x] Marker sur zone hors parcelle → autorisé, mais `parcelId` absent
- [x] Mobile : toolbar horizontale, 6 outils max visibles, le reste dans un menu "…" (Phase 1)

## Dépendances Phase 1
- `maplibre-gl` (~250 KB gz)
- `maplibre-gl-draw` ou équivalent (lasso + polygon + measure)
- `@turf/turf` (calculs surface/distance, intersection)

## Infra Phase 1 — Recommandation tile server

### Comparatif

| Critère | **Self-hosted OpenMapTiles** | MapTiler Cloud |
|---|---|---|
| Coût initial | Setup ~½ journée | 0 |
| Coût récurrent | 0 (VPS déjà payé) | ~30-100 €/mois selon trafic |
| Performance | Excellente (LAN VPS) | Bonne (latence CDN) |
| Souveraineté | ✅ Données chez Qodo | ❌ Dépendance tiers |
| Taille tiles CH+EU | ~15-30 GB | n/a (CDN) |
| Maintenance | Mise à jour OSM 2-4×/an | Aucune |
| Risque vendor lock-in | 0 | Élevé |
| Style custom Qodo | Total contrôle | Possible mais moins flexible |

### 🟢 Recommandation : **Self-hosted OpenMapTiles** sur VPS Qodo

**Pourquoi** :
1. **Tu as déjà un VPS Infomaniak performant** (cf. `reference_vps.md` mémoire) → coût additionnel quasi nul.
2. **Souveraineté agricole** : les coordonnées GPS des parcelles clients sont des données stratégiques, autant ne pas les router via un tiers.
3. **Couverture limitée** : Suisse + frontaliers → ~15-30 GB de tiles seulement.
4. **Stack simple** : `docker run` un seul conteneur (`openmaptiles/openmaptiles-server`) + un fichier `.mbtiles`.
5. **Mise à jour : 2×/an suffisent** pour le contexte agricole (le paysage évolue lentement).
6. **Cohérent avec ta philosophie** : tu containerises tout (cf. mémoire `project_containerisation.md`).

### Étapes Phase 1 (setup ~½ journée)
1. Télécharger les tiles Switzerland (~5-10 GB) depuis OpenMapTiles ou les générer avec [Planetiler](https://github.com/onthegomap/planetiler).
2. Pour le satellite : utiliser tiles [ESRI World Imagery](https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/) (CDN gratuit) ou tiles Sentinel-2 via [Sentinel Hub](https://www.sentinel-hub.com/).
3. Déployer un container `tileserver-gl` ou `openmaptiles-server` sur VPS.
4. Configurer `styles/satellite.json` + `styles/topo.json` + `styles/streets.json` avec branding Qodo (vert primary).
5. Setter `MAP_VIEW_DEFAULTS.styleUrl` vers `https://tiles.qodo.ch/styles/{style}.json`.

### Décision Fabien 2026-05-15 : ✅ **Self-hosted**

## Réutilisation
- Module Parcellaire (vue principale)
- Module Travaux (localisation des tâches via markers)
- Module Troupeau (positions, parcours)

## Status
✅ **Prêt pour Phase 1** (infra tiles à provisionner en parallèle)
