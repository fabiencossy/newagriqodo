import { useMemo, useState } from 'react';
import { useProducts } from './products.store';
import type {
  FertilizerProduct,
  PhytoProduct,
  Product,
  ProductType,
  SeedProduct,
} from './products.types';

interface ProductPickerProps {
  /** Type fixe selon le contexte d'ouverture (catégorie de l'intervention). */
  type: ProductType;
  /** Culture en place — pour filtrer phyto par cultures autorisées. */
  authorizedForCrop?: string;
  /** Id du produit actuellement sélectionné (pour le highlight visuel). */
  currentValue?: string;
  /** Callback à la sélection. */
  onSelect: (product: Product) => void;
  onClose: () => void;
}

const TYPE_LABELS: Record<ProductType, string> = {
  phyto: 'Produit phytosanitaire (catalogue OFAG)',
  fertilizer: 'Engrais / amendement',
  seed: 'Semence',
};

/**
 * Sélecteur produit modal plein écran (mobile) / grand (desktop).
 *
 * Affiche TOUS les produits du type avec :
 *   - barre de recherche libre (nom, fabricant, substance active, n° OFAG, variété)
 *   - regroupement visuel par catégorie (herbicide / fongicide / etc. ou minéral / organique)
 *   - infos métadonnées (n° OFAG, composition NPK, variété, dose recommandée) visibles
 *   - filtre cultures autorisées pour les phyto (si culture connue)
 *
 * Utilisé à la place du `<select>` natif quand le catalogue est gros.
 */
export function ProductPicker({
  type,
  authorizedForCrop,
  currentValue,
  onSelect,
  onClose,
}: ProductPickerProps) {
  const all = useProducts();
  const [query, setQuery] = useState('');
  const [showAllCrops, setShowAllCrops] = useState(false);

  const filtered = useMemo(() => {
    let list = all.filter((p) => p.type === type && p.active);
    if (type === 'phyto' && authorizedForCrop && !showAllCrops) {
      list = list.filter((p) => {
        if (p.type !== 'phyto') return false;
        if (!p.authorizedCrops || p.authorizedCrops.length === 0) return true;
        return p.authorizedCrops.includes(authorizedForCrop);
      });
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => {
        const haystack: string[] = [p.name];
        if (p.manufacturer) haystack.push(p.manufacturer);
        if (p.type === 'phyto') {
          haystack.push(p.ofagNumber, p.activeSubstance);
        } else if (p.type === 'seed') {
          haystack.push(p.cropName, p.varietyName);
        }
        return haystack.some((s) => s.toLowerCase().includes(q));
      });
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [all, type, authorizedForCrop, showAllCrops, query]);

  // Regroupement par catégorie/famille
  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of filtered) {
      const key = categoryKey(p);
      const list = map.get(key);
      if (list) list.push(p);
      else map.set(key, [p]);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const filteredOut = type === 'phyto' && authorizedForCrop && !showAllCrops;

  return (
    <div className="fixed inset-0 z-[1300] flex flex-col bg-(--color-surface) md:items-center md:justify-center md:bg-black/40 md:p-6 md:backdrop-blur-sm">
      <div className="flex h-full w-full flex-col overflow-hidden bg-(--color-surface) md:h-[88vh] md:max-w-[720px] md:rounded-(--radius-lg) md:border md:border-(--color-border) md:shadow-(--shadow-popup)">
        {/* Header */}
        <header className="flex items-center gap-2 border-b border-(--color-border) px-4 py-3">
          <div className="min-w-0 flex-1">
            <h2 className="m-0 text-sm font-semibold">{TYPE_LABELS[type]}</h2>
            <p className="m-0 mt-0.5 text-xs text-(--color-muted)">
              {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
              {filteredOut && ` · filtré pour culture ${authorizedForCrop}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-(--radius-sm) text-(--color-muted) hover:bg-[#f1f1ee] hover:text-(--color-text)"
          >
            <CloseIcon />
          </button>
        </header>

        {/* Barre de recherche + toggle filtre cultures (pour phyto) */}
        <div className="flex flex-col gap-2 border-b border-(--color-border) p-3">
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--color-muted)">
              <SearchIcon />
            </span>
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder(type)}
              className="h-10 w-full rounded-(--radius) border border-(--color-border) bg-(--color-surface) pr-3 pl-9 text-sm focus:border-(--color-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15"
            />
          </div>
          {type === 'phyto' && authorizedForCrop && (
            <label className="flex cursor-pointer items-center gap-2 text-xs text-(--color-muted)">
              <input
                type="checkbox"
                checked={showAllCrops}
                onChange={(e) => setShowAllCrops(e.target.checked)}
                className="h-4 w-4 accent-(--color-primary)"
              />
              Afficher tous les produits (même non autorisés sur {authorizedForCrop})
            </label>
          )}
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
              <p className="m-0 text-sm text-(--color-muted)">
                Aucun produit ne correspond à la recherche.
              </p>
              {filteredOut && (
                <button
                  type="button"
                  onClick={() => setShowAllCrops(true)}
                  className="text-xs font-medium text-(--color-primary) hover:underline"
                >
                  Voir tous les produits (sans filtre culture)
                </button>
              )}
            </div>
          ) : (
            grouped.map(([groupKey, items]) => (
              <section key={groupKey}>
                <h3 className="sticky top-0 z-10 m-0 border-b border-(--color-border) bg-[#fbfbf9] px-4 py-2 text-[11px] font-semibold tracking-wider text-(--color-muted) uppercase">
                  {groupKey} · {items.length}
                </h3>
                <ul className="m-0 list-none p-0">
                  {items.map((p) => {
                    const isSelected = p.id === currentValue;
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => onSelect(p)}
                          className={[
                            'flex w-full items-start gap-3 border-b border-(--color-border) px-4 py-3 text-left hover:bg-[#fbfbf9]',
                            isSelected ? 'bg-(--color-primary)/6' : '',
                          ].join(' ')}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="truncate text-sm font-semibold">{p.name}</span>
                              {p.manufacturer && (
                                <span className="shrink-0 text-[11px] text-(--color-muted)">
                                  {p.manufacturer}
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 text-[11px] text-(--color-muted)">
                              {productSubtitle(p)}
                            </div>
                            {p.type === 'phyto' &&
                              p.authorizedCrops &&
                              p.authorizedCrops.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {p.authorizedCrops.slice(0, 3).map((c) => (
                                    <span
                                      key={c}
                                      className="inline-flex items-center rounded-(--radius-pill) bg-[#f1f1ee] px-1.5 py-0.5 text-[10px] text-(--color-muted)"
                                    >
                                      {c}
                                    </span>
                                  ))}
                                  {p.authorizedCrops.length > 3 && (
                                    <span className="text-[10px] text-(--color-muted)">
                                      +{p.authorizedCrops.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>
                          {isSelected && (
                            <span
                              className="shrink-0 text-(--color-primary)"
                              aria-label="Sélectionné"
                            >
                              <CheckIcon />
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function categoryKey(p: Product): string {
  if (p.type === 'phyto') {
    const labels: Record<string, string> = {
      herbicide: 'Herbicides',
      fungicide: 'Fongicides',
      insecticide: 'Insecticides',
      'growth-regulator': 'Régulateurs de croissance',
      molluscicide: 'Molluscicides',
      other: 'Autres phyto',
    };
    return labels[p.category] ?? p.category;
  }
  if (p.type === 'fertilizer') {
    const labels: Record<string, string> = {
      mineral: 'Engrais minéraux',
      organic: 'Engrais organiques',
      amendment: 'Amendements',
    };
    return labels[p.category] ?? p.category;
  }
  return p.cropName;
}

function productSubtitle(p: Product): string {
  if (p.type === 'phyto') {
    const phyto = p as PhytoProduct;
    return `OFAG ${phyto.ofagNumber} · ${phyto.activeSubstance} · délai ${phyto.withholdingDays}j`;
  }
  if (p.type === 'fertilizer') {
    const f = p as FertilizerProduct;
    const npk = `${f.nPerUnit}/${f.pPerUnit}/${f.kPerUnit}`;
    return `N/P/K = ${npk} par ${f.defaultDoseUnit}`;
  }
  const s = p as SeedProduct;
  return `${s.varietyName}${s.certified ? ' (certifiée)' : ''} · ${s.defaultDoseUnit}`;
}

function searchPlaceholder(type: ProductType): string {
  if (type === 'phyto') return 'Rechercher (nom, OFAG, substance active…)';
  if (type === 'fertilizer') return 'Rechercher (nom, fabricant…)';
  return 'Rechercher (culture, variété…)';
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={16}
      height={16}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={18}
      height={18}
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={18}
      height={18}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
