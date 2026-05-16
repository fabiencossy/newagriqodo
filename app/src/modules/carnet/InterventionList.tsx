import { useState } from 'react';
import { BulkActionsBar, TableCheckbox, type BulkAction } from '../../components/BulkActionsBar';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import type { Intervention } from './carnet.types';
import { CATEGORY_LABELS, subTypeLabel as labelizeSubType } from './carnet.helpers';
import { InterventionTypeIcon } from './InterventionTypeIcon';
import { removeInterventions } from './carnet.store';
import { ParcelLink } from '../../components/EntityLink/ParcelLink';

interface InterventionListProps {
  interventions: ReadonlyArray<Intervention>;
  /** Callback à l'édition d'une ligne (clic sur la ligne ou bouton éditer). */
  onEdit?: (intervention: Intervention) => void;
  /** Si true, masque la colonne Parcelle (utile dans la page détail d'une parcelle). */
  hideParcelColumn?: boolean;
}

export function InterventionList({
  interventions,
  onEdit,
  hideParcelColumn = false,
}: InterventionListProps) {
  const isDesktop = useIsDesktop();
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());

  const allChecked = interventions.length > 0 && interventions.every((i) => checked.has(i.id));
  const someChecked = !allChecked && checked.size > 0;

  const toggleAll = () => {
    setChecked(allChecked ? new Set() : new Set(interventions.map((i) => i.id)));
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
      id: 'duplicate',
      label: 'Dupliquer',
      onClick: () => alert(`Dupliquer ${checked.size} intervention(s) (Phase 3).`),
    },
    {
      id: 'export',
      label: 'Exporter la sélection',
      onClick: () => alert(`Exporter ${checked.size} intervention(s) (Phase 3).`),
    },
    {
      id: 'delete',
      label: 'Supprimer',
      variant: 'danger',
      onClick: () => {
        if (confirm(`Supprimer ${checked.size} intervention(s) ?`)) {
          removeInterventions([...checked]);
          setChecked(new Set());
        }
      },
    },
  ];

  if (interventions.length === 0) {
    return (
      <div className="rounded-(--radius) border border-dashed border-(--color-border) bg-(--color-surface) py-10 text-center text-sm text-(--color-muted)">
        Aucune intervention enregistrée.
      </div>
    );
  }

  // Header de sélection (commun mobile / desktop) — apparaît seulement si la
  // sélection multi est ouverte sur mobile (sinon trop d'espace gaspillé).
  const selectionHeader = (
    <div className="flex items-center justify-between gap-2 px-1 pb-2 md:hidden">
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
        {interventions.length} intervention{interventions.length > 1 ? 's' : ''}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col">
      {!isDesktop && selectionHeader}

      {/* Desktop : table classique */}
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
                <Th>Date</Th>
                <Th>Catégorie</Th>
                {!hideParcelColumn && <Th>Parcelle</Th>}
                <Th>Produit / opération</Th>
                <Th align="right">Dose</Th>
                <Th>Opérateur</Th>
              </tr>
            </thead>
            <tbody>
              {interventions.map((i) => {
                const isChecked = checked.has(i.id);
                return (
                  <tr
                    key={i.id}
                    onClick={() => onEdit?.(i)}
                    className={[
                      onEdit ? 'cursor-pointer' : '',
                      'border-b border-(--color-border) last:border-b-0 hover:bg-[#fbfbf9]',
                      isChecked ? 'bg-(--color-primary)/5' : '',
                    ].join(' ')}
                  >
                    <td className="w-10 px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <TableCheckbox
                        checked={isChecked}
                        onChange={(next) => toggleOne(i.id, next)}
                        ariaLabel={`Sélectionner intervention ${i.id}`}
                      />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap tabular-nums">
                      {fmtDate(i.date)}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-2">
                        <InterventionTypeIcon category={i.category} size={14} />
                        <span className="font-medium">{CATEGORY_LABELS[i.category]}</span>
                      </span>
                    </td>
                    {!hideParcelColumn && (
                      <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <ParcelLink parcelId={i.parcelId} variant="chip" />
                        <div className="mt-0.5 font-mono text-[10px] text-(--color-muted)">
                          {i.parcelId}
                        </div>
                      </td>
                    )}
                    <td className="px-3 py-2">
                      <div className="truncate">{i.productName ?? subTypeLabel(i)}</div>
                      {i.notes && (
                        <div className="truncate text-[11px] text-(--color-muted)">{i.notes}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-mono whitespace-nowrap tabular-nums">
                      {i.doseValue !== undefined && i.doseUnit
                        ? `${formatDose(i.doseValue)} ${i.doseUnit}`
                        : i.yieldValue !== undefined && i.yieldUnit
                          ? `${i.yieldValue} ${i.yieldUnit}`
                          : '—'}
                    </td>
                    <td className="px-3 py-2 text-(--color-muted) whitespace-nowrap">
                      {i.operator ?? '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Mobile : cards verticales avec structure FIXE en 4 lignes
         * (les lignes vides disparaissent mais l'ordre est constant pour
         * une lecture prévisible). */
        <ul className="m-0 list-none space-y-2 p-0">
          {interventions.map((i) => {
            const isChecked = checked.has(i.id);
            const measure =
              i.doseValue !== undefined && i.doseUnit
                ? `${formatDose(i.doseValue)} ${i.doseUnit}`
                : i.yieldValue !== undefined && i.yieldUnit
                  ? `${i.yieldValue} ${i.yieldUnit}`
                  : null;
            const title = i.productName ?? subTypeLabel(i);
            return (
              <li key={i.id}>
                <div
                  onClick={() => onEdit?.(i)}
                  className={[
                    onEdit ? 'cursor-pointer' : '',
                    'flex gap-3 rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-3 active:bg-[#fbfbf9]',
                    isChecked ? 'border-(--color-primary) bg-(--color-primary)/5' : '',
                  ].join(' ')}
                >
                  {/* Checkbox côté gauche */}
                  <div className="shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
                    <TableCheckbox
                      checked={isChecked}
                      onChange={(next) => toggleOne(i.id, next)}
                      ariaLabel={`Sélectionner intervention ${i.id}`}
                    />
                  </div>
                  {/* Icône catégorie */}
                  <div className="shrink-0 pt-0.5">
                    <InterventionTypeIcon category={i.category} size={16} withBackground />
                  </div>
                  {/* Contenu — structure FIXE en lignes */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    {/* Ligne 1 : Titre + Date */}
                    <div className="flex items-baseline gap-2">
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</span>
                      <span className="shrink-0 font-mono text-[11px] text-(--color-muted)">
                        {fmtDate(i.date)}
                      </span>
                    </div>
                    {/* Ligne 2 : Catégorie + Parcelle (toujours affichées) */}
                    <div className="flex items-baseline gap-1.5 text-xs text-(--color-muted)">
                      <span>{CATEGORY_LABELS[i.category]}</span>
                      {!hideParcelColumn && (
                        <>
                          <span aria-hidden>·</span>
                          <span
                            className="min-w-0 flex-1 truncate"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ParcelLink parcelId={i.parcelId} variant="chip" />
                          </span>
                        </>
                      )}
                    </div>
                    {/* Ligne 3 : Dose/Rendement + Opérateur (vide → effacée) */}
                    {(measure || i.operator) && (
                      <div className="flex items-baseline gap-1.5 text-xs">
                        {measure ? (
                          <span className="font-mono tabular-nums text-(--color-text)">
                            {measure}
                          </span>
                        ) : (
                          <span className="text-(--color-muted)">—</span>
                        )}
                        <span aria-hidden className="text-(--color-muted)">
                          ·
                        </span>
                        <span className="min-w-0 flex-1 truncate text-(--color-muted)">
                          {i.operator ?? '—'}
                        </span>
                      </div>
                    )}
                    {/* Ligne 4 : Notes (seulement si présentes) */}
                    {i.notes && (
                      <div className="line-clamp-2 pt-0.5 text-[12px] italic text-(--color-muted)">
                        {i.notes}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <BulkActionsBar
        count={checked.size}
        total={interventions.length}
        onClear={() => setChecked(new Set())}
        actions={bulkActions}
        entityLabel="intervention"
      />
    </div>
  );
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y!.slice(2)}`;
}

function formatDose(v: number): string {
  if (v >= 1000) return v.toLocaleString('fr-CH');
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

function subTypeLabel(i: Intervention): string {
  return labelizeSubType(i.subType) ?? CATEGORY_LABELS[i.category];
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
