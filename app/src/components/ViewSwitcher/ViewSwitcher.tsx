import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { CheckIcon, ChevronDownIcon, ViewIcon } from './icons';
import {
  VIEW_LABELS,
  VIEW_SWITCHER_DEFAULTS,
  type ViewKey,
  type ViewSwitcherProps,
} from './ViewSwitcher.types';

export function ViewSwitcher({
  views,
  activeView,
  onChange,
  disabledViews = [],
  disabled = false,
  layout = VIEW_SWITCHER_DEFAULTS.layout,
  display = VIEW_SWITCHER_DEFAULTS.display,
  ariaLabel = 'Changer de vue',
  className,
}: ViewSwitcherProps) {
  const isViewDisabled = useCallback(
    (view: ViewKey) => disabled || disabledViews.includes(view),
    [disabled, disabledViews],
  );

  const handleSelect = useCallback(
    (view: ViewKey) => {
      if (isViewDisabled(view) || view === activeView) return;
      onChange(view);
    },
    [activeView, isViewDisabled, onChange],
  );

  // Layout résolu : on observe la viewport en mode 'auto'.
  const resolvedLayout = useResolvedLayout(layout);

  if (resolvedLayout === 'dropdown') {
    return (
      <DropdownVariant
        views={views}
        activeView={activeView}
        onSelect={handleSelect}
        isDisabled={isViewDisabled}
        display={display}
        ariaLabel={ariaLabel}
        className={className}
      />
    );
  }

  return (
    <SegmentedVariant
      views={views}
      activeView={activeView}
      onSelect={handleSelect}
      isDisabled={isViewDisabled}
      display={display}
      ariaLabel={ariaLabel}
      className={className}
    />
  );
}

/* ============================================================
 * Segmented (desktop) — boutons côte à côte
 * ============================================================ */
interface VariantProps {
  views: ViewKey[];
  activeView: ViewKey;
  onSelect: (view: ViewKey) => void;
  isDisabled: (view: ViewKey) => boolean;
  display: ViewSwitcherProps['display'];
  ariaLabel: string;
  className?: string;
}

function SegmentedVariant({
  views,
  activeView,
  onSelect,
  isDisabled,
  display,
  ariaLabel,
  className,
}: VariantProps) {
  const iconOnly = display === 'icon-only';
  const labelOnly = display === 'label-only';

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={[
        'inline-flex gap-0.5 rounded-(--radius) bg-[#f1f1ee] p-0.5',
        className ?? '',
      ].join(' ')}
    >
      {views.map((view) => {
        const isActive = view === activeView;
        const dis = isDisabled(view);
        return (
          <button
            key={view}
            type="button"
            role="tab"
            aria-pressed={isActive}
            aria-label={iconOnly ? VIEW_LABELS[view] : undefined}
            disabled={dis}
            onClick={() => onSelect(view)}
            title={iconOnly ? VIEW_LABELS[view] : undefined}
            className={[
              'inline-flex items-center gap-1.5 rounded-(--radius-sm) text-sm transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-50',
              iconOnly ? 'h-9 w-9 justify-center px-0' : 'h-9 px-3.5',
              isActive
                ? 'bg-(--color-primary) text-white hover:bg-(--color-primary-hover)'
                : 'text-(--color-text) hover:bg-black/5',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {!labelOnly && <ViewIcon view={view} size={iconOnly ? 22 : 20} />}
            {!iconOnly && <span>{VIEW_LABELS[view]}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
 * Dropdown (mobile) — listbox déroulant
 * ============================================================ */
function DropdownVariant({
  views,
  activeView,
  onSelect,
  isDisabled,
  display,
  ariaLabel,
  className,
}: VariantProps) {
  const iconOnly = display === 'icon-only';
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={['relative inline-block', className ?? ''].join(' ')}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={iconOnly ? `${ariaLabel} (${VIEW_LABELS[activeView]})` : ariaLabel}
        title={iconOnly ? VIEW_LABELS[activeView] : undefined}
        onClick={() => setOpen((o) => !o)}
        className={[
          'inline-flex h-10 items-center gap-1.5 rounded-(--radius) border border-(--color-border) bg-(--color-surface) text-sm hover:bg-[#fbfbf9]',
          iconOnly ? 'w-10 justify-center px-0' : 'min-w-[160px] px-3.5',
        ].join(' ')}
      >
        <ViewIcon view={activeView} size={18} />
        {!iconOnly && (
          <>
            <span className="font-medium">{VIEW_LABELS[activeView]}</span>
            <span className="ml-auto text-(--color-muted)">
              <ChevronDownIcon />
            </span>
          </>
        )}
      </button>

      {open && (
        <ul
          ref={menuRef}
          id={menuId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute right-0 z-[1200] mt-1 w-56 rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-1 shadow-(--shadow-popup)"
        >
          {views.map((view) => {
            const isActive = view === activeView;
            const dis = isDisabled(view);
            return (
              <li key={view}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  disabled={dis}
                  onClick={() => {
                    onSelect(view);
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className={[
                    'flex h-10 w-full items-center gap-2.5 rounded-(--radius-sm) px-3 text-sm',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    isActive
                      ? 'bg-(--color-primary)/8 font-medium text-(--color-primary)'
                      : 'hover:bg-[#f8f8f5]',
                  ].join(' ')}
                >
                  <ViewIcon view={view} />
                  <span>{VIEW_LABELS[view]}</span>
                  {isActive && (
                    <span className="ml-auto text-(--color-primary)">
                      <CheckIcon />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ============================================================
 * Hooks
 * ============================================================ */
const MOBILE_BREAKPOINT_PX = 768;

function useResolvedLayout(layout: ViewSwitcherProps['layout']): 'segmented' | 'dropdown' {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`).matches;
  });

  useEffect(() => {
    if (layout !== 'auto') return;
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [layout]);

  if (layout === 'segmented') return 'segmented';
  if (layout === 'dropdown') return 'dropdown';
  return isMobile ? 'dropdown' : 'segmented';
}
