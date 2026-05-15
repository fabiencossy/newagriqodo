import { useId } from 'react';
import { SearchIcon } from './icons';
import { getSuggestableFields } from './searchable';
import type { FieldDescriptor } from './SearchBar.types';

export interface FieldSuggestion {
  field: FieldDescriptor;
  term: string;
}

interface SuggestionsListProps {
  query: string;
  fields: FieldDescriptor[];
  focusedIndex: number;
  onSelect: (suggestion: FieldSuggestion) => void;
  onFocusedChange: (index: number) => void;
  ariaLabel?: string;
}

export function SuggestionsList({
  query,
  fields,
  focusedIndex,
  onSelect,
  onFocusedChange,
  ariaLabel = 'Suggestions',
}: SuggestionsListProps) {
  const listId = useId();
  const items = getSuggestableFields(fields);
  if (!query.trim() || items.length === 0) return null;

  return (
    <div
      id={listId}
      role="listbox"
      aria-label={ariaLabel}
      className="absolute top-full right-0 left-0 z-[1000] mt-1 max-w-[540px] rounded-(--radius) border border-(--color-border) bg-(--color-surface) py-1 shadow-(--shadow-popup)"
    >
      <div className="px-3.5 py-1.5 text-[11px] tracking-wider text-(--color-muted) uppercase">
        Rechercher « <strong className="text-(--color-text)">{query}</strong> » dans :
      </div>
      {items.map((field, idx) => {
        const isFocused = idx === focusedIndex;
        return (
          <button
            type="button"
            key={field.id}
            role="option"
            aria-selected={isFocused}
            onMouseEnter={() => onFocusedChange(idx)}
            onClick={() => onSelect({ field, term: query })}
            className={[
              'flex w-full items-center gap-2 px-3.5 py-1.5 text-sm text-(--color-text)',
              isFocused ? 'bg-(--color-primary)/8' : 'hover:bg-[#f7f7f4]',
            ].join(' ')}
          >
            <SearchIcon />
            <span>{field.label} :</span>
            <span className="rounded-(--radius-sm) bg-(--color-primary)/10 px-1.5 py-0.5 text-xs font-medium text-(--color-primary)">
              {query}
            </span>
          </button>
        );
      })}
    </div>
  );
}
