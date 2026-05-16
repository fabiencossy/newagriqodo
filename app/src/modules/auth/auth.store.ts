import { useSyncExternalStore } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * Store d'authentification dual-mode.
 *
 * - 'demo'          : données mockées Darval (accès direct sans compte).
 * - 'authenticated' : utilisateur connecté via Supabase Auth.
 * - 'logged-out'    : écran de login.
 *
 * Le mode démo n'appelle JAMAIS Supabase — il reste un sandbox local
 * pour éviter toute fuite de données réelles depuis la démo publique.
 */

export type AuthMode = 'logged-out' | 'demo' | 'authenticated';

interface AuthState {
  mode: AuthMode;
  email?: string;
  userId?: string;
}

const STORAGE_KEY = 'newagriqodo-auth-v1';

function loadInitial(): AuthState {
  if (typeof window === 'undefined') return { mode: 'logged-out' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { mode: 'logged-out' };
    const parsed = JSON.parse(raw) as AuthState;
    if (parsed.mode === 'demo') return { mode: 'demo' };
    if (parsed.mode === 'authenticated') return parsed;
    return { mode: 'logged-out' };
  } catch {
    return { mode: 'logged-out' };
  }
}

let state: AuthState = loadInitial();
const listeners = new Set<() => void>();

function persist(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage indisponible (mode privé) — on continue silencieusement
  }
}

function setState(next: AuthState): void {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

export function getAuth(): AuthState {
  return state;
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

// — Démo —————————————————————————————————————————————————————————————

export function enterDemoMode(): void {
  setState({ mode: 'demo' });
}

// — Auth réelle Supabase ————————————————————————————————————————————

export interface AuthResult {
  ok: boolean;
  error?: string;
}

function mapError(message: string | undefined): string {
  if (!message) return 'Une erreur est survenue. Réessayez.';
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Email ou mot de passe incorrect.';
  if (m.includes('email not confirmed'))
    return 'Email non confirmé. Vérifiez votre boîte de réception.';
  if (m.includes('user already registered')) return 'Un compte existe déjà avec cet email.';
  if (m.includes('password should be at least'))
    return 'Le mot de passe doit faire au moins 8 caractères.';
  return message;
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  if (!supabase) {
    return { ok: false, error: "Le serveur d'authentification n'est pas configuré." };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error || !data.user) return { ok: false, error: mapError(error?.message) };
  setState({ mode: 'authenticated', email: data.user.email ?? email, userId: data.user.id });
  return { ok: true };
}

export async function signUpWithPassword(email: string, password: string): Promise<AuthResult> {
  if (!supabase) {
    return { ok: false, error: "Le serveur d'authentification n'est pas configuré." };
  }
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });
  if (error) return { ok: false, error: mapError(error.message) };
  if (data.session && data.user) {
    setState({ mode: 'authenticated', email: data.user.email ?? email, userId: data.user.id });
  }
  return { ok: true };
}

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  if (!supabase) {
    return { ok: false, error: "Le serveur d'authentification n'est pas configuré." };
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) return { ok: false, error: mapError(error.message) };
  return { ok: true };
}

/**
 * Accepter une invitation : l'utilisateur arrive depuis le mail d'invitation
 * (GoTrue a déjà ouvert une session de récupération via le hash dans l'URL).
 * Il choisit son mot de passe + nom, ce qui finalise son inscription.
 */
export async function acceptInvitation(newPassword: string, fullName: string): Promise<AuthResult> {
  if (!supabase) {
    return { ok: false, error: "Le serveur d'authentification n'est pas configuré." };
  }
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
    data: { full_name: fullName.trim() },
  });
  if (error) return { ok: false, error: mapError(error.message) };
  if (data.user) {
    setState({
      mode: 'authenticated',
      email: data.user.email ?? state.email,
      userId: data.user.id,
    });
  }
  return { ok: true };
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  if (!supabase) {
    return { ok: false, error: "Le serveur d'authentification n'est pas configuré." };
  }
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: mapError(error.message) };
  if (data.user) {
    setState({
      mode: 'authenticated',
      email: data.user.email ?? state.email,
      userId: data.user.id,
    });
  }
  return { ok: true };
}

export async function logout(): Promise<void> {
  if (supabase && state.mode === 'authenticated') {
    await supabase.auth.signOut();
  }
  setState({ mode: 'logged-out' });
}

// — Bootstrap session Supabase ——————————————————————————————————————

/**
 * À appeler une fois au démarrage (App.tsx) pour :
 *   1. récupérer la session Supabase existante (refresh token),
 *   2. écouter les changements (login depuis un autre onglet, expiration, …).
 *
 * Ne touche pas au mode 'demo' — l'utilisateur peut rester en démo
 * indépendamment de l'état Supabase.
 */
export function initAuthListener(): () => void {
  if (!supabase) return () => undefined;

  void supabase.auth.getSession().then(({ data }) => {
    const session = data.session;
    if (session?.user && state.mode !== 'demo') {
      setState({
        mode: 'authenticated',
        email: session.user.email ?? undefined,
        userId: session.user.id,
      });
    }
  });

  const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
    if (state.mode === 'demo') return;
    if (event === 'SIGNED_OUT' || !session) {
      if (state.mode === 'authenticated') setState({ mode: 'logged-out' });
      return;
    }
    if (session.user) {
      setState({
        mode: 'authenticated',
        email: session.user.email ?? undefined,
        userId: session.user.id,
      });
    }
  });

  return () => {
    sub.subscription.unsubscribe();
  };
}

// — Compat (ancien API) ————————————————————————————————————————————

/**
 * @deprecated Utilisé par d'anciens tests / écrans. Utiliser `signInWithPassword`.
 */
export function loginAs(email: string): void {
  setState({ mode: 'authenticated', email });
}
