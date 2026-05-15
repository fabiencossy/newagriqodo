/**
 * FieldPicker — Sélecteur popup (desktop) / fullscreen (mobile).
 * Spec : Phase0_Components/FieldPicker/FieldPicker_CHECKLIST.md
 */

export type PickerMode = 'single' | 'multiple';

export interface PickerCategory {
  id: string;
  label: string;
  color?: string;
  count?: number;
  isAll?: boolean;
}

export interface PickerCategoryGroup {
  id: string;
  title?: string;
  categories: PickerCategory[];
}

export interface PickerItem<T = unknown> {
  id: string;
  label: string;
  meta?: string;
  badge?: { label: string; color?: string };
  categoryIds?: string[];
  disabled?: boolean;
  data?: T;
}

export interface FieldPickerProps<T = unknown> {
  /** Titre affiché en header. */
  title: string;
  /** Placeholder du trigger. */
  placeholder?: string;
  /** Mode de sélection. */
  mode: PickerMode;
  /** Valeur courante (IDs). En single, max 1. */
  value: string[];
  /** Callback de changement. */
  onChange: (selectedIds: string[], selectedItems: PickerItem<T>[]) => void;
  /** Items disponibles (synchrone). */
  items: PickerItem<T>[];
  /** Groupes de catégories. */
  categoryGroups?: PickerCategoryGroup[];
  /** Catégorie initiale. Défaut 'all'. */
  defaultCategoryId?: string;
  /** Création inline. */
  allowCreate?: boolean;
  /** Callback de création. */
  onCreate?: (query: string) => Promise<PickerItem<T> | null>;
  /** Label du bouton créer. Défaut 'Créer'. */
  createLabel?: string;
  /** Debounce recherche (ms). Défaut 200. */
  debounceMs?: number;
  /** Nombre max de chips dans le trigger. Défaut 3. */
  maxChipsInTrigger?: number;
  /** Layout. Défaut 'auto'. */
  layout?: 'auto' | 'popup' | 'fullscreen';
  /** Seuil chips → dropdown sur mobile. Défaut 5. */
  mobileCategoryDropdownThreshold?: number;
  /** Désactivé. */
  disabled?: boolean;
  /** Classe CSS optionnelle. */
  className?: string;
}

export const FIELD_PICKER_DEFAULTS = {
  mode: 'single' as PickerMode,
  debounceMs: 200,
  maxChipsInTrigger: 3,
  placeholder: 'Sélectionner…',
  allowCreate: false,
  createLabel: 'Créer',
  layout: 'auto' as const,
  mobileCategoryDropdownThreshold: 5,
  fullscreenBreakpointPx: 600,
};
