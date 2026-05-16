/**
 * Module Fumure — bilan azoté humique selon norme suisse OEngrais 2024
 * (Suisse-Bilanz). Calcule pour chaque parcelle/campagne :
 *   - besoins N/P/K de la culture (besoins théoriques × surface)
 *   - apports cumulés N/P/K (depuis le Carnet, en tenant compte des coefficients
 *     d'équivalence des amendements organiques)
 *   - solde par élément (reste à apporter)
 *   - statut global (sous-fertilisé / équilibré / sur-fertilisé)
 *   - bonus précédent cultural (résidus N)
 */

export type NutrientElement = 'N' | 'P' | 'K';

/** Besoins théoriques d'une culture (kg/ha). */
export interface CultureNeeds {
  /** Culture (cohérent avec catalogue Agridéa). */
  culture: string;
  nKgHa: number;
  pKgHa: number; // P₂O₅
  kKgHa: number; // K₂O
  /** Notes (rendement de référence, situation moyenne, etc.). */
  notes?: string;
}

/** Effet azoté résiduel de la culture précédente (kg N/ha). */
export interface PreviousCropEffect {
  /** Libellé de la culture précédente. */
  culture: string;
  /** Apport résiduel d'azote (positif = restitue N au sol). */
  residualNKgHa: number;
  /** Notes (saison de destruction, biomasse, etc.). */
  notes?: string;
}

/** Saison d'application (pour coefficients d'efficacité organique). */
export type ApplicationSeason = 'printemps' | 'été' | 'automne' | 'hiver';

/**
 * Coefficient d'efficacité azoté pour un amendement organique.
 * Indique la fraction du N total qui est disponible la 1re année.
 *
 * Sources : OEngrais 2024, fiches Agridéa.
 *   - Lisier bovin printemps : 0.5
 *   - Lisier bovin automne   : 0.3
 *   - Fumier bovin frais     : 0.4
 *   - Fumier composté        : 0.25
 *   - Compost                : 0.15
 *   - Engrais minéral        : 1.0 (référence)
 */
export interface OrganicEfficiency {
  productCategory: 'mineral' | 'lisier' | 'fumier-frais' | 'fumier-composté' | 'compost';
  season: ApplicationSeason;
  coef: number;
}

/** Synthèse du bilan de fumure pour une parcelle/campagne. */
export interface FumureBalance {
  culture: string;
  surfaceHa: number;
  campaign: number;

  /** Besoins théoriques pour la parcelle entière (kg). */
  needs: { nKg: number; pKg: number; kKg: number };

  /** Apports cumulés disponibles (après coefficients organiques) (kg). */
  applied: { nKg: number; pKg: number; kKg: number };

  /** Apports bruts (sans coefficient, juste somme des entrées Carnet) (kg). */
  appliedRaw: { nKg: number; pKg: number; kKg: number };

  /** Bonus azoté du précédent cultural (kg N pour la parcelle). */
  previousCropResidualN: number;

  /** Reste à apporter (kg, peut être négatif si sur-fertilisé). */
  remaining: { nKg: number; pKg: number; kKg: number };

  /** Couverture (apports / besoins) par élément, en pourcentage. */
  coverage: { n: number; p: number; k: number };

  /** Statut global basé sur N (élément critique pour les céréales). */
  status: 'sous-fertilisé' | 'équilibré' | 'sur-fertilisé';
}

/** Recommandation d'apport selon stade BBCH (window). */
export interface ApplicationWindow {
  bbchStart: number;
  bbchEnd: number;
  label: string;
  nKgHa: { min: number; max: number };
  notes?: string;
}
