import { useEffect, useRef, useState } from 'react';
import { useFab } from './useFab';

/**
 * FAB global — bouton rond `+` en bas à gauche.
 * Au clic : speed dial avec les actions contextuelles publiées via `useFabActions`.
 * Si aucune action : caché.
 */
export function Fab() {
  const { actions } = useFab();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fermer au clic extérieur + Esc
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrapperRef.current?.contains(e.target as Node)) return;
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

  // (Reset du menu : géré côté AppLayout via key sur location.pathname)

  if (actions.length === 0) return null;

  return (
    <div
      ref={wrapperRef}
      className={['fixed right-5 bottom-5 z-30', 'flex flex-col-reverse items-end gap-3'].join(' ')}
    >
      {/* Speed-dial items */}
      {open && (
        <ul
          role="menu"
          aria-label="Actions"
          className="m-0 flex list-none flex-col-reverse gap-2 p-0"
        >
          {actions.map((action) => (
            <li key={action.id}>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  action.onClick();
                  setOpen(false);
                }}
                className={[
                  'inline-flex h-11 items-center gap-2 rounded-(--radius-pill)',
                  'px-4 text-sm font-medium shadow-(--shadow-fab)',
                  'animate-[fadeInUp_180ms_ease-out]',
                  action.variant === 'danger'
                    ? 'border border-(--color-error) bg-(--color-surface) text-(--color-error) hover:bg-[#fef2f2]'
                    : action.variant === 'secondary'
                      ? 'border border-(--color-border) bg-(--color-surface) text-(--color-text) hover:bg-[#f8f8f5]'
                      : 'bg-(--color-surface) text-(--color-text) hover:bg-[#f8f8f5] border border-(--color-border)',
                ].join(' ')}
              >
                {action.icon && <span className="text-(--color-primary)">{action.icon}</span>}
                <span>{action.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* FAB rond */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu des actions'}
        onClick={() => setOpen((o) => !o)}
        className={[
          'inline-flex h-14 w-14 items-center justify-center rounded-(--radius-pill)',
          'border border-(--color-primary) bg-(--color-primary) text-white',
          'shadow-(--shadow-fab) transition-transform hover:scale-105',
          open ? 'rotate-45' : '',
        ].join(' ')}
        style={{ transition: 'transform 200ms ease-out, background 150ms' }}
      >
        <PlusIcon />
      </button>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={22}
      height={22}
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
