import { useState } from 'react';
import { CheckIcon, ChevronRightIcon, FilterIcon, GroupIcon, StarIcon } from './icons';
import {
  makeFacetId,
  type FieldDescriptor,
  type FilterOption,
  type SavedFavorite,
  type SearchState,
} from './SearchBar.types';

interface FiltersDropdownProps {
  fields: FieldDescriptor[];
  state: SearchState;
  onChange: (state: SearchState) => void;
  favorites: SavedFavorite[];
  onSaveFavorite?: (name: string, options: { shared: boolean; isDefault: boolean }) => void;
  onDeleteFavorite?: (favoriteId: string) => void;
  onClose: () => void;
}

export function FiltersDropdown({
  fields,
  state,
  onChange,
  favorites,
  onSaveFavorite,
  onClose: _onClose,
}: FiltersDropdownProps) {
  const filterableFields = fields.filter(
    (f) => f.type === 'select' || f.type === 'tags' || f.type === 'boolean' || f.type === 'date',
  );
  const groupableFields = fields.filter((f) => f.groupable);

  return (
    <div
      role="menu"
      className="mt-1 grid max-w-[720px] grid-cols-1 rounded-(--radius) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-popup) sm:grid-cols-3"
    >
      <FiltersColumn fields={filterableFields} state={state} onChange={onChange} />
      <GroupByColumn fields={groupableFields} state={state} onChange={onChange} />
      <FavoritesColumn
        favorites={favorites}
        onSaveFavorite={onSaveFavorite}
        state={state}
        onChange={onChange}
      />
    </div>
  );
}

/* ============================================================
 * Colonne Filtres
 * ============================================================ */
interface FiltersColumnProps {
  fields: FieldDescriptor[];
  state: SearchState;
  onChange: (state: SearchState) => void;
}

function FiltersColumn({ fields, state, onChange }: FiltersColumnProps) {
  return (
    <div className="border-b border-(--color-border) py-1.5 sm:border-r sm:border-b-0">
      <ColumnHeader icon={<FilterIcon />} label="Filtres" />
      {fields.length === 0 ? (
        <p className="px-3.5 py-2 text-xs text-(--color-muted)">Aucun filtre disponible.</p>
      ) : (
        fields.map((field) => (
          <FieldFilterItem key={field.id} field={field} state={state} onChange={onChange} />
        ))
      )}
    </div>
  );
}

interface FieldFilterItemProps {
  field: FieldDescriptor;
  state: SearchState;
  onChange: (state: SearchState) => void;
}

function FieldFilterItem({ field, state, onChange }: FieldFilterItemProps) {
  const [expanded, setExpanded] = useState(false);
  const facetForField = state.facets.find((f) => f.fieldId === field.id);

  const toggleValue = (option: FilterOption) => {
    const currentValues = facetForField?.values ?? [];
    const exists = currentValues.includes(option.value);
    const nextValues = exists
      ? currentValues.filter((v) => v !== option.value)
      : [...currentValues, option.value];

    if (nextValues.length === 0) {
      // retrait complet de la facet
      onChange({ ...state, facets: state.facets.filter((f) => f.fieldId !== field.id) });
      return;
    }

    if (facetForField) {
      onChange({
        ...state,
        facets: state.facets.map((f) =>
          f.id === facetForField.id ? { ...f, values: nextValues } : f,
        ),
      });
    } else {
      onChange({
        ...state,
        facets: [
          ...state.facets,
          {
            id: makeFacetId(),
            fieldId: field.id,
            operator: 'in',
            values: nextValues,
          },
        ],
      });
    }
  };

  const hasOptions = field.options && field.options.length > 0;

  return (
    <>
      <button
        type="button"
        role="menuitem"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-3.5 py-1.5 text-sm text-(--color-text) hover:bg-[#f7f7f4]"
      >
        <CheckIcon />
        <span className="flex-1 text-left">{field.label}</span>
        {hasOptions && (
          <span
            className={[
              'text-(--color-muted) transition-transform',
              expanded ? 'rotate-90' : '',
            ].join(' ')}
          >
            <ChevronRightIcon />
          </span>
        )}
      </button>
      {expanded && hasOptions && (
        <div className="border-t border-(--color-border) bg-[#fbfbf9] py-1 pl-7">
          {field.options?.map((option) => {
            const checked = facetForField?.values.includes(option.value) ?? false;
            return (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => toggleValue(option)}
                className={[
                  'flex w-full items-center gap-2 px-3.5 py-1 text-xs',
                  checked ? 'text-(--color-primary)' : 'text-(--color-text)',
                  'hover:bg-[#f0f0ec]',
                ].join(' ')}
              >
                <span className={checked ? 'text-(--color-primary)' : 'text-transparent'}>
                  <CheckIcon />
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ============================================================
 * Colonne Regrouper
 * ============================================================ */
interface GroupByColumnProps {
  fields: FieldDescriptor[];
  state: SearchState;
  onChange: (state: SearchState) => void;
}

function GroupByColumn({ fields, state, onChange }: GroupByColumnProps) {
  const toggleGroup = (fieldId: string) => {
    const exists = state.groupBy.some((g) => g.fieldId === fieldId);
    const groupBy = exists
      ? state.groupBy.filter((g) => g.fieldId !== fieldId)
      : [...state.groupBy, { fieldId }];
    onChange({ ...state, groupBy });
  };

  return (
    <div className="border-b border-(--color-border) py-1.5 sm:border-r sm:border-b-0">
      <ColumnHeader icon={<GroupIcon />} label="Regrouper" />
      {fields.length === 0 ? (
        <p className="px-3.5 py-2 text-xs text-(--color-muted)">Aucun champ groupable.</p>
      ) : (
        fields.map((field) => {
          const isActive = state.groupBy.some((g) => g.fieldId === field.id);
          return (
            <button
              key={field.id}
              type="button"
              role="menuitem"
              onClick={() => toggleGroup(field.id)}
              className={[
                'flex w-full items-center gap-2 px-3.5 py-1.5 text-sm hover:bg-[#f7f7f4]',
                isActive ? 'text-(--color-primary)' : 'text-(--color-text)',
              ].join(' ')}
            >
              <span className={isActive ? 'text-(--color-primary)' : 'text-transparent'}>
                <CheckIcon />
              </span>
              <span>{field.label}</span>
            </button>
          );
        })
      )}
    </div>
  );
}

/* ============================================================
 * Colonne Favoris
 * ============================================================ */
interface FavoritesColumnProps {
  favorites: SavedFavorite[];
  onSaveFavorite?: (name: string, options: { shared: boolean; isDefault: boolean }) => void;
  state: SearchState;
  onChange: (state: SearchState) => void;
}

function FavoritesColumn({ favorites, onSaveFavorite, onChange }: FavoritesColumnProps) {
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState('');

  const submit = () => {
    if (!name.trim() || !onSaveFavorite) return;
    onSaveFavorite(name.trim(), { shared: false, isDefault: false });
    setName('');
    setSaveOpen(false);
  };

  return (
    <div className="py-1.5">
      <ColumnHeader icon={<StarIcon />} label="Favoris" />
      {favorites.length === 0 && !saveOpen && (
        <p className="px-3.5 py-2 text-xs text-(--color-muted)">Aucun favori enregistré.</p>
      )}
      {favorites.map((fav) => (
        <button
          key={fav.id}
          type="button"
          role="menuitem"
          onClick={() => onChange(fav.state)}
          className="flex w-full items-center gap-2 px-3.5 py-1.5 text-sm text-(--color-text) hover:bg-[#f7f7f4]"
        >
          <StarIcon />
          <span className="text-left">{fav.name}</span>
        </button>
      ))}
      {onSaveFavorite && (
        <>
          <div className="my-1.5 h-px bg-(--color-border)" />
          {saveOpen ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit();
                  if (e.key === 'Escape') setSaveOpen(false);
                }}
                placeholder="Nom du favori…"
                className="h-7 flex-1 rounded-(--radius-sm) border border-(--color-border) px-2 text-xs"
                aria-label="Nom du favori"
              />
              <button
                type="button"
                onClick={submit}
                disabled={!name.trim()}
                className="h-7 rounded-(--radius-sm) bg-(--color-primary) px-2 text-xs text-white disabled:opacity-50"
              >
                OK
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSaveOpen(true)}
              className="flex w-full items-center gap-1.5 px-3.5 py-1.5 text-sm text-(--color-accent) hover:bg-[#f7f7f4]"
            >
              <StarIcon />
              <span>Enregistrer la recherche…</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* ============================================================
 * Helpers
 * ============================================================ */
function ColumnHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <h4 className="m-0 flex items-center gap-1.5 px-3.5 pt-1.5 pb-2 text-[11px] tracking-wider text-(--color-muted) uppercase">
      <span className="text-(--color-accent)">{icon}</span>
      <span>{label}</span>
    </h4>
  );
}
