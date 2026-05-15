# TimesheetEntry — Validation Checklist

**Composant** : 6/8
**Statut** : ✅ Esquisse Phase 0 complétée

## Décisions prises

| Question | Réponse |
|---|---|
| Max heures par jour | **16 h** (configurable via `maxHoursPerDay`). Validation côté form + côté Odoo. |
| Dates passées autorisées | **Oui, jusqu'à 90 jours** (configurable via `maxPastDays`). Au-delà : saisie via admin / correction Odoo. |
| Dates futures | **Non par défaut** (configurable via `allowFutureDates`). Une présence se déclare a posteriori. |
| Format heures | **`HH:MM` ou décimal** (`2:30` ou `2.5`). Helper `parseHoursInput()` couvre les deux. |
| Auto-create Odoo | **Oui (Hook 1)** : sur `onSubmit`, le parent crée l'Attendance Odoo. Si échec → file locale + retry. |
| Mode "linked" | Intervention pré-remplie (props `intervention`), pas modifiable. |

## Design & UX
- [x] Wireframe : standalone, validation erreur, loading, succès, erreur Odoo, mode linked
- [x] Mobile-first (form full-width)
- [x] Inputs natifs (date, text) → support OS
- [x] Hint texte sous chaque champ explicite (format, limites)
- [x] Suffix "HH:MM" dans l'input heures
- [x] Toast confirmation : "✓ Présence créée dans Odoo · 2h30 le 15/05/2026"

## Code
- [x] `ProjectType` strict union
- [x] `TimesheetEntryInput` complet
- [x] `TimesheetSuggestion` pour autocomplete
- [x] Helpers exportés : `parseHoursInput`, `formatHoursDecimal`
- [x] Defaults documentés
- [x] Pas de `any`
- [ ] Implémentation React + intégration Odoo → Phase 1

## Accessibilité
- [x] `<form>` + `aria-label`
- [x] `<label for>` sur chaque input
- [x] Erreurs : `aria-invalid` + `aria-describedby`
- [x] Toast succès `role="status"`, erreur `role="alert"`
- [x] `aria-busy` durant submit
- [x] Cibles tactiles 44 px
- [x] Date input natif → accessibilité OS

## Edge cases
- [x] Format heures invalide → erreur inline
- [x] Dépassement 16 h → erreur inline
- [x] Date hors plage → bloquée par `min`/`max` HTML + validation JS
- [x] Type non sélectionné → erreur "Choisir un type"
- [x] Échec Odoo → toast erreur + queue locale + bouton "Réessayer"
- [x] Doublon (même date + même intervention) → merge côté Odoo (idempotency Hook 1)

## Conformité Hook 1 (CLARIFICATIONS_FINALES.md)
- [x] Trigger : création TimesheetEntry
- [x] Action : Attendance Odoo auto
- [x] Mapping documenté dans `TimesheetEntryInput`
- [x] Retry logic prévu (UI + parent)
- [x] Idempotency : si même date + intervention, merge

## Réutilisation
Module RH (entry standalone), Module Travaux (entry linked depuis une tâche).

## Status
✅ **Prêt pour Phase 1**
