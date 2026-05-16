import { useMemo } from 'react';
import { useInterventions } from '../carnet/carnet.store';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  fertilizerSummary,
  getInterventionsForParcel,
} from '../carnet/carnet.helpers';
import { InterventionTypeIcon } from '../carnet/InterventionTypeIcon';
import type { InterventionCategory } from '../carnet/carnet.types';
import type { ParcelDetail } from './parcellaire.mocks';

interface ParcelleStatsProps {
  parcel: ParcelDetail;
}

/**
 * Statistiques agronomiques de la parcelle, calculées depuis le carnet réel.
 *
 * Affiche :
 * - Rendement par campagne (depuis interventions catégorie 'harvest')
 * - Apports cumulés N/P/K par campagne (fertilizerSummary)
 * - Nombre d'interventions par catégorie (compteurs)
 * - Total surface traitée vs surface parcelle (taux de couverture intervention)
 */
export function ParcelleStats({ parcel }: ParcelleStatsProps) {
  const allInterventions = useInterventions();
  const interventions = useMemo(
    () => getInterventionsForParcel(parcel.id, allInterventions),
    [parcel.id, allInterventions],
  );

  // Regroupement par campagne (année)
  const years = useMemo(() => {
    const set = new Set<number>();
    for (const i of interventions) set.add(Number(i.date.slice(0, 4)));
    return [...set].sort((a, b) => b - a);
  }, [interventions]);

  const yieldByYear = useMemo(() => {
    const map = new Map<number, { value: number; unit: string; date: string }>();
    for (const i of interventions) {
      if (i.category !== 'harvest' || i.yieldValue === undefined) continue;
      const y = Number(i.date.slice(0, 4));
      const existing = map.get(y);
      // Garder la dernière récolte de l'année (date la plus récente)
      if (!existing || i.date > existing.date) {
        map.set(y, { value: i.yieldValue, unit: i.yieldUnit ?? '', date: i.date });
      }
    }
    return map;
  }, [interventions]);

  const fumureByYear = useMemo(() => {
    const map = new Map<number, ReturnType<typeof fertilizerSummary>>();
    for (const y of years) {
      const yearStart = `${y}-01-01`;
      const yearEnd = `${y}-12-31`;
      map.set(
        y,
        fertilizerSummary(interventions, parcel.surfaceHa, { from: yearStart, to: yearEnd }),
      );
    }
    return map;
  }, [interventions, parcel.surfaceHa, years]);

  const countByCategory = useMemo(() => {
    const map = new Map<InterventionCategory, number>();
    for (const i of interventions) {
      map.set(i.category, (map.get(i.category) ?? 0) + 1);
    }
    return map;
  }, [interventions]);

  // Valeur max rendement pour normaliser les barres
  const maxYield = useMemo(() => {
    let max = 0;
    for (const { value } of yieldByYear.values()) {
      if (value > max) max = value;
    }
    return max;
  }, [yieldByYear]);

  if (interventions.length === 0) {
    return (
      <div className="rounded-(--radius) border border-dashed border-(--color-border) bg-(--color-surface) py-10 text-center text-sm text-(--color-muted)">
        Aucune donnée — saisir des interventions dans le Carnet pour voir les statistiques.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {/* Rendement par campagne */}
      <section className="rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5">
        <h3 className="m-0 mb-3 text-xs font-semibold tracking-wider text-(--color-muted) uppercase">
          Rendement par campagne
        </h3>
        {yieldByYear.size === 0 ? (
          <p className="m-0 text-sm text-(--color-muted)">Aucune récolte enregistrée.</p>
        ) : (
          <ul className="m-0 list-none space-y-2.5 p-0">
            {[...yieldByYear.entries()]
              .sort(([a], [b]) => b - a)
              .map(([year, { value, unit }]) => {
                const pct = maxYield > 0 ? (value / maxYield) * 100 : 0;
                return (
                  <li key={year}>
                    <div className="mb-1 flex items-baseline justify-between text-sm">
                      <span className="font-medium">{year}</span>
                      <span className="font-mono tabular-nums">
                        {value} <span className="text-(--color-muted)">{unit}</span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-(--radius-pill) bg-[#f1f1ee]">
                      <div className="h-full bg-(--color-primary)" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
      </section>

      {/* Apports cumulés N/P/K par campagne */}
      <section className="rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5">
        <h3 className="m-0 mb-3 text-xs font-semibold tracking-wider text-(--color-muted) uppercase">
          Apports cumulés N/P/K par campagne
        </h3>
        {fumureByYear.size === 0 ? (
          <p className="m-0 text-sm text-(--color-muted)">Aucune fertilisation enregistrée.</p>
        ) : (
          <ul className="m-0 list-none space-y-2 p-0">
            {[...fumureByYear.entries()]
              .sort(([a], [b]) => b - a)
              .filter(([, s]) => s.entries > 0)
              .map(([year, s]) => (
                <li
                  key={year}
                  className="rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9] p-3"
                >
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-sm font-medium">{year}</span>
                    <span className="text-[11px] text-(--color-muted)">
                      {s.entries} apport{s.entries > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs tabular-nums">
                    <NutrientCell label="N" value={s.nKg} />
                    <NutrientCell label="P₂O₅" value={s.pKg} />
                    <NutrientCell label="K₂O" value={s.kKg} />
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>

      {/* Compteur interventions par catégorie */}
      <section className="rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5 lg:col-span-2">
        <h3 className="m-0 mb-3 text-xs font-semibold tracking-wider text-(--color-muted) uppercase">
          Interventions par catégorie · {interventions.length} au total
        </h3>
        <ul className="m-0 grid grid-cols-2 list-none gap-2 p-0 sm:grid-cols-3 lg:grid-cols-5">
          {(Object.keys(CATEGORY_LABELS) as InterventionCategory[]).map((cat) => {
            const count = countByCategory.get(cat) ?? 0;
            if (count === 0) return null;
            return (
              <li
                key={cat}
                className="flex items-center gap-2 rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9] px-2.5 py-2"
              >
                <InterventionTypeIcon category={cat} size={14} withBackground />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] text-(--color-muted)">
                    {CATEGORY_LABELS[cat]}
                  </div>
                  <div
                    className="font-mono text-base font-semibold tabular-nums"
                    style={{ color: CATEGORY_COLORS[cat] }}
                  >
                    {count}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function NutrientCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-(--radius-sm) bg-(--color-surface) px-2 py-1.5">
      <div className="text-[9px] font-semibold tracking-wider text-(--color-muted) uppercase">
        {label}
      </div>
      <div className="text-sm font-bold">
        {value}
        <span className="ml-0.5 text-[10px] font-normal text-(--color-muted)">kg</span>
      </div>
    </div>
  );
}
