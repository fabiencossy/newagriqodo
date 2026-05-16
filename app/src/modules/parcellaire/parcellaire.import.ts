import shp from 'shpjs';
import type { Feature, MultiPolygon, Polygon } from 'geojson';
import type { ParcelDetail } from './parcellaire.mocks';

/** Surface (ha) approximée par shoelace + correction latitude. */
export function estimateSurfaceHa(geom: Polygon | MultiPolygon): number {
  const polygons = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  let total = 0;
  for (const polygon of polygons) {
    const outer = polygon[0];
    if (!outer || outer.length < 4) continue;
    let area = 0;
    for (let i = 0; i < outer.length - 1; i++) {
      const [x1, y1] = outer[i]!;
      const [x2, y2] = outer[i + 1]!;
      area += x1! * y2! - x2! * y1!;
    }
    area = Math.abs(area) / 2;
    const meanLat = outer.reduce((s, p) => s + p[1]!, 0) / outer.length;
    const mPerDegLat = 111_320;
    const mPerDegLng = 111_320 * Math.cos((meanLat * Math.PI) / 180);
    total += (area * mPerDegLat * mPerDegLng) / 10_000;
  }
  return total;
}

/**
 * Convertit un tableau de Features GeoJSON en ParcelDetail.
 * Filtre les géométries non-polygonales. Génère un id si manquant.
 * Tente de retrouver name / surface depuis les propriétés courantes.
 */
export function featuresToParcels(features: ReadonlyArray<Feature>): ParcelDetail[] {
  const additions: ParcelDetail[] = [];
  const year = new Date().getFullYear();
  for (const f of features) {
    if (!f.geometry) continue;
    if (f.geometry.type !== 'Polygon' && f.geometry.type !== 'MultiPolygon') continue;
    const props = (f.properties ?? {}) as Record<string, unknown>;
    const id = String(
      props.id ?? props.code ?? props.ID ?? `IMP-${Date.now()}-${additions.length}`,
    );
    const name = String(props.name ?? props.nom ?? props.Name ?? props.NAME ?? `Parcelle ${id}`);
    const provided = Number(props.surfaceHa ?? props.surface ?? props.area_ha ?? 0);
    const surfaceHa =
      Number.isFinite(provided) && provided > 0
        ? provided
        : estimateSurfaceHa(f.geometry as Polygon | MultiPolygon);
    additions.push({
      id,
      name,
      surfaceHa,
      status: 'active',
      year,
      geometry: f.geometry as Polygon | MultiPolygon,
    });
  }
  return additions;
}

/** Parse un fichier .geojson / .json en tableau de Features. */
export async function parseGeojsonFile(file: File): Promise<Feature[]> {
  const text = await file.text();
  const json = JSON.parse(text);
  if (json?.type === 'FeatureCollection') return json.features as Feature[];
  if (json?.type === 'Feature') return [json as Feature];
  return [];
}

/** Parse un fichier .zip Shapefile en tableau de Features. */
export async function parseShapefile(file: File): Promise<Feature[]> {
  const buffer = await file.arrayBuffer();
  const result = await shp(buffer);
  const collections = Array.isArray(result) ? result : [result];
  return collections.flatMap((c) => c.features as Feature[]);
}
