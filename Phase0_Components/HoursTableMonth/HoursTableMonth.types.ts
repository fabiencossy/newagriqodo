/**
 * HoursTableMonth — Bilan heures travaillées vs heures dues par mois.
 */

export interface HoursMonthRow {
  /** Numéro de mois (1-12). */
  month: number;
  /** Nom localisé du mois (ex: "Janvier"). */
  monthName: string;
  /** Heures travaillées (décimal). */
  hoursWorked: number;
  /** Heures dues contractuellement (décimal). */
  hoursDue: number;
  /** Solde = hoursWorked - hoursDue. */
  balance: number;
  /** Jours de congés pris dans le mois (info). */
  leavesTaken?: number;
  /** Si le mois est en cours (affichage spécifique). */
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
  /** ID employé (utilisé par le data fetcher du parent). */
  employeeId: string;
  /** Année affichée. Défaut : année courante. */
  year?: number;
  /** Données mensuelles (controlled). Si omis, le parent doit gérer le fetch. */
  rows: ReadonlyArray<HoursMonthRow>;
  /** Total YTD calculé. Si omis, calculé depuis `rows`. */
  ytd?: HoursMonthYtd;
  /** Callback de changement d'année. */
  onYearChange?: (year: number) => void;
  /** Année minimale dans le year-picker. Défaut : 2020. */
  minYear?: number;
  /** Année maximale. Défaut : année courante. */
  maxYear?: number;
  /** Colonne de tri actuelle (controlled). */
  sortBy?: SortKey;
  /** Direction de tri. */
  sortDirection?: SortDirection;
  /** Callback changement de tri. */
  onSortChange?: (key: SortKey, direction: SortDirection) => void;
  /** Affiche la colonne "Congés pris". Défaut true. */
  showLeavesColumn?: boolean;
  /** Affiche la ligne YTD total. Défaut true. */
  showYtdRow?: boolean;
  /** État loading. */
  loading?: boolean;
  /** Format d'affichage des heures. Défaut 'hhmm' (150:00). 'decimal' = 150.5. */
  hoursFormat?: 'hhmm' | 'decimal';
  /** Forcer layout (sinon : auto). */
  layout?: 'auto' | 'table' | 'cards';
  /** Identifiant ARIA. */
  ariaLabel?: string;
  /** Classe CSS optionnelle. */
  className?: string;
}

export const HOURS_TABLE_DEFAULTS = {
  showLeavesColumn: true,
  showYtdRow: true,
  hoursFormat: 'hhmm' as const,
  layout: 'auto' as const,
  minYear: 2020,
} as const;

/** Calcule YTD depuis les rows. */
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

/** Formate des heures décimales en HH:MM (ex: 2.5 → "2:30"). */
export function formatHoursHhmm(decimalHours: number): string {
  const sign = decimalHours < 0 ? '−' : '';
  const abs = Math.abs(decimalHours);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `${sign}${h}:${m.toString().padStart(2, '0')}`;
}
