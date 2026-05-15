import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useDebounced } from '../../hooks/useDebounced';
import { BackIcon, CheckIcon, ChevronDownIcon, PlusIcon, SearchIcon, XIcon } from './icons';
import { filterItems, findById, flattenCategories } from './helpers';
import {
  FIELD_PICKER_DEFAULTS,
  type FieldPickerProps,
  type PickerCategory,
  type PickerCategoryGroup,
  type PickerItem,
} from './FieldPicker.types';

export function FieldPicker<T = unknown>({
  title,
  placeholder = FIELD_PICKER_DEFAULTS.placeholder,
  mode,
  value,
  onChange,
  items,
  categoryGroups = [],
  defaultCategoryId = 'all',
  allowCreate = false,
  onCreate,
  createLabel = FIELD_PICKER_DEFAULTS.createLabel,
  debounceMs = FIELD_PICKER_DEFAULTS.debounceMs,
  maxChipsInTrigger = FIELD_PICKER_DEFAULTS.maxChipsInTrigger,
  layout = FIELD_PICKER_DEFAULTS.layout,
  mobileCategoryDropdownThreshold = FIELD_PICKER_DEFAULTS.mobileCategoryDropdownThreshold,
  disabled = false,
  className,
}: FieldPickerProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const debouncedQuery = useDebounced(query, debounceMs);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Layout résolu
  const isMobileViewport = useMediaQuery(
    `(max-width: ${FIELD_PICKER_DEFAULTS.fullscreenBreakpointPx - 1}px)`,
  );
  const resolvedLayout: 'popup' | 'fullscreen' =
    layout === 'fullscreen'
      ? 'fullscreen'
      : layout === 'popup'
        ? 'popup'
        : isMobileViewport
          ? 'fullscreen'
          : 'popup';

  // Items filtrés
  const filtered = useMemo(
    () => filterItems(items, debouncedQuery, categoryId),
    [items, debouncedQuery, categoryId],
  );

  const selectedItems = useMemo(
    () => value.map((id) => findById(items, id)).filter((x): x is PickerItem<T> => Boolean(x)),
    [items, value],
  );

  // Catégories : injection auto "Toutes" en haut
  const effectiveGroups = useMemo<PickerCategoryGroup[]>(() => {
    const flat = flattenCategories(categoryGroups);
    const hasAll = flat.some((c) => c.id === 'all' || c.isAll);
    if (hasAll || categoryGroups.length === 0) return categoryGroups;
    return [
      {
        id: 'auto',
        categories: [{ id: 'all', label: 'Toutes', isAll: true, count: items.length }],
      },
      ...categoryGroups,
    ];
  }, [categoryGroups, items.length]);

  const flatCategories = useMemo(() => flattenCategories(effectiveGroups), [effectiveGroups]);

  // Sélection
  const handleSelectItem = useCallback(
    (item: PickerItem<T>) => {
      if (item.disabled) return;
      if (mode === 'single') {
        onChange([item.id], [item]);
        setOpen(false);
        return;
      }
      const isSelected = value.includes(item.id);
      const nextIds = isSelected ? value.filter((id) => id !== item.id) : [...value, item.id];
      const nextItems = nextIds
        .map((id) => findById(items, id))
        .filter((x): x is PickerItem<T> => Boolean(x));
      onChange(nextIds, nextItems);
    },
    [mode, value, onChange, items],
  );

  const removeChip = useCallback(
    (id: string) => {
      const nextIds = value.filter((v) => v !== id);
      const nextItems = nextIds
        .map((vid) => findById(items, vid))
        .filter((x): x is PickerItem<T> => Boolean(x));
      onChange(nextIds, nextItems);
    },
    [value, onChange, items],
  );

  const handleCreate = useCallback(async () => {
    if (!onCreate || !query.trim()) return;
    const created = await onCreate(query.trim());
    if (!created) return;
    handleSelectItem(created);
    setQuery('');
  }, [onCreate, query, handleSelectItem]);

  // Fermer au clic extérieur / Esc (popup uniquement)
  useEffect(() => {
    if (!open || resolvedLayout !== 'popup') return;
    function onDocClick(e: MouseEvent) {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (popupRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, resolvedLayout]);

  /* ============ Render Trigger ============ */
  const triggerId = useId();
  const chipsToShow = selectedItems.slice(0, maxChipsInTrigger);
  const extraChipCount = Math.max(0, selectedItems.length - maxChipsInTrigger);

  const trigger = (
    <button
      ref={triggerRef}
      id={triggerId}
      type="button"
      disabled={disabled}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => setOpen((o) => !o)}
      className={[
        'flex w-full max-w-[480px] items-center gap-1.5 rounded-(--radius) border bg-(--color-surface) px-3 py-1 text-sm',
        'min-h-[40px] flex-wrap',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : open
            ? 'border-(--color-primary) ring-2 ring-(--color-primary)/15'
            : 'border-(--color-border) hover:bg-[#fbfbf9]',
      ].join(' ')}
    >
      {selectedItems.length === 0 ? (
        <span className="flex-1 text-left text-(--color-muted)">{placeholder}</span>
      ) : mode === 'single' ? (
        <span className="flex-1 text-left">{selectedItems[0]!.label}</span>
      ) : (
        <>
          {chipsToShow.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 rounded-(--radius-pill) bg-(--color-primary)/10 px-2 py-0.5 text-xs font-medium text-(--color-primary)"
            >
              {item.label}
              <span
                role="button"
                aria-label={`Retirer ${item.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeChip(item.id);
                }}
                className="inline-flex h-[18px] w-[18px] items-center justify-center hover:bg-black/10"
              >
                <XIcon />
              </span>
            </span>
          ))}
          {extraChipCount > 0 && (
            <span className="inline-flex items-center rounded-(--radius-pill) bg-[#f1f1ee] px-2 py-0.5 text-xs text-(--color-muted)">
              +{extraChipCount} autres
            </span>
          )}
        </>
      )}
      <span className="ml-auto text-(--color-muted)">
        <ChevronDownIcon />
      </span>
    </button>
  );

  /* ============ Render Panel (popup ou fullscreen) ============ */
  if (!open) return <div className={className}>{trigger}</div>;

  const SearchInput = (
    <div
      className="flex items-center gap-2 rounded-(--radius) bg-[#f1f1ee] px-3"
      style={{ height: 40 }}
    >
      <span className="text-(--color-muted)">
        <SearchIcon />
      </span>
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher…"
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-(--color-muted)"
        aria-label="Rechercher"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          aria-label="Effacer"
          className="text-(--color-muted) hover:text-(--color-text)"
        >
          <XIcon size={14} />
        </button>
      )}
    </div>
  );

  const Categories = (
    <CategoriesNav
      groups={effectiveGroups}
      flatCategories={flatCategories}
      activeId={categoryId}
      onChange={setCategoryId}
      layout={resolvedLayout}
      mobileCategoryDropdownThreshold={mobileCategoryDropdownThreshold}
    />
  );

  const Results = (
    <ResultsList
      items={filtered}
      mode={mode}
      selectedIds={value}
      onSelect={handleSelectItem}
      onCreate={allowCreate && query.trim() && filtered.length === 0 ? handleCreate : undefined}
      createLabel={createLabel}
      query={query}
    />
  );

  if (resolvedLayout === 'fullscreen') {
    return (
      <div className={className}>
        {trigger}
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-50 grid grid-rows-[auto_auto_auto_1fr_auto] bg-(--color-surface)"
        >
          <header className="flex items-center gap-2 border-b border-(--color-border) px-3 py-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Retour"
              className="inline-flex h-9 w-9 items-center justify-center rounded-(--radius-sm) hover:bg-[#f1f1ee]"
            >
              <BackIcon />
            </button>
            <h3 className="m-0 flex-1 text-base font-semibold">{title}</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={mode === 'single' && value.length === 0}
              className="rounded-(--radius-sm) px-2 py-1 text-sm font-semibold text-(--color-primary) disabled:text-(--color-muted)"
            >
              OK{mode === 'multiple' && value.length > 0 ? ` (${value.length})` : ''}
            </button>
          </header>
          <div className="border-b border-(--color-border) px-3 py-2">{SearchInput}</div>
          {effectiveGroups.length > 0 && Categories}
          <div className="overflow-y-auto">{Results}</div>
          {allowCreate && onCreate && (
            <footer className="border-t border-(--color-border) px-3 py-2">
              <button
                type="button"
                onClick={handleCreate}
                disabled={!query.trim()}
                className="inline-flex h-11 items-center gap-1.5 rounded-(--radius) border border-(--color-accent) bg-transparent px-3 text-sm font-medium text-(--color-accent) disabled:opacity-50"
              >
                <PlusIcon /> {query.trim() ? `${createLabel} « ${query.trim()} »` : createLabel}
              </button>
            </footer>
          )}
        </div>
      </div>
    );
  }

  // Popup desktop
  return (
    <div className={['relative', className ?? ''].join(' ')}>
      {trigger}
      <div
        ref={popupRef}
        role="dialog"
        aria-label={title}
        className="absolute z-20 mt-1 w-full max-w-[480px] overflow-hidden rounded-(--radius) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-popup)"
      >
        <div className="border-b border-(--color-border) p-2">{SearchInput}</div>
        {effectiveGroups.length > 0 && Categories}
        <div className="max-h-[280px] overflow-y-auto py-1">{Results}</div>
        <footer className="flex items-center gap-2 border-t border-(--color-border) px-2.5 py-2 text-xs">
          <span className="flex-1 text-(--color-muted)">
            {mode === 'multiple' && (
              <>
                <strong className="text-(--color-text)">{value.length}</strong> sélectionné(s)
              </>
            )}
            {mode === 'single' && selectedItems[0] ? `${selectedItems[0].label} sélectionné` : null}
          </span>
          {allowCreate && onCreate && (
            <button
              type="button"
              onClick={handleCreate}
              disabled={!query.trim()}
              className="inline-flex h-8 items-center gap-1 rounded-(--radius-sm) border border-(--color-accent) bg-transparent px-2 text-xs font-medium text-(--color-accent) disabled:opacity-50"
            >
              <PlusIcon size={12} /> {createLabel}
            </button>
          )}
          {mode === 'multiple' && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-(--radius-sm) bg-(--color-primary) px-3 py-1 text-xs font-medium text-white hover:bg-(--color-primary-hover)"
            >
              Valider
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

/* ============ CategoriesNav ============ */
interface CategoriesNavProps {
  groups: ReadonlyArray<PickerCategoryGroup>;
  flatCategories: PickerCategory[];
  activeId: string;
  onChange: (id: string) => void;
  layout: 'popup' | 'fullscreen';
  mobileCategoryDropdownThreshold: number;
}

function CategoriesNav({
  groups,
  flatCategories,
  activeId,
  onChange,
  layout,
  mobileCategoryDropdownThreshold,
}: CategoriesNavProps) {
  // Mobile : dropdown si > seuil ou si plusieurs groupes nommés
  const hasGroups = groups.length > 1 || groups.some((g) => g.title);
  const useDropdown =
    layout === 'fullscreen' &&
    (flatCategories.length > mobileCategoryDropdownThreshold || hasGroups);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const activeCat = flatCategories.find((c) => c.id === activeId);

  if (useDropdown) {
    return (
      <div className="border-b border-(--color-border) px-3 py-2">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex h-10 w-full items-center gap-2 rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-3 text-sm"
        >
          <span className="flex-1 text-left font-medium">{activeCat?.label ?? 'Toutes'}</span>
          {activeCat?.count !== undefined && (
            <span className="rounded-(--radius-pill) bg-(--color-primary)/10 px-2 text-xs font-medium text-(--color-primary)">
              {activeCat.count}
            </span>
          )}
          <span className="text-(--color-muted)">
            <ChevronDownIcon />
          </span>
        </button>
        {dropdownOpen && (
          <ul
            role="listbox"
            className="mt-1 max-h-[260px] overflow-auto rounded-(--radius) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-popup)"
          >
            {groups.map((group) => (
              <div key={group.id}>
                {group.title && (
                  <div className="bg-[#fbfbf9] px-3.5 py-1 text-[11px] tracking-wider text-(--color-muted) uppercase">
                    {group.title}
                  </div>
                )}
                {group.categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={cat.id === activeId}
                      aria-pressed={cat.id === activeId}
                      onClick={() => {
                        onChange(cat.id);
                        setDropdownOpen(false);
                      }}
                      className={[
                        'flex w-full items-center gap-2 border-t border-[#f1f1ee] px-3.5 py-3 text-sm',
                        cat.id === activeId
                          ? 'bg-(--color-primary)/6 font-medium text-(--color-primary)'
                          : 'hover:bg-[#fbfbf9]',
                      ].join(' ')}
                    >
                      {cat.id === activeId && (
                        <span className="text-(--color-primary)">
                          <CheckIcon />
                        </span>
                      )}
                      <span className="flex-1 text-left">{cat.label}</span>
                      {cat.count !== undefined && (
                        <span className="rounded-(--radius-pill) bg-[#ececea] px-2 text-xs">
                          {cat.count}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </div>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Chips horizontaux
  return (
    <div
      role="tablist"
      aria-label="Catégories"
      className={[
        'flex gap-1 overflow-x-auto border-b border-(--color-border)',
        layout === 'fullscreen' ? 'px-3 py-2' : 'px-1.5 py-1',
      ].join(' ')}
    >
      {flatCategories.map((cat) => {
        const isActive = cat.id === activeId;
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-pressed={isActive}
            onClick={() => onChange(cat.id)}
            className={[
              'inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap',
              layout === 'fullscreen'
                ? 'h-8 rounded-(--radius-pill) px-3 text-sm'
                : 'h-7 rounded-(--radius-sm) px-2.5 text-xs',
              isActive
                ? 'bg-(--color-primary)/10 font-medium text-(--color-primary)'
                : 'text-(--color-text) hover:bg-[#f5f5f0]',
            ].join(' ')}
          >
            <span>{cat.label}</span>
            {cat.count !== undefined && (
              <span
                className={[
                  'rounded-(--radius-pill) px-1.5 text-[10px] font-medium',
                  isActive ? 'bg-(--color-primary)/15' : 'bg-black/6',
                ].join(' ')}
              >
                {cat.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ============ ResultsList ============ */
interface ResultsListProps<T> {
  items: PickerItem<T>[];
  mode: 'single' | 'multiple';
  selectedIds: string[];
  onSelect: (item: PickerItem<T>) => void;
  onCreate?: () => void;
  createLabel: string;
  query: string;
}

function ResultsList<T>({
  items,
  mode,
  selectedIds,
  onSelect,
  onCreate,
  createLabel,
  query,
}: ResultsListProps<T>) {
  if (items.length === 0) {
    return (
      <div className="px-3 py-8 text-center text-sm text-(--color-muted)">
        <p className="m-0">
          {query.trim() ? `Aucun résultat pour « ${query.trim()} »` : 'Aucun élément.'}
        </p>
        {onCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-(--radius-sm) border border-(--color-accent) bg-transparent px-3 text-xs font-medium text-(--color-accent)"
          >
            <PlusIcon /> {createLabel} « {query.trim()} »
          </button>
        )}
      </div>
    );
  }

  return (
    <ul role="listbox" aria-multiselectable={mode === 'multiple'} className="m-0 list-none p-0">
      {items.map((item) => {
        const isSelected = selectedIds.includes(item.id);
        return (
          <li key={item.id}>
            <button
              type="button"
              role="option"
              aria-selected={isSelected}
              disabled={item.disabled}
              onClick={() => onSelect(item)}
              className={[
                'flex w-full items-center gap-2.5 px-3 text-sm',
                'h-11 sm:h-10',
                'disabled:cursor-not-allowed disabled:opacity-50',
                isSelected
                  ? mode === 'multiple'
                    ? 'bg-(--color-primary)/5'
                    : 'border-l-4 border-(--color-primary) bg-(--color-primary)/8 pl-2 font-medium text-(--color-primary)'
                  : 'hover:bg-[#fbfbf9]',
              ].join(' ')}
            >
              {mode === 'multiple' && (
                <span
                  className={[
                    'inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-(--radius-sm) border-2',
                    isSelected
                      ? 'border-(--color-primary) bg-(--color-primary) text-white'
                      : 'border-(--color-border) bg-(--color-surface)',
                  ].join(' ')}
                >
                  {isSelected && <CheckIcon />}
                </span>
              )}
              <span className="flex-1 truncate text-left">
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className="ml-1.5 rounded-(--radius-sm) bg-(--color-accent)/12 px-1.5 py-0.5 text-[10px] font-medium text-(--color-accent)"
                    style={item.badge.color ? { color: item.badge.color } : undefined}
                  >
                    {item.badge.label}
                  </span>
                )}
                {item.meta && (
                  <span className="block text-[11px] text-(--color-muted)">{item.meta}</span>
                )}
              </span>
              {mode === 'single' && isSelected && (
                <span className="text-(--color-primary)">
                  <CheckIcon size={16} />
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
