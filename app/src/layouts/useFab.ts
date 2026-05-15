import { useContext, useEffect } from 'react';
import { FabContext, type FabAction, type FabContextValue } from './FabContext';

export function useFab(): FabContextValue {
  const ctx = useContext(FabContext);
  if (!ctx) throw new Error('useFab doit être utilisé dans un FabProvider.');
  return ctx;
}

/**
 * Hook à utiliser dans chaque page pour publier ses actions contextuelles.
 * À chaque mount, les actions sont enregistrées ; à l'unmount, vidées.
 *
 * IMPORTANT : memoize la liste `actions` côté appelant (useMemo) pour éviter
 * une boucle infinie.
 */
export function useFabActions(actions: FabAction[]): void {
  const { setActions } = useFab();
  useEffect(() => {
    setActions(actions);
    return () => setActions([]);
  }, [actions, setActions]);
}
