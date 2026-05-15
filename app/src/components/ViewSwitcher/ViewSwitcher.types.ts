/**
 * ViewSwitcher — Toggle entre plusieurs vues d'un même dataset.
 * Spec : Phase0_Components/ViewSwitcher/ViewSwitcher_CHECKLIST.md
 */

export type ViewKey = 'table' | 'map' | 'dashboard' | 'kanban' | 'list' | 'calendar' | 'timeline';

export const VIEW_LABELS: Record<ViewKey, string> = {
  table: 'Table',
  map: 'Carte',
  dashboard: 'Dashboard',
  kanban: 'Kanban',
  list: 'Liste',
  calendar: 'Calendrier',
  timeline: 'Timeline',
};

export type ViewSwitcherDisplay = 'icon+label' | 'icon-only' | 'label-only';

export interface ViewSwitcherProps {
  /** Vues disponibles dans l'ordre d'affichage. Min 2. */
  views: ViewKey[];
  /** Vue actuellement active. */
  activeView: ViewKey;
  /** Callback de changement de vue. */
  onChange: (view: ViewKey) => void;
  /** Vues individuellement désactivées. */
  disabledViews?: ViewKey[];
  /** Désactive l'ensemble. */
  disabled?: boolean;
  /** Forcer un layout. Auto : segmented ≥768px, dropdown <768px. */
  layout?: 'auto' | 'segmented' | 'dropdown';
  /** Mode d'affichage des items. Défaut 'icon+label'. */
  display?: ViewSwitcherDisplay;
  /** Label ARIA pour le tablist. */
  ariaLabel?: string;
  /** Classe CSS optionnelle. */
  className?: string;
}

export const VIEW_SWITCHER_DEFAULTS = {
  layout: 'auto' as const,
  display: 'icon+label' as ViewSwitcherDisplay,
  iconSizePx: 20,
  iconStrokeWidth: 1.5,
};
