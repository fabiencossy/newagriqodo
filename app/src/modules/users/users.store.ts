import { useSyncExternalStore } from 'react';
import { supabase } from '../../lib/supabase';
import { onAuthFarmChange } from '../../lib/auth-farm';
import { getAuth } from '../auth/auth.store';
import { getCurrentFarmId } from '../farms/farms.store';
import { USERS as MOCK_USERS } from './users.mocks';
import type { AppUser, UserRole } from './users.types';

/**
 * Store équipe de l'exploitation — dual-mode.
 *
 * Mappé sur la table `farm_workers` côté Supabase (distinct des
 * `auth.users`, voir CLAUDE.md / S2). Permet d'identifier qui a fait
 * une intervention même si l'ouvrier n'a pas de compte.
 *
 * - mode 'demo' : USERS mocks (Darval), mutations locales
 * - mode 'authenticated' : INSERT/UPDATE/DELETE Supabase + refetch
 */

let users: ReadonlyArray<AppUser> = [...MOCK_USERS];
let loading = false;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

// — Mapping DB row <-> AppUser ————————————————————————————————————————

const PALETTE = ['#1f7a4d', '#2563eb', '#d97706', '#7c3aed', '#dc2626', '#059669'];

interface DbWorkerRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  role: string | null;
  active: boolean;
  user_id: string | null;
}

function colorFor(seed: string): string {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum = (sum + seed.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(sum) % PALETTE.length] ?? PALETTE[0]!;
}

function rowToAppUser(row: DbWorkerRow): AppUser {
  const fullName = `${row.first_name} ${row.last_name}`.trim();
  const initials = `${row.first_name[0] ?? ''}${row.last_name[0] ?? ''}`.toUpperCase();
  const displayName = `${row.first_name[0] ?? ''}. ${row.last_name}`.trim();
  const role: UserRole =
    row.role === 'admin' ? 'admin' : row.role === 'viewer' ? 'viewer' : 'editor';
  return {
    id: row.id,
    fullName,
    displayName,
    email: row.email ?? undefined,
    role,
    color: colorFor(row.id),
    initials: initials || '?',
    active: row.active,
  };
}

interface DbWorkerInsert {
  farm_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  role: string | null;
  active: boolean;
}

function appUserToInsert(u: AppUser, farmId: string): DbWorkerInsert {
  const parts = u.fullName.split(' ');
  const first = parts[0] ?? u.displayName;
  const last = parts.slice(1).join(' ') || first;
  return {
    farm_id: farmId,
    first_name: first,
    last_name: last,
    email: u.email ?? null,
    role: u.role,
    active: u.active,
  };
}

// — Hydratation ————————————————————————————————————————————————————————

async function hydrateFromSupabase(farmId: string): Promise<void> {
  if (!supabase) return;
  loading = true;
  emit();
  try {
    const { data, error } = await supabase
      .from('farm_workers')
      .select('id, first_name, last_name, email, role, active, user_id')
      .eq('farm_id', farmId)
      .order('last_name');
    if (error) {
      console.error('[users] hydrate failed:', error.message);
      users = [];
    } else {
      users = (data as DbWorkerRow[]).map(rowToAppUser);
    }
  } finally {
    loading = false;
    emit();
  }
}

function resetToMocks(): void {
  users = [...MOCK_USERS];
  emit();
}

// — API publique ———————————————————————————————————————————————————————

export function getUsers(): ReadonlyArray<AppUser> {
  return users;
}

export function getActiveUsers(): ReadonlyArray<AppUser> {
  return users.filter((u) => u.active);
}

export function getUserById(id: string | undefined): AppUser | undefined {
  if (!id) return undefined;
  return users.find((u) => u.id === id);
}

export function findUserByName(name: string | undefined): AppUser | undefined {
  if (!name) return undefined;
  const lc = name.toLowerCase().trim();
  return users.find((u) => u.displayName.toLowerCase() === lc || u.fullName.toLowerCase() === lc);
}

export function isUsersLoading(): boolean {
  return loading;
}

export function setUsers(next: ReadonlyArray<AppUser>): void {
  users = next;
  emit();
}

export async function addUser(user: AppUser): Promise<void> {
  if (getAuth().mode !== 'authenticated' || !supabase) {
    users = [...users, user];
    emit();
    return;
  }
  const farmId = getCurrentFarmId();
  if (!farmId) return;
  const { error } = await supabase.from('farm_workers').insert(appUserToInsert(user, farmId));
  if (error) {
    console.error('[users] insert failed:', error.message);
    return;
  }
  await hydrateFromSupabase(farmId);
}

export async function updateUser(id: string, patch: Partial<AppUser>): Promise<void> {
  if (getAuth().mode !== 'authenticated' || !supabase) {
    users = users.map((u) => (u.id === id ? { ...u, ...patch } : u));
    emit();
    return;
  }
  const current = users.find((u) => u.id === id);
  if (!current) return;
  const merged = { ...current, ...patch };
  const farmId = getCurrentFarmId();
  const upd = appUserToInsert(merged, farmId);
  const { error } = await supabase
    .from('farm_workers')
    .update({
      first_name: upd.first_name,
      last_name: upd.last_name,
      email: upd.email,
      role: upd.role,
      active: upd.active,
    })
    .eq('id', id);
  if (error) {
    console.error('[users] update failed:', error.message);
    return;
  }
  await hydrateFromSupabase(farmId);
}

export async function removeUser(id: string): Promise<void> {
  if (getAuth().mode !== 'authenticated' || !supabase) {
    users = users.filter((u) => u.id !== id);
    emit();
    return;
  }
  const farmId = getCurrentFarmId();
  const { error } = await supabase.from('farm_workers').delete().eq('id', id);
  if (error) {
    console.error('[users] delete failed:', error.message);
    return;
  }
  await hydrateFromSupabase(farmId);
}

export function subscribeUsers(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useUsers(): ReadonlyArray<AppUser> {
  return useSyncExternalStore(subscribeUsers, getUsers, getUsers);
}

// — Bootstrap ——————————————————————————————————————————————————————————

let bootstrapped = false;
export function initUsersBootstrap(): void {
  if (bootstrapped) return;
  bootstrapped = true;
  onAuthFarmChange((ctx) => {
    if (ctx.isRealFarm) {
      void hydrateFromSupabase(ctx.farmId);
    } else {
      resetToMocks();
    }
  });
}
