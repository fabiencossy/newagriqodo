# 📸 Script de Capture Automatique - 33 Screenshots

## 🚀 Démarrage Rapide

### 1. **Prérequis**
- Node.js 16+ installé
- Application Agri Qodo tournant sur `http://localhost:5173`
- Navigateur Chrome/Chromium disponible

### 2. **Installation des dépendances**
```bash
npm install puppeteer
```

### 3. **Exécution du script**
```bash
node capture-screenshots.js
```

---

## 📋 Ce que le script fait

✅ Capture **33 screenshots** en haute qualité (PNG)
✅ Organise par catégorie dans 9 dossiers
✅ Respecte les viewports exacts (Desktop 1440×900, Mobile 430×932)
✅ Attend le chargement complet de chaque page
✅ Gère les erreurs gracieusement

---

## 📁 Structure générée

```
outputs/
├── screenshots/
│   ├── 01_Hero/ (4 images)
│   │   ├── H1_Hero_Desktop_Carte_dézoomée.png
│   │   ├── H2_Hero_Mobile_Carte.png
│   │   ├── H3_Hero_Desktop_Panel_à_droite.png
│   │   └── H4_Hero_Mobile_Bottom_sheet.png
│   │
│   ├── 02_Parcellaire/ (4 images)
│   │   ├── P1_Parcellaire_Table_avec_checkbox.png
│   │   ├── P2_Parcellaire_Mobile_Cards.png
│   │   ├── P3_Parcellaire_Timeline_Gantt.png
│   │   └── P4_Parcellaire_Dashboard_KPIs.png
│   │
│   ├── 03_DetailParcelle/ (6 images)
│   │   ├── D1_Detail_Aperçu.png
│   │   ├── D2_Detail_Mobile_Aperçu.png
│   │   ├── D3_Detail_Carnet.png
│   │   ├── D4_Detail_Assolement.png
│   │   ├── D5_Detail_Fumure.png
│   │   └── D6_Detail_Statistiques.png
│   │
│   ├── 04_Carnet/ (4 images)
│   ├── 05_Formulaires/ (4 images)
│   ├── 06_Fumure/ (2 images)
│   ├── 07_Auth/ (2 images)
│   ├── 08_MultiTenancy/ (1 image)
│   └── 09_Bonus/ (8 images)
│
├── capture-screenshots.js (ce script)
├── README_CAPTURE.md (cette doc)
└── MANIFEST_SCREENSHOTS.md (index généré après)
```

**Total: 33 images PNG en haute qualité**

---

## 🛠 Dépannage

### ❌ Erreur: "Impossible de joindre localhost:5173"
→ Vérifiez que l'application tourne: `npm run dev`

### ❌ Erreur: "Cannot find module 'puppeteer'"
→ Installez les dépendances: `npm install puppeteer`

### ❌ Les images sont vides/blanches
→ Attendez plus longtemps au chargement
→ Vérifiez que JavaScript est activé dans Chromium

### ❌ Certaines images manquent des éléments
→ Les éléments n'étaient pas chargés (API timeout)
→ Vérifiez les logs du serveur backend

---

## 🎨 Spécifications Techniques

### Viewports
- **Desktop**: 1440×932px (standard desktop)
- **Mobile**: 430×932px (iPhone 14)

### Pages capturées
- Parcellaire (carte, table, timeline, dashboard)
- Détail parcelle (6 onglets)
- Carnet des champs (table, timeline, form)
- Formulaires riches (intervention)
- Fumure (panel)
- Auth (login)
- Settings (produits, utilisateurs)
- Bonus (draw, FAB, fullscreen)

### Délais
- Attente réseau: 2s (networkidle2)
- Attente rendu: 500ms
- Timeout sélecteurs: 5s

---

## 📊 Temps estimé

- **Installation npm**: 2-3 min
- **Capture 33 images**: 5-10 min (dépend connexion)
- **Total**: ~15 min

---

## 🎯 Pour CloudCode

Une fois les screenshots capturés:

1. Ouvrir le dossier `screenshots/`
2. Sélectionner les meilleures par catégorie
3. Créer les pages web avec les meilleures captures
4. Suivre la structure des catégories pour la narration

---

## 📝 Notes

- Le script redémarre Chromium à chaque capture (ralentit mais isole les pages)
- Les routes avec `?` permettent de cibler des vues spécifiques
- Les `waitFor` attendent les éléments clés avant de capturer
- Les noms de fichiers sont générés automatiquement depuis `id` et `label`

---

**Besoin d'aide ?** Vérifiez les logs pendant l'exécution:
```bash
node capture-screenshots.js 2>&1 | tee capture.log
```

Généré le 16 mai 2026
