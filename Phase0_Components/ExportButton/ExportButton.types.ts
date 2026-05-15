/**
 * ExportButton — Export PDF / CSV / Excel d'une liste ou table.
 */

export type ExportFormat = 'pdf' | 'csv' | 'xlsx';

export interface ExportColumn {
  /** Clé de la colonne dans `data`. */
  key: string;
  /** Libellé affiché en en-tête. */
  label: string;
  /** Formateur optionnel (ex: dates, nombres). */
  format?: (value: unknown, row: Record<string, unknown>) => string;
  /** Largeur en px (Excel/PDF). Défaut auto. */
  widthPx?: number;
}

export interface ExportPdfMeta {
  /** Titre principal en haut du PDF. */
  title: string;
  /** Sous-titre optionnel (ex: nom d'exploitation). */
  subtitle?: string;
  /** Libellés des filtres appliqués (affichés sous le titre). */
  appliedFilters?: string[];
  /** Logo URL (dataURL ou path). Défaut : logo Qodo. */
  logoUrl?: string;
  /** Footer custom (sinon : pagination + timestamp). */
  footer?: string;
}

export interface ExportButtonProps {
  /** Données à exporter. */
  data: ReadonlyArray<Record<string, unknown>>;
  /** Définition des colonnes à inclure. Si omis : toutes les clés du premier item. */
  columns?: ExportColumn[];
  /** Formats disponibles. Si 1 seul → bouton direct, sinon dropdown. */
  formats?: ExportFormat[];
  /** Préfixe de filename. Date YYYY-MM-DD ajoutée automatiquement. */
  filenameBase: string;
  /** Métadonnées pour le PDF (titre, filtres, logo…). */
  pdfMeta?: ExportPdfMeta;
  /** Désactive le bouton. */
  disabled?: boolean;
  /** Callback avant export (validation, confirmation). Return false pour annuler. */
  onBeforeExport?: (format: ExportFormat) => boolean | Promise<boolean>;
  /** Callback après export réussi. */
  onExported?: (format: ExportFormat, filename: string) => void;
  /** Callback en cas d'erreur. */
  onError?: (format: ExportFormat, error: Error) => void;
  /** Variante visuelle. Défaut 'secondary'. */
  variant?: 'primary' | 'secondary';
  /** Classe CSS optionnelle. */
  className?: string;
}

export const EXPORT_DEFAULTS = {
  formats: ['pdf', 'xlsx', 'csv'] as ExportFormat[],
  variant: 'secondary' as const,
  /** BOM UTF-8 pour compatibilité Excel sur fichier CSV. */
  csvUtf8Bom: true,
  /** Séparateur CSV (Excel FR aime le ;). */
  csvSeparator: ';' as ',' | ';',
} as const;
