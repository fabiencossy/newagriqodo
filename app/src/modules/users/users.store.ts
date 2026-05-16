import { useSyncExternalStore } from 'react';
import { USERS as INITIAL } from './users.mocks';
import type { AppUser } from './users.types';

/**
 * Store partagé des utilisateurs de l'app.
 * Pour l'instant read-only (mocks). Phase 3 : sync Odoo `hr.employee`.
 */

let users: ReadonlyArray<AppUser> = [...INITIAL];
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

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

/** Cherche par displayName ou fullName (utile pour migrer les anciens champs operator: string). */
export function findUserByName(name: string | undefined): AppUser | undefined {
  if (!name) return undefined;
  const lc = name.toLowerCase().trim();
  return users.find((u) => u.displayName.toLowerCase() === lc || u.fullName.toLowerCase() === lc);
}

export function subscribeUsers(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setUsers(next: ReadonlyArray<AppUser>): void {
  users = next;
  emit();
}

export function addUser(user: AppUser): void {
  users = [...users, user];
  emit();
}

export function updateUser(id: string, patch: Partial<AppUser>): void {
  users = users.map((u) => (u.id === id ? { ...u, ...patch } : u));
  emit();
}

export function removeUser(id: string): void {
  users = users.filter((u) => u.id !== id);
  emit();
}

export function useUsers(): ReadonlyArray<AppUser> {
  return useSyncExternalStore(subscribeUsers, getUsers, getUsers);
}
