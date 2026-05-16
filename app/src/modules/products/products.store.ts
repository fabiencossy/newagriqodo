import { useSyncExternalStore } from 'react';
import { supabase } from '../../lib/supabase';
import { onAuthFarmChange } from '../../lib/auth-farm';
import { getAuth } from '../auth/auth.store';
import { getCurrentFarmId } from '../farms/farms.store';
import { PRODUCTS as MOCK_PRODUCTS } from './products.mocks';
import type {
  FertilizerProduct,
  PhytoProduct,
  Product,
  ProductType,
  SeedProduct,
} from './products.types';

/**
 * Store catalogue produits — pattern dual-mode.
 *
 * - mode 'demo' : cache = mocks Darval, mutations en mémoire seulement.
 * - mode 'authenticated' : cache hydraté depuis Supabase (table `products`)
 *   filtré par farm_id courante. Mutations -> INSERT/UPDATE/DELETE puis
 *   refetch.
 *
 * Le cache local reste le seul état lu par les hooks React
 * (useSyncExternalStore est synchrone). Les écritures sont
 * "optimistic-after-success" : on attend la confirmation Supabase puis
 * on refetch tout — simple et sûr, à optimiser si latence devient un
 * problème (queue + optimistic update visuel).
 *
 * Mapping front <-> DB :
 *   colonnes "natives" : id, type, name, brand (=manufacturer),
 *   homologation_number (=ofagNumber), delai_avant_recolte_jours
 *   (=withholdingDays), unit (=defaultDoseUnit), n/p/k_per_unit, active.
 *   colonne `metadata jsonb` : tout le reste spécifique au sous-type
 *   (activeSubstance, category, authorizedCrops, cropName, varietyName,
 *   certified, defaultDoseValue, mgPerUnit, sPerUnit, odooProductId).
 */

let products: ReadonlyArray<Product> = [...MOCK_PRODUCTS];
let loading = false;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

// — Mapping DB row <-> Product ————————————————————————————————————————

type DbProductType = 'phyto' | 'engrais_mineral' | 'engrais_organique' | 'semence' | 'autre';

interface DbProductRow {
  id: string;
  farm_id: string;
  type: DbProductType;
  sub_type: string | null;
  name: string;
  brand: string | null;
  unit: string;
  n_per_unit: number | null;
  p_per_unit: number | null;
  k_per_unit: number | null;
  homologation_number: string | null;
  delai_avant_recolte_jours: number | null;
  notes: string | null;
  active: boolean;
  metadata: Record<string, unknown>;
}

function rowToProduct(row: DbProductRow): Product {
  const meta = row.metadata ?? {};
  if (row.type === 'phyto') {
    const p: PhytoProduct = {
      id: row.id,
      type: 'phyto',
      name: row.name,
      manufacturer: row.brand ?? undefined,
      active: row.active,
      category: (meta.category as PhytoProduct['category']) ?? 'other',
      ofagNumber: row.homologation_number ?? '',
      activeSubstance: (meta.activeSubstance as string) ?? '',
      withholdingDays: row.delai_avant_recolte_jours ?? 0,
      defaultDoseUnit: row.unit,
      defaultDoseValue: (meta.defaultDoseValue as number) ?? undefined,
      authorizedCrops: (meta.authorizedCrops as ReadonlyArray<string>) ?? undefined,
      odooProductId: (meta.odooProductId as number) ?? undefined,
    };
    return p;
  }
  if (row.type === 'engrais_mineral' || row.type === 'engrais_organique') {
    const f: FertilizerProduct = {
      id: row.id,
      type: 'fertilizer',
      name: row.name,
      manufacturer: row.brand ?? undefined,
      active: row.active,
      category:
        row.type === 'engrais_organique'
          ? 'organic'
          : ((meta.category as FertilizerProduct['category']) ?? 'mineral'),
      nPerUnit: row.n_per_unit ?? 0,
      pPerUnit: row.p_per_unit ?? 0,
      kPerUnit: row.k_per_unit ?? 0,
      mgPerUnit: (meta.mgPerUnit as number) ?? undefined,
      sPerUnit: (meta.sPerUnit as number) ?? undefined,
      defaultDoseUnit: row.unit,
      odooProductId: (meta.odooProductId as number) ?? undefined,
    };
    return f;
  }
  // semence
  const s: SeedProduct = {
    id: row.id,
    type: 'seed',
    name: row.name,
    manufacturer: row.brand ?? undefined,
    active: row.active,
    cropName: (meta.cropName as string) ?? '',
    varietyName: (meta.varietyName as string) ?? '',
    defaultDoseValue: (meta.defaultDoseValue as number) ?? undefined,
    defaultDoseUnit: row.unit,
    certified: Boolean(meta.certified),
    odooProductId: (meta.odooProductId as number) ?? undefined,
  };
  return s;
}

interface DbProductInsert {
  farm_id: string;
  type: DbProductType;
  sub_type: string | null;
  name: string;
  brand: string | null;
  unit: string;
  n_per_unit: number | null;
  p_per_unit: number | null;
  k_per_unit: number | null;
  homologation_number: string | null;
  delai_avant_recolte_jours: number | null;
  active: boolean;
  metadata: Record<string, unknown>;
}

function productToInsert(p: Product, farmId: string): DbProductInsert {
  const base = {
    farm_id: farmId,
    name: p.name,
    brand: p.manufacturer ?? null,
    active: p.active,
  };
  if (p.type === 'phyto') {
    return {
      ...base,
      type: 'phyto',
      sub_type: p.category,
      unit: p.defaultDoseUnit,
      n_per_unit: null,
      p_per_unit: null,
      k_per_unit: null,
      homologation_number: p.ofagNumber || null,
      delai_avant_recolte_jours: p.withholdingDays,
      metadata: {
        category: p.category,
        activeSubstance: p.activeSubstance,
        defaultDoseValue: p.defaultDoseValue,
        authorizedCrops: p.authorizedCrops,
        odooProductId: p.odooProductId,
      },
    };
  }
  if (p.type === 'fertilizer') {
    return {
      ...base,
      type: p.category === 'organic' ? 'engrais_organique' : 'engrais_mineral',
      sub_type: p.category,
      unit: p.defaultDoseUnit,
      n_per_unit: p.nPerUnit,
      p_per_unit: p.pPerUnit,
      k_per_unit: p.kPerUnit,
      homologation_number: null,
      delai_avant_recolte_jours: null,
      metadata: {
        category: p.category,
        mgPerUnit: p.mgPerUnit,
        sPerUnit: p.sPerUnit,
        odooProductId: p.odooProductId,
      },
    };
  }
  // seed
  return {
    ...base,
    type: 'semence',
    sub_type: null,
    unit: p.defaultDoseUnit,
    n_per_unit: null,
    p_per_unit: null,
    k_per_unit: null,
    homologation_number: null,
    delai_avant_recolte_jours: null,
    metadata: {
      cropName: p.cropName,
      varietyName: p.varietyName,
      defaultDoseValue: p.defaultDoseValue,
      certified: p.certified,
      odooProductId: p.odooProductId,
    },
  };
}

// — Hydratation ————————————————————————————————————————————————————————

async function hydrateFromSupabase(farmId: string): Promise<void> {
  if (!supabase) return;
  loading = true;
  emit();
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('farm_id', farmId)
      .order('name');
    if (error) {
      console.error('[products] hydrate failed:', error.message);
      products = [];
    } else {
      products = (data as DbProductRow[]).map(rowToProduct);
    }
  } finally {
    loading = false;
    emit();
  }
}

function resetToMocks(): void {
  products = [...MOCK_PRODUCTS];
  emit();
}

// — API publique (signatures stables) ——————————————————————————————————

export async function addProduct(product: Product): Promise<void> {
  if (getAuth().mode !== 'authenticated' || !supabase) {
    products = [...products, product];
    emit();
    return;
  }
  const farmId = getCurrentFarmId();
  if (!farmId) {
    console.warn('[products] addProduct sans farm courante');
    return;
  }
  const { error } = await supabase.from('products').insert(productToInsert(product, farmId));
  if (error) {
    console.error('[products] insert failed:', error.message);
    return;
  }
  await hydrateFromSupabase(farmId);
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<void> {
  if (getAuth().mode !== 'authenticated' || !supabase) {
    products = products.map((p) => (p.id === id ? ({ ...p, ...patch } as Product) : p));
    emit();
    return;
  }
  const current = products.find((p) => p.id === id);
  if (!current) return;
  const merged = { ...current, ...patch } as Product;
  const farmId = getCurrentFarmId();
  const insert = productToInsert(merged, farmId);
  const { error } = await supabase
    .from('products')
    .update({
      type: insert.type,
      sub_type: insert.sub_type,
      name: insert.name,
      brand: insert.brand,
      unit: insert.unit,
      n_per_unit: insert.n_per_unit,
      p_per_unit: insert.p_per_unit,
      k_per_unit: insert.k_per_unit,
      homologation_number: insert.homologation_number,
      delai_avant_recolte_jours: insert.delai_avant_recolte_jours,
      active: insert.active,
      metadata: insert.metadata,
    })
    .eq('id', id);
  if (error) {
    console.error('[products] update failed:', error.message);
    return;
  }
  await hydrateFromSupabase(farmId);
}

export async function removeProduct(id: string): Promise<void> {
  if (getAuth().mode !== 'authenticated' || !supabase) {
    products = products.filter((p) => p.id !== id);
    emit();
    return;
  }
  const farmId = getCurrentFarmId();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    console.error('[products] delete failed:', error.message);
    return;
  }
  await hydrateFromSupabase(farmId);
}

export function getProducts(): ReadonlyArray<Product> {
  return products;
}

export function getProductsByType(type: ProductType): ReadonlyArray<Product> {
  return products.filter((p) => p.type === type && p.active);
}

export function getProductById(id: string | undefined): Product | undefined {
  if (!id) return undefined;
  return products.find((p) => p.id === id);
}

export function findProductByName(name: string | undefined): Product | undefined {
  if (!name) return undefined;
  const lc = name.toLowerCase().trim();
  return products.find((p) => p.name.toLowerCase() === lc);
}

export function isProductsLoading(): boolean {
  return loading;
}

export function subscribeProducts(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useProducts(): ReadonlyArray<Product> {
  return useSyncExternalStore(subscribeProducts, getProducts, getProducts);
}

// — Bootstrap : reload au changement de mode auth ou de farm ————————————

let bootstrapped = false;
export function initProductsBootstrap(): void {
  if (bootstrapped) return;
  bootstrapped = true;

  onAuthFarmChange((ctx) => {
    if (ctx.isRealFarm) {
      void hydrateFromSupabase(ctx.farmId);
    } else if (ctx.mode === 'demo' || ctx.mode === 'logged-out') {
      resetToMocks();
    }
  });
}
