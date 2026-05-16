import { useEffect, useRef, useState } from 'react';
import { setCurrentFarmId, useCurrentFarmId, useFarms } from './farms.store';

/**
 * Dropdown de sélection d'exploitation. Placé dans le footer de la sidebar
 * (ou le header mobile). Le clic ouvre une liste des exploitations
 * disponibles avec sélection en surbrillance.
 *
 * En Phase 3, le switch déclenche un refetch des données filtrées par
 * `currentFarmId` côté Odoo. Pour l'instant, multi-tenancy visuelle seule.
 */
export function FarmSwitcher({ compact = false }: { compact?: boolean }) {
  const farms = useFarms();
  const currentId = useCurrentFarmId();
  const current = farms.find((f) => f.id === currentId);
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

  if (!current) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          'flex w-full items-center gap-2 rounded-(--radius-sm) px-2 py-1.5 text-left transition-colors hover:bg-[#f1f1ee]',
          open ? 'bg-[#f1f1ee]' : '',
        ].join(' ')}
      >
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-(--radius-pill) text-sm font-semibold text-white"
          style={{ background: current.color }}
        >
          {current.initials}
        </span>
        {!compact && (
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{current.name}</div>
            <div className="truncate text-xs text-(--color-muted)">{current.location ?? '—'}</div>
          </div>
        )}
        <span aria-hidden className="shrink-0 text-(--color-muted)">
          <ChevronDownIcon />
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Sélectionner une exploitation"
          className="absolute right-0 bottom-full left-0 z-[1200] mb-2 max-h-[60vh] overflow-y-auto rounded-(--radius) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-popup)"
        >
          <li className="border-b border-(--color-border) px-3 py-2 text-[10px] font-semibold tracking-wider text-(--color-muted) uppercase">
            Exploitations
          </li>
          {farms.map((f) => {
            const isSelected = f.id === currentId;
            return (
              <li key={f.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentFarmId(f.id);
                    setOpen(false);
                  }}
                  className={[
                    'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-[#fbfbf9]',
                    isSelected ? 'bg-(--color-primary)/6' : '',
                  ].join(' ')}
                >
                  <span
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-(--radius-pill) text-xs font-semibold text-white"
                    style={{ background: f.color }}
                  >
                    {f.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{f.name}</div>
                    <div className="truncate text-[11px] text-(--color-muted)">
                      {f.location ?? '—'}
                      {f.surfaceTotalHa ? ` · ${f.surfaceTotalHa} ha` : ''}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="shrink-0 text-(--color-primary)" aria-label="Sélectionnée">
                      <CheckIcon />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
          <li className="border-t border-(--color-border) px-3 py-2 text-[11px] text-(--color-muted)">
            Multi-tenancy MVP — filtrage des données Phase 3 (Odoo).
          </li>
        </ul>
      )}
    </div>
  );
}

function ChevronDownIcon() {
  return (
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
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={16}
      height={16}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
