/**
 * HoursTableMonth — Bilan heures travaillées vs heures dues par mois.
 * Spec : Phase0_Components/HoursTableMonth/HoursTableMonth_CHECKLIST.md
 */

export interface HoursMonthRow {
  month: number;
  monthName: string;
  hoursWorked: number;
  hoursDue: number;
  balance: number;
  leavesTaken?: number;
  isCurrentMonth?: boolean;
}

export interface HoursMonthYtd {
  hoursWorked: number;
  hoursDue: number;
  balance: number;
  leavesTaken?: number;
}

export type SortKey = 'month' | 'balance' | 'hoursWorked' | 'hoursDue';
export type SortDirection = 'ascending' | 'descending';

export interface HoursTableMonthProps {
  employeeId: string;
  year?: number;
  rows: ReadonlyArray<HoursMonthRow>;
  ytd?: HoursMonthYtd;
  onYearChange?: (year: number) => void;
  minYear?: number;
  maxYear?: number;
  sortBy?: SortKey;
  sortDirection?: SortDirection;
  onSortChange?: (key: SortKey, direction: SortDirection) => void;
  showLeavesColumn?: boolean;
  showYtdRow?: boolean;
  loading?: boolean;
  hoursFormat?: 'hhmm' | 'decimal';
  layout?: 'auto' | 'table' | 'cards';
  /** Affiche un cadre/wrapper autour du composant. Défaut true (rétrocompat). */
  bordered?: boolean;
  ariaLabel?: string;
  className?: string;
}

export const HOURS_TABLE_DEFAULTS = {
  showLeavesColumn: true,
  showYtdRow: true,
  hoursFormat: 'hhmm' as const,
  layout: 'auto' as const,
  minYear: 2020,
};

export function computeYtd(rows: ReadonlyArray<HoursMonthRow>): HoursMonthYtd {
  return rows.reduce<HoursMonthYtd>(
    (acc, r) => ({
      hoursWorked: acc.hoursWorked + r.hoursWorked,
      hoursDue: acc.hoursDue + r.hoursDue,
      balance: acc.balance + r.balance,
      leavesTaken: (acc.leavesTaken ?? 0) + (r.leavesTaken ?? 0),
    }),
    { hoursWorked: 0, hoursDue: 0, balance: 0, leavesTaken: 0 },
  );
}

export function formatHoursHhmm(decimalHours: number): string {
  const sign = decimalHours < 0 ? '−' : '';
  const abs = Math.abs(decimalHours);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `${sign}${h}:${m.toString().padStart(2, '0')}`;
}

export function formatBalance(decimalHours: number, format: 'hhmm' | 'decimal'): string {
  if (format === 'decimal') {
    const sign = decimalHours > 0 ? '+' : decimalHours < 0 ? '−' : '';
    return `${sign}${Math.abs(decimalHours).toFixed(2)}`;
  }
  const formatted = formatHoursHhmm(decimalHours);
  return decimalHours > 0 ? `+${formatted}` : formatted;
}
