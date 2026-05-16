# CLAUDE CODE HOOKS — CLARIFICATION

**Date:** 2026-05-15  
**Status:** ✅ CORRECTIONS FAITES

---

## DISTINCTION IMPORTANTE

### ❌ CE QUE JE COMPRENAIS MAL
J'appelais "hooks" certains comportements métier :
```
Hook 1: Timesheet → Odoo Attendance
Hook 2: Questions de clarification
Hook 3: Exports
Hook 4: Odoo dependency check
```

❌ **C'est FAUX.** Ce ne sont pas des Hooks Claude Code.

---

### ✅ CLAUDE CODE HOOKS (Correct)

Les **Hooks Claude Code** sont des **scripts d'automatisation** (comme Git Hooks) qui s'exécutent à deux moments :

#### 1. `onFilesChanged`
**Quand :** Après que Claude modifie un fichier  
**Quoi :** Auto-formatter, linter, cleanup

```json
{
  "hooks": {
    "onFilesChanged": "npm run prettier --fix && npm run lint --fix"
  }
}
```

**Exemples:**
- Prettier (formatage)
- ESLint (linting)
- TypeScript type-check
- Code style corrections

#### 2. `onTaskCompleted`
**Quand :** Après que Claude termine une tâche  
**Quoi :** Tests, builds, validation

```json
{
  "hooks": {
    "onTaskCompleted": "npm test && npm run build"
  }
}
```

**Exemples:**
- `npm test` (unit tests)
- `npm run build` (compilation)
- `npm run type-check` (TypeScript)
- Integration tests

---

## NEWAGRIQDODO — CONFIGURATION HOOKS

Fichier: `.claudecode.json`

```json
{
  "hooks": {
    "onFilesChanged": {
      "tasks": [
        "npx prettier --write .",
        "npm run lint --fix (frontend)",
        "npm run lint --fix (backend)"
      ]
    },
    "onTaskCompleted": {
      "tasks": [
        "npm test (frontend)",
        "npm test (backend)",
        "npm run type-check",
        "npm run build (frontend)"
      ]
    }
  }
}
```

**Résultat:**
- Chaque modification de Claude → auto-formatée + linted
- Chaque tâche complétée → tests validés + build réussi
- Si tests échouent → Claude voit l'erreur et corrige

---

## CE QUI N'EST PAS UN HOOK (= Logique métier à coder)

Ces comportements doivent être implémentés dans le **code applicatif**, pas comme hooks :

### ❌ "Timesheet → Odoo Attendance"
C'est de la **logique métier**, pas un hook Claude Code.

```typescript
// Dans backend/src/services/timesheet.ts

async function createTimesheet(entry: TimesheetInput) {
  // 1. Sauve en local DB
  const ts = await prisma.timesheetEntry.create({
    data: entry
  });
  
  // 2. AUTOMATIQUEMENT → créer Odoo attendance
  try {
    const odoo = new OdooClient();
    await odoo.createAttendance({
      employee_id: entry.employeeId,
      date: entry.date,
      hours: entry.hoursWorked
    });
  } catch (error) {
    // Retry logic, logging, etc.
  }
  
  return ts;
}
```

### ❌ "Questions de clarification"
C'est du **comportement Claude** normal, pas un hook.

Claude Code demandera naturellement si ambigu. Pas besoin de "hook" pour ça.

### ❌ "Exports PDF/CSV"
C'est une **feature à coder**, pas un hook.

```typescript
// Dans backend/src/routes/export.ts

app.post("/export/parcelles", async (req, res) => {
  const { format, columns } = req.body;
  const data = await getParcelles();
  
  if (format === "pdf") {
    return generatePDF(data, columns);
  } else if (format === "csv") {
    return generateCSV(data, columns);
  }
});
```

### ❌ "Odoo dependency check"
C'est une **vérification runtime**, pas un hook.

```typescript
// Dans backend/src/middleware/odooCheck.ts

async function checkOdooConnection(req, res, next) {
  try {
    await odooClient.ping();
    next();
  } catch (error) {
    if (req.path.includes("/travaux")) {
      return res.status(503).json({
        error: "Odoo required for Travaux module"
      });
    }
    next(); // Parcellaire/Troupeau can work offline
  }
}
```

---

## RÉSUMÉ

| Concept | Type | Où ça va | Exemple |
|---------|------|----------|---------|
| **onFilesChanged** | Hook Claude Code | `.claudecode.json` | `prettier --fix` |
| **onTaskCompleted** | Hook Claude Code | `.claudecode.json` | `npm test` |
| **Timesheet → Odoo** | Logique métier | Code applicatif (backend) | Service layer |
| **Export PDF/CSV** | Feature | Code applicatif (routes) | Endpoint `/export` |
| **Odoo check** | Middleware | Code applicatif (middleware) | Express middleware |
| **Questions clarification** | Comportement Claude | N/A (naturel) | Claude demande si besoin |

---

## CONFIGURATION `.claudecode.json` — FINALE

File: `/ .claudecode.json` (root du projet)

```json
{
  "projectName": "NewagriQodo v2",
  
  "hooks": {
    "onFilesChanged": {
      "description": "Auto-format and lint code",
      "tasks": [
        {
          "name": "Prettier",
          "command": "npx prettier --write .",
          "continueOnError": false
        },
        {
          "name": "ESLint (frontend)",
          "command": "npm run lint --fix",
          "cwd": "frontend",
          "continueOnError": true
        },
        {
          "name": "ESLint (backend)",
          "command": "npm run lint --fix",
          "cwd": "backend",
          "continueOnError": true
        }
      ]
    },
    
    "onTaskCompleted": {
      "description": "Run tests and build validation",
      "tasks": [
        {
          "name": "Frontend tests",
          "command": "npm run test",
          "cwd": "frontend",
          "timeout": 120
        },
        {
          "name": "Backend tests",
          "command": "npm run test",
          "cwd": "backend",
          "timeout": 120
        },
        {
          "name": "Type check",
          "command": "npm run type-check",
          "timeout": 60
        },
        {
          "name": "Build frontend",
          "command": "npm run build",
          "cwd": "frontend",
          "timeout": 180
        }
      ]
    }
  },
  
  "codeStandards": {
    "language": "TypeScript",
    "formatting": "Prettier (2-space)",
    "linting": "ESLint + React plugin",
    "testing": "Vitest (frontend), Jest (backend)",
    "framework": "React 18 (Vite) + Express"
  }
}
```

---

## WORKFLOW AVEC HOOKS

```
1. Claude Code reçoit tâche
   "Créer composant SearchBar"

2. Claude code le composant
   → Modifie frontend/src/components/SearchBar.tsx

3. onFilesChanged trigger automatiquement
   → prettier --write .
   → npm run lint --fix
   → Code auto-formaté + linted

4. Claude marque tâche complète
   "SearchBar component created ✓"

5. onTaskCompleted trigger automatiquement
   → npm run test
   → npm run build
   → Si tests ou build échouent → Claude voit erreur et corrige

6. Claude reporte résultat
   "✓ Tests passed"
   "✓ Build successful"
```

---

## CLARIFICATION FINALE

**Hooks Claude Code ≠ Business Logic**

- ✅ **Hooks** = Automatisation code (formatting, linting, tests)
- ✅ **Logic** = Implémentation features (timesheet sync, exports, Odoo checks)

Les hooks s'exécutent **automatiquement** sur commande Claude Code.  
La logique s'exécute **à runtime** dans l'application.

---

**Status:** ✅ CORRECTIONS APPLIQUÉES  
Ready for Phase 0 avec configuration hooks claire.

