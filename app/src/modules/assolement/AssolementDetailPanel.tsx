import { useEffect } from 'react';
import { useIsDesktop } from '../../hooks/useMediaQuery';

interface AssolementDetailPanelProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  /** Force le layout. Sinon : aside sur desktop, bottomsheet sur mobile (comme AsideCard). */
  layout?: 'auto' | 'aside' | 'bottomsheet';
  children: React.ReactNode;
}

/**
 * Panneau de détail pour le Plan d'assolement (timeline annuelle + édition segments).
 *
 * Reprend le chrome visuel et le comportement de AsideCard (panneau latéral
 * sur desktop, bottom-sheet sur mobile, handle, Esc, z-index) mais accepte
 * une zone children custom (timeline + form de segment) que AsideCard ne supporte
 * pas avec son API data/fields.
 */
export function AssolementDetailPanel({
  title,
  subtitle,
  onClose,
  layout = 'auto',
  children,
}: AssolementDetailPanelProps) {
  const isDesktop = useIsDesktop();
  const resolvedLayout: 'aside' | 'bottomsheet' =
    layout === 'aside'
      ? 'aside'
      : layout === 'bottomsheet'
        ? 'bottomsheet'
        : isDesktop
          ? 'aside'
          : 'bottomsheet';

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (resolvedLayout === 'aside') {
    return (
      <aside
        role="dialog"
        aria-label={title}
        className="flex h-full w-full flex-col overflow-hidden bg-(--color-surface)"
      >
        <Header title={title} subtitle={subtitle} onClose={onClose} />
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    );
  }

  // bottomsheet (mobile)
  return (
    <>
      <div
        className="fixed inset-0 z-[1100] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-x-0 bottom-0 z-[1110] flex max-h-[88vh] flex-col rounded-t-(--radius-lg) border-t border-(--color-border) bg-(--color-surface) shadow-(--shadow-popup)"
      >
        <div className="flex justify-center pt-2 pb-1">
          <span
            aria-hidden="true"
            className="block h-1 w-10 rounded-(--radius-pill) bg-(--color-border)"
          />
        </div>
        <Header title={title} subtitle={subtitle} onClose={onClose} />
        <div className="flex-1 overflow-y-auto px-4 pb-[max(env(safe-area-inset-bottom),16px)]">
          {children}
        </div>
      </div>
    </>
  );
}

function Header({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  return (
    <header className="flex items-start gap-3 border-b border-(--color-border) px-4 py-3">
      <div className="min-w-0 flex-1">
        <h2 className="m-0 truncate text-sm font-semibold">{title}</h2>
        {subtitle && <p className="m-0 mt-0.5 truncate text-xs text-(--color-muted)">{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="inline-flex h-8 w-8 items-center justify-center rounded-(--radius-sm) text-(--color-muted) hover:bg-[#f1f1ee] hover:text-(--color-text)"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          width={16}
          height={16}
          aria-hidden="true"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </header>
  );
}
