# TimesheetEntry — Validation Checklist (v2 — modes Total / Présence)

**Composant** : 6/9
**Statut** : ✅ Refonte avec mode présence

## Modes de saisie

### Mode "Total"
- Volume horaire `HH:MM` ou décimal
- Adapté aux saisies a posteriori, rapides
- Helper `parseHoursInput()` accepte `2:30` ou `2.5`

### Mode "Présence"
- Heure de début + heure de fin
- **Pauses** (0 à N), chacune avec début/fin/catégorie optionnelle
- Calcul auto en live : `plage − pauses = total effectif`
- Adapté à la saisie temps réel ou pointage journalier
- Pauses catégorisables : `meal` / `short` / `technical` / `other`

Les deux modes débouchent sur la **même structure** `TimesheetEntryInput` (mode + hoursWorked décimal + champs optionnels), et créent **1 Attendance Odoo** sur submit (Hook 1).

## Décisions prises

| Question | Réponse |
|---|---|
| Mode par défaut | `'total'` (saisie rapide la plus fréquente). Configurable via `defaultMode`. |
| Verrouillage du mode | Possible via `lockedMode` (ex: bouton pointeuse → toujours présence). |
| Plage de nuit (chevauchant minuit) | Pas par défaut, opt-in via `allowOvernight`. |
| Pause minimum | 5 min (sinon rejeté). Pause maximum 480 min (8h). |
| Pauses qui chevauchent | Détection auto (`findOverlappingBreaks`) + erreur inline. |
| Calcul auto live | `aria-live="polite"` pour annoncer le total au lecteur d'écran. |
| Max 16h/jour | Inchangé. Validation côté form + côté Odoo. |
| Dates passées ≤ 90 j, futures bloquées | Inchangé. |

## Design & UX
- [x] Toggle Total / Présence (segmented compact)
- [x] Calcul auto dans une `calc-box` (Plage − Pauses = Effectif)
- [x] Pauses : repeater avec bouton "+ Ajouter une pause"
- [x] Inputs `<input type="time">` natifs (clavier OS / keypad mobile)
- [x] Validation inline : fin avant début, chevauchement, pause trop courte
- [x] État vide (0 pause) : message explicite
- [x] Mobile-first

## Code
- [x] `EntryMode` strict (`'total' | 'presence'`)
- [x] `BreakPeriod` avec catégorie optionnelle
- [x] Helpers exportés :
  - `parseHoursInput`, `formatHoursDecimal`
  - `timeStringToMinutes`, `durationMinutes`
  - `validateBreak`, `findOverlappingBreaks`
  - `computePresenceHours` (centralise le calcul)
- [x] `TIMESHEET_DEFAULTS` documente toutes les limites
- [x] Pas de `any`
- [ ] Implémentation React + Odoo Hook 1 → Phase 1

## Accessibilité
- [x] Toggle mode : `role="tablist"` + `aria-pressed`
- [x] Pauses : `role="group"` + label dédié
- [x] Calcul auto : `aria-live="polite"`
- [x] Erreurs : `aria-invalid` + `role="alert"`
- [x] Boutons add/remove : `aria-label`
- [x] Cibles tactiles 44 px (inputs principaux), 38 px (pause rows)
- [x] Inputs `<input type="time">` natifs → accessibilité OS

## Edge cases couverts
- [x] Fin avant début
- [x] Plage de nuit (opt-in `allowOvernight`)
- [x] Pauses qui chevauchent → détection + alerte
- [x] Pauses hors plage présence (avant début / après fin) → validation Phase 1
- [x] Total effectif négatif (pauses > plage) → clampé à 0 + warning
- [x] Mode présence sans pause → autorisé (renvoie `effectiveHours = rangeMin/60`)
- [x] Mode présence avec une seule pause de 0 min → rejet (< minBreakMinutes)
- [x] Changement de mode → conserve la date et le type, recalcule heures

## Conformité Hook 1
- [x] Trigger : création TimesheetEntry (les deux modes)
- [x] Action : Attendance Odoo auto avec `check_in` + `check_out` (mode présence) ou bornes calculées (mode total : aujourd'hui 08:00 + X heures)
- [x] Retry si Odoo down → file locale
- [x] Idempotency : même date + même intervention → merge

## Décisions à valider Phase 1
- **Mode total → Odoo Attendance** : quelles bornes `check_in/check_out` synthétiser ? Proposition : 08:00 + durée. À confirmer avec le métier (norme d'entreprise ?).
- **Catégories de pauses** : affecter un compte analytique Odoo distinct par catégorie ? (utile pour le suivi des pauses repas vs techniques).

## Réutilisation
- Module RH (entry standalone, les deux modes disponibles)
- Module Travaux (entry "linked" depuis une tâche — mode total recommandé)
- Future pointeuse mobile (mode `presence` verrouillé)

## Status
✅ **Prêt pour Phase 1**
