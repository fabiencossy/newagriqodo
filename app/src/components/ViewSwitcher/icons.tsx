import type { ViewKey } from './ViewSwitcher.types';

const COMMON_SVG_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const ICONS: Record<ViewKey, React.ReactNode> = {
  table: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </>
  ),
  map: (
    <>
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" />
      <path d="M9 3v15M15 6v15" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </>
  ),
  kanban: (
    <>
      <rect x="3" y="3" width="5" height="14" rx="1" />
      <rect x="11" y="3" width="5" height="10" rx="1" />
      <rect x="19" y="3" width="2" height="6" rx="1" />
    </>
  ),
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  timeline: (
    <>
      <path d="M3 7h6M3 12h12M3 17h9" />
      <circle cx="9" cy="7" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="17" r="1.5" fill="currentColor" />
    </>
  ),
};

export function ViewIcon({ view, size = 20 }: { view: ViewKey; size?: number }) {
  return (
    <svg {...COMMON_SVG_PROPS} width={size} height={size} aria-hidden="true">
      {ICONS[view]}
    </svg>
  );
}

export function ChevronDownIcon() {
  return (
    <svg {...COMMON_SVG_PROPS} width={16} height={16} aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg {...COMMON_SVG_PROPS} width={16} height={16} aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
