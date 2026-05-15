import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import { MapView, type Parcel } from '../../components/MapView';
import { SearchBar, type FieldDescriptor, type SearchState } from '../../components/SearchBar';
import { ViewSwitcher, type ViewKey } from '../../components/ViewSwitcher';
import { ExportButton, type ExportColumn } from '../../components/ExportButton';
import { useFabActions, useHideFab } from '../../layouts/useFab';
import { PARCELLES } from '../parcellaire/parcellaire.mocks';
import { AssolementTable, type AssolementRow } from './AssolementTable';
import { AssolementTimeline } from './AssolementTimeline';
import { AssolementDetailPanel } from './AssolementDetailPanel';
import { AssolementSegmentEditor } from './AssolementSegmentEditor';
import {
  getAvailableYears,
  getDominantCulture,
  getSegmentsForParcelYear,
  mergeAdjacentSameCulture,
  resolveOverlaps,
} from './assolement.helpers';
import { ASSOLEMENT_SEGMENTS } from './assolement.mocks';
import type { AssolementSegment } from './assolement.types';
import { cultureColor, cultureGroup, listCultureGroups } from './cultures';

const TODAY = new Date().toISOString().slice(0, 10);

const FIELDS: FieldDescriptor[] = [
  { id: 'name', label: 'Nom', type: 'text' },
  { id: 'code', label: 'Code', type: 'text' },
  { id: 'variety', label: 'Variété', type: 'text' },
  {
    id: 'culture',
    label: 'Culture',
    type: 'select',
    // Options = groupes (Blé, Orge, Maïs, ...) ; le détail des variantes
    // ("Blé d'automne", "Blé de printemps", ...) reste dans le form du segment.
    options: listCultureGroups().map((g) => ({ label: g, value: g })),
    groupable: true,
  },
];

const EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'parcelId', label: 'Parcelle' },
  { key: 'parcelName', label: 'Nom' },
  { key: 'culture', label: 'Culture' },
  { key: 'varietyName', label: 'Variété' },
  { key: 'startDate', label: 'Début' },
  { key: 'endDate', label: 'Fin' },
];

type AssolementView = Extract<ViewKey, 'map' | 'timeline' | 'table'>;

export default function AssolementPage() {
  const isDesktop = useIsDesktop();
  const years = useMemo(() => getAvailableYears(), []);
  const [year, setYear] = useState<number>(years[0] ?? new Date().getFullYear());
  const [view, setView] = useState<AssolementView>('map');
  const [searchState, setSearchState] = useState<SearchState>({ facets: [], groupBy: [] });
  const [searchParams] = useSearchParams();
  // Permet l'arrivée depuis une page Parcellaire avec /assolement?parcel=PF-001
  // → pré-sélectionne la parcelle (panneau de détail ouvert).
  const [selectedId, setSelectedId] = useState<string | undefined>(
    () => searchParams.get('parcel') ?? undefined,
  );
  const [segments, setSegments] = useState<AssolementSegment[]>([...ASSOLEMENT_SEGMENTS]);
  const [editingSegment, setEditingSegment] = useState<AssolementSegment | 'new' | null>(null);

  // Masque le FAB sur mobile quand le panel de sélection est ouvert
  useHideFab(!isDesktop && Boolean(selectedId));

  // Pour chaque parcelle, calculer ses segments de l'année et la culture dominante
  const rows: AssolementRow[] = useMemo(
    () =>
      PARCELLES.map((parcel) => ({
        parcel,
        segments: getSegmentsForParcelYear(parcel.id, year, segments),
        dominant: getDominantCulture(parcel.id, year, segments),
      })),
    [year, segments],
  );

  // Filtrage SearchBar (sur le tableau de rows)
  const filtered = useMemo(() => filterRows(rows, searchState), [rows, searchState]);

  // Parcelles peintes pour la carte : couleur = culture dominante de l'année
  const coloredParcels = useMemo<Parcel[]>(
    () =>
      filtered.map(({ parcel, dominant }) => ({
        id: parcel.id,
        name: parcel.name,
        surfaceHa: parcel.surfaceHa,
        status: parcel.status,
        culture: dominant?.culture,
        color: dominant ? cultureColor(dominant.culture) : '#9ca3af',
        geometry: parcel.geometry,
      })),
    [filtered],
  );

  // Stats globales (sur les rows filtrés)
  const totalHa = filtered.reduce((s, r) => s + r.parcel.surfaceHa, 0);
  const summary = `${filtered.length} parcelles · ${totalHa.toFixed(1)} ha · Campagne ${year}`;

  // Lignes d'export (un row par segment)
  const exportRows = useMemo(() => {
    const list: Array<Record<string, unknown>> = [];
    for (const { parcel, segments: segs } of filtered) {
      for (const s of segs) {
        list.push({
          parcelId: parcel.id,
          parcelName: parcel.name,
          culture: s.culture,
          varietyName: s.varietyName ?? '',
          startDate: s.startDate,
          endDate: s.endDate,
        });
      }
    }
    return list;
  }, [filtered]);

  const selectedRow = selectedId ? rows.find((r) => r.parcel.id === selectedId) : undefined;

  /* ============ Édition segments ============ */

  const saveSegment = (next: AssolementSegment) => {
    // resolveOverlaps découpe les segments existants chevauchés pour qu'il
    // n'y ait jamais deux cultures simultanées sur la même parcelle.
    // mergeAdjacentSameCulture fusionne ensuite les segments adjacents qui
    // partagent la même culture (ex. Pâturage 01/01-01/12 + Pâturage
    // 02/12-31/12 → Pâturage 01/01-31/12).
    setSegments((curr) => mergeAdjacentSameCulture(resolveOverlaps(next, curr)));
    setEditingSegment(null);
  };

  const deleteSegment = (id: string) => {
    setSegments((curr) => mergeAdjacentSameCulture(curr.filter((s) => s.id !== id)));
    setEditingSegment(null);
  };

  const startNew = () => {
    if (!selectedRow) return;
    const draft: AssolementSegment = {
      id: `AS-${selectedRow.parcel.id}-${Date.now()}`,
      parcelId: selectedRow.parcel.id,
      culture: "Blé d'automne",
      startDate: `${year}-04-01`,
      endDate: `${year}-08-31`,
    };
    setEditingSegment(draft);
  };

  // FAB : actions contextuelles à la sélection (Ajouter segment) ou globales.
  useFabActions(
    useMemo(() => {
      if (selectedRow) {
        return [
          {
            id: 'add-segment',
            label: 'Ajouter un segment',
            onClick: startNew,
          },
        ];
      }
      return [
        {
          id: 'import-geojson',
          label: 'Importer GeoJSON',
          onClick: () => alert("L'import GeoJSON est disponible depuis la page Parcellaire."),
        },
      ];
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRow]),
  );

  /* ============ Rendu ============ */

  // Sélecteur année compact (juste l'année, label "Campagne" en aria).
  const yearSelect = (
    <select
      aria-label="Campagne"
      title="Campagne"
      value={year}
      onChange={(e) => setYear(Number(e.target.value))}
      className="h-9 rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-2 text-sm font-medium text-(--color-text) hover:bg-[#f8f8f5]"
    >
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  );

  // Topbar : SearchBar prend toute la place ; vues regroupées en dropdown.
  const topBar = (
    <div className="flex w-full items-center gap-2">
      <div className="hidden shrink-0 items-baseline gap-2 md:flex">
        <h1 className="m-0 truncate text-base font-semibold">Plan d'assolement</h1>
        <span className="truncate text-xs text-(--color-muted)">{summary}</span>
      </div>
      <div className="min-w-0 flex-1">
        <SearchBar
          fields={FIELDS}
          value={searchState}
          onChange={setSearchState}
          ariaLabel="Rechercher dans le plan d'assolement"
        />
      </div>
      <div className="shrink-0">{yearSelect}</div>
      {/* Vues : dropdown icône seule sur mobile, segmented icon+label sur desktop. */}
      <div className="shrink-0 md:hidden">
        <ViewSwitcher
          views={['map', 'timeline', 'table']}
          activeView={view}
          onChange={(v) => setView(v as AssolementView)}
          layout="dropdown"
          display="icon-only"
        />
      </div>
      <div className="hidden shrink-0 md:block">
        <ViewSwitcher
          views={['map', 'timeline', 'table']}
          activeView={view}
          onChange={(v) => setView(v as AssolementView)}
          layout="segmented"
        />
      </div>
      <div className="shrink-0">
        <ExportButton
          data={exportRows}
          columns={EXPORT_COLUMNS}
          filenameBase={`assolement-${year}`}
          pdfMeta={{ title: `Plan d'assolement ${year} — Domaine Darval` }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b border-(--color-border) bg-(--color-surface) px-3 py-2">
        {topBar}
      </div>

      {/* CONTENU */}
      {view === 'map' ? (
        <div className="relative flex-1 overflow-hidden">
          <MapView
            parcels={coloredParcels}
            selectedId={selectedId}
            onSelectionChange={(ids) => setSelectedId(ids[0])}
            height="100%"
            className="!rounded-none !border-0"
            showLegend={false}
          />
          <SelectionPanel
            selectedRow={selectedRow}
            year={year}
            editingSegment={editingSegment}
            onSelectSegment={(s) => setEditingSegment(s)}
            onSaveSegment={saveSegment}
            onDeleteSegment={deleteSegment}
            onCancelEdit={() => setEditingSegment(null)}
            onAddSegment={startNew}
            onClose={() => {
              setSelectedId(undefined);
              setEditingSegment(null);
            }}
          />
        </div>
      ) : view === 'timeline' ? (
        <div className="flex-1 overflow-y-auto p-4">
          <TimelineView
            rows={filtered}
            year={year}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          {selectedRow && (
            <SelectionPanel
              selectedRow={selectedRow}
              year={year}
              editingSegment={editingSegment}
              onSelectSegment={(s) => setEditingSegment(s)}
              onSaveSegment={saveSegment}
              onDeleteSegment={deleteSegment}
              onCancelEdit={() => setEditingSegment(null)}
              onAddSegment={startNew}
              onClose={() => {
                setSelectedId(undefined);
                setEditingSegment(null);
              }}
            />
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <AssolementTable rows={filtered} selectedId={selectedId} onSelect={setSelectedId} />
          {selectedRow && (
            <SelectionPanel
              selectedRow={selectedRow}
              year={year}
              editingSegment={editingSegment}
              onSelectSegment={(s) => setEditingSegment(s)}
              onSaveSegment={saveSegment}
              onDeleteSegment={deleteSegment}
              onCancelEdit={() => setEditingSegment(null)}
              onAddSegment={startNew}
              onClose={() => {
                setSelectedId(undefined);
                setEditingSegment(null);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ============ Vue Timeline (Gantt — lignes parcelles × 12 mois) ============ */

function TimelineView({
  rows,
  year,
  selectedId,
  onSelect,
}: {
  rows: ReadonlyArray<AssolementRow>;
  year: number;
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-(--color-muted)">
        Aucune parcelle pour cette campagne.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-(--radius) border border-(--color-border) bg-(--color-surface)">
      {rows.map((row, idx) => (
        <button
          key={row.parcel.id}
          type="button"
          onClick={() => onSelect(row.parcel.id)}
          className={[
            'flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-[#fbfbf9]',
            idx > 0 ? 'border-t border-(--color-border)' : '',
            selectedId === row.parcel.id ? 'bg-(--color-primary)/5' : '',
          ].join(' ')}
        >
          <div className="w-40 shrink-0">
            <div className="truncate text-sm font-medium">{row.parcel.name}</div>
            <div className="font-mono text-[11px] text-(--color-muted)">
              {row.parcel.id} · {row.parcel.surfaceHa.toFixed(2)} ha
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <AssolementTimeline segments={row.segments} year={year} today={TODAY} />
          </div>
        </button>
      ))}
    </div>
  );
}

/* ============ Panneau de sélection (timeline détaillée + édition segments) ============ */

function SelectionPanel({
  selectedRow,
  year,
  editingSegment,
  onSelectSegment,
  onSaveSegment,
  onDeleteSegment,
  onCancelEdit,
  onAddSegment,
  onClose,
}: {
  selectedRow: AssolementRow | undefined;
  year: number;
  editingSegment: AssolementSegment | 'new' | null;
  onSelectSegment: (s: AssolementSegment) => void;
  onSaveSegment: (s: AssolementSegment) => void;
  onDeleteSegment: (id: string) => void;
  onCancelEdit: () => void;
  onAddSegment: () => void;
  onClose: () => void;
}) {
  if (!selectedRow) return null;
  const { parcel, segments: segs, dominant } = selectedRow;
  const dominantLabel = dominant
    ? `Campagne ${year} · ${dominant.culture} dominant`
    : `Campagne ${year}`;

  const subject = editingSegment && editingSegment !== 'new' ? editingSegment : undefined;

  return (
    <div className="absolute inset-x-0 bottom-0 z-[1000] max-h-[88vh] lg:fixed lg:top-0 lg:right-0 lg:bottom-0 lg:left-auto lg:max-h-none lg:w-[440px] lg:border-l lg:border-(--color-border) lg:bg-(--color-surface) lg:shadow-(--shadow-popup)">
      <AssolementDetailPanel
        title={`${parcel.id} — ${parcel.name}`}
        subtitle={dominantLabel}
        onClose={onClose}
      >
        <section>
          <h3 className="m-0 mb-2 text-[11px] font-semibold tracking-wider text-(--color-muted) uppercase">
            Timeline {year}
          </h3>
          <AssolementTimeline
            segments={segs}
            year={year}
            variant="detail"
            today={TODAY}
            onSegmentClick={onSelectSegment}
            onAdd={onAddSegment}
          />
        </section>

        <section className="mt-5">
          <h3 className="m-0 mb-2 text-[11px] font-semibold tracking-wider text-(--color-muted) uppercase">
            Segments
          </h3>
          {segs.length === 0 ? (
            <p className="m-0 text-sm text-(--color-muted)">Aucun segment pour cette campagne.</p>
          ) : (
            <ul className="m-0 list-none space-y-1.5 p-0">
              {segs.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onSelectSegment(s)}
                    className={[
                      'flex w-full items-center gap-2 rounded-(--radius-sm) border px-2.5 py-2 text-left text-sm transition-colors',
                      subject?.id === s.id
                        ? 'border-(--color-primary) bg-(--color-primary)/5'
                        : 'border-(--color-border) bg-(--color-surface) hover:bg-[#fbfbf9]',
                    ].join(' ')}
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block h-3 w-3 shrink-0 rounded-(--radius-pill)"
                      style={{ background: cultureColor(s.culture) }}
                    />
                    <span className="min-w-0 flex-1 truncate">
                      <span className="font-medium">{s.culture}</span>
                      {s.varietyName && (
                        <span className="text-(--color-muted)"> · {s.varietyName}</span>
                      )}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-(--color-muted)">
                      {fmtShort(s.startDate)} → {fmtShort(s.endDate)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Éditeur */}
        {subject && (
          <section className="mt-5">
            <h3 className="m-0 mb-2 text-[11px] font-semibold tracking-wider text-(--color-muted) uppercase">
              Éditer le segment
            </h3>
            <AssolementSegmentEditor
              segment={subject}
              onSave={onSaveSegment}
              onCancel={onCancelEdit}
              onDelete={() => onDeleteSegment(subject.id)}
            />
          </section>
        )}
      </AssolementDetailPanel>
    </div>
  );
}

/* ============ Filtering (local, simple) ============ */

function filterRows(
  rows: ReadonlyArray<AssolementRow>,
  state: SearchState,
): ReadonlyArray<AssolementRow> {
  return rows.filter((row) => {
    const { parcel, dominant, segments } = row;
    if (state.query) {
      const q = state.query.toLowerCase();
      const hay = [parcel.name, parcel.id, dominant?.culture, dominant?.segment.varietyName]
        .filter(Boolean)
        .map((s) => (s as string).toLowerCase());
      if (!hay.some((s) => s.includes(q))) return false;
    }
    for (const facet of state.facets) {
      const ok = facetMatches(parcel, dominant, segments, facet);
      if (!ok) return false;
    }
    return true;
  });
}

function facetMatches(
  parcel: AssolementRow['parcel'],
  dominant: AssolementRow['dominant'],
  segments: AssolementRow['segments'],
  facet: { fieldId: string; values: ReadonlyArray<unknown> },
): boolean {
  if (facet.values.length === 0) return true;
  switch (facet.fieldId) {
    case 'name':
      return facet.values.some((v) => parcel.name.toLowerCase().includes(String(v).toLowerCase()));
    case 'code':
      return facet.values.some((v) => parcel.id.toLowerCase().includes(String(v).toLowerCase()));
    case 'culture': {
      // On compare au radical (groupe) — "Blé d'automne" → "Blé".
      const dominantGroup = dominant ? cultureGroup(dominant.culture) : '';
      return facet.values.some(
        (v) =>
          dominantGroup === String(v) ||
          segments.some((s) => cultureGroup(s.culture) === String(v)),
      );
    }
    case 'variety':
      return facet.values.some((v) =>
        segments.some((s) => (s.varietyName ?? '').toLowerCase().includes(String(v).toLowerCase())),
      );
    default:
      return true;
  }
}

function fmtShort(date: string): string {
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y!.slice(2)}`;
}
