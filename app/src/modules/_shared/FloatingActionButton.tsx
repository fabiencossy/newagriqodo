/**
 * Bouton flottant (FAB) contextuel en bas-gauche.
 * Action principale de la page courante.
 */
export function FloatingActionButton({
  label,
  onClick,
  icon = <PlusIcon />,
  variant = 'primary',
}: {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
}) {
  const base =
    variant === 'primary'
      ? 'bg-(--color-primary) text-white border border-(--color-primary) hover:bg-(--color-primary-hover)'
      : 'bg-(--color-surface) text-(--color-text) border border-(--color-border) hover:bg-[#f8f8f5]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'fixed bottom-5 left-5 z-30 inline-flex items-center gap-2 rounded-(--radius-pill)',
        'h-12 px-5 text-sm font-medium shadow-(--shadow-fab) transition-all',
        'hover:translate-y-[-1px]',
        // Sur desktop avec sidebar (256px), le FAB doit être à gauche du contenu
        'md:left-[calc(256px+20px)]',
        base,
      ].join(' ')}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={18}
      height={18}
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
