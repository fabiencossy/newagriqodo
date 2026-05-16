import type { Farm } from './farms.types';

/**
 * Exploitations mock pour démo multi-tenancy.
 * À remplacer par fetch Odoo `agri.farm` en Phase 3.
 */
export const FARMS: ReadonlyArray<Farm> = [
  {
    id: 'F-001',
    name: 'Domaine Darval',
    location: 'Échallens, VD',
    cantonalNumber: 'VD-2026',
    surfaceTotalHa: 34.1,
    initials: 'DD',
    color: '#2d5016',
    odooFarmId: 1,
  },
  {
    id: 'F-002',
    name: 'Ferme des Crausaz',
    location: 'Cossonay, VD',
    cantonalNumber: 'VD-1145',
    surfaceTotalHa: 21.8,
    initials: 'FC',
    color: '#a16207',
  },
  {
    id: 'F-003',
    name: 'Domaine du Léman',
    location: 'Morges, VD',
    cantonalNumber: 'VD-3789',
    surfaceTotalHa: 47.2,
    initials: 'DL',
    color: '#0284c7',
  },
];
