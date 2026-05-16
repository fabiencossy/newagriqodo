# PHASE 0 — PROMPT POUR CLAUDE CODE

**Date:** 2026-05-15  
**Project:** NewagriQodo v2  
**Phase:** 0 (Semaines 1-3)  
**Focus:** Valider + esquisser 8 composants réutilisables  
**Owner:** Claude Code  
**Validation:** Fabien Cossy

---

## 🎯 OBJECTIF

Valider et esquisser l'architecture de **8 composants réutilisables** qui seront utilisés dans tous les modules NewagriQodo.

**Délai:** 1 semaine  
**Sortie:** Wireframes + Props TypeScript + Checklist validation pour chaque composant

---

## 📋 LES 8 COMPOSANTS

1. **SearchBar** — Filtrage dynamique toutes les listes
2. **ViewSwitcher** — Toggle table/carte/dashboard
3. **MapView** — Parcelles sur carte (Maplibre GL)
4. **ExportButton** — PDF/CSV/Excel export
5. **TimesheetEntry** — Form ultra-simple HH:MM
6. **HoursTableMonth** — Tableau bilan heures par mois
7. **LeaveRequestList** — Liste congés read-only
8. **AsideCard** — Detail panel sur sélection

---

## 📚 DOCUMENTS DE RÉFÉRENCE

**À LIRE OBLIGATOIREMENT:**
1. `COMPOSANTS_REUSABLES.md` — Specs détaillées (8 composants)
2. `CLARIFICATIONS_FINALES.md` — Contexte métier + corrections
3. `NAVIGATION_STRUCTURE.md` — Menu + hiérarchie
4. `MODULE_RH.md` — HR module specifics
5. `.claudecode.json` — Code standards + hooks

**Supplementaires:**
- `SPEC.md` — Vue d'ensemble
- `WIREFRAMES_NAVIGATION.html` — Prototypes interactifs
- `INFRASTRUCTURE_ASSESSMENT.md` — VPS + architecture

---

## ✅ PHASE 0 — TÂCHES DÉTAILLÉES

### Pour chaque composant (8x) :

#### A) Wireframes interactifs
```
✓ Desktop layout (MD+ breakpoint)
✓ Mobile layout (XS-SM breakpoint)
✓ Interactions (hover, active, disabled states)
✓ Responsive behavior
✓ Accessibilité (WCAG AA)

OUTPUT: HTML file (COMPOSANT_NAME.html)
```

#### B) TypeScript Props définies
```
✓ Interface complète
✓ Types stricts (no `any`)
✓ JSDoc comments
✓ Default values documentés

OUTPUT: COMPOSANT_NAME.types.ts
```

#### C) Validation checklist
```
✓ Design validated
✓ Props interface clear
✓ Edge cases identified
✓ Accessibility verified
✓ Mobile/Desktop both work
✓ No unanswered questions

OUTPUT: COMPOSANT_NAME_CHECKLIST.md
```

### Ordre recommandé (dépendances):
1. **SearchBar** — Utilisé par toutes les listes
2. **ViewSwitcher** — Utilisé avec tous les conteneurs
3. **ExportButton** — Utilisé avec SearchBar + listes
4. **MapView** — Parcellaire core, indépendant
5. **AsideCard** — Utilisé avec MapView + listes
6. **TimesheetEntry** — RH module
7. **HoursTableMonth** — RH module (dépend de data)
8. **LeaveRequestList** — RH module (read-only)

---

## 🔍 QUESTIONS À POSER (Si ambigu)

**Avant d'implémenter, clarifier avec Fabien si:**

### SearchBar
- Quels filtres par défaut pour Parcellaire vs Travaux vs Troupeau?
- Filter pills (show active filters) ou juste input?

### ViewSwitcher
- Icon size? (16px, 20px, 24px)
- Tooltip delay? (300ms, 500ms)

### MapView
- Maplibre GL tiles source? (self-hosted URL?)
- Zoom level min/max?
- Allow drawing new parcels ou just select?

### ExportButton
- PDF styling: use Fabien's logo/colors?
- Excel: raw data ou with calculated formulas?

### TimesheetEntry
- Max hours per day? (12h, 16h, no limit?)
- Allow past dates? (y/n and how far back?)

### HoursTableMonth
- Show YTD total row? (y/n)
- Sortable columns? (y/n)

### LeaveRequestList
- Show approval notes to employee? (y/n)
- Show manager comments? (y/n)

### AsideCard
- Animation duration? (200ms, 300ms, 500ms)
- Custom styling per module ou consistent?

---

## 🏗️ CODE STANDARDS

### TypeScript
```typescript
// Strict mode required
"noImplicitAny": true
"strictNullChecks": true
"strictFunctionTypes": true

// Naming convention
Components: PascalCase (SearchBar.tsx)
Props interfaces: ComponentNameProps
Internal functions: camelCase
Constants: UPPER_SNAKE_CASE
```

### React
```
- Functional components only (hooks)
- Props interfaces on every component
- JSDoc comments
- No prop drilling (context if needed)
- Mobile-first (xs/sm first, then md+)
```

### Accessibility
```
- WCAG AA minimum
- ARIA labels where needed
- Keyboard navigation working
- Form labels + error messages
- Color contrast >= 4.5:1
```

### File Structure
```
src/components/
├── SearchBar/
│   ├── SearchBar.tsx
│   ├── SearchBar.types.ts
│   ├── SearchBar.module.css (or Tailwind)
│   └── SearchBar.stories.tsx (Storybook)
├── ViewSwitcher/
│   ├── ...
├── MapView/
│   ├── ...
...
```

---

## 📊 DELIVERABLES

### Per Component:
- [ ] `ComponentName.tsx` — React component
- [ ] `ComponentName.types.ts` — TypeScript interfaces
- [ ] `ComponentName.html` — Interactive wireframe
- [ ] `ComponentName_CHECKLIST.md` — Validation checklist
- [ ] `ComponentName.test.tsx` — Basic tests

### Per Phase:
- [ ] 8 componentes validated + sketched
- [ ] All TypeScript types defined
- [ ] All wireframes interactive
- [ ] All checklists completed
- [ ] Questions clarified (if any)

### Output Directory:
```
/Phase0_Components/
├── SearchBar/
├── ViewSwitcher/
├── MapView/
├── ExportButton/
├── TimesheetEntry/
├── HoursTableMonth/
├── LeaveRequestList/
├── AsideCard/
└── PHASE_0_SUMMARY.md (récapitulatif final)
```

---

## 🔗 CLAUDE CODE HOOKS

Configuration dans `.claudecode.json`:

```json
{
  "hooks": {
    "onFilesChanged": "prettier --fix && npm run lint --fix",
    "onTaskCompleted": "npm run test && npm run type-check"
  }
}
```

**Chaque commit:**
1. Code auto-formaté (Prettier)
2. Auto-linted (ESLint)
3. Tests run
4. TypeScript validated

---

## ⚠️ RÈGLES STRICTES

❌ **NE PAS:**
- Implémenter logique métier (juste layout + types)
- Utiliser des données réelles (mock data pour wireframes)
- Assumer les APIs (demander si besoin)
- Ignorer accessibility
- Push directement à main (feature branches)

✅ **À FAIRE:**
- Demander si ambigu
- Documenter chaque component
- Tester responsive (mobile + desktop)
- Vérifier WCAG AA
- Créer wireframes interactifs

---

## 📞 COMMUNICATION

**Status updates:**
- Après chaque composant: "✓ SearchBar validated"
- Questions: "Fabien, pour SearchBar..."
- Blockers: Escalate à Fabien immédiatement

**Daily standup (optionnel):**
- Composants complétés
- Blockers rencontrés
- Plan du jour

---

## 🚀 DÉMARRAGE

### Day 1:
1. Read all reference docs
2. Setup local environment
3. Create directory structure
4. Start SearchBar (first component)

### Days 2-5:
Continue components in order (1-8)

### Day 6-7:
Cleanup, validation, final checklist

---

## ✨ SUCCESS CRITERIA

✅ All 8 components have:
- Interactive wireframe (HTML)
- Complete TypeScript types
- Validation checklist ✓
- Tests skeleton
- No unanswered questions

✅ Code Standards:
- TypeScript strict mode
- ESLint + Prettier compliant
- WCAG AA accessible
- Tests pass

✅ Ready for Phase 1:
- "Composants are ready to code" ← Fabien approves
- All questions clarified
- All checklists ✓

---

## 📝 NOTES FINALES

**Fabien a dit:**
- "Focus on reusable components validation"
- "If ambiguous → ask questions"
- "Mobile-first design"
- "Simple is better than complex"
- "Go!"

**C'est la première phase visible.** Les composants validés ici seront utilisés dans tous les modules. Quality here = speed later.

---

**Status:** 🚀 READY TO START  
**Owner:** Claude Code  
**Estimated Duration:** 1 week  
**Next Milestone:** Phase 0 complete → Phase 1 implementation starts

---

Let's build this! 🌾

