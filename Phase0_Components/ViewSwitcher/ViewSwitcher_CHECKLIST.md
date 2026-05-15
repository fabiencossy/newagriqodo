# ViewSwitcher — Validation Checklist

**Composant** : 2/8
**Statut** : ✅ Esquisse Phase 0 complétée

## Décisions prises

| Question | Réponse |
|---|---|
| Taille des icônes | **20 px** (équilibre lisibilité / compacité). |
| Délai tooltip | **400 ms** (configurable via `tooltipDelayMs`). |
| Layout desktop vs mobile | Segmented control ≥ 768 px, dropdown < 768 px. Forçable via `layout`. |
| Désactiver une vue individuellement | Oui, via `disabledViews?: ViewKey[]` (ex: carte indispo si aucune géom). |

## Design & UX
- [x] Wireframe HTML (segmented, hover+tooltip, disabled, dropdown mobile)
- [x] Mobile-first
- [x] Active state visible (background primary, text blanc)
- [x] Cibles tactiles ≥ 44 px (mobile : trigger 44px, items menu 40px+padding)
- [x] Icône + label texte (jamais icône seule → a11y)

## Code
- [x] `ViewKey` union strict ('table' | 'map' | 'dashboard')
- [x] Pas de `any`
- [x] Defaults documentés (`VIEW_SWITCHER_DEFAULTS`)
- [x] Labels FR centralisés dans `VIEW_LABELS`
- [ ] Implémentation React → Phase 1

## Accessibilité (WCAG AA)
- [x] Segmented : `role="tablist"` + `role="tab"` + `aria-pressed`
- [x] Dropdown : `aria-haspopup="listbox"`, options `role="option"` + `aria-selected`
- [x] Tous les boutons ont un label texte visible (pas seulement icône)
- [x] Navigation clavier prévue : ←/→ segmented, ↑/↓ dropdown
- [x] Contraste actif #fff sur #2d5016 = 8.9:1 ✓

## Edge cases
- [x] Vue active disabled → comportement à définir : tomber sur la première vue active (à implémenter Phase 1)
- [x] Une seule vue dans `views` → composant inutile, rendu masqué (TODO Phase 1)
- [x] 4-5 vues → encore lisible avec layout segmented sur grand écran

## Dépendances
Aucune.

## Réutilisation
Utilisé par : ListeParcelles, ListeTravaux, ListeAnimaux, Dashboard RH.

## Status
✅ **Prêt pour Phase 1**
