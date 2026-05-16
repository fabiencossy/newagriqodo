/**
 * Référentiel produits agricoles (phyto, engrais, semences).
 *
 * Source de vérité Phase 3 : Odoo `product.product` avec catégorie agri.
 * Le numéro d'homologation OFAG (Office fédéral de l'agriculture suisse)
 * est obligatoire pour les produits phyto utilisés en Suisse.
 *
 * Pour les engrais, la composition N/P/K (kg/100 kg) est utilisée par le
 * Plan de fumure pour calculer les apports réels selon la dose appliquée.
 */

export type ProductType = 'phyto' | 'fertilizer' | 'seed';

export type PhytoCategory =
  | 'herbicide'
  | 'fungicide'
  | 'insecticide'
  | 'growth-regulator'
  | 'molluscicide'
  | 'other';

export type FertilizerCategory = 'mineral' | 'organic' | 'amendment';

interface ProductBase {
  id: string;
  /** Nom commercial. */
  name: string;
  /** Type de produit (filtrage côté ProductSelect). */
  type: ProductType;
  /** Fabricant / fournisseur. */
  manufacturer?: string;
  /** Référence Odoo `product.product.id` — Phase 3. */
  odooProductId?: number;
  /** Produit actif au catalogue (false = retiré du marché). */
  active: boolean;
}

export interface PhytoProduct extends ProductBase {
  type: 'phyto';
  /** Catégorie phyto (auto-fill type du champ Intervention). */
  category: PhytoCategory;
  /** Numéro d'homologation OFAG (obligatoire Suisse). Ex: "W-7239" */
  ofagNumber: string;
  /** Substance active principale. */
  activeSubstance: string;
  /** Délai d'attente avant récolte (jours) — défaut, peut être surchargé. */
  withholdingDays: number;
  /** Unité de dose recommandée (L/ha, kg/ha, etc.). */
  defaultDoseUnit: string;
  /** Dose recommandée typique (info, modifiable lors de la saisie). */
  defaultDoseValue?: number;
  /** Cultures autorisées (sinon vide = toutes). */
  authorizedCrops?: ReadonlyArray<string>;
}

export interface FertilizerProduct extends ProductBase {
  type: 'fertilizer';
  category: FertilizerCategory;
  /**
   * Apport en kg d'élément par unité de dose (selon `defaultDoseUnit`).
   * Minéral en kg/ha : nPerUnit = fraction massique (ex. Ammonitrate 27% = 0.27).
   * Organique en m³/ha (lisier) : nPerUnit = kg N par m³ (ex. lisier bovin = 4.5).
   * Organique en t/ha (fumier) : nPerUnit = kg N par tonne (ex. fumier bovin = 5.5).
   * Permet le calcul direct : nKgPerHa = doseValue × nPerUnit.
   */
  nPerUnit: number;
  pPerUnit: number; // P₂O₅
  kPerUnit: number; // K₂O
  mgPerUnit?: number;
  sPerUnit?: number;
  defaultDoseUnit: string;
}

export interface SeedProduct extends ProductBase {
  type: 'seed';
  /** Culture (cohérent avec catalogue cultures). */
  cropName: string;
  /** Variété (Arnold, LG31.330, etc.). */
  varietyName: string;
  /** Dose recommandée (kg/ha pour céréales, grains/ha pour maïs). */
  defaultDoseValue?: number;
  defaultDoseUnit: string;
  /** Certifiée (semence certifiée = traçabilité). */
  certified: boolean;
}

export type Product = PhytoProduct | FertilizerProduct | SeedProduct;
