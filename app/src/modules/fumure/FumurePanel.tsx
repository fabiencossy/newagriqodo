import { useMemo, useState } from 'react';
import { useInterventions } from '../carnet/carnet.store';
import { getInterventionsForParcel } from '../carnet/carnet.helpers';
import { useSegments } from '../assolement/assolement.store';
import { getActiveSegment } from '../assolement/assolement.helpers';
import { useInterventionForm } from '../../layouts/InterventionFormProvider';
import type { ParcelDetail } from '../parcellaire/parcellaire.mocks';
import { computeFumureBalance, applicationWindows } from './fumure.helpers';
import type { NutrientElement } from './fumure.types';
import { FumureDrawer } from './FumureDrawer';

interface FumurePanelProps {
  parcel: ParcelDetail;
}

const TODAY = new Date().toISOString().slice(0, 10);

/**
 * Plan de fumure complet (Palier 2 — OEngrais 2024).
 * Affiche les 3 cards N / P₂O₅ / K₂O cliquables avec :
 *   - apports cumulés (en tenant compte des coefficients organiques)
 *   - bonus précédent cultural
 *   - reste à apporter (par élément, plus de total flou)
 *   - statut couleur (sous/équilibré/sur)
 *
 * Le clic sur une card ouvre un drawer détaillé avec l'historique des apports
 * et les fenêtres BBCH conseillées.
 */
export function FumurePanel({ parcel }: FumurePanelProps) {
  const allInterventions = useInterventions();
  const allSegments = useSegments();
  const { openInterventionForm } = useInterventionForm();

  const interventions = useMemo(
    () => getInterventionsForParcel(parcel.id, allInterventions),
    [parcel.id, allInterventions],
  );
  const activeSegment = useMemo(
    () => getActiveSegment(parcel.id, TODAY, allSegments),
    [parcel.id, allSegments],
  );

  // TODO Phase 3 : le précédent cultural est lu depuis la culture du segment N-1
  // de la même parcelle. Pour l'instant on prend la culture du segment précédent
  // dans le tableau trié — heuristique simple.
  const previousCulture = useMemo(() => {
    const sorted = [...allSegments]
      .filter((s) => s.parcelId === parcel.id)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    const currentIdx = activeSegment ? sorted.findIndex((s) => s.id === activeSegment.id) : -1;
    return currentIdx > 0 ? sorted[currentIdx - 1]?.culture : undefined;
  }, [allSegments, parcel.id, activeSegment]);

  const balance = useMemo(
    () =>
      computeFumureBalance(
        activeSegment?.culture,
        parcel.surfaceHa,
        parcel.year,
        interventions,
        previousCulture,
      ),
    [activeSegment, parcel.surfaceHa, parcel.year, interventions, previousCulture],
  );

  const [drawerElement, setDrawerElement] = useState<NutrientElement | null>(null);

  if (!balance) {
    return (
      <div className="rounded-(--radius) border border-dashed border-(--color-border) bg-(--color-surface) py-10 text-center text-sm text-(--color-muted)">
        Pas de besoins fertilisation pour cette culture (ou aucun segment actif).
      </div>
    );
  }

  const statusColor =
    balance.status === 'équilibré'
      ? '#16a34a'
      : balance.status === 'sous-fertilisé'
        ? '#f59e0b'
        : '#ef4444';

  return (
    <>
      <section className="rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="m-0 text-sm font-semibold tracking-wider text-(--color-muted) uppercase">
            Plan de fumure · campagne {parcel.year}
          </h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-(--color-muted)">{balance.culture}</span>
            <span aria-hidden className="text-(--color-border)">
              ·
            </span>
            <span className="font-mono tabular-nums text-(--color-muted)">
              {parcel.surfaceHa.toFixed(2)} ha
            </span>
          </div>
        </div>

        {/* Précédent cultural (bonus N) */}
        {previousCulture && balance.previousCropResidualN !== 0 && (
          <div className="mb-3 rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9] px-3 py-2 text-xs">
            <span className="text-(--color-muted)">Précédent cultural : </span>
            <strong>{previousCulture}</strong>
            <span className="ml-2 text-(--color-muted)">→ résidu azoté</span>
            <span
              className="ml-1 font-mono font-semibold tabular-nums"
              style={{ color: balance.previousCropResidualN > 0 ? '#16a34a' : '#ef4444' }}
            >
              {balance.previousCropResidualN > 0 ? '+' : ''}
              {balance.previousCropResidualN} kg N
            </span>
          </div>
        )}

        {/* Cards N / P / K cliquables */}
        <div className="grid grid-cols-3 gap-2">
          <NutrientCard
            element="N"
            label="N"
            applied={balance.applied.nKg}
            needs={balance.needs.nKg}
            remaining={balance.remaining.nKg}
            coverage={balance.coverage.n}
            onClick={() => setDrawerElement('N')}
          />
          <NutrientCard
            element="P"
            label="P₂O₅"
            applied={balance.applied.pKg}
            needs={balance.needs.pKg}
            remaining={balance.remaining.pKg}
            coverage={balance.coverage.p}
            onClick={() => setDrawerElement('P')}
          />
          <NutrientCard
            element="K"
            label="K₂O"
            applied={balance.applied.kKg}
            needs={balance.needs.kKg}
            remaining={balance.remaining.kKg}
            coverage={balance.coverage.k}
            onClick={() => setDrawerElement('K')}
          />
        </div>

        {/* Reste à apporter — décomposé par élément */}
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <RemainingCell label="Reste N" value={balance.remaining.nKg} unit="kg" />
          <RemainingCell label="Reste P₂O₅" value={balance.remaining.pKg} unit="kg" />
          <RemainingCell label="Reste K₂O" value={balance.remaining.kKg} unit="kg" />
        </div>

        {/* Statut global */}
        <div className="mt-3 flex items-center justify-between rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9] px-3 py-2 text-sm">
          <span className="text-(--color-muted)">Bilan azoté</span>
          <span className="font-semibold capitalize" style={{ color: statusColor }}>
            {balance.status}
          </span>
        </div>

        {/* Lien Suisse-Bilanz (placeholder Phase 3) */}
        <p className="m-0 mt-3 text-[11px] text-(--color-muted)">
          Bilan basé sur la norme <strong>OEngrais 2024</strong>. Coefficients organiques appliqués
          à l'azote selon saison d'apport. Suisse-Bilanz export à venir (Phase 3).
        </p>
      </section>

      {drawerElement && (
        <FumureDrawer
          element={drawerElement}
          parcel={parcel}
          interventions={interventions}
          balance={balance}
          windows={applicationWindows(activeSegment?.culture)}
          onClose={() => setDrawerElement(null)}
          onAddApport={() => {
            setDrawerElement(null);
            openInterventionForm({
              parcelId: parcel.id,
              category: 'fertilization',
            });
          }}
        />
      )}
    </>
  );
}

interface NutrientCardProps {
  element: NutrientElement;
  label: string;
  applied: number;
  needs: number;
  remaining: number;
  coverage: number;
  onClick: () => void;
}

function NutrientCard({ label, applied, needs, remaining, coverage, onClick }: NutrientCardProps) {
  const overshoot = coverage > 110;
  const undershoot = coverage < 80;
  const color = overshoot ? '#ef4444' : undershoot ? '#f59e0b' : '#16a34a';
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-(--radius-sm) border border-(--color-border) bg-(--color-surface) p-3 text-left transition-colors hover:border-(--color-primary) hover:bg-[#fbfbf9]"
    >
      <div className="text-[10px] font-semibold tracking-wider text-(--color-muted) uppercase">
        {label}
      </div>
      <div className="mt-1 font-mono text-base tabular-nums">
        {applied}
        <span className="text-(--color-muted)">/{needs}</span>
        <span className="ml-1 text-[11px] text-(--color-muted)">kg</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-(--radius-pill) bg-[#f1f1ee]">
        <div
          className="h-full"
          style={{ width: `${Math.min(100, coverage)}%`, background: color }}
        />
      </div>
      <div className="mt-1.5 flex items-baseline justify-between text-[10px]">
        <span style={{ color }} className="font-semibold">
          {Math.round(coverage)} %
        </span>
        <span className="text-(--color-muted)">
          {remaining > 0
            ? `${remaining} kg restant`
            : remaining < 0
              ? `+${Math.abs(remaining)} kg`
              : 'OK'}
        </span>
      </div>
    </button>
  );
}

function RemainingCell({ label, value, unit }: { label: string; value: number; unit: string }) {
  const color = value > 0 ? '#f59e0b' : value < 0 ? '#ef4444' : '#16a34a';
  return (
    <div className="rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9] p-3">
      <div className="text-[10px] font-semibold tracking-wider text-(--color-muted) uppercase">
        {label}
      </div>
      <div className="mt-1 font-mono text-base font-semibold tabular-nums" style={{ color }}>
        {value > 0 ? '' : value < 0 ? '+' : ''}
        {Math.abs(value)} {unit}
      </div>
    </div>
  );
}
