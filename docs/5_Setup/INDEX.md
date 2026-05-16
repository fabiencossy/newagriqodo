# docs/5_Setup — Index

Installation, configuration Claude Code.

## Fichiers

- **[CLAUDE_CODE_VSCODE_SETUP.md](CLAUDE_CODE_VSCODE_SETUP.md)** — Extension VSCode + API key + premier projet.
- **[CLAUDE_CODE_HOOKS_CLARIFICATION.md](CLAUDE_CODE_HOOKS_CLARIFICATION.md)** — Hooks Claude Code : `onFilesChanged` vs `onTaskCompleted`, exemples.

## Config active du projet

- **`.claude/settings.json`** à la racine — hooks `PostToolUse` (typecheck/lint sur Edit/Write dans `app/src/`).
- **`.claude/agents/`** — agents personnalisés (component-validator, ux-reviewer, agronome-validator).
