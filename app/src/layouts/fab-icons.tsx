/**
 * Icônes Lucide-style 16px utilisées dans les actions FAB.
 * Centralisées ici pour cohérence visuelle entre toutes les pages.
 */

const BASE = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  width: 16,
  height: 16,
  'aria-hidden': true,
};

/** Ouvrir une fiche / une page */
export function FabOpenIcon() {
  return (
    <svg {...BASE}>
      <path d="M14 3h7v7M21 3l-9 9" />
      <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
    </svg>
  );
}

/** Créer / ajouter une intervention — pictogramme crayon style Lucide (Pencil). */
export function FabInterventionIcon() {
  return (
    <svg {...BASE}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

/** Observer / œil */
export function FabObserveIcon() {
  return (
    <svg {...BASE}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** Voir le carnet — livre ouvert style Lucide (BookOpen). */
export function FabBookIcon() {
  return (
    <svg {...BASE}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

/** Dessiner une parcelle / polygone — polygone irrégulier (style "Hexagon" Lucide simplifié). */
export function FabDrawIcon() {
  return (
    <svg {...BASE}>
      <path d="M21 9.5 12 3 3 9.5V18l9 3 9-3V9.5z" />
      <circle cx="3" cy="9.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="3" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="21" cy="9.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="21" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Importer un fichier */
export function FabImportIcon() {
  return (
    <svg {...BASE}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

/** Calendrier / segment d'assolement */
export function FabCalendarIcon() {
  return (
    <svg {...BASE}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M12 14v4M10 16h4" />
    </svg>
  );
}

/** Horloge / saisir une présence */
export function FabClockIcon() {
  return (
    <svg {...BASE}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

/** Plus / nouveau (générique) */
export function FabPlusIcon() {
  return (
    <svg {...BASE}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
