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

export function ChevronDownIcon({ size = 14 }: { size?: number }) {
  return (
    <svg {...BASE} width={size} height={size} aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
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

export function BackIcon({ size = 20 }: { size?: number }) {
  return (
    <svg {...BASE} width={size} height={size} aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function PlusIcon({ size = 14 }: { size?: number }) {
  return (
    <svg {...BASE} width={size} height={size} aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
