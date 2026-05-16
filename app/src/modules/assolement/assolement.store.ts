import { useSyncExternalStore } from 'react';
import { ASSOLEMENT_SEGMENTS as INITIAL } from './assolement.mocks';
import type { AssolementSegment } from './assolement.types';
import { mergeAdjacentSameCulture, resolveOverlaps } from './assolement.helpers';

/**
 * Store partagé des segments d'assolement.
 *
 * Permet à toutes les pages (AssolementPage, ParcelleDetailPage, ParcellaireSummaryPanel,
 * vue Assolement à l'intérieur de ParcellairePage) d'éditer les segments avec
 * une source de vérité commune et la même logique de découpe (resolveOverlaps)
 * + fusion adjacente (mergeAdjacentSameCulture).
 *
 * Pattern pub/sub minimal compatible useSyncExternalStore — identique aux autres
 * stores du projet. À remplacer par TanStack Query / Zustand quand on branchera
 * Odoo (Phase 3, modèle `agri.assolement.segment` custom).
 */

let segments: ReadonlyArray<AssolementSegment> = [...INITIAL];
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

export function getSegments(): ReadonlyArray<AssolementSegment> {
  return segments;
}

export function subscribeSegments(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Sauvegarde (insert ou update) d'un segment.
 * Applique resolveOverlaps (pas 2 cultures simultanées sur la même parcelle)
 * puis mergeAdjacentSameCulture (fusion segments adjacents même culture).
 */
export function saveSegment(segment: AssolementSegment): void {
  const next = mergeAdjacentSameCulture(resolveOverlaps(segment, segments));
  segments = next;
  emit();
}

export function removeSegment(id: string): void {
  segments = mergeAdjacentSameCulture(segments.filter((s) => s.id !== id));
  emit();
}

export function useSegments(): ReadonlyArray<AssolementSegment> {
  return useSyncExternalStore(subscribeSegments, getSegments, getSegments);
}
