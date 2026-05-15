/**
 * Un segment d'assolement = une culture sur une période continue.
 *
 * Une parcelle (entité géographique stable) porte N segments dans le temps :
 * - Blé semé 12/03/2026 → récolté 31/07/2026
 * - Jachère 01/08/2026 → 31/12/2026 (interculture)
 * - Colza semé 25/08/2026 → récolté 15/07/2027
 * - ...
 *
 * Ce sont les segments qui pilotent la couleur de la parcelle sur la carte
 * (couleur du segment actif à l'instant T) et l'affichage du Plan d'assolement
 * (culture dominante en durée pour la campagne sélectionnée, timeline 12 mois).
 */
export interface AssolementSegment {
  id: string;
  parcelId: string;
  /** Libellé culture (cohérent avec le catalogue CULTURES). */
  culture: string;
  varietyName?: string;
  /** YYYY-MM-DD inclus. */
  startDate: string;
  /** YYYY-MM-DD inclus. */
  endDate: string;
  notes?: string;
  /** Segment futur prévu mais non réalisé. */
  planned?: boolean;
}
