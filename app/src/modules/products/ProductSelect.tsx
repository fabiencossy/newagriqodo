import { useMemo } from 'react';
import { useProducts } from './products.store';
import type { Product, ProductType } from './products.types';

interface ProductSelectProps {
  /** Filtre par type de produit (phyto / fertilizer / seed). */
  type: ProductType;
  /** Id du produit sélectionné. */
  value?: string;
  /** Callback : appelé avec le produit complet (ou undefined). */
  onChange: (product: Product | undefined) => void;
  /** Filtre cultures autorisées (pour produits phyto). */
  authorizedForCrop?: string;
  /** Autoriser "Aucun" (= saisie libre downstream). */
  allowEmpty?: boolean;
  className?: string;
  ariaLabel?: string;
}

/**
 * Sélecteur produit depuis le référentiel. Filtre par type ; pour les phyto,
 * peut filtrer aussi par culture autorisée. À la sélection, le parent reçoit
 * le produit complet pour auto-remplir les champs (catégorie phyto, délai
 * d'attente, composition N/P/K, dose recommandée, n° OFAG, etc.).
 */
export function ProductSelect({
  type,
  value,
  onChange,
  authorizedForCrop,
  allowEmpty = true,
  className,
  ariaLabel,
}: ProductSelectProps) {
  const all = useProducts();

  const options = useMemo(() => {
    let list = all.filter((p) => p.type === type && p.active);
    if (type === 'phyto' && authorizedForCrop) {
      list = list.filter((p) => {
        if (p.type !== 'phyto') return false;
        if (!p.authorizedCrops || p.authorizedCrops.length === 0) return true; // pas de restriction
        return p.authorizedCrops.includes(authorizedForCrop);
      });
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [all, type, authorizedForCrop]);

  return (
    <select
      aria-label={ariaLabel ?? `Sélectionner un produit ${type}`}
      value={value ?? ''}
      onChange={(e) => {
        const id = e.target.value;
        onChange(id ? options.find((p) => p.id === id) : undefined);
      }}
      className={[
        'h-10 w-full rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-3 text-sm focus:border-(--color-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15',
        className ?? '',
      ].join(' ')}
    >
      {allowEmpty && <option value="">— Sélectionner —</option>}
      {options.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
          {p.manufacturer ? ` (${p.manufacturer})` : ''}
        </option>
      ))}
    </select>
  );
}
