/**
 * Carnet des champs — registre des interventions par parcelle.
 *
 * Une intervention = une action datée et localisée (parcelle ou groupe de
 * parcelles) que l'agriculteur a réalisée. Source de vérité pour :
 *   - le bilan de fumure réel (somme des apports N/P/K)
 *   - le respect des délais d'attente phyto (Swiss Gap, AOP, Bio Suisse)
 *   - les exports vers Agridéa / GELAN / Acorda
 *   - la traçabilité (audit administration cantonale)
 */

/**
 * Catégorie d'intervention (haut niveau, enum stable utilisé pour le filtrage,
 * les couleurs et les icônes). Le `subType` (string libre) précise l'opération
 * exacte (ex. category='tillage', subType='plowing').
 */
export type InterventionCategory =
  | 'sowing' // semis, plantation
  | 'fertilization' // épandage minéral ou organique
  | 'phyto' // herbicide, fongicide, insecticide, régulateur
  | 'tillage' // travail du sol (labour, déchaumage, hersage, roulage)
  | 'cultural' // travaux culturaux (binage, sarclage, désherbage mécanique)
  | 'harvest' // moisson, récolte, ensilage, fauche, pressage
  | 'observation' // stade BBCH, dégât, maladie, ravageur
  | 'irrigation'
  | 'other';

export type FertilizationType = 'mineral' | 'organic' | 'amendment';
export type PhytoType =
  | 'herbicide'
  | 'fungicide'
  | 'insecticide'
  | 'growth-regulator'
  | 'molluscicide'
  | 'other';

export interface Intervention {
  id: string;
  parcelId: string;
  /** YYYY-MM-DD inclus. */
  date: string;
  category: InterventionCategory;
  /** Sous-type texte libre (ex: 'plowing', 'mowing', 'sowing'). Pour libellés UI. */
  subType?: string;

  /** Référence vers le catalogue produits (`Product.id`). Source de vérité. */
  productId?: string;
  /** Nom commercial du produit (cache d\'affichage du produit lié, ou saisie libre fallback). */
  productName?: string;
  /** Numéro d\'homologation OFAG (snapshot au moment de la saisie, pour traçabilité). */
  ofagNumber?: string;

  /** Surface effectivement traitée (ha). Vide = parcelle entière. */
  surfaceTreatedHa?: number;

  /** Dose appliquée + unité libre ('kg/ha', 'L/ha', 'kg', 'L', 'q/ha', 't/ha', 'unités'). */
  doseValue?: number;
  doseUnit?: string;

  /** Apports en kg/ha pour la fertilisation (somme = bilan de fumure). */
  nKgPerHa?: number;
  pKgPerHa?: number;
  kKgPerHa?: number;
  /** Précise mineral / organique / amendement pour les bilans. */
  fertilizationType?: FertilizationType;

  /** Type de phyto + délai d'attente (jours avant récolte). */
  phytoType?: PhytoType;
  withholdingDays?: number;

  /** Stade phénologique BBCH (0–99) si pertinent. */
  bbchStage?: number;

  /** Rendement (récolte) — valeur + unité libre ('kg/ha', 'q/ha', 't/ha'). */
  yieldValue?: number;
  yieldUnit?: string;

  /** Référence vers `AppUser.id` (utilisateur de l\'app). */
  operatorId?: string;
  /** Cache d\'affichage du nom de l\'opérateur. */
  operator?: string;

  /**
   * Durée du travail en heures décimales (ex: 1.5 = 1h30).
   * Pour calcul du temps passé par opérateur, coût de revient, et facturation
   * (module Travaux pour tiers — M11). À terme : créera automatiquement une
   * entrée `hr.attendance` Odoo si operatorId est renseigné.
   */
  durationHours?: number;

  /** Conditions météo libres ('ensoleillé', '15°C, vent faible NE'). */
  weather?: string;

  /** Notes libres. */
  notes?: string;
}
