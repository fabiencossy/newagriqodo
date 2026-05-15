import { PARCELLES } from '../parcellaire/parcellaire.mocks';
import type { Assolement } from './assolement.types';

/**
 * Mocks Assolement : un assolement par parcelle pour la campagne courante
 * (dérivée du mock parcellaire) + une rotation simulée pour N-1 et N-2.
 *
 * Quand on remplacera par un fetch Odoo (`agri.assolement` ou équivalent),
 * la signature de `ASSOLEMENTS` ne change pas — seul l'origine des données change.
 */

const ROTATION: Record<string, string> = {
  Blé: 'Colza',
  Colza: 'Maïs',
  Maïs: 'Blé',
  Orge: 'Maïs',
};

function rotate(culture: string): string {
  if (culture === 'Jachère' || culture === 'Archivé') return culture;
  return ROTATION[culture] ?? culture;
}

function previousYearSowing(culture: string, year: number): string | undefined {
  if (culture === 'Jachère' || culture === 'Archivé') return undefined;
  // Cultures d'hiver (semées N-1 fin août / mi-octobre) vs printemps (semées N en mars/avril).
  if (culture === 'Colza') return `${year - 1}-08-25`;
  if (culture === 'Orge') return `${year - 1}-10-12`;
  if (culture === 'Maïs') return `${year}-04-22`;
  if (culture === 'Blé') return `${year}-03-12`;
  return undefined;
}

export const ASSOLEMENTS: ReadonlyArray<Assolement> = PARCELLES.flatMap((p) => {
  const currentYear = p.year;
  const currentCulture = p.culture ?? 'Jachère';

  const current: Assolement = {
    id: `AS-${p.id}-${currentYear}`,
    parcelId: p.id,
    year: currentYear,
    culture: currentCulture,
    varietyName: p.varietyName,
    sowingDate: p.sowingDate || undefined,
  };

  const cultureN1 = rotate(currentCulture);
  const previous: Assolement = {
    id: `AS-${p.id}-${currentYear - 1}`,
    parcelId: p.id,
    year: currentYear - 1,
    culture: cultureN1,
    sowingDate: previousYearSowing(cultureN1, currentYear - 1),
  };

  const cultureN2 = rotate(cultureN1);
  const earlier: Assolement = {
    id: `AS-${p.id}-${currentYear - 2}`,
    parcelId: p.id,
    year: currentYear - 2,
    culture: cultureN2,
    sowingDate: previousYearSowing(cultureN2, currentYear - 2),
  };

  return [current, previous, earlier];
});
