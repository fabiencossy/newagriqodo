import { useSyncExternalStore } from 'react';
import { PARCEL_GROUPS as INITIAL } from './parcel-groups.mocks';
import type { ParcelGroup } from './parcel-groups.types';

/**
 * Store des groupes de parcelles. Pub/sub minimal, à brancher Odoo Phase 3.
 */

let groups: ReadonlyArray<ParcelGroup> = [...INITIAL];
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

export function getParcelGroups(): ReadonlyArray<ParcelGroup> {
  return groups;
}

export function getParcelGroupById(id: string | undefined): ParcelGroup | undefined {
  if (!id) return undefined;
  return groups.find((g) => g.id === id);
}

/** Retourne les groupes actifs à la date donnée et qui contiennent la parcelle. */
export function findActiveGroupsForParcel(
  parcelId: string,
  atDate: string,
): ReadonlyArray<ParcelGroup> {
  return groups.filter(
    (g) => g.parcelIds.includes(parcelId) && g.startDate <= atDate && g.endDate >= atDate,
  );
}

export function addParcelGroup(group: ParcelGroup): void {
  groups = [...groups, group];
  emit();
}

export function updateParcelGroup(id: string, patch: Partial<ParcelGroup>): void {
  groups = groups.map((g) => (g.id === id ? { ...g, ...patch } : g));
  emit();
}

export function removeParcelGroup(id: string): void {
  groups = groups.filter((g) => g.id !== id);
  emit();
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
