import type { StyleSpecification } from 'maplibre-gl';
import type { Basemap } from './MapView.types';

/**
 * Styles raster simples pour les 3 fonds de carte.
 * Pas de dépendance externe — purement tiles publiques.
 *
 * À remplacer par les styles vector self-hosted Qodo en Phase 2.5
 * (tile server OpenMapTiles sur VPS).
 */

const BASE_STREETS: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm-layer',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

const BASE_SATELLITE: StyleSpecification = {
  version: 8,
  sources: {
    esri: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Tiles © Esri, Maxar, Earthstar Geographics, USDA, USGS',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'satellite-layer',
      type: 'raster',
      source: 'esri',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

const BASE_TOPO: StyleSpecification = {
  version: 8,
  sources: {
    topo: {
      type: 'raster',
      tiles: [
        'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
        'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
        'https://c.tile.opentopomap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenTopoMap (CC-BY-SA), © OpenStreetMap contributors',
      maxzoom: 17,
    },
  },
  layers: [
    {
      id: 'topo-layer',
      type: 'raster',
      source: 'topo',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

export const BASEMAP_STYLES: Record<Basemap, StyleSpecification> = {
  street: BASE_STREETS,
  satellite: BASE_SATELLITE,
  topo: BASE_TOPO,
};

export const BASEMAP_LABELS: Record<Basemap, string> = {
  street: 'Rues',
  satellite: 'Satellite',
  topo: 'Topo',
};
