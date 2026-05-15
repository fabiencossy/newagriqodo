/**
 * Header de page compact.
 * - Mobile : seules les actions sont visibles (titre déjà dans AppHeader).
 * - Desktop : titre + subtitle inline + actions à droite, 1 ligne.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-4 flex items-center justify-end gap-3 md:justify-between">
      {/* Bloc titre — caché sur mobile */}
      <div className="hidden min-w-0 items-baseline gap-3 md:flex">
        <h1 className="m-0 truncate text-lg font-semibold tracking-tight text-(--color-text)">
          {title}
        </h1>
        {subtitle && <span className="truncate text-sm text-(--color-muted)">{subtitle}</span>}
      </div>
      {actions && <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
