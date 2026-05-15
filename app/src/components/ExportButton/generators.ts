import { EXPORT_DEFAULTS, type ExportColumn } from './ExportButton.types';

/* ============================================================
 * Helpers communs
 * ============================================================ */

/** Construit le filename avec date du jour. */
export function buildFilename(
  base: string,
  format: 'pdf' | 'csv' | 'xlsx',
  hasFilters = false,
): string {
  const date = new Date().toISOString().slice(0, 10);
  const suffix = hasFilters ? '_filtered' : '';
  return `${base}_${date}${suffix}.${format}`;
}

/** Déduit les colonnes à partir des clés du premier item. */
export function deriveColumns(data: ReadonlyArray<Record<string, unknown>>): ExportColumn[] {
  if (data.length === 0) return [];
  const first = data[0]!;
  return Object.keys(first).map((key) => ({ key, label: key }));
}

/** Échappe une cellule CSV en respectant RFC 4180. */
function escapeCsvCell(raw: unknown): string {
  if (raw === null || raw === undefined) return '';
  const text = raw instanceof Date ? raw.toISOString() : String(raw);
  // Double les guillemets ; entoure si caractère spécial
  if (/[";\n,\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/* ============================================================
 * CSV — génération native (pas de dépendance)
 * ============================================================ */

export function generateCsv(
  data: ReadonlyArray<Record<string, unknown>>,
  columns: ExportColumn[],
  separator: ',' | ';' = EXPORT_DEFAULTS.csvSeparator,
): string {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(separator);
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const raw = row[col.key];
        const formatted = col.format ? col.format(raw, row) : raw;
        return escapeCsvCell(formatted);
      })
      .join(separator),
  );
  return [header, ...rows].join('\r\n');
}

/** Déclenche un téléchargement navigateur depuis un Blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Petit délai pour assurer le téléchargement avant revoke
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportCsv(
  data: ReadonlyArray<Record<string, unknown>>,
  columns: ExportColumn[],
  filename: string,
  options: { separator?: ',' | ';'; bom?: boolean } = {},
): void {
  const sep = options.separator ?? EXPORT_DEFAULTS.csvSeparator;
  const bom = options.bom ?? EXPORT_DEFAULTS.csvUtf8Bom;
  const csv = generateCsv(data, columns, sep);
  const content = bom ? '﻿' + csv : csv;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, filename);
}

/* ============================================================
 * PDF / XLSX — stubs Phase 1
 * Les libs (jspdf, exceljs) seront ajoutées dans une étape dédiée.
 * Pour l'instant, on simule la génération (delay + erreur claire).
 * ============================================================ */

export async function exportPdf(_args: {
  data: ReadonlyArray<Record<string, unknown>>;
  columns: ExportColumn[];
  filename: string;
}): Promise<void> {
  // TODO Phase 1 : intégrer jspdf + autotable + logo Qodo.
  // En attendant, on fallback en CSV pour ne pas bloquer la démo.
  await new Promise((r) => setTimeout(r, 400));
  throw new Error('Export PDF pas encore implémenté (lib jspdf à brancher).');
}

export async function exportXlsx(_args: {
  data: ReadonlyArray<Record<string, unknown>>;
  columns: ExportColumn[];
  filename: string;
}): Promise<void> {
  // TODO Phase 1 : intégrer exceljs.
  await new Promise((r) => setTimeout(r, 400));
  throw new Error('Export Excel pas encore implémenté (lib exceljs à brancher).');
}
