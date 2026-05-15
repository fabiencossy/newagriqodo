/**
 * TimesheetEntry — Saisie d'une présence : date + début + fin + pauses (0..N).
 * Spec : Phase0_Components/TimesheetEntry/TimesheetEntry_CHECKLIST.md
 *
 * Côté Odoo (Hook 1) : N `hr.attendance` créés via `splitPresenceIntoAttendances`
 * (1 par segment continu entre 2 timbrages). Les pauses ne sont PAS stockées.
 */

export type ProjectType = 'Parcellaire' | 'Travaux' | 'Troupeau' | 'RH';

export const PROJECT_TYPES: ReadonlyArray<ProjectType> = [
  'Parcellaire',
  'Travaux',
  'Troupeau',
  'RH',
];

export interface BreakPeriod {
  id: string;
  start: string; // "HH:MM"
  end: string;
  kind?: 'meal' | 'short' | 'technical' | 'other';
}

export interface TimesheetEntryInput {
  date: Date;
  startTime: string;
  endTime: string;
  breaks: BreakPeriod[];
  hoursWorked: number; // effectif décimal (plage - pauses)
  projectType: ProjectType;
  interventionId?: string;
  notes?: string;
}

export interface TimesheetSuggestion {
  id: string;
  reference: string;
  label: string;
  projectType: ProjectType;
}

export interface TimesheetEntryProps {
  onSubmit: (entry: TimesheetEntryInput) => Promise<void>;
  onCancel?: () => void;

  intervention?: TimesheetSuggestion;

  defaultDate?: Date;
  defaultStartTime?: string;
  defaultEndTime?: string;
  defaultBreaks?: BreakPeriod[];
  defaultProjectType?: ProjectType;

  maxHoursPerDay?: number;
  maxPastDays?: number;
  allowFutureDates?: boolean;
  allowOvernight?: boolean;

  minBreakMinutes?: number;
  maxBreakMinutes?: number;

  startTimePresets?: string[];
  endTimePresets?: string[];

  loading?: boolean;
  ariaLabel?: string;
  className?: string;
}

export const TIMESHEET_DEFAULTS = {
  defaultStartTime: '08:00',
  defaultEndTime: '17:00',
  defaultProjectType: 'Parcellaire' as ProjectType,
  maxHoursPerDay: 16,
  maxPastDays: 90,
  allowFutureDates: false,
  allowOvernight: false,
  minBreakMinutes: 5,
  maxBreakMinutes: 480,
  startTimePresets: ['07:00', '07:30', '08:00'],
  endTimePresets: ['12:00', '17:00', '18:00'],
};
