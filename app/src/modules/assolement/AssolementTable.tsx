import { useState } from 'react';
import { BulkActionsBar, TableCheckbox, type BulkAction } from '../../components/BulkActionsBar';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import type { AssolementSegment } from './assolement.types';
import type { ParcelDetail } from '../parcellaire/parcellaire.mocks';
import { cultureColor } from './cultures';

export interface AssolementRow {
  parcel: ParcelDetail;
  segments: ReadonlyArray<AssolementSegment>;
  dominant: { culture: string; days: number; segment: AssolementSegment } | undefined;
}

interface AssolementTableProps {
  rows: ReadonlyArray<AssolementRow>;
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function AssolementTable({ rows, selectedId, onSelect }: AssolementTableProps) {
  const isDesktop = useIsDesktop();
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());

  const allChecked = rows.length > 0 && rows.every((r) => checked.has(r.parcel.id));
  const someChecked = !allChecked && checked.size > 0;

  const toggleAll = () => {
    setChecked(allChecked ? new Set() : new Set(rows.map((r) => r.parcel.id)));
  };
  const toggleOne = (id: string, next: boolean) => {
    setChecked((curr) => {
      const c = new Set(curr);
      if (next) c.add(id);
      else c.delete(id);
      return c;
    });
  };

  const bulkActions: BulkAction[] = [
    {
      id: 'merge',
      label: 'Fusionner en un assolement commun',
      onClick: () => alert(`Fusionner l'assolement de ${checked.size} parcelles (Phase 2.5).`),
      disabled: checked.size < 2,
    },
    {
      id: 'apply-segment',
      label: 'Appliquer un segment',
      onClick: () => alert(`Appliquer un segment à ${checked.size} parcelles (Phase 2.5).`),
    },
    {
      id: 'duplicate-plan',
      label: 'Dupliquer le plan',
      onClick: () =>
        alert(
          `Dupliquer l'assolement de ${checked.size} parcelles vers une autre campagne (Phase 2.5).`,
        ),
    },
    {
      id: 'export',
      label: 'Exporter la sélection',
      onClick: () => alert(`Exporter ${checked.size} assolements (Phase 2.5).`),
    },
  ];

  if (rows.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-(--color-muted)">
        Aucun assolement pour cette campagne.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {!isDesktop && (
        <div className="flex items-center justify-between gap-2 px-1 pb-2">
          <button
            type="button"
            onClick={toggleAll}
            className="inline-flex items-center gap-2 text-xs font-medium text-(--color-text)"
          >
            <TableCheckbox
              checked={allChecked}
              indeterminate={someChecked}
              onChange={toggleAll}
              ariaLabel="Tout sélectionner"
            />
            Tout sélectionner
          </button>
          <span className="text-[11px] text-(--color-muted)">
            {rows.length} parcelle{rows.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {isDesktop ? (
        <div className="overflow-x-auto rounded-(--radius) border border-(--color-border) bg-(--color-surface)">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] tracking-wider text-(--color-muted) uppercase">
                <th className="w-10 border-b border-(--color-border) px-3 py-2 text-center">
                  <TableCheckbox
                    checked={allChecked}
                    indeterminate={someChecked}
                    onChange={toggleAll}
                    ariaLabel="Tout sélectionner"
                  />
                </th>
                <Th>Parcelle</Th>
                <Th>Culture dominante</Th>
                <Th>Variété</Th>
                <Th align="right">Surface</Th>
                <Th align="right">Durée</Th>
                <Th align="right">Segments</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ parcel, segments, dominant }) => {
                const isChecked = checked.has(parcel.id);
                return (
                  <tr
                    key={parcel.id}
                    onClick={() => onSelect(parcel.id)}
                    className={[
                      'cursor-pointer border-b border-(--color-border) last:border-b-0 hover:bg-[#fbfbf9]',
                      isChecked ? 'bg-(--color-primary)/5' : '',
                      selectedId === parcel.id ? 'ring-1 ring-(--color-primary) ring-inset' : '',
                    ].join(' ')}
                  >
                    <td className="w-10 px-3 py-2 text-center">
                      <TableCheckbox
                        checked={isChecked}
                        onChange={(next) => toggleOne(parcel.id, next)}
                        ariaLabel={`Sélectionner ${parcel.name}`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{parcel.name}</div>
                      <div className="font-mono text-[11px] text-(--color-muted)">{parcel.id}</div>
                    </td>
                    <td className="px-3 py-2">
                      {dominant ? (
                        <span className="inline-flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="inline-block h-3 w-3 rounded-(--radius-pill)"
                            style={{ background: cultureColor(dominant.culture) }}
                          />
                          {dominant.culture}
                        </span>
                      ) : (
                        <span className="text-(--color-muted)">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-(--color-muted)">
                      {dominant?.segment.varietyName ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">
                      {parcel.surfaceHa.toFixed(2)} ha
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs tabular-nums text-(--color-muted)">
                      {dominant ? `${Math.round((dominant.days / 365) * 12)} mois` : '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-(--color-muted)">
                      {segments.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Mobile : cards verticales */
        <ul className="m-0 list-none space-y-2 p-0">
          {rows.map(({ parcel, segments, dominant }) => {
            const isChecked = checked.has(parcel.id);
            return (
              <li key={parcel.id}>
                <div
                  onClick={() => onSelect(parcel.id)}
                  className={[
                    'flex cursor-pointer gap-3 rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-3 active:bg-[#fbfbf9]',
                    isChecked ? 'border-(--color-primary) bg-(--color-primary)/5' : '',
                    selectedId === parcel.id ? 'ring-1 ring-(--color-primary) ring-inset' : '',
                  ].join(' ')}
                >
                  <div className="shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
                    <TableCheckbox
                      checked={isChecked}
                      onChange={(next) => toggleOne(parcel.id, next)}
                      ariaLabel={`Sélectionner ${parcel.name}`}
                    />
                  </div>
                  {/* Pastille culture */}
                  <div
                    aria-hidden="true"
                    className="mt-1 inline-block h-3 w-3 shrink-0 rounded-(--radius-pill)"
                    style={{ background: dominant ? cultureColor(dominant.culture) : '#9ca3af' }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="truncate text-sm font-semibold">{parcel.name}</span>
                      <span className="ml-auto shrink-0 font-mono text-[11px] text-(--color-muted)">
                        {parcel.surfaceHa.toFixed(2)} ha
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-xs text-(--color-muted)">
                      <span className="font-mono">{parcel.id}</span>
                      {dominant && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="truncate text-(--color-text)">{dominant.culture}</span>
                        </>
                      )}
                      {dominant?.segment.varietyName && (
                        <>
                          <span aria-hidden>·</span>
                          <span>{dominant.segment.varietyName}</span>
                        </>
                      )}
                      <span aria-hidden>·</span>
                      <span>
                        {segments.length} segment{segments.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <BulkActionsBar
        count={checked.size}
        total={rows.length}
        onClear={() => setChecked(new Set())}
        actions={bulkActions}
        entityLabel="parcelle"
      />
    </div>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={[
        'border-b border-(--color-border) px-3 py-2 font-medium',
        align === 'right' ? 'text-right' : 'text-left',
      ].join(' ')}
    >
      {children}
    </th>
  );
}
