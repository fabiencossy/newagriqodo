import type { Parcel } from '../../components/MapView';

/**
 * Mock data : 12 parcelles autour de Lausanne / Échallens.
 * Coordonnées approximatives. À remplacer par fetch Odoo `agri.parcel` en Phase 2.
 */

export interface ParcelDetail extends Parcel {
  varietyName?: string;
  sowingDate?: string; // YYYY-MM-DD
  notes?: string;
  year: number;
}

export const PARCELLES: ParcelDetail[] = [
  buildParcel({
    id: 'PF-001',
    name: 'Plat de la Cure',
    surfaceHa: 2.5,
    culture: "Blé d'automne",
    status: 'active',
    color: '#f97316',
    varietyName: 'Arnold',
    sowingDate: '2026-03-12',
    notes: 'Sol limoneux, drainage moyen. Voisin ouest = colza.',
    year: 2026,
    coords: [
      [6.6285, 46.5215],
      [6.633, 46.5218],
      [6.6332, 46.5195],
      [6.6287, 46.5192],
    ],
  }),
  buildParcel({
    id: 'PF-002',
    name: 'Champ du Haut',
    surfaceHa: 1.8,
    culture: "Blé d'automne",
    status: 'active',
    color: '#f97316',
    varietyName: 'Arnold',
    sowingDate: '2026-03-14',
    notes: '',
    year: 2026,
    coords: [
      [6.634, 46.521],
      [6.6385, 46.5213],
      [6.6388, 46.519],
      [6.6342, 46.5188],
    ],
  }),
  buildParcel({
    id: 'PF-003',
    name: 'Petite Pièce',
    surfaceHa: 0.9,
    culture: 'Jachère',
    status: 'fallow',
    color: '#a3a380',
    sowingDate: '',
    notes: 'En jachère depuis 2025.',
    year: 2025,
    coords: [
      [6.628, 46.5185],
      [6.6315, 46.5187],
      [6.6317, 46.517],
      [6.6282, 46.5168],
    ],
  }),
  buildParcel({
    id: 'PF-004',
    name: 'Champ Long',
    surfaceHa: 4.1,
    culture: 'Maïs ensilage',
    status: 'active',
    color: '#dc2626',
    varietyName: 'Limagrain LG31.330',
    sowingDate: '2026-04-22',
    year: 2026,
    coords: [
      [6.6325, 46.5183],
      [6.638, 46.5186],
      [6.6383, 46.5165],
      [6.6328, 46.5162],
    ],
  }),
  buildParcel({
    id: 'PF-005',
    name: 'Champ du Bas',
    surfaceHa: 2.3,
    culture: "Blé d'automne",
    status: 'active',
    color: '#f97316',
    varietyName: 'Arnold',
    sowingDate: '2026-03-14',
    year: 2026,
    coords: [
      [6.625, 46.5165],
      [6.6298, 46.5168],
      [6.63, 46.515],
      [6.6253, 46.5147],
    ],
  }),
  buildParcel({
    id: 'PF-006',
    name: 'Pré du Moulin',
    surfaceHa: 3.2,
    culture: "Colza d'automne",
    status: 'active',
    color: '#fef08a',
    varietyName: 'DK Exception',
    sowingDate: '2025-08-25',
    year: 2025,
    coords: [
      [6.6395, 46.5165],
      [6.644, 46.5168],
      [6.6442, 46.5148],
      [6.6398, 46.5145],
    ],
  }),
  buildParcel({
    id: 'PF-007',
    name: 'Champ Rond',
    surfaceHa: 0.6,
    culture: 'Maïs ensilage',
    status: 'active',
    color: '#dc2626',
    varietyName: 'Limagrain LG31.330',
    sowingDate: '2026-04-23',
    year: 2026,
    coords: [
      [6.6298, 46.5142],
      [6.6328, 46.5145],
      [6.633, 46.513],
      [6.63, 46.5128],
    ],
  }),
  buildParcel({
    id: 'PF-008',
    name: 'Vers la Ferme',
    surfaceHa: 1.5,
    culture: "Orge d'automne",
    status: 'active',
    color: '#fbbf24',
    varietyName: 'KWS Cassia',
    sowingDate: '2025-10-12',
    year: 2025,
    coords: [
      [6.6342, 46.5142],
      [6.6385, 46.5145],
      [6.6387, 46.5127],
      [6.6344, 46.5125],
    ],
  }),
  buildParcel({
    id: 'PF-009',
    name: 'Grande Pièce',
    surfaceHa: 5.7,
    culture: "Blé d'automne",
    status: 'active',
    color: '#f97316',
    varietyName: 'Lemaire',
    sowingDate: '2026-03-15',
    year: 2026,
    coords: [
      [6.625, 46.5135],
      [6.632, 46.5138],
      [6.6322, 46.511],
      [6.6253, 46.5108],
    ],
  }),
  buildParcel({
    id: 'PF-010',
    name: 'Bord de Route',
    surfaceHa: 1.1,
    culture: 'Jachère',
    status: 'fallow',
    color: '#a3a380',
    notes: 'Bande tampon route cantonale.',
    year: 2026,
    coords: [
      [6.6398, 46.5113],
      [6.6438, 46.5115],
      [6.644, 46.51],
      [6.64, 46.5098],
    ],
  }),
  buildParcel({
    id: 'PF-011',
    name: 'Champ Sud',
    surfaceHa: 2.9,
    culture: 'Maïs ensilage',
    status: 'active',
    color: '#dc2626',
    varietyName: 'Limagrain LG31.330',
    sowingDate: '2026-04-24',
    year: 2026,
    coords: [
      [6.6258, 46.5105],
      [6.6315, 46.5108],
      [6.6317, 46.5088],
      [6.626, 46.5085],
    ],
  }),
  buildParcel({
    id: 'PF-012',
    name: 'Verger Vieux',
    surfaceHa: 0.4,
    culture: 'Archivé',
    status: 'archived',
    color: '#9ca3af',
    notes: 'Ancien verger, arraché 2024.',
    year: 2024,
    coords: [
      [6.6338, 46.5105],
      [6.6362, 46.5107],
      [6.6363, 46.5092],
      [6.634, 46.509],
    ],
  }),
];

function buildParcel(args: {
  id: string;
  name: string;
  surfaceHa: number;
  culture: string;
  status: 'active' | 'fallow' | 'archived';
  color: string;
  varietyName?: string;
  sowingDate?: string;
  notes?: string;
  year: number;
  coords: [number, number][];
}): ParcelDetail {
  // ferme le ring
  const ring = [...args.coords, args.coords[0]!];
  return {
    id: args.id,
    name: args.name,
    surfaceHa: args.surfaceHa,
    culture: args.culture,
    status: args.status,
    color: args.color,
    varietyName: args.varietyName,
    sowingDate: args.sowingDate,
    notes: args.notes,
    year: args.year,
    geometry: { type: 'Polygon', coordinates: [ring] },
  };
}
