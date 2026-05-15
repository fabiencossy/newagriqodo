import { useSyncExternalStore } from 'react';

/**
 * Hook réactif à une media query — utilise useSyncExternalStore (React 18+).
 * Évite les warnings "setState in effect" et fonctionne en SSR (false par défaut).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      if (typeof window === 'undefined') return () => {};
      const mq = window.matchMedia(query);
      mq.addEventListener('change', notify);
      return () => mq.removeEventListener('change', notify);
    },
    () => {
      if (typeof window === 'undefined') return false;
      return window.matchMedia(query).matches;
    },
    () => false,
  );
}

/** Helper : true si viewport ≥ 768 px (tablette/desktop). */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)');
}
