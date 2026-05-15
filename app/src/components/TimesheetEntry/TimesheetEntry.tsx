import { useCallback, useId, useMemo, useState } from 'react';
import {
  computePresenceHours,
  dateBounds,
  durationMinutes,
  findOverlappingBreaks,
  formatHoursDecimal,
  isBreakWithinRange,
  makeBreakId,
  validateBreak,
} from './helpers';
import {
  PROJECT_TYPES,
  TIMESHEET_DEFAULTS,
  type BreakPeriod,
  type ProjectType,
  type TimesheetEntryInput,
  type TimesheetEntryProps,
} from './TimesheetEntry.types';

const BASE_SVG = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function CoffeeIcon() {
  return (
    <svg {...BASE_SVG} width={16} height={16} aria-hidden="true">
      <path d="M17 8h1a4 4 0 0 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z M6 2v3M10 2v3M14 2v3" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg {...BASE_SVG} width={14} height={14} aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg {...BASE_SVG} width={14} height={14} aria-hidden="true">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14M10 11v6M14 11v6" />
    </svg>
  );
}

function todayDateInput(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowTimeInput(): string {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function TimesheetEntry({
  onSubmit,
  onCancel,
  intervention,
  defaultDate,
  defaultStartTime = TIMESHEET_DEFAULTS.defaultStartTime,
  defaultEndTime = TIMESHEET_DEFAULTS.defaultEndTime,
  defaultBreaks,
  defaultProjectType = TIMESHEET_DEFAULTS.defaultProjectType,
  maxHoursPerDay = TIMESHEET_DEFAULTS.maxHoursPerDay,
  maxPastDays = TIMESHEET_DEFAULTS.maxPastDays,
  allowFutureDates = TIMESHEET_DEFAULTS.allowFutureDates,
  allowOvernight = TIMESHEET_DEFAULTS.allowOvernight,
  minBreakMinutes = TIMESHEET_DEFAULTS.minBreakMinutes,
  maxBreakMinutes = TIMESHEET_DEFAULTS.maxBreakMinutes,
  startTimePresets = TIMESHEET_DEFAULTS.startTimePresets,
  endTimePresets = TIMESHEET_DEFAULTS.endTimePresets,
  loading = false,
  ariaLabel = 'Saisir une présence',
  className,
}: TimesheetEntryProps) {
  const [date, setDate] = useState<string>(
    defaultDate ? defaultDate.toISOString().slice(0, 10) : todayDateInput(),
  );
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [breaks, setBreaks] = useState<BreakPeriod[]>(defaultBreaks ?? []);
  const [projectType, setProjectType] = useState<ProjectType>(defaultProjectType);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { min: dateMin, max: dateMax } = useMemo(
    () => dateBounds(maxPastDays, allowFutureDates),
    [maxPastDays, allowFutureDates],
  );

  /* ---------- Validation live ---------- */
  const totals = useMemo(
    () => computePresenceHours(startTime, endTime, breaks, allowOvernight),
    [startTime, endTime, breaks, allowOvernight],
  );

  const rangeError = useMemo(() => {
    const d = durationMinutes(startTime, endTime, allowOvernight);
    if (d === null) {
      return (
        'La fin doit être après le début.' +
        (allowOvernight ? '' : ' Activez "plage de nuit" pour la nuit.')
      );
    }
    if (d / 60 > maxHoursPerDay) {
      return `Maximum ${maxHoursPerDay} h par jour.`;
    }
    return null;
  }, [startTime, endTime, allowOvernight, maxHoursPerDay]);

  const overlapPairs = useMemo(() => findOverlappingBreaks(breaks), [breaks]);
  const overlapIds = useMemo(() => {
    const ids = new Set<string>();
    for (const [a, b] of overlapPairs) {
      ids.add(a.id);
      ids.add(b.id);
    }
    return ids;
  }, [overlapPairs]);

  const breakErrors = useMemo(() => {
    const map = new Map<string, string>();
    for (const b of breaks) {
      const v = validateBreak(b, minBreakMinutes, maxBreakMinutes);
      if (!v.ok && v.reason) map.set(b.id, v.reason);
      if (!isBreakWithinRange(b, startTime, endTime)) {
        map.set(b.id, 'Pause hors de la plage de présence.');
      }
      if (overlapIds.has(b.id)) {
        map.set(b.id, 'Cette pause chevauche une autre.');
      }
    }
    return map;
  }, [breaks, minBreakMinutes, maxBreakMinutes, startTime, endTime, overlapIds]);

  const hasErrors = rangeError !== null || breakErrors.size > 0;

  /* ---------- Mutations ---------- */
  const addBreak = () =>
    setBreaks((bs) => [...bs, { id: makeBreakId(), start: '12:00', end: '13:00' }]);

  const removeBreak = (id: string) => setBreaks((bs) => bs.filter((b) => b.id !== id));

  const updateBreak = (id: string, patch: Partial<BreakPeriod>) =>
    setBreaks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  /* ---------- Submit ---------- */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (hasErrors || !totals) return;
      const entry: TimesheetEntryInput = {
        date: new Date(date),
        startTime,
        endTime,
        breaks,
        hoursWorked: totals.effectiveHours,
        projectType,
        interventionId: intervention?.id,
        notes: notes.trim() || undefined,
      };
      setSubmitting(true);
      setSubmitError(null);
      try {
        await onSubmit(entry);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : String(err));
      } finally {
        setSubmitting(false);
      }
    },
    [
      hasErrors,
      totals,
      date,
      startTime,
      endTime,
      breaks,
      projectType,
      intervention,
      notes,
      onSubmit,
    ],
  );

  const titleId = useId();
  const isBusy = submitting || loading;

  return (
    <form
      onSubmit={handleSubmit}
      aria-labelledby={titleId}
      aria-label={ariaLabel}
      className={[
        'mx-auto max-w-xl rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5',
        className ?? '',
      ].join(' ')}
    >
      <h3 id={titleId} className="m-0 mb-4 text-base font-semibold">
        {intervention ? `Saisir une présence · ${intervention.reference}` : 'Saisir une présence'}
      </h3>

      {intervention && (
        <div className="mb-3 rounded-(--radius-sm) bg-(--color-primary)/6 px-3 py-2 text-sm font-medium text-(--color-primary)">
          {intervention.reference} — {intervention.label}
        </div>
      )}

      {/* Date */}
      <Field label="Date" htmlFor="ts-date">
        <input
          id="ts-date"
          type="date"
          value={date}
          min={dateMin}
          max={dateMax}
          onChange={(e) => setDate(e.target.value)}
          disabled={isBusy}
          className={inputClass}
        />
      </Field>

      {/* Heure début / fin */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Heure de début" htmlFor="ts-start">
          <input
            id="ts-start"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={isBusy}
            aria-invalid={rangeError !== null}
            className={inputClass}
          />
          <PresetButtons
            presets={[...startTimePresets, 'maintenant']}
            onPick={(v) => setStartTime(v === 'maintenant' ? nowTimeInput() : v)}
          />
        </Field>
        <Field label="Heure de fin" htmlFor="ts-end">
          <input
            id="ts-end"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            disabled={isBusy}
            aria-invalid={rangeError !== null}
            className={inputClass}
          />
          <PresetButtons
            presets={[...endTimePresets, 'maintenant']}
            onPick={(v) => setEndTime(v === 'maintenant' ? nowTimeInput() : v)}
          />
        </Field>
      </div>

      {rangeError && (
        <p role="alert" className="mt-1 text-xs text-(--color-error)">
          ⚠ {rangeError}
        </p>
      )}

      {/* Pauses */}
      <div
        role="group"
        aria-label="Pauses"
        className="mt-4 rounded-(--radius) border border-dashed border-(--color-border) bg-[#fbfbf9] px-3 py-2.5"
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="text-(--color-accent)">
            <CoffeeIcon />
          </span>
          <h4 className="m-0 flex-1 text-[11px] tracking-wider text-(--color-muted) uppercase">
            Pauses ({breaks.length})
          </h4>
          <button
            type="button"
            onClick={addBreak}
            disabled={isBusy}
            className="inline-flex h-7 items-center gap-1 rounded-(--radius-sm) border border-(--color-border) bg-(--color-surface) px-2.5 text-xs font-medium text-(--color-accent) hover:bg-[#f5f5f0]"
          >
            <PlusIcon /> Ajouter
          </button>
        </div>

        {breaks.length === 0 ? (
          <p className="m-0 py-2 text-center text-xs text-(--color-muted)">
            Aucune pause — ajoutez-en si nécessaire.
          </p>
        ) : (
          <ul className="m-0 list-none space-y-2 p-0">
            {breaks.map((b) => {
              const err = breakErrors.get(b.id);
              return (
                <li key={b.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                  <div>
                    <label className="mb-1 block text-[11px] text-(--color-muted)">Début</label>
                    <input
                      type="time"
                      value={b.start}
                      onChange={(e) => updateBreak(b.id, { start: e.target.value })}
                      disabled={isBusy}
                      aria-invalid={Boolean(err)}
                      className="h-9 w-full rounded-(--radius-sm) border border-(--color-border) px-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-(--color-muted)">Fin</label>
                    <input
                      type="time"
                      value={b.end}
                      onChange={(e) => updateBreak(b.id, { end: e.target.value })}
                      disabled={isBusy}
                      aria-invalid={Boolean(err)}
                      className="h-9 w-full rounded-(--radius-sm) border border-(--color-border) px-2 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBreak(b.id)}
                    disabled={isBusy}
                    aria-label="Retirer cette pause"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-(--radius-sm) border border-(--color-border) text-(--color-muted) hover:border-(--color-error) hover:text-(--color-error)"
                  >
                    <TrashIcon />
                  </button>
                  {err && (
                    <p role="alert" className="col-span-3 -mt-1 text-[11px] text-(--color-error)">
                      ⚠ {err}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Calcul auto */}
      <div
        className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-(--radius) border border-(--color-primary)/20 bg-(--color-primary)/5 px-4 py-3"
        aria-live="polite"
      >
        <CalcCell label="Plage" value={totals ? formatHoursDecimal(totals.rangeMin / 60) : '—'} />
        <span className="text-(--color-border)">−</span>
        <CalcCell label="Pauses" value={totals ? formatHoursDecimal(totals.breaksMin / 60) : '—'} />
        <span className="text-(--color-border)">=</span>
        <CalcCell
          label="Total effectif"
          value={totals ? formatHoursDecimal(totals.effectiveHours) : '—'}
          highlight
        />
      </div>

      {/* Type + intervention */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Type de travail" htmlFor="ts-type">
          <select
            id="ts-type"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value as ProjectType)}
            disabled={isBusy || Boolean(intervention)}
            className={inputClass}
          >
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`Notes ${notes ? '' : '(optionnel)'}`} htmlFor="ts-notes">
          <input
            id="ts-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isBusy}
            placeholder="Observation…"
            className={inputClass}
          />
        </Field>
      </div>

      {submitError && (
        <div
          role="alert"
          className="mt-4 rounded-(--radius-sm) border border-[#f4c2c2] bg-[#fdecec] px-3 py-2 text-xs text-[#8a1c1c]"
        >
          ⚠ {submitError}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="h-11 rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-4 text-sm font-medium hover:bg-[#f8f8f5] disabled:opacity-50"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={isBusy || hasErrors}
          className="h-11 flex-1 rounded-(--radius) border border-(--color-primary) bg-(--color-primary) text-sm font-medium text-white hover:bg-(--color-primary-hover) disabled:opacity-60"
        >
          {submitting ? 'Enregistrement…' : 'Enregistrer la présence'}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  'h-11 w-full rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-3 text-sm focus:border-(--color-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15 disabled:cursor-not-allowed disabled:opacity-50';

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-(--color-text)">
        {label}
      </label>
      {children}
    </div>
  );
}

function PresetButtons({ presets, onPick }: { presets: string[]; onPick: (v: string) => void }) {
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {presets.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPick(p)}
          className="h-6 rounded-(--radius-pill) border border-(--color-border) bg-(--color-surface) px-2 text-[11px] text-(--color-text) hover:bg-(--color-primary)/8 hover:text-(--color-primary)"
        >
          {p === 'maintenant' ? 'Maintenant' : p}
        </button>
      ))}
    </div>
  );
}

function CalcCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] tracking-wider text-(--color-muted) uppercase">{label}</span>
      <span
        className={[
          'text-lg font-semibold tabular-nums',
          highlight ? 'text-(--color-primary)' : '',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  );
}
