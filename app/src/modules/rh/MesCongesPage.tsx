import { useState } from 'react';
import { PageHeader } from '../_shared/PageHeader';
import { LeaveRequestList, type LeaveStatusFilter } from '../../components/LeaveRequestList';

const LEAVES = [
  {
    id: 'l1',
    dateFrom: new Date(2026, 4, 15),
    dateTo: new Date(2026, 4, 30),
    days: 12,
    reason: "Vacances d'été",
    status: 'approved' as const,
    createdAt: new Date(2026, 3, 1),
  },
  {
    id: 'l2',
    dateFrom: new Date(2026, 5, 1),
    dateTo: new Date(2026, 5, 7),
    days: 5,
    reason: 'Conférence métier',
    status: 'pending' as const,
    createdAt: new Date(2026, 4, 1),
  },
  {
    id: 'l3',
    dateFrom: new Date(2026, 7, 12),
    dateTo: new Date(2026, 7, 14),
    days: 3,
    reason: 'Raisons personnelles',
    status: 'rejected' as const,
    createdAt: new Date(2026, 5, 15),
  },
];

export default function MesCongesPage() {
  const [filter, setFilter] = useState<LeaveStatusFilter>('all');

  const handleRequest = () => {
    // En Phase 2.5 : ouvrir Odoo dans un nouvel onglet (URL configurable).
    // Pour l'instant, simple alerte.

    alert(
      "Les demandes de congés se font dans Odoo.\n\n(Ce bouton ouvrira Odoo dans un nouvel onglet une fois l'intégration finalisée.)",
    );
  };

  return (
    <>
      <PageHeader
        title="Mes congés"
        actions={
          <button
            type="button"
            onClick={handleRequest}
            className="inline-flex h-10 items-center gap-2 rounded-(--radius) border border-(--color-primary) bg-(--color-primary) px-4 text-sm font-medium text-white hover:bg-(--color-primary-hover)"
          >
            <PlusIcon />
            <span>Demander un congé</span>
          </button>
        }
      />
      <LeaveRequestList
        employeeId="emp-1"
        requests={LEAVES}
        balance={{ remainingDays: 12, takenDays: 8, pendingDays: 5, year: 2026 }}
        statusFilter={filter}
        onFilterChange={setFilter}
      />
    </>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={16}
      height={16}
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
