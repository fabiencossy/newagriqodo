/**
 * AsideCard — Panneau de détail (desktop aside / mobile bottom sheet).
 * Spec : Phase0_Components/AsideCard/AsideCard_CHECKLIST.md
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
  key: string;
  label: string;
  type: FieldType;
  options?: FieldOption[];
  readonly?: boolean;
  format?: (value: unknown) => string;
  validate?: (value: unknown) => string | null;
  placeholder?: string;
  hidden?: 'view' | 'edit';
}

export interface AsideCardAction {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
  disabled?: boolean;
}

export interface AsideCardProps<T extends Record<string, unknown> = Record<string, unknown>> {
  title: string;
  subtitle?: string;
  data: T | null;
  fields: FieldConfig[];
  mode?: 'view' | 'edit';
  editable?: boolean;
  onClose: () => void;
  onSave?: (data: T) => Promise<void> | void;
  onModeChange?: (mode: 'view' | 'edit') => void;
  actions?: AsideCardAction[];
  loading?: boolean;
  width?: string;
  animationMs?: number;
  layout?: 'auto' | 'aside' | 'bottomsheet';
  ariaLabel?: string;
  className?: string;
}

export const ASIDE_CARD_DEFAULTS = {
  mode: 'view' as const,
  editable: false,
  width: '360px',
  animationMs: 250,
  layout: 'auto' as const,
};
