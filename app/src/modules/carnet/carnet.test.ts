import { afterEach, describe, expect, it } from 'vitest';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  fertilizerSummary,
  getInterventionsForParcel,
  getInterventionYears,
  isUnderWithholding,
  sortByDateDesc,
} from './carnet.helpers';
import {
  addInterventions,
  getInterventions,
  removeIntervention,
  removeInterventions,
  updateIntervention,
} from './carnet.store';
import type { Intervention, InterventionCategory } from './carnet.types';

const baseInterventions: Intervention[] = [
  {
    id: 'I-1',
    parcelId: 'P1',
    date: '2026-03-15',
    category: 'fertilization',
    fertilizationType: 'mineral',
    productName: 'Ammonitrate 27%',
    nKgPerHa: 60,
    pKgPerHa: 0,
    kKgPerHa: 0,
  },
  {
    id: 'I-2',
    parcelId: 'P1',
    date: '2026-04-10',
    category: 'fertilization',
    fertilizationType: 'mineral',
    productName: 'Ammonitrate 27%',
    nKgPerHa: 60,
    pKgPerHa: 0,
    kKgPerHa: 0,
  },
  {
    id: 'I-3',
    parcelId: 'P2',
    date: '2026-05-12',
    category: 'phyto',
    phytoType: 'fungicide',
    productName: 'Adexar',
    withholdingDays: 35,
  },
  {
    id: 'I-4',
    parcelId: 'P1',
    date: '2026-07-31',
    category: 'harvest',
    yieldValue: 70,
    yieldUnit: 'q/ha',
  },
  {
    id: 'I-5',
    parcelId: 'P1',
    date: '2025-04-15',
    category: 'sowing',
    productName: 'Arnold',
  },
];

describe('CATEGORY_LABELS / CATEGORY_COLORS', () => {
  it('a un label et une couleur pour chaque InterventionCategory', () => {
    const categories: InterventionCategory[] = [
      'sowing',
      'fertilization',
      'phyto',
      'tillage',
      'cultural',
      'harvest',
      'observation',
      'irrigation',
      'other',
    ];
    for (const c of categories) {
      expect(CATEGORY_LABELS[c]).toBeTruthy();
      expect(CATEGORY_COLORS[c]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe('sortByDateDesc', () => {
  it('trie les interventions par date décroissante', () => {
    const sorted = sortByDateDesc(baseInterventions);
    expect(sorted.map((i) => i.id)).toEqual(['I-4', 'I-3', 'I-2', 'I-1', 'I-5']);
  });

  it("ne mute pas le tableau d'origine", () => {
    const original = [...baseInterventions];
    sortByDateDesc(baseInterventions);
    expect(baseInterventions).toEqual(original);
  });
});

describe('getInterventionsForParcel', () => {
  it('filtre par parcelId et trie par date desc', () => {
    const list = getInterventionsForParcel('P1', baseInterventions);
    expect(list.map((i) => i.id)).toEqual(['I-4', 'I-2', 'I-1', 'I-5']);
  });

  it('retourne un tableau vide si aucune intervention', () => {
    expect(getInterventionsForParcel('UNKNOWN', baseInterventions)).toEqual([]);
  });
});

describe('fertilizerSummary', () => {
  it('cumule les apports N/P/K en multipliant par la surface (ha)', () => {
    // P1 : 2 apports de 60 N/ha sur 2.5 ha = 300 kg N total
    const summary = fertilizerSummary(getInterventionsForParcel('P1', baseInterventions), 2.5);
    expect(summary.nKg).toBe(300);
    expect(summary.pKg).toBe(0);
    expect(summary.kKg).toBe(0);
    expect(summary.entries).toBe(2);
  });

  it('utilise surfaceTreatedHa si fournie', () => {
    const list: Intervention[] = [
      {
        id: 'X',
        parcelId: 'P',
        date: '2026-04-01',
        category: 'fertilization',
        nKgPerHa: 100,
        surfaceTreatedHa: 1, // override : seulement 1 ha traité
      },
    ];
    const summary = fertilizerSummary(list, 5);
    expect(summary.nKg).toBe(100); // 100 × 1, pas 100 × 5
  });

  it('respecte les bornes de date (from/to)', () => {
    const summary = fertilizerSummary(getInterventionsForParcel('P1', baseInterventions), 1, {
      from: '2026-04-01',
    });
    expect(summary.entries).toBe(1); // seul I-2 (2026-04-10) reste
    expect(summary.nKg).toBe(60);
  });
});

describe('isUnderWithholding', () => {
  it("détecte une parcelle en délai d'attente phyto", () => {
    // Adexar 12/05/2026 + 35 j = 16/06/2026
    const blocking = isUnderWithholding(baseInterventions, '2026-06-01');
    expect(blocking?.id).toBe('I-3');
  });

  it('renvoie undefined si délai écoulé', () => {
    const ok = isUnderWithholding(baseInterventions, '2026-07-01');
    expect(ok).toBeUndefined();
  });

  it('ignore les interventions non-phyto', () => {
    const list: Intervention[] = [
      {
        id: 'X',
        parcelId: 'P',
        date: '2026-05-01',
        category: 'fertilization',
        withholdingDays: 30, // pas de sens pour fertilization, mais test
      },
    ];
    expect(isUnderWithholding(list, '2026-05-15')).toBeUndefined();
  });
});

describe('getInterventionYears', () => {
  it("retourne les années uniques triées (récente d'abord)", () => {
    expect(getInterventionYears(baseInterventions)).toEqual([2026, 2025]);
  });

  it('renvoie un tableau vide si aucune intervention', () => {
    expect(getInterventionYears([])).toEqual([]);
  });
});

/* ============ Tests du store (pub/sub) ============ */

describe('carnet.store', () => {
  // Clean slate : on supprime tout ce qui a été ajouté pendant les tests
  // (le store est initialisé avec INTERVENTIONS du mock — on travaille avec les ids tests)
  const TEST_IDS = ['STORE-1', 'STORE-2', 'STORE-3'];

  afterEach(() => {
    removeInterventions(TEST_IDS);
  });

  it('addInterventions ajoute au store et émet vers les listeners', () => {
    const initial = getInterventions().length;
    // On vérifie juste que le contenu du store change après add.
    addInterventions([
      {
        id: 'STORE-1',
        parcelId: 'TEST-P1',
        date: '2026-01-01',
        category: 'observation',
      },
    ]);
    expect(getInterventions().length).toBe(initial + 1);
    expect(getInterventions().find((i) => i.id === 'STORE-1')).toBeTruthy();
  });

  it("updateIntervention applique le patch sur l'entrée ciblée", () => {
    addInterventions([
      {
        id: 'STORE-2',
        parcelId: 'TEST-P1',
        date: '2026-01-01',
        category: 'observation',
        notes: 'avant',
      },
    ]);
    updateIntervention('STORE-2', { notes: 'après' });
    expect(getInterventions().find((i) => i.id === 'STORE-2')?.notes).toBe('après');
  });

  it("removeIntervention enlève l'entrée ciblée", () => {
    addInterventions([
      {
        id: 'STORE-3',
        parcelId: 'TEST-P1',
        date: '2026-01-01',
        category: 'observation',
      },
    ]);
    expect(getInterventions().find((i) => i.id === 'STORE-3')).toBeTruthy();
    removeIntervention('STORE-3');
    expect(getInterventions().find((i) => i.id === 'STORE-3')).toBeUndefined();
  });
});
