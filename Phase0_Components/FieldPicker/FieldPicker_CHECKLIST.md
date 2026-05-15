# FieldPicker — Validation Checklist (v3 — popup desktop + mobile fullscreen)

**Composant** : 9/9
**Statut** : ✅ Refonte selon feedback (pas de plein écran sur desktop)

## Layouts par taille d'écran

| Écran | Layout | Comportement |
|---|---|---|
| ≥ 600 px (desktop / tablette) | **Popup attaché** | Dropdown sous le trigger, max-height ~280 px, catégories en onglets horizontaux. |
| < 600 px (mobile) | **Plein écran** | Modal fullscreen avec barre titre + retour + bouton OK, catégories scrollables, items 44 px. |

Le `layout` est `'auto'` par défaut, peut être forcé via `layout: 'popup' \| 'fullscreen'`.

## Différences desktop vs mobile

| Élément | Desktop (popup) | Mobile (fullscreen) |
|---|---|---|
| Header | _Aucun_ (l'input est en haut) | Barre titre + retour + OK |
| Search | Petit input compact 34 px | Input 40 px style iOS/Android |
| Catégories | Onglets compacts horizontaux 28 px | Chips pill scrollables 32 px (style segment iOS) |
| Liste | Hauteur max 280 px, scroll interne | Pleine hauteur disponible |
| Items | 40 px, padding 8 px | 44 px, padding 12 px |
| Checkbox | 16 px | 22 px |
| Footer | Compteur + Créer + Valider | Compteur + Créer (Valider remplacé par OK dans header) |
| Validation | Bouton "Valider" explicite | Bouton "OK (N)" dans le header en haut à droite |

## Cas couverts (wireframes)

**Desktop :**
- Multi-select avec 2 items sélectionnés + recherche en cours
- Single-select (style autocomplete) avec un produit sélectionné
- État vide avec création inline

**Mobile :**
- Multi-select fullscreen
- Single-select fullscreen
- État vide + création inline

## Décisions prises (v3)

| Question | Réponse |
|---|---|
| Desktop : plein écran ? | **Non** — popup attaché au trigger (~480 px de large par défaut, suit la largeur du trigger). |
| Position du popup | Sous le trigger. Si pas la place en bas, flip au-dessus (Phase 1). |
| Catégories desktop | **Onglets horizontaux** (`pop-cats`), pas de panneau latéral. Plus compact. |
| Catégories mobile | **Chips scrollables** style segment iOS (pill 32 px, ronds). |
| Bouton Valider mobile | Remplacé par "OK (N)" en **haut à droite** du header (pattern iOS/Android). |
| Bouton retour mobile | Flèche gauche en haut à gauche (pattern iOS/Android). |
| Création inline | Identique desktop/mobile : bouton "+ Créer" footer + dans empty state. |

## Design & UX
- [x] Wireframe desktop : multi, single, empty
- [x] Wireframe mobile : multi, single, empty
- [x] Popup desktop attaché au trigger (pas plein écran)
- [x] Mobile : header sticky + footer sticky + liste scrollable
- [x] Cibles tactiles 44 px (mobile), 40 px (desktop)
- [x] Pas d'emoji — SVG inline uniquement

## Code
- [x] Nouveau prop `layout: 'auto' | 'popup' | 'fullscreen'`
- [x] Nouveau prop `popupMaxHeight` (CSS valeur)
- [x] `FIELD_PICKER_DEFAULTS.fullscreenBreakpointPx = 600`
- [x] Reste inchangé (`PickerMode`, `PickerCategory`, `PickerItem<T>`, helpers)
- [ ] Implémentation React → Phase 1 (positionnement avec `floating-ui` ou `@radix-ui/popper`)

## Accessibilité
- [x] Desktop popup : `role="listbox"` (ou `role="dialog"` si recherche présente), Esc + clic extérieur ferment
- [x] Mobile fullscreen : `role="dialog"` + `aria-modal="true"` + focus trap
- [x] Trigger : `aria-haspopup="dialog"` + `aria-expanded`
- [x] Catégories : `aria-pressed` sur l'actif
- [x] Items : `role="option"` + `aria-selected`, `aria-multiselectable` selon mode
- [x] Compteur sélection : `aria-live="polite"`
- [x] Bouton OK mobile : `disabled` si aucune sélection (single)

## Edge cases
- [x] Popup desktop : si pas la place en bas → flip top
- [x] Popup desktop : si trigger très étroit (chip-only) → min-width 360 px
- [x] Mobile : si beaucoup de catégories → scroll horizontal
- [x] Création échoue → reste sur le picker + toast
- [x] Long titre item → truncate + tooltip (Phase 1)
- [x] `maxSelection` atteint → items non sélectionnés grisés

## Réutilisation
Champs `many2one` / `many2many` Odoo lourds dans tous les modules.

## Status
✅ **Prêt pour Phase 1**
