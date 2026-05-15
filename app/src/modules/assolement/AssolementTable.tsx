import { useState } from 'react';
import { BulkActionsBar, TableCheckbox, type BulkAction } from '../../components/BulkActionsBar';
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
