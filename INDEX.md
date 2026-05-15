# NEWAGRIQDODO V2 — INDEX COMPLET DE LA SPÉCIFICATION

**Date:** 2026-05-15  
**Propriétaire:** Fabien Cossy  
**Status:** PRÊT POUR VALIDATION

---

## 📄 FICHIERS CRÉÉS

### 1. **SPEC.md** ⭐ COMMENCEZ ICI
**La spec fonctionnelle complète**
- Vue d'ensemble du projet
- Architecture générale (stack technique, multi-tenancy)
- 3 modules : Parcellaire (core) + Travaux (add-on) + Troupeau (add-on)
- 5 composants réutilisables : SearchBar, ViewSwitcher, MapView, AsideCard, ParameterPanel
- Synchronisation Odoo bidirectionnelle
- Normes agricoles suisses (SRPA, SST, Swiss Gap, bilan fumure)
- Facturation & pricing model
- Roadmap phases de développement
- Points clés à retenir

**À valider:**
- [ ] Modules + fonctionnalités correspondent à votre vision
- [ ] Stack technique OK (React/Node/PostgreSQL)
- [ ] Tarification (CHF 300-600 + modulaire) acceptable
- [ ] Synchronisation Odoo bidirectionnelle claire

---

### 2. **cloud.md** ⚙️ ARCHITECTURE GUIDE
**Principes architecturaux pour tous les agents**
- Zéro modification Odoo (API only)
- Scalabilité 2000+ users (pagination, caching, indexes)
- Mobile-first philosophy
- Multi-tenant isolation (farmId everywhere)
- Composants réutilisables (hooks)
- Data consistency & webhooks pattern
- Validation métier (Agent Agronome)
- Performance checklist

**À valider:**
- [ ] Principes alignés avec votre vision technique
- [ ] Scalabilité: approach PostgreSQL + Redis OK?
- [ ] Security: validation + rate limiting suffisant?

---

### 3. **PRISMA.md** 🗄️ DATA MODELS
**Schema PostgreSQL complet**
- Auth & Multi-tenancy : User, Farm, UserFarm, UserOnboarding
- Geography : Parcel, PointOfInterest
- Cultures & Crops : Culture, ParcelCulture, Intervention, PhytoProduct
- Fertilizer Balance : FertilizerBalance (Azote, Phosphore, Potasse)
- Crop Rotation : AssolementPlan
- Livestock : Animal, AnimalEvent
- Agricultural Work : AgriculturalWork
- Sync tracking : OdooSyncLog
- Audit : AuditLog
- Indexes & unique constraints documentés

**À valider:**
- [ ] Champs couvrent tous les besoins
- [ ] Relations font sense (ForeignKeys OK)
- [ ] Performance indexes suffisants

---

### 4. **AGENTS.md** 👥 RÔLES & RESPONSABILITÉS
**Definition des 5 agents Claude**
- **Agent Dev** : code React/Node/Prisma
- **Agent Validation UI** : tests visuels + perf + accessibility
- **Agent Spec & Docs** : maintient docs à jour
- **Agent Sync Odoo** : intégration API Odoo + webhooks
- **Agent Agronome** : valide normes suisses (OEngrais, délai d'attente)

Chaque agent a :
- Rôle clair
- Responsabilités détaillées
- Inputs/Outputs
- Success criteria
- Prompt templates
- Workflow de coordination

**À valider:**
- [ ] 5 agents suffisent pour votre scope
- [ ] Rôles ne se chevauchent pas
- [ ] Priorités d'agents claires (Dev + Validation UI d'abord)

---

### 5. **ROADMAP.md** 📅 PLAN DÉVELOPPEMENT
**Timeline 12 semaines : phases 0-4**

| Phase | Durée | Focus | Deliverables |
|-------|-------|-------|--------------|
| 0 | Sem 1 | Fondations + Design | Infra, auth, wireframes validées |
| 1 | Sem 2-3 | Composants core | SearchBar, MapView, ViewSwitcher |
| 2 | Sem 4-6 | Parcellaire logic | Parcelles, carnet, bilan fumure MVP |
| 3 | Sem 7-9 | Odoo + Assolement | Sync bidirectionnelle, plan assolement |
| 4 | Sem 10-12 | Polish + add-ons | UX refinement, onboarding, travaux/troupeau |

**À valider:**
- [ ] Timeline aggressive mais réaliste?
- [ ] 5 agents working in parallel = OK?
- [ ] Phases peuvent chevaucher (Dev phase N+1 while Validation UI does phase N)?

---

### 6. **ONBOARDING_AND_ROLES.md** 🎓 UX POUR AGRICULTEURS
**Addendum : onboarding guidé + user roles**
- **Onboarding 5 steps** : exploitation → parcelle → intervalle → bilan → fin
- **User roles** : Admin / Editor / Viewer
- **SimpleCity principles** : labels clairs, icons, tooltips, mobile-friendly
- **Database models** : UserOnboarding, UserFarm.role
- **Frontend hooks** : usePermission(), useOnboarding()
- **Rappeler onboarding** button dans paramètres

**À valider:**
- [ ] Onboarding steps logiques?
- [ ] Admin/Editor/Viewer roles couvrent tous les cas?
- [ ] "Rappeler onboarding" feature utile?

---

### 7. **WIREFRAMES.html** 🎨 PROTOTYPES INTERACTIFS
**HTML interactif (ouvrir dans navigateur)**
- 📱 Carte Mobile (fullscreen, bouton +, barre flottante)
- 🖥️ Carte Desktop (aside card détail)
- 🎓 Onboarding Step 1 (farm infos form)
- ⚙️ Paramètres (utilisateurs + onboarding)
- 📋 Liste Parcelles (table + filtres dynamiques)

**Comment tester:**
1. Ouvrir WIREFRAMES.html dans navigateur
2. Cliquer sur boutons du haut pour switcher écrans
3. Interagir: cliquer bouton +, parcelles, etc.
4. Donner retours sur :
   - Layout mobile vs desktop
   - Tailles boutons (touchable?)
   - Couleurs (contrastées enough?)
   - Flow onboarding (clair?)

**À valider:**
- [ ] UI ressemble vision agriculteur simple?
- [ ] Mobile UX fullscreen carte OK?
- [ ] Bouton + contextuel clair?
- [ ] Filtres dynamiques (affichent seulement si data) compris?

---

## ✅ CHECKLIST VALIDATION

### Architecture & Technique
- [ ] Stack (React/Node/PostgreSQL) validated
- [ ] Multi-tenancy approach OK
- [ ] Scalability concerns addressed
- [ ] Security (rate limiting, validation) sufficient
- [ ] Odoo sync bidirectional understood

### Métier Agricole
- [ ] Modules (parcellaire, travaux, troupeau) align avec besoin
- [ ] Onboarding steps logical + easy to follow
- [ ] Bilan fumure calculation correct (OEngrais v2024)
- [ ] Délai d'attente phyto rules understood (SRPA, Swiss Gap)
- [ ] User roles (Admin/Editor/Viewer) cover cases

### UX & Simplicity
- [ ] Wireframes ressemblent votre vision
- [ ] Mobile fullscreen carte OK
- [ ] Filtres dynamiques concept clear
- [ ] Bouton + contextuel useful
- [ ] Onboarding guidé + "Rappeler" feature utile
- [ ] Labels/icons/help suffisamment clairs

### Agents & Processus
- [ ] 5 agents suffisent (Dev, UI Validation, Spec, Odoo, Agronome)
- [ ] Responsabilités claires + no overlap
- [ ] Coordination workflow comprendre
- [ ] Phase 0 (design) before Phase 1 (dev) accepted
- [ ] Itératif rapide possible (local dev + démos fréquentes)

---

## 🎯 PROCHAINES ÉTAPES

### 1️⃣ VALIDATION (Vous)
1. Lire SPEC.md (vue d'ensemble, architecture, modules)
2. Tester WIREFRAMES.html (UX interactive)
3. Lire ONBOARDING_AND_ROLES.md (simplicity + roles)
4. Donner retours : améliorations, questions, changements

### 2️⃣ CLARIFICATIONS (Si besoin)
- [ ] Stack technique exact? (React version, Node version, etc.)
- [ ] Deploiement : Infomaniak stays same? (83.228.247.77)
- [ ] Sauvegarde local + publication : git strategy?
- [ ] Onboarding multilingue (FR/DE/IT) ou juste FR MVP?
- [ ] Facturation : Codomaster gère automatiquement?

### 3️⃣ PREP DÉVELOPPEMENT (Après validation)
1. **Agent Spec & Docs** : finalise SPEC + crée API docs (Swagger)
2. **Agent Dev** : setup infra (Docker, repo, CI/CD)
3. **Agent Validation UI + Fabien** : crée wireframes Figma (optionnel) ou code React direct
4. **Agent Agronome** : prépare test data + validation rules
5. **Agent Sync Odoo** : maps Odoo setup (fields custom, webhooks)

### 4️⃣ PHASE 0 (Semaine 1)
- Infra prête (Docker, GitHub, CI/CD)
- Wireframes validées
- Prisma schema finalisée
- Agent roles on-boarded

### 5️⃣ PHASE 1-4 (Semaines 2-12)
- Itératif : 1-2 semaines per feature
- Démos internes fréquentes
- Validation rapide
- Publication progressive

---

## 📞 POINTS D'ENTRÉE

**Par domaine:**

| Domaine | Fichier | Sections clés |
|---------|---------|---------------|
| Modules métier | SPEC.md | Section 3 (Modules) |
| Architecture tech | cloud.md | Sections 1-3 |
| Data models | PRISMA.md | Full schema |
| Agents & workflow | AGENTS.md | Full definitions |
| Timeline dev | ROADMAP.md | Phases 0-4 |
| UX agriculteur | ONBOARDING_AND_ROLES.md | Full spec |
| Prototypes interactifs | WIREFRAMES.html | Open in browser |

---

## 💡 CONSEILS POUR VALIDATION

1. **Ne pas relire tout d'un coup** : 
   - Jour 1 : SPEC.md + WIREFRAMES.html
   - Jour 2 : ONBOARDING_AND_ROLES.md + AGENTS.md
   - Jour 3 : cloud.md + ROADMAP.md

2. **Interagir avec wireframes** : 
   - Ouvrir WIREFRAMES.html dans Chrome/Safari
   - Cliquer, imaginer utiliser comme agriculteur
   - Prendre notes sur améliorations

3. **Poser questions** : 
   - Rien n'est final
   - Si ambi guïté → signaler
   - Si vision différente → dire

4. **Validation != Approbation**:
   - Validation = "This looks good"
   - Pas besoin d'approuver chaque détail
   - Les agents affineront pendant dev

---

## 📊 STATISTIQUES

| Métrique | Value |
|----------|-------|
| Fichiers spec | 7 |
| Pages (approx) | 80+ pages |
| Composants documentés | 5 |
| Modules | 3 (1 core + 2 add-ons) |
| Agents | 5 |
| Phases dev | 5 (0-4) |
| Durée estimée | 12 semaines |
| Users cible | 2000+ |
| Tiers prix | 1 base + 2 add-ons |

---

## 🚀 VISION FINAL

**NewagriQodo v2** = application simple + scalable pour agriculteurs suisses:
- ✅ Parcelles gérées sur carte (satellite, intuitive)
- ✅ Carnet interventions (kilo ou kilo/hectare, facile)
- ✅ Bilan fumure automatique (normes OEngrais)
- ✅ Sync Odoo zero-effort (master data, délai d'attente)
- ✅ Utilisateurs multi-niveaux (Admin, Editor, Viewer)
- ✅ Onboarding guidé (agriculteur sans formation = OK)
- ✅ Modules add-on (travaux, troupeau)
- ✅ Prête pour 2000+ exploitations

**Développée par 5 agents Claude** en 12 semaines, itérativement, avec démos fréquentes et validation rapide.

---

**READY FOR VALIDATION ✅**

Ouvrez ce README en premier, puis explorez les fichiers selon votre intérêt.
