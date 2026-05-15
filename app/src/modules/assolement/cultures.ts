/**
 * Catalogue centralisé des cultures et leurs couleurs.
 * Source unique de vérité pour la cartographie (couleur des parcelles)
 * et l'UI (badges, légendes, sélecteurs).
 */

export interface CultureInfo {
  /** Identifiant stable, en-tête anglais (réutilisable côté Odoo plus tard). */
  key: string;
  /** Libellé français affiché dans l'UI. */
  label: string;
  /** Couleur hex utilisée par la carte et les badges. */
  color: string;
  category: 'cereal' | 'oilseed' | 'fallow' | 'other';
}

export const CULTURES: ReadonlyArray<CultureInfo> = [
  { key: 'wheat', label: 'Blé', color: '#f4a261', category: 'cereal' },
  { key: 'corn', label: 'Maïs', color: '#f59e0b', category: 'cereal' },
  { key: 'barley', label: 'Orge', color: '#fbbf24', category: 'cereal' },
  { key: 'rapeseed', label: 'Colza', color: '#facc15', category: 'oilseed' },
  { key: 'fallow', label: 'Jachère', color: '#a3a380', category: 'fallow' },
  { key: 'archived', label: 'Archivé', color: '#9ca3af', category: 'other' },
];

const DEFAULT_COLOR = '#9ca3af';

export function cultureByLabel(label: string | undefined): CultureInfo | undefined {
  if (!label) return undefined;
  const norm = label.toLowerCase();
  return CULTURES.find((c) => c.label.toLowerCase() === norm);
}

export function cultureColor(label: string | undefined): string {
  return cultureByLabel(label)?.color ?? DEFAULT_COLOR;
}

export function listCultureLabels(): string[] {
  return CULTURES.filter((c) => c.category !== 'other').map((c) => c.label);
}
