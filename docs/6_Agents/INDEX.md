# docs/6_Agents — Index

Agents spécialisés pour accélérer le développement.

## Fichier

- **[AGENTS.md](AGENTS.md)** — Définition conceptuelle des 5 agents : Dev, Validation UI, Spec & Docs, Sync Odoo, Agronome (prompts types + responsabilités).

## Agents Claude Code actifs

Définis dans **`.claude/agents/`** à la racine du projet (chargés automatiquement par Claude Code) :

- **component-validator** — Vérifie qu'un nouveau composant React respecte les conventions du projet (light only, radius via variables CSS, pas d'emoji, props typés, test associé).
- **ux-reviewer** — Revue UX d'une page (cohérence visuelle, accessibility, responsive).
- **agronome-validator** — Vérifie cohérence des données agricoles (cultures Agridéa, dates de semis, normes OEngrais).
