import { describe, expect, it } from 'vitest';
import {
  getActiveSegment,
  getAvailableYears,
  getDominantCulture,
  getSegmentsForParcelYear,
  segmentDaysInYear,
} from './assolement.helpers';
import type { AssolementSegment } from './assolement.types';
import { CULTURES, cultureByLabel, cultureColor, listCultureLabels } from './cultures';

const SEGS: AssolementSegment[] = [
  // Parcelle A — Blé 6 mois + Jachère 5 mois en 2026
  {
    id: 'A-2026-MAIN',
    parcelId: 'A',
    culture: 'Blé',
    startDate: '2026-03-01',
    endDate: '2026-08-31',
  },
  {
    id: 'A-2026-INTER',
    parcelId: 'A',
    culture: 'Jachère',
    startDate: '2026-09-01',
    endDate: '2026-12-31',
  },
  // Parcelle B — Colza chevauchant 2025 et 2026
  {
    id: 'B-2026-MAIN',
    parcelId: 'B',
    culture: 'Colza',
    startDate: '2025-08-25',
    endDate: '2026-07-15',
  },
];

describe('getSegmentsForParcelYear', () => {
  it("retourne les segments d'une parcelle qui intersectent l'année", () => {
    const list = getSegmentsForParcelYear('A', 2026, SEGS);
    expect(list.map((s) => s.id)).toEqual(['A-2026-MAIN', 'A-2026-INTER']);
  });

  it('inclut un segment qui chevauche deux années', () => {
    const list2025 = getSegmentsForParcelYear('B', 2025, SEGS);
    const list2026 = getSegmentsForParcelYear('B', 2026, SEGS);
    expect(list2025).toHaveLength(1);
    expect(list2026).toHaveLength(1);
    expect(list2025[0]?.id).toBe('B-2026-MAIN');
  });

  it('retourne tableau vide si aucun segment ne matche', () => {
    expect(getSegmentsForParcelYear('A', 2099, SEGS)).toEqual([]);
  });
});

describe('segmentDaysInYear', () => {
  it("compte les jours d'occupation dans l'année", () => {
    // Blé 01/03 → 31/08 = 31+30+31+30+31+31 = 184 jours
    const ble = SEGS[0]!;
    expect(segmentDaysInYear(ble, 2026)).toBe(184);
  });

  it("retourne 0 si le segment est entièrement hors de l'année", () => {
    expect(segmentDaysInYear(SEGS[0]!, 2099)).toBe(0);
  });

  it("ne compte que la portion intersectant l'année (segment à cheval)", () => {
    // Colza 25/08/2025 → 15/07/2026 ; portion 2025 = 25/08 → 31/12 = 7+30+31+30+31 = 129
    expect(segmentDaysInYear(SEGS[2]!, 2025)).toBe(129);
    // portion 2026 = 01/01 → 15/07 = 31+28+31+30+31+30+15 = 196
    expect(segmentDaysInYear(SEGS[2]!, 2026)).toBe(196);
  });
});

describe('getDominantCulture', () => {
  it('retourne la culture avec le plus de jours sur la campagne', () => {
    // Parcelle A en 2026 : Blé 184j vs Jachère 122j → Blé
    const d = getDominantCulture('A', 2026, SEGS);
    expect(d?.culture).toBe('Blé');
    expect(d?.days).toBe(184);
  });

  it('marche aussi avec des segments à cheval', () => {
    const d = getDominantCulture('B', 2026, SEGS);
    expect(d?.culture).toBe('Colza');
  });

  it("renvoie undefined si aucun segment dans l'année", () => {
    expect(getDominantCulture('A', 2099, SEGS)).toBeUndefined();
  });
});

describe('getActiveSegment', () => {
  it('retourne le segment qui contient la date donnée', () => {
    const s = getActiveSegment('A', '2026-05-15', SEGS);
    expect(s?.culture).toBe('Blé');
  });

  it("retourne undefined quand aucun segment n'inclut la date", () => {
    expect(getActiveSegment('A', '2099-01-01', SEGS)).toBeUndefined();
  });

  it('reconnaît les bornes inclusives', () => {
    expect(getActiveSegment('A', '2026-03-01', SEGS)?.culture).toBe('Blé');
    expect(getActiveSegment('A', '2026-08-31', SEGS)?.culture).toBe('Blé');
    expect(getActiveSegment('A', '2026-09-01', SEGS)?.culture).toBe('Jachère');
  });
});

describe('getAvailableYears', () => {
  it('couvre toutes les années traversées par au moins un segment', () => {
    expect(getAvailableYears(SEGS)).toEqual([2026, 2025]);
  });
});

describe('cultures catalog', () => {
  it('cultureColor mappe les libellés connus', () => {
    expect(cultureColor('Blé')).toBe('#f4a261');
    expect(cultureColor('Maïs')).toBe('#f59e0b');
    expect(cultureColor('Jachère')).toBe('#a3a380');
  });

  it('cultureColor fallback couleur grise pour culture inconnue', () => {
    expect(cultureColor('Quinoa')).toBe('#9ca3af');
    expect(cultureColor(undefined)).toBe('#9ca3af');
  });

  it('cultureByLabel est insensible à la casse', () => {
    expect(cultureByLabel('blé')?.key).toBe('wheat');
    expect(cultureByLabel('MAÏS')?.key).toBe('corn');
  });

  it('listCultureLabels exclut "archivé" (catégorie other)', () => {
    const labels = listCultureLabels();
    expect(labels).toContain('Blé');
    expect(labels).not.toContain('Archivé');
  });

  it('CULTURES contient au moins les cultures attendues', () => {
    const keys = CULTURES.map((c) => c.key);
    expect(keys).toEqual(expect.arrayContaining(['wheat', 'corn', 'rapeseed', 'barley', 'fallow']));
  });
});
