import { useMemo, useState } from 'react';
import { MapView, type Parcel } from '../../components/MapView';
import { ExportButton, type ExportColumn } from '../../components/ExportButton';
import { PARCELLES } from '../parcellaire/parcellaire.mocks';
import { AssolementTable } from './AssolementTable';
import {
  getAssolementsByYear,
  getAvailableYears,
  getCurrentAssolement,
} from './assolement.helpers';
import { cultureColor } from './cultures';

const EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'parcelId', label: 'Parcelle' },
  { key: 'parcelName', label: 'Nom' },
  { key: 'culture', label: 'Culture' },
  { key: 'varietyName', label: 'Variété' },
  { key: 'surfaceHa', label: 'Surface (ha)' },
  { key: 'sowingDate', label: 'Semis' },
  { key: 'harvestDate', label: 'Récolte' },
];

export default function AssolementPage() {
  const years = useMemo(() => getAvailableYears(), []);
  const [year, setYear] = useState<number>(years[0] ?? new Date().getFullYear());

  const assolements = useMemo(() => getAssolementsByYear(year), [year]);

  // Parcelles coloriées selon la culture de la campagne sélectionnée.
  const coloredParcels = useMemo<Parcel[]>(() => {
    return PARCELLES.map((p) => {
      const a = getCurrentAssolement(p.id, year);
      return {
        id: p.id,
        name: p.name,
        surfaceHa: p.surfaceHa,
        status: p.status,
        culture: a?.culture,
        color: a ? cultureColor(a.culture) : '#9ca3af',
        geometry: p.geometry,
      };
    });
  }, [year]);

  // Stats par culture pour la campagne
  const cultureStats = useMemo(() => {
    const acc = new Map<string, number>();
    assolements.forEach((a) => {
      const parcel = PARCELLES.find((p) => p.id === a.parcelId);
      if (!parcel) return;
      acc.set(a.culture, (acc.get(a.culture) ?? 0) + parcel.surfaceHa);
    });
    return [...acc.entries()].sort(([, a], [, b]) => b - a);
  }, [assolements]);

  // Rows export — flatten avec name et surface
  const exportRows = useMemo(() => {
    return assolements.map((a) => {
      const parcel = PARCELLES.find((p) => p.id === a.parcelId);
      return {
        parcelId: a.parcelId,
        parcelName: parcel?.name ?? '',
        culture: a.culture,
        varietyName: a.varietyName ?? '',
        surfaceHa: parcel?.surfaceHa ?? 0,
        sowingDate: a.sowingDate ?? '',
        harvestDate: a.harvestDate ?? '',
      };
    });
  }, [assolements]);

  const totalHa = cultureStats.reduce((s, [, ha]) => s + ha, 0);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 border-b border-(--color-border) bg-(--color-surface) px-3 py-2">
        <div className="flex w-full items-center gap-2">
          <div className="hidden shrink-0 items-baseline gap-2 md:flex">
            <h1 className="m-0 truncate text-base font-semibold">Plan d'assolement</h1>
            <span className="truncate text-xs text-(--color-muted)">
              Campagne {year} · {assolements.length} parcelles · {totalHa.toFixed(1)} ha
            </span>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <label className="inline-flex items-center gap-2 text-xs text-(--color-muted)">
              Campagne
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="rounded-(--radius-sm) border border-(--color-border) bg-(--color-surface) px-2 py-1 text-sm text-(--color-text)"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <ExportButton
              data={exportRows as unknown as ReadonlyArray<Record<string, unknown>>}
              columns={EXPORT_COLUMNS}
              filenameBase={`assolement-${year}`}
              pdfMeta={{ title: `Plan d'assolement ${year} — Domaine Darval` }}
            />
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
          {/* Carte */}
          <div className="h-[420px] overflow-hidden rounded-(--radius) border border-(--color-border)">
            <MapView
              parcels={coloredParcels}
              onSelectionChange={() => undefined}
              height="100%"
              className="!rounded-none !border-0"
              showLegend={false}
            />
          </div>

          {/* Stats par culture */}
          <div className="rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-4">
            <h2 className="m-0 mb-3 text-sm font-semibold">Par culture · {year}</h2>
            {cultureStats.length === 0 ? (
              <p className="m-0 text-xs text-(--color-muted)">Aucune donnée.</p>
            ) : (
              <ul className="m-0 list-none space-y-2 p-0">
                {cultureStats.map(([culture, ha]) => (
                  <li key={culture}>
                    <div className="mb-1 flex items-baseline justify-between text-sm">
                      <span className="inline-flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="inline-block h-3 w-3 rounded-(--radius-pill)"
                          style={{ background: cultureColor(culture) }}
                        />
                        {culture}
                      </span>
                      <span className="font-mono tabular-nums text-(--color-muted)">
                        {ha.toFixed(1)} ha · {totalHa > 0 ? ((ha / totalHa) * 100).toFixed(0) : 0} %
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-(--radius-pill) bg-[#f1f1ee]">
                      <div
                        className="h-full"
                        style={{
                          width: `${totalHa > 0 ? (ha / totalHa) * 100 : 0}%`,
                          background: cultureColor(culture),
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="mt-4">
          <AssolementTable assolements={assolements} />
        </div>
      </div>
    </div>
  );
}
