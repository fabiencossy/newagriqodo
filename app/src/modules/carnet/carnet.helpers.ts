import type { Intervention, InterventionCategory } from './carnet.types';

/** Libellés FR des catégories pour affichage UI. */
export const CATEGORY_LABELS: Record<InterventionCategory, string> = {
  sowing: 'Semis',
  fertilization: 'Fertilisation',
  phyto: 'Traitement phyto',
  tillage: 'Travail du sol',
  cultural: 'Travaux culturaux',
  harvest: 'Récolte',
  observation: 'Observation',
  irrigation: 'Irrigation',
  other: 'Autre',
};

/**
 * Libellés FR pour les sous-types d'opération (champ `subType` de Intervention).
 * Le subType reste neutre côté code (clé EN stable) ; ce mapping le francise
 * pour l'affichage UI. Tout subType absent du mapping est affiché tel quel,
 * mais devrait être ajouté ici dès qu'il devient récurrent.
 */
export const SUBTYPE_LABELS: Record<string, string> = {
  // Catégorie sowing
  sowing: 'Semis',
  planting: 'Plantation',
  // Catégorie fertilization
  mineral: 'Engrais minéral',
  organic: 'Engrais organique',
  amendment: 'Amendement',
  slurry: 'Lisier',
  manure: 'Fumier',
  // Catégorie phyto
  herbicide: 'Herbicide',
  fungicide: 'Fongicide',
  insecticide: 'Insecticide',
  'growth-regulator': 'Régulateur de croissance',
  // Catégorie tillage (travail du sol)
  plowing: 'Labour',
  stubble: 'Déchaumage',
  harrowing: 'Hersage',
  rolling: 'Roulage',
  subsoiling: 'Décompactage',
  // Catégorie cultural (travaux culturaux)
  hoeing: 'Binage',
  weeding: 'Désherbage manuel',
  'mechanical-weeding': 'Désherbage mécanique',
  // Catégorie harvest
  combine: 'Moisson',
  silage: 'Ensilage',
  mowing: 'Fauche',
  baling: 'Pressage',
  haymaking: 'Fenaison',
  // Catégorie observation
  growth: 'Suivi végétation',
  disease: 'Maladie observée',
  pest: 'Ravageur observé',
  damage: 'Dégât',
  bbch: 'Stade BBCH',
  // Catégorie irrigation
  sprinkler: 'Aspersion',
  drip: 'Goutte-à-goutte',
};

/** Affiche le subType en FR si connu, sinon retourne tel quel. */
export function subTypeLabel(subType: string | undefined): string | undefined {
  if (!subType) return undefined;
  return SUBTYPE_LABELS[subType] ?? subType;
}

/** Couleurs associées aux catégories (pour badges, dots, timeline). */
export const CATEGORY_COLORS: Record<InterventionCategory, string> = {
  sowing: '#16a34a', // vert (vie qui démarre)
  fertilization: '#a16207', // brun terre
  phyto: '#dc2626', // rouge (alerte / produit chimique)
  tillage: '#92400e', // brun foncé
  cultural: '#ca8a04', // jaune-or
  harvest: '#eab308', // jaune blé
  observation: '#0284c7', // bleu (notes / mesures)
  irrigation: '#0891b2', // cyan (eau)
  other: '#6b7280', // gris neutre
};

/**
 * Tri par date décroissante (plus récente en premier) — défaut UI.
 * Stable : préserve l'ordre d'insertion pour les égalités de date.
 */
export function sortByDateDesc(list: ReadonlyArray<Intervention>): Intervention[] {
  return [...list].sort((a, b) => b.date.localeCompare(a.date));
}

/** Filtre les interventions d'une parcelle, triées par date décroissante. */
export function getInterventionsForParcel(
  parcelId: string,
  list: ReadonlyArray<Intervention>,
): Intervention[] {
  return sortByDateDesc(list.filter((i) => i.parcelId === parcelId));
}

/**
 * Bilan de fumure réel (cumul des apports kg/ha sur la période).
 * Multiplie par la surface traitée pour obtenir des kg totaux.
 */
export function fertilizerSummary(
  interventions: ReadonlyArray<Intervention>,
  parcelSurfaceHa: number,
  options: { from?: string; to?: string } = {},
): { nKg: number; pKg: number; kKg: number; entries: number } {
  let nKg = 0;
  let pKg = 0;
  let kKg = 0;
  let entries = 0;
  for (const i of interventions) {
    if (i.category !== 'fertilization') continue;
    if (options.from && i.date < options.from) continue;
    if (options.to && i.date > options.to) continue;
    const treated = i.surfaceTreatedHa ?? parcelSurfaceHa;
    nKg += (i.nKgPerHa ?? 0) * treated;
    pKg += (i.pKgPerHa ?? 0) * treated;
    kKg += (i.kKgPerHa ?? 0) * treated;
    entries++;
  }
  return {
    nKg: Math.round(nKg),
    pKg: Math.round(pKg),
    kKg: Math.round(kKg),
    entries,
  };
}

/**
 * Vérifie si une parcelle est en délai d'attente phyto à la date `at`.
 * Renvoie l'intervention bloquante (la plus récente avec délai non écoulé)
 * ou undefined si aucune.
 */
export function isUnderWithholding(
  interventions: ReadonlyArray<Intervention>,
  at: string,
): Intervention | undefined {
  for (const i of sortByDateDesc(interventions)) {
    if (i.category !== 'phyto' || !i.withholdingDays) continue;
    const limit = addDaysISO(i.date, i.withholdingDays);
    if (at <= limit) return i;
  }
  return undefined;
}

function addDaysISO(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Liste les années avec au moins une intervention (récente d'abord). */
export function getInterventionYears(list: ReadonlyArray<Intervention>): number[] {
  const years = new Set<number>();
  for (const i of list) years.add(Number(i.date.slice(0, 4)));
  return [...years].sort((a, b) => b - a);
}
