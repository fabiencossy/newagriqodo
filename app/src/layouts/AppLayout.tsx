import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useIsDesktop } from '../hooks/useMediaQuery';
import { NAV_ITEMS, type NavItem } from './nav-items';

const BASE_SVG = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function MenuIcon() {
  return (
    <svg {...BASE_SVG} width={20} height={20} aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg {...BASE_SVG} width={20} height={20} aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function AppLayout() {
  const isDesktop = useIsDesktop();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Trouver l'item actif pour le titre header mobile
  const activeItem = NAV_ITEMS.find((i) => location.pathname.startsWith(i.path));

  return (
    <div className="grid h-screen grid-cols-1 md:grid-cols-[256px_1fr]">
      {/* Sidebar desktop (toujours visible) */}
      {isDesktop && <Sidebar />}

      {/* Drawer mobile (overlay) */}
      {!isDesktop && drawerOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="relative h-full w-64 bg-(--color-surface) shadow-(--shadow-popup)">
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex h-screen flex-col overflow-hidden">
        {/* Header mobile (avec burger) */}
        {!isDesktop && (
          <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-(--color-border) bg-(--color-surface) px-4">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Ouvrir le menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-(--radius-sm) text-(--color-text) hover:bg-[#f1f1ee]"
            >
              <MenuIcon />
            </button>
            <h1 className="m-0 flex-1 text-base font-semibold">
              {activeItem?.label ?? 'NewagriQodo'}
            </h1>
            <img src="/qodo-mark.svg" alt="Qodo" className="h-7 w-7" />
          </header>
        )}

        {/* Contenu principal */}
        <main className="flex-1 overflow-y-auto bg-(--color-bg)">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav
      aria-label="Navigation principale"
      className="flex h-full flex-col border-r border-(--color-border) bg-(--color-surface)"
    >
      {/* Logo header */}
      <div className="flex h-16 items-center gap-3 border-b border-(--color-border) px-5">
        <img src="/qodo-logo.svg" alt="Qodo Digital" className="h-7" />
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Fermer le menu"
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-(--radius-sm) text-(--color-muted) hover:bg-[#f1f1ee] hover:text-(--color-text)"
          >
            <XIcon />
          </button>
        )}
      </div>

      {/* Items */}
      <ul className="m-0 flex-1 list-none space-y-0.5 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                [
                  'flex h-10 items-center gap-2.5 rounded-(--radius-sm) px-3 text-sm font-medium',
                  'transition-colors',
                  isActive
                    ? 'bg-(--color-primary)/10 text-(--color-primary)'
                    : 'text-(--color-text) hover:bg-[#f5f5f0]',
                ].join(' ')
              }
            >
              <ItemIcon item={item} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto rounded-(--radius-pill) bg-(--color-accent)/12 px-1.5 py-0.5 text-[10px] font-semibold text-(--color-accent)">
                  {item.badge}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="border-t border-(--color-border) p-3">
        <div className="flex items-center gap-2 rounded-(--radius-sm) px-2 py-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-(--radius-pill) bg-(--color-primary)/10 text-sm font-semibold text-(--color-primary)">
            FC
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">Fabien Cossy</div>
            <div className="truncate text-xs text-(--color-muted)">Domaine Darval</div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function ItemIcon({ item }: { item: NavItem }) {
  return (
    <svg {...BASE_SVG} width={18} height={18} aria-hidden="true">
      {item.icon}
    </svg>
  );
}
