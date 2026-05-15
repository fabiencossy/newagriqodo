import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { type Map as MaplibreMap, type MapMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapIcon, type IconName } from './icons';
import {
  MAP_VIEW_DEFAULTS,
  MARKER_COLORS,
  TOOL_LABELS,
  TOOL_SHORTCUTS,
  parcelsToFeatureCollection,
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
  showLegend = MAP_VIEW_DEFAULTS.showLegend,
  styleUrl = MAP_VIEW_DEFAULTS.styleUrl,
  height = MAP_VIEW_DEFAULTS.height,
  interactive = MAP_VIEW_DEFAULTS.interactive,
  className,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markerRefs = useRef<Map<string, maplibregl.Marker>>(new Map());
  const [mapReady, setMapReady] = useState(false);

  const effectiveSelectedIds = useMemo(
    () => [...(selectedIds ?? []), ...(selectedId ? [selectedId] : [])].filter(Boolean),
    [selectedIds, selectedId],
  );

  /* ---------- Init carte ---------- */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center,
      zoom,
      minZoom: zoomRange[0],
      maxZoom: zoomRange[1],
      interactive,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.on('load', () => setMapReady(true));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleUrl, interactive]);

  /* ---------- Layers parcelles ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

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
  }, [effectiveSelectedIds, parcels, mapReady]);

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
      <div ref={containerRef} className="absolute inset-0" />

      {/* Toolbar latérale gauche */}
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

      {/* État loading */}
      {!mapReady && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-(--color-bg)">
          <span className="text-sm text-(--color-muted)">Chargement de la carte…</span>
        </div>
      )}
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
