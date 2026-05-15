import type { Assolement } from './assolement.types';
import { ASSOLEMENTS } from './assolement.mocks';

/**
 * Renvoie l'assolement d'une parcelle pour une année donnée.
 * Fallback : si non trouvé sur l'année exacte, retourne le plus récent
 * antérieur (utile quand la rotation n'a pas encore été saisie).
 */
export function getCurrentAssolement(
  parcelId: string,
  year: number,
  list: ReadonlyArray<Assolement> = ASSOLEMENTS,
): Assolement | undefined {
  const exact = list.find((a) => a.parcelId === parcelId && a.year === year);
  if (exact) return exact;
  return list
    .filter((a) => a.parcelId === parcelId && a.year < year)
    .sort((a, b) => b.year - a.year)[0];
}

export function getAssolementsByYear(
  year: number,
  list: ReadonlyArray<Assolement> = ASSOLEMENTS,
): Assolement[] {
  return list.filter((a) => a.year === year);
}

export function getAvailableYears(list: ReadonlyArray<Assolement> = ASSOLEMENTS): number[] {
  return [...new Set(list.map((a) => a.year))].sort((a, b) => b - a);
}
