import { useSyncExternalStore } from 'react';
import { supabase } from '../../lib/supabase';
import { onAuthFarmChange } from '../../lib/auth-farm';
import { getAuth } from '../auth/auth.store';
import { getCurrentFarmId } from '../farms/farms.store';
import { ASSOLEMENT_SEGMENTS as MOCK_SEGMENTS } from './assolement.mocks';
import { mergeAdjacentSameCulture, resolveOverlaps } from './assolement.helpers';
import { cultureKeyByLabel, cultureLabelByKey } from './cultures';
import type { AssolementSegment } from './assolement.types';

/**
 * Store assolement_segments — pattern dual-mode.
 *
 * En mode démo : helpers locaux (resolveOverlaps + mergeAdjacent) appliqués
 * sur le cache et c'est tout.
 *
 * En mode auth : on garde la MÊME logique (résoudre les overlaps côté client
 * pour avoir un feedback instantané), puis on calcule le diff avant/après et
 * on synchronise vers Supabase :
 *   - segments ajoutés     -> INSERT
 *   - segments modifiés    -> UPDATE
 *   - segments supprimés   -> DELETE
 * Puis refetch pour aligner la source de vérité.
 */

let segments: ReadonlyArray<AssolementSegment> = [...MOCK_SEGMENTS];
let loading = false;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

// — Mapping DB row <-> AssolementSegment ——————————————————————————————

interface DbSegmentRow {
  id: string;
  farm_id: string;
  parcel_id: string;
  campaign: number;
  culture_key: string;
  variety: string | null;
  start_date: string;
  end_date: string;
  notes: string | null;
}

function rowToSegment(row: DbSegmentRow): AssolementSegment {
  return {
    id: row.id,
    parcelId: row.parcel_id,
    culture: cultureLabelByKey(row.culture_key) ?? row.culture_key,
    varietyName: row.variety ?? undefined,
    startDate: row.start_date,
    endDate: row.end_date,
    notes: row.notes ?? undefined,
  };
}

interface DbSegmentInsert {
  farm_id: string;
  parcel_id: string;
  campaign: number;
  culture_key: string;
  variety: string | null;
  start_date: string;
  end_date: string;
  notes: string | null;
}

function segmentToInsert(s: AssolementSegment, farmId: string): DbSegmentInsert {
  const year = Number(s.startDate.slice(0, 4)) || new Date().getFullYear();
  return {
    farm_id: farmId,
    parcel_id: s.parcelId,
    campaign: year,
    culture_key: cultureKeyByLabel(s.culture) ?? s.culture,
    variety: s.varietyName ?? null,
    start_date: s.startDate,
    end_date: s.endDate,
    notes: s.notes ?? null,
  };
}

// — Hydratation ————————————————————————————————————————————————————————

async function hydrateFromSupabase(farmId: string): Promise<void> {
  if (!supabase) return;
  loading = true;
  emit();
  try {
    const { data, error } = await supabase
      .from('assolement_segments')
      .select('*')
      .eq('farm_id', farmId)
      .order('start_date');
    if (error) {
      console.error('[assolement] hydrate failed:', error.message);
      segments = [];
    } else {
      segments = (data as DbSegmentRow[]).map(rowToSegment);
    }
  } finally {
    loading = false;
    emit();
  }
}

function resetToMocks(): void {
  segments = [...MOCK_SEGMENTS];
  emit();
}

/** Calcule add/update/delete entre 2 jeux de segments par id. */
function diffSegments(
  before: ReadonlyArray<AssolementSegment>,
  after: ReadonlyArray<AssolementSegment>,
): {
  added: AssolementSegment[];
  updated: AssolementSegment[];
  deletedIds: string[];
} {
  const beforeById = new Map(before.map((s) => [s.id, s]));
  const afterById = new Map(after.map((s) => [s.id, s]));
  const added: AssolementSegment[] = [];
  const updated: AssolementSegment[] = [];
  const deletedIds: string[] = [];
  for (const s of after) {
    const prev = beforeById.get(s.id);
    if (!prev) added.push(s);
    else if (JSON.stringify(prev) !== JSON.stringify(s)) updated.push(s);
  }
  for (const s of before) {
    if (!afterById.has(s.id)) deletedIds.push(s.id);
  }
  return { added, updated, deletedIds };
}

async function syncDiff(
  before: ReadonlyArray<AssolementSegment>,
  after: ReadonlyArray<AssolementSegment>,
  farmId: string,
): Promise<void> {
  if (!supabase) return;
  const { added, updated, deletedIds } = diffSegments(before, after);

  if (deletedIds.length > 0) {
    const { error } = await supabase.from('assolement_segments').delete().in('id', deletedIds);
    if (error) console.error('[assolement] delete failed:', error.message);
  }
  if (added.length > 0) {
    // Les nouveaux segments créés client-side ont un id généré localement.
    // En Supabase on laisse Postgres générer l'UUID -> on ne passe pas l'id.
    const rows = added.map((s) => segmentToInsert(s, farmId));
    const { error } = await supabase.from('assolement_segments').insert(rows);
    if (error) console.error('[assolement] insert failed:', error.message);
  }
  for (const s of updated) {
    const upd = segmentToInsert(s, farmId);
    const { error } = await supabase
      .from('assolement_segments')
      .update({
        parcel_id: upd.parcel_id,
        campaign: upd.campaign,
        culture_key: upd.culture_key,
        variety: upd.variety,
        start_date: upd.start_date,
        end_date: upd.end_date,
        notes: upd.notes,
      })
      .eq('id', s.id);
    if (error) console.error('[assolement] update failed:', error.message);
  }
}

// — API publique ———————————————————————————————————————————————————————

export function getSegments(): ReadonlyArray<AssolementSegment> {
  return segments;
}

export function isAssolementLoading(): boolean {
  return loading;
}

export function subscribeSegments(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function saveSegment(segment: AssolementSegment): Promise<void> {
  const before = segments;
  const next = mergeAdjacentSameCulture(resolveOverlaps(segment, segments));
  segments = next;
  emit();
  if (getAuth().mode === 'authenticated' && supabase) {
    const farmId = getCurrentFarmId();
    if (farmId) {
      await syncDiff(before, next, farmId);
      await hydrateFromSupabase(farmId);
    }
  }
}

export async function removeSegment(id: string): Promise<void> {
  const before = segments;
  segments = mergeAdjacentSameCulture(segments.filter((s) => s.id !== id));
  emit();
  if (getAuth().mode === 'authenticated' && supabase) {
    const farmId = getCurrentFarmId();
    if (farmId) {
      await syncDiff(before, segments, farmId);
      await hydrateFromSupabase(farmId);
    }
  }
}

export function useSegments(): ReadonlyArray<AssolementSegment> {
  return useSyncExternalStore(subscribeSegments, getSegments, getSegments);
}

// — Bootstrap ——————————————————————————————————————————————————————————

let bootstrapped = false;
export function initAssolementBootstrap(): void {
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
