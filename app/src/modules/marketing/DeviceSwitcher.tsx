import { useState } from 'react';

type Device = 'desktop' | 'mobile';

interface Props {
  desktop: { src: string; alt: string };
  mobile: { src: string; alt: string };
  defaultDevice?: Device;
}

/**
 * Bascule visuelle desktop/mobile pour les screenshots de la page Fonctionnalités.
 * Hauteur fixe pour éviter le reflow de la page au switch.
 */
export default function DeviceSwitcher({ desktop, mobile, defaultDevice = 'desktop' }: Props) {
  const [device, setDevice] = useState<Device>(defaultDevice);
  const current = device === 'desktop' ? desktop : mobile;

  return (
    <div>
      <div className="mb-3 inline-flex gap-1 rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-1">
        <button
          type="button"
          onClick={() => setDevice('desktop')}
          aria-pressed={device === 'desktop'}
          className={
            'inline-flex h-8 items-center gap-1.5 rounded-[calc(var(--radius)-2px)] px-3 text-xs font-medium transition-colors ' +
            (device === 'desktop'
              ? 'bg-(--color-primary)/12 text-(--color-primary)'
              : 'text-(--color-muted) hover:text-(--color-text)')
          }
        >
          <DesktopIcon />
          Ordinateur
        </button>
        <button
          type="button"
          onClick={() => setDevice('mobile')}
          aria-pressed={device === 'mobile'}
          className={
            'inline-flex h-8 items-center gap-1.5 rounded-[calc(var(--radius)-2px)] px-3 text-xs font-medium transition-colors ' +
            (device === 'mobile'
              ? 'bg-(--color-primary)/12 text-(--color-primary)'
              : 'text-(--color-muted) hover:text-(--color-text)')
          }
        >
          <MobileIcon />
          Téléphone
        </button>
      </div>

      {/* Stage à hauteur fixe : évite le reflow page au switch desktop <-> mobile */}
      <div
        className="flex w-full items-center justify-center rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg) p-2 shadow-(--shadow-card)"
        style={{ minHeight: 'clamp(360px, 50vw, 560px)' }}
      >
        <img
          key={device}
          src={current.src}
          alt={current.alt}
          loading="lazy"
          className={
            'rounded-[4px] object-contain ' +
            (device === 'desktop' ? 'max-h-full w-full' : 'max-h-[520px] w-auto')
          }
        />
      </div>
    </div>
  );
}

function DesktopIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      width="14"
      height="14"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      width="14"
      height="14"
    >
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );
}
