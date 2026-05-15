/**
 * AsideCard — Panneau de détail à la sélection (desktop) ou bottom sheet (mobile).
 */

export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'boolean'
  | 'readonly';

export interface FieldOption {
  label: string;
  value: string | number | boolean;
}

export interface FieldConfig {
  /** Clé dans l'objet data. */
  key: string;
  /** Libellé affiché. */
  label: string;
  /** Type d'entrée. */
  type: FieldType;
  /** Options pour select / multiselect. */
  options?: FieldOption[];
  /** Lecture seule (override en mode édition). */
  readonly?: boolean;
  /** Formateur pour l'affichage (mode lecture). */
  format?: (value: unknown) => string;
  /** Validation custom (mode édition). Retourne message d'erreur ou null. */
  validate?: (value: unknown) => string | null;
  /** Placeholder en édition. */
  placeholder?: string;
  /** Champ caché conditionnellement (ex: visible seulement en édition). */
  hidden?: 'view' | 'edit';
}

export interface AsideCardProps<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Titre du panneau. */
  title: string;
  /** Sous-titre optionnel. */
  subtitle?: string;
  /** Données de l'item sélectionné. */
  data: T | null;
  /** Configuration des champs à rendre. */
  fields: FieldConfig[];
  /** Mode édition. Défaut 'view'. */
  mode?: 'view' | 'edit';
  /** Autoriser le passage en mode édition (bouton ✎). Défaut false. */
  editable?: boolean;
  /** Callback de fermeture (X, swipe, Esc). */
  onClose: () => void;
  /** Callback de sauvegarde (mode édition). */
  onSave?: (data: T) => Promise<void> | void;
  /** Callback de bascule de mode. */
  onModeChange?: (mode: 'view' | 'edit') => void;
  /** Actions footer custom (boutons supplémentaires). */
  actions?: AsideCardAction[];
  /** État loading (skeleton). */
  loading?: boolean;
  /** Largeur desktop. Défaut '360px'. */
  width?: string;
  /** Durée animation slide/sheet en ms. Défaut 250. */
  animationMs?: number;
  /** Force layout (sinon : auto selon viewport). */
  layout?: 'auto' | 'aside' | 'bottomsheet';
  /** Identifiant ARIA. */
  ariaLabel?: string;
  /** Classe CSS optionnelle. */
  className?: string;
}

export interface AsideCardAction {
  id: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
  disabled?: boolean;
}

export const ASIDE_CARD_DEFAULTS = {
  mode: 'view' as const,
  editable: false,
  width: '360px',
  animationMs: 250,
  layout: 'auto' as const,
} as const;
