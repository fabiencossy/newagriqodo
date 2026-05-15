/**
 * MapView — Carte interactive Maplibre GL avec outils étendus
 * (sélection, lasso, dessin de parcelles, ajout de points, mesure, groupage).
 */

import type { Feature, FeatureCollection, Polygon, MultiPolygon, Point, LineString } from 'geojson';

export type ParcelGeometry = Polygon | MultiPolygon;
export type ParcelFeature = Feature<ParcelGeometry, ParcelProperties>;

export interface ParcelProperties {
  id: string;
  name: string;
  surfaceHa: number;
  culture?: string;
  color?: string;
  status?: 'active' | 'fallow' | 'archived';
  /** ID du groupe auquel appartient la parcelle (cf. ParcelGroup). */
  groupId?: string;
}

export interface Parcel extends ParcelProperties {
  geometry: ParcelGeometry;
}

/** Regroupement logique de parcelles (rotation, secteur, lot, exploitation déléguée, …). */
export interface ParcelGroup {
  id: string;
  name: string;
  /** Couleur utilisée pour teinter les parcelles. */
  color?: string;
  /** Type métier du groupe. Libre. */
  kind?: 'rotation' | 'sector' | 'lot' | 'custom';
  parcelIds: string[];
  notes?: string;
}

/** Marker = point d'intérêt sur la carte (intervention, observation, problème). */
export type MarkerKind = 'intervention' | 'observation' | 'problem' | 'note' | 'custom';

export interface MapMarker {
  id: string;
  kind: MarkerKind;
  /** Couleur custom (sinon : couleur du `kind`). */
  color?: string;
  /** Coordonnée [lng, lat]. */
  position: [number, number];
  /** Label affiché en tooltip. */
  label?: string;
  /** ID parcelle associée (si applicable). */
  parcelId?: string;
  /** ID intervention/évent associé. */
  linkedId?: string;
  createdAt?: Date;
}

export type Basemap = 'satellite' | 'street' | 'topo';

/** Outils disponibles dans la toolbar latérale. */
export type MapTool =
  | 'select'        // Cliquer une parcelle ou un marker
  | 'lasso'         // Tracer une zone → sélection multiple
  | 'draw-parcel'   // Dessiner un nouveau polygone (parcelle)
  | 'add-marker'    // Cliquer sur la carte pour poser un point
  | 'measure'       // Mesurer une distance / surface
  | 'group'         // Action sur la sélection courante : créer un groupe
  | 'layers';       // Toggle layers panel

/** Évènement émis quand l'utilisateur dessine une géométrie. */
export interface DrawEvent {
  tool: 'draw-parcel' | 'add-marker' | 'measure';
  geometry: Polygon | Point | LineString;
  /** Surface en ha (pour polygones). */
  areaHa?: number;
  /** Distance en mètres (pour LineString). */
  distanceM?: number;
}

export interface MapViewProps {
  /** Liste des parcelles à afficher. */
  parcels: ReadonlyArray<Parcel>;
  /** Marqueurs (interventions, observations, …). */
  markers?: ReadonlyArray<MapMarker>;
  /** Groupes de parcelles. */
  groups?: ReadonlyArray<ParcelGroup>;

  /** Sélection unique (rétro-compat). */
  selectedId?: string;
  /** Sélection multiple (utilisée par lasso / Ctrl+clic). */
  selectedIds?: ReadonlyArray<string>;
  /** Callback de sélection. */
  onSelectionChange: (parcelIds: string[]) => void;

  /** Outil actif (controlled). Défaut 'select'. */
  activeTool?: MapTool;
  /** Callback de changement d'outil. */
  onToolChange?: (tool: MapTool) => void;
  /** Outils disponibles dans la toolbar (filtre). Défaut : tous. */
  enabledTools?: ReadonlyArray<MapTool>;

  /** Callback lors de la finalisation d'un dessin (parcelle / marker / mesure). */
  onDrawComplete?: (event: DrawEvent) => void;

  /** Callback création de groupe à partir de la sélection courante. */
  onCreateGroup?: (parcelIds: string[]) => void;
  /** Callback dissolution d'un groupe. */
  onDissolveGroup?: (groupId: string) => void;

  /** Centre initial [lng, lat]. */
  center?: [number, number];
  /** Zoom initial. Défaut 14. */
  zoom?: number;
  /** Zoom min/max. Défaut [5, 20]. */
  zoomRange?: [number, number];
  /** Fond de carte. Défaut 'satellite'. */
  basemap?: Basemap;
  /** Affiche le toggle basemap. Défaut true. */
  showBasemapToggle?: boolean;
  /** Affiche la légende des markers. Défaut true. */
  showLegend?: boolean;

  /** URL du style Maplibre. Défaut : tile server self-hosted Qodo. */
  styleUrl?: string;
  /** Hauteur du conteneur. Défaut '100%'. */
  height?: string;
  /** Classe CSS optionnelle. */
  className?: string;

  /** Désactive toute interaction (mode lecture). */
  interactive?: boolean;
}

export const MAP_VIEW_DEFAULTS = {
  zoom: 14,
  zoomRange: [5, 20] as [number, number],
  basemap: 'satellite' as Basemap,
  showBasemapToggle: true,
  showLegend: true,
  activeTool: 'select' as MapTool,
  enabledTools: ['select', 'lasso', 'draw-parcel', 'add-marker', 'measure', 'group', 'layers'] as MapTool[],
  interactive: true,
  height: '100%',
  styleUrl: 'https://tiles.qodo.local/styles/satellite.json',
} as const;

export const MARKER_COLORS: Record<MarkerKind, string> = {
  intervention: '#16a34a',
  observation: '#f59e0b',
  problem: '#dc2626',
  note: '#3b82f6',
  custom: '#875a7b',
};

/** Raccourcis clavier des outils. */
export const TOOL_SHORTCUTS: Record<MapTool, string> = {
  select: 's',
  lasso: 'l',
  'draw-parcel': 'p',
  'add-marker': 'm',
  measure: 'r',
  group: 'g',
  layers: 'y',
};

export function parcelsToFeatureCollection(
  parcels: ReadonlyArray<Parcel>,
): FeatureCollection<ParcelGeometry, ParcelProperties> {
  return {
    type: 'FeatureCollection',
    features: parcels.map((p) => ({
      type: 'Feature',
      geometry: p.geometry,
      properties: {
        id: p.id,
        name: p.name,
        surfaceHa: p.surfaceHa,
        culture: p.culture,
        color: p.color,
        status: p.status,
        groupId: p.groupId,
      },
    })),
  };
}
