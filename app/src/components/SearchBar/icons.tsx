const BASE = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg {...BASE} width={size} height={size} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function FilterIcon({ size = 16 }: { size?: number }) {
  return (
    <svg {...BASE} width={size} height={size} aria-hidden="true">
      <path d="M3 4h18l-7 9v6l-4 2v-8z" />
    </svg>
  );
}

export function GroupIcon({ size = 16 }: { size?: number }) {
  return (
    <svg {...BASE} width={size} height={size} aria-hidden="true">
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M8 6h8M8 18h8M6 8v8M18 8v8" />
    </svg>
  );
}

export function StarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg {...BASE} width={size} height={size} aria-hidden="true">
      <path d="m12 2 3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 16 }: { size?: number }) {
  return (
    <svg {...BASE} width={size} height={size} aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 14 }: { size?: number }) {
  return (
    <svg {...BASE} width={size} height={size} aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg {...BASE} width={size} height={size} aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function XIcon({ size = 12 }: { size?: number }) {
  return (
    <svg {...BASE} width={size} height={size} aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
