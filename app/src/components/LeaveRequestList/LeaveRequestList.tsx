import { useMemo } from 'react';
import {
  LEAVE_LIST_DEFAULTS,
  LEAVE_STATUS_LABELS,
  type LeaveRequest,
  type LeaveRequestListProps,
  type LeaveStatus,
  type LeaveStatusFilter,
} from './LeaveRequestList.types';

export function LeaveRequestList({
  requests,
  balance,
  statusFilter = LEAVE_LIST_DEFAULTS.statusFilter,
  onFilterChange,
  showFilters = LEAVE_LIST_DEFAULTS.showFilters,
  showBalance = LEAVE_LIST_DEFAULTS.showBalance,
  onItemClick,
  loading = false,
  syncUnavailable = false,
  lastSyncAt,
  ariaLabel,
  className,
}: LeaveRequestListProps) {
  const counts = useMemo(() => countByStatus(requests), [requests]);
  const filtered = useMemo(() => {
    if (statusFilter === 'all') return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  return (
    <div
      className={[
        'rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5',
        className ?? '',
      ].join(' ')}
      aria-label={ariaLabel ?? 'Mes congés'}
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="m-0 text-base font-semibold">Mes congés</h3>
        {showBalance && balance && (
          <span className="inline-flex items-center gap-1.5 rounded-(--radius-pill) bg-(--color-primary)/10 px-3 py-1 text-xs font-medium text-(--color-primary)">
            <CalendarIcon /> {balance.remainingDays} j restants en {balance.year}
          </span>
        )}
      </header>

      {syncUnavailable && (
        <div
          role="alert"
          className="mb-3 rounded-(--radius) bg-[#fef3c7] px-3 py-2 text-xs text-[#78350f]"
        >
          ⚠ Sync RH indisponible.
          {lastSyncAt && (
            <>
              {' '}
              Données du <strong>{lastSyncAt.toLocaleString('fr-CH')}</strong>.
            </>
          )}
        </div>
      )}

      {showFilters && (
        <div
          role="tablist"
          aria-label="Filtrer par statut"
          className="mb-3 flex gap-0.5 rounded-(--radius) bg-[#f1f1ee] p-1"
        >
          <FilterTab
            label={`Tous (${requests.length})`}
            isActive={statusFilter === 'all'}
            onClick={() => onFilterChange?.('all')}
          />
          <FilterTab
            label={`En attente (${counts.pending})`}
            isActive={statusFilter === 'pending'}
            onClick={() => onFilterChange?.('pending')}
          />
          <FilterTab
            label={`Approuvés (${counts.approved})`}
            isActive={statusFilter === 'approved'}
            onClick={() => onFilterChange?.('approved')}
          />
          <FilterTab
            label={`Refusés (${counts.rejected})`}
            isActive={statusFilter === 'rejected'}
            onClick={() => onFilterChange?.('rejected')}
          />
        </div>
      )}

      {loading ? (
        <div aria-busy="true" className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[68px] animate-pulse rounded-(--radius) bg-[#eeeeea]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState statusFilter={statusFilter} />
      ) : (
        <ul className="m-0 list-none space-y-2 p-0">
          {filtered.map((r) => (
            <li key={r.id}>
              <LeaveItem request={r} onClick={onItemClick} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function countByStatus(requests: ReadonlyArray<LeaveRequest>) {
  const acc = { pending: 0, approved: 0, rejected: 0 };
  for (const r of requests) acc[r.status]++;
  return acc;
}

function FilterTab({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-pressed={isActive}
      onClick={onClick}
      className={[
        'h-8 flex-1 rounded-(--radius-sm) px-2.5 text-xs whitespace-nowrap',
        isActive
          ? 'bg-(--color-surface) font-medium shadow-(--shadow-card)'
          : 'text-(--color-text) hover:bg-black/5',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function LeaveItem({
  request,
  onClick,
}: {
  request: LeaveRequest;
  onClick?: (r: LeaveRequest) => void;
}) {
  const dateLabel = formatDateRange(request.dateFrom, request.dateTo);
  const Wrapper: keyof React.JSX.IntrinsicElements = onClick ? 'button' : 'div';
  return (
    <Wrapper
      {...(onClick ? { type: 'button' as const, onClick: () => onClick(request) } : {})}
      className={[
        'flex w-full flex-col gap-2 rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-3 text-left',
        'sm:flex-row sm:items-center',
        onClick ? 'cursor-pointer hover:bg-[#fbfbf9]' : '',
      ].join(' ')}
    >
      <div className="min-w-0 flex-1">
        <div className="font-semibold">{dateLabel}</div>
        {request.reason && <div className="text-xs text-(--color-muted)">{request.reason}</div>}
      </div>
      <div className="text-xs text-(--color-muted) tabular-nums">{request.days} j</div>
      <StatusBadge status={request.status} />
    </Wrapper>
  );
}

function StatusBadge({ status }: { status: LeaveStatus }) {
  const styles: Record<LeaveStatus, string> = {
    pending: 'bg-(--color-warning)/12 text-[#92400e]',
    approved: 'bg-(--color-success)/12 text-[#166534]',
    rejected: 'bg-(--color-error)/12 text-[#991b1b]',
  };
  return (
    <span
      className={[
        'inline-flex items-center gap-1 self-start rounded-(--radius-pill) px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase',
        styles[status],
      ].join(' ')}
    >
      {LEAVE_STATUS_LABELS[status]}
    </span>
  );
}

function EmptyState({ statusFilter }: { statusFilter: LeaveStatusFilter }) {
  const labels: Record<LeaveStatusFilter, string> = {
    all: 'Aucune demande pour le moment.',
    pending: 'Aucune demande en attente.',
    approved: 'Aucune demande approuvée.',
    rejected: 'Aucune demande refusée.',
  };
  return (
    <div className="px-3 py-8 text-center text-sm text-(--color-muted)">
      <p className="m-0 font-medium text-(--color-text)">{labels[statusFilter]}</p>
      <p className="m-0 mt-1 text-xs">
        Les demandes se font dans Odoo. Elles apparaîtront ici une fois soumises.
      </p>
    </div>
  );
}

function formatDateRange(from: Date, to: Date): string {
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
  const fmt = new Intl.DateTimeFormat('fr-CH', { day: 'numeric', month: 'long', year: 'numeric' });
  const dayMonth = new Intl.DateTimeFormat('fr-CH', { day: 'numeric' });
  if (sameMonth) {
    return `${dayMonth.format(from)} → ${fmt.format(to)}`;
  }
  return `${fmt.format(from)} → ${fmt.format(to)}`;
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={14}
      height={14}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
