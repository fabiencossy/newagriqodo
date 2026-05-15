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

## Conformité Hook 1 (Odoo) — sémantique pauses = absence de timbrage

**Une pause = simplement une absence de timbrage entre deux périodes de présence.**
Le concept de "pause" n'existe pas en tant qu'objet métier — il sert uniquement
à l'ergonomie de saisie. Côté Odoo, on crée **N `hr.attendance`** (une par
segment continu entre 2 timbrages).

### Exemple

Saisie utilisateur : 07:30 → 17:30 avec 2 pauses (10:00-10:15 et 12:00-13:00)

Création Odoo :

| # | check_in | check_out | duration |
|---|---|---|---|
| 1 | 07:30 | 10:00 | 2h30 |
| 2 | 10:15 | 12:00 | 1h45 |
| 3 | 13:00 | 17:30 | 4h30 |

Total : 8h45 effectives.

Helper côté composant : `splitPresenceIntoAttendances(start, end, breaks)` → `PresenceSegment[]`.

### Détails Hook 1
- [x] Trigger : création TimesheetEntry
- [x] Action côté Qodo : persister la présence complète (startTime, endTime, pauses[], hoursWorked)
- [x] Action côté Odoo : créer **N `hr.attendance`** (1 par segment)
  - Itère sur `splitPresenceIntoAttendances(...)` → 1 RPC `create` par segment
  - **OU** 1 seul RPC `create_multi` avec la liste des segments (préférable, moins de round-trips)
- [x] Si `interventionId` → créer **1 seul** `account.analytic.line` avec `unit_amount = hoursWorked` (effectif total, sans répartir par segment)
- [x] Mapping employé : `hr.employee` lié au user Qodo (table de mapping backend)
- [x] Idempotency : même date + même employé + même segment → ne pas dupliquer

### Avantages de cette approche
- **Fidèle au modèle Odoo natif** : un timbrage = une attendance. Pas de champ custom à créer.
- **Compatible avec d'autres outils Odoo** : rapports, dashboards, exports natifs marchent direct.
- **Pause modifiable a posteriori** : si l'utilisateur édite une pause, on supprime/recrée les attendances impactées.
- **Pas de notion de "pause" à expliquer aux gestionnaires RH** : ils ne voient que des timbrages, comme s'ils sortaient d'un terminal physique.

## Réutilisation
- Module RH (entry standalone)
- Module Travaux (entry "linked" depuis une tâche)
- Future pointeuse mobile (mêmes données)

## Status
✅ **Prêt pour Phase 1**
