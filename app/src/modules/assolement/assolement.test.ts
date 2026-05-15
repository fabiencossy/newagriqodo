import { describe, expect, it } from 'vitest';
import {
  getAssolementsByYear,
  getAvailableYears,
  getCurrentAssolement,
} from './assolement.helpers';
import type { Assolement } from './assolement.types';
import { CULTURES, cultureByLabel, cultureColor, listCultureLabels } from './cultures';

const SAMPLE: Assolement[] = [
  { id: 'AS-A-2026', parcelId: 'A', year: 2026, culture: 'Blé' },
  { id: 'AS-A-2025', parcelId: 'A', year: 2025, culture: 'Colza' },
  { id: 'AS-A-2024', parcelId: 'A', year: 2024, culture: 'Maïs' },
  { id: 'AS-B-2026', parcelId: 'B', year: 2026, culture: 'Maïs' },
  { id: 'AS-B-2024', parcelId: 'B', year: 2024, culture: 'Blé' },
];

describe('getCurrentAssolement', () => {
  it("retourne l'assolement de l'année exacte", () => {
    const a = getCurrentAssolement('A', 2025, SAMPLE);
    expect(a?.culture).toBe('Colza');
  });

  it("fallback vers l'année précédente la plus récente quand non trouvé", () => {
    // Parcelle B n'a pas de 2025 → fallback sur 2024
    const a = getCurrentAssolement('B', 2025, SAMPLE);
    expect(a?.year).toBe(2024);
    expect(a?.culture).toBe('Blé');
  });

  it('renvoie undefined si parcelle inconnue', () => {
    expect(getCurrentAssolement('XYZ', 2026, SAMPLE)).toBeUndefined();
  });

  it('renvoie undefined si aucune année antérieure disponible', () => {
    // Parcelle A : 2024 est sa plus ancienne. Demander 2023 → rien.
    expect(getCurrentAssolement('A', 2023, SAMPLE)).toBeUndefined();
  });
});

describe('getAssolementsByYear', () => {
  it('filtre par année exacte', () => {
    const list = getAssolementsByYear(2026, SAMPLE);
    expect(list).toHaveLength(2);
    expect(list.map((a) => a.parcelId).sort()).toEqual(['A', 'B']);
  });

  it('retourne tableau vide si année inconnue', () => {
    expect(getAssolementsByYear(2099, SAMPLE)).toEqual([]);
  });
});

describe('getAvailableYears', () => {
  it('retourne les années uniques, plus récente en premier', () => {
    expect(getAvailableYears(SAMPLE)).toEqual([2026, 2025, 2024]);
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
