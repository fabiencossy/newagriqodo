/**
 * Barre d'actions groupées pour les tables / listes.
 * Visible dès qu'au moins une ligne est cochée.
 *
 * - Desktop : actions inline côte à côte.
 * - Mobile  : un seul bouton "Actions" qui ouvre un menu compact (les
 *   boutons inline prendraient trop de place et wrapperaient mal).
 *
 * Convention projet : toutes les tables et listes doivent supporter la
 * sélection multiple + actions groupées (fusionner, dupliquer, archiver,
 * supprimer, exporter…) — voir feedback_tables_multi_select.
 */

import { useEffect, useRef, useState } from 'react';

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
      className="sticky bottom-0 z-30 flex items-center gap-2 border-t border-(--color-border) bg-(--color-surface) px-3 py-2 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]"
    >
      <span className="min-w-0 truncate text-sm font-medium">
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
        className="shrink-0 text-xs font-medium text-(--color-primary) hover:underline"
      >
        Désélectionner
      </button>

      {/* Mobile : un seul bouton "Actions" qui ouvre un menu */}
      <div className="ml-auto shrink-0 md:hidden">
        <BulkActionsMenu actions={actions} />
      </div>

      {/* Desktop : boutons inline */}
      <div className="ml-auto hidden flex-wrap gap-2 md:flex">
        {actions.map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={a.disabled}
            onClick={a.onClick}
            className={actionClass(a.variant)}
          >
            {a.icon}
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function actionClass(variant: BulkAction['variant']): string {
  const base =
    'inline-flex h-9 items-center gap-1.5 rounded-(--radius) border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';
  if (variant === 'danger')
    return `${base} border-(--color-error) bg-(--color-surface) text-(--color-error) hover:bg-[#fef2f2]`;
  if (variant === 'primary')
    return `${base} border-(--color-primary) bg-(--color-primary) text-white hover:bg-(--color-primary-hover)`;
  return `${base} border-(--color-border) bg-(--color-surface) text-(--color-text) hover:bg-[#f8f8f5]`;
}

function BulkActionsMenu({ actions }: { actions: ReadonlyArray<BulkAction> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-1.5 rounded-(--radius) border border-(--color-primary) bg-(--color-primary) px-3 text-xs font-medium text-white hover:bg-(--color-primary-hover)"
      >
        Actions
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          width={14}
          height={14}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute right-0 bottom-full z-[1200] mb-1 w-56 rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-1 shadow-(--shadow-popup)"
        >
          {actions.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                role="menuitem"
                disabled={a.disabled}
                onClick={() => {
                  a.onClick();
                  setOpen(false);
                }}
                className={[
                  'flex h-10 w-full items-center rounded-(--radius-sm) px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                  a.variant === 'danger'
                    ? 'text-(--color-error) hover:bg-[#fef2f2]'
                    : 'text-(--color-text) hover:bg-[#f8f8f5]',
                ].join(' ')}
              >
                {a.label}
              </button>
            </li>
          ))}
        </ul>
      )}
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
