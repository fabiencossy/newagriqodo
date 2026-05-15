# AsideCard — Validation Checklist

**Composant** : 5/8
**Statut** : ✅ Esquisse Phase 0 complétée

## Décisions prises

| Question | Réponse |
|---|---|
| Animation duration | **250 ms** (configurable via `animationMs`). Respecte `prefers-reduced-motion`. |
| Styling per module ou consistent | **Consistant** côté chrome (header / body / footer / animation). Le contenu est piloté par `FieldConfig[]` → chaque module définit ses champs. |
| Layout desktop | **Aside à droite, 360 px de large**. |
| Layout mobile | **Bottom sheet** avec handle, swipe-down pour fermer. |
| Edit mode | **Opt-in via `editable: true`**. Bouton ✎ dans le header bascule view ↔ edit. |
| Champs cachés conditionnellement | `hidden?: 'view' \| 'edit'` sur `FieldConfig` (ex: bouton "Archiver" visible seulement en édition). |

## Design & UX
- [x] Wireframe : lecture, édition, loading, mobile bottom sheet
- [x] Header sticky avec titre + actions (édition, fermeture)
- [x] Body scrollable (overflow-y: auto)
- [x] Footer sticky avec actions principales
- [x] Skeleton loader durant chargement
- [x] Mobile : handle + swipe-down + Esc dismiss

## Code
- [x] Type générique `AsideCardProps<T>` (typage data piloté par appelant)
- [x] `FieldConfig` riche (format, validate, hidden)
- [x] Actions footer customisables (`AsideCardAction[]`)
- [x] Defaults documentés
- [x] Pas de `any`
- [ ] Implémentation React → Phase 1

## Accessibilité (WCAG AA)
- [x] Desktop : `role="complementary"` + `aria-label`
- [x] Mobile : `role="dialog"` + `aria-modal="true"` + focus trap (à câbler Phase 1)
- [x] Loading : `aria-busy="true"`
- [x] Boutons d'action avec `aria-label`
- [x] Esc pour fermer (handler à ajouter Phase 1)
- [x] `prefers-reduced-motion` → animation = 0 ms
- [x] Cibles tactiles ≥ 40 px

## Edge cases
- [x] `data` null → afficher état vide ("Sélectionnez un item") ou ne pas rendre
- [x] Long contenu → scroll dans body, header/footer restent visibles
- [x] Validation erreur → message sous le champ (mode édition)
- [x] Save échoue → conserver le mode édition + toast erreur

## Réutilisation
- Module Parcellaire : détails parcelle (avec MapView)
- Module Travaux : détails tâche
- Module Troupeau : détails animal / événement
- Tables listes : preview avant ouverture

## Status
✅ **Prêt pour Phase 1**
