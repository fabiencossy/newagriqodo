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
    carto: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors, © CARTO',
      maxzoom: 20,
    },
  },
  layers: [
    {
      id: 'carto-layer',
      type: 'raster',
      source: 'carto',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

const BASE_SATELLITE: StyleSpecification = {
  version: 8,
  sources: {
    sat: {
      type: 'raster',
      // EOX Sentinel-2 cloudless 2024 — service public européen, CORS OK,
      // gratuit pour usage non commercial / dev. Fonctionne sur localhost
      // sans key. Couvre toute la Terre, max zoom 15 (suffisant pour l'agri).
      tiles: [
        'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg',
      ],
      tileSize: 256,
      attribution:
        'Sentinel-2 cloudless 2024 by EOX (Contains modified Copernicus Sentinel data 2024)',
      maxzoom: 15,
    },
  },
  layers: [
    {
      id: 'satellite-layer',
      type: 'raster',
      source: 'sat',
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
