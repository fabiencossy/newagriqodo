import { useParcels } from '../../modules/parcellaire/parcellaire.store';
import { EntityLink } from './EntityLink';

interface ParcelLinkProps {
  parcelId: string;
  /** Force le label affiché. Si absent : nom de la parcelle depuis le store. */
  label?: string;
  variant?: 'chip' | 'compact-button' | 'tap-row';
  beforeNavigate?: () => void;
  className?: string;
}

/**
 * Lien vers la fiche d'une parcelle. Résout le nom depuis le store partagé.
 * Si la parcelle n'existe pas (id orphelin), affiche l'id tel quel.
 */
export function ParcelLink({
  parcelId,
  label,
  variant = 'chip',
  beforeNavigate,
  className,
}: ParcelLinkProps) {
  const parcels = useParcels();
  const parcel = parcels.find((p) => p.id === parcelId);
  const displayLabel = label ?? parcel?.name ?? parcelId;
  const meta = parcel ? `${parcelId} · ${parcel.surfaceHa.toFixed(2)} ha` : parcelId;

  return (
    <EntityLink
      to={`/parcellaire/${parcelId}`}
      label={displayLabel}
      meta={variant === 'tap-row' ? meta : undefined}
      variant={variant}
      beforeNavigate={beforeNavigate}
      className={className}
    />
  );
}
