# HoursTableMonth — Validation Checklist

**Composant** : 7/8
**Statut** : ✅ Esquisse Phase 0 complétée

## Décisions prises

| Question | Réponse |
|---|---|
| YTD total row | ✅ **Oui**, affichée par défaut (`showYtdRow: true`). Styling distinct (background primary 5%, border top primary). |
| Colonnes triables | ✅ **Oui** : Mois / Travaillées / Dues / Solde. Tri contrôlé via `sortBy` + `sortDirection`. |
| Source des données | **Controlled** : `rows` + `ytd` passés en props. Le parent gère le fetch (Phase 1 = service Odoo / DB locale). |
| Format heures | **`HH:MM` par défaut** (cohérent avec saisie). Option `decimal` (150.5) disponible. |
| Year picker | Boutons ‹ / › + label année. Min 2020, max année courante. |
| Layout mobile | Card view (≤ 600 px), table sinon. Forçable via `layout`. |
| Color coding | Vert (+), rouge (−), gris (0). Toujours accompagné d'un signe (a11y daltonisme). |

## Design & UX
- [x] Wireframe : desktop table, mobile cards, vide, loading
- [x] Légende textuelle pour les couleurs
- [x] Hover row (desktop)
- [x] Year picker compact
- [x] Tri visible (icône ↑ / ↓ / ⇅)

## Code
- [x] `HoursMonthRow` + `HoursMonthYtd` séparés
- [x] `SortKey` strict union
- [x] Helpers : `computeYtd`, `formatHoursHhmm`
- [x] Defaults documentés
- [x] Pas de `any`
- [ ] Implémentation React → Phase 1

## Calcul (rappel spec CLARIFICATIONS_FINALES.md)
```
hoursWorked = SUM(TimesheetEntry.hoursWorked WHERE month=N)
hoursDue    = Employee.hoursPerMonth × ratio_mois - congés_pris - jours_fériés
balance     = hoursWorked - hoursDue
```
**Côté composant** : pure présentation, les calculs sont faits par le parent / service Phase 1.

## Accessibilité (WCAG AA)
- [x] `<table>` + `aria-label`
- [x] `scope="col"` sur les `<th>`
- [x] `aria-sort` sur les colonnes triables (ascending / descending / none)
- [x] Signes ± accompagnent la couleur (daltonisme)
- [x] Year picker : `aria-label` sur boutons
- [x] Loading : `aria-busy`
- [x] Contraste vert/rouge sur #fff vérifié ≥ 4.5:1

## Edge cases
- [x] Année passée vide → empty state ("Aucune saisie pour 2024")
- [x] Année courante avec mois futurs → mois futurs absents ou greyed
- [x] Mois en cours → flag `isCurrentMonth` (affichage badge "en cours")
- [x] Données partielles (saisies en retard) → row affichée, solde calculé
- [x] Très grand nombre d'heures (>999h) → tabular-nums + alignement droit

## Dépendance Module RH
Ce composant est l'élément central du Dashboard Heures (cf. MODULE_RH.md).

## Réutilisation
Module RH uniquement (Phase 0). Pourrait servir à un futur dashboard manager (hors scope actuel).

## Status
✅ **Prêt pour Phase 1**
