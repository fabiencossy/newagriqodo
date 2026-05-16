import { useMemo, useState } from 'react';
import { DetailPanel } from '../../components/DetailPanel';
import type { ParcelDetail } from './parcellaire.mocks';
import { AssolementTimeline } from '../assolement/AssolementTimeline';
import { AssolementSegmentModal } from '../assolement/AssolementSegmentModal';
import { getActiveSegment, getSegmentsForParcelYear } from '../assolement/assolement.helpers';
import { useSegments } from '../assolement/assolement.store';
import { cultureColor } from '../assolement/cultures';
import type { AssolementSegment } from '../assolement/assolement.types';

const TODAY = new Date().toISOString().slice(0, 10);

interface ParcelleSummaryPanelProps {
  parcel: ParcelDetail;
  onClose: () => void;
  onOpenFiche: () => void;
  onOpenAssolement: () => void;
}

/**
 * Panneau riche affiché au clic sur une parcelle dans la carte du Parcellaire.
 * Synthèse : assolement courant, dernières interventions (mock), notes.
 * Footer avec bouton pour ouvrir la fiche complète.
 *
 * Les blocs "Stade phénologique" et "Bilan de fumure" mock ont été retirés —
 * le bilan de fumure réel est dans la fiche parcelle (FumureSection branchée
 * au Carnet via fertilizerSummary).
 */
export function ParcelleSummaryPanel({
  parcel,
  onClose,
  onOpenFiche,
  onOpenAssolement,
}: ParcelleSummaryPanelProps) {
  const year = parcel.year;
  const allSegments = useSegments();
  const segments = useMemo(
    () => getSegmentsForParcelYear(parcel.id, year, allSegments),
    [parcel.id, year, allSegments],
  );
  const active = useMemo(
    () => getActiveSegment(parcel.id, TODAY, allSegments),
    [parcel.id, allSegments],
  );
  const [editingSegment, setEditingSegment] = useState<
    AssolementSegment | { draft: true; parcelId: string; year: number } | null
  >(null);

  // Mocks Phase 2.5 (interventions à brancher au Carnet réel — Phase 3)
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
      <Section title="Plan d'assolement">
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

        {/* Timeline cliquable + gros bouton "Ajouter un segment" via onAdd (variant detail) */}
        <AssolementTimeline
          segments={segments}
          year={year}
          variant="detail"
          today={TODAY}
          onSegmentClick={(s) => setEditingSegment(s)}
          onAdd={() => setEditingSegment({ draft: true, parcelId: parcel.id, year })}
        />

        {/* Liste des segments éditables (pattern de l'éditeur d'assolement) */}
        {segments.length > 0 && (
          <div className="mt-4">
            <h3 className="m-0 mb-2 text-[10px] font-semibold tracking-wider text-(--color-muted) uppercase">
              Segments
            </h3>
            <ul className="m-0 space-y-1.5 list-none p-0">
              {segments.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setEditingSegment(s)}
                    className="flex w-full items-center gap-2 rounded-(--radius-sm) border border-(--color-border) bg-(--color-surface) px-2.5 py-2 text-left text-sm hover:bg-[#fbfbf9]"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block h-3 w-3 shrink-0 rounded-(--radius-pill)"
                      style={{ background: cultureColor(s.culture) }}
                    />
                    <span className="min-w-0 flex-1 truncate">
                      <span className="font-medium">{s.culture}</span>
                      {s.varietyName && (
                        <span className="text-(--color-muted)"> · {s.varietyName}</span>
                      )}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-(--color-muted)">
                      {fmtDate(s.startDate)} → {fmtDate(s.endDate)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-2 text-right">
          <button
            type="button"
            onClick={onOpenAssolement}
            className="text-[11px] font-medium text-(--color-primary) hover:underline"
          >
            Voir le plan complet →
          </button>
        </div>
      </Section>

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

      {/* Modal d'édition de segment — accessible depuis le panel sans quitter la carte. */}
      {editingSegment && (
        <AssolementSegmentModal target={editingSegment} onClose={() => setEditingSegment(null)} />
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

/* ============ Mocks à brancher au Carnet réel (Phase 3) ============ */

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
