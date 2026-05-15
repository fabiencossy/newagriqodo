import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFabActions, useHideFab } from '../../layouts/useFab';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import { SearchBar, type FieldDescriptor, type SearchState } from '../../components/SearchBar';
import { ViewSwitcher, type ViewKey } from '../../components/ViewSwitcher';
import { ExportButton, type ExportColumn } from '../../components/ExportButton';
import { MapView } from '../../components/MapView';
import { AsideCard, type FieldConfig } from '../../components/AsideCard';
import { PARCELLES, type ParcelDetail } from './parcellaire.mocks';
import { filterParcels } from './filtering';
import { ParcellaireTable } from './ParcellaireTable';
import { getActiveSegment } from '../assolement/assolement.helpers';
import { cultureColor } from '../assolement/cultures';

const TODAY = new Date().toISOString().slice(0, 10);

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
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function ParcellairePage() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [view, setView] = useState<ViewKey>('map');
  const [searchState, setSearchState] = useState<SearchState>({ facets: [], groupBy: [] });
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [parcels, setParcels] = useState<ParcelDetail[]>(PARCELLES);
  const [asideMode, setAsideMode] = useState<'view' | 'edit'>('view');

  // Masque le FAB sur mobile quand le bottom sheet de sélection est ouvert
  // (sinon le `+` chevauche le bouton Enregistrer du sheet).
  useHideFab(!isDesktop && Boolean(selectedId));

  // Enrichissement : culture / variété / couleur dérivées du segment d'assolement
  // ACTIF à la date du jour. L'entité AssolementSegment (module dédié) pilote ces
  // propriétés agronomiques ; ParcelDetail conserve l'identité géographique seule.
  const parcelsWithAssolement = useMemo<ParcelDetail[]>(
    () =>
      parcels.map((p) => {
        const s = getActiveSegment(p.id, TODAY);
        if (!s) return p;
        return {
          ...p,
          culture: s.culture,
          varietyName: s.varietyName ?? p.varietyName,
          sowingDate: s.startDate,
          color: cultureColor(s.culture),
        };
      }),
    [parcels],
  );

  const filtered = useMemo(
    () => filterParcels(parcelsWithAssolement, searchState),
    [parcelsWithAssolement, searchState],
  );
  const selected = useMemo(
    () => (selectedId ? parcelsWithAssolement.find((p) => p.id === selectedId) : undefined),
    [parcelsWithAssolement, selectedId],
  );
  const totalSurface = filtered.reduce((s, p) => s + p.surfaceHa, 0);
  const summary = `${filtered.length} parcelles · ${totalSurface.toFixed(1)} ha`;

  const handleSaveAside = async (next: Record<string, unknown>) => {
    setParcels((curr) =>
      curr.map((p) => (p.id === next.id ? ({ ...p, ...next } as ParcelDetail) : p)),
    );
    setAsideMode('view');
  };

  // FAB contextuel : actions changent selon qu'une parcelle est sélectionnée ou non
  useFabActions(
    useMemo(() => {
      if (selectedId) {
        // Actions contextuelles à la parcelle sélectionnée
        return [
          {
            id: 'open-fiche',
            label: 'Ouvrir la fiche',
            onClick: () => navigate(`/parcellaire/${selectedId}`),
          },
          {
            id: 'add-intervention',
            label: 'Ajouter une intervention',
            onClick: () => {
              alert(`Ajouter une intervention sur ${selectedId} (Carnet des champs — Phase 2.5).`);
            },
          },
          {
            id: 'view-carnet',
            label: 'Voir le Carnet des champs',
            onClick: () => {
              alert(`Carnet des champs pour ${selectedId} (Phase 2.5).`);
            },
          },
          {
            id: 'add-observation',
            label: 'Ajouter une observation',
            onClick: () => {
              alert(`Marker observation sur ${selectedId} (Phase 2.5).`);
            },
          },
        ];
      }
      // Pas de sélection : actions de création
      return [
        {
          id: 'nouvelle-parcelle',
          label: 'Nouvelle parcelle (dessin)',
          onClick: () => {
            setView('map');
            alert("Active l'outil de dessin sur la carte (à brancher Phase 2.5).");
          },
        },
        {
          id: 'import-geojson',
          label: 'Importer (GeoJSON / Shapefile)',
          onClick: () => {
            alert('Import GELAN / Acorda (à brancher Phase 2.5 avec shpjs).');
          },
        },
      ];
    }, [selectedId, navigate]),
  );

  const viewSwitcher = (
    <ViewSwitcher
      views={['map', 'table', 'dashboard']}
      activeView={view}
      onChange={setView}
      layout="segmented"
    />
  );
  const exportBtn = (
    <ExportButton
      data={filtered as unknown as ReadonlyArray<Record<string, unknown>>}
      columns={EXPORT_COLUMNS}
      filenameBase="parcelles"
      pdfMeta={{ title: 'Parcelles — Domaine Darval' }}
    />
  );

  // Top bar unique : 1 seule ligne mobile ET desktop avec titre + search + views + export
  const topBar = (
    <div className="flex w-full items-center gap-2">
      {/* Titre — desktop uniquement (mobile : déjà dans AppHeader) */}
      <div className="hidden shrink-0 items-baseline gap-2 md:flex">
        <h1 className="m-0 truncate text-base font-semibold">Parcellaire</h1>
        <span className="truncate text-xs text-(--color-muted)">{summary}</span>
      </div>
      {/* SearchBar prend la place disponible, centrée */}
      <div className="min-w-0 flex-1 md:mx-auto md:max-w-[640px]">
        <SearchBar
          fields={FIELDS}
          value={searchState}
          onChange={setSearchState}
          ariaLabel="Rechercher dans le parcellaire"
        />
      </div>
      {/* ViewSwitcher : icônes seules sur mobile, icon+label sur desktop */}
      <div className="shrink-0 md:hidden">
        <ViewSwitcher
          views={['map', 'table', 'dashboard']}
          activeView={view}
          onChange={setView}
          layout="segmented"
          display="icon-only"
        />
      </div>
      <div className="hidden shrink-0 md:block">{viewSwitcher}</div>
      <div className="shrink-0">{exportBtn}</div>
    </div>
  );

  /* ============================================================
   * Layout unifié : top bar dans le flow pour TOUTES les vues
   * ============================================================ */
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top bar identique partout, dans le flow */}
      <div className="flex-shrink-0 border-b border-(--color-border) bg-(--color-surface) px-3 py-2">
        {topBar}
      </div>

      {/* === CONTENU flex-1 === */}
      {view === 'map' ? (
        <div className="relative flex-1 overflow-hidden">
          <MapView
            parcels={filtered}
            selectedId={selectedId}
            onSelectionChange={(ids) => setSelectedId(ids[0])}
            height="100%"
            className="!rounded-none !border-0"
          />
          {/* Aside flottant à droite (desktop) */}
          {selected && (
            <div className="absolute top-3 right-3 bottom-3 z-30 hidden w-[360px] max-w-[calc(100%-1.5rem)] rounded-(--radius) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-popup) lg:flex">
              <AsideCard
                title={`${selected.id} — ${selected.name}`}
                subtitle="Sélection courante"
                data={selected as unknown as Record<string, unknown>}
                fields={ASIDE_FIELDS}
                mode={asideMode}
                onModeChange={setAsideMode}
                editable
                onEdit={() => navigate(`/parcellaire/${selected.id}`)}
                onClose={() => setSelectedId(undefined)}
                onSave={handleSaveAside}
                layout="aside"
                className="!h-full !border-0"
              />
            </div>
          )}
          {selected && (
            <div className="fixed inset-x-0 bottom-0 z-[1000] lg:hidden">
              <AsideCard
                title={`${selected.id} — ${selected.name}`}
                subtitle="Sélection courante"
                data={selected as unknown as Record<string, unknown>}
                fields={ASIDE_FIELDS}
                mode={asideMode}
                onModeChange={setAsideMode}
                editable
                onEdit={() => navigate(`/parcellaire/${selected.id}`)}
                onClose={() => setSelectedId(undefined)}
                onSave={handleSaveAside}
                layout="bottomsheet"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          {view === 'table' ? (
            <ParcellaireTable parcels={filtered} selectedId={selectedId} onSelect={setSelectedId} />
          ) : (
            <DashboardView parcels={filtered} />
          )}
        </div>
      )}
    </div>
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
