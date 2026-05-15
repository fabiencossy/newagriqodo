import { useSyncExternalStore } from 'react';
import { PARCELLES as INITIAL, type ParcelDetail } from './parcellaire.mocks';

/**
 * Store partagé des parcelles. Permet aux pages Parcellaire et
 * Plan d'assolement de voir les imports faits depuis l'une ou l'autre.
 *
 * Implémentation : pattern pub/sub minimal compatible useSyncExternalStore.
 * Remplaçable plus tard par un store TanStack Query / Zustand quand on
 * branchera Odoo.
 */

let parcels: ReadonlyArray<ParcelDetail> = [...INITIAL];
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

export function getParcels(): ReadonlyArray<ParcelDetail> {
  return parcels;
}

export function subscribeParcels(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function addParcels(additions: ReadonlyArray<ParcelDetail>): void {
  if (additions.length === 0) return;
  parcels = [...parcels, ...additions];
  emit();
}

export function updateParcel(id: string, patch: Partial<ParcelDetail>): void {
  parcels = parcels.map((p) => (p.id === id ? { ...p, ...patch } : p));
  emit();
}

export function removeParcel(id: string): void {
  parcels = parcels.filter((p) => p.id !== id);
  emit();
}

export function useParcels(): ReadonlyArray<ParcelDetail> {
  return useSyncExternalStore(subscribeParcels, getParcels, getParcels);
}
