import { useSyncExternalStore } from 'react';
import { PRODUCTS as INITIAL } from './products.mocks';
import type { Product, ProductType } from './products.types';

/**
 * Store partagé du catalogue produits (phyto, engrais, semences).
 * À synchroniser avec Odoo `product.product` en Phase 3.
 */

// Catalogue mutable (CRUD depuis Paramètres). Phase 3 = sync Odoo `product.product` —
// les mutations remonteront vers Odoo via XML-RPC, et le store sera rafraîchi par
// le polling/webhook. Pour l'instant, mocks + ajouts utilisateur en mémoire.
let products: ReadonlyArray<Product> = [...INITIAL];
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

export function addProduct(product: Product): void {
  products = [...products, product];
  emit();
}

export function updateProduct(id: string, patch: Partial<Product>): void {
  products = products.map((p) => (p.id === id ? ({ ...p, ...patch } as Product) : p));
  emit();
}

export function removeProduct(id: string): void {
  products = products.filter((p) => p.id !== id);
  emit();
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

/** Recherche par nom (utile pour migrer les anciens champs `productName: string`). */
export function findProductByName(name: string | undefined): Product | undefined {
  if (!name) return undefined;
  const lc = name.toLowerCase().trim();
  return products.find((p) => p.name.toLowerCase() === lc);
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
