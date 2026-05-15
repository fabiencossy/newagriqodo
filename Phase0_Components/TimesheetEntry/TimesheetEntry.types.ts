/**
 * TimesheetEntry — Form de saisie d'une présence.
 *
 * Modèle unique : toujours heure de début + heure de fin + pauses (0 à N).
 * Le total effectif (en heures décimales) est calculé : `plage − pauses`.
 *
 * Submit → Hook 1 :
 *  - Persistance complète côté Qodo (start, end, breaks[], hoursWorked, …)
 *  - Côté Odoo : 1 seule `hr.attendance` (check_in = start, check_out = end).
 *    **Les pauses ne sont PAS envoyées à Odoo** — elles vivent uniquement dans Qodo.
 *  - Si `interventionId` → 1 `account.analytic.line` avec `unit_amount = hoursWorked`
 *    (effectif après déduction des pauses).
 *
 * Mapping user → employee : le user Qodo doit être lié à un `hr.employee` Odoo
 * via une table de mapping côté backend (non géré par ce composant).
 */

export type ProjectType = 'Parcellaire' | 'Travaux' | 'Troupeau' | 'RH';

export const PROJECT_TYPES: ReadonlyArray<ProjectType> = [
  'Parcellaire',
  'Travaux',
  'Troupeau',
  'RH',
];

/** Une pause au sein d'une présence. */
export interface BreakPeriod {
  /** ID stable (Phase 1 : `crypto.randomUUID()`). */
  id: string;
  /** Heure de début (HH:MM). */
  start: string;
  /** Heure de fin (HH:MM). */
  end: string;
  /** Catégorie optionnelle. */
  kind?: 'meal' | 'short' | 'technical' | 'other';
}

/** Données envoyées à `onSubmit`. */
export interface TimesheetEntryInput {
  /** Date du travail (jour, sans heure). */
  date: Date;
  /** Heure de début (HH:MM). */
  startTime: string;
  /** Heure de fin (HH:MM). */
  endTime: string;
  /** Pauses (0 à N). */
  breaks: BreakPeriod[];
  /** Heures effectives en décimal (calculées : plage − pauses). */
  hoursWorked: number;

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

  /** Mode 'linked' : intervention pré-remplie. */
  intervention?: TimesheetSuggestion;

  /** Date initiale. Défaut : aujourd'hui. */
  defaultDate?: Date;
  /** Heure de début initiale. Défaut : '08:00'. */
  defaultStartTime?: string;
  /** Heure de fin initiale. Défaut : '17:00'. */
  defaultEndTime?: string;
  /** Pauses initiales. Défaut : aucune. */
  defaultBreaks?: BreakPeriod[];

  /** Heures maximum par jour. Défaut 16. */
  maxHoursPerDay?: number;
  /** Nombre de jours dans le passé autorisés. Défaut 90. */
  maxPastDays?: number;
  /** Autoriser les dates futures. Défaut false. */
  allowFutureDates?: boolean;
  /** Plage de nuit (chevauchant minuit) autorisée. Défaut false. */
  allowOvernight?: boolean;

  /** Pause minimum (en minutes). Défaut 5. */
  minBreakMinutes?: number;
  /** Pause maximum (en minutes). Défaut 480 (8h). */
  maxBreakMinutes?: number;

  /** Raccourcis horaires de début/fin. */
  startTimePresets?: string[];
  endTimePresets?: string[];

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
  defaultStartTime: '08:00',
  defaultEndTime: '17:00',
  maxHoursPerDay: 16,
  maxPastDays: 90,
  allowFutureDates: false,
  allowOvernight: false,
  minBreakMinutes: 5,
  maxBreakMinutes: 480,
  startTimePresets: ['07:00', '07:30', '08:00'],
  endTimePresets: ['12:00', '17:00', '18:00'],
} as const;

/* ============================================================
 * Helpers
 * ============================================================ */

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

/** Vérifie qu'une pause est valide. */
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

/** Détecte les pauses qui se chevauchent entre elles. */
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

/** Vérifie qu'une pause est bien comprise dans la plage de présence. */
export function isBreakWithinRange(
  breakPeriod: BreakPeriod,
  startTime: string,
  endTime: string,
  allowOvernight = false,
): boolean {
  const s = timeStringToMinutes(startTime);
  const e = timeStringToMinutes(endTime);
  const bS = timeStringToMinutes(breakPeriod.start);
  const bE = timeStringToMinutes(breakPeriod.end);
  if (s === null || e === null || bS === null || bE === null) return false;
  if (allowOvernight) return true; // Logique overnight à raffiner Phase 1
  return bS >= s && bE <= e;
}

/**
 * Calcule le total d'heures effectives.
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
  return {
    rangeMin,
    breaksMin,
    effectiveHours: Math.max(0, rangeMin - breaksMin) / 60,
  };
}
