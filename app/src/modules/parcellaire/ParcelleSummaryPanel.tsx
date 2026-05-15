import { useMemo } from 'react';
import { DetailPanel } from '../../components/DetailPanel';
import type { ParcelDetail } from './parcellaire.mocks';
import { AssolementTimeline } from '../assolement/AssolementTimeline';
import { getActiveSegment, getSegmentsForParcelYear } from '../assolement/assolement.helpers';
import { cultureColor } from '../assolement/cultures';

const TODAY = new Date().toISOString().slice(0, 10);

interface ParcelleSummaryPanelProps {
  parcel: ParcelDetail;
  onClose: () => void;
  onOpenFiche: () => void;
  onOpenAssolement: () => void;
}

/**
 * Panneau riche affiché au clic sur une parcelle dans la carte du Parcellaire.
 * Synthèse complète : assolement, stade phéno, bilan de fumure, dernières
 * interventions, notes. Footer avec bouton pour ouvrir la fiche complète.
 *
 * Les sections "Stade", "Fumure" et "Interventions" sont des mocks Phase 2.5
 * en attente du Carnet des champs et de l'intégration Odoo.
 */
export function ParcelleSummaryPanel({
  parcel,
  onClose,
  onOpenFiche,
  onOpenAssolement,
}: ParcelleSummaryPanelProps) {
  const year = parcel.year;
  const segments = useMemo(() => getSegmentsForParcelYear(parcel.id, year), [parcel.id, year]);
  const active = useMemo(() => getActiveSegment(parcel.id, TODAY), [parcel.id]);

  // Mocks Phase 2.5
  const stade = mockStade(active?.culture);
  const fumure = mockFumure(active?.culture);
  const interventions = mockInterventions(parcel.id);

  return (
    <DetailPanel
      title={`${parcel.id} — ${parcel.name}`}
      subtitle={`${parcel.surfaceHa.toFixed(2)} ha${active ? ` · ${active.culture}` : ''}`}
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={onOpenFiche}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-(--radius) border border-(--color-primary) bg-(--color-primary) px-4 text-sm font-medium text-white hover:bg-(--color-primary-hover)"
        >
          Ouvrir la fiche complète
          <ArrowRightIcon />
        </button>
      }
    >
      {/* Assolement */}
      <Section title="Plan d'assolement" actionLabel="Voir le plan" onAction={onOpenAssolement}>
        {/* Culture EN PLACE aujourd'hui — pas de "dominant" inutile. */}
        <div className="mb-3 rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9] p-2.5">
          {active ? (
            <div className="flex items-center gap-2 text-sm font-medium">
              <span
                aria-hidden="true"
                className="inline-block h-3 w-3 shrink-0 rounded-(--radius-pill)"
                style={{ background: cultureColor(active.culture) }}
              />
              <span className="truncate">
                {active.culture}
                {active.varietyName ? ` · ${active.varietyName}` : ''}
              </span>
              <span className="ml-auto shrink-0 font-mono text-[11px] text-(--color-muted)">
                {fmtDate(active.startDate)} → {fmtDate(active.endDate)}
              </span>
            </div>
          ) : (
            <p className="m-0 text-sm text-(--color-muted)">Aucune culture en place aujourd'hui.</p>
          )}
        </div>
        <AssolementTimeline segments={segments} year={year} variant="detail" today={TODAY} />
      </Section>

      {/* Stade phénologique — masqué si pas de donnée pour la culture courante */}
      {stade && (
        <Section title="Stade phénologique">
          <div className="rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9] p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium">{stade.label}</span>
              <span className="font-mono text-[11px] text-(--color-muted)">{stade.progress} %</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-(--radius-pill) bg-[#f1f1ee]">
              <div
                className="h-full"
                style={{
                  width: `${stade.progress}%`,
                  background: active ? cultureColor(active.culture) : '#9ca3af',
                }}
              />
            </div>
            <p className="m-0 mt-2 text-xs text-(--color-muted)">{stade.note}</p>
          </div>
        </Section>
      )}

      {/* Bilan de fumure — masqué si pas de données */}
      {fumure && (
        <Section title="Bilan de fumure">
          <div className="grid grid-cols-3 gap-2">
            {fumure.map((f) => (
              <NutrientCard key={f.element} {...f} />
            ))}
          </div>
        </Section>
      )}

      {/* Dernières interventions */}
      <Section title="Dernières interventions" actionLabel="Carnet" onAction={onOpenFiche}>
        {interventions.length > 0 ? (
          <ul className="m-0 list-none space-y-1.5 p-0">
            {interventions.map((it) => (
              <li
                key={it.id}
                className="flex items-start gap-2.5 rounded-(--radius-sm) border border-(--color-border) bg-(--color-surface) px-2.5 py-2"
              >
                <span
                  aria-hidden="true"
                  className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-(--radius-pill)"
                  style={{ background: it.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium">{it.label}</span>
                    <span className="shrink-0 font-mono text-[11px] text-(--color-muted)">
                      {it.date}
                    </span>
                  </div>
                  {it.detail && (
                    <p className="m-0 truncate text-xs text-(--color-muted)">{it.detail}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Aucune intervention enregistrée.</Empty>
        )}
      </Section>

      {/* Notes */}
      {parcel.notes && (
        <Section title="Notes">
          <p className="m-0 rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9] p-3 text-sm whitespace-pre-line text-(--color-text)">
            {parcel.notes}
          </p>
        </Section>
      )}
    </DetailPanel>
  );
}

/* ============ Sous-composants ============ */

function Section({
  title,
  children,
  actionLabel,
  onAction,
}: {
  title: string;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <section className="mb-5">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h3 className="m-0 text-[11px] font-semibold tracking-wider text-(--color-muted) uppercase">
          {title}
        </h3>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="text-[11px] font-medium text-(--color-primary) hover:underline"
          >
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function NutrientCard({
  element,
  applied,
  needed,
  unit,
}: {
  element: string;
  applied: number;
  needed: number;
  unit: string;
}) {
  const ratio = needed > 0 ? Math.min(1, applied / needed) : 0;
  const overshoot = needed > 0 && applied > needed;
  const color = overshoot ? '#ef4444' : applied < needed * 0.6 ? '#f59e0b' : '#16a34a';
  return (
    <div className="rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9] p-2.5">
      <div className="text-[10px] font-semibold tracking-wider text-(--color-muted) uppercase">
        {element}
      </div>
      <div className="mt-1 font-mono text-sm tabular-nums">
        {applied}
        <span className="text-(--color-muted)">/{needed}</span>
        <span className="ml-0.5 text-[10px] text-(--color-muted)">{unit}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-(--radius-pill) bg-[#f1f1ee]">
        <div className="h-full" style={{ width: `${ratio * 100}%`, background: color }} />
      </div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="m-0 text-xs text-(--color-muted)">{children}</p>;
}

function ArrowRightIcon() {
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
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function fmtDate(date: string): string {
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y!.slice(2)}`;
}

/* ============ Mocks Phase 2.5 ============ */

function mockStade(
  culture: string | undefined,
): { label: string; progress: number; note: string } | null {
  if (!culture) return null;
  // On ne montre un stade phéno QUE pour les cultures dont on a un BBCH précis ;
  // sinon la section est masquée (plutôt qu'un "Suivi standard" générique).
  const map: Record<string, { label: string; progress: number; note: string }> = {
    "Blé d'automne": {
      label: 'Tallage / Montaison',
      progress: 55,
      note: 'BBCH ~31. Surveiller maladies foliaires (septoriose).',
    },
    'Maïs ensilage': {
      label: 'Levée',
      progress: 15,
      note: 'BBCH ~10. Stade 2-3 feuilles attendu sous 10 jours.',
    },
    "Colza d'automne": {
      label: 'Floraison',
      progress: 75,
      note: 'BBCH ~65. Pleine floraison, attention méligèthes.',
    },
    "Orge d'automne": {
      label: 'Épiaison',
      progress: 70,
      note: 'BBCH ~55. Approche de la floraison.',
    },
  };
  return map[culture] ?? null;
}

function mockFumure(
  culture: string | undefined,
): Array<{ element: string; applied: number; needed: number; unit: string }> | null {
  if (!culture) return null;
  const needs: Record<string, [number, number, number]> = {
    "Blé d'automne": [180, 60, 90],
    'Blé de printemps': [160, 60, 80],
    'Maïs ensilage': [200, 70, 200],
    'Maïs grain': [200, 70, 200],
    "Colza d'automne": [220, 60, 110],
    "Orge d'automne": [150, 50, 80],
    'Orge de printemps': [130, 50, 70],
  };
  const need = needs[culture];
  if (!need) return null;
  // Apports simulés (faits jusqu'à présent)
  const applied: [number, number, number] = [
    Math.round(need[0] * 0.7),
    Math.round(need[1] * 0.9),
    Math.round(need[2] * 0.5),
  ];
  return [
    { element: 'N', applied: applied[0], needed: need[0], unit: 'kg/ha' },
    { element: 'P₂O₅', applied: applied[1], needed: need[1], unit: 'kg/ha' },
    { element: 'K₂O', applied: applied[2], needed: need[2], unit: 'kg/ha' },
  ];
}

function mockInterventions(parcelId: string): Array<{
  id: string;
  label: string;
  detail?: string;
  date: string;
  color: string;
}> {
  // Génère 3 interventions plausibles, pseudo-aléatoires sur l'id.
  const seed = parcelId.length;
  return [
    {
      id: `${parcelId}-i1`,
      label: 'Fertilisation azotée',
      detail: '60 kg N/ha (Nitrate ammoniacal)',
      date: `${10 + (seed % 5)}/04/26`,
      color: '#16a34a',
    },
    {
      id: `${parcelId}-i2`,
      label: 'Herbicide post-levée',
      detail: 'Sulfonylurée 25 g/ha',
      date: `${5 + (seed % 7)}/04/26`,
      color: '#f59e0b',
    },
    {
      id: `${parcelId}-i3`,
      label: 'Observation terrain',
      detail: 'Tallage régulier, sol ressuyé',
      date: `28/03/26`,
      color: '#3b82f6',
    },
  ];
}
