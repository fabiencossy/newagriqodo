/**
 * Utilisateurs de l'app Qodo Agri.
 *
 * En Phase 3, sera synchronisé avec :
 *   - Odoo `hr.employee` (référentiel employés exploitation)
 *   - Odoo `res.users` (comptes utilisateurs avec login)
 *
 * Pour l'instant, mocks Darval. Utilisé partout où un opérateur doit être
 * sélectionné (carnet des champs, RH, travaux…).
 */

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface AppUser {
  id: string;
  /** Nom usuel pour affichage : "F. Cossy" (initiale + nom). */
  displayName: string;
  /** Nom complet : "Fabien Cossy". */
  fullName: string;
  /** Email (pour login Phase 3). */
  email?: string;
  /** Rôle dans l'exploitation. */
  role: UserRole;
  /** Couleur d'avatar (chip / badge). */
  color: string;
  /** Initiales affichées dans l'avatar (max 2 lettres). */
  initials: string;
  /** Actif (false = ancien employé, conservé pour historique). */
  active: boolean;
  /** Lié à l'employé Odoo (hr.employee.id) — Phase 3. */
  odooEmployeeId?: number;
}
