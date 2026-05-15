import type { FieldDescriptor } from './SearchBar.types';

/**
 * Retourne les champs proposables comme suggestions à la saisie.
 * Champ searchable=true explicite, ou type text/many2one/many2many/tags par défaut.
 */
export function getSuggestableFields(fields: FieldDescriptor[]): FieldDescriptor[] {
  return fields.filter((f) => {
    if (f.searchable === false) return false;
    if (f.searchable === true) return true;
    return (
      f.type === 'text' || f.type === 'many2one' || f.type === 'many2many' || f.type === 'tags'
    );
  });
}
