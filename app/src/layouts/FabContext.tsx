import { createContext, useCallback, useMemo, useState } from 'react';

/**
 * Action contextuelle pour le FAB global.
 * Chaque page publie ses actions via `useFabActions()`.
 */
export interface FabAction {
  id: string;
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface FabContextValue {
  actions: FabAction[];
  setActions: (actions: FabAction[]) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const FabContext = createContext<FabContextValue | null>(null);

export function FabProvider({ children }: { children: React.ReactNode }) {
  const [actions, setActionsState] = useState<FabAction[]>([]);
  const setActions = useCallback((next: FabAction[]) => setActionsState(next), []);
  const value = useMemo(() => ({ actions, setActions }), [actions, setActions]);
  return <FabContext.Provider value={value}>{children}</FabContext.Provider>;
}
