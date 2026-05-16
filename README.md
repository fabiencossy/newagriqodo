# NewagriQodo v2

Refonte UX du module **Agri Qodo** de **Qodo Digital** — apps pour exploitations agricoles suisses (Domaine Darval, Échallens).

## Démarrage rapide

```bash
cd app
npm install
npm run dev         # http://localhost:5173
npm test            # Vitest
npm run typecheck   # tsc strict
npm run lint        # ESLint
```

## Où chercher quoi

| Sujet | Lien |
|-------|------|
| Contexte projet pour Claude Code | [`CLAUDE.md`](CLAUDE.md) |
| Guide de lecture par rôle | [`docs/1_Overview/GUIDE_LECTURE.md`](docs/1_Overview/GUIDE_LECTURE.md) |
| Roadmap | [`docs/1_Overview/ROADMAP.md`](docs/1_Overview/ROADMAP.md) |
| Spec fonctionnelle | [`docs/2_Architecture/SPEC.md`](docs/2_Architecture/SPEC.md) |
| Schéma Prisma | [`docs/2_Architecture/PRISMA.md`](docs/2_Architecture/PRISMA.md) |
| Module RH | [`docs/3_Features/MODULE_RH.md`](docs/3_Features/MODULE_RH.md) |
| Composants réutilisables | [`docs/3_Features/COMPOSANTS_REUSABLES.md`](docs/3_Features/COMPOSANTS_REUSABLES.md) |
| Rapport de passation (session 1) | [`docs/4_Phases/HANDOFF.md`](docs/4_Phases/HANDOFF.md) |
| Agents Claude | [`docs/6_Agents/AGENTS.md`](docs/6_Agents/AGENTS.md) |
| Wireframes HTML | [`docs/8_Wireframes/`](docs/8_Wireframes/) |

## Structure

```
NewagriQodo/
├── .claude/             ← settings.json + agents/ personnalisés
├── app/                 ← Source React/TS (Vite + Tailwind v4 + Leaflet)
├── assets/              ← Logos, branding
├── docs/                ← Documentation versionnée
│   ├── 1_Overview/      ← Contexte, roadmap, infrastructure
│   ├── 2_Architecture/  ← Spec, schéma DB, scalabilité
│   ├── 3_Features/      ← Modules, composants, navigation
│   ├── 4_Phases/        ← Prompts + handoffs par phase
│   ├── 5_Setup/         ← Installation Claude Code
│   ├── 6_Agents/        ← Agents spécialisés
│   ├── 7_References/    ← PRD, archives obsolètes
│   └── 8_Wireframes/    ← Prototypes HTML interactifs
├── Phase0_Components/   ← Spec composants Phase 0
├── CLAUDE.md            ← Contexte Claude Code (auto-chargé)
└── README.md            ← Vous êtes ici
```

**Status :** Phase 2.5 MVP livrée — Parcellaire + Plan d'assolement avec données réelles Darval (27 parcelles, 42 cultures Agridéa).
