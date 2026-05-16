import { useSyncExternalStore } from 'react';

/**
 * Store d'authentification minimal (MVP local).
 *
 * Pour le MVP, l'auth est purement client-side avec localStorage. En Phase 3,
 * sera remplacée par une vraie auth Odoo (XML-RPC `common.login` + session cookie)
 * ou JWT depuis un backend dédié.
 *
 * Mode 'demo' = données mockées Darval (par défaut, accessible sans compte).
 * Mode 'authenticated' = utilisateur connecté (Phase 3 — accède à ses propres données).
 * Mode 'logged-out' = écran de login.
 */

export type AuthMode = 'logged-out' | 'demo' | 'authenticated';

interface AuthState {
  mode: AuthMode;
  /** Email de l'utilisateur si authenticated. */
  email?: string;
}

const STORAGE_KEY = 'newagriqodo-auth-v1';

function loadInitial(): AuthState {
  if (typeof window === 'undefined') return { mode: 'logged-out' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { mode: 'logged-out' };
    const parsed = JSON.parse(raw) as AuthState;
    return parsed.mode === 'demo' || parsed.mode === 'authenticated'
      ? parsed
      : { mode: 'logged-out' };
  } catch {
    return { mode: 'logged-out' };
  }
}

let state: AuthState = loadInitial();
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage indisponible (mode privé) — on continue silencieusement
    }
  }
}

export function getAuth(): AuthState {
  return state;
}

export function enterDemoMode(): void {
  state = { mode: 'demo' };
  emit();
}

export function loginAs(email: string): void {
  state = { mode: 'authenticated', email };
  emit();
}

export function logout(): void {
  state = { mode: 'logged-out' };
  emit();
}

export function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAuth(): AuthState {
  return useSyncExternalStore(subscribeAuth, getAuth, getAuth);
}
