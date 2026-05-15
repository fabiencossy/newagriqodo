# SearchBar — Validation Checklist

**Composant** : 1/8
**Statut** : ✅ Esquisse Phase 0 complétée

## Décisions prises (ambiguïtés du PROMPT)

| Question | Réponse |
|---|---|
| Filter pills (afficher filtres actifs) ? | ✅ Oui, sous la barre, retrait individuel. Paramétrable via `showActivePills` (défaut `true`). |
| Debounce | 300 ms (configurable via `debounceMs`). |
| Filtres par défaut Parcellaire / Travaux / Troupeau | **Pas câblés au composant** — `FilterConfig[]` est passé par le parent. Le composant reste générique. Les presets vivront dans chaque module. |
| Filtres avancés ouvert par défaut ? | Non. `defaultAdvancedOpen: false`. |

## Design & UX
- [x] Wireframe HTML (desktop + mobile + 4 états)
- [x] Mobile-first (stack vertical < 768 px)
- [x] Cibles tactiles ≥ 44 px (input h:44px, boutons min 32px + padding)
- [x] Contraste ≥ 4.5:1 (texte #1a1a1a sur #fff = 18.6:1)
- [x] États couverts : empty / focus / valeur+clear / disabled

## Code
- [x] Interface `SearchBarProps` strictement typée (pas de `any`)
- [x] `FilterConfig` et `FilterValue` exportés et réutilisables
- [x] Valeurs par défaut documentées (`SEARCH_BAR_DEFAULTS`)
- [x] JSDoc sur chaque prop
- [ ] Implémentation React → Phase 1

## Accessibilité (WCAG AA)
- [x] `role="search"` sur le conteneur racine
- [x] `aria-label` sur input + bouton clear
- [x] `aria-expanded` / `aria-controls` sur le toggle "Filtres avancés"
- [x] Chaque pill a un bouton retrait avec `aria-label` spécifique
- [x] Navigation clavier validée dans le wireframe (ordre logique)

## Edge cases
- [x] Vide → placeholder visible, bouton clear caché
- [x] Avec valeur → bouton clear visible
- [x] Disabled → input grisé, pas d'interaction
- [x] Pills débordent → wrap (flex-wrap)
- [x] Aucun filtre actif → pas de zone pills (height 0)

## Edge cases à traiter en Phase 1
- [ ] Liste de filtres > 6 → scroll horizontal ou grid responsive
- [ ] Filtre `daterange` UI (deux date inputs liés)
- [ ] Pill très long (truncate + tooltip)
- [ ] Sync URL params (?q=darval&culture=ble) — décision à prendre Phase 1

## Dépendances
Aucune — composant pur, juste React.

## Réutilisation
Utilisé par : ListeParcelles, ListeTravaux, ListeAnimaux, CarnetEntries, LeaveRequestList.

## Status
✅ **Prêt pour Phase 1**
