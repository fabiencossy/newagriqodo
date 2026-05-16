# 🌾 NewagriQodo v2 — Documentation

**Status:** Phase 1 en cours  
**Dernière mise à jour:** 2026-05-15  
**Propriétaire:** Fabien Cossy

---

## 📚 Où chercher?

### 🚀 **Je débute, où je commence?**
→ Lire dans cet ordre:
1. [`CLAUDE.md`](CLAUDE.md) — Contexte projet (5 min)
2. [`docs/1_Overview/README_FIRST.md`](docs/1_Overview/README_FIRST.md) — Guide de lecture (10 min)
3. [`docs/2_Architecture/SPEC.md`](docs/2_Architecture/SPEC.md) — Architecture complète (30 min)

---

### 🏗️ **J'implémente une feature, j'ai besoin de...**

| Besoin | Où aller |
|--------|----------|
| Architecture générale | [`docs/2_Architecture/SPEC.md`](docs/2_Architecture/SPEC.md) |
| Schéma Prisma (DB) | [`docs/2_Architecture/PRISMA.md`](docs/2_Architecture/PRISMA.md) |
| Composants réutilisables | [`docs/3_Features/COMPOSANTS_REUSABLES.md`](docs/3_Features/COMPOSANTS_REUSABLES.md) |
| Module RH (timesheet, congés) | [`docs/3_Features/MODULE_RH.md`](docs/3_Features/MODULE_RH.md) |
| Structure menu/navigation | [`docs/3_Features/NAVIGATION_STRUCTURE.md`](docs/3_Features/NAVIGATION_STRUCTURE.md) |
| Normes suisses (validation métier) | [`docs/6_Agents/AGENTS.md`](docs/6_Agents/AGENTS.md) |
| Setup Claude Code | [`docs/5_Setup/CLAUDE_CODE_VSCODE_SETUP.md`](docs/5_Setup/CLAUDE_CODE_VSCODE_SETUP.md) |

---

### 📋 **Je dois travailler sur Phase X**

| Phase | Documents |
|-------|-----------|
| **Phase 0** (Composants) | [`docs/4_Phases/PHASE_0_PROMPT_CLAUDE_CODE.md`](docs/4_Phases/PHASE_0_PROMPT_CLAUDE_CODE.md) + [`CLARIFICATIONS_ACCEPTEES`](docs/4_Phases/PHASE_0_CLARIFICATIONS_ACCEPTEES.md) |
| **Phase 1** (Features majeures) | [`docs/4_Phases/PHASE_1_PROMPT_CLAUDE_CODE.md`](docs/4_Phases/PHASE_1_PROMPT_CLAUDE_CODE.md) + [`CLARIFICATIONS_ACCEPTEES`](docs/4_Phases/PHASE_1_CLARIFICATIONS_ACCEPTEES.md) |

---

### ⚙️ **Configuration & Setup**

- Claude Code: [`docs/5_Setup/CLAUDE_CODE_VSCODE_SETUP.md`](docs/5_Setup/CLAUDE_CODE_VSCODE_SETUP.md)
- Hooks (`.claudecode.json`): [`docs/5_Setup/CLAUDE_CODE_HOOKS_CLARIFICATION.md`](docs/5_Setup/CLAUDE_CODE_HOOKS_CLARIFICATION.md)
- Getting Started: [`docs/5_Setup/GETTING_STARTED.md`](docs/5_Setup/GETTING_STARTED.md)

---

### 📊 **Références & Archive**

- Agents spécialisés: [`docs/6_Agents/AGENTS.md`](docs/6_Agents/AGENTS.md)
- Roadmap long-term: [`docs/1_Overview/ROADMAP.md`](docs/1_Overview/ROADMAP.md)
- Wireframes HTML: [`docs/8_Wireframes/`](docs/8_Wireframes/)
- Anciens documents: [`docs/7_References/ARCHIVES/`](docs/7_References/ARCHIVES/)

---

## 📁 Structure du projet

```
NewagriQodo/
├── /app                          ← Code source React/Express
├── /assets                       ← Images, fonts, icônes
├── /Phase0_Components            ← Composants validés Phase 0
│
├── /docs                         ← DOCUMENTATION (nouvelle structure)
│   ├── /1_Overview               ← Vue d'ensemble projet
│   ├── /2_Architecture           ← Stack, DB, scalabilité
│   ├── /3_Features               ← Specs modules & composants
│   ├── /4_Phases                 ← Prompts & clarifications par phase
│   ├── /5_Setup                  ← Installation, configuration
│   ├── /6_Agents                 ← Agents spécialisés
│   ├── /7_References             ← Docs bonus, archives
│   └── /8_Wireframes             ← Prototypes HTML
│
├── CLAUDE.md                     ← Contexte pour Claude Code
├── .claudecode.json              ← Config hooks
├── HANDOFF.md                    ← Livraison Phase 0
└── README.md                     ← TU ES ICI
```

---

## 🎯 Pour Claude Code

Tous les fichiers de contexte sont dans `/docs`:
- Lire `CLAUDE.md` au démarrage
- Consulter `docs/2_Architecture/SPEC.md` pour arch
- Utiliser `docs/4_Phases/PHASE_X_PROMPT_CLAUDE_CODE.md` pour les tâches

---

## 📞 Questions?

Consulte le fichier le plus pertinent, ou pose la question directement!

---

**Version:** 1.0  
**Statut:** 🚀 Opérationnel  
**Prochaine mise à jour:** Fin Phase 1
