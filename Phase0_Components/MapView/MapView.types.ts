/**
 * MapView — Carte interactive Maplibre GL affichant les parcelles.
 * Wrapper autour de maplibre-gl-js — Phase 1 ajoutera l'intégration concrète.
 */

import type { Feature, FeatureCollection, Polygon, MultiPolygon } from 'geojson';

export type ParcelGeometry = Polygon | MultiPolygon;
export type ParcelFeature = Feature<ParcelGeometry, ParcelProperties>;

export interface ParcelProperties {
  /** ID stable de la parcelle. */
  id: string;
  /** Nom affiché. */
  name: string;
  /** Surface en hectares. */
  surfaceHa: number;
  /** Culture en place (slug ou label). */
  culture?: string;
  /** Couleur custom (sinon : générée depuis culture). */
  color?: string;
  /** Statut visuel. */
  status?: 'active' | 'fallow' | 'archived';
}

export interface Parcel extends ParcelProperties {
  geometry: ParcelGeometry;
}

export type Basemap = 'satellite' | 'street' | 'topo';

export interface MapViewProps {
  /** Liste des parcelles à afficher. */
  parcels: ReadonlyArray<Parcel>;
  /** ID de la parcelle actuellement sélectionnée. */
  selectedId?: string;
  /** Callback lors de la sélection d'une parcelle. */
  onSelect: (parcelId: string | null) => void;
  /** Centre initial [lng, lat]. Défaut : barycentre des parcelles. */
  center?: [number, number];
  /** Zoom initial. Défaut 14. */
  zoom?: number;
  /** Zoom minimum/maximum. Défaut [5, 20]. */
  zoomRange?: [number, number];
  /** Fond de carte initial. Défaut 'satellite'. */
  basemap?: Basemap;
  /** Affiche le toggle basemap. Défaut true. */
  showBasemapToggle?: boolean;
  /** Active le mode dessin (création de nouvelle parcelle). Défaut false. */
  drawingEnabled?: boolean;
  /** Callback quand une nouvelle géométrie est dessinée. */
  onCreateNew?: (geometry: ParcelGeometry) => void;
  /** Désactive toutes les interactions (mode lecture pure). */
  interactive?: boolean;
  /** Affiche le bouton FAB de création (mobile). Défaut = drawingEnabled. */
  showCreateFab?: boolean;
  /** URL du style Maplibre. Défaut : style self-hosted Qodo. */
  styleUrl?: string;
  /** Hauteur du conteneur. Défaut '100%'. */
  height?: string;
  /** Classe CSS optionnelle. */
  className?: string;
}

export const MAP_VIEW_DEFAULTS = {
  zoom: 14,
  zoomRange: [5, 20] as [number, number],
  basemap: 'satellite' as Basemap,
  showBasemapToggle: true,
  drawingEnabled: false,
  interactive: true,
  height: '100%',
  /** URL placeholder — à remplacer par tile server self-hosted en Phase 1. */
  styleUrl: 'https://tiles.qodo.local/styles/satellite.json',
} as const;

/** Utilitaire pour construire une FeatureCollection à partir de Parcel[]. */
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
      },
    })),
  };
}
