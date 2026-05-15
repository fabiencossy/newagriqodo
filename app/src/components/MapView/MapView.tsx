import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { type Map as MaplibreMap, type MapMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapIcon, type IconName } from './icons';
import { BASEMAP_LABELS, BASEMAP_STYLES } from './basemaps';
import {
  MAP_VIEW_DEFAULTS,
  MARKER_COLORS,
  TOOL_LABELS,
  TOOL_SHORTCUTS,
  parcelsToFeatureCollection,
  type Basemap,
  type MapTool,
  type MapViewProps,
} from './MapView.types';

const TOOL_ICONS: Record<MapTool, IconName> = {
  select: 'select',
  lasso: 'lasso',
  'draw-parcel': 'drawParcel',
  'add-marker': 'pin',
  measure: 'ruler',
  group: 'group',
  layers: 'layers',
};

const PARCEL_SOURCE = 'qodo-parcels';
const PARCEL_FILL_LAYER = 'qodo-parcels-fill';
const PARCEL_LINE_LAYER = 'qodo-parcels-line';
const PARCEL_LABEL_LAYER = 'qodo-parcels-label';

export function MapView({
  parcels,
  markers = [],
  selectedId,
  selectedIds,
  onSelectionChange,
  activeTool = MAP_VIEW_DEFAULTS.activeTool,
  onToolChange,
  enabledTools = MAP_VIEW_DEFAULTS.enabledTools,
  onDrawComplete: _onDrawComplete,
  onCreateGroup,
  center = MAP_VIEW_DEFAULTS.defaultCenter,
  zoom = MAP_VIEW_DEFAULTS.zoom,
  zoomRange = MAP_VIEW_DEFAULTS.zoomRange,
  basemap: basemapProp,
  showBasemapToggle = MAP_VIEW_DEFAULTS.showBasemapToggle,
  showLegend = MAP_VIEW_DEFAULTS.showLegend,
  height = MAP_VIEW_DEFAULTS.height,
  interactive = MAP_VIEW_DEFAULTS.interactive,
  className,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markerRefs = useRef<Map<string, maplibregl.Marker>>(new Map());
  const hasFittedRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const [basemap, setBasemap] = useState<Basemap>(basemapProp ?? 'satellite');
  // Compteur incrémenté à chaque setStyle pour re-déclencher l'init des layers
  const [styleVersion, setStyleVersion] = useState(0);

  const effectiveSelectedIds = useMemo(
    () => [...(selectedIds ?? []), ...(selectedId ? [selectedId] : [])].filter(Boolean),
    [selectedIds, selectedId],
  );

  /* ---------- Init carte ---------- */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    console.log('[MapView] init', { center, zoom, basemap });
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAP_STYLES[basemap],
      center,
      zoom,
      minZoom: zoomRange[0],
      maxZoom: zoomRange[1],
      interactive,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-left');

    // Debug : tracer toutes les erreurs de tile et load

    map.on('error', (e) => console.warn('[MapView] error', e));

    map.on('load', () => console.log('[MapView] load OK'));

    map.on('idle', () => console.log('[MapView] idle (tiles loaded)'));

    map.on('styledata', () => {
      if (mapRef.current === map) setStyleVersion((v) => v + 1);
    });

    mapRef.current = map;
    // Set ready immédiatement — la map existe, les effects dépendants peuvent tourner.
    // Ceux qui ont besoin du style chargé vérifient `map.isStyleLoaded()` ou
    // s'abonnent à 'idle'/'styledata' en interne.
    setMapReady(true);

    // ResizeObserver : forcer map.resize() + triggerRepaint à chaque changement.
    const ro = new ResizeObserver(() => {
      map.resize();
      map.triggerRepaint();
    });
    ro.observe(containerRef.current);

    // Double rAF + setTimeout : couvre tous les cas où le container a 0 px au mount
    // (notamment quand on est dans un grid qui n'a pas encore calculé son layout).
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        map.resize();
        map.triggerRepaint();
      });
    });
    setTimeout(() => {
      map.resize();
      map.triggerRepaint();
    }, 200);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
    // Initialiser uniquement au mount ; les changements de basemap passent par setStyle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive]);

  /* ---------- Switch basemap ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    map.setStyle(BASEMAP_STYLES[basemap], { diff: false });
  }, [basemap, mapReady]);

  /* ---------- Layers parcelles ---------- */
  // styleVersion bump à chaque setStyle → force la ré-injection des sources/layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    // Attendre que le style soit chargé après setStyle
    if (!map.isStyleLoaded()) return;

    const data = parcelsToFeatureCollection(parcels);

    const existing = map.getSource(PARCEL_SOURCE) as maplibregl.GeoJSONSource | undefined;
    if (existing) {
      existing.setData(data);
    } else {
      map.addSource(PARCEL_SOURCE, { type: 'geojson', data });
      map.addLayer({
        id: PARCEL_FILL_LAYER,
        type: 'fill',
        source: PARCEL_SOURCE,
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#2d5016',
            ['get', 'color'],
            ['get', 'color'],
            '#f4a261',
          ],
          'fill-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 0.55, 0.35],
        },
      });
      map.addLayer({
        id: PARCEL_LINE_LAYER,
        type: 'line',
        source: PARCEL_SOURCE,
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#2d5016',
            '#1a1a1a',
          ],
          'line-width': ['case', ['boolean', ['feature-state', 'selected'], false], 3, 1.5],
        },
      });
      map.addLayer({
        id: PARCEL_LABEL_LAYER,
        type: 'symbol',
        source: PARCEL_SOURCE,
        layout: {
          'text-field': ['concat', ['get', 'name']],
          'text-size': 11,
          'text-anchor': 'center',
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#1a1a1a',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
      });
    }
  }, [parcels, mapReady, styleVersion]);

  /* ---------- Auto-fit aux parcelles (une seule fois au load) ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (hasFittedRef.current) return;
    if (parcels.length === 0) return;

    // Calcul bbox des parcelles
    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;
    for (const p of parcels) {
      const polys =
        p.geometry.type === 'Polygon' ? [p.geometry.coordinates] : p.geometry.coordinates;
      for (const poly of polys) {
        for (const ring of poly) {
          for (const coord of ring) {
            const lng = coord[0]!;
            const lat = coord[1]!;
            if (lng < minLng) minLng = lng;
            if (lat < minLat) minLat = lat;
            if (lng > maxLng) maxLng = lng;
            if (lat > maxLat) maxLat = lat;
          }
        }
      }
    }

    if (Number.isFinite(minLng)) {
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 60, animate: false, maxZoom: 17 },
      );
      hasFittedRef.current = true;
    }
  }, [parcels, mapReady]);

  /* ---------- Feature states (sélection) ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    for (const p of parcels) {
      const isSel = effectiveSelectedIds.includes(p.id);
      try {
        map.setFeatureState({ source: PARCEL_SOURCE, id: p.id }, { selected: isSel });
      } catch {
        // Source pas encore prête : on ignore
      }
    }
  }, [effectiveSelectedIds, parcels, mapReady, styleVersion]);

  /* ---------- Sélection au clic ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (activeTool !== 'select') return;

    const handler = (e: MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [PARCEL_FILL_LAYER] });
      if (features.length === 0) {
        onSelectionChange([]);
        return;
      }
      const props = features[0]!.properties as { id?: string } | null;
      const id = props?.id;
      if (!id) return;
      const multi = e.originalEvent.shiftKey || e.originalEvent.metaKey;
      if (multi) {
        const next = effectiveSelectedIds.includes(id)
          ? effectiveSelectedIds.filter((s) => s !== id)
          : [...effectiveSelectedIds, id];
        onSelectionChange(next);
      } else {
        onSelectionChange([id]);
      }
    };
    map.on('click', handler);
    map.getCanvas().style.cursor = 'pointer';
    return () => {
      map.off('click', handler);
      map.getCanvas().style.cursor = '';
    };
  }, [activeTool, onSelectionChange, effectiveSelectedIds, mapReady]);

  /* ---------- Markers (interventions / observations / …) ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    // Retirer anciens markers
    const currentIds = new Set(markers.map((m) => m.id));
    for (const [id, marker] of markerRefs.current.entries()) {
      if (!currentIds.has(id)) {
        marker.remove();
        markerRefs.current.delete(id);
      }
    }

    for (const m of markers) {
      const existing = markerRefs.current.get(m.id);
      const color = m.color ?? MARKER_COLORS[m.kind];
      if (existing) {
        existing.setLngLat(m.position);
        continue;
      }
      const marker = new maplibregl.Marker({ color }).setLngLat(m.position);
      if (m.label) marker.setPopup(new maplibregl.Popup().setText(m.label));
      marker.addTo(map);
      markerRefs.current.set(m.id, marker);
    }
  }, [markers, mapReady]);

  /* ---------- Raccourcis clavier outils ---------- */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore si l'utilisateur tape dans un input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();
      const tool = (Object.entries(TOOL_SHORTCUTS) as [MapTool, string][]).find(
        ([, k]) => k === key,
      );
      if (tool && enabledTools.includes(tool[0])) {
        onToolChange?.(tool[0]);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onToolChange, enabledTools]);

  /* ---------- Toolbar handlers ---------- */
  const handleToolClick = useCallback(
    (tool: MapTool) => {
      if (tool === 'group' && effectiveSelectedIds.length > 0) {
        onCreateGroup?.(effectiveSelectedIds.slice());
        return;
      }
      onToolChange?.(tool);
    },
    [onToolChange, onCreateGroup, effectiveSelectedIds],
  );

  /* ---------- Render ---------- */
  return (
    <div
      className={[
        'relative overflow-hidden rounded-(--radius) border border-(--color-border) bg-(--color-surface)',
        className ?? '',
      ].join(' ')}
      style={{ height }}
    >
      <div ref={containerRef} className="absolute inset-0" style={{ background: '#e5e3df' }} />

      {/* Toolbar latérale gauche (cachée si aucun outil enabled) */}
      {enabledTools.length > 0 && (
        <div
          role="toolbar"
          aria-label="Outils carte"
          className="absolute top-3 left-3 z-10 flex flex-col overflow-hidden rounded-(--radius) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-card)"
        >
          {enabledTools.map((tool, idx) => {
            const isActive = tool === activeTool;
            const isGroupAction = tool === 'group';
            const groupDisabled = isGroupAction && effectiveSelectedIds.length === 0;
            return (
              <button
                key={tool}
                type="button"
                aria-pressed={isActive}
                aria-label={`${TOOL_LABELS[tool]} (${TOOL_SHORTCUTS[tool].toUpperCase()})`}
                title={`${TOOL_LABELS[tool]} (${TOOL_SHORTCUTS[tool].toUpperCase()})`}
                disabled={groupDisabled}
                onClick={() => handleToolClick(tool)}
                className={[
                  'inline-flex h-10 w-10 items-center justify-center transition-colors',
                  idx > 0 ? 'border-t border-(--color-border)' : '',
                  isActive
                    ? 'bg-(--color-accent) text-white'
                    : 'text-(--color-text) hover:bg-[#f5f5f0]',
                  groupDisabled ? 'opacity-40 cursor-not-allowed' : '',
                ].join(' ')}
              >
                <MapIcon name={TOOL_ICONS[tool]} />
              </button>
            );
          })}
        </div>
      )}

      {/* Sélection badge */}
      {effectiveSelectedIds.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 transform">
          <div className="inline-flex items-center gap-3 rounded-(--radius-pill) bg-(--color-accent) px-4 py-2 text-sm font-medium text-white shadow-(--shadow-fab)">
            <span>
              <strong className="font-semibold">{effectiveSelectedIds.length}</strong> parcelles
              sélectionnées
            </span>
            {onCreateGroup && (
              <button
                type="button"
                onClick={() => onCreateGroup(effectiveSelectedIds.slice())}
                className="rounded-(--radius-sm) bg-white/20 px-2.5 py-0.5 text-xs hover:bg-white/30"
              >
                Grouper
              </button>
            )}
            <button
              type="button"
              onClick={() => onSelectionChange([])}
              className="rounded-(--radius-sm) bg-white/20 px-2.5 py-0.5 text-xs hover:bg-white/30"
            >
              Désélectionner
            </button>
          </div>
        </div>
      )}

      {/* Légende markers */}
      {showLegend && markers.length > 0 && (
        <div className="absolute bottom-3 left-3 z-10 rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-3 py-2 text-xs shadow-(--shadow-card)">
          <LegendDot color={MARKER_COLORS.intervention} label="Intervention" />
          <LegendDot color={MARKER_COLORS.observation} label="Observation" />
          <LegendDot color={MARKER_COLORS.problem} label="Problème" />
          {markers.some((m) => m.kind === 'note') && (
            <LegendDot color={MARKER_COLORS.note} label="Note" />
          )}
        </div>
      )}

      {/* Toggle basemap (haut-droite) — bouton unique avec dropdown Satellite/Topo */}
      {showBasemapToggle && <BasemapPicker basemap={basemap} onChange={setBasemap} />}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span
        className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-(--radius-pill) border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
        style={{ background: color }}
      />
      <span>{label}</span>
    </div>
  );
}

/* ============ BasemapPicker ============ */
const PICKER_OPTIONS: Basemap[] = ['satellite', 'topo'];

function BasemapPicker({
  basemap,
  onChange,
}: {
  basemap: Basemap;
  onChange: (b: Basemap) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrapperRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={wrapperRef} className="absolute top-3 right-3 z-10">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Fond de carte"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 items-center gap-2 rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-3 text-xs font-medium shadow-(--shadow-card) hover:bg-[#f5f5f0]"
      >
        <LayersGlyph />
        <span>{BASEMAP_LABELS[basemap]}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-1 w-[140px] overflow-hidden rounded-(--radius) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-popup)"
        >
          {PICKER_OPTIONS.map((b) => {
            const isActive = b === basemap;
            return (
              <li key={b}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onChange(b);
                    setOpen(false);
                  }}
                  className={[
                    'flex h-9 w-full items-center gap-2 px-3 text-xs',
                    isActive
                      ? 'bg-(--color-primary)/10 font-medium text-(--color-primary)'
                      : 'text-(--color-text) hover:bg-[#f5f5f0]',
                  ].join(' ')}
                >
                  {BASEMAP_LABELS[b]}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function LayersGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={14}
      height={14}
      aria-hidden="true"
    >
      <path d="m12 2 10 6-10 6L2 8z" />
      <path d="m2 14 10 6 10-6" />
    </svg>
  );
}
