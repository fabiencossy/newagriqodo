import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useParcels } from '../modules/parcellaire/parcellaire.store';
import {
  addInterventions,
  removeIntervention,
  updateIntervention,
} from '../modules/carnet/carnet.store';
import { InterventionForm } from '../modules/carnet/InterventionForm';
import type { Intervention } from '../modules/carnet/carnet.types';

/**
 * Provider global du formulaire d'intervention.
 *
 * Permet à n'importe quelle page (et donc au FAB unifié) d'ouvrir le
 * formulaire `InterventionForm` sans naviguer vers `/carnet`. Le formulaire
 * est rendu dans l'AppLayout, et son ouverture/fermeture est pilotée par ce
 * contexte.
 *
 * Usage :
 * ```tsx
 * const { openInterventionForm } = useInterventionForm();
 * openInterventionForm({ parcelId: 'PF-001', category: 'phyto' });
 * ```
 */

interface InterventionFormContextValue {
  /** Ouvre le formulaire avec un brouillon (Partial) ou une intervention existante. */
  openInterventionForm: (initial?: Partial<Intervention> | Intervention) => void;
}

const InterventionFormContext = createContext<InterventionFormContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useInterventionForm(): InterventionFormContextValue {
  const ctx = useContext(InterventionFormContext);
  if (!ctx) {
    throw new Error('useInterventionForm doit être utilisé dans un InterventionFormProvider.');
  }
  return ctx;
}

export function InterventionFormProvider({ children }: { children: React.ReactNode }) {
  const parcels = useParcels();
  const [editing, setEditing] = useState<Partial<Intervention> | Intervention | null>(null);
  const isExisting = editing !== null && 'id' in editing && Boolean(editing.id);

  const openInterventionForm = useCallback((initial?: Partial<Intervention> | Intervention) => {
    setEditing(initial ?? {});
  }, []);

  const close = useCallback(() => setEditing(null), []);

  const handleSave = useCallback(
    (intervention: Intervention) => {
      if (isExisting && (editing as Intervention).id === intervention.id) {
        updateIntervention(intervention.id, intervention);
      } else {
        addInterventions([intervention]);
      }
      setEditing(null);
    },
    [editing, isExisting],
  );

  const handleDelete = useCallback(() => {
    if (isExisting) {
      removeIntervention((editing as Intervention).id);
    }
    setEditing(null);
  }, [editing, isExisting]);

  const value = useMemo(() => ({ openInterventionForm }), [openInterventionForm]);

  return (
    <InterventionFormContext.Provider value={value}>
      {children}
      {editing && (
        <InterventionForm
          initial={editing}
          parcels={parcels}
          onSave={handleSave}
          onCancel={close}
          onDelete={isExisting ? handleDelete : undefined}
        />
      )}
    </InterventionFormContext.Provider>
  );
}
