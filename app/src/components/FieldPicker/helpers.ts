import type { PickerCategory, PickerCategoryGroup, PickerItem } from './FieldPicker.types';

/** Filtre les items selon une catégorie + une query texte. */
export function filterItems<T>(
  items: ReadonlyArray<PickerItem<T>>,
  query: string,
  categoryId: string | undefined,
): PickerItem<T>[] {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    if (categoryId && categoryId !== 'all') {
      if (!item.categoryIds?.includes(categoryId)) return false;
    }
    if (!q) return true;
    return item.label.toLowerCase().includes(q) || (item.meta?.toLowerCase().includes(q) ?? false);
  });
}

/** Aplatit les groupes en une liste plate de catégories. */
export function flattenCategories(groups: ReadonlyArray<PickerCategoryGroup>): PickerCategory[] {
  return groups.flatMap((g) => g.categories);
}

/** Retourne l'item par ID (helper de lookup). */
export function findById<T>(
  items: ReadonlyArray<PickerItem<T>>,
  id: string,
): PickerItem<T> | undefined {
  return items.find((i) => i.id === id);
}
