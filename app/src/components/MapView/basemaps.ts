import type { StyleSpecification } from 'maplibre-gl';
import type { Basemap } from './MapView.types';

/**
 * Styles raster basés sur Swisstopo (geo.admin.ch).
 * Service public fédéral suisse — gratuit, sans key, CORS OK,
 * imagerie officielle haute résolution sur toute la Suisse.
 *
 * Documentation : https://www.geo.admin.ch/fr/api-geoservices-geoadmin
 */

// Couche imagerie aérienne (orthophoto haute résolution)
const BASE_SATELLITE: StyleSpecification = {
  version: 8,
  sources: {
    swissimage: {
      type: 'raster',
      tiles: [
        'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg',
      ],
      tileSize: 256,
      attribution: '© <a href="https://www.swisstopo.admin.ch" target="_blank">swisstopo</a>',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'swissimage-layer',
      type: 'raster',
      source: 'swissimage',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

// Carte nationale couleur (équivalent rues + topo de base)
const BASE_STREETS: StyleSpecification = {
  version: 8,
  sources: {
    pixelkarte: {
      type: 'raster',
      tiles: [
        'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg',
      ],
      tileSize: 256,
      attribution: '© <a href="https://www.swisstopo.admin.ch" target="_blank">swisstopo</a>',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'pixelkarte-layer',
      type: 'raster',
      source: 'pixelkarte',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

// Carte nationale relief estompé (topo plus marqué)
const BASE_TOPO: StyleSpecification = {
  version: 8,
  sources: {
    relief: {
      type: 'raster',
      tiles: [
        'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg',
      ],
      tileSize: 256,
      attribution: '© <a href="https://www.swisstopo.admin.ch" target="_blank">swisstopo</a>',
      maxzoom: 19,
    },
    hillshade: {
      type: 'raster',
      tiles: [
        'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.leichte-basiskarte_reliefschattierung/default/current/3857/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      maxzoom: 17,
    },
  },
  layers: [
    {
      id: 'relief-base-layer',
      type: 'raster',
      source: 'relief',
      minzoom: 0,
      maxzoom: 22,
    },
    {
      id: 'hillshade-overlay',
      type: 'raster',
      source: 'hillshade',
      minzoom: 0,
      maxzoom: 22,
      paint: { 'raster-opacity': 0.4 },
    },
  ],
};

export const BASEMAP_STYLES: Record<Basemap, StyleSpecification> = {
  street: BASE_STREETS,
  satellite: BASE_SATELLITE,
  topo: BASE_TOPO,
};

export const BASEMAP_LABELS: Record<Basemap, string> = {
  street: 'Carte',
  satellite: 'Satellite',
  topo: 'Topo',
};
