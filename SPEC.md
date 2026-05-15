# NEWAGRIQDODO V2 — SPECIFICATION COMPLÈTE

**Date:** 2026-05-15  
**Statut:** DRAFT - En attente de validation  
**Propriétaire:** Fabien Cossy  
**Emails:** fabien.cossy@hofer-groupe.ch

---

## 1. VUE D'ENSEMBLE DU PROJET

### 1.1 Objectif
Refondre NewagriQodo en v2 avec:
- **Esthétique & UX** complètement modernisée (mobile-first)
- **Architecture scalable** pour 2000-10000+ exploitations
- **Intégration Odoo bidirectionnelle** temps réel via webhooks
- **Composants réutilisables** (barre recherche, vues multiples, carte)
- **Infrastructure d'agents** pour accélérer développement

### 1.2 Principes directeurs
- **Zéro modification Odoo** : seule API + webhooks
- **Mobile-first** : la carte est l'interface principale sur mobile
- **Scalabilité** : prêt pour 2000+ users simultanés
- **Modularité** : parcellaire (core) + travaux + troupeau (add-ons)
- **Validation métier** : un agent "Agronome" valide les normes suisses

---

## 2. ARCHITECTURE GÉNÉRALE

### 2.1 Stack technique
```
FRONTEND:     React 18+ (Vite) + Tailwind + shadcn/ui
BACKEND:      Node.js/Express (TypeScript)
DATABASE:     PostgreSQL (Prisma ORM)
INFRA:        Docker Compose sur VPS Infomaniak (83.228.247.77)
EXTERNAL:     Odoo Enterprise (webhooks + REST API)
              Codomaster (facturation via Odoo)
CACHE:        Redis (sessions + data cache)
AUTH:         JWT (local) ou SSO Odoo (futur)
MAPS:         Maplibre GL (self-hosted tiles)
```

### 2.2 Architecture haut niveau
```
┌─────────────────────────────────────────────────────────┐
│          NEWAGRIQDODO v2 - MULTI-EXPLOITATION                │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │   MODULE     │  │   MODULE     │  │   MODULE     │
  │  PARCELLAIRE │  │   TRAVAUX    │  │   TROUPEAU   │
  │   (CORE)     │  │  (ADD-ON)    │  │  (ADD-ON)    │
  └──────────────┘  └──────────────┘  └──────────────┘
         │                    │                    │
         └────────┬───────────┴────────┬───────────┘
                  ▼                    ▼
          ┌─────────────────┬─────────────────┐
          │  COMPOSANTS     │ SYSTÈME D'AUTH  │
          │ RÉUTILISABLES   │  & MULTI-USER   │
          │ (Barre search   │  & MULTI-FARM   │
          │ + Vues + Carte) │                 │
          └─────────────────┴─────────────────┘
                  │
         ┌────────┴────────┐
         ▼                 ▼
    ┌─────────┐        ┌────────┐
    │ ODOO    │        │Codomaster
    │ (Master │        │(Facturation)
    │ Data)   │        │
    └─────────┘        └────────┘
```

### 2.3 Multi-tenancy
- **Tenant Level 1** : Exploitation (farm)
  - 1+ utilisateur par exploitation
  - Chaque user peut être "Editor" ou "Viewer"
  - Données isolées par `farm_id`
- **Tenant Level 2** : Utilisateur
  - 1 utilisateur = N exploitations (switch context)
  - Facturation par utilisateur supplémentaire par farm

---

## 3. MODULES MÉTIER

### 3.1 MODULE PARCELLAIRE (CORE) — **PRIORITÉ 1**

#### 3.1.1 Sous-fonctionnalités

**A) Gestion Parcelles**
- CRUD complet avec géolocalisation
- Cadastre suisse : numéro référence cadastrale
- Géométrie : polygon/multipolygon (GeoJSON)
- Surface : automatique (géométrie) ou manuelle
- **Infos importantes** : plan d'accès, directions particulières (texte libre)
- **Points d'intérêt géographiques** :
  - Types : borne, regard, piquet (enum)
  - Coordonnées GPS
  - Notes additionnelles
  - Affichage icônes sur carte
- Propriétaire/Locataire (relations)
- Photo/documents attachés (optionnel v2+)

**B) Cultures & Variétés**
- Synchronisation BIDIRECTIONNELLE depuis Odoo
- Odoo articles → NewagriQodo cultures (tags "agriculture")
- Chaque type culture porte :
  - Besoins fertilisants (template bilan)
  - Règles sanitaires (délai d'attente par phyto)
  - Durée cycle (semis → récolte)
  
**C) Carnet de Culture (Interventions champ)**
- Saisie interventions : date, parcelle, culture, type
- Types intervention : labour, semis, épandage, pulvérisation, récolte, autre
- **SAISIE BIMODALE (clé)** :
  - Quantité en **kilo** OU **kilo/hectare**
  - Si kilo/ha : calcul auto quantité totale = kilo/ha × surface_parcelle
  - Affichage des deux (conversion bidirectionnelle)
- **Produits phytosanitaires** : 
  - Dropdown produits (sync Odoo)
  - Sélection → affiche **alert délai d'attente** :
    ```
    ⚠️ Vous avez sélectionné "Glyphosate 360" 
       Programme: SRPA activé
       Délai d'attente: 21 jours
       Date de récolte possible: 2026-06-15
    ```
  - Délai adapté au programme d'exploitation (SST, SRPA, Swiss Gap)
- Enregistrement automatique → MAJ bilan fumure

**D) Bilan de Fumure (Azote, Phosphore, Potasse)**
- Dashboard accueil avec 3 tuiles : N, P, K
- État : **vert** ✅ (normes respectées) | **orange** ⚠️ (limite) | **rouge** 🔴 (dépassé)
- Cliquer tuile → Détail complet :
  - Apports : fumier, lisier, engrais minéraux, résidus
  - Exports : récoltes
  - Cumul par culture/parcelle
  - Chaque ligne cliquable → source (intervalle, date)
- Calcul basé sur :
  - Nombre animaux (module Troupeau ou saisie manuelle en Parcellaire)
  - Quantités saisies au carnet
  - Normes suisses (SRPA, SST) appliquées
- Export PDF bilan annuel

**E) Plan d'Assolement (NEW)**
- **Séparé du Carnet** : planning pluriannuel, pas historique
- Vue timeline :
  - Axe Y : parcelles (liste)
  - Axe X : mois (Jan-Dec)
  - Carré coloré = culture prévue pour période
- Navigation temporelle : ← 2024 | 2025 | 2026 →
- Drag-drop culture sur parcelle × période pour créer assolement
- **Intégration carte** :
  - Parcelles colorées selon culture prévue à date courante
  - Changement couleur lors navigation temporelle
  - Permet visualiser rotation cultures à l'avance

---

### 3.2 MODULE TRAVAUX AGRICOLES (ADD-ON) — **PRIORITÉ 2**

- Commandes travaux pour tiers/prestataires
- Synchronisation clients Odoo (partenaires)
- Facturation mensuelle groupée
- Devis PDF
- Status suivi (demandé, en cours, fait, facturé)

---

### 3.3 MODULE TROUPEAU (ADD-ON) — **PRIORITÉ 3**

- Gestion animaux (création, modification, suppression)
- Races/types : bovin, porcin, ovin, équidé, volaille
- Historique : entrée, sortie, naissances, ventes, décès
- **Intégration bilan fumure** :
  - Nombre animaux → calcul production fumier/lisier automatique
  - Utilisé par module Parcellaire pour bilan

---

## 4. COMPOSANTS RÉUTILISABLES (CORE)

### 4.1 **SearchBar** (Barre de recherche)

**Positionnement:**
- Toutes listes (Parcelles, Interventions, etc.)
- Flottante sur carte (z-index élevé)

**Design mobile-first:**
```
SM (mobile):
┌──────────────────────┐
│ 🔍 [rechercher...] ⚙️│  ← Input + icône filtres
└──────────────────────┘

MD+ (desktop):
┌────────────────────────────────────────┐
│ 🔍 Rechercher parcelles    ⚙️ Filtres ▼│
└────────────────────────────────────────┘
  Filtres dynamiques (multi-select):
  Culture: ☐Colza ☐Blé ☐Patate (seulement si existent!)
  Surface: ☐0-5ha ☐5-10ha ☐10ha+
  Propriétaire: ☐Cossy ☐Martin
  💾 Filtres favoris: "Colza 2026" [❤️]
```

**Comportement clé:**
- Filtres dynamiques : **affichent SEULEMENT les options avec data**
  - Si aucun colza → pas de filtre colza
  - Si 1 propriétaire → pas de dropdown propriétaire
- Recherche full-text rapide (PostgreSQL ILIKE ou Elasticsearch)
- Sauvegarde favoris (localStorage first, optionnel sync serveur)
- Responsive : compact XS, plein texte SM+

**Hooks:**
```typescript
useSearchFilters(entityType, farmId)
→ { filters, setFilters, savedFilters, setSavedFilters }
```

---

### 4.2 **ViewSwitcher** (Sélecteur de vues)

**Localisation:** Header droit, près SearchBar

**Vues disponibles:**
1. **Liste** : tableau scrollable, colonnes paramétrables
2. **Grille** : 3-colonnes cards, responsive (2-col mobile)
3. **Kanban** : colonnes par statut/groupement
4. **Carte** : fullscreen mobile, aside desktop
5. **Calendrier** : timeline interventions (date + durée)

**Comportement:**
- Icônes simples : 📋 📊 🎯 🗺️ 📅
- Vue active persistée (localStorage)
- Transition smooth
- Accessible au clavier (arrow keys)

---

### 4.3 **MapView** (Carte) — **COMPOSANT CRITIQUE**

**Stack:** Maplibre GL (open-source, tiles self-hosted possibles)

#### Mobile UX (priorité)
```
┌─────────────────────────────┐
│ 🔍 Search      ⚙️ Filtres   │  ← Barre flottante (z=100)
├─────────────────────────────┤
│                             │
│    [SATELLITE VIEW]         │  ← Vue satellite par défaut
│   (fond bleu foncé clair)   │
│    Parcelles contrastées    │
│    (bleu, rouge, vert,      │
│     orange, violet, jaune)  │
│                             │
│  Clic parcelle → highlight  │
│  Double-clic → détails      │
│                             │
│                             │
├─────────────────────────────┤
│         [⊕] MAIN ACTION     │  ← Bouton contextuel fixe
│     Mini buttons (👁️✏️📍)    │  ← Actions secondaires
└─────────────────────────────┘
```

#### Couleurs parcelles
- **Contrastées, saturées** (pas pastels)
- Palette : #1f77b4 (bleu), #ff7f0e (orange), #2ca02c (vert), #d62728 (rouge), #9467bd (violet), #e7ba52 (jaune)
- Opacité réduite si filtrée/non-pertinente
- **Dynamiques selon Plan Assolement** (si actif) → couleur = culture à date courante

#### Interactions
- **Clic parcelle** → Affiche AsideCard + active bouton +
- **Drag-to-pan** (mobile native)
- **Pinch-to-zoom** (mobile)
- **Double-tap** → Ouvrir carnet de cette parcelle
- **Zoom auto** sur sélection (smooth)

#### Infos parcelle
Affichage au survol/clic :
```
Parcelle "PF-2024-001"
Surface: 2.5 ha
Culture: Colza 2024
⚠️ Accès par route forestière (attention!)
🔴 Borne (coord GPS)
🟠 Regard
```

#### Couches cartographiques
- **Satellite** (par défaut)
- **Plan** (style light, en second)
- Toggle quick (coin supérieur droit)
- Fond sombre sur satellite pour lisibilité

---

### 4.4 **AsideCard** (Panneau détail sélection)

**Localisation:**
- Desktop : côté droit, 40% width, scrollable
- Mobile : bas (bottom sheet) ou fullscreen modal
- Transitions smooth

**Contenu:**
- Détail complet : parcelle / intervalle / animal
- Actions rapides : Modifier, Supprimer, ➕ Nouveau lié
- Édition inline possible pour champs simples

---

### 4.5 **ParameterPanel** (Paramètres)

**Navigation Odoo-like:**
```
┌────────────────────────────────────────┐
│ MODULES              │ Contenu droite  │
│  ├─ Parcellaire      │  Réglages       │
│  ├─ Travaux          │  Parcellaire    │
│  ├─ Troupeau         │  ☐ SRPA        │
│  ├─ Paramètres       │  ☐ SST         │
│  │  ├─ Mon exploi    │  [Enregistrer] │
│  │  ├─ Utilisateurs  │                │
│  │  ├─ Master data   │                │
│  │  └─ Intégrations  │                │
│  └─ Aide             │                │
└────────────────────────────────────────┘
```

**Champs "Mon exploitation":**
- Numéro cantonal (identifiant unique agriculteur, crucial)
- Nom exploitation
- Commune/localité
- Programmes : ☐ SRPA ☐ SST ☐ Bio (affectent délais attente)
- Contact responsable (email, tél)
- Logo/photo exploitation
- Sauvegarde → sync vers Odoo

**Sauvegarde:** À chaque changement, prompt "Enregistrer" (pas autosave sur paramètres)

---

## 5. SYNCHRONISATION ODOO BIDIRECTIONNELLE

### 5.1 Flux général

**Odoo → NewagriQodo (PULL, webhook-triggered)**
- Articles (cultures) : tags "agriculture" → types cultures
- Partenaires : clients → prestataires
- Produits phyto : articles spécialisés → stock local
- Homologations : field custom `homologation_num` → `product.homologation_num`
- Commandes travaux : crée entrée NewagriQodo
- Délais d'attente produits : field Odoo → alert config

**NewagriQodo → Odoo (PUSH, webhook + API)**
- Interventions carnet : journal tâches (optionnel)
- Bilan fumure export : PDF + JSON (annuel)
- Créations parcelles : synch optionnelle (pour crédibilité Odoo)

### 5.2 Webhooks Odoo (à configurer côté Odoo)

```
Event: article.create/update (tags "agriculture")
URL: https://newagri.qodo.ch/webhooks/odoo/culture-updated
Method: POST
Payload: { article_id, name, tags, ... }

Event: product.create/update (phyto products)
URL: https://newagri.qodo.ch/webhooks/odoo/product-updated
Method: POST
Payload: { product_id, homologation_num, delai_attente, ... }
```

**Retry logic:**
- 3 tentatives, backoff exponentiel (1s, 4s, 16s)
- Timeout : 10s par webhook
- Log tous les webhooks (debugging)

---

## 6. NORMES AGRICOLES SUISSES

### 6.1 Programmes
- **SRPA** : Surfaces Rétribution Prestations Environnement (plus stricts)
- **SST** : Système Suivi Terroir (traçabilité)
- **Swiss Gap** : Label qualité (délais récolte)
- **Bio** : Agriculture biologique (pas phyto synthétique)

### 6.2 Délais d'attente phytosanitaires
Stockés Odoo, synchronisés NewagriQodo:
```json
{
  "product_id": 123,
  "name": "Glyphosate 360",
  "homologation_num": "CHE-12345-ABC",
  "delai_attente_standard": 7,
  "delai_attente_srpa": 21,
  "delai_attente_swiss_gap": 14,
  "delai_attente_bio": null
}
```

**Affichage alert carnet:**
```
Vous avez sélectionné "Glyphosate 360"
Programme exploitation: SRPA ✓
↓
⚠️ Délai d'attente: 21 jours
Date de récolte possible: 2026-06-15 (21j après 2026-05-25)
```

### 6.3 Bilan fumure (ordonnance suisse)
Basé Ordonnance fédérale engrais (OEngrais, révision 2024):

**Azote (N):**
- Max 160 kg/ha/an (incluant fumier)
- Cible : 0 kg/ha (équilibré import/export)
- Plage vert : -20 ≤ N ≤ +20
- Plage orange : -30 ≤ N < -20 OU +20 < N ≤ +30
- Rouge : N < -30 OU N > +30

**Phosphore (P):** équilibré (import = export)
**Potasse (K):** surtout fourrages (plantes fourragères)

**Calcul automatique:**
```
Apports = fumier (kg) + lisier (kg) + engrais minéraux (kg) + résidus cultures
Exports = produit récolte (kg) × teneur culture
Bilan = Apports - Exports
```

---

## 7. FACTURATION & PRICING

### 7.1 Tiers tarifaires

**Socle Parcellaire (obligatoire):**
- CHF 300-600/an mono-farm vs multi-farm
- Inclut 1 utilisateur
- Utilisateur supplémentaire : +CHF 50/an/user/farm

**Add-on Travaux agricoles:**
- +CHF 100/an/farm

**Add-on Troupeau:**
- +CHF 80/an/farm

**Exemple:**
- 1 farm, 2 users, parcellaire+travaux : 400 + 50 + 100 = CHF 550/an

### 7.2 Facturation
- **Cycle :** annuel (renouvellement auto)
- **Plateforme :** Codomaster + Odoo
- **Date facture:** date création compte
- **Paiement :** invoice Odoo, virement Swiss PostFinance

---

## 8. AGENTS À CRÉER

*Voir AGENTS.md détail*

1. **Agent Dev** : code React + API endpoints
2. **Agent Validation UI** : tests visuels + regressions
3. **Agent Spec & Docs** : maintient SPEC + cloud.md
4. **Agent Sync Odoo** : intégration webhooks + mappings
5. **Agent Agronome** : valide normes suisses + alerts compliance

---

## 9. ROADMAP PHASES (12 semaines estimé)

### Phase 1 (Sem 1-3) : FONDATIONS
- Setup infra + auth multi-farm multi-user
- Modèles Prisma : User, Farm, Parcel, Culture, Intervention
- SearchBar composant
- ViewSwitcher architecture
- MapView minimal (Maplibre GL)
- Barre de recherche basique (recherche texte)

### Phase 2 (Sem 4-6) : PARCELLAIRE CORE
- CRUD Parcelles (géométrie, surface, infos)
- Carnet Interventions (saisie bimodale kilo/kilo-ha)
- Bilan Fumure MVP (calcul + dashboard)
- Vues complètes (Grille, Kanban, Calendrier)
- SearchBar filtres dynamiques

### Phase 3 (Sem 7-9) : ODOO + ASSOLEMENT
- Synchronisation Odoo (cultures, produits phyto)
- Webhooks Odoo (config + retry logic)
- Alerts délai d'attente
- Plan Assolement (timeline)
- Carte couleurs dynamiques

### Phase 4 (Sem 10-12) : POLISH + ADD-ONS
- ParameterPanel refonte
- Infos importantes parcelles + points d'intérêt
- Mobile UX fullscreen carte
- Module Travaux Agricoles (MVP)
- Module Troupeau (MVP)
- Perf + caching + lazy load

---

## 10. POINTS CLÉ À RETENIR

✅ **Zéro modif Odoo** : API + webhooks only  
✅ **Carte satellite par défaut** : meilleure visualisation  
✅ **Saisie bimodale** : kilo ET kilo/hectare (calcul auto)  
✅ **Filtres dynamiques** : affichent seulement si data existe  
✅ **Bouton + contextuel** : action principale selon contexte  
✅ **Bilan fumure intégré** : core fonctionnalité parcellaire  
✅ **Scalabilité 2000+ users** : architecture pensée pour ça  
✅ **Agent Agronome** : valide normes suisses avant push prod  

---

**PROCHAINE ÉTAPE:** Validation de cette SPEC + création des wireframes HTML interactifs.
