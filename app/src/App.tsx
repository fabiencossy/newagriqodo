import { useState } from 'react';
import { ViewSwitcher, VIEW_LABELS, type ViewKey } from './components/ViewSwitcher';
import {
  SearchBar,
  type FieldDescriptor,
  type SavedFavorite,
  type SearchState,
} from './components/SearchBar';
import { ExportButton, type ExportColumn } from './components/ExportButton';
import { FieldPicker, type PickerItem } from './components/FieldPicker';
import { AsideCard, type FieldConfig } from './components/AsideCard';
import {
  HoursTableMonth,
  type HoursMonthRow,
  type SortDirection,
  type SortKey,
} from './components/HoursTableMonth';
import { LeaveRequestList, type LeaveStatusFilter } from './components/LeaveRequestList';
import { TimesheetEntry } from './components/TimesheetEntry';
import { MapView, type MapMarker, type MapTool, type Parcel } from './components/MapView';

/* ============ Données d'exemple ============ */

// Parcelles GeoJSON autour de Lausanne/Échallens (centre Suisse romande)
const MAP_PARCELS: Parcel[] = [
  {
    id: 'PF-001',
    name: 'Plat de la Cure',
    surfaceHa: 2.5,
    culture: 'Blé',
    status: 'active',
    color: '#f4a261',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [6.6285, 46.5215],
          [6.633, 46.5218],
          [6.6332, 46.5195],
          [6.6287, 46.5192],
          [6.6285, 46.5215],
        ],
      ],
    },
  },
  {
    id: 'PF-002',
    name: 'Champ du Haut',
    surfaceHa: 1.8,
    culture: 'Blé',
    status: 'active',
    color: '#f4a261',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [6.634, 46.521],
          [6.6385, 46.5213],
          [6.6388, 46.519],
          [6.6342, 46.5188],
          [6.634, 46.521],
        ],
      ],
    },
  },
  {
    id: 'PF-003',
    name: 'Petite Pièce',
    surfaceHa: 0.9,
    culture: 'Jachère',
    status: 'fallow',
    color: '#a3a380',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [6.628, 46.5185],
          [6.6315, 46.5187],
          [6.6317, 46.517],
          [6.6282, 46.5168],
          [6.628, 46.5185],
        ],
      ],
    },
  },
  {
    id: 'PF-004',
    name: 'Champ Long',
    surfaceHa: 4.1,
    culture: 'Maïs',
    status: 'active',
    color: '#f59e0b',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [6.6325, 46.5183],
          [6.638, 46.5186],
          [6.6383, 46.5165],
          [6.6328, 46.5162],
          [6.6325, 46.5183],
        ],
      ],
    },
  },
];

const MAP_MARKERS: MapMarker[] = [
  { id: 'm1', kind: 'intervention', position: [6.6307, 46.5205] },
  { id: 'm2', kind: 'observation', position: [6.6362, 46.5198], label: 'Carence azote ?' },
  { id: 'm3', kind: 'problem', position: [6.6355, 46.5173], label: 'Adventices' },
];

const SAMPLE_PARCELS = [
  { code: 'PF-001', name: 'Plat de la Cure', surface: 2.5, culture: 'Blé' },
  { code: 'PF-002', name: 'Champ du Haut', surface: 1.8, culture: 'Blé' },
  { code: 'PF-003', name: 'Petite Pièce', surface: 0.9, culture: 'Blé' },
  { code: 'PF-004', name: 'Champ Long', surface: 4.1, culture: 'Maïs' },
];

const EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Nom' },
  { key: 'surface', label: 'Surface (ha)' },
  { key: 'culture', label: 'Culture' },
];

const PARCEL_FIELDS: FieldDescriptor[] = [
  { id: 'name', label: 'Nom', type: 'text' },
  { id: 'code', label: 'Code', type: 'text' },
  { id: 'notes', label: 'Notes', type: 'text' },
  {
    id: 'culture',
    label: 'Culture',
    type: 'select',
    options: [
      { label: 'Blé', value: 'wheat' },
      { label: 'Maïs', value: 'corn' },
      { label: 'Colza', value: 'rapeseed' },
      { label: 'Orge', value: 'barley' },
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
    label: 'Année de semis',
    type: 'select',
    options: [
      { label: '2026', value: 2026 },
      { label: '2025', value: 2025 },
      { label: '2024', value: 2024 },
    ],
    groupable: true,
  },
];

const PARCEL_PICKER_ITEMS: PickerItem[] = [
  {
    id: 'p1',
    label: 'Plat de la Cure',
    meta: 'PF-001 · 2.5 ha · Blé',
    categoryIds: ['active', 'wheat'],
  },
  {
    id: 'p2',
    label: 'Champ du Haut',
    meta: 'PF-002 · 1.8 ha · Blé',
    categoryIds: ['active', 'wheat'],
  },
  { id: 'p3', label: 'Petite Pièce', meta: 'PF-003 · 0.9 ha · Jachère', categoryIds: ['fallow'] },
  {
    id: 'p4',
    label: 'Champ Long',
    meta: 'PF-004 · 4.1 ha · Maïs',
    categoryIds: ['active', 'corn'],
  },
  {
    id: 'p5',
    label: 'Champ Rond',
    meta: 'PF-005 · 0.6 ha · Maïs',
    categoryIds: ['active', 'corn'],
  },
];

const ASIDE_FIELDS: FieldConfig[] = [
  { key: 'code', label: 'Code', type: 'text', readonly: true },
  { key: 'name', label: 'Nom', type: 'text' },
  { key: 'surface', label: 'Surface (ha)', type: 'number' },
  {
    key: 'culture',
    label: 'Culture',
    type: 'select',
    options: [
      { label: 'Blé', value: 'Blé' },
      { label: 'Maïs', value: 'Maïs' },
      { label: 'Colza', value: 'Colza' },
    ],
  },
  { key: 'sowingDate', label: 'Date semis', type: 'date' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

const HOURS_DATA: HoursMonthRow[] = [
  { month: 1, monthName: 'Janvier', hoursWorked: 150, hoursDue: 145, balance: 5, leavesTaken: 2 },
  { month: 2, monthName: 'Février', hoursWorked: 142, hoursDue: 140, balance: 2, leavesTaken: 0 },
  { month: 3, monthName: 'Mars', hoursWorked: 145, hoursDue: 145, balance: 0, leavesTaken: 0 },
  { month: 4, monthName: 'Avril', hoursWorked: 148, hoursDue: 145, balance: 3, leavesTaken: 1 },
  {
    month: 5,
    monthName: 'Mai',
    hoursWorked: 152,
    hoursDue: 147,
    balance: 5,
    leavesTaken: 0,
    isCurrentMonth: true,
  },
];

const LEAVES = [
  {
    id: 'l1',
    dateFrom: new Date(2026, 4, 15),
    dateTo: new Date(2026, 4, 30),
    days: 12,
    reason: "Vacances d'été",
    status: 'approved' as const,
    createdAt: new Date(2026, 3, 1),
  },
  {
    id: 'l2',
    dateFrom: new Date(2026, 5, 1),
    dateTo: new Date(2026, 5, 7),
    days: 5,
    reason: 'Conférence métier',
    status: 'pending' as const,
    createdAt: new Date(2026, 4, 1),
  },
  {
    id: 'l3',
    dateFrom: new Date(2026, 7, 12),
    dateTo: new Date(2026, 7, 14),
    days: 3,
    reason: 'Raisons personnelles',
    status: 'rejected' as const,
    createdAt: new Date(2026, 5, 15),
  },
];

/* ============ App ============ */

export default function App() {
  const [view, setView] = useState<ViewKey>('table');
  const [searchState, setSearchState] = useState<SearchState>({ facets: [], groupBy: [] });
  const [favorites, setFavorites] = useState<SavedFavorite[]>([
    {
      id: 'f1',
      name: 'Mes parcelles actives',
      state: {
        facets: [{ id: 'fav-1', fieldId: 'status', operator: 'in', values: ['active'] }],
        groupBy: [],
      },
    },
  ]);

  const [pickedSingle, setPickedSingle] = useState<string[]>([]);
  const [pickedMulti, setPickedMulti] = useState<string[]>([]);

  const [asideData, setAsideData] = useState<Record<string, unknown> | null>({
    code: 'PF-002',
    name: 'Champ du Haut',
    surface: 1.8,
    culture: 'Blé',
    sowingDate: '2026-03-12',
    notes: 'Sol limoneux, drainage moyen.',
  });
  const [asideMode, setAsideMode] = useState<'view' | 'edit'>('view');

  const [hoursYear, setHoursYear] = useState(2026);
  const [hoursSortBy, setHoursSortBy] = useState<SortKey | undefined>();
  const [hoursSortDir, setHoursSortDir] = useState<SortDirection | undefined>();

  const [leaveFilter, setLeaveFilter] = useState<LeaveStatusFilter>('all');

  const [mapSelected, setMapSelected] = useState<string[]>([]);
  const [mapTool, setMapTool] = useState<MapTool>('select');
  const [tsLog, setTsLog] = useState<string | null>(null);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="m-0 text-2xl font-semibold text-(--color-text)">NewagriQodo — Sprint 1+2</h1>
        <p className="mt-1 text-sm text-(--color-muted)">
          7 composants : ViewSwitcher · SearchBar · ExportButton · FieldPicker · AsideCard ·
          HoursTableMonth · LeaveRequestList
        </p>
      </header>

      {/* SearchBar */}
      <Section title="SearchBar">
        <SearchBar
          fields={PARCEL_FIELDS}
          value={searchState}
          onChange={setSearchState}
          favorites={favorites}
          onSaveFavorite={(name) => {
            setFavorites((f) => [...f, { id: `f-${Date.now()}`, name, state: searchState }]);
          }}
          ariaLabel="Rechercher parcelles"
        />
      </Section>

      {/* ExportButton */}
      <Section
        title="ExportButton"
        right={
          <ExportButton
            data={SAMPLE_PARCELS}
            columns={EXPORT_COLUMNS}
            filenameBase="parcelles"
            formats={['pdf', 'xlsx', 'csv']}
            pdfMeta={{ title: 'Parcelles — Domaine Darval' }}
          />
        }
      >
        <p className="m-0 text-xs text-(--color-muted)">
          Bouton kebab regroupe les actions. {SAMPLE_PARCELS.length} parcelles. CSV fonctionnel ;
          PDF/Excel stubs Phase 1.
        </p>
      </Section>

      {/* ViewSwitcher */}
      <Section title="ViewSwitcher">
        <ViewSwitcher
          views={['table', 'map', 'dashboard', 'kanban', 'list', 'calendar']}
          activeView={view}
          onChange={setView}
        />
        <p className="mt-3 text-xs text-(--color-muted)">
          Vue active : <strong className="text-(--color-text)">{VIEW_LABELS[view]}</strong>
        </p>
      </Section>

      {/* FieldPicker */}
      <Section title="FieldPicker">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-(--color-muted)">
              Single — sélectionner une parcelle
            </h3>
            <FieldPicker
              title="Sélectionner une parcelle"
              mode="single"
              value={pickedSingle}
              onChange={setPickedSingle}
              items={PARCEL_PICKER_ITEMS}
              categoryGroups={[
                {
                  id: 'status',
                  title: 'Statut',
                  categories: [
                    { id: 'active', label: 'Actives', count: 4 },
                    { id: 'fallow', label: 'Jachère', count: 1 },
                  ],
                },
                {
                  id: 'culture',
                  title: 'Culture',
                  categories: [
                    { id: 'wheat', label: 'Blé', count: 2 },
                    { id: 'corn', label: 'Maïs', count: 2 },
                  ],
                },
              ]}
              placeholder="Choisir une parcelle…"
            />
          </div>
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-(--color-muted)">
              Multi — plusieurs parcelles
            </h3>
            <FieldPicker
              title="Sélectionner des parcelles"
              mode="multiple"
              value={pickedMulti}
              onChange={setPickedMulti}
              items={PARCEL_PICKER_ITEMS}
              categoryGroups={[
                {
                  id: 'status',
                  categories: [
                    { id: 'active', label: 'Actives', count: 4 },
                    { id: 'fallow', label: 'Jachère', count: 1 },
                  ],
                },
              ]}
              placeholder="Choisir des parcelles…"
              allowCreate
              onCreate={async (q) => ({
                id: `new-${Date.now()}`,
                label: q,
                meta: 'Créé à la volée',
              })}
            />
          </div>
        </div>
      </Section>

      {/* AsideCard */}
      <Section title="AsideCard">
        <p className="mb-3 text-xs text-(--color-muted)">
          Mode : <strong className="text-(--color-text)">{asideMode}</strong>
        </p>
        <div className="overflow-hidden rounded-(--radius) border border-(--color-border)">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_360px]">
            <div className="flex min-h-[280px] items-center justify-center bg-[#f1f1ee] p-6 text-sm text-(--color-muted)">
              [Contenu principal — carte, table, etc.]
            </div>
            <AsideCard
              title="PF-002 — Champ du Haut"
              subtitle="Sélection courante"
              data={asideData}
              fields={ASIDE_FIELDS}
              mode={asideMode}
              editable
              onModeChange={setAsideMode}
              onClose={() => setAsideData(null)}
              onSave={async (d) => {
                setAsideData(d);
              }}
              layout="aside"
            />
          </div>
        </div>
      </Section>

      {/* HoursTableMonth */}
      <Section title="HoursTableMonth">
        <HoursTableMonth
          employeeId="emp-1"
          year={hoursYear}
          rows={HOURS_DATA}
          onYearChange={setHoursYear}
          sortBy={hoursSortBy}
          sortDirection={hoursSortDir}
          onSortChange={(k, d) => {
            setHoursSortBy(k);
            setHoursSortDir(d);
          }}
        />
      </Section>

      {/* LeaveRequestList */}
      <Section title="LeaveRequestList">
        <LeaveRequestList
          employeeId="emp-1"
          requests={LEAVES}
          balance={{ remainingDays: 12, takenDays: 8, pendingDays: 5, year: 2026 }}
          statusFilter={leaveFilter}
          onFilterChange={setLeaveFilter}
        />
      </Section>

      {/* TimesheetEntry */}
      <Section title="TimesheetEntry">
        <TimesheetEntry
          onSubmit={async (entry) => {
            await new Promise((r) => setTimeout(r, 400));
            const segments = entry.breaks.length;
            const msg = `Présence enregistrée · ${entry.hoursWorked.toFixed(2)}h effectives · ${segments} pause(s) → ${segments + 1} attendance(s) Odoo`;
            setTsLog(msg);
          }}
        />
        {tsLog && (
          <div
            role="status"
            className="mx-auto mt-3 max-w-xl rounded-(--radius) border border-[#c9e3bb] bg-[#ecf6e6] px-3 py-2 text-xs text-[#1a5e1a]"
          >
            ✓ {tsLog}
          </div>
        )}
      </Section>

      {/* MapView */}
      <Section title="MapView">
        <p className="mb-3 text-xs text-(--color-muted)">
          Carte Maplibre GL · 4 parcelles GeoJSON · 3 markers · clic pour sélectionner · Shift+clic
          pour multi-sélection · raccourcis clavier (S / L / P / M / R / G / Y).
        </p>
        <MapView
          parcels={MAP_PARCELS}
          markers={MAP_MARKERS}
          selectedIds={mapSelected}
          onSelectionChange={setMapSelected}
          activeTool={mapTool}
          onToolChange={setMapTool}
          onCreateGroup={(ids) => {
            alert(`Créer un groupe de ${ids.length} parcelles : ${ids.join(', ')}`);
            setMapSelected([]);
          }}
        />
        <p className="mt-3 text-xs text-(--color-muted)">
          Sélection :{' '}
          <strong className="text-(--color-text)">
            {mapSelected.length === 0 ? 'aucune' : mapSelected.join(', ')}
          </strong>
        </p>
      </Section>
    </main>
  );
}

function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="m-0 text-xs font-medium tracking-wider text-(--color-muted) uppercase">
          {title}
        </h2>
        {right}
      </div>
      {children}
    </section>
  );
}
