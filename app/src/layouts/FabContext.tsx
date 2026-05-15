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
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const FabContext = createContext<FabContextValue | null>(null);

export function FabProvider({ children }: { children: React.ReactNode }) {
  const [actions, setActionsState] = useState<FabAction[]>([]);
  const [hidden, setHiddenState] = useState(false);
  const setActions = useCallback((next: FabAction[]) => setActionsState(next), []);
  const setHidden = useCallback((next: boolean) => setHiddenState(next), []);
  const value = useMemo(
    () => ({ actions, setActions, hidden, setHidden }),
    [actions, setActions, hidden, setHidden],
  );
  return <FabContext.Provider value={value}>{children}</FabContext.Provider>;
}
