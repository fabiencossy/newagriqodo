import type { AssolementSegment } from './assolement.types';
import { ASSOLEMENT_SEGMENTS } from './assolement.mocks';

/**
 * Retourne les segments d'une parcelle qui intersectent l'année `year`
 * (i.e. dont [startDate, endDate] chevauche [01/01/year, 31/12/year]).
 * Triés par startDate croissant.
 */
export function getSegmentsForParcelYear(
  parcelId: string,
  year: number,
  list: ReadonlyArray<AssolementSegment> = ASSOLEMENT_SEGMENTS,
): AssolementSegment[] {
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  return list
    .filter((s) => s.parcelId === parcelId && s.endDate >= yearStart && s.startDate <= yearEnd)
    .sort((a, b) => (a.startDate < b.startDate ? -1 : 1));
}

/**
 * Compte les jours d'occupation d'un segment dans une année donnée
 * (intersection avec [01/01, 31/12]).
 */
export function segmentDaysInYear(segment: AssolementSegment, year: number): number {
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  const start = segment.startDate > yearStart ? segment.startDate : yearStart;
  const end = segment.endDate < yearEnd ? segment.endDate : yearEnd;
  if (start > end) return 0;
  return daysBetween(start, end) + 1;
}

/**
 * Culture dominante en jours d'occupation pour une parcelle sur une année.
 * Utilisée par la table du Plan d'assolement (1 ligne = 1 parcelle).
 */
export function getDominantCulture(
  parcelId: string,
  year: number,
  list: ReadonlyArray<AssolementSegment> = ASSOLEMENT_SEGMENTS,
): { culture: string; days: number; segment: AssolementSegment } | undefined {
  const segments = getSegmentsForParcelYear(parcelId, year, list);
  if (segments.length === 0) return undefined;

  const byCulture = new Map<string, { days: number; segment: AssolementSegment }>();
  for (const s of segments) {
    const days = segmentDaysInYear(s, year);
    const existing = byCulture.get(s.culture);
    if (!existing || existing.days < days) {
      byCulture.set(s.culture, { days, segment: s });
    } else {
      existing.days += days;
    }
  }
  const best = [...byCulture.entries()].sort(([, a], [, b]) => b.days - a.days)[0];
  if (!best) return undefined;
  return { culture: best[0], days: best[1].days, segment: best[1].segment };
}

/**
 * Segment actif à une date donnée (instant T) — pilote la couleur de la
 * parcelle sur la carte du module Parcellaire.
 */
export function getActiveSegment(
  parcelId: string,
  date: string,
  list: ReadonlyArray<AssolementSegment> = ASSOLEMENT_SEGMENTS,
): AssolementSegment | undefined {
  return list.find((s) => s.parcelId === parcelId && s.startDate <= date && s.endDate >= date);
}

/**
 * Années pour lesquelles il existe au moins un segment.
 * Plus récente en premier.
 */
export function getAvailableYears(
  list: ReadonlyArray<AssolementSegment> = ASSOLEMENT_SEGMENTS,
): number[] {
  const years = new Set<number>();
  for (const s of list) {
    const startY = Number(s.startDate.slice(0, 4));
    const endY = Number(s.endDate.slice(0, 4));
    for (let y = startY; y <= endY; y++) years.add(y);
  }
  return [...years].sort((a, b) => b - a);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00Z`).getTime();
  const db = new Date(`${b}T00:00:00Z`).getTime();
  return Math.round((db - da) / 86_400_000);
}
