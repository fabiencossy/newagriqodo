import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import type { Parcel } from '../../components/MapView';
import { cultureColor } from '../assolement/cultures';
import darvalGeoJSON from './darval.geojson.json';

/**
 * Parcelles réelles du Domaine Darval — chargées depuis le fichier
 * `darval.geojson.json` (export VD GELAN 2026, 27 features).
 *
 * Mapping affectation Agridéa → culture du catalogue :
 *   513 → Blé d'automne
 *   601 → Prairie temporaire
 *   613 → Prairie naturelle (Prairies perm. fauche)
 *   616 → Pâturage (attenants)
 *   617 → Prairie extensive (Pâturages extensifs - SPB)
 *   521 → Maïs ensilage
 *   901 → Forêt          (status archived)
 *   902 → Surface improductive (status archived)
 */

export interface ParcelDetail extends Parcel {
  varietyName?: string;
  sowingDate?: string;
  notes?: string;
  year: number;
}

const AFFECTATION_TO_CULTURE: Record<string, string> = {
  '513': "Blé d'automne",
  '601': 'Prairie temporaire',
  '613': 'Prairie naturelle',
  '616': 'Pâturage',
  '617': 'Prairie extensive',
  '521': 'Maïs ensilage',
  '901': 'Forêt',
  '902': 'Surface improductive',
};

function affectationToCulture(affectation: string | undefined): string {
  if (!affectation) return 'Sol nu / Labour';
  const code = affectation.slice(0, 3);
  return AFFECTATION_TO_CULTURE[code] ?? 'Sol nu / Labour';
}

/** Surface (ha) approximée par shoelace + correction latitude. */
function estimateSurfaceHa(geom: Polygon | MultiPolygon): number {
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

/** Title-case les noms tout-majuscules. Conserve les autres tels quels. */
function prettifyName(name: string): string {
  const isAllCaps = name === name.toUpperCase();
  if (!isAllCaps) return name;
  return name
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w.length > 0 ? w[0]!.toUpperCase() + w.slice(1) : ''))
    .join(' ');
}

interface ParcelProperties {
  id?: string;
  parcel_nam?: string;
  affectatio?: string;
}

const VARIETIES: Record<string, string> = {
  "Blé d'automne": 'Arnold',
  'Maïs ensilage': 'Limagrain LG31.330',
};

const fc = darvalGeoJSON as unknown as FeatureCollection;

export const PARCELLES: ParcelDetail[] = fc.features
  .filter((f: Feature) =>
    Boolean(f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon')),
  )
  .map((f, idx): ParcelDetail => {
    const props = (f.properties ?? {}) as ParcelProperties;
    const id = props.id ?? `DARVAL-${idx + 1}`;
    const name = prettifyName(props.parcel_nam ?? `Parcelle ${idx + 1}`);
    const culture = affectationToCulture(props.affectatio);
    const surfaceHa = Number(estimateSurfaceHa(f.geometry as Polygon | MultiPolygon).toFixed(2));
    const status: ParcelDetail['status'] =
      culture === 'Forêt' || culture === 'Surface improductive' ? 'archived' : 'active';
    return {
      id,
      name,
      surfaceHa,
      culture,
      varietyName: VARIETIES[culture],
      year: 2026,
      status,
      color: cultureColor(culture),
      geometry: f.geometry as Polygon | MultiPolygon,
    };
  });
