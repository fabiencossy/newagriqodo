# CLAUDE CODE × VSCODE — SETUP INSTRUCTIONS

**Date:** 2026-05-15  
**For:** NewagriQodo v2 Phase 0  
**Platform:** VSCode + Claude Code Extension

---

## 📋 PRÉ-REQUIS

Avant de démarrer, tu dois avoir:

- [ ] VSCode installé (https://code.visualstudio.com/)
- [ ] Node.js 18+ installé (`node --version`)
- [ ] npm installé (`npm --version`)
- [ ] Git installé (`git --version`)
- [ ] Compte Claude (pour l'API)

Vérifie:
```bash
node --version      # v18+ required
npm --version       # v9+ required
git --version       # Any version OK
```

---

## 🔧 STEP 1 — INSTALLER CLAUDE CODE EXTENSION

### 1.1 Ouvrir VSCode
```
Commande → VSCode
```

### 1.2 Ouvrir Extensions (Ctrl+Shift+X ou Cmd+Shift+X)
```
Icône Extensions (gauche) → Ou Ctrl+Shift+X
```

### 1.3 Chercher "Claude Code"
```
Search bar: "claude code"
```

### 1.4 Installer l'extension
```
Cliquer "Install"
(Official extension par Anthropic)
```

### 1.5 Reload VSCode
```
Restart VSCode quand demandé
```

---

## 🔑 STEP 2 — CONFIGURER CLAUDE API KEY

### 2.1 Créer API Key sur https://console.anthropic.com/

```
1. Aller à https://console.anthropic.com
2. Login avec ton compte
3. "API Keys" → "Create Key"
4. Copy la clé (commence par sk-ant-...)
5. Garder sécurisée!
```

### 2.2 Configurer dans VSCode

```
VSCode → Settings (Cmd+, ou Ctrl+,)
Search: "claude code"
Paste API key dans: "Claude Code: API Key"
```

Ou via command palette:
```
Cmd+Shift+P (Mac) / Ctrl+Shift+P (Windows/Linux)
Type: "Claude Code: Set API Key"
Paste: sk-ant-...
```

---

## 📁 STEP 3 — SETUP PROJET NEWAGRIQDODO

### 3.1 Créer dossier projet

```bash
mkdir -p ~/Projects/NewagriQodo
cd ~/Projects/NewagriQodo
```

### 3.2 Initialiser Git

```bash
git init
git config user.name "Fabien Cossy"
git config user.email "fabien.cossy@hofer-groupe.ch"
```

### 3.3 Copier fichiers specs depuis workspace

```bash
# Copier tous les fichiers MD + JSON + HTML
cp ~/Library/CloudStorage/GoogleDrive-fabien.cossy@hofer-groupe.ch/Drive\ partagés/24\ Projets\ Qodo/Qodo/Agri\ Qodo/Agri\ Qodo/*.md ./
cp ~/Library/CloudStorage/GoogleDrive-fabien.cossy@hofer-groupe.ch/Drive\ partagés/24\ Projets\ Qodo/Qodo/Agri\ Qodo/Agri\ Qodo/.claudecode.json ./
cp ~/Library/CloudStorage/GoogleDrive-fabien.cossy@hofer-groupe.ch/Drive\ partagés/24\ Projets\ Qodo/Qodo/Agri\ Qodo/Agri\ Qodo/*.html ./

# Vérifier
ls -la *.md .claudecode.json
```

### 3.4 Ouvrir dans VSCode

```bash
code .
# Ou: File → Open Folder → sélectionner ~/Projects/NewagriQodo
```

### 3.5 Vérifier structure

```
NewagriQodo/
├── SPEC.md
├── COMPOSANTS_REUSABLES.md
├── PHASE_0_PROMPT_CLAUDE_CODE.md
├── CLARIFICATIONS_FINALES.md
├── NAVIGATION_STRUCTURE.md
├── .claudecode.json
├── WIREFRAMES_NAVIGATION.html
└── ... (autres fichiers)
```

---

## 🚀 STEP 4 — LANCER PHASE 0 AVEC CLAUDE CODE

### 4.1 Ouvrir Claude Code dans VSCode

```
Cmd+Shift+P (Mac) / Ctrl+Shift+P (Windows/Linux)
Type: "Claude Code"
Select: "Claude Code: Start"
```

Ou:
```
Icône Claude Code (gauche sidebar) → Click
```

### 4.2 Panel Claude Code apparaît

```
Right side: Claude Code chat panel
Type messages pour communiquer avec Claude
```

### 4.3 Copier le PROMPT PHASE 0

```
Ouvrir: PHASE_0_PROMPT_CLAUDE_CODE.md
Copier tout le contenu
```

### 4.4 Envoyer le prompt à Claude Code

```
Dans Claude Code chat panel:
Paste: Contenu de PHASE_0_PROMPT_CLAUDE_CODE.md
Press: Enter / Send
```

Ou utiliser command:
```
Cmd+Shift+P → "Claude Code: New Task"
Paste prompt
```

---

## 📝 EXEMPLE DE DÉMARRAGE

```
Claude Code: "Je dois valider 8 composants réutilisables pour NewagriQodo Phase 0.

Lis d'abord:
- COMPOSANTS_REUSABLES.md
- CLARIFICATIONS_FINALES.md
- NAVIGATION_STRUCTURE.md

Puis crée pour le composant SearchBar:
1. Wireframe interactif (HTML)
2. TypeScript interfaces
3. Validation checklist

Si questions → demande clarification."
```

---

## 🔄 STEP 5 — WORKFLOW AVEC CLAUDE CODE

### Cycle typique:

```
1. Tu envoies tâche à Claude Code
   "Créer composant SearchBar"

2. Claude Code crée fichiers
   SearchBar.tsx
   SearchBar.types.ts
   SearchBar.html

3. onFilesChanged hook s'exécute
   → prettier --fix
   → npm run lint --fix
   → Code auto-formaté

4. Claude Code marque complète
   "✓ SearchBar wireframe created"

5. Tu valides dans VSCode
   (Ouvrir fichier, vérifier)

6. Si ok → continue next composant
   Si problème → demande correction à Claude Code
```

---

## 📊 COMMANDS ÚTILES DANS CLAUDE CODE

### Dans VSCode Command Palette (Cmd/Ctrl+Shift+P):

```
Claude Code: New Task
→ Créer nouvelle tâche

Claude Code: Continue
→ Continuer tâche précédente

Claude Code: View Project Structure
→ Voir la structure du projet

Claude Code: Run Hook
→ Exécuter hooks manuellement (prettier, lint)

Claude Code: Check Status
→ Voir status actuel
```

---

## ⚙️ CONFIGURATION .claudecode.json

Fichier déjà créé, mais à vérifier:

```json
{
  "projectName": "NewagriQodo v2",
  "hooks": {
    "onFilesChanged": "npx prettier --write . && npm run lint --fix",
    "onTaskCompleted": "npm run test && npm run type-check"
  },
  "codeStandards": {
    "language": "TypeScript",
    "formatting": "Prettier",
    "linting": "ESLint"
  }
}
```

Si hooks ne marchent pas d'emblée, on les ajoute plus tard après npm setup.

---

## 🚨 TROUBLESHOOTING

### Claude Code ne se lance pas?

```
1. VSCode fermée/rouverte?
2. API key bien configurée?
3. Check: VSCode Output panel (bottom)
   → "Claude Code" tab
```

### Erreur "API Key invalid"?

```
1. Vérifier clé copie correctement
2. Clé commence par "sk-ant-"?
3. Aller https://console.anthropic.com
4. Générer nouvelle clé
5. Re-configurer dans VSCode
```

### Hooks ne s'exécutent pas?

```
1. npm install pas encore fait (normal phase 0)
2. On l'ajoute après
3. Pour l'instant, Claude Code génère just les fichiers
```

### VSCode freeze / slow?

```
1. Fermer autres onglets
2. VSCode Extensions moins nombreuses
3. Restart VSCode
```

---

## 📞 DURANT LE DÉVELOPPEMENT

### Si Claude Code pose questions:
```
→ Réponds directement dans le chat
→ ou réfère à CLARIFICATIONS_FINALES.md
```

### Si besoin de clarifier avec Fabien:
```
Claude Code: "Fabien, j'ai une question sur SearchBar..."
→ Je (Claude dans chat normal) ou Fabien répond
→ Claude Code continue
```

### Si blockers:
```
Escalate à Fabien directement
Ou: pause et attendre clarification
```

---

## ✅ CHECKLIST PRÉ-LANCEMENT

- [ ] VSCode installé + ouvert
- [ ] Claude Code extension installé
- [ ] API key configurée
- [ ] Dossier projet créé et ouvert
- [ ] Specs copiées dans projet
- [ ] `.claudecode.json` présent
- [ ] `.git` initialisé
- [ ] Premier commit: "Initial: Phase 0 setup"

### Premier commit:
```bash
git add -A
git commit -m "Initial: Phase 0 setup - NewagriQodo v2"
git branch -M main
```

---

## 🎯 QUICK START (5 MIN)

```bash
# 1. Créer projet
mkdir ~/Projects/NewagriQodo && cd ~/Projects/NewagriQodo

# 2. Copier specs
cp ~/Library/CloudStorage/.../Agri\ Qodo/*.md ./
cp ~/Library/CloudStorage/.../Agri\ Qodo/.claudecode.json ./

# 3. Init git
git init && git add -A && git commit -m "Initial: Phase 0"

# 4. Ouvrir VSCode
code .

# 5. Lancer Claude Code
# Cmd+Shift+P → Claude Code: Start

# 6. Envoyer prompt Phase 0
# Copier PHASE_0_PROMPT_CLAUDE_CODE.md → paste dans chat Claude Code
```

---

## 🚀 C'EST BON, LET'S GO!

Une fois Claude Code lancé:

```
Message: "Lancer Phase 0 - Composants réutilisables

Reference PHASE_0_PROMPT_CLAUDE_CODE.md pour instructions détaillées.

Commencer par SearchBar."
```

Puis Claude Code va:
1. Lire les specs
2. Créer wireframes
3. Poser questions si besoin
4. Générer composants TypeScript
5. Valider vs checklist

---

**Status:** ✅ PRÊT POUR LANCEMENT  
**Next:** Setup VSCode → Launch Claude Code → Phase 0 begin!

