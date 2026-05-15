# SearchBar — Validation Checklist (v2 — pattern Odoo)

**Composant** : 1/9
**Statut** : ✅ Refonte complète (style Odoo SearchPanel)

## Pattern adopté

Inspiré du `SearchPanel` Odoo :

1. **Une barre unique** contient :
   - Icône loupe
   - **Facets** (filtres actifs) en chips bicolores `[champ | valeurs] [×]`
   - Input texte libre
   - 3 boutons d'action à droite : **Filtres** · **Regrouper** · **Favoris**

2. **Saisie texte** → suggestions par champ recherchable :
   ```
   Rechercher « darval » dans :
     • Nom
     • Code
     • Notes
     • Variété
   ```
   La sélection d'une suggestion crée une **facet** (le champ devient un filtre).

3. **Menu Filtres** : liste de filtres rapides + champs avec sous-menus
   (date, select, many2many → checkboxes multi-sélection).

4. **Menu Regrouper** : choix d'un ou plusieurs champs de regroupement
   (avec granularité date : jour / semaine / mois / trimestre / année).

5. **Menu Favoris** : recherches sauvegardées (filtres + group by + tri).
   - Sauvegarder la recherche courante
   - Définir un favori par défaut
   - Partager avec d'autres utilisateurs (optionnel)

## Logique des combinaisons

| Cas | Combinaison |
|---|---|
| Plusieurs valeurs **dans une même facet** (ex: Culture = Blé OU Maïs) | **OR** |
| Plusieurs facets différentes (ex: Culture=Blé ET Statut=Actif) | **AND** |
| Multiple group by | Hiérarchie ordonnée (premier = niveau 1) |

## Décisions prises

| Question | Réponse |
|---|---|
| Pattern | **Odoo SearchPanel** (familier pour les utilisateurs Odoo, robuste). |
| Multi-valeur sur un champ | Oui, via checkboxes dans le sous-menu (combinées en OR). |
| Favoris | Oui, sauvegarde côté backend (côté composant : props `favorites` + callbacks). |
| Suggestions par champ | Oui, basées sur les champs `searchable: true` du `FieldDescriptor`. |
| Filtre date | Sous-menu avec presets (Aujourd'hui, Cette semaine, Ce mois, …) + custom range. À détailler Phase 1. |
| Couleur des facets | Aubergine Odoo `#875a7b` (clin d'œil + contraste avec le primary vert). |
| Mobile | Barre s'étend verticalement, actions empilées en bas (icônes seules). |
| Sync URL | Sérialisable depuis `SearchState`. À implémenter Phase 1 (history.pushState). |

## Design & UX
- [x] Wireframe HTML : barre vide, suggestions, facets actives, dropdown 3 colonnes, multi-sélection, mobile
- [x] Mobile-first (stack vertical < 600 px)
- [x] Cibles tactiles ≥ 32 px icônes, 44 px barre principale
- [x] Contraste vérifié (primary 8.9:1, accent 5.5:1 sur #fff)
- [x] Cohérence visuelle avec ViewSwitcher / AsideCard (border-radius, palette)

## Code
- [x] `SearchState` sérialisable (sauvegarde Favoris + URL params)
- [x] `FieldDescriptor` riche (type, options, searchable, operators)
- [x] `Facet`, `GroupBy`, `SortBy`, `SavedFavorite` typés
- [x] Helpers `FACET_LOGIC` documentés (OR intra, AND inter)
- [x] Loader async (`fetchOptions`) pour many2one / many2many
- [x] Pas de `any`
- [ ] Implémentation React → Phase 1

## Accessibilité (WCAG AA)
- [x] `role="search"` racine
- [x] Suggestions : `role="listbox"` + `role="option"` + `aria-selected`
- [x] Boutons d'action : `aria-expanded`
- [x] Facets : `aria-label` explicite sur les boutons de retrait
- [x] Navigation clavier : ↑/↓ suggestions, Enter valide, Backspace efface dernière facet quand input vide
- [x] Esc ferme les menus
- [x] Tous les boutons icône-seule ont un `aria-label`

## Edge cases
- [x] Aucun champ searchable → l'input fait fallback en plein-texte
- [x] Sous-menu liste très longue (>100 options) → autocomplete + virtualisation Phase 1
- [x] Conflit favoris partagés / perso → priorité au perso
- [x] Suppression du dernier filtre actif via Backspace
- [x] Beaucoup de facets → wrap (flex-wrap)

## Dépendances Phase 1
Aucune externe. Optionnellement `react-virtual` pour listes très longues.

## Réutilisation
Toutes les listes : Parcelles, Carnet, Travaux, Animaux, RH (Congés/Heures).
La forme générique permet à chaque module de fournir son propre `FieldDescriptor[]`.

## Status
✅ **Prêt pour Phase 1**
