# MapView — Validation Checklist

**Composant** : 4/8
**Statut** : ✅ Esquisse Phase 0 complétée

## Décisions prises

| Question | Réponse |
|---|---|
| Tiles source | **Maplibre GL self-hosted** (URL placeholder dans `MAP_VIEW_DEFAULTS.styleUrl`). À provisionner sur VPS en Phase 1 (tile server MapTiler ou OpenMapTiles). Évite dépendance externe + coût API. |
| Zoom min/max | **5 ↔ 20** (couvre vue région → parcelle individuelle). Configurable via `zoomRange`. |
| Drawing | **Opt-in** via `drawingEnabled` (défaut `false`). Évite UI ambiguë côté lecture seule. Callback `onCreateNew(geometry)` côté parent. |
| Couleur des parcelles | Générée depuis `culture` (palette interne, à définir Phase 1) ou override via `color`. |
| Layout desktop | Map flexible + aside 320 px à droite (cohérent avec AsideCard). |
| Layout mobile | Map plein écran + bottom sheet sur sélection (FAB pour création). |

## Design & UX
- [x] Wireframe HTML (desktop, mobile, mode dessin)
- [x] Satellite par défaut, toggle vers "Rues"
- [x] Sélection : highlight visuel (stroke blanc + remplissage clair)
- [x] FAB création (mobile, opt-in)
- [x] Contrôles zoom + position + plein écran
- [x] Attribution visible (légalement requis pour OSM/MapTiler)

## Code
- [x] Types GeoJSON stricts (`Polygon | MultiPolygon`)
- [x] `Parcel` + `ParcelFeature` exportés
- [x] Helper `parcelsToFeatureCollection`
- [x] Defaults documentés
- [x] Pas de `any`
- [ ] Implémentation maplibre-gl-js → Phase 1

## Accessibilité
- [x] `role="application"` sur canvas + label
- [x] Contrôles avec `aria-label` explicites
- [x] Toggle basemap : radiogroup + aria-pressed
- [x] Navigation clavier prévue (Tab, +/-, flèches pan, Enter sélection)
- [x] Bottom sheet : focus trap + dismiss Esc (à câbler Phase 1)
- [x] Cibles tactiles ≥ 36 px contrôles, 44 px FAB

## Edge cases
- [x] Aucune parcelle → afficher centre par défaut (config exploitation) + message
- [x] Parcelle hors viewport → bouton "Centrer"
- [x] Géométrie invalide → log warning, skip feature (à implémenter)
- [x] Mode offline → tiles cachées (PWA / Phase 2)

## Dépendances Phase 1
- `maplibre-gl` (~250 KB gz)
- `@maplibre/maplibre-gl-geocoder` (optionnel)
- `@mapbox/mapbox-gl-draw` ou équivalent maplibre pour `drawingEnabled`

## Infra Phase 1
- [ ] Provisionner tile server self-hosted (VPS) OU souscrire MapTiler Cloud
- [ ] Style Qodo personnalisé (couleurs cohérentes avec brand)
- [ ] CDN pour les tiles si besoin

## Réutilisation
Module Parcellaire principalement. Module Travaux pour visualiser tâches localisées.

## Status
✅ **Prêt pour Phase 1** (infra tiles à provisionner en parallèle)
