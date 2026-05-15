/**
 * FieldPicker — Sélecteur plein écran avec recherche + catégories + multi/simple-select.
 *
 * Patterns :
 *  - Trigger : un bouton/champ qui affiche la valeur courante (chip(s) en multi).
 *  - Modal : ouverture en dialog plein écran (desktop) ou fullscreen (mobile).
 *  - Header : titre + bouton fermer.
 *  - Search : input texte avec debounce.
 *  - Categories : panneau gauche (groupes hiérarchiques de filtres).
 *  - Results : liste scrollable, multi-select (checkbox) ou single (radio implicite).
 *  - Footer : compteur + actions (Créer / Annuler / Valider).
 */

export type PickerMode = 'single' | 'multiple';

export interface PickerCategoryGroup {
  /** ID stable. */
  id: string;
  /** Titre du groupe affiché. */
  title?: string;
  /** Catégories du groupe. */
  categories: PickerCategory[];
}

export interface PickerCategory {
  /** ID unique (utilisé pour filtrer). */
  id: string;
  /** Libellé affiché. */
  label: string;
  /** Icône SVG (id de symbol). */
  icon?: string;
  /** Couleur (badge / tag). */
  color?: string;
  /** Compteur affiché à droite. */
  count?: number;
  /** Si true, regroupe tous les items (catégorie "Toutes"). */
  isAll?: boolean;
  /** Catégorie parente (hiérarchie). */
  parentId?: string;
}

/** Un élément sélectionnable. */
export interface PickerItem<T = unknown> {
  /** ID stable (clé de sélection). */
  id: string;
  /** Libellé principal. */
  label: string;
  /** Sous-titre / metadata affiché en gris. */
  meta?: string;
  /** Badge optionnel (ex: type, statut). */
  badge?: { label: string; color?: string };
  /** Icône optionnelle (id de symbol). */
  icon?: string;
  /** IDs des catégories auxquelles l'item appartient. */
  categoryIds?: string[];
  /** Désactive la sélection (item visible mais grisé). */
  disabled?: boolean;
  /** Données complètes (réutilisées à la valeur retournée). */
  data?: T;
}

export interface FieldPickerProps<T = unknown> {
  /** Titre affiché dans le header. */
  title: string;
  /** Placeholder du trigger replié. */
  placeholder?: string;

  /** Mode de sélection. */
  mode: PickerMode;
  /** Valeur courante (IDs). En mode single, max 1 id. */
  value: string[];
  /** Callback de changement de sélection. */
  onChange: (selectedIds: string[], selectedItems: PickerItem<T>[]) => void;

  /** Liste des items disponibles (synchrone). Si large dataset → préférer `fetchItems`. */
  items?: PickerItem<T>[];
  /** Loader async (recherche serveur). Reçoit `(query, categoryId)`. */
  fetchItems?: (query: string, categoryId?: string) => Promise<PickerItem<T>[]>;
  /** Catégories pour le panneau gauche. */
  categoryGroups?: PickerCategoryGroup[];
  /** Catégorie initiale sélectionnée. */
  defaultCategoryId?: string;

  /** Permettre la création d'un nouvel item depuis le picker. */
  allowCreate?: boolean;
  /** Callback quand l'utilisateur clique "+ Créer". */
  onCreate?: (query: string) => Promise<PickerItem<T> | null>;
  /** Label custom du bouton créer. */
  createLabel?: string;

  /** Debounce de la recherche. Défaut 250 ms. */
  debounceMs?: number;
  /** Compteur max affiché en chip dans le trigger (le reste → "+N autres"). Défaut 3. */
  maxChipsInTrigger?: number;
  /** Compteur max retournable en mode multiple (null = illimité). Défaut null. */
  maxSelection?: number | null;

  /** Désactive le composant. */
  disabled?: boolean;
  /** État loading externe (chargement initial). */
  loading?: boolean;

  /** Identifiant ARIA. */
  ariaLabel?: string;
  /** Classe CSS optionnelle. */
  className?: string;
}

export const FIELD_PICKER_DEFAULTS = {
  mode: 'single' as PickerMode,
  debounceMs: 250,
  maxChipsInTrigger: 3,
  maxSelection: null as number | null,
  placeholder: 'Sélectionner…',
  allowCreate: false,
  createLabel: 'Créer',
} as const;

/* ============================================================
 * Helpers
 * ============================================================ */

/** Filtre des items selon une catégorie + une query texte (recherche fuzzy basique). */
export function filterItems<T>(
  items: ReadonlyArray<PickerItem<T>>,
  query: string,
  categoryId?: string,
): PickerItem<T>[] {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    if (categoryId && !item.categoryIds?.includes(categoryId)) {
      const isAllCat = categoryId === 'all';
      if (!isAllCat) return false;
    }
    if (!q) return true;
    return (
      item.label.toLowerCase().includes(q) ||
      (item.meta?.toLowerCase().includes(q) ?? false)
    );
  });
}

/** Crée un label de chip à partir d'une sélection (mode multiple). */
export function summarizeSelection<T>(
  selectedItems: ReadonlyArray<PickerItem<T>>,
  maxChips: number,
): { chips: string[]; extraCount: number } {
  if (selectedItems.length <= maxChips) {
    return { chips: selectedItems.map((i) => i.label), extraCount: 0 };
  }
  return {
    chips: selectedItems.slice(0, maxChips).map((i) => i.label),
    extraCount: selectedItems.length - maxChips,
  };
}
