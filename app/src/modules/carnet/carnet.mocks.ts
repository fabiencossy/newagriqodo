import { PARCELLES } from '../parcellaire/parcellaire.mocks';
import { ASSOLEMENT_SEGMENTS } from '../assolement/assolement.mocks';
import type { Intervention } from './carnet.types';

/**
 * Mocks d'interventions cohérentes avec les segments d'assolement Darval.
 *
 * Logique : pour chaque segment cultural (hors jachère / forêt / improductif),
 * on génère le calendrier d'interventions standard selon la culture :
 *
 * Blé d'automne :
 *   - Semis (octobre N-1, ~300 kg/ha)
 *   - Désherbage automnal
 *   - Apports N en mars + avril (2 × 60 kg N/ha)
 *   - Régulateur croissance (avril)
 *   - Fongicide T2 (mai)
 *   - Récolte (fin juillet, 70 q/ha)
 *
 * Maïs ensilage :
 *   - Labour (avril)
 *   - Semis (fin avril, LG31.330)
 *   - Désherbage post-levée (mai)
 *   - Apport N (mai, 80 kg/ha)
 *   - Récolte (début octobre, 50 t/ha)
 *
 * Prairie temporaire / naturelle / extensive :
 *   - 4 fauches/an (avril, juin, juillet, septembre)
 *
 * Pâturage : 1 observation par mois.
 *
 * Forêt / Surface improductive : aucune intervention (parcelles archivées).
 *
 * À remplacer par fetch Odoo `agri.intervention` en Phase 3.
 */

const TODAY = new Date().toISOString().slice(0, 10);

interface InterventionTemplate {
  monthDay: string; // 'MM-DD' relatif à l'année calendaire d'application
  /** Décale d'une année si la culture est semée avant l'année cible (ex. blé semé N-1). */
  yearOffset?: -1 | 0;
  factory: (parcelId: string, year: number) => Omit<Intervention, 'id' | 'parcelId' | 'date'>;
}

const TEMPLATES_BY_CULTURE: Record<string, InterventionTemplate[]> = {
  "Blé d'automne": [
    {
      monthDay: '10-15',
      yearOffset: -1,
      factory: () => ({
        category: 'sowing',
        subType: 'sowing',
        productName: 'Arnold (semence certifiée)',
        doseValue: 300,
        doseUnit: 'kg/ha',
        operator: 'F. Cossy',
      }),
    },
    {
      monthDay: '10-25',
      yearOffset: -1,
      factory: () => ({
        category: 'phyto',
        subType: 'herbicide',
        phytoType: 'herbicide',
        productName: 'Axial One',
        doseValue: 1.0,
        doseUnit: 'L/ha',
        withholdingDays: 0,
        operator: 'F. Cossy',
      }),
    },
    {
      monthDay: '03-15',
      factory: () => ({
        category: 'fertilization',
        subType: 'mineral',
        fertilizationType: 'mineral',
        productName: 'Ammonitrate 27%',
        doseValue: 222,
        doseUnit: 'kg/ha',
        nKgPerHa: 60,
        operator: 'F. Cossy',
        notes: "1er apport — sortie d'hiver, stade tallage",
        bbchStage: 25,
      }),
    },
    {
      monthDay: '04-10',
      factory: () => ({
        category: 'fertilization',
        subType: 'mineral',
        fertilizationType: 'mineral',
        productName: 'Ammonitrate 27%',
        doseValue: 222,
        doseUnit: 'kg/ha',
        nKgPerHa: 60,
        operator: 'F. Cossy',
        notes: '2e apport — montaison',
        bbchStage: 31,
      }),
    },
    {
      monthDay: '04-25',
      factory: () => ({
        category: 'phyto',
        subType: 'growth-regulator',
        phytoType: 'growth-regulator',
        productName: 'Moddus Evo',
        doseValue: 0.4,
        doseUnit: 'L/ha',
        withholdingDays: 0,
        operator: 'F. Cossy',
        bbchStage: 32,
      }),
    },
    {
      monthDay: '05-12',
      factory: () => ({
        category: 'phyto',
        subType: 'fungicide',
        phytoType: 'fungicide',
        productName: 'Adexar',
        doseValue: 1.5,
        doseUnit: 'L/ha',
        withholdingDays: 35,
        operator: 'F. Cossy',
        bbchStage: 39,
        notes: 'T2 — protection feuille drapeau',
      }),
    },
    {
      monthDay: '07-31',
      factory: () => ({
        category: 'harvest',
        subType: 'combine',
        yieldValue: 70,
        yieldUnit: 'q/ha',
        operator: 'F. Cossy',
        weather: 'Ensoleillé, 24°C',
      }),
    },
  ],
  'Maïs ensilage': [
    {
      monthDay: '04-15',
      factory: () => ({
        category: 'tillage',
        subType: 'plowing',
        operator: 'F. Cossy',
        notes: 'Labour préparation lit de semences',
      }),
    },
    {
      monthDay: '04-22',
      factory: () => ({
        category: 'sowing',
        subType: 'sowing',
        productName: 'Limagrain LG31.330',
        doseValue: 90000,
        doseUnit: 'grains/ha',
        operator: 'F. Cossy',
      }),
    },
    {
      monthDay: '05-15',
      factory: () => ({
        category: 'fertilization',
        subType: 'mineral',
        fertilizationType: 'mineral',
        productName: 'Urée 46%',
        doseValue: 174,
        doseUnit: 'kg/ha',
        nKgPerHa: 80,
        operator: 'F. Cossy',
      }),
    },
    {
      monthDay: '05-25',
      factory: () => ({
        category: 'phyto',
        subType: 'herbicide',
        phytoType: 'herbicide',
        productName: 'Calaris',
        doseValue: 1.5,
        doseUnit: 'L/ha',
        withholdingDays: 0,
        operator: 'F. Cossy',
        notes: 'Désherbage post-levée',
      }),
    },
    {
      monthDay: '10-05',
      factory: () => ({
        category: 'harvest',
        subType: 'silage',
        yieldValue: 50,
        yieldUnit: 't/ha',
        operator: 'Entrepreneur Genton SA',
        weather: 'Sec, 18°C',
      }),
    },
  ],
  // Prairies : 4 fauches par an, espacées
  'Prairie temporaire': [
    {
      monthDay: '04-25',
      factory: () => ({
        category: 'harvest',
        subType: 'mowing',
        yieldValue: 5,
        yieldUnit: 't MS/ha',
        operator: 'F. Cossy',
        notes: '1ère fauche',
      }),
    },
    {
      monthDay: '06-10',
      factory: () => ({
        category: 'harvest',
        subType: 'mowing',
        yieldValue: 4,
        yieldUnit: 't MS/ha',
        operator: 'F. Cossy',
        notes: '2e fauche (regain)',
      }),
    },
    {
      monthDay: '07-25',
      factory: () => ({
        category: 'harvest',
        subType: 'mowing',
        yieldValue: 3,
        yieldUnit: 't MS/ha',
        operator: 'F. Cossy',
        notes: '3e fauche',
      }),
    },
    {
      monthDay: '09-10',
      factory: () => ({
        category: 'harvest',
        subType: 'mowing',
        yieldValue: 2.5,
        yieldUnit: 't MS/ha',
        operator: 'F. Cossy',
        notes: '4e fauche',
      }),
    },
  ],
  'Prairie naturelle': [
    {
      monthDay: '06-15',
      factory: () => ({
        category: 'harvest',
        subType: 'mowing',
        yieldValue: 4,
        yieldUnit: 't MS/ha',
        operator: 'F. Cossy',
      }),
    },
    {
      monthDay: '08-20',
      factory: () => ({
        category: 'harvest',
        subType: 'mowing',
        yieldValue: 3,
        yieldUnit: 't MS/ha',
        operator: 'F. Cossy',
      }),
    },
  ],
  'Prairie extensive': [
    // SPB extensive : pas de fertilisation, fauche tardive obligatoire
    {
      monthDay: '06-15',
      factory: () => ({
        category: 'harvest',
        subType: 'mowing',
        yieldValue: 3,
        yieldUnit: 't MS/ha',
        operator: 'F. Cossy',
        notes: 'Fauche tardive (SPB extensif)',
      }),
    },
  ],
  Pâturage: [
    {
      monthDay: '05-01',
      factory: () => ({
        category: 'observation',
        subType: 'growth',
        operator: 'F. Cossy',
        notes: "Mise à l'herbe troupeau, hauteur 12 cm",
      }),
    },
    {
      monthDay: '07-15',
      factory: () => ({
        category: 'observation',
        subType: 'growth',
        operator: 'F. Cossy',
        notes: 'Rotation pâturage, repousse OK',
      }),
    },
  ],
};

/**
 * Génère les interventions à partir des segments d'assolement.
 * Pour chaque segment (parcelle × culture × année), applique le template
 * correspondant à la culture si défini.
 */
function generateInterventions(): Intervention[] {
  const result: Intervention[] = [];
  let counter = 0;

  for (const segment of ASSOLEMENT_SEGMENTS) {
    const templates = TEMPLATES_BY_CULTURE[segment.culture];
    if (!templates) continue;

    // Année cible = année du segment principal (extraite de la fin)
    const segmentYear = Number(segment.endDate.slice(0, 4));

    for (const tpl of templates) {
      const yearOffset = tpl.yearOffset ?? 0;
      const date = `${segmentYear + yearOffset}-${tpl.monthDay}`;

      // Skip les interventions futures (postérieures à aujourd'hui)
      if (date > TODAY) continue;
      // Skip les interventions hors période du segment
      if (date < segment.startDate || date > segment.endDate) continue;

      const factoryResult = tpl.factory(segment.parcelId, segmentYear);
      result.push({
        id: `INT-${segment.parcelId}-${date}-${counter++}`,
        parcelId: segment.parcelId,
        date,
        ...factoryResult,
      });
    }
  }

  // Ajoute quelques observations sporadiques sur les parcelles actives
  const activeParcels = PARCELLES.filter((p) => p.status === 'active').slice(0, 6);
  for (const p of activeParcels) {
    result.push({
      id: `INT-OBS-${p.id}`,
      parcelId: p.id,
      date: `${p.year}-04-15`,
      category: 'observation',
      subType: 'growth',
      bbchStage: 22,
      operator: 'F. Cossy',
      notes: 'Tour de plaine — état végétation correct',
    });
  }

  return result;
}

export const INTERVENTIONS: ReadonlyArray<Intervention> = generateInterventions();
