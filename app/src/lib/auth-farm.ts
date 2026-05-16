import { useSyncExternalStore } from 'react';
import { getAuth, subscribeAuth, type AuthMode } from '../modules/auth/auth.store';
import { getCurrentFarmId, subscribeFarms } from '../modules/farms/farms.store';

/**
 * Helper qui combine mode auth + farm courante en un seul abonnement.
 *
 * Utilisé par tous les stores dual-mode pour déclencher un refetch
 * quand l'utilisateur change de mode (login/logout) ou de farm.
 */

export interface AuthFarmContext {
  mode: AuthMode;
  farmId: string;
  /** True si mode === 'authenticated' ET farmId est un UUID Supabase (pas un ID mock). */
  isRealFarm: boolean;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function getAuthFarm(): AuthFarmContext {
  const { mode } = getAuth();
  const farmId = getCurrentFarmId();
  return {
    mode,
    farmId,
    isRealFarm: mode === 'authenticated' && UUID_RE.test(farmId),
  };
}

function subscribeAuthFarm(listener: () => void): () => void {
  const u1 = subscribeAuth(listener);
  const u2 = subscribeFarms(listener);
  return () => {
    u1();
    u2();
  };
}

export function useAuthFarm(): AuthFarmContext {
  return useSyncExternalStore(subscribeAuthFarm, getAuthFarm, getAuthFarm);
}

/** Subscribe-only (pour les stores qui doivent re-hydrater au changement). */
export function onAuthFarmChange(listener: (ctx: AuthFarmContext) => void): () => void {
  return subscribeAuthFarm(() => listener(getAuthFarm()));
}
