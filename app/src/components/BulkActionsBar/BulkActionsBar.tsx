/**
 * Barre d'actions groupées pour les tables / listes.
 * Visible dès qu'au moins une ligne est cochée.
 *
 * Convention projet : toutes les tables et listes doivent supporter la
 * sélection multiple + actions groupées (fusionner, dupliquer, archiver,
 * supprimer, exporter…) — voir feedback_tables_multi_select.
 */

export interface BulkAction {
  id: string;
  label: string;
  variant?: 'default' | 'primary' | 'danger';
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface BulkActionsBarProps {
  count: number;
  total?: number;
  onClear: () => void;
  actions: ReadonlyArray<BulkAction>;
  /** Label de l'entité (ex. "parcelle"). Affiché au pluriel automatiquement. */
  entityLabel?: string;
}

export function BulkActionsBar({
  count,
  total,
  onClear,
  actions,
  entityLabel = 'élément',
}: BulkActionsBarProps) {
  if (count === 0) return null;
  const plural = count > 1;
  return (
    <div
      role="region"
      aria-label="Actions groupées"
      className="sticky bottom-0 z-30 flex flex-wrap items-center gap-2 border-t border-(--color-border) bg-(--color-surface) px-3 py-2 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]"
    >
      <span className="text-sm font-medium">
        <strong className="tabular-nums">{count}</strong>
        {total !== undefined ? <span className="text-(--color-muted)">/{total}</span> : null}
        <span className="ml-1 text-(--color-muted)">
          {entityLabel}
          {plural ? 's' : ''} sélectionné{plural ? 's' : ''}
        </span>
      </span>
      <button
        type="button"
        onClick={onClear}
        className="ml-1 text-xs font-medium text-(--color-primary) hover:underline"
      >
        Tout désélectionner
      </button>
      <div className="ml-auto flex flex-wrap gap-2">
        {actions.map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={a.disabled}
            onClick={a.onClick}
            className={[
              'inline-flex h-9 items-center gap-1.5 rounded-(--radius) border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
              a.variant === 'danger'
                ? 'border-(--color-error) bg-(--color-surface) text-(--color-error) hover:bg-[#fef2f2]'
                : a.variant === 'primary'
                  ? 'border-(--color-primary) bg-(--color-primary) text-white hover:bg-(--color-primary-hover)'
                  : 'border-(--color-border) bg-(--color-surface) text-(--color-text) hover:bg-[#f8f8f5]',
            ].join(' ')}
          >
            {a.icon}
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============ Checkbox utilitaire pour les rows ============ */

export function TableCheckbox({
  checked,
  indeterminate,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = Boolean(indeterminate && !checked);
      }}
      onChange={(e) => onChange(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
      aria-label={ariaLabel}
      className="h-4 w-4 cursor-pointer accent-(--color-primary)"
    />
  );
}
