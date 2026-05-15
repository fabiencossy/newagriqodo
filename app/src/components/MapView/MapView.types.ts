/**
 * MapView — Carte Maplibre GL avec parcelles, markers, outils.
 * Spec : Phase0_Components/MapView/MapView_CHECKLIST.md
 *
 * Phase 1 — implémentation :
 *  - Carte de base + sélection parcelles ✓
 *  - Toolbar 7 outils (UI complète, actions draw/lasso/measure stub)
 *  - Markers d'événements
 *  - Groupes de parcelles
 *  - Tile server : OSM placeholder (à remplacer par self-hosted Qodo Phase 1.5)
 */

import type { Feature, FeatureCollection, MultiPolygon, Point, Polygon } from 'geojson';

export type ParcelGeometry = Polygon | MultiPolygon;
export type ParcelFeature = Feature<ParcelGeometry, ParcelProperties>;

export interface ParcelProperties {
  id: string;
  name: string;
  surfaceHa: number;
  culture?: string;
  color?: string;
  status?: 'active' | 'fallow' | 'archived';
  groupId?: string;
}

export interface Parcel extends ParcelProperties {
  geometry: ParcelGeometry;
}

export interface ParcelGroup {
  id: string;
  name: string;
  color?: string;
  kind?: 'rotation' | 'sector' | 'lot' | 'custom';
  parcelIds: string[];
  notes?: string;
}

export type MarkerKind = 'intervention' | 'observation' | 'problem' | 'note' | 'custom';

export interface MapMarker {
  id: string;
  kind: MarkerKind;
  color?: string;
  position: [number, number]; // [lng, lat]
  label?: string;
  parcelId?: string;
  linkedId?: string;
  createdAt?: Date;
}

export type Basemap = 'satellite' | 'street' | 'topo';

export type MapTool =
  | 'select'
  | 'lasso'
  | 'draw-parcel'
  | 'add-marker'
  | 'measure'
  | 'group'
  | 'layers';

export interface DrawEvent {
  tool: 'draw-parcel' | 'add-marker' | 'measure';
  geometry: Polygon | Point | { type: 'LineString'; coordinates: [number, number][] };
  areaHa?: number;
  distanceM?: number;
}

export interface MapViewProps {
  parcels: ReadonlyArray<Parcel>;
  markers?: ReadonlyArray<MapMarker>;
  groups?: ReadonlyArray<ParcelGroup>;

  selectedId?: string;
  selectedIds?: ReadonlyArray<string>;
  onSelectionChange: (parcelIds: string[]) => void;

  activeTool?: MapTool;
  onToolChange?: (tool: MapTool) => void;
  enabledTools?: ReadonlyArray<MapTool>;

  onDrawComplete?: (event: DrawEvent) => void;
  onCreateGroup?: (parcelIds: string[]) => void;
  onDissolveGroup?: (groupId: string) => void;

  center?: [number, number];
  zoom?: number;
  zoomRange?: [number, number];
  basemap?: Basemap;
  showBasemapToggle?: boolean;
  showLegend?: boolean;

  styleUrl?: string;
  height?: string;
  className?: string;

  interactive?: boolean;
}

export const MAP_VIEW_DEFAULTS = {
  zoom: 14,
  zoomRange: [5, 20] as [number, number],
  basemap: 'street' as Basemap,
  showBasemapToggle: true,
  showLegend: true,
  activeTool: 'select' as MapTool,
  enabledTools: [
    'select',
    'lasso',
    'draw-parcel',
    'add-marker',
    'measure',
    'group',
    'layers',
  ] as MapTool[],
  interactive: true,
  height: '480px',
  /** Style raster OSM gratuit (à remplacer par self-hosted Qodo en Phase 1.5). */
  styleUrl: 'https://tiles.openfreemap.org/styles/liberty',
  // Centre Suisse romande par défaut
  defaultCenter: [6.6322734, 46.5196535] as [number, number],
};

export const MARKER_COLORS: Record<MarkerKind, string> = {
  intervention: '#16a34a',
  observation: '#f59e0b',
  problem: '#dc2626',
  note: '#3b82f6',
  custom: '#875a7b',
};

export const TOOL_SHORTCUTS: Record<MapTool, string> = {
  select: 's',
  lasso: 'l',
  'draw-parcel': 'p',
  'add-marker': 'm',
  measure: 'r',
  group: 'g',
  layers: 'y',
};

export const TOOL_LABELS: Record<MapTool, string> = {
  select: 'Sélection',
  lasso: 'Lasso',
  'draw-parcel': 'Dessiner une parcelle',
  'add-marker': 'Ajouter un point',
  measure: 'Mesurer',
  group: 'Grouper',
  layers: 'Couches',
};

export function parcelsToFeatureCollection(
  parcels: ReadonlyArray<Parcel>,
): FeatureCollection<ParcelGeometry, ParcelProperties> {
  return {
    type: 'FeatureCollection',
    features: parcels.map((p) => ({
      type: 'Feature',
      id: p.id, // top-level pour feature-state Maplibre
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
