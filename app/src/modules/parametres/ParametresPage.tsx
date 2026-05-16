import { useMemo, useState } from 'react';
import { PageContainer } from '../_shared/PageContainer';
import { Tabs, TabPanel } from '../../components/Tabs';
import { useUsers, removeUser } from '../users/users.store';
import { UserChip } from '../users/UserSelect';
import { UserEditModal } from '../users/UserEditModal';
import type { AppUser } from '../users/users.types';
import { useProducts, removeProduct } from '../products/products.store';
import { ProductEditModal } from '../products/ProductEditModal';
import type { Product, ProductType } from '../products/products.types';

const TYPE_LABELS: Record<ProductType, string> = {
  phyto: 'Phyto',
  fertilizer: 'Engrais',
  seed: 'Semences',
};

export default function ParametresPage() {
  const [tab, setTab] = useState<string>('users');

  return (
    <PageContainer>
      <header className="mb-5">
        <h1 className="m-0 text-xl font-semibold">Paramètres</h1>
        <p className="m-0 mt-0.5 text-sm text-(--color-muted)">
          Exploitation, utilisateurs, catalogue produits, intégrations
        </p>
      </header>

      <Tabs
        tabs={[
          { key: 'users', label: 'Utilisateurs' },
          { key: 'products', label: 'Catalogue produits' },
          { key: 'sync', label: 'Synchronisation Odoo', disabled: true },
        ]}
        activeKey={tab}
        onChange={setTab}
        className="mb-5"
      />

      <TabPanel tabKey="users" active={tab}>
        <UsersTab />
      </TabPanel>

      <TabPanel tabKey="products" active={tab}>
        <ProductsTab />
      </TabPanel>
    </PageContainer>
  );
}

/* ============ Onglet Utilisateurs ============ */

function UsersTab() {
  const users = useUsers();
  const [editing, setEditing] = useState<Partial<AppUser> | null>(null);

  const handleDelete = (user: AppUser) => {
    if (confirm(`Supprimer l'utilisateur ${user.fullName} ?`)) {
      removeUser(user.id);
    }
  };

  return (
    <section className="rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="m-0 text-sm font-semibold tracking-wider text-(--color-muted) uppercase">
          {users.length} utilisateur{users.length > 1 ? 's' : ''}
        </h2>
        <button
          type="button"
          onClick={() => setEditing({})}
          className="inline-flex h-9 items-center gap-1.5 rounded-(--radius) border border-(--color-primary) bg-(--color-primary) px-3 text-xs font-medium text-white hover:bg-(--color-primary-hover)"
        >
          + Nouvel utilisateur
        </button>
      </div>

      {users.length === 0 ? (
        <p className="m-0 py-10 text-center text-sm text-(--color-muted)">
          Aucun utilisateur enregistré.
        </p>
      ) : (
        <ul className="m-0 list-none space-y-2 p-0">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex items-center gap-3 rounded-(--radius-sm) border border-(--color-border) bg-(--color-surface) p-3"
            >
              <UserChip user={u} size={32} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{u.fullName}</div>
                <div className="truncate text-[11px] text-(--color-muted)">
                  {u.email ?? '—'} · {u.role}
                  {!u.active && ' · ARCHIVÉ'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditing(u)}
                className="inline-flex h-9 items-center rounded-(--radius-sm) border border-(--color-border) bg-(--color-surface) px-3 text-xs font-medium hover:bg-[#f8f8f5]"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => handleDelete(u)}
                aria-label={`Supprimer ${u.fullName}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-(--radius-sm) text-(--color-error) hover:bg-[#fef2f2]"
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      )}

      {editing && <UserEditModal initial={editing} onClose={() => setEditing(null)} />}
    </section>
  );
}

/* ============ Onglet Catalogue produits ============ */

function ProductsTab() {
  const products = useProducts();
  const [typeFilter, setTypeFilter] = useState<ProductType | 'all'>('all');
  const [editing, setEditing] = useState<{
    initial?: Partial<Product>;
    defaultType?: ProductType;
  } | null>(null);

  const filtered = useMemo(
    () => (typeFilter === 'all' ? products : products.filter((p) => p.type === typeFilter)),
    [products, typeFilter],
  );

  const handleDelete = (p: Product) => {
    if (confirm(`Supprimer le produit ${p.name} du catalogue ?`)) {
      removeProduct(p.id);
    }
  };

  return (
    <section className="rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="m-0 mr-auto text-sm font-semibold tracking-wider text-(--color-muted) uppercase">
          {filtered.length} produit{filtered.length > 1 ? 's' : ''}
        </h2>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ProductType | 'all')}
          aria-label="Filtrer par type"
          className="h-9 rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-2 text-sm font-medium text-(--color-text) hover:bg-[#f8f8f5]"
        >
          <option value="all">Tous les types</option>
          <option value="phyto">Phyto</option>
          <option value="fertilizer">Engrais</option>
          <option value="seed">Semences</option>
        </select>
        <button
          type="button"
          onClick={() =>
            setEditing({
              defaultType: typeFilter === 'all' ? 'phyto' : typeFilter,
            })
          }
          className="inline-flex h-9 items-center gap-1.5 rounded-(--radius) border border-(--color-primary) bg-(--color-primary) px-3 text-xs font-medium text-white hover:bg-(--color-primary-hover)"
        >
          + Nouveau produit
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="m-0 py-10 text-center text-sm text-(--color-muted)">
          Aucun produit pour ce filtre.
        </p>
      ) : (
        <ul className="m-0 list-none space-y-2 p-0">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-(--radius-sm) border border-(--color-border) bg-(--color-surface) p-3"
            >
              <span
                className="inline-flex shrink-0 items-center rounded-(--radius-pill) bg-(--color-primary)/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-(--color-primary) uppercase"
                title={p.type}
              >
                {TYPE_LABELS[p.type]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {p.name}
                  {p.manufacturer && (
                    <span className="ml-1 text-(--color-muted)">· {p.manufacturer}</span>
                  )}
                </div>
                <div className="truncate text-[11px] text-(--color-muted)">
                  {productSubtitle(p)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditing({ initial: p })}
                className="inline-flex h-9 items-center rounded-(--radius-sm) border border-(--color-border) bg-(--color-surface) px-3 text-xs font-medium hover:bg-[#f8f8f5]"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => handleDelete(p)}
                aria-label={`Supprimer ${p.name}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-(--radius-sm) text-(--color-error) hover:bg-[#fef2f2]"
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <ProductEditModal
          initial={editing.initial}
          defaultType={editing.defaultType}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

function productSubtitle(p: Product): string {
  if (p.type === 'phyto') {
    return `${p.category} · OFAG ${p.ofagNumber} · délai ${p.withholdingDays}j`;
  }
  if (p.type === 'fertilizer') {
    const npk = `${p.nPerUnit}/${p.pPerUnit}/${p.kPerUnit}`;
    return `${p.category} · N/P/K = ${npk} (${p.defaultDoseUnit})`;
  }
  return `${p.cropName} · ${p.varietyName}${p.certified ? ' (certifiée)' : ''}`;
}

function TrashIcon() {
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
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}
