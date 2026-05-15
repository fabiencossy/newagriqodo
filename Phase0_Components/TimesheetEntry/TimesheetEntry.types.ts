/**
 * TimesheetEntry — Form de saisie d'heures travaillées.
 *
 * Deux modes :
 *  - 'total'    : volume horaire HH:MM ou décimal.
 *  - 'presence' : heure de début + heure de fin + pauses → calcul auto du total effectif.
 *
 * Dans les deux cas, le submit crée :
 *  - 1 Attendance Odoo (hr.attendance) — Hook 1.
 *  - 1 Timesheet entry (account.analytic.line) si lié à une intervention.
 */

export type ProjectType = 'Parcellaire' | 'Travaux' | 'Troupeau' | 'RH';

export const PROJECT_TYPES: ReadonlyArray<ProjectType> = [
  'Parcellaire',
  'Travaux',
  'Troupeau',
  'RH',
];

export type EntryMode = 'total' | 'presence';

/** Une pause au sein d'une présence. */
export interface BreakPeriod {
  /** ID stable (Phase 1 : `crypto.randomUUID()`). */
  id: string;
  /** Heure de début (HH:MM). */
  start: string;
  /** Heure de fin (HH:MM). */
  end: string;
  /** Catégorie optionnelle (pause repas, café, technique…). */
  kind?: 'meal' | 'short' | 'technical' | 'other';
}

/** Données d'entrée communes (envoyées à `onSubmit`). */
export interface TimesheetEntryInput {
  /** Date du travail (jour, sans heure). */
  date: Date;
  /** Mode utilisé pour la saisie. */
  mode: EntryMode;
  /** Heures effectives en décimal (calculées si mode='presence'). */
  hoursWorked: number;

  /** Mode 'presence' uniquement : heure de début (HH:MM). */
  startTime?: string;
  /** Mode 'presence' uniquement : heure de fin (HH:MM). */
  endTime?: string;
  /** Mode 'presence' uniquement : pauses. */
  breaks?: BreakPeriod[];

  /** Catégorie de travail. */
  projectType: ProjectType;
  /** ID Odoo de l'intervention si lié (project.task). */
  interventionId?: string;
  /** Notes optionnelles. */
  notes?: string;
}

export interface TimesheetSuggestion {
  id: string;
  reference: string;
  label: string;
  projectType: ProjectType;
}

export interface TimesheetEntryProps {
  /** Callback de soumission. Doit créer l'Attendance Odoo + persistance locale. */
  onSubmit: (entry: TimesheetEntryInput) => Promise<void>;
  /** Callback d'annulation. */
  onCancel?: () => void;

  /** Mode initial. Défaut 'total'. */
  defaultMode?: EntryMode;
  /** Verrouille le mode (cache le toggle). */
  lockedMode?: EntryMode;

  /** Mode 'linked' : intervention pré-remplie. */
  intervention?: TimesheetSuggestion;
  /** Date initiale. Défaut : aujourd'hui. */
  defaultDate?: Date;
  /** Heures par défaut (mode total). */
  defaultHours?: number;
  /** Présence par défaut (mode présence). */
  defaultPresence?: {
    startTime: string;
    endTime: string;
    breaks?: BreakPeriod[];
  };

  /** Heures maximum par jour. Défaut 16. */
  maxHoursPerDay?: number;
  /** Nombre de jours dans le passé autorisés. Défaut 90. */
  maxPastDays?: number;
  /** Autoriser les dates futures. Défaut false. */
  allowFutureDates?: boolean;
  /** Plage de nuit (chevauchant minuit) autorisée. Défaut false. */
  allowOvernight?: boolean;

  /** Pause minimum (en minutes) — sous ce seuil, la pause est rejetée. Défaut 5. */
  minBreakMinutes?: number;
  /** Pause maximum (en minutes). Défaut 480 (8h). */
  maxBreakMinutes?: number;

  /** Source pour l'autocomplete intervention (mode standalone). */
  fetchSuggestions?: (query: string) => Promise<TimesheetSuggestion[]>;

  /** État loading externe (submit en cours). */
  loading?: boolean;
  /** Identifiant ARIA. */
  ariaLabel?: string;
  /** Classe CSS optionnelle. */
  className?: string;
}

export const TIMESHEET_DEFAULTS = {
  defaultMode: 'total' as EntryMode,
  maxHoursPerDay: 16,
  maxPastDays: 90,
  allowFutureDates: false,
  allowOvernight: false,
  minBreakMinutes: 5,
  maxBreakMinutes: 480,
} as const;

/* ============================================================
 * Helpers
 * ============================================================ */

/**
 * Parse une saisie HH:MM ou décimal vers un nombre d'heures décimal.
 */
export function parseHoursInput(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const colon = /^(\d{1,2}):([0-5]\d)$/.exec(trimmed);
  if (colon) {
    return Number.parseInt(colon[1], 10) + Number.parseInt(colon[2], 10) / 60;
  }
  const decimal = /^(\d+)([.,]\d{1,2})?$/.exec(trimmed);
  if (decimal) {
    const value = Number.parseFloat(trimmed.replace(',', '.'));
    return Number.isFinite(value) ? value : null;
  }
  return null;
}

/** Formate un nombre décimal en HH:MM (négatif → préfixe −). */
export function formatHoursDecimal(decimalHours: number): string {
  const sign = decimalHours < 0 ? '−' : '';
  const abs = Math.abs(decimalHours);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `${sign}${h}:${m.toString().padStart(2, '0')}`;
}

/** Convertit "HH:MM" en minutes depuis minuit. */
export function timeStringToMinutes(time: string): number | null {
  const m = /^(\d{1,2}):([0-5]\d)$/.exec(time.trim());
  if (!m) return null;
  return Number.parseInt(m[1], 10) * 60 + Number.parseInt(m[2], 10);
}

/** Durée en minutes entre deux HH:MM. Gère l'overnight si `allowOvernight`. */
export function durationMinutes(
  start: string,
  end: string,
  allowOvernight = false,
): number | null {
  const s = timeStringToMinutes(start);
  const e = timeStringToMinutes(end);
  if (s === null || e === null) return null;
  if (e >= s) return e - s;
  return allowOvernight ? 24 * 60 - s + e : null;
}

/** Vérifie qu'une pause est valide (fin > début + min duration). */
export function validateBreak(
  b: BreakPeriod,
  minMinutes: number,
  maxMinutes: number,
): { ok: true } | { ok: false; reason: string } {
  const d = durationMinutes(b.start, b.end);
  if (d === null) return { ok: false, reason: 'La fin doit être après le début.' };
  if (d < minMinutes) return { ok: false, reason: `Pause trop courte (< ${minMinutes} min).` };
  if (d > maxMinutes) return { ok: false, reason: `Pause trop longue (> ${maxMinutes} min).` };
  return { ok: true };
}

/** Vérifie que des pauses ne se chevauchent pas entre elles. */
export function findOverlappingBreaks(
  breaks: ReadonlyArray<BreakPeriod>,
): Array<[BreakPeriod, BreakPeriod]> {
  const overlaps: Array<[BreakPeriod, BreakPeriod]> = [];
  for (let i = 0; i < breaks.length; i++) {
    for (let j = i + 1; j < breaks.length; j++) {
      const a = breaks[i];
      const b = breaks[j];
      const aS = timeStringToMinutes(a.start);
      const aE = timeStringToMinutes(a.end);
      const bS = timeStringToMinutes(b.start);
      const bE = timeStringToMinutes(b.end);
      if (aS === null || aE === null || bS === null || bE === null) continue;
      if (aS < bE && bS < aE) overlaps.push([a, b]);
    }
  }
  return overlaps;
}

/**
 * Calcule le total d'heures effectives en mode présence.
 * Retourne null si une donnée est invalide.
 */
export function computePresenceHours(
  startTime: string,
  endTime: string,
  breaks: ReadonlyArray<BreakPeriod>,
  allowOvernight = false,
): { rangeMin: number; breaksMin: number; effectiveHours: number } | null {
  const rangeMin = durationMinutes(startTime, endTime, allowOvernight);
  if (rangeMin === null) return null;
  let breaksMin = 0;
  for (const b of breaks) {
    const d = durationMinutes(b.start, b.end);
    if (d === null || d < 0) return null;
    breaksMin += d;
  }
  const effectiveMin = rangeMin - breaksMin;
  return {
    rangeMin,
    breaksMin,
    effectiveHours: Math.max(0, effectiveMin) / 60,
  };
}
