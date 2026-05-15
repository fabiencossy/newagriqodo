/**
 * ViewSwitcher — Toggle entre plusieurs vues d'un même dataset
 * (table, carte, dashboard).
 */

export type ViewKey = 'table' | 'map' | 'dashboard' | 'kanban' | 'list' | 'calendar';

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
  /** Mode d'affichage des items (icon+label, icon-only, label-only). Défaut 'icon+label'. */
  display?: ViewSwitcherDisplay;
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
  kanban: 'Kanban',
  list: 'Liste',
  calendar: 'Calendrier',
};

/** Variantes d'affichage des items dans le segmented control. */
export type ViewSwitcherDisplay = 'icon+label' | 'icon-only' | 'label-only';

export const VIEW_SWITCHER_DEFAULTS = {
  layout: 'auto' as const,
  display: 'icon+label' as ViewSwitcherDisplay,
  tooltipDelayMs: 400,
  iconSizePx: 20,
  /** Stroke width des icônes SVG (style Lucide). */
  iconStrokeWidth: 1.5,
} as const;
