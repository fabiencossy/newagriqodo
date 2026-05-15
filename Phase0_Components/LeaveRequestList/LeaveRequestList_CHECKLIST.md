# LeaveRequestList — Validation Checklist

**Composant** : 8/8
**Statut** : ✅ Esquisse Phase 0 complétée

## Décisions prises

| Question | Réponse |
|---|---|
| Manager comments / notes d'approbation | **Masqués** dans la vue employé. On affiche uniquement statut + (optionnellement) `approvedBy`. Aligné avec `CLARIFICATIONS_FINALES.md` (vue employé seulement). |
| Création depuis l'app | **Non** — read-only. Les demandes se font dans Odoo. Bandeau d'état vide explique ce point. |
| Solde annuel | ✅ Affiché en pill (header). Données fournies par `balance?: LeaveBalance`. |
| Filtres | Tous / En attente / Approuvés / Refusés. Compteurs entre parenthèses (desktop). |
| Mode dégradé Odoo down | Bannière "Sync RH temporairement indisponible" + `lastSyncAt`. Aligné avec `CLARIFICATIONS_FINALES.md` §5 RH. |

## Design & UX
- [x] Wireframe : desktop, mobile, vide, loading, sync down
- [x] Mobile-first (cards déjà verticaux)
- [x] Badges statut color + texte (a11y daltonisme)
- [x] Solde en pill visible immédiatement
- [x] Hover state sur items (subtil)
- [x] Empty state engageant (explique le flow Odoo)

## Code
- [x] `LeaveStatus` + `LeaveStatusFilter` strict union
- [x] `LeaveRequest` mappable depuis Odoo `hr.leave`
- [x] `LeaveBalance` séparé (calcul Odoo / service)
- [x] `LEAVE_STATUS_LABELS` FR centralisé
- [x] Defaults documentés
- [x] Pas de `any`
- [ ] Implémentation React → Phase 1

## Accessibilité
- [x] `<ul>` sémantique pour la liste
- [x] Filtres : `role="tablist"` + `aria-pressed`
- [x] Badges : texte (pas couleur seule)
- [x] Loading : `aria-busy`
- [x] Cibles tactiles ≥ 32 px (filtres) / 60 px (items)
- [x] Contraste badges vérifié

## Edge cases
- [x] Liste vide → empty state explicite
- [x] Sync Odoo down → bannière + lastSyncAt
- [x] Demande en cours d'approbation (pending) → badge orange
- [x] Demande passée (dateTo < today) → toujours affichée
- [x] Long reason → truncate + tooltip (à câbler Phase 1)
- [x] Beaucoup de demandes → pagination ou lazy load (à décider Phase 1)

## Conformité spec
- [x] Read-only ✓ (no edit/create)
- [x] Manager notes masquées ✓
- [x] Sync Odoo unidirectionnelle (lecture seule app)
- [x] Filtre par statut ✓
- [x] Solde annuel ✓

## Réutilisation
Module RH uniquement.

## Status
✅ **Prêt pour Phase 1**
