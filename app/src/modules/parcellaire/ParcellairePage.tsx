import { useMemo, useState } from 'react';
import { PageContainer } from '../_shared/PageContainer';
import { PageHeader } from '../_shared/PageHeader';
import { SearchBar, type FieldDescriptor, type SearchState } from '../../components/SearchBar';
import { ViewSwitcher, type ViewKey } from '../../components/ViewSwitcher';
import { ExportButton, type ExportColumn } from '../../components/ExportButton';
import { MapView } from '../../components/MapView';
import { AsideCard, type FieldConfig } from '../../components/AsideCard';
import { PARCELLES, type ParcelDetail } from './parcellaire.mocks';
import { filterParcels } from './filtering';
import { ParcellaireTable } from './ParcellaireTable';

const FIELDS: FieldDescriptor[] = [
  { id: 'name', label: 'Nom', type: 'text' },
  { id: 'code', label: 'Code', type: 'text' },
  { id: 'notes', label: 'Notes', type: 'text' },
  { id: 'variety', label: 'Variété', type: 'text' },
  {
    id: 'culture',
    label: 'Culture',
    type: 'select',
    options: [
      { label: 'Blé', value: 'Blé' },
      { label: 'Maïs', value: 'Maïs' },
      { label: 'Colza', value: 'Colza' },
      { label: 'Orge', value: 'Orge' },
      { label: 'Jachère', value: 'Jachère' },
    ],
    groupable: true,
  },
  {
    id: 'status',
    label: 'Statut',
    type: 'select',
    options: [
      { label: 'Actif', value: 'active' },
      { label: 'Jachère', value: 'fallow' },
      { label: 'Archivé', value: 'archived' },
    ],
    groupable: true,
  },
  {
    id: 'year',
    label: 'Année',
    type: 'select',
    options: [
      { label: '2026', value: 2026 },
      { label: '2025', value: 2025 },
      { label: '2024', value: 2024 },
    ],
    groupable: true,
  },
];

const EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'id', label: 'Code' },
  { key: 'name', label: 'Nom' },
  { key: 'surfaceHa', label: 'Surface (ha)' },
  { key: 'culture', label: 'Culture' },
  { key: 'varietyName', label: 'Variété' },
  { key: 'status', label: 'Statut' },
  { key: 'year', label: 'Année' },
];

const ASIDE_FIELDS: FieldConfig[] = [
  { key: 'id', label: 'Code', type: 'text', readonly: true },
  { key: 'name', label: 'Nom', type: 'text' },
  { key: 'surfaceHa', label: 'Surface (ha)', type: 'number' },
  {
    key: 'culture',
    label: 'Culture',
    type: 'select',
    options: [
      { label: 'Blé', value: 'Blé' },
      { label: 'Maïs', value: 'Maïs' },
      { label: 'Colza', value: 'Colza' },
      { label: 'Orge', value: 'Orge' },
      { label: 'Jachère', value: 'Jachère' },
    ],
  },
  { key: 'varietyName', label: 'Variété', type: 'text' },
  { key: 'sowingDate', label: 'Date semis', type: 'date' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function ParcellairePage() {
  const [view, setView] = useState<ViewKey>('map');
  const [searchState, setSearchState] = useState<SearchState>({ facets: [], groupBy: [] });
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [parcels, setParcels] = useState<ParcelDetail[]>(PARCELLES);
  const [asideMode, setAsideMode] = useState<'view' | 'edit'>('view');

  const filtered = useMemo(() => filterParcels(parcels, searchState), [parcels, searchState]);

  const selected = useMemo(
    () => (selectedId ? parcels.find((p) => p.id === selectedId) : undefined),
    [parcels, selectedId],
  );

  const totalSurface = filtered.reduce((s, p) => s + p.surfaceHa, 0);

  const handleSaveAside = async (next: Record<string, unknown>) => {
    setParcels((curr) =>
      curr.map((p) => (p.id === next.id ? ({ ...p, ...next } as ParcelDetail) : p)),
    );
    setAsideMode('view');
  };

  return (
    <PageContainer>
      <PageHeader
        title="Parcellaire"
        subtitle={`${filtered.length} parcelles · ${totalSurface.toFixed(1)} ha`}
        actions={
          <>
            <ViewSwitcher
              views={['map', 'table', 'dashboard']}
              activeView={view}
              onChange={setView}
              layout="segmented"
            />
            <ExportButton
              data={filtered as unknown as ReadonlyArray<Record<string, unknown>>}
              columns={EXPORT_COLUMNS}
              filenameBase="parcelles"
              pdfMeta={{ title: 'Parcelles — Domaine Darval' }}
            />
          </>
        }
      />

      <div className="mb-4">
        <SearchBar
          fields={FIELDS}
          value={searchState}
          onChange={setSearchState}
          ariaLabel="Rechercher dans le parcellaire"
        />
      </div>

      {/* Layout : contenu principal + aside */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          {view === 'map' && (
            <MapView
              parcels={filtered}
              selectedId={selectedId}
              onSelectionChange={(ids) => setSelectedId(ids[0])}
              height="540px"
            />
          )}
          {view === 'table' && (
            <ParcellaireTable parcels={filtered} selectedId={selectedId} onSelect={setSelectedId} />
          )}
          {view === 'dashboard' && <DashboardView parcels={filtered} />}
        </div>

        {/* Aside (toujours présent en desktop, conditionnel mobile) */}
        <div className="hidden lg:block">
          {selected ? (
            <AsideCard
              title={`${selected.id} — ${selected.name}`}
              subtitle="Sélection courante"
              data={selected as unknown as Record<string, unknown>}
              fields={ASIDE_FIELDS}
              mode={asideMode}
              onModeChange={setAsideMode}
              editable
              onClose={() => setSelectedId(undefined)}
              onSave={handleSaveAside}
              layout="aside"
              width="100%"
            />
          ) : (
            <aside className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-(--radius) border border-dashed border-(--color-border) bg-(--color-surface) p-6 text-center text-sm text-(--color-muted)">
              <p className="m-0">Sélectionnez une parcelle pour voir le détail.</p>
            </aside>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

/* ============ Dashboard simple ============ */
function DashboardView({ parcels }: { parcels: ReadonlyArray<ParcelDetail> }) {
  const byCulture = parcels.reduce<Record<string, number>>((acc, p) => {
    acc[p.culture ?? '—'] = (acc[p.culture ?? '—'] ?? 0) + p.surfaceHa;
    return acc;
  }, {});
  const total = parcels.reduce((s, p) => s + p.surfaceHa, 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <KpiCard label="Surface totale" value={`${total.toFixed(1)} ha`} />
      <KpiCard label="Parcelles" value={String(parcels.length)} />
      <div className="col-span-full rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5">
        <h3 className="m-0 mb-3 text-sm font-semibold">Par culture</h3>
        <ul className="m-0 list-none space-y-2 p-0">
          {Object.entries(byCulture)
            .sort(([, a], [, b]) => b - a)
            .map(([culture, ha]) => (
              <li key={culture}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span>{culture}</span>
                  <span className="font-mono tabular-nums text-(--color-muted)">
                    {ha.toFixed(1)} ha · {((ha / total) * 100).toFixed(0)} %
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-(--radius-pill) bg-[#f1f1ee]">
                  <div
                    className="h-full bg-(--color-primary)"
                    style={{ width: `${(ha / total) * 100}%` }}
                  />
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5">
      <div className="text-xs tracking-wider text-(--color-muted) uppercase">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
