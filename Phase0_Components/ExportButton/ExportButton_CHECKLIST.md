# ExportButton — Validation Checklist

**Composant** : 3/8
**Statut** : ✅ Esquisse Phase 0 complétée

## Décisions prises

| Question | Réponse |
|---|---|
| PDF styling | En-tête : logo Qodo (placeholder rond vert avec **Q**), titre, sous-titre, filtres appliqués, timestamp. Pied : pagination + total. Police system-ui. Couleur primaire #2d5016. |
| Excel : raw ou formules | **Raw data + en-tête figé**. Pas de formules calculées en Phase 0 (overkill pour les besoins). À reconsidérer pour le Carnet (Hook 3 du spec). |
| CSV : séparateur | `;` (défaut FR — Excel FR ouvre direct). BOM UTF-8 ajouté pour les accents. |
| Filename | `<filenameBase>_<YYYY-MM-DD>.<ext>`. Si filtres : `<base>_<date>_filtered.<ext>`. |
| Dropdown vs bouton | Dropdown si `formats.length > 1`, bouton direct sinon. |

## Design & UX
- [x] Wireframe : multi-format dropdown, format unique, loading, succès toast, aperçu PDF
- [x] Mobile : dropdown menu ouvre vers le bas, full-width si besoin
- [x] Cibles tactiles ≥ 40 px
- [x] Spinner pendant génération (≥ 1 s sur gros datasets)
- [x] Toast confirmation après download (role="status")

## Code
- [x] `ExportFormat` strict union
- [x] `ExportColumn` avec formateur optionnel
- [x] `ExportPdfMeta` séparé (cohérent avec Hook 3 du spec)
- [x] Callbacks `onBeforeExport`, `onExported`, `onError`
- [x] BOM UTF-8 + séparateur `;` documentés dans `EXPORT_DEFAULTS`
- [ ] Implémentation → Phase 1 (libs : pdfkit/jspdf, papaparse, exceljs)

## Accessibilité
- [x] `aria-haspopup="menu"` + `aria-expanded`
- [x] Menu items `role="menuitem"`
- [x] `aria-busy` durant loading
- [x] Toast succès `role="status"` (annoncé)
- [x] Contraste ✓

## Edge cases
- [x] `data` vide → bouton désactivé + aria-disabled
- [x] Échec génération → `onError` + toast erreur (à implémenter Phase 1)
- [x] Dataset très large (>10k lignes) → chunking en Phase 1
- [x] Annulation utilisateur (`onBeforeExport` retourne false)

## Conformité Hook 3 (CLARIFICATIONS_FINALES.md)
- [x] PDF + CSV supportés pour toutes les listes
- [x] Excel supporté (clé pour Carnet des champs)
- [x] Métadonnées (filtres + timestamp) intégrées au PDF
- [x] Toutes les colonnes visibles exportées (sauf override via `columns`)

## Dépendances Phase 1
- `jspdf` ou `pdfkit` pour PDF
- `papaparse` pour CSV
- `exceljs` pour XLSX

## Réutilisation
Toutes les listes/tables : Parcelles, Carnet, Travaux, Animaux, Heures, Congés.

## Status
✅ **Prêt pour Phase 1**
