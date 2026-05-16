import type { ParcelGroup } from './parcel-groups.types';

/**
 * Groupes mock pour le Domaine Darval. Basés sur la topologie réelle
 * (Pierraz au nord, Prairies du sud, etc.).
 */
export const PARCEL_GROUPS: ReadonlyArray<ParcelGroup> = [
  {
    id: 'PG-001',
    name: 'Bloc Pierraz',
    description: 'Parcelles regroupées au nord — itinéraires techniques communs',
    parcelIds: ['VD_2026_65427', 'VD_2026_65428', 'VD_2026_167572'],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    color: '#dc2626',
  },
  {
    id: 'PG-002',
    name: 'Prairies Sud',
    description: 'Pâturages et prairies de fauche du domaine — gestion commune',
    parcelIds: ['VD_2026_65419', 'VD_2026_65421', 'VD_2026_65417', 'VD_2026_65422'],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    color: '#16a34a',
  },
  {
    id: 'PG-003',
    name: 'Bloc Frut',
    description: 'Parcelles Le Frut — semées en prairie temporaire',
    parcelIds: ['VD_2026_65417', 'VD_2026_163080', 'VD_2026_163078'],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    color: '#0284c7',
  },
];
