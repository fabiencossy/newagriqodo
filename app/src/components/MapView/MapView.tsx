import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapIcon, type IconName } from './icons';
import {
  MAP_VIEW_DEFAULTS,
  MARKER_COLORS,
  TOOL_LABELS,
  TOOL_SHORTCUTS,
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

/* ============ Sources de tuiles (Swisstopo WMTS) ============ */
const TILE_URLS: Record<Basemap, string> = {
  satellite:
    'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg',
  street:
    'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg',
  topo: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg',
};

const TILE_ATTRIBUTION = '© <a href="https://www.swisstopo.admin.ch" target="_blank">swisstopo</a>';

const BASEMAP_LABELS: Record<Basemap, string> = {
  street: 'Carte',
  satellite: 'Satellite',
  topo: 'Topo',
};

export function MapView({
  parcels,
  markers = [],
  selectedId,
  selectedIds,
  onSelectionChange,
  activeTool = MAP_VIEW_DEFAULTS.activeTool,
  onToolChange,
  enabledTools = MAP_VIEW_DEFAULTS.enabledTools,
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
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const parcelLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const hasFittedRef = useRef(false);
  const [basemap, setBasemap] = useState<Basemap>(basemapProp ?? 'satellite');

  const effectiveSelectedIds = useMemo(
    () => [...(selectedIds ?? []), ...(selectedId ? [selectedId] : [])].filter(Boolean),
    [selectedIds, selectedId],
  );

  /* ---------- Init carte Leaflet ---------- */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      // Leaflet utilise [lat, lng] et non [lng, lat] !
      center: [center[1], center[0]],
      zoom,
      minZoom: zoomRange[0],
      maxZoom: zoomRange[1],
      zoomControl: false, // on ajoute en bas-gauche manuellement
      attributionControl: true,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
      touchZoom: interactive,
    });

    if (interactive) {
      L.control.zoom({ position: 'bottomleft' }).addTo(map);
    }

    // Première couche de tuiles
    const tileLayer = L.tileLayer(TILE_URLS[basemap], {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 22,
    });
    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

    // Groupes vides pour les markers et parcelles (mis à jour dans effets séparés)
    markersLayerRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      parcelLayerRef.current = null;
      markersLayerRef.current = null;
      hasFittedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive]);

  /* ---------- Switch basemap ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tileLayerRef.current) return;
    map.removeLayer(tileLayerRef.current);
    const newLayer = L.tileLayer(TILE_URLS[basemap], {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 22,
    });
    newLayer.addTo(map);
    tileLayerRef.current = newLayer;
  }, [basemap]);

  /* ---------- Layer parcelles (GeoJSON) ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Retirer l'ancien layer si présent
    if (parcelLayerRef.current) {
      map.removeLayer(parcelLayerRef.current);
      parcelLayerRef.current = null;
    }

    if (parcels.length === 0) return;

    const featureCollection: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: parcels.map((p) => ({
        type: 'Feature',
        properties: { id: p.id, name: p.name, surface: p.surfaceHa },
        geometry: p.geometry,
      })),
    };

    const layer = L.geoJSON(featureCollection, {
      style: (feature) => {
        const id = feature?.properties?.id as string;
        const isSelected = effectiveSelectedIds.includes(id);
        const parcel = parcels.find((p) => p.id === id);
        return {
          color: isSelected ? '#2d5016' : '#1a1a1a',
          weight: isSelected ? 3 : 1.5,
          fillColor: isSelected ? '#2d5016' : (parcel?.color ?? '#f4a261'),
          fillOpacity: isSelected ? 0.55 : 0.35,
        };
      },
      onEachFeature: (feature, layerInstance) => {
        const id = feature.properties?.id as string;
        const name = feature.properties?.name as string;
        // Label au centre
        layerInstance.bindTooltip(name, {
          permanent: true,
          direction: 'center',
          className: 'qodo-parcel-label',
        });
        // Clic = sélection
        layerInstance.on('click', (e) => {
          const orig = e.originalEvent as MouseEvent;
          const multi = orig.shiftKey || orig.metaKey;
          if (multi) {
            const next = effectiveSelectedIds.includes(id)
              ? effectiveSelectedIds.filter((s) => s !== id)
              : [...effectiveSelectedIds, id];
            onSelectionChange(next);
          } else {
            onSelectionChange([id]);
          }
        });
      },
    });
    layer.addTo(map);
    parcelLayerRef.current = layer;
  }, [parcels, effectiveSelectedIds, onSelectionChange]);

  /* ---------- Auto-fit aux parcelles (une seule fois) ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || hasFittedRef.current || parcels.length === 0) return;
    if (!parcelLayerRef.current) return;
    const bounds = parcelLayerRef.current.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17, animate: false });
      hasFittedRef.current = true;
    }
  }, [parcels]);

  /* ---------- Markers ---------- */
  useEffect(() => {
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    for (const m of markers) {
      const color = m.color ?? MARKER_COLORS[m.kind];
      const icon = L.divIcon({
        html: `<span style="display:inline-block;width:16px;height:16px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 0 0 1px rgba(0,0,0,0.3);"></span>`,
        className: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      const marker = L.marker([m.position[1], m.position[0]], { icon });
      if (m.label) marker.bindPopup(m.label);
      marker.addTo(layer);
    }
  }, [markers]);

  /* ---------- Raccourcis clavier outils ---------- */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
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
          className="absolute top-3 left-3 z-[400] flex flex-col overflow-hidden rounded-(--radius) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-card)"
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
                  groupDisabled ? 'cursor-not-allowed opacity-40' : '',
                ].join(' ')}
              >
                <MapIcon name={TOOL_ICONS[tool]} />
              </button>
            );
          })}
        </div>
      )}

      {/* Sélection badge (multi) */}
      {effectiveSelectedIds.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-[500] -translate-x-1/2 transform">
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
        <div className="absolute right-3 bottom-3 z-[400] rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-3 py-2 text-xs shadow-(--shadow-card)">
          <LegendDot color={MARKER_COLORS.intervention} label="Intervention" />
          <LegendDot color={MARKER_COLORS.observation} label="Observation" />
          <LegendDot color={MARKER_COLORS.problem} label="Problème" />
          {markers.some((m) => m.kind === 'note') && (
            <LegendDot color={MARKER_COLORS.note} label="Note" />
          )}
        </div>
      )}

      {/* Toggle basemap */}
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
    <div ref={wrapperRef} className="absolute top-3 right-3 z-[400]">
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
