/**
 * SearchBar — Filtrage dynamique pour toutes les listes
 * (Parcellaire, Travaux, Troupeau, RH).
 */

export type FilterValuePrimitive = string | number | boolean | Date | null;
export type FilterValue =
  | FilterValuePrimitive
  | { from: FilterValuePrimitive; to: FilterValuePrimitive };

export interface FilterOption {
  label: string;
  value: FilterValuePrimitive;
}

export interface FilterConfig {
  /** Identifiant unique (key dans l'objet de filtres). */
  id: string;
  /** Libellé affiché à l'utilisateur. */
  label: string;
  /** Type d'entrée — détermine le rendu UI. */
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'range' | 'toggle';
  /** Options pour select / multiselect. */
  options?: FilterOption[];
  /** Placeholder pour les inputs texte. */
  placeholder?: string;
  /** Valeur initiale (sinon contrôlée via activeFilters). */
  defaultValue?: FilterValue;
}

export type ActiveFilters = Record<string, FilterValue>;

export interface SearchBarProps {
  /** Placeholder affiché dans l'input principal. */
  placeholder?: string;
  /** Valeur du champ de recherche (controlled). */
  value: string;
  /** Callback déclenché après debounce. */
  onChange: (value: string) => void;
  /** Délai de debounce en ms. Défaut : 300. */
  debounceMs?: number;
  /** Liste des filtres disponibles (rendus dans le panneau avancé). */
  filters?: FilterConfig[];
  /** Filtres actuellement actifs (controlled). */
  activeFilters?: ActiveFilters;
  /** Callback quand un filtre change. */
  onFilterChange?: (filters: ActiveFilters) => void;
  /** Affiche le panneau avancé ouvert par défaut. Défaut : false. */
  defaultAdvancedOpen?: boolean;
  /** Affiche les filter pills sous la barre. Défaut : true. */
  showActivePills?: boolean;
  /** Désactive l'ensemble du composant. */
  disabled?: boolean;
  /** Identifiant ARIA pour la région de recherche. */
  ariaLabel?: string;
  /** Classe CSS optionnelle pour le conteneur. */
  className?: string;
}

export const SEARCH_BAR_DEFAULTS = {
  debounceMs: 300,
  defaultAdvancedOpen: false,
  showActivePills: true,
} as const;
