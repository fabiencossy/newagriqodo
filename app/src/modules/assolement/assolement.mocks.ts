import { PARCELLES } from '../parcellaire/parcellaire.mocks';
import type { AssolementSegment } from './assolement.types';

/**
 * Mocks AssolementSegment : génération à partir de PARCELLES avec une logique
 * agronomique simple. Chaque parcelle a 3 campagnes (N-2, N-1, N) avec :
 *  - un segment principal (la culture)
 *  - un segment d'interculture (jachère) entre récolte et semis suivant
 *
 * Logique par culture :
 *  - Blé      : semé 12/03 → récolté 31/07
 *  - Maïs     : semé 22/04 → récolté 05/10
 *  - Orge     : semé 12/10 N-1 → récolté 15/07 N
 *  - Colza    : semé 25/08 N-1 → récolté 15/07 N
 *  - Jachère  : toute l'année
 *  - Archivé  : aucun segment
 *
 * À remplacer par un fetch Odoo (`agri.assolement.segment`) en Phase 3.
 */

const ROTATION: Record<string, string> = {
  "Blé d'automne": "Colza d'automne",
  "Colza d'automne": 'Maïs ensilage',
  'Maïs ensilage': "Blé d'automne",
  'Maïs grain': "Blé d'automne",
  "Orge d'automne": 'Maïs ensilage',
};

// Cultures pluriannuelles / non-rotatives : on garde la même d'une campagne à l'autre.
const NON_ROTATING = new Set([
  'Jachère',
  'Archivé',
  'Prairie temporaire',
  'Prairie naturelle',
  'Prairie extensive',
  'Pâturage',
  'Forêt',
  'Surface improductive',
]);

function rotate(culture: string): string {
  if (NON_ROTATING.has(culture)) return culture;
  return ROTATION[culture] ?? culture;
}

interface CultureWindow {
  /** YYYY-MM-DD calculé à partir de l'année de référence. */
  start: string;
  end: string;
}

/**
 * Retourne la fenêtre de présence d'une culture pour la campagne `year`.
 * Pour les cultures d'hiver (semées N-1), `start` est sur l'année précédente.
 */
function cultureWindow(culture: string, year: number): CultureWindow | undefined {
  switch (culture) {
    case "Blé d'automne":
      return { start: `${year - 1}-10-15`, end: `${year}-07-31` };
    case 'Blé de printemps':
      return { start: `${year}-03-12`, end: `${year}-07-31` };
    case 'Maïs ensilage':
      return { start: `${year}-04-22`, end: `${year}-10-05` };
    case 'Maïs grain':
      return { start: `${year}-04-25`, end: `${year}-10-25` };
    case "Orge d'automne":
      return { start: `${year - 1}-10-12`, end: `${year}-07-15` };
    case 'Orge de printemps':
      return { start: `${year}-03-15`, end: `${year}-07-25` };
    case "Colza d'automne":
      return { start: `${year - 1}-08-25`, end: `${year}-07-15` };
    case 'Jachère':
    case 'Prairie temporaire':
    case 'Prairie naturelle':
    case 'Prairie extensive':
    case 'Pâturage':
      // Cultures pluriannuelles : occupent toute la campagne.
      return { start: `${year}-01-01`, end: `${year}-12-31` };
    case 'Forêt':
    case 'Surface improductive':
      // Non-productif : aucun segment d'assolement à proprement parler.
      return undefined;
    default:
      return undefined;
  }
}

interface BuildSegmentsOptions {
  parcelId: string;
  culture: string;
  varietyName?: string;
  year: number;
}

function buildSegments(opts: BuildSegmentsOptions): AssolementSegment[] {
  const win = cultureWindow(opts.culture, opts.year);
  if (!win) return [];

  const main: AssolementSegment = {
    id: `AS-${opts.parcelId}-${opts.year}-MAIN`,
    parcelId: opts.parcelId,
    culture: opts.culture,
    varietyName: opts.varietyName,
    startDate: win.start,
    endDate: win.end,
  };

  // Interculture jachère : si la culture se termine avant le 31/12 de l'année
  // et qu'il n'y a pas immédiatement après une autre culture qui prend la suite,
  // on insère une jachère. On ne modélise pas la jachère pour la jachère elle-même.
  if (opts.culture === 'Jachère') return [main];

  // Pour simplifier, on ajoute une jachère entre fin de récolte et 31/12 de l'année courante.
  const nextDay = addDays(win.end, 1);
  if (compareDate(nextDay, `${opts.year}-12-31`) <= 0) {
    const interculture: AssolementSegment = {
      id: `AS-${opts.parcelId}-${opts.year}-INTER`,
      parcelId: opts.parcelId,
      culture: 'Jachère',
      startDate: nextDay,
      endDate: `${opts.year}-12-31`,
      notes: 'Interculture',
    };
    return [main, interculture];
  }
  return [main];
}

export const ASSOLEMENT_SEGMENTS: ReadonlyArray<AssolementSegment> = PARCELLES.flatMap((p) => {
  const currentYear = p.year;
  const currentCulture = p.culture ?? 'Jachère';
  const cultureN1 = rotate(currentCulture);
  const cultureN2 = rotate(cultureN1);

  return [
    ...buildSegments({
      parcelId: p.id,
      culture: currentCulture,
      varietyName: p.varietyName,
      year: currentYear,
    }),
    ...buildSegments({
      parcelId: p.id,
      culture: cultureN1,
      year: currentYear - 1,
    }),
    ...buildSegments({
      parcelId: p.id,
      culture: cultureN2,
      year: currentYear - 2,
    }),
  ];
});

/* ============ Utilitaires date (locaux pour éviter dep externes) ============ */

function compareDate(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
