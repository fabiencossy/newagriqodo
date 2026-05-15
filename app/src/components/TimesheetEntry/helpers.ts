import type { BreakPeriod } from './TimesheetEntry.types';

/** Convertit "HH:MM" en minutes depuis minuit. */
export function timeStringToMinutes(time: string): number | null {
  const m = /^(\d{1,2}):([0-5]\d)$/.exec(time.trim());
  if (!m) return null;
  return Number.parseInt(m[1]!, 10) * 60 + Number.parseInt(m[2]!, 10);
}

/** Convertit un nombre de minutes en "HH:MM". */
export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/** Durée en minutes entre start et end. */
export function durationMinutes(start: string, end: string, allowOvernight = false): number | null {
  const s = timeStringToMinutes(start);
  const e = timeStringToMinutes(end);
  if (s === null || e === null) return null;
  if (e >= s) return e - s;
  return allowOvernight ? 24 * 60 - s + e : null;
}

/** Format décimal d'heures vers "HH:MM" (avec signe pour le négatif). */
export function formatHoursDecimal(decimalHours: number): string {
  const sign = decimalHours < 0 ? '−' : '';
  const abs = Math.abs(decimalHours);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `${sign}${h}:${m.toString().padStart(2, '0')}`;
}

export interface BreakValidation {
  ok: boolean;
  reason?: string;
}

export function validateBreak(
  b: BreakPeriod,
  minMinutes: number,
  maxMinutes: number,
): BreakValidation {
  const d = durationMinutes(b.start, b.end);
  if (d === null) return { ok: false, reason: 'La fin doit être après le début.' };
  if (d < minMinutes) return { ok: false, reason: `Pause trop courte (< ${minMinutes} min).` };
  if (d > maxMinutes) return { ok: false, reason: `Pause trop longue (> ${maxMinutes} min).` };
  return { ok: true };
}

export function findOverlappingBreaks(
  breaks: ReadonlyArray<BreakPeriod>,
): Array<[BreakPeriod, BreakPeriod]> {
  const overlaps: Array<[BreakPeriod, BreakPeriod]> = [];
  for (let i = 0; i < breaks.length; i++) {
    for (let j = i + 1; j < breaks.length; j++) {
      const a = breaks[i]!;
      const b = breaks[j]!;
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

export function isBreakWithinRange(
  breakPeriod: BreakPeriod,
  startTime: string,
  endTime: string,
): boolean {
  const s = timeStringToMinutes(startTime);
  const e = timeStringToMinutes(endTime);
  const bS = timeStringToMinutes(breakPeriod.start);
  const bE = timeStringToMinutes(breakPeriod.end);
  if (s === null || e === null || bS === null || bE === null) return false;
  return bS >= s && bE <= e;
}

export interface PresenceTotals {
  rangeMin: number;
  breaksMin: number;
  effectiveHours: number;
}

export function computePresenceHours(
  startTime: string,
  endTime: string,
  breaks: ReadonlyArray<BreakPeriod>,
  allowOvernight = false,
): PresenceTotals | null {
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

export interface PresenceSegment {
  start: string;
  end: string;
  durationMinutes: number;
}

/**
 * Découpe une présence (start, end, pauses) en N segments continus.
 * Chaque segment = 1 `hr.attendance` Odoo.
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

  const sortedBreaks = [...breaks]
    .map((b) => {
      const s = timeStringToMinutes(b.start);
      const e = timeStringToMinutes(b.end);
      return s !== null && e !== null && e > s ? { s, e } : null;
    })
    .filter((x): x is { s: number; e: number } => x !== null)
    .sort((a, b) => a.s - b.s);

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

/** Crée un ID stable pour une nouvelle pause. */
export function makeBreakId(): string {
  return `brk-${Math.random().toString(36).slice(2, 10)}`;
}

/** Calcule la date min (passée) et max (aujourd'hui ou futur) pour l'input date. */
export function dateBounds(
  maxPastDays: number,
  allowFutureDates: boolean,
): { min: string; max?: string } {
  const today = new Date();
  const min = new Date(today);
  min.setDate(min.getDate() - maxPastDays);
  const minStr = min.toISOString().slice(0, 10);
  if (allowFutureDates) return { min: minStr };
  return { min: minStr, max: today.toISOString().slice(0, 10) };
}
