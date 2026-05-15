import { useState } from 'react';
import { PageContainer } from '../_shared/PageContainer';
import { PageHeader } from '../_shared/PageHeader';
import { TimesheetEntry } from '../../components/TimesheetEntry';
import { HoursTableMonth, type HoursMonthRow } from '../../components/HoursTableMonth';
import { LeaveRequestList, type LeaveStatusFilter } from '../../components/LeaveRequestList';

const HOURS_DATA: HoursMonthRow[] = [
  { month: 1, monthName: 'Janvier', hoursWorked: 150, hoursDue: 145, balance: 5, leavesTaken: 2 },
  { month: 2, monthName: 'Février', hoursWorked: 142, hoursDue: 140, balance: 2, leavesTaken: 0 },
  { month: 3, monthName: 'Mars', hoursWorked: 145, hoursDue: 145, balance: 0, leavesTaken: 0 },
  { month: 4, monthName: 'Avril', hoursWorked: 148, hoursDue: 145, balance: 3, leavesTaken: 1 },
  {
    month: 5,
    monthName: 'Mai',
    hoursWorked: 152,
    hoursDue: 147,
    balance: 5,
    leavesTaken: 0,
    isCurrentMonth: true,
  },
];

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

type Tab = 'timesheet' | 'hours' | 'leaves';

export default function RHPage() {
  const [tab, setTab] = useState<Tab>('timesheet');
  const [leaveFilter, setLeaveFilter] = useState<LeaveStatusFilter>('all');
  const [confirmation, setConfirmation] = useState<string | null>(null);

  return (
    <PageContainer>
      <PageHeader title="RH" subtitle="Mes heures, mes congés" />

      <div
        role="tablist"
        aria-label="Sections RH"
        className="mb-5 flex gap-1 rounded-(--radius) bg-[#f1f1ee] p-1"
      >
        <TabBtn label="Saisir" current={tab} value="timesheet" onPick={setTab} />
        <TabBtn label="Mes heures" current={tab} value="hours" onPick={setTab} />
        <TabBtn label="Mes congés" current={tab} value="leaves" onPick={setTab} />
      </div>

      {tab === 'timesheet' && (
        <>
          <TimesheetEntry
            onSubmit={async (entry) => {
              await new Promise((r) => setTimeout(r, 400));
              setConfirmation(
                `${entry.hoursWorked.toFixed(2)}h effectives · ${entry.breaks.length + 1} attendance(s) Odoo`,
              );
            }}
          />
          {confirmation && (
            <div
              role="status"
              className="mx-auto mt-3 max-w-xl rounded-(--radius) border border-[#c9e3bb] bg-[#ecf6e6] px-3 py-2 text-xs text-[#1a5e1a]"
            >
              ✓ Présence enregistrée · {confirmation}
            </div>
          )}
        </>
      )}

      {tab === 'hours' && <HoursTableMonth employeeId="emp-1" year={2026} rows={HOURS_DATA} />}

      {tab === 'leaves' && (
        <LeaveRequestList
          employeeId="emp-1"
          requests={LEAVES}
          balance={{ remainingDays: 12, takenDays: 8, pendingDays: 5, year: 2026 }}
          statusFilter={leaveFilter}
          onFilterChange={setLeaveFilter}
        />
      )}
    </PageContainer>
  );
}

function TabBtn({
  label,
  current,
  value,
  onPick,
}: {
  label: string;
  current: Tab;
  value: Tab;
  onPick: (t: Tab) => void;
}) {
  const isActive = current === value;
  return (
    <button
      type="button"
      role="tab"
      aria-pressed={isActive}
      onClick={() => onPick(value)}
      className={[
        'h-9 flex-1 rounded-(--radius-sm) px-3 text-sm sm:flex-initial sm:px-5',
        isActive
          ? 'bg-(--color-surface) font-medium shadow-(--shadow-card)'
          : 'text-(--color-text) hover:bg-black/5',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
