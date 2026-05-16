import { useSyncExternalStore } from 'react';
import { FARMS as INITIAL } from './farms.mocks';
import type { Farm } from './farms.types';

/**
 * Store de l'exploitation active (multi-tenancy MVP).
 *
 * En Phase 3, le `currentFarmId` filtrera l'ensemble des données (parcelles,
 * interventions, segments…) côté API Odoo. Pour l'instant, le switch est
 * visuel uniquement — les mocks sont tous Darval.
 */

const farms: ReadonlyArray<Farm> = [...INITIAL];
let currentFarmId: string = farms[0]?.id ?? '';
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

export function getFarms(): ReadonlyArray<Farm> {
  return farms;
}

export function getCurrentFarmId(): string {
  return currentFarmId;
}

export function getCurrentFarm(): Farm | undefined {
  return farms.find((f) => f.id === currentFarmId);
}

export function setCurrentFarmId(id: string): void {
  if (id === currentFarmId) return;
  if (!farms.some((f) => f.id === id)) return;
  currentFarmId = id;
  emit();
}

export function subscribeFarms(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useFarms(): ReadonlyArray<Farm> {
  return useSyncExternalStore(subscribeFarms, getFarms, getFarms);
}

export function useCurrentFarmId(): string {
  return useSyncExternalStore(subscribeFarms, getCurrentFarmId, getCurrentFarmId);
}
