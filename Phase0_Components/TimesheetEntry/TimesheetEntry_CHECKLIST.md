# TimesheetEntry — Validation Checklist (v3 — toujours présence)

**Composant** : 6/9
**Statut** : ✅ Simplification (mode "Total" retiré)

## Modèle de saisie

**Toujours** : Date · Heure de début · Heure de fin · Pauses (0 à N) · Type · Intervention (optionnel).
Le total effectif est calculé en direct : `plage − pauses = total`.

Pas de mode "Total décimal" — toute saisie est lié à une plage horaire concrète.
Cela colle directement à la sémantique Odoo `hr.attendance` (`check_in` / `check_out`).

## Décisions prises (v3)

| Question | Réponse |
|---|---|
| Mode "Total" | **Supprimé**. Le composant n'accepte plus de saisie HH:MM globale. |
| Heures par défaut | Début `08:00`, fin `17:00`. Configurables via props. |
| Raccourcis horaires | Boutons "07:00", "07:30", "08:00" (début) et "12:00", "17:00", "18:00" (fin), + "Maintenant". Configurables. |
| Pauses | 0 à N. Validation : min 5 min, max 8 h, pas de chevauchement, contenues dans la plage. |
| Plage de nuit | Opt-in (`allowOvernight`). |
| Max 16 h/jour | Inchangé. Validation côté form + côté Odoo. |
| Dates passées ≤ 90 j, futures bloquées | Inchangé. |

## Design & UX
- [x] Wireframe : initial avec 2 pauses, état vide, mode linked, fin avant début, pauses chevauchent, succès
- [x] Calcul auto dans une `calc-box` (Plage − Pauses = Effectif)
- [x] **Raccourcis horaires** (preset buttons) sous les champs début/fin
- [x] Pauses : repeater avec bouton "+ Ajouter"
- [x] Validation inline (fin avant début, chevauchement)
- [x] Mobile-first

## Code
- [x] `EntryMode` retiré
- [x] `TimesheetEntryInput` : `startTime` et `endTime` obligatoires, `breaks: BreakPeriod[]`
- [x] Helpers exportés inchangés :
  - `formatHoursDecimal`
  - `timeStringToMinutes`, `durationMinutes`
  - `validateBreak`, `findOverlappingBreaks`
  - `computePresenceHours`
- [x] **Nouveau** : `isBreakWithinRange()` pour valider qu'une pause est dans la plage
- [x] `parseHoursInput` / `EntryMode` / `defaultMode` / `lockedMode` / `defaultHours` / `defaultPresence` retirés
- [x] **Nouveau** : `defaultStartTime`, `defaultEndTime`, `defaultBreaks`, `startTimePresets`, `endTimePresets`
- [x] Pas de `any`
- [ ] Implémentation React + Odoo Hook 1 → Phase 1

## Accessibilité
- [x] Pauses : `role="group"` + label dédié
- [x] Calcul auto : `aria-live="polite"`
- [x] Erreurs : `aria-invalid` + `role="alert"`
- [x] Boutons add/remove : `aria-label`
- [x] Raccourcis horaires : groupe avec `aria-label`
- [x] Cibles tactiles 44 px (inputs principaux), 38 px (inputs pauses), 26 px (preset buttons)
- [x] Inputs `<input type="time">` natifs → accessibilité OS

## Edge cases
- [x] Fin avant début
- [x] Plage de nuit (opt-in)
- [x] Pauses qui chevauchent → détection + alerte
- [x] Pauses hors plage de présence → détection via `isBreakWithinRange`
- [x] Pause < 5 min ou > 8 h → rejet
- [x] Total effectif négatif (pauses > plage) → clampé à 0 + warning
- [x] Présence sans pause → autorisée (effectif = plage)

## Conformité Hook 1 (Odoo) — décision Fabien 2026-05-15

**Les pauses ne sont PAS stockées dans Odoo.** Elles servent uniquement à calculer
le total effectif côté Qodo. Odoo reçoit seulement les bornes finales.

- [x] Trigger : création TimesheetEntry
- [x] Action côté Qodo : persister la présence complète (startTime, endTime, pauses[], hoursWorked, projectType, interventionId)
- [x] Action côté Odoo : créer **1 seule `hr.attendance`** avec :
  - `check_in` = `startTime`
  - `check_out` = `endTime`
  - **Pas de pauses dans Odoo** (elles vivent uniquement dans Qodo)
- [x] Si une intervention est liée → créer aussi 1 `account.analytic.line` (timesheet) avec `unit_amount = hoursWorked` (effectif, pauses déduites)
- [x] Mapping employé : le user Qodo doit être lié à un `hr.employee` Odoo. À résoudre côté backend (table de mapping ou champ Odoo custom).
- [x] Idempotency : même date + même employé → erreur 409, l'utilisateur édite la présence existante

### Conséquence côté UI
- L'utilisateur saisit ses pauses → Qodo calcule le total
- Côté Odoo, on ne verra qu'une présence continue (`check_in` 07:30 → `check_out` 17:30)
- Le total dans `account.analytic.line` reflète les pauses déduites (8h45 plutôt que 10h)
- C'est cohérent avec le `HoursTableMonth` qui affiche les **heures effectives**

## Réutilisation
- Module RH (entry standalone)
- Module Travaux (entry "linked" depuis une tâche)
- Future pointeuse mobile (mêmes données)

## Status
✅ **Prêt pour Phase 1**
