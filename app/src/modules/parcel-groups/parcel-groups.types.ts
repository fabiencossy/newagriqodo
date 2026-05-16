/**
 * Groupes de parcelles — regroupement nommé avec période de validité.
 *
 * Permet de pré-définir des "blocs" de parcelles travaillées ensemble
 * (ex. "Bloc Pierraz Nord", "Prairies Sud") avec une période active.
 *
 * Usages :
 *   - Pré-sélection rapide dans InterventionForm (1 clic = N parcelles)
 *   - Clic sur la carte sur une parcelle d'un groupe actif → propose le groupe entier
 *   - Statistiques agrégées par groupe (Phase 3)
 *
 * En Phase 3, sera synchronisé avec Odoo : modèle custom `agri.parcel.group`.
 */

export interface ParcelGroup {
  id: string;
  name: string;
  /** Description courte du groupe (motif, contexte). */
  description?: string;
  /** Ids des parcelles membres. */
  parcelIds: ReadonlyArray<string>;
  /** Période de validité du groupe. YYYY-MM-DD inclus. */
  startDate: string;
  endDate: string;
  /** Couleur du groupe (pour badges et chips). */
  color: string;
  /** Référence Odoo `agri.parcel.group.id` — Phase 3. */
  odooGroupId?: number;
}
