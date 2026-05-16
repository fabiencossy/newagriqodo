# PLAN DE RÉORGANISATION DOCS

**Date:** 2026-05-15  
**Objectif:** Créer structure /docs propre sans perdre d'info

---

## PLAN DE FUSION (Inteligent, pas de suppression)

### DOUBLONS À FUSIONNER:

| Fichier 1 | Fichier 2 | Action |
|-----------|-----------|--------|
| SPEC.md | AgriQodo_SPEC_COMPLETE.md | **Fusionner** → SPEC.md devient source de vérité + section bonus si contenu unique |
| PHASE_0_PROMPT_CLAUDE_CODE.md | AgriQodo_PROMPT_CLAUDE_CODE.md | **Garder** PHASE_0_PROMPT (plus récent), AgriQodo_ comme alias/redirect |
| ROADMAP.md | AgriQodo_03_Roadmap.html | **Garder** les deux (formats différents) dans /7_References |
| Prompt_ClaudeCode_RefonteUX_2026-05-04.md | (ancien) | **Déplacer** dans /7_References/ARCHIVES |

### FICHIERS SANS DOUBLON:
- Tous les autres restent, juste réorganisés par dossier

---

## NOUVELLE STRUCTURE

```
docs/
├── 1_Overview/
│   ├── INDEX.md (navigation)
│   ├── CLAUDE.md (contexte projet)
│   ├── ROADMAP.md (timeline)
│   └── README_FIRST.md (guide lecture)
│
├── 2_Architecture/
│   ├── INDEX.md
│   ├── SPEC.md (source de vérité: modules, features, stack)
│   ├── cloud.md (scalabilité, patterns)
│   ├── PRISMA.md (schéma DB complet)
│   ├── INFRASTRUCTURE_ASSESSMENT.md
│   └── .claudecode.json (hooks config)
│
├── 3_Features/
│   ├── INDEX.md
│   ├── MODULE_RH.md
│   ├── NAVIGATION_STRUCTURE.md
│   ├── COMPOSANTS_REUSABLES.md
│   ├── CLARIFICATIONS_FINALES.md
│   ├── ONBOARDING_AND_ROLES.md
│   └── M11_Travaux_Tiers_Automatisation_Odoo.md
│
├── 4_Phases/
│   ├── INDEX.md
│   ├── PHASE_0_PROMPT_CLAUDE_CODE.md
│   ├── PHASE_0_CLARIFICATIONS_ACCEPTEES.md
│   ├── PHASE_1_PROMPT_CLAUDE_CODE.md
│   ├── PHASE_1_CLARIFICATIONS_ACCEPTEES.md
│   └── PHASE_2_ROADMAP.md (futur)
│
├── 5_Setup/
│   ├── INDEX.md
│   ├── CLAUDE_CODE_VSCODE_SETUP.md
│   ├── CLAUDE_CODE_HOOKS_CLARIFICATION.md
│   └── GETTING_STARTED.md
│
├── 6_Agents/
│   ├── INDEX.md
│   ├── AGENTS.md
│   └── AGENT_AGRONOME.md (détails normes suisses)
│
├── 7_References/
│   ├── INDEX.md
│   ├── AgriQodo_PRD_Fusion_Interventions.md
│   ├── HANDOFF.md (Phase 0 delivery)
│   ├── cloud.md → /2_Architecture (moved)
│   └── ARCHIVES/
│       ├── Prompt_ClaudeCode_RefonteUX_2026-05-04.md
│       └── AgriQodo_SPEC_COMPLETE.md (notes si contenu unique)
│
└── 8_Wireframes/
    ├── INDEX.md
    ├── WIREFRAMES_NAVIGATION.html
    ├── WIREFRAMES.html
    ├── AgriQodo_03_Roadmap.html
    └── NOTES.md (descriptions des wireframes)
```

---

## FICHIERS À LA RACINE (Essentiels)

```
/
├── .claudecode.json
├── CLAUDE.md
├── README.md (nouveau: entry point)
└── HANDOFF.md (important: Phase 0 delivery)
```

---

## ÉTAPES EXÉCUTION:

1. ✅ Créer structure `/docs` + INDEX files
2. ✅ Créer README.md racine (entry point)
3. ✅ Copier fichiers aux bons endroits
4. ✅ Fusionner SPEC.md + AgriQodo_SPEC_COMPLETE.md
5. ✅ Créer fichiers INDEX pour chaque dossier (navigation)
6. ✅ Archiver anciens fichiers (ARCHIVES/)
7. ✅ Vérifier tous les liens internes
8. ✅ Documenter dans CLAUDE.md où trouver quoi

---

**Status:** Prêt pour exécution
