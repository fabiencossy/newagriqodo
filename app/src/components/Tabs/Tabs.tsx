import { useState } from 'react';

/**
 * Composant Tabs simple, réutilisable, conforme au squelette du projet.
 *
 * - Onglets scrollables horizontalement sur mobile (pour ne pas saturer l'écran)
 * - Indicateur actif via underline bas + couleur primary
 * - Icônes optionnelles à gauche de chaque label
 * - URL state non géré ici (à brancher côté parent si besoin via `activeKey` + `onChange`)
 */

export interface TabDescriptor {
  key: string;
  label: string;
  icon?: React.ReactNode;
  /** Compteur optionnel à droite (ex: "12 interventions"). */
  count?: number;
  /** Désactivé (typiquement "à venir"). */
  disabled?: boolean;
}

interface TabsProps {
  tabs: ReadonlyArray<TabDescriptor>;
  /** Si fourni, mode contrôlé. Sinon, state interne (avec defaultKey). */
  activeKey?: string;
  defaultKey?: string;
  onChange?: (key: string) => void;
  className?: string;
  ariaLabel?: string;
}

export function Tabs({ tabs, activeKey, defaultKey, onChange, className, ariaLabel }: TabsProps) {
  const [internalKey, setInternalKey] = useState<string>(defaultKey ?? tabs[0]?.key ?? '');
  const active = activeKey ?? internalKey;

  const select = (key: string) => {
    if (activeKey === undefined) setInternalKey(key);
    onChange?.(key);
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel ?? 'Onglets'}
      className={[
        '-mx-1 flex gap-1 overflow-x-auto border-b border-(--color-border) px-1 pb-px',
        // Cache scrollbar sur webkit pour propreté visuelle
        '[&::-webkit-scrollbar]:hidden [scrollbar-width:none]',
        className ?? '',
      ].join(' ')}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`tab-panel-${tab.key}`}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && select(tab.key)}
            className={[
              'inline-flex h-10 shrink-0 items-center gap-1.5 border-b-2 px-3 text-sm font-medium transition-colors',
              isActive
                ? 'border-(--color-primary) text-(--color-primary)'
                : 'border-transparent text-(--color-muted) hover:text-(--color-text)',
              tab.disabled ? 'cursor-not-allowed opacity-40' : '',
            ].join(' ')}
          >
            {tab.icon && (
              <span className="inline-flex shrink-0" aria-hidden="true">
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={[
                  'inline-flex shrink-0 items-center rounded-(--radius-pill) px-1.5 py-0.5 font-mono text-[10px] tabular-nums',
                  isActive
                    ? 'bg-(--color-primary)/12 text-(--color-primary)'
                    : 'bg-[#f1f1ee] text-(--color-muted)',
                ].join(' ')}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  tabKey,
  active,
  children,
}: {
  tabKey: string;
  active: string;
  children: React.ReactNode;
}) {
  if (tabKey !== active) return null;
  return (
    <div role="tabpanel" id={`tab-panel-${tabKey}`} aria-labelledby={tabKey}>
      {children}
    </div>
  );
}
