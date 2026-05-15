# FieldPicker — Validation Checklist (nouveau composant)

**Composant** : 9/9 — **AJOUTÉ Phase 0 (révision)**
**Statut** : ✅ Esquisse complétée

## Pattern adopté

Champ-sélecteur qui s'**ouvre en plein écran** (modal desktop / fullscreen mobile) avec :

```
┌──────────────────────────────────────────┐
│ Sélectionner une parcelle           [×]  │
├──────────────────────────────────────────┤
│ 🔍 [Rechercher…]                          │
├──────────────────────────────────────────┤
│  CATÉGORIES        │  RÉSULTATS           │
│  ▸ Toutes (42)     │  ☑ Champ du Haut     │
│  ▸ Actives (28)    │  ☑ Champ du Bas      │
│  ▸ Jachère  (9)    │  ☐ Champ Long        │
│  ─────────         │  ☐ Champ Rond        │
│  Par culture       │  …                   │
│  ▸ Blé   (12)      │                      │
│  ▸ Maïs   (8)      │                      │
│  ▸ Colza  (5)      │                      │
├──────────────────────────────────────────┤
│ 2 sélectionnées · [+ Créer] [Annuler] [✓]│
└──────────────────────────────────────────┘
```

## Modes

| Mode | Comportement |
|---|---|
| `single` | Sélection unique (radio implicite). Pas de checkbox visible, surlignage + check. |
| `multiple` | Sélection multiple (checkbox). Validation explicite via "Valider". |

## Décisions prises

| Question | Réponse |
|---|---|
| Layout | Catégories à gauche (panneau 220 px), résultats à droite. Mobile : empilé verticalement, catégories scrollables horizontalement (Phase 1). |
| Création depuis le picker | Opt-in via `allowCreate`. Bouton "+ Créer" dans le footer + dans l'empty state ("Créer 'xyzzzz'"). |
| Recherche | Debounce 250 ms. Filter local si `items` fourni, async via `fetchItems` sinon. |
| Trigger replié — multi | Chips inline (max 3 visibles, "+N autres" au-delà). |
| Création de nouveaux items | `onCreate(query) → Promise<PickerItem \| null>`. Si retour non null → item ajouté + sélectionné. |
| Limite de sélection | `maxSelection?: number \| null` (défaut illimité). |
| Catégories hiérarchiques | Supportées via `parentId` (Phase 1 : rendu indenté). |
| Categories groupées avec titre | Oui (`PickerCategoryGroup.title`). Permet "Statut" + "Par culture" etc. |

## Cas d'usage prévus

- Sélectionner **une parcelle** (carnet → choix de la parcelle concernée)
- Sélectionner **un produit phyto** (intervention → produit appliqué)
- Sélectionner **plusieurs parcelles** (créer un travail à faire sur lot)
- Sélectionner **un animal** (événement troupeau)
- Sélectionner **plusieurs employés** (assignation tâche multi-personnes)
- Sélectionner **un fournisseur** (avec création possible)

## Design & UX
- [x] Wireframe : trigger replié (3 variants : vide / single / multi),
      picker ouvert multi + single, état empty avec création
- [x] Header sticky + Search sticky
- [x] Catégories scrollables indépendamment
- [x] Footer sticky avec compteur + actions
- [x] Mobile : modal fullscreen, catégories en haut empilées
- [x] Cibles tactiles 40 px (résultats), 36 px (catégories), 44 px (trigger)
- [x] Loading skeleton dans la zone résultats (à câbler Phase 1)

## Code
- [x] `FieldPickerProps<T>` générique (typage data piloté par l'appelant)
- [x] `PickerCategoryGroup` + `PickerCategory` avec hiérarchie
- [x] `PickerItem<T>` avec badge, icon, meta, categoryIds, disabled
- [x] Helpers exportés : `filterItems`, `summarizeSelection`
- [x] Loader async (`fetchItems`) pour large datasets (m2m Odoo)
- [x] `allowCreate` + `onCreate` callback pour création inline
- [x] `maxSelection` pour borner la multi-sélection
- [x] Pas de `any`
- [ ] Implémentation React → Phase 1

## Accessibilité (WCAG AA)
- [x] Trigger : `aria-haspopup="dialog"` + `aria-expanded`
- [x] Modal : `role="dialog"` + `aria-modal="true"` + `aria-label`
- [x] Résultats : `role="listbox"` + `aria-multiselectable`
- [x] Items : `role="option"` + `aria-selected`
- [x] Catégories : `aria-pressed` sur l'actif
- [x] Focus trap dans le modal, focus retour sur trigger à la fermeture
- [x] Esc ferme, Enter sélectionne, ↑/↓ parcourt
- [x] Lecteur d'écran : compteur de sélection annoncé via `aria-live`

## Edge cases
- [x] Dataset vide → empty state + bouton "+ Créer" si `allowCreate`
- [x] Aucun résultat pour la query → empty state ciblé ("Créer 'X'")
- [x] Item disabled → grisé, non cliquable
- [x] `maxSelection` atteint → items non sélectionnés grisés + tooltip
- [x] Large dataset (>500) → utiliser `fetchItems` avec debounce
- [x] Catégorie hiérarchique → indentation (Phase 1)
- [x] Création échoue (`onCreate` retourne null) → toast erreur, picker reste ouvert
- [x] Sélection initiale invalide (id absent) → ignorée silencieusement

## Cohérence avec les autres composants
- Sélecteurs simples inline → reste dans **AsideCard** (`FieldConfig.type: 'select'`)
- Filtrage de liste principal → reste dans **SearchBar** (style Odoo)
- **FieldPicker** est pour les sélections "lourdes" : produit dans un catalogue large, parcelle hors contexte map, etc.

## Réutilisation
Tous les formulaires d'édition avec relations Odoo (`many2one`, `many2many`) lourdes :
- Carnet : Parcelle, Produit phyto, Engrais, Variété
- Travaux : Parcelle(s), Employé(s), Matériel
- Troupeau : Animal, Bâtiment, Lot
- RH : Type de congé, Approbateur (admin)

## Status
✅ **Prêt pour Phase 1**
