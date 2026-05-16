import { useNavigate } from 'react-router-dom';

/**
 * Composant standard pour les liens internes entre entités de l'app
 * (intervention → parcelle, segment → parcelle, etc.).
 *
 * 3 variantes :
 *   - 'chip'           : pastille inline discrète, pour les listes/tables
 *   - 'compact-button' : bouton 36px à côté d'un champ form
 *   - 'tap-row'        : ligne entièrement tappable pour mobile
 *
 * Tap target ≥ 32px, couleur primaire, icône ↗ pour signaler la navigation.
 */

interface EntityLinkProps {
  /** Chemin de destination (react-router). */
  to: string;
  /** Libellé visible. */
  label: string;
  /** Métadonnée secondaire (id, code, surface...) affichée en muted. */
  meta?: string;
  /** Style. */
  variant?: 'chip' | 'compact-button' | 'tap-row';
  /** Callback à appeler avant la navigation (ex: fermer une modale). */
  beforeNavigate?: () => void;
  /** Icône à gauche (variante compact-button). Défaut: eye. */
  leadingIcon?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function EntityLink({
  to,
  label,
  meta,
  variant = 'chip',
  beforeNavigate,
  leadingIcon,
  ariaLabel,
  className,
}: EntityLinkProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (beforeNavigate) beforeNavigate();
    navigate(to);
  };

  if (variant === 'compact-button') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel ?? `Voir ${label}`}
        title={`Voir ${label}`}
        className={[
          'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-3 text-xs font-medium text-(--color-text) hover:border-(--color-primary) hover:bg-[#f8f8f5] hover:text-(--color-primary)',
          className ?? '',
        ].join(' ')}
      >
        {leadingIcon ?? <EyeIcon />}
        <span className="hidden sm:inline">Voir la fiche</span>
      </button>
    );
  }

  if (variant === 'tap-row') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel ?? `Ouvrir ${label}`}
        className={[
          'group flex w-full items-center gap-2 rounded-(--radius-sm) px-2 py-2 text-left hover:bg-[#f8f8f5] active:bg-[#f1f1ee]',
          className ?? '',
        ].join(' ')}
      >
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-(--color-text) group-hover:text-(--color-primary)">
            {label}
          </div>
          {meta && (
            <div className="truncate font-mono text-[11px] text-(--color-muted)">{meta}</div>
          )}
        </div>
        <span
          aria-hidden="true"
          className="shrink-0 text-(--color-muted) group-hover:text-(--color-primary)"
        >
          <ArrowUpRightIcon />
        </span>
      </button>
    );
  }

  // variant 'chip' (défaut)
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel ?? `Voir ${label}`}
      title={`Voir ${label}`}
      className={[
        'inline-flex max-w-full items-center gap-1 rounded-(--radius-sm) px-1.5 py-1 text-(--color-primary) hover:bg-(--color-primary)/8 hover:underline underline-offset-2',
        className ?? '',
      ].join(' ')}
    >
      <span className="truncate font-medium">{label}</span>
      <span aria-hidden="true" className="shrink-0 opacity-70">
        <ArrowUpRightIcon size={11} />
      </span>
    </button>
  );
}

function ArrowUpRightIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}

function EyeIcon() {
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
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
