import type { InterventionCategory } from './carnet.types';
import { CATEGORY_COLORS } from './carnet.helpers';

interface InterventionTypeIconProps {
  category: InterventionCategory;
  size?: number;
  /** Affiche l'icône avec un cercle de fond coloré (usage table/timeline). */
  withBackground?: boolean;
}

/**
 * Icônes SVG inline style Lucide par catégorie d'intervention.
 * Stroke 1.75, viewBox 24×24, currentColor — cohérent avec le reste du projet.
 */
export function InterventionTypeIcon({
  category,
  size = 16,
  withBackground = false,
}: InterventionTypeIconProps) {
  const color = CATEGORY_COLORS[category];

  if (withBackground) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex shrink-0 items-center justify-center rounded-(--radius-pill)"
        style={{
          width: size + 12,
          height: size + 12,
          background: `${color}1f`, // alpha ~12%
          color,
        }}
      >
        <Glyph category={category} size={size} />
      </span>
    );
  }
  return (
    <span aria-hidden="true" style={{ color }}>
      <Glyph category={category} size={size} />
    </span>
  );
}

function Glyph({ category, size }: { category: InterventionCategory; size: number }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    width: size,
    height: size,
  };
  switch (category) {
    case 'sowing':
      return (
        <svg {...common}>
          {/* graine + pousse */}
          <path d="M12 22V10" />
          <path d="M12 10c0-3 2-5 5-5-1 3-2 5-5 5z" />
          <path d="M12 10c0-3-2-5-5-5 1 3 2 5 5 5z" />
          <path d="M5 22h14" />
        </svg>
      );
    case 'fertilization':
      return (
        <svg {...common}>
          {/* sac granulé */}
          <path d="M5 8h14l-2 12H7L5 8z" />
          <path d="M9 8V5a3 3 0 0 1 6 0v3" />
          <circle cx="10" cy="13" r="0.6" />
          <circle cx="14" cy="13" r="0.6" />
          <circle cx="12" cy="16" r="0.6" />
        </svg>
      );
    case 'phyto':
      return (
        <svg {...common}>
          {/* spray */}
          <path d="M9 11V5h6v6" />
          <rect x="7" y="11" width="10" height="10" rx="1.5" />
          <path d="M3 7h2M3 9h2M3 5h2" />
        </svg>
      );
    case 'tillage':
      return (
        <svg {...common}>
          {/* charrue / sillons */}
          <path d="M3 17l4-4 4 4" />
          <path d="M11 17l4-4 4 4" />
          <path d="M3 21h18" />
        </svg>
      );
    case 'cultural':
      return (
        <svg {...common}>
          {/* houe */}
          <path d="M14 4l6 6" />
          <path d="M16 6l-9 9-3 4 4-3 9-9" />
          <path d="M19 9l-5-5" />
        </svg>
      );
    case 'harvest':
      return (
        <svg {...common}>
          {/* épi blé */}
          <path d="M12 22V8" />
          <path d="M12 14c-2 0-4-2-4-4 2 0 4 2 4 4z" />
          <path d="M12 14c2 0 4-2 4-4-2 0-4 2-4 4z" />
          <path d="M12 10c-2 0-4-2-4-4 2 0 4 2 4 4z" />
          <path d="M12 10c2 0 4-2 4-4-2 0-4 2-4 4z" />
        </svg>
      );
    case 'observation':
      return (
        <svg {...common}>
          {/* œil */}
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'irrigation':
      return (
        <svg {...common}>
          {/* goutte d'eau */}
          <path d="M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z" />
        </svg>
      );
    case 'other':
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9 9.5a3 3 0 0 1 6 0c0 1.5-1.5 2-2 2.5s-1 1-1 2" />
          <circle cx="12" cy="17" r="0.6" fill="currentColor" />
        </svg>
      );
  }
}
