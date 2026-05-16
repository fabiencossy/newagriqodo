import type { AppUser } from './users.types';

/**
 * Utilisateurs mock du Domaine Darval.
 * À remplacer par fetch Odoo `hr.employee` + `res.users` en Phase 3.
 */
export const USERS: ReadonlyArray<AppUser> = [
  {
    id: 'U-001',
    displayName: 'F. Cossy',
    fullName: 'Fabien Cossy',
    email: 'fabien.cossy@hofer-groupe.ch',
    role: 'admin',
    color: '#2d5016',
    initials: 'FC',
    active: true,
    odooEmployeeId: 1,
  },
  {
    id: 'U-002',
    displayName: 'M. Dubois',
    fullName: 'Marc Dubois',
    email: 'marc.dubois@darval.ch',
    role: 'editor',
    color: '#875a7b',
    initials: 'MD',
    active: true,
    odooEmployeeId: 2,
  },
  {
    id: 'U-003',
    displayName: 'L. Genton',
    fullName: 'Lucas Genton',
    email: 'lucas.genton@darval.ch',
    role: 'editor',
    color: '#a16207',
    initials: 'LG',
    active: true,
    odooEmployeeId: 3,
  },
  {
    id: 'U-004',
    displayName: 'S. Bovay',
    fullName: 'Sophie Bovay',
    email: 'sophie.bovay@darval.ch',
    role: 'viewer',
    color: '#0284c7',
    initials: 'SB',
    active: true,
    odooEmployeeId: 4,
  },
  {
    id: 'U-005',
    displayName: 'Entrepreneur Genton SA',
    fullName: 'Entrepreneur Genton SA (tiers)',
    role: 'viewer',
    color: '#6b7280',
    initials: 'EG',
    active: true,
    // Tiers prestataire — pas de compte Odoo employé
  },
];
