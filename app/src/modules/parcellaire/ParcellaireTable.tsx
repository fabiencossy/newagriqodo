import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BulkActionsBar, TableCheckbox, type BulkAction } from '../../components/BulkActionsBar';
import type { ParcelDetail } from './parcellaire.mocks';

const STATUS_LABELS: Record<NonNullable<ParcelDetail['status']>, string> = {
  active: 'Actif',
  fallow: 'Jachère',
  archived: 'Archivé',
};

const STATUS_STYLES: Record<NonNullable<ParcelDetail['status']>, string> = {
  active: 'bg-(--color-success)/12 text-[#166534]',
  fallow: 'bg-(--color-warning)/12 text-[#92400e]',
  archived: 'bg-[#e5e5e5] text-(--color-muted)',
};

interface ParcellaireTableProps {
  parcels: ReadonlyArray<ParcelDetail>;
  /** Sélection courante (depuis la map). Conservée pour highlight de ligne. */
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export function ParcellaireTable({ parcels, selectedId }: ParcellaireTableProps) {
  const navigate = useNavigate();
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());

  const allChecked = parcels.length > 0 && parcels.every((p) => checked.has(p.id));
  const someChecked = !allChecked && checked.size > 0;

  const toggleAll = () => {
    setChecked(allChecked ? new Set() : new Set(parcels.map((p) => p.id)));
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
      label: 'Fusionner',
      onClick: () => alert(`Fusionner ${checked.size} parcelles (Phase 2.5).`),
      disabled: checked.size < 2,
    },
    {
      id: 'duplicate',
      label: 'Dupliquer',
      onClick: () => alert(`Dupliquer ${checked.size} parcelles (Phase 2.5).`),
    },
    {
      id: 'archive',
      label: 'Archiver',
      onClick: () => alert(`Archiver ${checked.size} parcelles (Phase 2.5).`),
    },
    {
      id: 'export',
      label: 'Exporter la sélection',
      onClick: () => alert(`Exporter ${checked.size} parcelles (Phase 2.5).`),
    },
    {
      id: 'delete',
      label: 'Supprimer',
      variant: 'danger',
      onClick: () => confirm(`Supprimer ${checked.size} parcelle(s) ?`) && setChecked(new Set()),
    },
  ];

  if (parcels.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-(--color-muted)">
        Aucune parcelle ne correspond aux filtres.
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
              <Th>Code</Th>
              <Th>Nom</Th>
              <Th align="right">Surface</Th>
              <Th>Culture</Th>
              <Th>Variété</Th>
              <Th>Statut</Th>
              <Th align="right">Année</Th>
            </tr>
          </thead>
          <tbody>
            {parcels.map((p) => {
              const isChecked = checked.has(p.id);
              const isHighlighted = selectedId === p.id;
              return (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/parcellaire/${p.id}`)}
                  className={[
                    'cursor-pointer border-b border-(--color-border) last:border-b-0 hover:bg-[#fbfbf9]',
                    isChecked ? 'bg-(--color-primary)/5' : '',
                    isHighlighted ? 'ring-1 ring-(--color-primary) ring-inset' : '',
                  ].join(' ')}
                >
                  <td className="w-10 px-3 py-2 text-center">
                    <TableCheckbox
                      checked={isChecked}
                      onChange={(next) => toggleOne(p.id, next)}
                      ariaLabel={`Sélectionner ${p.name}`}
                    />
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{p.id}</td>
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">
                    {p.surfaceHa.toFixed(2)} ha
                  </td>
                  <td className="px-3 py-2">{p.culture}</td>
                  <td className="px-3 py-2 text-(--color-muted)">{p.varietyName ?? '—'}</td>
                  <td className="px-3 py-2">
                    {p.status && (
                      <span
                        className={[
                          'inline-flex items-center rounded-(--radius-pill) px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase',
                          STATUS_STYLES[p.status],
                        ].join(' ')}
                      >
                        {STATUS_LABELS[p.status]}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.year}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <BulkActionsBar
        count={checked.size}
        total={parcels.length}
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
