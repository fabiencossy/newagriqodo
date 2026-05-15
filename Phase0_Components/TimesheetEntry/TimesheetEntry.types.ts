/**
 * TimesheetEntry — Form de saisie d'heures travaillées.
 * Sur submit : création automatique d'une Attendance Odoo (Hook 1).
 */

export type ProjectType = 'Parcellaire' | 'Travaux' | 'Troupeau' | 'RH';

export const PROJECT_TYPES: ReadonlyArray<ProjectType> = [
  'Parcellaire',
  'Travaux',
  'Troupeau',
  'RH',
];

export interface TimesheetEntryInput {
  /** Date du travail (jour, sans heure). */
  date: Date;
  /** Heures en décimal (ex: 2.5 = 2h30). */
  hoursWorked: number;
  /** Catégorie de travail. */
  projectType: ProjectType;
  /** ID Odoo de l'intervention si lié (project.task). */
  interventionId?: string;
  /** Notes optionnelles. */
  notes?: string;
}

export interface TimesheetSuggestion {
  /** ID Odoo (project.task). */
  id: string;
  /** Référence affichée (ex: T-2026-042). */
  reference: string;
  /** Label complet. */
  label: string;
  /** Type de projet déduit. */
  projectType: ProjectType;
}

export interface TimesheetEntryProps {
  /** Callback de soumission. Doit créer l'Attendance Odoo + persistance locale. */
  onSubmit: (entry: TimesheetEntryInput) => Promise<void>;
  /** Callback d'annulation (ferme le form). */
  onCancel?: () => void;
  /** Mode 'standalone' : tous les champs visibles. 'linked' : intervention pré-remplie. */
  mode?: 'standalone' | 'linked';
  /** Intervention pré-remplie (mode 'linked'). */
  intervention?: TimesheetSuggestion;
  /** Date initiale. Défaut : aujourd'hui. */
  defaultDate?: Date;
  /** Heures maximum par jour. Défaut 16. */
  maxHoursPerDay?: number;
  /** Nombre de jours dans le passé autorisés. Défaut 90. */
  maxPastDays?: number;
  /** Autoriser les dates futures. Défaut false. */
  allowFutureDates?: boolean;
  /** Source pour l'autocomplete intervention (mode standalone). */
  fetchSuggestions?: (query: string) => Promise<TimesheetSuggestion[]>;
  /** État loading externe (submit en cours). */
  loading?: boolean;
  /** Identifiant ARIA du form. */
  ariaLabel?: string;
  /** Classe CSS optionnelle. */
  className?: string;
}

export const TIMESHEET_DEFAULTS = {
  mode: 'standalone' as const,
  maxHoursPerDay: 16,
  maxPastDays: 90,
  allowFutureDates: false,
} as const;

/**
 * Parse une saisie HH:MM ou décimal vers un nombre d'heures décimal.
 * "2:30" → 2.5, "2.5" → 2.5, "1:45" → 1.75.
 * Retourne null si invalide.
 */
export function parseHoursInput(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const colon = /^(\d{1,2}):([0-5]\d)$/.exec(trimmed);
  if (colon) {
    const h = Number.parseInt(colon[1], 10);
    const m = Number.parseInt(colon[2], 10);
    return h + m / 60;
  }
  const decimal = /^(\d+)([.,]\d{1,2})?$/.exec(trimmed);
  if (decimal) {
    const normalized = trimmed.replace(',', '.');
    const value = Number.parseFloat(normalized);
    return Number.isFinite(value) ? value : null;
  }
  return null;
}

/** Formate un nombre décimal en HH:MM pour affichage. */
export function formatHoursDecimal(decimalHours: number): string {
  const h = Math.floor(decimalHours);
  const m = Math.round((decimalHours - h) * 60);
  return `${h}:${m.toString().padStart(2, '0')}`;
}
