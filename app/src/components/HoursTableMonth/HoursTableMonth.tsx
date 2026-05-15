import { useMemo } from 'react';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import {
  computeYtd,
  formatBalance,
  formatHoursHhmm,
  HOURS_TABLE_DEFAULTS,
  type HoursMonthRow,
  type HoursTableMonthProps,
  type SortDirection,
  type SortKey,
} from './HoursTableMonth.types';

const BASE_SVG = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function ChevronLeftIcon() {
  return (
    <svg {...BASE_SVG} width={16} height={16} aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg {...BASE_SVG} width={16} height={16} aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function HoursTableMonth({
  year = new Date().getFullYear(),
  rows,
  ytd,
  onYearChange,
  minYear = HOURS_TABLE_DEFAULTS.minYear,
  maxYear = new Date().getFullYear(),
  sortBy,
  sortDirection,
  onSortChange,
  showLeavesColumn = HOURS_TABLE_DEFAULTS.showLeavesColumn,
  showYtdRow = HOURS_TABLE_DEFAULTS.showYtdRow,
  loading = false,
  hoursFormat = HOURS_TABLE_DEFAULTS.hoursFormat,
  layout = HOURS_TABLE_DEFAULTS.layout,
  ariaLabel,
  className,
}: HoursTableMonthProps) {
  const isDesktop = useIsDesktop();
  const resolvedLayout: 'table' | 'cards' =
    layout === 'table' ? 'table' : layout === 'cards' ? 'cards' : isDesktop ? 'table' : 'cards';

  const sortedRows = useMemo(() => {
    if (!sortBy) return rows;
    const arr = [...rows];
    arr.sort((a, b) => {
      const va = a[sortBy] as number;
      const vb = b[sortBy] as number;
      return sortDirection === 'descending' ? vb - va : va - vb;
    });
    return arr;
  }, [rows, sortBy, sortDirection]);

  const effectiveYtd = ytd ?? computeYtd(rows);

  const handleSort = (key: SortKey) => {
    if (!onSortChange) return;
    const nextDir: SortDirection =
      sortBy === key && sortDirection === 'ascending' ? 'descending' : 'ascending';
    onSortChange(key, nextDir);
  };

  const yearPicker = (
    <div className="inline-flex items-center gap-1 rounded-(--radius) border border-(--color-border) p-1">
      <button
        type="button"
        onClick={() => onYearChange?.(year - 1)}
        disabled={year <= minYear || !onYearChange}
        aria-label="Année précédente"
        className="inline-flex h-7 w-7 items-center justify-center rounded-(--radius-sm) hover:bg-[#f1f1ee] disabled:opacity-40"
      >
        <ChevronLeftIcon />
      </button>
      <span className="min-w-[3.25rem] text-center text-sm font-semibold">{year}</span>
      <button
        type="button"
        onClick={() => onYearChange?.(year + 1)}
        disabled={year >= maxYear || !onYearChange}
        aria-label="Année suivante"
        className="inline-flex h-7 w-7 items-center justify-center rounded-(--radius-sm) hover:bg-[#f1f1ee] disabled:opacity-40"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div
        aria-busy="true"
        className={[
          'rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5',
          className ?? '',
        ].join(' ')}
      >
        <header className="mb-3 flex items-center gap-3">
          <h3 className="m-0 flex-1 text-base font-semibold">Bilan heures</h3>
          {yearPicker}
        </header>
        <div className="space-y-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 animate-pulse rounded-(--radius-sm) bg-[#eeeeea]" />
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div
        className={[
          'rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5',
          className ?? '',
        ].join(' ')}
      >
        <header className="mb-3 flex items-center gap-3">
          <h3 className="m-0 flex-1 text-base font-semibold">Bilan heures</h3>
          {yearPicker}
        </header>
        <p className="m-0 py-10 text-center text-sm text-(--color-muted)">
          Aucune saisie pour {year}.
        </p>
      </div>
    );
  }

  return (
    <div
      className={[
        'rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5',
        className ?? '',
      ].join(' ')}
    >
      <header className="mb-3 flex items-center gap-3">
        <h3 className="m-0 flex-1 text-base font-semibold">Bilan heures</h3>
        {yearPicker}
      </header>

      {resolvedLayout === 'table' ? (
        <table
          className="w-full border-collapse text-sm"
          aria-label={ariaLabel ?? `Bilan heures par mois ${year}`}
        >
          <thead>
            <tr className="text-(--color-muted)">
              <SortableTh
                label="Mois"
                sortKey="month"
                current={sortBy}
                direction={sortDirection}
                onSort={handleSort}
                disabled={!onSortChange}
                align="left"
              />
              <SortableTh
                label="Travaillées"
                sortKey="hoursWorked"
                current={sortBy}
                direction={sortDirection}
                onSort={handleSort}
                disabled={!onSortChange}
                align="right"
              />
              <SortableTh
                label="Dues"
                sortKey="hoursDue"
                current={sortBy}
                direction={sortDirection}
                onSort={handleSort}
                disabled={!onSortChange}
                align="right"
              />
              <SortableTh
                label="Solde"
                sortKey="balance"
                current={sortBy}
                direction={sortDirection}
                onSort={handleSort}
                disabled={!onSortChange}
                align="right"
              />
              {showLeavesColumn && (
                <th className="px-3 py-2 text-right text-[11px] font-medium tracking-wider uppercase">
                  Congés
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <MonthRow
                key={row.month}
                row={row}
                format={hoursFormat}
                showLeavesColumn={showLeavesColumn}
              />
            ))}
            {showYtdRow && (
              <YtdRow ytd={effectiveYtd} format={hoursFormat} showLeavesColumn={showLeavesColumn} />
            )}
          </tbody>
        </table>
      ) : (
        <div className="space-y-2">
          {sortedRows.map((row) => (
            <MonthCard key={row.month} row={row} format={hoursFormat} />
          ))}
          {showYtdRow && <YtdCard ytd={effectiveYtd} year={year} format={hoursFormat} />}
        </div>
      )}

      {/* Légende */}
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-(--color-muted)">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-(--radius-pill) bg-(--color-success)" /> Heures
          supplémentaires
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-(--radius-pill) bg-(--color-error)" /> Heures manquantes
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-(--radius-pill) bg-(--color-muted)" /> Solde équilibré
        </span>
      </div>
    </div>
  );
}

interface SortableThProps {
  label: string;
  sortKey: SortKey;
  current?: SortKey;
  direction?: SortDirection;
  onSort: (key: SortKey) => void;
  disabled: boolean;
  align: 'left' | 'right';
}

function SortableTh({
  label,
  sortKey,
  current,
  direction,
  onSort,
  disabled,
  align,
}: SortableThProps) {
  const isActive = current === sortKey;
  const ariaSort: 'none' | SortDirection = isActive ? (direction ?? 'ascending') : 'none';
  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={[
        'border-b border-(--color-border) px-3 py-2 text-[11px] font-medium tracking-wider uppercase',
        align === 'right' ? 'text-right' : 'text-left',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        disabled={disabled}
        className={[
          'inline-flex items-center gap-1 text-(--color-muted) disabled:cursor-default',
          align === 'right' ? 'ml-auto' : '',
          isActive ? 'text-(--color-primary)' : '',
        ].join(' ')}
      >
        <span>{label}</span>
        {isActive && <span>{direction === 'descending' ? '↓' : '↑'}</span>}
        {!isActive && !disabled && <span className="text-[10px] opacity-50">⇅</span>}
      </button>
    </th>
  );
}

interface RowProps {
  row: HoursMonthRow;
  format: 'hhmm' | 'decimal';
  showLeavesColumn: boolean;
}

function MonthRow({ row, format, showLeavesColumn }: RowProps) {
  const balanceClass = balanceColor(row.balance);
  return (
    <tr className="border-b border-(--color-border) hover:bg-[#fbfbf9]">
      <td className="px-3 py-2">
        {row.monthName}
        {row.isCurrentMonth && (
          <span className="ml-1.5 rounded-(--radius-pill) bg-(--color-primary)/10 px-1.5 py-0.5 text-[10px] font-medium text-(--color-primary)">
            en cours
          </span>
        )}
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums">
        {formatHoursHhmm(row.hoursWorked)}
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums">
        {formatHoursHhmm(row.hoursDue)}
      </td>
      <td
        className={['px-3 py-2 text-right font-mono font-semibold tabular-nums', balanceClass].join(
          ' ',
        )}
      >
        {formatBalance(row.balance, format)}
      </td>
      {showLeavesColumn && (
        <td className="px-3 py-2 text-right text-(--color-muted) tabular-nums">
          {row.leavesTaken ?? 0} j
        </td>
      )}
    </tr>
  );
}

function YtdRow({
  ytd,
  format,
  showLeavesColumn,
}: {
  ytd: ReturnType<typeof computeYtd>;
  format: 'hhmm' | 'decimal';
  showLeavesColumn: boolean;
}) {
  const balanceClass = balanceColor(ytd.balance);
  return (
    <tr className="border-t-2 border-(--color-primary) bg-(--color-primary)/4 font-semibold">
      <td className="px-3 py-3">YTD TOTAL</td>
      <td className="px-3 py-3 text-right font-mono tabular-nums">
        {formatHoursHhmm(ytd.hoursWorked)}
      </td>
      <td className="px-3 py-3 text-right font-mono tabular-nums">
        {formatHoursHhmm(ytd.hoursDue)}
      </td>
      <td className={['px-3 py-3 text-right font-mono tabular-nums', balanceClass].join(' ')}>
        {formatBalance(ytd.balance, format)}
      </td>
      {showLeavesColumn && (
        <td className="px-3 py-3 text-right tabular-nums">{ytd.leavesTaken ?? 0} j</td>
      )}
    </tr>
  );
}

function MonthCard({ row, format }: { row: HoursMonthRow; format: 'hhmm' | 'decimal' }) {
  const balanceClass = balanceColor(row.balance);
  return (
    <div className="rounded-(--radius) border border-(--color-border) p-3">
      <div className="mb-2 text-sm font-semibold">
        {row.monthName}
        {row.isCurrentMonth && (
          <span className="ml-1.5 rounded-(--radius-pill) bg-(--color-primary)/10 px-1.5 py-0.5 text-[10px] font-medium text-(--color-primary)">
            en cours
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <span className="text-(--color-muted)">Travaillées</span>
        <span className="text-right font-mono tabular-nums">
          {formatHoursHhmm(row.hoursWorked)}
        </span>
        <span className="text-(--color-muted)">Dues</span>
        <span className="text-right font-mono tabular-nums">{formatHoursHhmm(row.hoursDue)}</span>
        <span className="text-(--color-muted)">Solde</span>
        <span
          className={['text-right font-mono font-semibold tabular-nums', balanceClass].join(' ')}
        >
          {formatBalance(row.balance, format)}
        </span>
      </div>
    </div>
  );
}

function YtdCard({
  ytd,
  year,
  format,
}: {
  ytd: ReturnType<typeof computeYtd>;
  year: number;
  format: 'hhmm' | 'decimal';
}) {
  const balanceClass = balanceColor(ytd.balance);
  return (
    <div className="rounded-(--radius) border-2 border-(--color-primary) bg-(--color-primary)/4 p-3">
      <div className="mb-2 text-sm font-semibold">YTD TOTAL {year}</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <span className="text-(--color-muted)">Travaillées</span>
        <span className="text-right font-mono tabular-nums">
          {formatHoursHhmm(ytd.hoursWorked)}
        </span>
        <span className="text-(--color-muted)">Dues</span>
        <span className="text-right font-mono tabular-nums">{formatHoursHhmm(ytd.hoursDue)}</span>
        <span className="text-(--color-muted)">Solde</span>
        <span className={['text-right font-mono font-bold tabular-nums', balanceClass].join(' ')}>
          {formatBalance(ytd.balance, format)}
        </span>
      </div>
    </div>
  );
}

function balanceColor(balance: number): string {
  if (balance > 0) return 'text-(--color-success)';
  if (balance < 0) return 'text-(--color-error)';
  return 'text-(--color-muted)';
}
