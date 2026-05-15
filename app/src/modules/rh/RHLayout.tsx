import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { PageContainer } from '../_shared/PageContainer';

/** Layout RH avec nav secondaire entre Mes heures / Mes congés. */
export default function RHLayout() {
  const location = useLocation();
  // Sur l'écran "saisir" on cache la nav secondaire (écran à part entière)
  const isSaisir = location.pathname.endsWith('/saisir');

  return (
    <PageContainer>
      {!isSaisir && (
        <nav
          aria-label="Sections RH"
          className="mb-5 flex gap-1 overflow-x-auto rounded-(--radius) bg-[#f1f1ee] p-1"
        >
          <SubTab to="/rh/heures" label="Mes heures" />
          <SubTab to="/rh/conges" label="Mes congés" />
        </nav>
      )}
      <Outlet />
    </PageContainer>
  );
}

function SubTab({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'h-9 flex-shrink-0 rounded-(--radius-sm) px-3 text-sm whitespace-nowrap sm:flex-1',
          'inline-flex items-center justify-center transition-colors',
          isActive
            ? 'bg-(--color-surface) font-medium shadow-(--shadow-card)'
            : 'text-(--color-text) hover:bg-black/5',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  );
}
