/**
 * LeaveRequestList — Liste des congés synchronisés depuis Odoo (read-only).
 */

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type LeaveStatusFilter = LeaveStatus | 'all';

export interface LeaveRequest {
  /** ID Odoo (hr.leave). */
  id: string;
  /** Date de début (inclusive). */
  dateFrom: Date;
  /** Date de fin (inclusive). */
  dateTo: Date;
  /** Nombre de jours décomptés. */
  days: number;
  /** Type de congé (Odoo : hr.leave.type). */
  leaveType?: string;
  /** Motif renseigné par l'employé. */
  reason?: string;
  /** Statut courant. */
  status: LeaveStatus;
  /** Date de création de la demande. */
  createdAt: Date;
  /** Date d'approbation (si applicable). */
  approvedAt?: Date;
  /** Nom de l'approbateur (sans commentaire). */
  approvedBy?: string;
}

export interface LeaveBalance {
  /** Jours restants pour l'année en cours. */
  remainingDays: number;
  /** Jours déjà pris cette année. */
  takenDays: number;
  /** Jours en attente d'approbation. */
  pendingDays: number;
  /** Année de référence. */
  year: number;
}

export interface LeaveRequestListProps {
  /** ID employé (pour fetch côté parent). */
  employeeId: string;
  /** Demandes à afficher (controlled). */
  requests: ReadonlyArray<LeaveRequest>;
  /** Solde annuel optionnel (affiché en pill en haut). */
  balance?: LeaveBalance;
  /** Filtre actif (controlled). Défaut 'all'. */
  statusFilter?: LeaveStatusFilter;
  /** Callback de changement de filtre. */
  onFilterChange?: (filter: LeaveStatusFilter) => void;
  /** Affiche les filtres par statut. Défaut true. */
  showFilters?: boolean;
  /** Affiche le solde annuel. Défaut true. */
  showBalance?: boolean;
  /** Callback de clic sur une demande (ouvre détail). Optionnel. */
  onItemClick?: (request: LeaveRequest) => void;
  /** État loading. */
  loading?: boolean;
  /** Indique sync Odoo indisponible (affiche bannière). */
  syncUnavailable?: boolean;
  /** Date de dernière synchronisation réussie (pour bannière). */
  lastSyncAt?: Date;
  /** Identifiant ARIA. */
  ariaLabel?: string;
  /** Classe CSS optionnelle. */
  className?: string;
}

export const LEAVE_LIST_DEFAULTS = {
  statusFilter: 'all' as LeaveStatusFilter,
  showFilters: true,
  showBalance: true,
} as const;

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Refusé',
};
