import type { Intervention } from '../carnet/carnet.types';
import type { ApplicationWindow, FumureBalance, NutrientElement } from './fumure.types';
import type { ParcelDetail } from '../parcellaire/parcellaire.mocks';

interface FumureDrawerProps {
  element: NutrientElement;
  parcel: ParcelDetail;
  interventions: ReadonlyArray<Intervention>;
  balance: FumureBalance;
  windows: ReadonlyArray<ApplicationWindow>;
  onClose: () => void;
  onAddApport: () => void;
}

const ELEMENT_LABELS: Record<NutrientElement, string> = {
  N: 'Azote (N)',
  P: 'Phosphore (P₂O₅)',
  K: 'Potasse (K₂O)',
};

/**
 * Drawer détail au clic sur une card N / P / K du Plan de fumure.
 * Affiche :
 *   - besoin total + apports cumulés + solde
 *   - liste chronologique des apports (depuis le Carnet)
 *   - fenêtres BBCH d'apport conseillées (seulement pour N)
 *   - bouton "Ajouter un apport" → ouvre l'InterventionForm en mode fertilisation
 */
export function FumureDrawer({
  element,
  parcel,
  interventions,
  balance,
  windows,
  onClose,
  onAddApport,
}: FumureDrawerProps) {
  // Apports cumulés de cet élément depuis le carnet
  const apports = interventions
    .filter((i) => i.category === 'fertilization' && i.date.startsWith(String(parcel.year)))
    .filter((i) => {
      if (element === 'N') return Boolean(i.nKgPerHa);
      if (element === 'P') return Boolean(i.pKgPerHa);
      return Boolean(i.kKgPerHa);
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const needs = balance.needs[`${element.toLowerCase()}Kg` as 'nKg' | 'pKg' | 'kKg'];
  const applied = balance.applied[`${element.toLowerCase()}Kg` as 'nKg' | 'pKg' | 'kKg'];
  const remaining = balance.remaining[`${element.toLowerCase()}Kg` as 'nKg' | 'pKg' | 'kKg'];

  return (
    <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/40 backdrop-blur-sm md:items-center md:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Détail du bilan ${ELEMENT_LABELS[element]}`}
        className="flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-(--radius-lg) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-popup) md:max-w-[560px] md:rounded-(--radius-lg)"
      >
        <header className="flex items-start gap-3 border-b border-(--color-border) px-4 py-3">
          <div className="min-w-0 flex-1">
            <h2 className="m-0 text-sm font-semibold">{ELEMENT_LABELS[element]}</h2>
            <p className="m-0 mt-0.5 text-xs text-(--color-muted)">
              {parcel.name} · campagne {parcel.year} · {balance.culture}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-(--radius-sm) text-(--color-muted) hover:bg-[#f1f1ee] hover:text-(--color-text)"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {/* Synthèse */}
          <div className="grid grid-cols-3 gap-2">
            <SummaryCell label="Besoin total" value={`${needs} kg`} />
            <SummaryCell label="Apporté" value={`${applied} kg`} />
            <SummaryCell
              label={remaining > 0 ? 'Reste à apporter' : 'Excédent'}
              value={`${Math.abs(remaining)} kg`}
              color={remaining > 0 ? '#f59e0b' : remaining < 0 ? '#ef4444' : '#16a34a'}
            />
          </div>

          {/* Bonus précédent cultural (N seulement) */}
          {element === 'N' && balance.previousCropResidualN !== 0 && (
            <div className="rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9] px-3 py-2 text-xs">
              <span className="text-(--color-muted)">Précédent cultural restitue : </span>
              <span
                className="font-mono font-semibold tabular-nums"
                style={{ color: balance.previousCropResidualN > 0 ? '#16a34a' : '#ef4444' }}
              >
                {balance.previousCropResidualN > 0 ? '+' : ''}
                {balance.previousCropResidualN} kg N
              </span>
              <span className="ml-2 text-(--color-muted)">(inclus dans l'apporté)</span>
            </div>
          )}

          {/* Différence apporté brut vs disponible (coefficient organique) */}
          {element === 'N' && balance.applied.nKg !== balance.appliedRaw.nKg && (
            <div className="rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9] px-3 py-2 text-xs">
              <span className="text-(--color-muted)">Apports bruts : </span>
              <span className="font-mono tabular-nums">{balance.appliedRaw.nKg} kg</span>
              <span className="ml-2 text-(--color-muted)">
                · disponible 1<sup>re</sup> année :{' '}
              </span>
              <span className="font-mono font-semibold tabular-nums">
                {balance.applied.nKg - balance.previousCropResidualN} kg
              </span>
              <span className="ml-1 text-(--color-muted)">(coefficient organique OEngrais)</span>
            </div>
          )}

          {/* Historique des apports */}
          <section>
            <h3 className="m-0 mb-2 text-[11px] font-semibold tracking-wider text-(--color-muted) uppercase">
              Apports {parcel.year} · {apports.length} entrée{apports.length > 1 ? 's' : ''}
            </h3>
            {apports.length === 0 ? (
              <p className="m-0 rounded-(--radius-sm) border border-dashed border-(--color-border) bg-[#fbfbf9] py-4 text-center text-xs text-(--color-muted)">
                Aucun apport enregistré pour cet élément.
              </p>
            ) : (
              <ul className="m-0 space-y-1.5 list-none p-0">
                {apports.map((i) => {
                  const treated = i.surfaceTreatedHa ?? parcel.surfaceHa;
                  const perHa =
                    element === 'N'
                      ? (i.nKgPerHa ?? 0)
                      : element === 'P'
                        ? (i.pKgPerHa ?? 0)
                        : (i.kKgPerHa ?? 0);
                  const total = Math.round(perHa * treated);
                  return (
                    <li
                      key={i.id}
                      className="flex items-center gap-3 rounded-(--radius-sm) border border-(--color-border) bg-(--color-surface) px-3 py-2 text-xs"
                    >
                      <span className="shrink-0 font-mono tabular-nums text-(--color-muted)">
                        {fmtDate(i.date)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{i.productName ?? 'Apport'}</div>
                        <div className="truncate text-[10px] text-(--color-muted)">
                          {perHa} kg/ha × {treated.toFixed(2)} ha
                          {i.operator ? ` · ${i.operator}` : ''}
                        </div>
                      </div>
                      <span className="shrink-0 font-mono font-semibold tabular-nums">
                        +{total} kg
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Fenêtres BBCH conseillées — N uniquement */}
          {element === 'N' && windows.length > 0 && (
            <section>
              <h3 className="m-0 mb-2 text-[11px] font-semibold tracking-wider text-(--color-muted) uppercase">
                Fenêtres d'apport conseillées (OEngrais)
              </h3>
              <ul className="m-0 space-y-1.5 list-none p-0">
                {windows.map((w) => (
                  <li
                    key={`${w.bbchStart}-${w.bbchEnd}`}
                    className="rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9] px-3 py-2 text-xs"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium">{w.label}</span>
                      <span className="font-mono tabular-nums text-(--color-muted)">
                        BBCH {w.bbchStart}–{w.bbchEnd}
                      </span>
                    </div>
                    <div className="mt-0.5 text-(--color-muted)">
                      Dose conseillée :{' '}
                      <strong className="text-(--color-text)">
                        {w.nKgHa.min}–{w.nKgHa.max} kg N/ha
                      </strong>
                      {w.notes ? <span> · {w.notes}</span> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <footer className="flex items-center gap-2 border-t border-(--color-border) p-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-4 text-sm font-medium hover:bg-[#f8f8f5]"
          >
            Fermer
          </button>
          <button
            type="button"
            onClick={onAddApport}
            className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-(--radius) border border-(--color-primary) bg-(--color-primary) px-5 text-sm font-medium text-white hover:bg-(--color-primary-hover)"
          >
            <PlusIcon /> Ajouter un apport
          </button>
        </footer>
      </div>
    </div>
  );
}

function SummaryCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9] p-3 text-center">
      <div className="text-[10px] font-semibold tracking-wider text-(--color-muted) uppercase">
        {label}
      </div>
      <div className="mt-1 font-mono text-base font-semibold tabular-nums" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y!.slice(2)}`;
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={16}
      height={16}
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
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
