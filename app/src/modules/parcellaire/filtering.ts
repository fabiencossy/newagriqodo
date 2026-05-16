import type { SearchState } from '../../components/SearchBar';
import { cultureGroup } from '../assolement/cultures';
import type { ParcelDetail } from './parcellaire.mocks';

/**
 * Applique un `SearchState` (issu de SearchBar) à la liste de parcelles.
 * - query libre → recherche dans name/id/notes/varietyName/culture
 * - facets → filtres par champ (intra-facet OR, inter-facets AND)
 */
export function filterParcels(
  parcels: ReadonlyArray<ParcelDetail>,
  state: SearchState,
): ParcelDetail[] {
  return parcels.filter((p) => {
    // Query libre
    if (state.query) {
      const q = state.query.toLowerCase();
      const haystacks = [p.name, p.id, p.notes, p.varietyName, p.culture]
        .filter(Boolean)
        .map((s) => (s as string).toLowerCase());
      if (!haystacks.some((s) => s.includes(q))) return false;
    }

    // Facets : AND entre facets, OR intra-facet
    for (const facet of state.facets) {
      const ok = facetMatches(p, facet);
      if (!ok) return false;
    }

    return true;
  });
}

function facetMatches(
  parcel: ParcelDetail,
  facet: { fieldId: string; values: ReadonlyArray<unknown> },
): boolean {
  const values = facet.values;
  if (values.length === 0) return true;
  switch (facet.fieldId) {
    case 'culture': {
      // Les facets culture sont des GROUPES (Blé, Maïs, Prairie, etc.),
      // alors que parcel.culture est une culture précise (Blé d'automne, etc.).
      // On compare donc le groupe de la culture de la parcelle au filtre.
      if (!parcel.culture) return false;
      const parcelGroup = cultureGroup(parcel.culture);
      return values.some((v) => {
        const fv = String(v);
        return parcelGroup === fv || parcel.culture === fv;
      });
    }
    case 'status':
      return values.some((v) => parcel.status === v);
    case 'year':
      return values.some((v) => parcel.year === Number(v));
    case 'name':
      return values.some((v) => parcel.name.toLowerCase().includes(String(v).toLowerCase()));
    case 'code':
      return values.some((v) => parcel.id.toLowerCase().includes(String(v).toLowerCase()));
    case 'notes':
      return values.some((v) =>
        (parcel.notes ?? '').toLowerCase().includes(String(v).toLowerCase()),
      );
    case 'variety':
      return values.some((v) =>
        (parcel.varietyName ?? '').toLowerCase().includes(String(v).toLowerCase()),
      );
    default:
      return true;
  }
}
