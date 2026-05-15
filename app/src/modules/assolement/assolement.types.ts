/**
 * Assolement = campagne agronomique d'une parcelle pour une année donnée.
 * Une parcelle (entité géographique stable) porte un assolement différent
 * par campagne : c'est cette entité qui pilote la culture, la variété,
 * les dates de semis/récolte — et donc la couleur de la parcelle sur la carte.
 */
export interface Assolement {
  /** Ex: AS-PF-001-2026 */
  id: string;
  parcelId: string;
  year: number;
  /** Libellé de culture (cohérent avec le catalogue CULTURES). */
  culture: string;
  varietyName?: string;
  sowingDate?: string;
  harvestDate?: string;
  notes?: string;
}
