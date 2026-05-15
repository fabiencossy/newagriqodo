/**
 * ViewSwitcher — Toggle entre plusieurs vues d'un même dataset
 * (table, carte, dashboard).
 */

export type ViewKey = 'table' | 'map' | 'dashboard';

export interface ViewSwitcherProps {
  /** Vues disponibles, dans l'ordre d'affichage. Min 2, max 5. */
  views: ViewKey[];
  /** Vue actuellement active. Doit appartenir à `views`. */
  activeView: ViewKey;
  /** Callback de changement de vue. */
  onChange: (view: ViewKey) => void;
  /** Désactive l'ensemble du composant. */
  disabled?: boolean;
  /** Désactive individuellement certaines vues (ex: carte indispo si pas de géoms). */
  disabledViews?: ViewKey[];
  /** Forcer un layout (sinon : segmented ≥768px, dropdown <768px). */
  layout?: 'auto' | 'segmented' | 'dropdown';
  /** Délai d'apparition tooltip (ms). Défaut 400. */
  tooltipDelayMs?: number;
  /** Identifiant ARIA pour le tablist. */
  ariaLabel?: string;
  /** Classe CSS optionnelle. */
  className?: string;
}

export const VIEW_LABELS: Record<ViewKey, string> = {
  table: 'Table',
  map: 'Carte',
  dashboard: 'Dashboard',
};

export const VIEW_SWITCHER_DEFAULTS = {
  layout: 'auto',
  tooltipDelayMs: 400,
  iconSizePx: 20,
} as const;
