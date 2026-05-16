import { useSyncExternalStore } from 'react';
import { supabase } from '../../lib/supabase';
import { onAuthFarmChange } from '../../lib/auth-farm';
import { getAuth } from '../auth/auth.store';
import { getCurrentFarmId } from '../farms/farms.store';
import { PARCEL_GROUPS as MOCK_GROUPS } from './parcel-groups.mocks';
import type { ParcelGroup } from './parcel-groups.types';

/**
 * Store groupes de parcelles — pattern dual-mode.
 *
 * - DB : `parcel_groups` (1 row par groupe) + `parcel_group_members`
 *   (N:N parcels). On joint les deux à la lecture.
 * - À l'écriture, on fait 2 requêtes : INSERT/UPDATE du groupe + DELETE
 *   puis INSERT des members.
 */

let groups: ReadonlyArray<ParcelGroup> = [...MOCK_GROUPS];
let loading = false;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

// — Mapping ————————————————————————————————————————————————————————————

interface DbGroupRow {
  id: string;
  name: string;
  color: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  members: { parcel_id: string }[];
}

function rowToGroup(row: DbGroupRow): ParcelGroup {
  return {
    id: row.id,
    name: row.name,
    description: row.notes ?? undefined,
    parcelIds: (row.members ?? []).map((m) => m.parcel_id),
    startDate: row.start_date ?? '',
    endDate: row.end_date ?? '',
    color: row.color ?? '#1f7a4d',
  };
}

// — Hydratation ————————————————————————————————————————————————————————

async function hydrateFromSupabase(farmId: string): Promise<void> {
  if (!supabase) return;
  loading = true;
  emit();
  try {
    const { data, error } = await supabase
      .from('parcel_groups')
      .select(
        'id, name, color, start_date, end_date, notes, members:parcel_group_members(parcel_id)',
      )
      .eq('farm_id', farmId)
      .order('name');
    if (error) {
      console.error('[parcel-groups] hydrate failed:', error.message);
      groups = [];
    } else {
      groups = (data as unknown as DbGroupRow[]).map(rowToGroup);
    }
  } finally {
    loading = false;
    emit();
  }
}

function resetToMocks(): void {
  groups = [...MOCK_GROUPS];
  emit();
}

async function syncMembers(groupId: string, parcelIds: ReadonlyArray<string>): Promise<void> {
  if (!supabase) return;
  // Stratégie simple : on remplace tout (DELETE puis INSERT). À optimiser
  // si N grand (~100+).
  const { error: delErr } = await supabase
    .from('parcel_group_members')
    .delete()
    .eq('group_id', groupId);
  if (delErr) {
    console.error('[parcel-groups] delete members failed:', delErr.message);
    return;
  }
  if (parcelIds.length === 0) return;
  const rows = parcelIds.map((parcel_id) => ({ group_id: groupId, parcel_id }));
  const { error: insErr } = await supabase.from('parcel_group_members').insert(rows);
  if (insErr) console.error('[parcel-groups] insert members failed:', insErr.message);
}

// — API publique ———————————————————————————————————————————————————————

export function getParcelGroups(): ReadonlyArray<ParcelGroup> {
  return groups;
}

export function getParcelGroupById(id: string | undefined): ParcelGroup | undefined {
  if (!id) return undefined;
  return groups.find((g) => g.id === id);
}

export function findActiveGroupsForParcel(
  parcelId: string,
  atDate: string,
): ReadonlyArray<ParcelGroup> {
  return groups.filter(
    (g) => g.parcelIds.includes(parcelId) && g.startDate <= atDate && g.endDate >= atDate,
  );
}

export function isParcelGroupsLoading(): boolean {
  return loading;
}

export async function addParcelGroup(group: ParcelGroup): Promise<void> {
  if (getAuth().mode !== 'authenticated' || !supabase) {
    groups = [...groups, group];
    emit();
    return;
  }
  const farmId = getCurrentFarmId();
  if (!farmId) return;
  const { data, error } = await supabase
    .from('parcel_groups')
    .insert({
      farm_id: farmId,
      name: group.name,
      color: group.color,
      start_date: group.startDate || null,
      end_date: group.endDate || null,
      notes: group.description ?? null,
    })
    .select('id')
    .single();
  if (error || !data) {
    console.error('[parcel-groups] insert failed:', error?.message);
    return;
  }
  await syncMembers(data.id, group.parcelIds);
  await hydrateFromSupabase(farmId);
}

export async function updateParcelGroup(id: string, patch: Partial<ParcelGroup>): Promise<void> {
  if (getAuth().mode !== 'authenticated' || !supabase) {
    groups = groups.map((g) => (g.id === id ? { ...g, ...patch } : g));
    emit();
    return;
  }
  const current = groups.find((g) => g.id === id);
  if (!current) return;
  const merged = { ...current, ...patch };
  const farmId = getCurrentFarmId();
  const { error } = await supabase
    .from('parcel_groups')
    .update({
      name: merged.name,
      color: merged.color,
      start_date: merged.startDate || null,
      end_date: merged.endDate || null,
      notes: merged.description ?? null,
    })
    .eq('id', id);
  if (error) {
    console.error('[parcel-groups] update failed:', error.message);
    return;
  }
  if (patch.parcelIds) await syncMembers(id, patch.parcelIds);
  await hydrateFromSupabase(farmId);
}

export async function removeParcelGroup(id: string): Promise<void> {
  if (getAuth().mode !== 'authenticated' || !supabase) {
    groups = groups.filter((g) => g.id !== id);
    emit();
    return;
  }
  const farmId = getCurrentFarmId();
  const { error } = await supabase.from('parcel_groups').delete().eq('id', id);
  if (error) {
    console.error('[parcel-groups] delete failed:', error.message);
    return;
  }
  await hydrateFromSupabase(farmId);
}

export function subscribeParcelGroups(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useParcelGroups(): ReadonlyArray<ParcelGroup> {
  return useSyncExternalStore(subscribeParcelGroups, getParcelGroups, getParcelGroups);
}

// — Bootstrap ——————————————————————————————————————————————————————————

let bootstrapped = false;
export function initParcelGroupsBootstrap(): void {
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
