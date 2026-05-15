/**
 * LeaveRequestList — Liste des congés (read-only, sync Odoo).
 * Spec : Phase0_Components/LeaveRequestList/LeaveRequestList_CHECKLIST.md
 */

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type LeaveStatusFilter = LeaveStatus | 'all';

export interface LeaveRequest {
  id: string;
  dateFrom: Date;
  dateTo: Date;
  days: number;
  leaveType?: string;
  reason?: string;
  status: LeaveStatus;
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface LeaveBalance {
  remainingDays: number;
  takenDays: number;
  pendingDays: number;
  year: number;
}

export interface LeaveRequestListProps {
  employeeId: string;
  requests: ReadonlyArray<LeaveRequest>;
  balance?: LeaveBalance;
  statusFilter?: LeaveStatusFilter;
  onFilterChange?: (filter: LeaveStatusFilter) => void;
  showFilters?: boolean;
  showBalance?: boolean;
  onItemClick?: (request: LeaveRequest) => void;
  loading?: boolean;
  syncUnavailable?: boolean;
  lastSyncAt?: Date;
  ariaLabel?: string;
  className?: string;
}

export const LEAVE_LIST_DEFAULTS = {
  statusFilter: 'all' as LeaveStatusFilter,
  showFilters: true,
  showBalance: true,
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Refusé',
};
