import { useSyncExternalStore } from 'react';
import { supabase } from '../../lib/supabase';
import { onAuthFarmChange } from '../../lib/auth-farm';
import { getAuth } from '../auth/auth.store';
import { getCurrentFarmId } from '../farms/farms.store';
import { INTERVENTIONS as MOCK_INTERVENTIONS } from './carnet.mocks';
import type { Intervention, InterventionCategory } from './carnet.types';

/**
 * Store carnet des champs — pattern dual-mode.
 *
 * Modèle DB :
 *   - interventions (1 row par action) avec colonne `category` texte
 *     (préserve la catégorie front granulaire) + metadata jsonb pour
 *     les champs sous-type spécifiques (N/P/K, OFAG, rendement, …)
 *   - intervention_parcels (N:N) : pour le MVP, on garde 1 parcelle par
 *     intervention (front : `parcelId: string` unique).
 *   - intervention_products (N:N) : 0 ou 1 produit par intervention,
 *     stocké via productId / productName en front.
 *
 * Pour économiser les round-trips, hydrate fait 1 seule requête avec
 * select imbriqué (`*, intervention_parcels(parcel_id), intervention_products(*)`).
 */

let interventions: ReadonlyArray<Intervention> = [...MOCK_INTERVENTIONS];
let loading = false;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

// — Mapping catégorie front <-> type enum DB ——————————————————————————

const CATEGORY_TO_DB_TYPE: Record<InterventionCategory, string> = {
  sowing: 'semis',
  fertilization: 'fertilisation',
  phyto: 'phyto',
  tillage: 'travail_sol',
  cultural: 'autre',
  harvest: 'recolte',
  observation: 'observation',
  irrigation: 'irrigation',
  other: 'autre',
};

interface DbInterventionRow {
  id: string;
  farm_id: string;
  date: string;
  type: string;
  category: string | null;
  sub_type: string | null;
  duration_hours: number | null;
  worker_id: string | null;
  notes: string | null;
  bbch_stage: string | null;
  weather: string | null;
  metadata: Record<string, unknown>;
  intervention_parcels: { parcel_id: string }[];
  intervention_products: {
    product_id: string;
    dose: number;
    unit: string;
    total_quantity: number | null;
  }[];
}

function rowToIntervention(row: DbInterventionRow): Intervention {
  const meta = row.metadata ?? {};
  const parcelId = row.intervention_parcels?.[0]?.parcel_id ?? '';
  const product = row.intervention_products?.[0];
  const category = (row.category as InterventionCategory) ?? 'other';
  return {
    id: row.id,
    parcelId,
    date: row.date,
    category,
    subType: row.sub_type ?? undefined,
    productId: product?.product_id ?? (meta.productId as string) ?? undefined,
    productName: (meta.productName as string) ?? undefined,
    ofagNumber: (meta.ofagNumber as string) ?? undefined,
    surfaceTreatedHa: (meta.surfaceTreatedHa as number) ?? undefined,
    doseValue: product?.dose ?? (meta.doseValue as number) ?? undefined,
    doseUnit: product?.unit ?? (meta.doseUnit as string) ?? undefined,
    nKgPerHa: (meta.nKgPerHa as number) ?? undefined,
    pKgPerHa: (meta.pKgPerHa as number) ?? undefined,
    kKgPerHa: (meta.kKgPerHa as number) ?? undefined,
    fertilizationType: meta.fertilizationType as Intervention['fertilizationType'],
    phytoType: meta.phytoType as Intervention['phytoType'],
    withholdingDays: (meta.withholdingDays as number) ?? undefined,
    bbchStage: row.bbch_stage ? Number(row.bbch_stage) : undefined,
    yieldValue: (meta.yieldValue as number) ?? undefined,
    yieldUnit: (meta.yieldUnit as string) ?? undefined,
    operatorId: row.worker_id ?? undefined,
    operator: (meta.operator as string) ?? undefined,
    durationHours: row.duration_hours ?? undefined,
    weather: row.weather ?? undefined,
    notes: row.notes ?? undefined,
  };
}

interface DbInterventionInsert {
  farm_id: string;
  date: string;
  type: string;
  category: string;
  sub_type: string | null;
  duration_hours: number | null;
  worker_id: string | null;
  notes: string | null;
  bbch_stage: string | null;
  weather: string | null;
  created_by: string | null;
  metadata: Record<string, unknown>;
}

function interventionToInsert(i: Intervention, farmId: string): DbInterventionInsert {
  return {
    farm_id: farmId,
    date: i.date,
    type: CATEGORY_TO_DB_TYPE[i.category] ?? 'autre',
    category: i.category,
    sub_type: i.subType ?? null,
    duration_hours: i.durationHours ?? null,
    worker_id: i.operatorId ?? null,
    notes: i.notes ?? null,
    bbch_stage: i.bbchStage != null ? String(i.bbchStage) : null,
    weather: i.weather ?? null,
    created_by: getAuth().userId ?? null,
    metadata: {
      productId: i.productId,
      productName: i.productName,
      ofagNumber: i.ofagNumber,
      surfaceTreatedHa: i.surfaceTreatedHa,
      doseValue: i.doseValue,
      doseUnit: i.doseUnit,
      nKgPerHa: i.nKgPerHa,
      pKgPerHa: i.pKgPerHa,
      kKgPerHa: i.kKgPerHa,
      fertilizationType: i.fertilizationType,
      phytoType: i.phytoType,
      withholdingDays: i.withholdingDays,
      yieldValue: i.yieldValue,
      yieldUnit: i.yieldUnit,
      operator: i.operator,
    },
  };
}

// — Hydratation ————————————————————————————————————————————————————————

async function hydrateFromSupabase(farmId: string): Promise<void> {
  if (!supabase) return;
  loading = true;
  emit();
  try {
    const { data, error } = await supabase
      .from('interventions')
      .select(
        '*, intervention_parcels(parcel_id), intervention_products(product_id, dose, unit, total_quantity)',
      )
      .eq('farm_id', farmId)
      .order('date', { ascending: false });
    if (error) {
      console.error('[carnet] hydrate failed:', error.message);
      interventions = [];
    } else {
      interventions = (data as unknown as DbInterventionRow[]).map(rowToIntervention);
    }
  } finally {
    loading = false;
    emit();
  }
}

function resetToMocks(): void {
  interventions = [...MOCK_INTERVENTIONS];
  emit();
}

/** Sync les liens N:N (parcel + product) pour 1 intervention. Strategy : delete + re-insert. */
async function syncInterventionLinks(i: Intervention): Promise<void> {
  if (!supabase) return;
  // Parcels
  await supabase.from('intervention_parcels').delete().eq('intervention_id', i.id);
  if (i.parcelId) {
    const { error } = await supabase
      .from('intervention_parcels')
      .insert({ intervention_id: i.id, parcel_id: i.parcelId });
    if (error) console.error('[carnet] insert parcel link failed:', error.message);
  }
  // Products
  await supabase.from('intervention_products').delete().eq('intervention_id', i.id);
  if (i.productId && i.doseValue != null && i.doseUnit) {
    const { error } = await supabase.from('intervention_products').insert({
      intervention_id: i.id,
      product_id: i.productId,
      dose: i.doseValue,
      unit: i.doseUnit,
      total_quantity: i.surfaceTreatedHa && i.doseValue ? i.surfaceTreatedHa * i.doseValue : null,
    });
    if (error) console.error('[carnet] insert product link failed:', error.message);
  }
}

// — API publique ———————————————————————————————————————————————————————

export function getInterventions(): ReadonlyArray<Intervention> {
  return interventions;
}

export function isCarnetLoading(): boolean {
  return loading;
}

export function subscribeInterventions(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function addInterventions(additions: ReadonlyArray<Intervention>): Promise<void> {
  if (additions.length === 0) return;
  if (getAuth().mode !== 'authenticated' || !supabase) {
    interventions = [...interventions, ...additions];
    emit();
    return;
  }
  const farmId = getCurrentFarmId();
  if (!farmId) return;
  for (const i of additions) {
    const { data, error } = await supabase
      .from('interventions')
      .insert(interventionToInsert(i, farmId))
      .select('id')
      .single();
    if (error || !data) {
      console.error('[carnet] insert failed:', error?.message);
      continue;
    }
    await syncInterventionLinks({ ...i, id: data.id });
  }
  await hydrateFromSupabase(farmId);
}

export async function updateIntervention(id: string, patch: Partial<Intervention>): Promise<void> {
  if (getAuth().mode !== 'authenticated' || !supabase) {
    interventions = interventions.map((i) => (i.id === id ? { ...i, ...patch } : i));
    emit();
    return;
  }
  const current = interventions.find((i) => i.id === id);
  if (!current) return;
  const merged = { ...current, ...patch };
  const farmId = getCurrentFarmId();
  const upd = interventionToInsert(merged, farmId);
  const { error } = await supabase
    .from('interventions')
    .update({
      date: upd.date,
      type: upd.type,
      category: upd.category,
      sub_type: upd.sub_type,
      duration_hours: upd.duration_hours,
      worker_id: upd.worker_id,
      notes: upd.notes,
      bbch_stage: upd.bbch_stage,
      weather: upd.weather,
      metadata: upd.metadata,
    })
    .eq('id', id);
  if (error) {
    console.error('[carnet] update failed:', error.message);
    return;
  }
  await syncInterventionLinks(merged);
  await hydrateFromSupabase(farmId);
}

export async function removeIntervention(id: string): Promise<void> {
  if (getAuth().mode !== 'authenticated' || !supabase) {
    interventions = interventions.filter((i) => i.id !== id);
    emit();
    return;
  }
  const farmId = getCurrentFarmId();
  const { error } = await supabase.from('interventions').delete().eq('id', id);
  if (error) {
    console.error('[carnet] delete failed:', error.message);
    return;
  }
  await hydrateFromSupabase(farmId);
}

export async function removeInterventions(ids: ReadonlyArray<string>): Promise<void> {
  if (ids.length === 0) return;
  if (getAuth().mode !== 'authenticated' || !supabase) {
    const set = new Set(ids);
    interventions = interventions.filter((i) => !set.has(i.id));
    emit();
    return;
  }
  const farmId = getCurrentFarmId();
  const { error } = await supabase
    .from('interventions')
    .delete()
    .in('id', [...ids]);
  if (error) {
    console.error('[carnet] bulk delete failed:', error.message);
    return;
  }
  await hydrateFromSupabase(farmId);
}

export function useInterventions(): ReadonlyArray<Intervention> {
  return useSyncExternalStore(subscribeInterventions, getInterventions, getInterventions);
}

// — Bootstrap ——————————————————————————————————————————————————————————

let bootstrapped = false;
export function initCarnetBootstrap(): void {
  if (bootstrapped) return;
  bootstrapped = true;
  onAuthFarmChange((ctx) => {
    if (ctx.isRealFarm) {
      void hydrateFromSupabase(ctx.farmId);
    } else {
      resetToMocks();
    }
  });
}
