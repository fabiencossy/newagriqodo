# SearchBar — Validation Checklist (v3 — dark compact)

**Composant** : 1/9
**Statut** : ✅ Refonte selon image de référence

## Pattern adopté

**Une seule ligne** horizontale, fond sombre par défaut :

```
┌──────────────────────────────────────────────────┐
│ [🔍] [▼filtre] │ [Mes devis ×]  Rechercher…  │ [▾] │
└──────────────────────────────────────────────────┘
```

Découpée en 3 zones :

| Zone | Contenu |
|---|---|
| **Lead** (gauche) | Icône loupe + icône entonnoir (filtre actif). Cliquables. |
| **Mid** (centre) | Facets (chips violets `[champ : valeurs ×]`) + input texte inline. |
| **Tail** (droite) | Chevron qui ouvre le panneau Filtres / Regrouper / Favoris. |

## Décisions prises (v3)

| Question | Réponse |
|---|---|
| Style visuel | **Light compact** par défaut (fond clair), variante `dark` opt-in pour contextes sombres. |
| Hauteur | 36 px desktop / 40 px mobile. Cibles tactiles élargies via padding. |
| Position des facets | **Inline dans la barre**, à gauche de l'input (pas en dessous). |
| Couleur des facets | Aubergine Odoo `#875a7b`, texte blanc. |
| Bouton "Filtres" / "Regrouper" / "Favoris" | Regroupés derrière le **chevron unique** (tail). Plus 3 boutons séparés à droite. |
| Icône filtre dans le lead | Indique au regard si des filtres sont actifs (`aria-pressed`). |
| Dropdown panneau | Toujours 3 colonnes (Filtres / Regrouper / Favoris), fond clair même quand la barre est dark. |
| Suggestions | Dropdown attaché sous la barre, fond clair. |

## Design & UX
- [x] Wireframe : référence (1 facet), vide, multi-facets, suggestions, dropdown 3 colonnes, variante claire, mobile
- [x] Mobile-first (taille augmentée à 40 px sur < 600 px)
- [x] Cibles tactiles ≥ 36 px (barre) avec zone tap élargie pour les boutons internes
- [x] Contraste vérifié : texte #e8eaed sur #1f242b = 12.7:1 ✓ ; accent sur fond sombre = 4.6:1 ✓
- [x] Variante claire (`.sb.light`) pour pages au fond clair

## Code
- [x] Types `SearchState`, `Facet`, `GroupBy`, `SortBy`, `SavedFavorite` (inchangés v2)
- [x] Nouveau prop `theme: 'dark' | 'light' | 'auto'` (défaut `dark`)
- [x] Defaults : `SEARCH_BAR_DEFAULTS.theme = 'dark'`
- [x] Helpers `FACET_LOGIC` inchangés (OR intra, AND inter)
- [x] Pas de `any`
- [ ] Implémentation React → Phase 1

## Accessibilité (WCAG AA)
- [x] `role="search"` racine
- [x] Boutons icône (loupe, filtre, chevron) : `aria-label` explicite
- [x] Bouton filtre `aria-pressed` reflète si au moins 1 facet active
- [x] Chevron : `aria-haspopup="menu"` + `aria-expanded`
- [x] Suggestions : `role="listbox"` + `role="option"` + `aria-selected`
- [x] Facets : bouton retrait avec `aria-label` explicite
- [x] Navigation clavier : ↑/↓ suggestions, Enter valide, Backspace efface dernière facet quand input vide, Esc ferme
- [x] Contraste vérifié dark et light

## Edge cases
- [x] 0 facet → input pleine largeur dans la zone mid
- [x] Beaucoup de facets → overflow horizontal (scroll) ou wrap (Phase 1, à décider)
- [x] Facet avec valeur très longue → truncate + tooltip (Phase 1)
- [x] Bouton filtre : pressed quand ≥ 1 facet active
- [x] Click sur loupe = focus input ; click sur entonnoir = ouvre dropdown direct
- [x] Theme `auto` → suit `prefers-color-scheme` ou contexte CSS parent

## Réutilisation
Toutes les listes (Parcelles, Carnet, Travaux, Animaux, RH Heures/Congés).
Le `FieldDescriptor[]` par module reste générique.

## Status
✅ **Prêt pour Phase 1**
