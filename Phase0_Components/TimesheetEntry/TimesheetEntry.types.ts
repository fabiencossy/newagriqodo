/**
 * TimesheetEntry — Form de saisie d'une présence.
 *
 * Modèle de saisie : heure de début + heure de fin + pauses (0 à N).
 * Une "pause" n'est PAS un objet métier — c'est simplement une absence de
 * timbrage entre deux périodes de présence. La saisie côté Qodo est juste
 * une ergonomie : on saisit la plage et les coupures, mais on stocke des
 * segments de présence continus.
 *
 * Transformation côté envoi Odoo (Hook 1) :
 *  - Une saisie 07:30 → 17:30 avec pauses 10:00-10:15 et 12:00-13:00
 *  - = 3 segments de présence : 07:30-10:00, 10:15-12:00, 13:00-17:30
 *  - = 3 enregistrements `hr.attendance` (1 par segment)
 *
 * Voir `splitPresenceIntoAttendances()` pour le helper qui fait la conversion.
 *
 * Pour les timesheets liés à une intervention (`interventionId`) :
 *  - 1 seul `account.analytic.line` avec `unit_amount = hoursWorked` (effectif total).
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

/** Segment continu de présence (entre 2 timbrages). */
export interface PresenceSegment {
  /** Heure de début (HH:MM) — début du timbrage. */
  start: string;
  /** Heure de fin (HH:MM) — fin du timbrage. */
  end: string;
  /** Durée en minutes. */
  durationMinutes: number;
}

/**
 * Découpe une présence (start, end, pauses) en N segments continus.
 *
 * Exemple :
 *   start = "07:30", end = "17:30"
 *   breaks = [{ start: "10:00", end: "10:15" }, { start: "12:00", end: "13:00" }]
 *   → [
 *     { start: "07:30", end: "10:00", durationMinutes: 150 },
 *     { start: "10:15", end: "12:00", durationMinutes: 105 },
 *     { start: "13:00", end: "17:30", durationMinutes: 270 },
 *   ]
 *
 * Chaque segment correspond à 1 `hr.attendance` Odoo (check_in / check_out).
 * Retourne null si une donnée est invalide.
 */
export function splitPresenceIntoAttendances(
  startTime: string,
  endTime: string,
  breaks: ReadonlyArray<BreakPeriod>,
): PresenceSegment[] | null {
  const presenceStart = timeStringToMinutes(startTime);
  const presenceEnd = timeStringToMinutes(endTime);
  if (presenceStart === null || presenceEnd === null) return null;
  if (presenceEnd <= presenceStart) return null;

  // Trier les pauses par début, en convertissant en minutes.
  const sortedBreaks = [...breaks]
    .map((b) => {
      const s = timeStringToMinutes(b.start);
      const e = timeStringToMinutes(b.end);
      return s !== null && e !== null && e > s ? { s, e } : null;
    })
    .filter((x): x is { s: number; e: number } => x !== null)
    .sort((a, b) => a.s - b.s);

  // Construire les segments en sautant les pauses.
  const segments: PresenceSegment[] = [];
  let cursor = presenceStart;
  for (const br of sortedBreaks) {
    if (br.s >= presenceEnd) break;
    if (br.e <= cursor) continue;
    const segStart = Math.max(cursor, presenceStart);
    const segEnd = Math.min(br.s, presenceEnd);
    if (segEnd > segStart) {
      segments.push({
        start: minutesToTimeString(segStart),
        end: minutesToTimeString(segEnd),
        durationMinutes: segEnd - segStart,
      });
    }
    cursor = Math.max(cursor, br.e);
  }
  if (cursor < presenceEnd) {
    segments.push({
      start: minutesToTimeString(cursor),
      end: minutesToTimeString(presenceEnd),
      durationMinutes: presenceEnd - cursor,
    });
  }
  return segments;
}

/** Convertit un nombre de minutes depuis minuit en "HH:MM". */
export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
