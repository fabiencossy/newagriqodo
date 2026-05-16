import { useSyncExternalStore } from 'react';
import { INTERVENTIONS as INITIAL } from './carnet.mocks';
import type { Intervention } from './carnet.types';

/**
 * Store partagé des interventions du carnet des champs.
 * Permet à toutes les pages (Carnet module, ParcelleDetailPage, ParcelleSummaryPanel)
 * de voir les interventions saisies depuis n'importe où.
 *
 * Pattern pub/sub minimal compatible useSyncExternalStore — identique à
 * parcellaire.store.ts. Remplaçable par TanStack Query / Zustand quand on
 * branchera Odoo (Phase 3).
 */

let interventions: ReadonlyArray<Intervention> = [...INITIAL];
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

export function getInterventions(): ReadonlyArray<Intervention> {
  return interventions;
}

export function subscribeInterventions(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function addInterventions(additions: ReadonlyArray<Intervention>): void {
  if (additions.length === 0) return;
  interventions = [...interventions, ...additions];
  emit();
}

export function updateIntervention(id: string, patch: Partial<Intervention>): void {
  interventions = interventions.map((i) => (i.id === id ? { ...i, ...patch } : i));
  emit();
}

export function removeIntervention(id: string): void {
  interventions = interventions.filter((i) => i.id !== id);
  emit();
}

export function removeInterventions(ids: ReadonlyArray<string>): void {
  if (ids.length === 0) return;
  const set = new Set(ids);
  interventions = interventions.filter((i) => !set.has(i.id));
  emit();
}

export function useInterventions(): ReadonlyArray<Intervention> {
  return useSyncExternalStore(subscribeInterventions, getInterventions, getInterventions);
}
