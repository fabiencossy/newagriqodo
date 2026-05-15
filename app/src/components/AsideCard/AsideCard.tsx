import { useEffect, useState } from 'react';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import { ASIDE_CARD_DEFAULTS, type AsideCardProps, type FieldConfig } from './AsideCard.types';

const BASE = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function XIcon() {
  return (
    <svg {...BASE} width={16} height={16} aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg {...BASE} width={16} height={16} aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

export function AsideCard<T extends Record<string, unknown>>({
  title,
  subtitle,
  data,
  fields,
  mode = ASIDE_CARD_DEFAULTS.mode,
  editable = ASIDE_CARD_DEFAULTS.editable,
  onClose,
  onSave,
  onModeChange,
  actions = [],
  loading = false,
  width = ASIDE_CARD_DEFAULTS.width,
  animationMs = ASIDE_CARD_DEFAULTS.animationMs,
  layout = ASIDE_CARD_DEFAULTS.layout,
  ariaLabel,
  className,
}: AsideCardProps<T>) {
  const isDesktop = useIsDesktop();
  const resolvedLayout: 'aside' | 'bottomsheet' =
    layout === 'aside'
      ? 'aside'
      : layout === 'bottomsheet'
        ? 'bottomsheet'
        : isDesktop
          ? 'aside'
          : 'bottomsheet';

  // Draft d'édition : null en mode view, snapshot de `data` en mode edit
  const [draft, setDraft] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);

  // Esc pour fermer
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Entrée en mode édition → snapshot data dans le draft
  const handleEnterEdit = () => {
    setDraft(data);
    onModeChange?.('edit');
  };

  const handleCancel = () => {
    setDraft(null);
    onModeChange?.('view');
  };

  const visibleFields = fields.filter((f) => f.hidden !== mode);
  // En mode edit, on affiche le draft (édition optimiste annulable) ; sinon, data
  const displayData = mode === 'edit' && draft ? draft : data;

  const handleSave = async () => {
    if (!onSave || !draft) return;
    setSaving(true);
    try {
      await onSave(draft);
      setDraft(null);
      onModeChange?.('view');
    } finally {
      setSaving(false);
    }
  };

  const setFieldValue = (key: string, value: unknown) => {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  };

  const containerClasses = [
    'flex flex-col bg-(--color-surface) border-(--color-border) overflow-hidden',
    resolvedLayout === 'aside'
      ? 'h-full border-l'
      : 'fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-(--radius-lg) border-t shadow-(--shadow-popup)',
  ].join(' ');

  const containerStyle: React.CSSProperties = {
    ...(resolvedLayout === 'aside' ? { width } : {}),
    transition: `transform ${animationMs}ms ease-out`,
  };

  return (
    <aside
      role={resolvedLayout === 'aside' ? 'complementary' : 'dialog'}
      aria-modal={resolvedLayout === 'bottomsheet' ? true : undefined}
      aria-label={ariaLabel ?? title}
      aria-busy={loading}
      style={containerStyle}
      className={[containerClasses, className ?? ''].join(' ')}
    >
      {/* Handle bottom sheet */}
      {resolvedLayout === 'bottomsheet' && (
        <div className="flex justify-center pt-2 pb-1">
          <span className="block h-1 w-9 rounded-(--radius-pill) bg-(--color-border)" />
        </div>
      )}

      {/* Header */}
      <header className="flex items-center gap-2 border-b border-(--color-border) px-4 py-3">
        <div className="min-w-0 flex-1">
          <h3 className="m-0 truncate text-base font-semibold">{title}</h3>
          {subtitle && <p className="m-0 truncate text-xs text-(--color-muted)">{subtitle}</p>}
        </div>
        {editable && mode === 'view' && (
          <button
            type="button"
            onClick={handleEnterEdit}
            aria-label="Modifier"
            className="inline-flex h-9 w-9 items-center justify-center rounded-(--radius-sm) text-(--color-text) hover:bg-[#f1f1ee]"
          >
            <EditIcon />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="inline-flex h-9 w-9 items-center justify-center rounded-(--radius-sm) text-(--color-muted) hover:bg-[#f1f1ee] hover:text-(--color-text)"
        >
          <XIcon />
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <SkeletonRows />
        ) : !displayData ? (
          <p className="m-0 py-8 text-center text-sm text-(--color-muted)">Aucune sélection.</p>
        ) : (
          <div className="space-y-3">
            {visibleFields.map((field) => (
              <FieldRow
                key={field.key}
                field={field}
                value={displayData[field.key]}
                mode={mode}
                onChange={(v) => setFieldValue(field.key, v)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-end gap-2 border-t border-(--color-border) px-4 py-3">
        {mode === 'edit' && onSave ? (
          <>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="h-10 rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-3.5 text-sm font-medium hover:bg-[#f8f8f5] disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="h-10 rounded-(--radius) border border-(--color-primary) bg-(--color-primary) px-3.5 text-sm font-medium text-white hover:bg-(--color-primary-hover) disabled:opacity-60"
            >
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </>
        ) : (
          actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className={[
                'h-10 rounded-(--radius) px-3.5 text-sm font-medium disabled:opacity-50',
                action.variant === 'primary'
                  ? 'border border-(--color-primary) bg-(--color-primary) text-white hover:bg-(--color-primary-hover)'
                  : action.variant === 'danger'
                    ? 'border border-(--color-error) bg-(--color-surface) text-(--color-error) hover:bg-[#fef2f2]'
                    : 'border border-(--color-border) bg-(--color-surface) text-(--color-text) hover:bg-[#f8f8f5]',
              ].join(' ')}
            >
              {action.label}
            </button>
          ))
        )}
      </footer>
    </aside>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-3 w-1/3 animate-pulse rounded-(--radius-sm) bg-[#eeeeea]" />
          <div className="h-5 w-2/3 animate-pulse rounded-(--radius-sm) bg-[#eeeeea]" />
        </div>
      ))}
    </div>
  );
}

interface FieldRowProps {
  field: FieldConfig;
  value: unknown;
  mode: 'view' | 'edit';
  onChange: (value: unknown) => void;
}

function FieldRow({ field, value, mode, onChange }: FieldRowProps) {
  const isReadonly = field.readonly || field.type === 'readonly' || mode === 'view';
  const displayValue = field.format ? field.format(value) : formatDefault(value);

  return (
    <div>
      <label className="mb-1 block text-xs text-(--color-muted)">{field.label}</label>
      {isReadonly ? (
        <div className="text-sm text-(--color-text)">{displayValue || '—'}</div>
      ) : (
        <EditableInput field={field} value={value} onChange={onChange} />
      )}
    </div>
  );
}

interface EditableInputProps {
  field: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}

function EditableInput({ field, value, onChange }: EditableInputProps) {
  const inputClass =
    'h-10 w-full rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-3 text-sm focus:border-(--color-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15';

  switch (field.type) {
    case 'select':
      return (
        <select
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        >
          {field.options?.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    case 'textarea':
      return (
        <textarea
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={field.placeholder}
          className={inputClass.replace('h-10', 'min-h-[72px] py-2')}
        />
      );
    case 'number':
      return (
        <input
          type="number"
          value={typeof value === 'number' ? value : ''}
          onChange={(e) => onChange(e.target.valueAsNumber)}
          placeholder={field.placeholder}
          className={inputClass}
        />
      );
    case 'date':
      return (
        <input
          type="date"
          value={
            value instanceof Date ? value.toISOString().slice(0, 10) : ((value as string) ?? '')
          }
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      );
    case 'boolean':
      return (
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-5 w-5 accent-(--color-primary)"
        />
      );
    default:
      return (
        <input
          type="text"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={inputClass}
        />
      );
  }
}

function formatDefault(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toLocaleDateString('fr-CH');
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  return String(value);
}
