const BASE = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function DownloadIcon({ size = 16 }: { size?: number }) {
  return (
    <svg {...BASE} width={size} height={size} aria-hidden="true">
      <path d="M12 3v12m-5-5 5 5 5-5M5 21h14" />
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

export function AlertIcon({ size = 14 }: { size?: number }) {
  return (
    <svg {...BASE} width={size} height={size} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6M12 17h.01" />
    </svg>
  );
}

const FILE_BASE = (
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </>
);

export function FilePdfIcon({ size = 18 }: { size?: number }) {
  return (
    <svg {...BASE} width={size} height={size} aria-hidden="true">
      {FILE_BASE}
      <path d="M9 13h6M9 17h4" />
    </svg>
  );
}

export function FileXlsxIcon({ size = 18 }: { size?: number }) {
  return (
    <svg {...BASE} width={size} height={size} aria-hidden="true">
      {FILE_BASE}
      <path d="m9 12 6 6m0-6-6 6" />
    </svg>
  );
}

export function FileCsvIcon({ size = 18 }: { size?: number }) {
  return (
    <svg {...BASE} width={size} height={size} aria-hidden="true">
      {FILE_BASE}
      <path d="M9 13h6M9 17h6M9 9h2" />
    </svg>
  );
}
