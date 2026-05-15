import { XIcon } from './icons';
import { formatFacetLabel, type Facet as FacetT, type FieldDescriptor } from './SearchBar.types';

interface FacetProps {
  facet: FacetT;
  field: FieldDescriptor | undefined;
  onRemove: () => void;
  theme: 'light' | 'dark';
}

export function Facet({ facet, field, onRemove, theme }: FacetProps) {
  const label = formatFacetLabel(facet, field);
  const isDark = theme === 'dark';
  return (
    <span
      className={[
        'inline-flex h-[22px] items-center gap-1 rounded-(--radius-pill) bg-(--color-accent) py-0.5 pr-1 pl-2.5 text-xs leading-none font-medium whitespace-nowrap text-white',
        isDark ? '' : '',
      ].join(' ')}
    >
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Retirer ${label}`}
        className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-(--radius-sm) text-white hover:bg-black/20"
      >
        <XIcon />
      </button>
    </span>
  );
}
