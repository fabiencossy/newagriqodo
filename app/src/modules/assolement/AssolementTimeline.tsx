import { cultureColor } from './cultures';
import type { AssolementSegment } from './assolement.types';

const MONTH_LABELS_SHORT = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTH_LABELS_LONG = [
  'Janv.',
  'Févr.',
  'Mars',
  'Avr.',
  'Mai',
  'Juin',
  'Juil.',
  'Août',
  'Sept.',
  'Oct.',
  'Nov.',
  'Déc.',
];

interface AssolementTimelineProps {
  segments: ReadonlyArray<AssolementSegment>;
  /** Campagne affichée (l'axe X couvre 01/01 → 31/12 de cette année). */
  year: number;
  variant?: 'row' | 'detail';
  /** Date actuelle (optionnelle) — trace une ligne verticale "aujourd'hui". */
  today?: string;
  onSegmentClick?: (segment: AssolementSegment) => void;
  /** Pour ajouter un nouveau segment (variant detail). */
  onAdd?: () => void;
  className?: string;
}

/**
 * Frise temporelle 12 mois pour la campagne `year`.
 * Chaque segment d'assolement est dessiné comme une barre colorée selon sa culture.
 *
 * - `variant="row"` : compact (32px) pour la vue Timeline du Plan d'assolement (Gantt).
 * - `variant="detail"` : large (64px) avec libellés et bouton + pour l'édition (AsideCard).
 */
export function AssolementTimeline({
  segments,
  year,
  variant = 'row',
  today,
  onSegmentClick,
  onAdd,
  className,
}: AssolementTimelineProps) {
  const yearStart = Date.UTC(year, 0, 1);
  const yearEnd = Date.UTC(year, 11, 31);
  const yearSpan = yearEnd - yearStart;

  const bars = segments
    .map((s) => {
      const start = Math.max(Date.parse(s.startDate), yearStart);
      const end = Math.min(Date.parse(s.endDate), yearEnd);
      if (end < start) return undefined;
      const left = ((start - yearStart) / yearSpan) * 100;
      const width = ((end - start) / yearSpan) * 100;
      return { segment: s, left, width };
    })
    .filter((b): b is { segment: AssolementSegment; left: number; width: number } => Boolean(b));

  const todayPct =
    today && today.startsWith(String(year))
      ? ((Date.parse(today) - yearStart) / yearSpan) * 100
      : undefined;

  const isDetail = variant === 'detail';
  const trackHeight = isDetail ? 'h-12' : 'h-7';

  return (
    <div className={['w-full', className ?? ''].join(' ')}>
      {/* Track : barre + segments */}
      <div className="relative w-full">
        {/* Grille mensuelle (12 colonnes) en arrière-plan */}
        <div
          className={[
            'grid grid-cols-12 overflow-hidden rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9]',
            trackHeight,
          ].join(' ')}
        >
          {MONTH_LABELS_SHORT.map((m, idx) => (
            <div
              key={m + idx}
              className={[
                'flex items-center justify-center text-[10px] text-(--color-muted)',
                idx > 0 ? 'border-l border-(--color-border)/60' : '',
              ].join(' ')}
            >
              {!isDetail && m}
            </div>
          ))}
        </div>

        {/* Segments (positionnés en absolu sur la track) */}
        {bars.map(({ segment, left, width }) => (
          <button
            key={segment.id}
            type="button"
            disabled={!onSegmentClick}
            onClick={() => onSegmentClick?.(segment)}
            title={`${segment.culture}${segment.varietyName ? ' · ' + segment.varietyName : ''} (${fmt(segment.startDate)} → ${fmt(segment.endDate)})`}
            className={[
              'absolute top-0 flex items-center overflow-hidden px-1.5 text-[11px] font-medium text-white/95',
              trackHeight,
              onSegmentClick
                ? 'cursor-pointer transition-opacity hover:opacity-90'
                : 'cursor-default',
              segment.planned ? 'opacity-70' : '',
            ].join(' ')}
            style={{
              left: `${left}%`,
              width: `max(${width}%, 4px)`,
              background: cultureColor(segment.culture),
              border: segment.planned
                ? '1px dashed rgba(255,255,255,0.7)'
                : '1px solid rgba(0,0,0,0.1)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {isDetail && (
              <span className="truncate">
                {segment.culture}
                {segment.varietyName ? ` · ${segment.varietyName}` : ''}
              </span>
            )}
          </button>
        ))}

        {/* Marqueur "aujourd'hui" */}
        {todayPct !== undefined && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 h-full w-px bg-(--color-accent)"
            style={{ left: `${todayPct}%` }}
            title="Aujourd'hui"
          />
        )}
      </div>

      {/* Labels mois (variant detail uniquement) */}
      {isDetail && (
        <div className="mt-1 grid grid-cols-12 text-[10px] text-(--color-muted)">
          {MONTH_LABELS_LONG.map((m) => (
            <div key={m} className="text-center">
              {m}
            </div>
          ))}
        </div>
      )}

      {/* Bouton ajouter (variant detail) */}
      {isDetail && onAdd && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex h-9 items-center gap-1.5 rounded-(--radius) border border-dashed border-(--color-border) bg-(--color-surface) px-3 text-xs font-medium text-(--color-text) hover:bg-[#f8f8f5]"
          >
            <PlusIcon /> Ajouter un segment
          </button>
        </div>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={14}
      height={14}
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function fmt(date: string): string {
  const parts = date.split('-');
  if (parts.length !== 3) return date;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
