import { useState } from 'react';
import type { AssolementSegment } from './assolement.types';
import { listCultureLabels } from './cultures';

interface AssolementSegmentEditorProps {
  segment: AssolementSegment;
  onSave: (next: AssolementSegment) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

/**
 * Formulaire inline d'édition d'un segment d'assolement.
 * Utilisé dans le AssolementDetailPanel.
 */
export function AssolementSegmentEditor({
  segment,
  onSave,
  onCancel,
  onDelete,
}: AssolementSegmentEditorProps) {
  const [draft, setDraft] = useState<AssolementSegment>(segment);
  // Reset le draft quand on change de segment (pattern React docs : "Resetting state on prop change").
  const [prev, setPrev] = useState(segment);
  if (prev !== segment) {
    setPrev(segment);
    setDraft(segment);
  }

  const cultures = listCultureLabels();
  const invalid = draft.endDate < draft.startDate;

  return (
    <div className="space-y-3 rounded-(--radius) border border-(--color-border) bg-[#fbfbf9] p-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Culture">
          <select
            value={draft.culture}
            onChange={(e) => setDraft({ ...draft, culture: e.target.value })}
            className={inputClass}
          >
            {cultures.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Variété">
          <input
            type="text"
            value={draft.varietyName ?? ''}
            onChange={(e) => setDraft({ ...draft, varietyName: e.target.value })}
            placeholder="ex. Arnold"
            className={inputClass}
          />
        </Field>
        <Field label="Début">
          <input
            type="date"
            value={draft.startDate}
            onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Fin">
          <input
            type="date"
            value={draft.endDate}
            onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
            className={[inputClass, invalid ? 'border-(--color-error)' : ''].join(' ')}
          />
        </Field>
      </div>
      <Field label="Notes">
        <textarea
          value={draft.notes ?? ''}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          rows={2}
          placeholder="Observations…"
          className={inputClass.replace('h-9', 'min-h-[60px] py-2')}
        />
      </Field>
      {invalid && (
        <p className="m-0 text-xs text-(--color-error)">
          La date de fin doit être postérieure à la date de début.
        </p>
      )}
      <div className="flex items-center gap-2">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-9 items-center rounded-(--radius) border border-(--color-error) bg-(--color-surface) px-3 text-xs font-medium text-(--color-error) hover:bg-[#fef2f2]"
          >
            Supprimer
          </button>
        )}
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 items-center rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-3 text-xs font-medium hover:bg-[#f8f8f5]"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={invalid}
            onClick={() => onSave(draft)}
            className="inline-flex h-9 items-center rounded-(--radius) border border-(--color-primary) bg-(--color-primary) px-4 text-xs font-medium text-white hover:bg-(--color-primary-hover) disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  'h-9 w-full rounded-(--radius-sm) border border-(--color-border) bg-(--color-surface) px-2 text-sm focus:border-(--color-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-(--color-text)">{label}</label>
      {children}
    </div>
  );
}
