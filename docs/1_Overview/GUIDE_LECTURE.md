# 📖 Guide de Lecture — NewagriQodo v2 Docs

**Tu es où?** Tu as plein de docs et tu ne sais pas par où commencer!

**Cet article te guide** selon ton rôle et tes besoins.

---

## 🚀 **Je viens d'arriver (Claude Code ou nouveau dev)**

**Temps:** 30 minutes  
**Lis dans cet ordre:**

1. **[`CLAUDE.md`](CLAUDE.md)** (5 min)
   - Overview projet
   - Stack technique
   - Phase actuelle

2. **[`docs/2_Architecture/SPEC.md`](../2_Architecture/SPEC.md)** (15 min)
   - Vue d'ensemble architecture
   - 3 modules (Parcellaire, Travaux, Troupeau)
   - Composants core

3. **[`docs/4_Phases/PHASE_1_PROMPT_CLAUDE_CODE.md`](../4_Phases/PHASE_1_PROMPT_CLAUDE_CODE.md)** (10 min)
   - Tâche actuelle
   - Ce qu'il faut implémenter

✅ **Après:** Tu peux coder!

---

## 🏗️ **J'implémente une feature spécifique**

### Composants réutilisables
→ Lire: [`docs/3_Features/COMPOSANTS_REUSABLES.md`](../3_Features/COMPOSANTS_REUSABLES.md)
- Props TypeScript
- Wireframes
- Validation checklist

### Module RH (timesheet, congés, heures)
→ Lire: [`docs/3_Features/MODULE_RH.md`](../3_Features/MODULE_RH.md)
- Specs complètes
- Odoo sync patterns
- Data models

### Module Parcellaire
→ Lire: [`docs/2_Architecture/SPEC.md`](../2_Architecture/SPEC.md) Section "MODULE PARCELLAIRE"
- Features
- Intégration Odoo
- Calculs agronomiques

### Navigation & Menu
→ Lire: [`docs/3_Features/NAVIGATION_STRUCTURE.md`](../3_Features/NAVIGATION_STRUCTURE.md)
- Hamburger mobile
- Sidebar desktop
- Permissions

### Scalabilité & Performance
→ Lire: [`docs/2_Architecture/cloud.md`](../2_Architecture/cloud.md)
- Multi-tenancy
- Caching
- Pagination
- Webhooks pattern

### Schéma DB
→ Lire: [`docs/2_Architecture/PRISMA.md`](../2_Architecture/PRISMA.md)
- Tous les models
- Relations
- Indices

---

## 📋 **Je dois travailler sur une Phase**

### Phase 0 (Composants)
✅ **COMPLÉTÉE**

Lire:
- [`docs/4_Phases/PHASE_0_PROMPT_CLAUDE_CODE.md`](../4_Phases/PHASE_0_PROMPT_CLAUDE_CODE.md) (original)
- [`docs/4_Phases/PHASE_0_CLARIFICATIONS_ACCEPTEES.md`](../4_Phases/PHASE_0_CLARIFICATIONS_ACCEPTEES.md) (décisions)
- [`docs/4_Phases/HANDOFF.md`](../4_Phases/HANDOFF.md) (ce qui a été livré)

### Phase 1 (Features majeures)
🚀 **EN COURS**

Lire:
- [`docs/4_Phases/PHASE_1_PROMPT_CLAUDE_CODE.md`](../4_Phases/PHASE_1_PROMPT_CLAUDE_CODE.md) ⭐ (prompt complet)
- [`docs/4_Phases/PHASE_1_CLARIFICATIONS_ACCEPTEES.md`](../4_Phases/PHASE_1_CLARIFICATIONS_ACCEPTEES.md) (décisions finales)

---

## ⚙️ **Je dois configurer Claude Code**

→ Lire: [`docs/5_Setup/CLAUDE_CODE_VSCODE_SETUP.md`](../5_Setup/CLAUDE_CODE_VSCODE_SETUP.md)
- Extension installation
- API key setup
- Project initialization
- Quick start

→ Lire: [`docs/5_Setup/CLAUDE_CODE_HOOKS_CLARIFICATION.md`](../5_Setup/CLAUDE_CODE_HOOKS_CLARIFICATION.md)
- Hooks explication
- onFilesChanged vs onTaskCompleted
- Config exemple

---

## 🎨 **J'ai besoin des wireframes**

→ Ouvrir: [`docs/8_Wireframes/`](../8_Wireframes/)
- Prototypes HTML interactifs
- Navigation mockups
- Design references

---

## 👥 **Je travaille sur Odoo sync**

→ Lire: [`docs/2_Architecture/SPEC.md`](../2_Architecture/SPEC.md) Section "INTÉGRATION ODOO"
- API patterns
- Webhook patterns
- Bidirectional sync
- Retry logic

→ Puis: [`docs/3_Features/MODULE_RH.md`](../3_Features/MODULE_RH.md) pour exemple RH Congés

---

## 🌾 **J'ai besoin de validation agronomique**

→ Lire: [`docs/6_Agents/AGENTS.md`](../6_Agents/AGENTS.md)
- Agent Agronome
- Normes suisses
- Validation rules

---

## 📞 **Je dois poser une question**

1. **Cherche le sujet dans ce guide** ↑
2. **Lire le fichier suggéré**
3. **Si toujours pas clair:** Pose la question directement!

---

## 🗂️ **Structure complète**

```
docs/
├── 1_Overview/        ← Context project
├── 2_Architecture/    ← Stack, DB, scalability
├── 3_Features/        ← Specs modules & components
├── 4_Phases/          ← Prompts & clarifications
├── 5_Setup/           ← Installation, config
├── 6_Agents/          ← Agents spécialisés
├── 7_References/      ← Bonus, archives
└── 8_Wireframes/      ← HTML prototypes
```

→ Chaque dossier a son **INDEX.md** pour navigation rapide.

---

## ✅ Checklists rapides

### Avant de commencer Phase 1
- [ ] Lire [`CLAUDE.md`](CLAUDE.md)
- [ ] Lire [`SPEC.md`](../2_Architecture/SPEC.md)
- [ ] Lire [`PHASE_1_PROMPT_CLAUDE_CODE.md`](../4_Phases/PHASE_1_PROMPT_CLAUDE_CODE.md)
- [ ] Lire [`PHASE_1_CLARIFICATIONS_ACCEPTEES.md`](../4_Phases/PHASE_1_CLARIFICATIONS_ACCEPTEES.md)

### Avant d'implémenter une feature
- [ ] Consulter SPEC ou MODULE spécifique
- [ ] Lire props/types dans COMPOSANTS_REUSABLES ou MODULE
- [ ] Vérifier Odoo sync patterns dans SPEC
- [ ] Check PRISMA pour data models

### Avant de pusher code
- [ ] Tests passent (pytest/vitest)
- [ ] TypeScript strict mode (no errors)
- [ ] ESLint + Prettier (clean)
- [ ] WCAG AA (accessible)
- [ ] Mobile responsive

---

**Version:** 1.0  
**Dernière mise à jour:** 2026-05-15  
**Prochaine:** Après Phase 1
