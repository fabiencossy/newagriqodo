import { useEffect, useState } from 'react';

/**
 * Debounce une valeur : retourne la dernière valeur stable après `delayMs` ms sans changement.
 */
export function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
