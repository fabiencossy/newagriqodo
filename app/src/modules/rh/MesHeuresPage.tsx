import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../_shared/PageHeader';
import { FloatingActionButton } from '../_shared/FloatingActionButton';
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
      <PageHeader title="Mes heures" />
      <HoursTableMonth employeeId="emp-1" year={2026} rows={HOURS_DATA} />
      <FloatingActionButton label="Saisir une présence" onClick={() => navigate('/rh/saisir')} />
    </>
  );
}
