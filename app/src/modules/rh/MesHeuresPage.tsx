import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../_shared/PageHeader';
import { HoursTableMonth, type HoursMonthRow } from '../../components/HoursTableMonth';

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

export default function MesHeuresPage() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Mes heures"
        actions={
          <button
            type="button"
            onClick={() => navigate('/rh/saisir')}
            className="inline-flex h-10 items-center gap-2 rounded-(--radius) border border-(--color-primary) bg-(--color-primary) px-4 text-sm font-medium text-white hover:bg-(--color-primary-hover)"
          >
            <PlusIcon />
            <span>Saisir une présence</span>
          </button>
        }
      />
      <HoursTableMonth employeeId="emp-1" year={2026} rows={HOURS_DATA} />
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
