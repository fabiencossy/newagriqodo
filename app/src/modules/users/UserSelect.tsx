import { useUsers } from './users.store';
import type { AppUser } from './users.types';

interface UserSelectProps {
  /** Id de l'utilisateur sélectionné. */
  value?: string;
  /** Callback : appelé avec l'id (ou undefined si "Aucun"). */
  onChange: (userId: string | undefined) => void;
  /** Filtre : ne montrer que les utilisateurs actifs (défaut true). */
  activeOnly?: boolean;
  /** Permettre "Aucun" comme option. */
  allowEmpty?: boolean;
  /** Affichage en mode chip (lecture) si onChange absent. */
  readOnly?: boolean;
  /** Classes additionnelles. */
  className?: string;
  ariaLabel?: string;
}

/**
 * Sélecteur d'utilisateur de l'app. Remplace les champs `operator: string`
 * libres par une sélection dans le référentiel `users.store`.
 *
 * Utilisé dans : InterventionForm, futurs formulaires RH / Travaux.
 */
export function UserSelect({
  value,
  onChange,
  activeOnly = true,
  allowEmpty = true,
  readOnly = false,
  className,
  ariaLabel,
}: UserSelectProps) {
  const all = useUsers();
  const users = activeOnly ? all.filter((u) => u.active) : all;
  const selected = users.find((u) => u.id === value);

  if (readOnly) {
    return selected ? (
      <UserChip user={selected} />
    ) : (
      <span className="text-(--color-muted)">—</span>
    );
  }

  return (
    <select
      aria-label={ariaLabel ?? 'Sélectionner un utilisateur'}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || undefined)}
      className={[
        'h-10 w-full rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-3 text-sm focus:border-(--color-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15',
        className ?? '',
      ].join(' ')}
    >
      {allowEmpty && <option value="">— Aucun —</option>}
      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.fullName}
          {u.role === 'admin' ? ' (admin)' : ''}
        </option>
      ))}
    </select>
  );
}

/** Chip lecture (avatar coloré avec initiales + nom). */
export function UserChip({ user, size = 24 }: { user: AppUser; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span
        aria-hidden="true"
        className="inline-flex shrink-0 items-center justify-center rounded-(--radius-pill) font-semibold text-white"
        style={{
          width: size,
          height: size,
          background: user.color,
          fontSize: Math.floor(size * 0.42),
        }}
      >
        {user.initials}
      </span>
      <span className="truncate">{user.displayName}</span>
    </span>
  );
}
