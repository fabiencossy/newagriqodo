const BASE = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const ICONS = {
  select: <path d="m4 4 8 18 2.5-7.5L22 12z" />,
  drawParcel: (
    <>
      <path d="M5 5 19 7l3 12-13 3L3 12z" />
      <circle cx="5" cy="5" r="1.5" fill="currentColor" />
      <circle cx="19" cy="7" r="1.5" fill="currentColor" />
      <circle cx="22" cy="19" r="1.5" fill="currentColor" />
      <circle cx="9" cy="22" r="1.5" fill="currentColor" />
      <circle cx="3" cy="12" r="1.5" fill="currentColor" />
    </>
  ),
  pin: (
    <>
      <path d="M12 22s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  ruler: (
    <>
      <path d="m3 17 14-14 4 4L7 21z" />
      <path d="m6 14 2 2M9 11l2 2M12 8l2 2M15 5l2 2" />
    </>
  ),
  group: (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M8 6h8M8 18h8M6 8v8M18 8v8" />
    </>
  ),
  layers: (
    <>
      <path d="m12 2 10 6-10 6L2 8z" />
      <path d="m2 14 10 6 10-6" />
    </>
  ),
  zoomIn: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21 16 16M11 8v6M8 11h6" />
    </>
  ),
  zoomOut: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21 16 16M8 11h6" />
    </>
  ),
  locate: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
} as const;

export type IconName = keyof typeof ICONS;

export function MapIcon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg {...BASE} width={size} height={size} aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}
