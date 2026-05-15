import { useState } from 'react';
import { PageHeader } from '../_shared/PageHeader';
import { FloatingActionButton } from '../_shared/FloatingActionButton';
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

    alert(
      "Les demandes de congés se font dans Odoo.\n\n(Ce bouton ouvrira Odoo dans un nouvel onglet une fois l'intégration finalisée.)",
    );
  };

  return (
    <>
      <PageHeader title="Mes congés" />
      <LeaveRequestList
        employeeId="emp-1"
        requests={LEAVES}
        balance={{ remainingDays: 12, takenDays: 8, pendingDays: 5, year: 2026 }}
        statusFilter={filter}
        onFilterChange={setFilter}
      />
      <FloatingActionButton label="Demander un congé" onClick={handleRequest} />
    </>
  );
}
