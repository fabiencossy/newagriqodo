import { useState } from 'react';
import { addUser, updateUser } from './users.store';
import type { AppUser, UserRole } from './users.types';

interface UserEditModalProps {
  /** Si fourni avec un id : édition. Sinon : création. */
  initial?: Partial<AppUser>;
  onClose: () => void;
}

const ROLES: UserRole[] = ['admin', 'editor', 'viewer'];
const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  editor: 'Éditeur',
  viewer: 'Lecteur',
};

const DEFAULT_COLORS = [
  '#2d5016',
  '#875a7b',
  '#a16207',
  '#0284c7',
  '#dc2626',
  '#16a34a',
  '#6b7280',
];

export function UserEditModal({ initial, onClose }: UserEditModalProps) {
  const isExisting = Boolean(initial?.id);
  const [draft, setDraft] = useState<Partial<AppUser>>(() => ({
    role: 'editor',
    active: true,
    // Couleur initiale random (init lazy = exécuté une seule fois au mount,
    // donc compatible avec react-hooks/purity).
    color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
    ...initial,
  }));

  const setField = <K extends keyof AppUser>(key: K, value: AppUser[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const submit = () => {
    if (!draft.fullName?.trim() || !draft.displayName?.trim()) return;
    const initials =
      draft.initials?.toUpperCase().slice(0, 2) ??
      draft.fullName
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    const user: AppUser = {
      id: draft.id ?? `U-${Date.now()}`,
      displayName: draft.displayName,
      fullName: draft.fullName,
      email: draft.email,
      role: draft.role ?? 'editor',
      color: draft.color ?? DEFAULT_COLORS[0]!,
      initials,
      active: draft.active ?? true,
      odooEmployeeId: draft.odooEmployeeId,
    };
    if (isExisting && draft.id) {
      updateUser(draft.id, user);
    } else {
      addUser(user);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/40 backdrop-blur-sm md:items-center md:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isExisting ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
        className="flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-(--radius-lg) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-popup) md:max-w-[480px] md:rounded-(--radius-lg)"
      >
        <header className="flex items-center gap-2 border-b border-(--color-border) px-4 py-3">
          <h2 className="m-0 text-sm font-semibold">
            {isExisting ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-(--radius-sm) text-(--color-muted) hover:bg-[#f1f1ee] hover:text-(--color-text)"
          >
            <CloseIcon />
          </button>
        </header>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <Field label="Nom complet">
            <input
              type="text"
              value={draft.fullName ?? ''}
              onChange={(e) => setField('fullName', e.target.value)}
              placeholder="Ex. Fabien Cossy"
              autoFocus
              className={inputClass}
            />
          </Field>
          <Field label="Nom usuel (affichage)">
            <input
              type="text"
              value={draft.displayName ?? ''}
              onChange={(e) => setField('displayName', e.target.value)}
              placeholder="Ex. F. Cossy"
              className={inputClass}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={draft.email ?? ''}
              onChange={(e) => setField('email', e.target.value || undefined)}
              placeholder="Ex. fabien.cossy@domaine.ch"
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Rôle">
              <select
                value={draft.role ?? 'editor'}
                onChange={(e) => setField('role', e.target.value as UserRole)}
                className={inputClass}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Actif">
              <select
                value={String(draft.active ?? true)}
                onChange={(e) => setField('active', e.target.value === 'true')}
                className={inputClass}
              >
                <option value="true">Oui</option>
                <option value="false">Non (archivé)</option>
              </select>
            </Field>
          </div>
          <Field label="Couleur d'avatar">
            <div className="flex flex-wrap gap-2">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setField('color', c)}
                  aria-label={`Couleur ${c}`}
                  className={[
                    'h-8 w-8 rounded-(--radius-pill) border-2 transition-all',
                    draft.color === c ? 'border-(--color-text) scale-110' : 'border-transparent',
                  ].join(' ')}
                  style={{ background: c }}
                />
              ))}
            </div>
          </Field>
          <p className="m-0 rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9] px-3 py-2 text-[11px] text-(--color-muted)">
            <strong>Phase 3</strong> — synchronisation Odoo <code>hr.employee</code> +{' '}
            <code>res.users</code> à venir.
          </p>
        </div>
        <footer className="flex items-center gap-2 border-t border-(--color-border) p-3">
          <button
            type="button"
            onClick={onClose}
            className="ml-auto inline-flex h-10 items-center rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-4 text-sm font-medium hover:bg-[#f8f8f5]"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!draft.fullName?.trim() || !draft.displayName?.trim()}
            className="inline-flex h-10 items-center rounded-(--radius) border border-(--color-primary) bg-(--color-primary) px-5 text-sm font-medium text-white hover:bg-(--color-primary-hover) disabled:opacity-50"
          >
            {isExisting ? 'Enregistrer' : 'Créer'}
          </button>
        </footer>
      </div>
    </div>
  );
}

const inputClass =
  'h-10 w-full rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-3 text-sm focus:border-(--color-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium">{label}</label>
      {children}
    </div>
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
      width={16}
      height={16}
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
