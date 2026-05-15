/**
 * SearchBar — Pattern inspiré du SearchPanel Odoo.
 *
 * Concepts clés :
 *  - Une seule barre contient les filtres actifs (facets) + l'input texte.
 *  - 3 menus latéraux : Filtres, Regrouper (Group By), Favoris.
 *  - Au focus, suggestions par champ ("Rechercher 'darval' dans Nom / Code / …").
 *  - Multi-valeur sur un même champ : combinées en OR à l'intérieur de la facet.
 *  - Multi-champ : combinés en AND entre les facets.
 *  - Favoris : recherches sauvegardables (filtres + group by + tri).
 */

export type FilterPrimitive = string | number | boolean | Date | null;

export interface FieldDescriptor {
  /** Clé technique (clé dans l'objet domaine). */
  id: string;
  /** Libellé court affiché en chip et en suggestion. */
  label: string;
  /** Type technique du champ. */
  type:
    | 'text'
    | 'number'
    | 'boolean'
    | 'date'
    | 'datetime'
    | 'select'
    | 'many2one'
    | 'many2many'
    | 'tags';
  /** Si type=select/many2one/many2many/tags, options statiques ou loader async. */
  options?: FilterOption[];
  /** Loader async (autocomplete) pour many2one / many2many. */
  fetchOptions?: (query: string) => Promise<FilterOption[]>;
  /** Champ recherchable dans la barre principale (suggestions). Défaut true pour text/many2one. */
  searchable?: boolean;
  /** Opérateurs supportés. Défaut selon `type`. */
  operators?: FilterOperator[];
}

export interface FilterOption {
  label: string;
  value: FilterPrimitive;
}

export type FilterOperator =
  | 'eq' | 'neq'
  | 'contains' | 'starts_with'
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'between'
  | 'in' | 'not_in'
  | 'is_set' | 'is_not_set';

/** Un filtre actif = un "facet" affiché dans la barre. */
export interface Facet {
  /** ID unique de la facet (random ou stable). */
  id: string;
  /** Référence vers le champ. */
  fieldId: string;
  /** Opérateur appliqué. */
  operator: FilterOperator;
  /** Valeur(s) appliquée(s). Si plusieurs : combinées en OR à l'intérieur. */
  values: FilterPrimitive[];
  /** Label custom (sinon : généré depuis values). */
  customLabel?: string;
}

/** Un "groupe by" actif. */
export interface GroupBy {
  fieldId: string;
  /** Pour les dates : granularité de regroupement. */
  granularity?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export type SortDirection = 'asc' | 'desc';
export interface SortBy {
  fieldId: string;
  direction: SortDirection;
}

/** État global de la recherche (peut être sauvegardé en Favori). */
export interface SearchState {
  /** Texte libre dans l'input (avant transformation en facet). */
  query?: string;
  /** Filtres actifs. */
  facets: Facet[];
  /** Group By actifs (ordonnés). */
  groupBy: GroupBy[];
  /** Tri actif. */
  sortBy?: SortBy;
}

export interface SavedFavorite {
  id: string;
  name: string;
  /** Si true, ce favori est appliqué automatiquement à l'ouverture. */
  isDefault?: boolean;
  /** Visibilité partagée (vs perso). */
  shared?: boolean;
  state: SearchState;
}

export interface SearchBarProps {
  /** Schéma des champs disponibles (filtres + groupBy + suggestions). */
  fields: FieldDescriptor[];
  /** État courant (controlled). */
  value: SearchState;
  /** Callback de changement d'état. */
  onChange: (state: SearchState) => void;
  /** Favoris disponibles. */
  favorites?: SavedFavorite[];
  /** Callback création d'un favori. */
  onSaveFavorite?: (name: string, shared: boolean, isDefault: boolean) => void;
  /** Callback suppression d'un favori. */
  onDeleteFavorite?: (favoriteId: string) => void;
  /** Champs proposés en suggestions (sinon : tous les `searchable`). */
  suggestableFieldIds?: string[];
  /** Placeholder de l'input. */
  placeholder?: string;
  /** Délai de debounce sur les changements de query. Défaut 300ms. */
  debounceMs?: number;
  /** Désactive la barre. */
  disabled?: boolean;
  /**
   * Thème visuel. 'dark' = fond sombre (défaut, Odoo-style), 'light' = fond clair.
   * Le mode 'auto' suit `prefers-color-scheme` ou le contexte parent.
   */
  theme?: 'dark' | 'light' | 'auto';
  /** Identifiant ARIA. */
  ariaLabel?: string;
  /** Classe CSS optionnelle. */
  className?: string;
}

export const SEARCH_BAR_DEFAULTS = {
  debounceMs: 300,
  placeholder: 'Rechercher…',
  theme: 'dark' as const,
} as const;

/** Helpers : combinaisons logiques entre facets. */
export const FACET_LOGIC = {
  /** Plusieurs valeurs dans une même facet = OR. */
  withinFacet: 'OR' as const,
  /** Plusieurs facets = AND. */
  betweenFacets: 'AND' as const,
};
