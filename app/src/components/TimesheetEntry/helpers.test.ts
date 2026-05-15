import { describe, expect, it } from 'vitest';
import {
  computePresenceHours,
  findOverlappingBreaks,
  splitPresenceIntoAttendances,
  timeStringToMinutes,
  validateBreak,
} from './helpers';

describe('TimesheetEntry helpers', () => {
  it('parse "07:30" en 450 minutes', () => {
    expect(timeStringToMinutes('07:30')).toBe(450);
    expect(timeStringToMinutes('00:00')).toBe(0);
    expect(timeStringToMinutes('xx:yy')).toBeNull();
  });

  it('computePresenceHours soustrait correctement les pauses', () => {
    const result = computePresenceHours('07:30', '17:30', [
      { id: '1', start: '10:00', end: '10:15' },
      { id: '2', start: '12:00', end: '13:00' },
    ]);
    expect(result?.rangeMin).toBe(600); // 10h
    expect(result?.breaksMin).toBe(75); // 1h15
    expect(result?.effectiveHours).toBeCloseTo(8.75); // 8h45
  });

  it('splitPresenceIntoAttendances découpe en N segments', () => {
    const segments = splitPresenceIntoAttendances('07:30', '17:30', [
      { id: '1', start: '10:00', end: '10:15' },
      { id: '2', start: '12:00', end: '13:00' },
    ]);
    expect(segments).toHaveLength(3);
    expect(segments).toEqual([
      { start: '07:30', end: '10:00', durationMinutes: 150 },
      { start: '10:15', end: '12:00', durationMinutes: 105 },
      { start: '13:00', end: '17:30', durationMinutes: 270 },
    ]);
  });

  it('splitPresenceIntoAttendances retourne 1 seul segment si pas de pause', () => {
    const segments = splitPresenceIntoAttendances('08:00', '12:00', []);
    expect(segments).toHaveLength(1);
    expect(segments?.[0]).toMatchObject({ start: '08:00', end: '12:00' });
  });

  it('findOverlappingBreaks détecte les pauses qui se chevauchent', () => {
    const overlaps = findOverlappingBreaks([
      { id: '1', start: '10:00', end: '11:00' },
      { id: '2', start: '10:30', end: '11:30' },
    ]);
    expect(overlaps).toHaveLength(1);
  });

  it('validateBreak rejette une pause trop courte', () => {
    const v = validateBreak({ id: '1', start: '10:00', end: '10:02' }, 5, 480);
    expect(v.ok).toBe(false);
    expect(v.reason).toMatch(/trop courte/);
  });
});
