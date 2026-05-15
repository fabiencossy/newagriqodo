import { useState } from 'react';
import { ViewSwitcher, VIEW_LABELS, type ViewKey } from './components/ViewSwitcher';
import {
  SearchBar,
  type FieldDescriptor,
  type SavedFavorite,
  type SearchState,
} from './components/SearchBar';
import { ExportButton, type ExportColumn } from './components/ExportButton';

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

export default function App() {
  const [view, setView] = useState<ViewKey>('table');
  const [searchState, setSearchState] = useState<SearchState>({ facets: [], groupBy: [] });
  const [favorites, setFavorites] = useState<SavedFavorite[]>([
    {
      id: 'f1',
      name: 'Mes parcelles actives',
      state: {
        facets: [
          {
            id: 'fav-1',
            fieldId: 'status',
            operator: 'in',
            values: ['active'],
          },
        ],
        groupBy: [],
      },
    },
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="m-0 text-2xl font-semibold text-(--color-text)">NewagriQodo — Sprint 1</h1>
        <p className="mt-1 text-sm text-(--color-muted)">Composants : ViewSwitcher · SearchBar</p>
      </header>

      <section className="rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">
        <h2 className="mb-4 text-xs font-medium tracking-wider text-(--color-muted) uppercase">
          SearchBar (style Odoo — light)
        </h2>
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
        <pre className="mt-4 max-h-48 overflow-auto rounded-(--radius-sm) bg-[#f1f1ee] p-3 text-xs">
          {JSON.stringify(searchState, null, 2)}
        </pre>
      </section>

      <section className="mt-6 rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-medium tracking-wider text-(--color-muted) uppercase">
            ExportButton
          </h2>
          <ExportButton
            data={SAMPLE_PARCELS}
            columns={EXPORT_COLUMNS}
            filenameBase="parcelles"
            formats={['pdf', 'xlsx', 'csv']}
            pdfMeta={{ title: 'Parcelles — Domaine Darval' }}
          />
        </div>
        <p className="text-xs text-(--color-muted)">
          {SAMPLE_PARCELS.length} parcelles. CSV fonctionnel (téléchargement réel) ; PDF/Excel stub
          (libs à brancher Phase 1).
        </p>
      </section>

      <section className="mt-6 rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">
        <h2 className="mb-4 text-xs font-medium tracking-wider text-(--color-muted) uppercase">
          ViewSwitcher (auto)
        </h2>
        <ViewSwitcher views={['table', 'map', 'dashboard']} activeView={view} onChange={setView} />
        <p className="mt-4 text-sm text-(--color-muted)">
          Vue active : <strong className="text-(--color-text)">{VIEW_LABELS[view]}</strong>{' '}
          <code className="ml-2 rounded-(--radius-sm) bg-[#f1f1ee] px-1.5 py-0.5 font-mono text-xs">
            {view}
          </code>
        </p>
      </section>

      <section className="mt-6 rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">
        <h2 className="mb-4 text-xs font-medium tracking-wider text-(--color-muted) uppercase">
          Icon only (compact)
        </h2>
        <ViewSwitcher
          views={['table', 'map', 'dashboard', 'kanban', 'list', 'calendar']}
          activeView={view}
          onChange={setView}
          layout="segmented"
          display="icon-only"
        />
      </section>
    </main>
  );
}
