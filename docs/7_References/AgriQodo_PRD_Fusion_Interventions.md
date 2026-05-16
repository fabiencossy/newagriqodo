# PRD — Fusion Interventions (Carnet des champs + Travaux pour tiers + Mes heures)

**Version** : 0.1 (draft)
**Auteur** : Fabien + Claude
**Date** : 2026-05-04
**Statut** : À valider avant implémentation
**Modules concernés** : M2 (Carnet des champs), M6 (Travaux pour tiers), M11 (Heures et présences)
**Branche cible** : `feat/fusion-interventions` (à créer après validation)

---

## 1. Résumé exécutif

Aujourd'hui Agri Qodo expose trois écrans de saisie distincts (Carnet des champs, Travaux pour tiers, Mes heures) qui se chevauchent dans la tête de l'utilisateur : un semis fait pour soi est un "carnet", le même semis fait chez le voisin est un "travail tiers", et dans les deux cas on consomme des heures. Cette fragmentation impose à l'agriculteur de se demander où saisir avant de saisir. C'est un échec UX au sens de la règle simplicité radicale (PRD-Archi #5).

On fusionne donc les trois modules derrière **une seule action "Nouvelle intervention"** qui ouvre un formulaire à trois onglets. L'utilisateur choisit son intention (auto-déclarative) et le formulaire s'adapte. Le modèle de données unifié reste un seul objet `Intervention` avec un discriminant `type`, qui peut générer en aval 0 ou 1 entrée carnet champs et 0 ou 1 `sale.order` Odoo selon le cas.

Aucune donnée prod à migrer (modules en dev). Donc on peut casser le schéma proprement.

---

## 2. Contexte & motivation

### Ce qui existe (cf. memory `project_agriqodo_prod.md`)
L'architecture actuelle décrit déjà 3 cas opérationnels :
- **Cas A** — sur ma parcelle → saisie Intervention, carnet SELF, pas d'Odoo
- **Cas B** — sur parcelle partenaire (M16) → saisie Intervention, carnet client (PENDING validation), Travail + sale.order brouillon
- **Cas C** — hors parcelle (chez le client, terrain non géoré) → saisie Travail, pas de carnet, sale.order Odoo

Et le modèle Heures (M11) est traité comme un module séparé (timesheet pur).

### Le problème
1. **Trois entrées dans le menu** = trois modèles mentaux. L'utilisateur ne sait pas où cliquer.
2. **Duplication de saisie** : un semis tiers coché "à inscrire au carnet du client" oblige aujourd'hui à connaître la mécanique M16. C'est trop technique.
3. **Heures déconnectées** : quand l'utilisateur saisit un travail tiers de 2h facturé au forfait, ses heures ne remontent nulle part automatiquement → trou dans le coût de revient.
4. **Création de référentiel à la volée absente** : ajouter un type de travail ou un produit oblige à sortir du formulaire et casser le flux.

### L'objectif
- **Une seule porte d'entrée** : action FAB `+ Nouvelle intervention`.
- **Trois intentions** exposées comme onglets : Carnet des champs / Travaux pour tiers / Heures.
- **Champs dynamiques** : ne montrer que ce qui est pertinent pour le type de travail choisi.
- **Création à la volée** des types de travaux et des produits depuis le formulaire (modale inline).
- **Génération automatique** côté Odoo (sale.order) et côté carnet champs partenaire (M16) sans que l'utilisateur ait à connaître ces concepts.
- **Heures employés** systématiquement tracées, avec un réglage paramétrant leur destination sur les travaux tiers (sans jamais apparaître sur le devis client).

---

## 3. Périmètre

### In scope (cette PR)
- Refonte complète des écrans M2 / M6 / M11 en un formulaire unifié à onglets
- Modèle Prisma unifié `Intervention` + tables liées
- Création à la volée `WorkType` et `Product`
- Réglages exploitation (paramètres) liés à la nouvelle saisie
- Génération sale.order Odoo (cas B/C) inchangée fonctionnellement, mais déclenchée depuis le nouveau flux
- Mise à jour mobile (RN/Expo) avec le même formulaire à onglets
- Migration de schéma destructive (les anciennes tables sont remplacées, OK car pas de prod)

### Out of scope (PR séparées)
- Facturation groupée mensuelle (M6 phase 2, déjà au backlog)
- QR-bill suisse
- Validation côté client M16 (la queue PENDING existe déjà, on la branche au nouveau flux mais on ne la refactore pas)
- Géom `Polygon` sur intervention (toujours bloqueur du plan d'assolement, traité ailleurs)
- Saisie vocale / photo OCR (V2)

---

## 4. Vision UX

### 4.1 Point d'entrée
Un seul bouton FAB `+ Nouvelle intervention` accessible depuis :
- Tableau de bord exploitation
- Détail parcelle (avec parcelle pré-remplie)
- Liste des interventions
- Détail client tiers (avec client pré-rempli et onglet "Travaux tiers" ouvert par défaut)

### 4.2 Layout du formulaire

```
┌─────────────────────────────────────────────────────────┐
│  ← Annuler              Nouvelle intervention      ✓    │
├─────────────────────────────────────────────────────────┤
│ [ 🌾 Carnet des champs ] [ 🚜 Travaux tiers ] [ ⏱ Heures ]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Date *                  [ 04.05.2026          ▾ ]     │
│  Parcelle *              [ Sélectionner...     ▾ ]     │
│  Type de travail *       [ Sélectionner...     ▾ ] ⊕   │
│                                                         │
│  ─── Champs dynamiques selon type ────────────────────  │
│                                                         │
│  Produit                 [ ...                 ▾ ] ⊕   │
│  Quantité / ha           [ ____ ] [ kg/ha ▾ ]          │
│                                                         │
│  Temps passé             [ 2h30 ]                       │
│  Notes                   [                          ]   │
│                                                         │
│                          [   Enregistrer   ]            │
└─────────────────────────────────────────────────────────┘
```

**Règles UX** :
- Changer d'onglet **conserve** les champs communs déjà saisis (date, parcelle, type de travail, notes) et ajoute/cache les champs spécifiques.
- Le bouton ⊕ à côté de "Type de travail" et "Produit" ouvre une modale de création à la volée.
- Le formulaire est **mono-écran** sur desktop, **scrollable** sur mobile (l'agriculteur en cabine doit pouvoir tout voir sans scroll si possible).
- **Saisie HHMM** style qodo-clock (`720` = 7h20, `7.5` = 7h30) sur tous les champs durée.
- Aucune couleur violette (charte amber/terre, règle DevOps #8).

### 4.3 Pré-remplissage intelligent
- Date = aujourd'hui par défaut
- Type de travail = dernier utilisé sur cette parcelle (si Carnet) ou pour ce client (si Tiers)
- Onglet par défaut :
  - Si on entre depuis détail parcelle → Carnet
  - Si on entre depuis détail client tiers → Travaux tiers
  - Si on entre depuis le dashboard → dernier onglet utilisé (mémorisé en localStorage)

---

## 5. Modèle de données

### 5.1 Prisma — modèle unifié

```prisma
enum InterventionType {
  FIELD_LOG       // Onglet 1 : carnet des champs (sur ma ferme)
  THIRD_PARTY     // Onglet 2 : travaux pour tiers
  HOURS_ONLY      // Onglet 3 : heures pures (timesheet sans intervention agronomique)
}

enum WorkCategory {
  SOIL_PREP       // Travail du sol (labour, déchaumage, hersage)
  SEEDING         // Semis / plantation
  FERTILIZING     // Fertilisation (organique ou minérale)
  TREATMENT       // Traitement phyto (herbicide, fongicide, insecticide)
  HARVEST         // Récolte
  IRRIGATION      // Irrigation
  MAINTENANCE     // Entretien (fauchage, taille, broyage…)
  TRANSPORT       // Transport
  OTHER           // Autre (avec libre saisie)
}

model WorkType {
  id              String       @id @default(cuid())
  exploitationId  String
  name            String
  category        WorkCategory
  // Définit dynamiquement les champs requis pour cette intervention
  requiresProduct Boolean      @default(false)
  productKind     ProductKind? // Pour pré-filtrer le picker (SEED / TREATMENT / FERTILIZER / NONE)
  requiresYield   Boolean      @default(false) // True pour HARVEST par défaut
  isCustom        Boolean      @default(false) // Créé à la volée par l'utilisateur
  archivedAt      DateTime?
  createdAt       DateTime     @default(now())

  exploitation    Exploitation @relation(...)
  interventions   Intervention[]

  @@unique([exploitationId, name])
}

enum ProductKind {
  SEED
  TREATMENT       // Phyto
  FERTILIZER
  GOOD            // Bien matériel facturable (ex: balle de silo, paille)
  SERVICE         // Service facturable (ex: pressage, transport)
  CONSUMABLE      // Autre consommable
}

model Product {
  id              String      @id @default(cuid())
  exploitationId  String
  kind            ProductKind
  name            String
  // Métadonnées agronomiques
  activeIngredients String?   // pour TREATMENT
  manufacturer    String?
  reentryHours    Int?        // délai de rentrée (h)
  preHarvestDays  Int?        // délai avant récolte (j)
  // Métadonnées Odoo
  odooProductId   Int?        // mappé sur product.product Odoo
  odooProductType String?     // 'consu' | 'product' | 'service' (côté Odoo)
  defaultUnit     String      @default("kg")  // unité par défaut (kg, l, ha, t, pce)
  defaultPrice    Decimal?    @db.Decimal(10, 2)
  isCustom        Boolean     @default(false)
  archivedAt      DateTime?
  createdAt       DateTime    @default(now())

  exploitation    Exploitation @relation(...)
  usages          InterventionProduct[]

  @@unique([exploitationId, name, kind])
}

model Intervention {
  id              String           @id @default(cuid())
  exploitationId  String
  type            InterventionType

  // Champs communs
  date            DateTime
  workTypeId      String?          // null seulement si HOURS_ONLY
  notes           String?
  createdById     String
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  // FIELD_LOG / THIRD_PARTY (avec carnet)
  parcelId        String?          // optionnel pour THIRD_PARTY
  partnerExploitationId String?    // si parcelle appartient à un partenaire (M16)

  // THIRD_PARTY
  clientId        String?          // res.partner Odoo (mapping local)
  isAlsoFieldLog  Boolean          @default(false)
  // sale.order Odoo (cas B/C)
  odooSaleOrderId Int?
  odooSaleOrderState String?       // 'draft' | 'sent' | 'sale' | 'done'

  // HARVEST
  yieldValue      Decimal?         @db.Decimal(10, 2)
  yieldUnit       String?          // 'kg/ha' | 't/ha' | 'dt/ha' | 'pce'
  yieldDeferred   Boolean          @default(false)  // "saisir plus tard"

  // Heures (pour FIELD_LOG/THIRD_PARTY si pertinent, ou primaire pour HOURS_ONLY)
  startTime       DateTime?
  endTime         DateTime?
  breakMinutes    Int?
  durationMinutes Int?             // calculé : end - start - break
  projectId       String?          // requis si HOURS_ONLY
  taskId          String?          // requis si HOURS_ONLY
  // Destination des heures (THIRD_PARTY) : voir paramètre exploitation
  hoursTimesheetProjectId String?  // résolu à la création selon paramètre

  // Relations
  exploitation    Exploitation     @relation(...)
  workType        WorkType?        @relation(...)
  parcel          Parcel?          @relation(...)
  partnerExploitation Exploitation? @relation("partnerExploitation", ...)
  client          Partner?         @relation(...)
  createdBy       User             @relation(...)
  products        InterventionProduct[]
  hours           InterventionHour[]  // 1..N (un travail peut impliquer plusieurs employés)
}

model InterventionProduct {
  id              String       @id @default(cuid())
  interventionId  String
  productId       String
  quantity        Decimal      @db.Decimal(10, 3)
  unit            String       // 'kg' | 'l' | 'kg/ha' | 'l/ha' | 'pce' …
  unitPrice       Decimal?     @db.Decimal(10, 2)  // utilisé THIRD_PARTY
  // Pour THIRD_PARTY uniquement
  odooSaleOrderLineId Int?

  intervention    Intervention @relation(...)
  product         Product      @relation(...)
}

model InterventionHour {
  id              String       @id @default(cuid())
  interventionId  String
  employeeId      String       // user
  startTime       DateTime
  endTime         DateTime
  breakMinutes    Int          @default(0)
  durationMinutes Int          // calculé
  // Si THIRD_PARTY : le projet Odoo de destination dépend du paramètre exploitation
  odooTimesheetId Int?

  intervention    Intervention @relation(...)
  employee        User         @relation(...)
}
```

### 5.2 Notes de modèle

- **Un seul modèle `Intervention`** discriminé par `type` plutôt que trois tables. Cela facilite la liste unifiée, la recherche, les exports.
- `workTypeId` est nullable **uniquement** pour `HOURS_ONLY` (timesheet pur). Sinon obligatoire.
- `parcelId` est optionnel pour `THIRD_PARTY` (cas C : intervention chez le client sans géom de parcelle).
- `isAlsoFieldLog` n'a de sens que sur `THIRD_PARTY`. Si `true` ET `parcelId` pointe vers une parcelle d'un partenaire (M16), on déclenche le flux carnet client (PENDING). Si `true` ET la parcelle est à nous, on garde le carnet côté nous (rare mais légitime : on s'auto-facture).
- `InterventionHour` est en 1..N : un même travail peut impliquer plusieurs employés, chacun avec ses propres heures.
- `yieldDeferred = true` permet de sauver l'intervention récolte sans rendement et de revenir le saisir plus tard (notification + listing dédié).

---

## 6. Onglet 1 — Carnet des champs

### 6.1 Champs

| Champ | Type | Requis | Comportement |
|---|---|---|---|
| Date | Date | ✓ | Default = aujourd'hui |
| Parcelle | Picker | ✓ | Liste mes parcelles + parcelles partenaire (M16) où j'ai droit d'écriture |
| Type de travail | Picker + ⊕ | ✓ | Liste les WorkType de l'exploitation, classés par fréquence d'usage. Bouton ⊕ ouvre modale de création |
| **Champs dynamiques** | — | — | Voir 6.2 |
| Notes | Texte libre | — | Multiligne |
| Photo (V2) | Upload | — | Hors scope cette PR |

### 6.2 Champs dynamiques selon `WorkType.category`

**SEEDING** (semis/plantation)
- Produit (filtre `kind = SEED`) — requis, bouton ⊕
- Densité (kg/ha ou doses/ha) — requis
- Variété (texte libre) — optionnel
- Profondeur (cm) — optionnel

**FERTILIZING** (fertilisation)
- Produit (filtre `kind = FERTILIZER`) — requis, bouton ⊕
- Quantité (kg/ha ou unité fertilisante / ha) — requis
- Unité — picker (kg/ha, t/ha, m³/ha pour lisier)

**TREATMENT** (phyto)
- Produit (filtre `kind = TREATMENT`) — requis, bouton ⊕ (création modale enrichie : matières actives, délai rentrée, délai récolte)
- Dose (l/ha ou kg/ha) — requis
- Volume bouillie (l/ha) — optionnel
- Cible (texte libre : "rumex", "septoriose"…) — optionnel
- ⚠ Bandeau délais : si délai de rentrée ou avant récolte renseignés sur le produit, afficher un rappel calculé ("Rentrée autorisée à partir du XX.XX.XXXX")

**HARVEST** (récolte)
- Rendement — `yieldValue` + unité (kg/ha, t/ha, dt/ha, pce) — requis SAUF si...
- ☐ Saisir plus tard (`yieldDeferred`) — coche qui désactive et marque la valeur en attente

**SOIL_PREP / IRRIGATION / MAINTENANCE / TRANSPORT / OTHER**
- Produit optionnel (kind libre)
- Quantité optionnelle

### 6.3 Création à la volée — type de travail

Modale `+ Nouveau type de travail` :
- Nom (requis, unique par exploitation)
- Catégorie (picker `WorkCategory`) — détermine les champs dynamiques
- Requiert un produit ? (oui/non)
- Si oui : type de produit attendu (picker `ProductKind`)
- Bouton "Créer et utiliser" → ferme la modale et pré-sélectionne dans le formulaire parent

### 6.4 Création à la volée — produit

Modale `+ Nouveau produit` :
- Type de produit (`kind`) — requis, déjà pré-rempli par le contexte
- Nom — requis
- Si TREATMENT : matières actives, fabricant, délai rentrée (h), délai avant récolte (j)
- Unité par défaut
- ☐ Synchroniser avec Odoo (par défaut coché si exploitation a connecteur Odoo) → crée un `product.product` Odoo de type approprié
- Bouton "Créer et utiliser"

### 6.5 Heures sur Carnet
- Champ optionnel `Temps passé` (HHMM) sur la même intervention, pour tracking interne.
- Si renseigné, crée une `InterventionHour` pour l'utilisateur courant.
- N'apparaît jamais nulle part en facturation (FIELD_LOG = chez moi, pas de devis).

### 6.6 Génération aval

- Cas A (parcelle = mienne) : `Intervention.type = FIELD_LOG`, écriture immédiate. Pas d'Odoo.
- Cas B (parcelle = partenaire M16, droit "intervention soumise à validation") : `Intervention.type = FIELD_LOG`, statut côté carnet partenaire = PENDING. Pas de sale.order ici (c'est l'onglet carnet, pas tiers).

---

## 7. Onglet 2 — Travaux pour tiers

### 7.1 Champs

| Champ | Type | Requis | Comportement |
|---|---|---|---|
| Date | Date | ✓ | Default = aujourd'hui |
| Client | Picker | ✓ | Liste `res.partner` Odoo (cache local), bouton ⊕ pour créer un client à la volée |
| Parcelle | Picker | — | Optionnel. Si vide → cas C (hors parcelle) |
| ☐ Aussi inscrire au carnet des champs | Checkbox | — | Détermine la suite |
| **Section 1 — si carnet coché** | — | — | Voir 7.2 |
| **Section 2 — si carnet NON coché** | — | — | Voir 7.3 |
| Heures (collaborateurs) | Liste 1..N | — | Voir 7.4 |
| Notes internes | Texte | — | Pas envoyé à Odoo |

### 7.2 Si "Aussi carnet" coché

Affiche les **mêmes champs dynamiques** que l'onglet 1 (cf. 6.2) en fonction du Type de travail.
- Si la parcelle appartient à un partenaire M16 → écriture carnet client en PENDING
- Si pas de parcelle → on peut soit forcer la sélection, soit invalider la coche (validation FE : "Pour inscrire au carnet, indique une parcelle")
- Les **produits du carnet** (semence, phyto, engrais) sont remontés en lignes du sale.order Odoo selon les règles 7.5

### 7.3 Si "Aussi carnet" NON coché

Section "Prestations facturables" — liste de lignes :
- Produit (picker tous `ProductKind`, surtout `GOOD` et `SERVICE`) — bouton ⊕ pour créer
- Quantité
- Unité
- Prix unitaire (pré-rempli depuis `Product.defaultPrice` mais éditable)
- Bouton "+ Ajouter une ligne"

**Règles d'agrégation Odoo** (cf. règle 7.5) :
- Produit `SERVICE` → ligne directe sur le sale.order brouillon
- Produit `GOOD` → ligne directe sur le sale.order **ET** mouvement de stock entrant côté client (catalogue ETA "services sur site" Odoo, c.-à-d. consommables référencés au lieu de livraison du client)
- Produit `SEED` / `TREATMENT` / `FERTILIZER` (cas où on a coché "aussi carnet") → ligne sur le sale.order avec l'unité de facturation (généralement /ha × surface ou kg total)

### 7.4 Heures collaborateurs

Liste 1..N :
- Employé (picker)
- Heure début / Heure fin (HHMM)
- Pause (minutes)
- Durée auto-calculée

⚠ **Règle critique** (décision Fabien) : ces heures **n'apparaissent JAMAIS sur le devis client**. Elles vont vers une destination définie par le paramètre exploitation (cf. §9.1).

### 7.5 Génération sale.order Odoo

Au submit :
1. Créer ou récupérer le sale.order brouillon du client pour le mois en cours (pattern facturation groupée mensuelle, cf. memory `feedback_agriqodo_archi.md` #1)
2. Ajouter les lignes :
   - Si carnet coché : 1 ligne par produit du carnet (avec quantité totale = densité × surface parcelle, ou dose × surface, etc.)
   - Si carnet non coché : 1 ligne par ligne du tableau prestations
3. **Aucune ligne d'heures** sur le sale.order
4. Persister `Intervention.odooSaleOrderId` et `InterventionProduct.odooSaleOrderLineId`
5. Si Odoo down : queue de retry (BullMQ), l'intervention est sauvée en local, badge "à synchroniser"

### 7.6 Création client à la volée
Modale `+ Nouveau client` :
- Nom — requis
- Adresse, NPA, ville
- Email, téléphone
- ☐ Créer aussi dans Odoo (par défaut coché) → crée un `res.partner` Odoo et persiste le mapping local

---

## 8. Onglet 3 — Mes heures

### 8.1 Champs

| Champ | Type | Requis | Comportement |
|---|---|---|---|
| Date | Date | ✓ | Default = aujourd'hui |
| Heure début | HHMM | ✓ | qodo-clock |
| Heure fin | HHMM | ✓ | qodo-clock |
| Heure de pause | HHMM | — | Heure de début de pause (optionnel pour traçabilité) |
| Durée de pause | Minutes | — | Si renseignée, déduite du calcul |
| Projet | Picker | ✓ | Liste des projets Odoo (`project.project`) accessibles à l'utilisateur |
| Tâche | Picker | ✓ | Liste des tâches du projet sélectionné |
| Description | Texte | — | Libre |

### 8.2 Génération aval

- `Intervention.type = HOURS_ONLY`
- Crée 1 entrée `account.analytic.line` Odoo (via `hr.timesheet`) sur la tâche choisie
- Persiste `Intervention.hoursTimesheetProjectId`

### 8.3 Cas particuliers

- Si l'utilisateur saisit des heures avec un projet qui correspond au projet "Travaux tiers" du paramètre §9.1, on peut proposer (UX V2) "Tu veux plutôt créer un travail tiers ?" → bouton qui bascule vers l'onglet 2.

---

## 9. Paramètres exploitation

Nouvelle section `Réglages → Saisie interventions` :

### 9.1 Destination des heures sur travaux tiers ⚠ DÉCISION REQUISE

Le réglage répond à : "Où vont les heures des employés quand ils font des travaux pour tiers, sachant qu'elles ne doivent pas apparaître sur le devis ?"

Quatre options proposées :

**Option A — Projet timesheet interne unique "Travaux tiers"**
- Toutes les heures de tous les travaux tiers vont sur **un seul projet Odoo interne** (non facturable), créé automatiquement à la première saisie.
- Avantage : simple, zéro config supplémentaire.
- Inconvénient : pas de coût de revient par client.

**Option B — Un projet par client tiers**
- À la première intervention pour un client, on crée automatiquement un projet Odoo `[Travaux tiers] Nom du client` (non facturable) et toutes les heures pour ce client y vont.
- Avantage : reporting coût de revient par client trivial dans Odoo.
- Inconvénient : peut générer beaucoup de projets dans Odoo (1 par client tiers).

**Option C — Une analytique par client sur un seul projet**
- Un seul projet Odoo interne "Travaux tiers", mais chaque ligne de timesheet porte un compte analytique = client.
- Avantage : reporting par client + pas de pollution projets.
- Inconvénient : requiert que la compta analytique soit activée côté Odoo (pas universel).

**Option D — Lié au sale.order via la tâche du devis**
- Quand on crée le sale.order on crée aussi une tâche (`project.task`) attachée. Les heures vont sur cette tâche, dans le projet Odoo associé au client.
- Avantage : pattern Odoo natif "service avec timesheet". Coût + facturation alignés.
- Inconvénient : plus complexe à orchestrer côté connecteur. Risque de fuite des heures sur le devis si on ne configure pas la tâche en `non timesheeted on invoice`.

> **À trancher par Fabien.** Recommandation : **Option C** si tu vises de la flexibilité agronomique sans saturer ton arbre projets Odoo, **Option B** si tu veux un reporting client le plus visuel possible côté Odoo standard.

### 9.2 Autres paramètres

- ☐ **Toujours pré-cocher "Aussi carnet"** sur l'onglet Travaux tiers (par défaut décoché).
- ☐ **Synchroniser automatiquement les nouveaux produits avec Odoo** (par défaut coché).
- ☐ **Synchroniser automatiquement les nouveaux clients avec Odoo** (par défaut coché).
- **Unité par défaut pour rendement récolte** : t/ha | dt/ha | kg/ha | pce (selon la spécialité de l'exploitation, par défaut t/ha grandes cultures).

---

## 10. Intégration Odoo

### 10.1 Mappings

| Entité Agri Qodo | Odoo |
|---|---|
| `Product (kind=SEED/TREATMENT/FERTILIZER)` | `product.product` type=`product` (storable) |
| `Product (kind=GOOD)` | `product.product` type=`product` |
| `Product (kind=SERVICE)` | `product.product` type=`service` |
| `Partner (client tiers)` | `res.partner` |
| `Intervention (THIRD_PARTY)` → ses `InterventionProduct` | `sale.order` (brouillon mensuel) + `sale.order.line` |
| `InterventionHour` (THIRD_PARTY) | `account.analytic.line` (timesheet), selon paramètre §9.1 |
| `Intervention (HOURS_ONLY)` | `account.analytic.line` sur projet/tâche choisi |

### 10.2 Règles transverses (rappels memory)
- Connection per-tenant, jamais singleton
- `version-adapter.ts` pour multi-version v19/v20/v21+
- Resilience : queue BullMQ, l'intervention locale est toujours sauvée même si Odoo down
- Côté connecteur, `agri-qodo/odoo-client` est une fabrique (pas un singleton)

### 10.3 Sale.order — pattern facturation groupée mensuelle
- 1 brouillon par client par mois (clé `[clientId, YYYY-MM]`)
- Chaque nouvelle intervention tiers ajoute des lignes au brouillon existant
- Bouton "Facturer le mois" sur la fiche client → confirme le sale.order et génère la facture (logique séparée, hors scope de cette PR)

---

## 11. Règles métier transverses

### 11.1 Validations FE + BE
- `type = FIELD_LOG` → `parcelId` requis, `clientId` interdit
- `type = THIRD_PARTY` → `clientId` requis
- `type = HOURS_ONLY` → `projectId` + `taskId` requis, `parcelId` et `clientId` interdits
- `WorkType.category = HARVEST` → `yieldValue` requis OU `yieldDeferred = true`
- `startTime < endTime`, `breakMinutes >= 0`, `durationMinutes > 0`
- Au moins 1 produit si `WorkType.requiresProduct = true`

### 11.2 Gestion des délais phyto (TREATMENT)
- À l'enregistrement, calculer la date de fin de rentrée et la date min de récolte → afficher dans la confirmation
- Empêcher (ou au moins warner) la création d'une intervention HARVEST sur la même parcelle si on est avant la date min

### 11.3 Audit log (LPD/nFADP — backlog Mois 2)
- Toute création/modification/suppression d'intervention est loguée (qui, quand, depuis quel device)

### 11.4 Offline-first
- Sauvegarde locale (RxDB / WatermelonDB)
- Sync différentielle au retour du réseau
- En cas de conflit (même intervention modifiée sur 2 devices) : LWW + alerte explicite à l'utilisateur (cf. règle archi #7)

---

## 12. Edge cases

| Cas | Comportement attendu |
|---|---|
| Travaux tiers sur ma propre parcelle (auto-facturation interne) | Autorisé. `clientId = mon res.partner`. Le carnet champs s'écrit côté nous. |
| Travaux tiers, parcelle partenaire, partenaire pas encore inscrit Agri Qodo | Cas C dégradé : pas de carnet côté partenaire, juste sale.order côté nous. Suggérer d'inviter le partenaire (M16). |
| Création produit TREATMENT à la volée sans synchro Odoo | Produit local, utilisable en carnet. Les sale.order qui le référencent attendent une création Odoo asynchrone. |
| Récolte avec `yieldDeferred = true` | L'intervention est sauvée. Notification quotidienne tant que non rempli. Listing dédié "Rendements à saisir". |
| Heures qui chevauchent (employé déclaré 2 fois sur 2 interventions au même moment) | Warning bloquant FE, override possible si "session de formation / présence multi-tâche". |
| Intervention sans heures collaborateurs sur un travail tiers | Autorisé (forfait pur), mais badge "Aucune heure tracée — coût de revient incomplet". |
| Sale.order Odoo qui a déjà été facturé (état `done`) et on tente d'ajouter une ligne | Bloqué : créer un nouveau sale.order pour le mois courant. |
| Suppression d'une intervention déjà synchro Odoo | Soft delete + suppression de la ligne sale.order si brouillon ; sinon refus tant que le brouillon n'est pas remis en état modifiable. |

---

## 13. Plan d'implémentation

### 13.1 Ordre des étapes (estimation : 3-4 sprints)

**Sprint 1 — Schéma & API**
1. Créer branche `feat/fusion-interventions` depuis `main`
2. Migration Prisma : drop tables `Field*`, `ThirdPartyWork*`, `Timesheet*` (vides) → créer nouveau schéma §5
3. Endpoints NestJS :
   - `POST /interventions` (avec discriminator `type`)
   - `GET /interventions` (liste filtrée par type, dates, parcelle, client)
   - `GET /interventions/:id`
   - `PATCH /interventions/:id`
   - `DELETE /interventions/:id` (soft)
   - `POST /work-types` (création à la volée)
   - `POST /products` (création à la volée)
   - `POST /partners` (client à la volée)
4. Tests unitaires services + intégration Prisma
5. Tests Odoo : mock + test contractuel sale.order brouillon mensuel

**Sprint 2 — Frontend web (Next.js)**
1. Nouveau composant `<InterventionForm>` avec onglets (shadcn `Tabs`)
2. Sous-composants `<FieldLogTab>`, `<ThirdPartyTab>`, `<HoursTab>`
3. Modales création à la volée `<NewWorkTypeModal>`, `<NewProductModal>`, `<NewClientModal>`
4. Intégration HHMM input qodo-clock (composant existant)
5. Validation Zod côté client en miroir de la validation NestJS
6. Page `Réglages → Saisie interventions` avec radio des 4 options §9.1
7. Suppression des anciennes pages M2/M6/M11

**Sprint 3 — Mobile (React Native / Expo)**
1. Mêmes composants en RN avec NativeWind
2. Sync offline RxDB/WatermelonDB pour les nouveaux modèles
3. Test mode avion complet

**Sprint 4 — Polish & migration UX**
1. Renaming menu : `Interventions` (un seul item au lieu de 3)
2. Filtres dans la liste des interventions (par type, par parcelle, par client)
3. Vues : liste / kanban / calendrier (existant à brancher)
4. Export CSV avec BOM UTF-8 + `;` (helper existant)
5. Documentation utilisateur (M15) — guide "Comment saisir ma première intervention"

### 13.2 Fichiers principaux touchés (estimation)

| Fichier / package | Nature du changement |
|---|---|
| `packages/domain/prisma/schema.prisma` | Refonte modèles + migration |
| `apps/backend/src/intervention/*` (nouveau) | Service + controller + DTOs |
| `apps/backend/src/work-type/*` (nouveau) | CRUD WorkType |
| `apps/backend/src/product/*` (existant ?) | Étendre avec création à la volée + sync Odoo |
| `apps/backend/src/odoo/sale-order.adapter.ts` | Pattern brouillon mensuel groupé |
| `apps/backend/src/odoo/timesheet.adapter.ts` | Routing heures selon paramètre exploitation |
| `apps/web/app/(authenticated)/interventions/*` | Nouvelle page liste + form |
| `apps/web/components/intervention/*` (nouveau) | Form + onglets + modales |
| `apps/web/app/(authenticated)/parametres/saisie/page.tsx` (nouveau) | Réglages exploitation |
| `apps/mobile/screens/InterventionForm.tsx` (nouveau) | Form mobile |
| `apps/mobile/db/schema.ts` (WatermelonDB) | Nouveau modèle local |

### 13.3 Migration de schéma (rappel : pas de données prod)
```bash
# Côté dev
npx prisma migrate reset
# La migration drop les anciennes tables et crée les nouvelles
# Re-seed avec les jeux de démo (admin@admin.ch, demo@demo.ch, marie@ferme-rolet.test)
```

---

## 14. Critères d'acceptance

**Saisie carnet champs**
- [ ] Depuis la fiche d'une parcelle, en moins de 30 secondes, je peux saisir un semis avec densité (règle UX simplicité radicale)
- [ ] Si je choisis un type de travail "Récolte" et que je n'ai pas le rendement, je peux cocher "Saisir plus tard" et l'enregistrer
- [ ] Si je crée un nouveau type de travail "Roulage" depuis la modale ⊕, il est immédiatement utilisable et persisté pour la prochaine fois
- [ ] Si je traite avec un produit ayant un délai de rentrée, un bandeau m'affiche la date de fin de rentrée

**Saisie travaux tiers**
- [ ] Depuis la fiche d'un client tiers, en moins de 60 secondes, je peux créer un travail tiers (semis 5 ha) avec un produit semence, et un sale.order Odoo est créé/incrémenté pour le mois en cours
- [ ] Si je coche "Aussi carnet" et que la parcelle appartient à un client M16, le carnet client est en PENDING
- [ ] Aucune ligne d'heures n'apparaît sur le sale.order
- [ ] Mes heures vont au bon endroit selon le paramètre §9.1

**Saisie heures pures**
- [ ] Je peux saisir un timesheet sur projet/tâche avec heure début, fin, pause, durée
- [ ] Le format HHMM (`720` = 7h20) fonctionne
- [ ] Une ligne `account.analytic.line` apparaît dans Odoo

**Transversal**
- [ ] Je peux changer d'onglet sans perdre la date et les notes saisies
- [ ] L'app fonctionne en mode avion sur les 3 onglets, et resync au retour réseau
- [ ] Aucune occurrence de la couleur violette (charte amber)
- [ ] Audit log : chaque création/modification est loguée (qui, quand)
- [ ] Tests e2e Playwright couvrent les 3 onglets sur web

---

## 15. Questions ouvertes

1. **§9.1 Destination des heures travaux tiers** — laquelle des 4 options retenir par défaut ? (recommandation A ou C)
2. **Granularité tâche/projet** sur l'onglet Heures pures : doit-on permettre un tag analytique multi-niveaux (parcelle + culture + projet) ou rester sur projet/tâche simple ?
3. **Édition d'une intervention déjà synchro Odoo** : faut-il bloquer l'édition tant que le sale.order n'est pas en brouillon, ou autoriser et propager la modification ?
4. **Champs personnalisables par exploitation** : un viticulteur voudra ajouter "stade phénologique BBCH", un éleveur "lot animal". On prévoit un mécanisme `customFields jsonb` dès maintenant ou on attend V2 ?
5. **Multi-employés** sur une même intervention carnet (cas A) : aujourd'hui modélisé comme `InterventionHour` 1..N, mais l'UI ne le montre que sur l'onglet Tiers. Doit-on aussi le permettre sur Carnet (si je sème avec mon apprenti) ?
6. **Notification rendements en attente** : push, email, ou les deux ? Cadence ?
7. **Catalogue produits importables** : faut-il un import initial CSV des produits phyto (liste OFAG ~3000 produits) au lieu de tout créer à la volée ?

---

## Annexe — Vocabulaire métier

| Terme | Définition |
|---|---|
| Carnet des champs | Registre légal obligatoire (PER) consignant toutes les interventions sur les parcelles : semis, fertilisation, traitement, récolte. Contrôlable par l'inspection cantonale. |
| ETA | Entreprise de Travaux Agricoles. Prestataire qui réalise des travaux mécanisés pour le compte d'agriculteurs (semis, récolte, pressage, transport). |
| Travaux pour tiers | Mêmes travaux que carnet champs, mais réalisés pour un client externe → facturation. |
| Bon de commande | `sale.order` Odoo en état brouillon ou confirmé. Pas une facture. |
| Facturation groupée | Pattern : N bons de commande sur un mois → 1 facture au client en fin de mois. |
| BBCH | Échelle internationale de stades phénologiques (00 = graine sèche → 99 = récolte). |
| PER | Prestations Écologiques Requises. Cahier des charges agronomique suisse. |
| Suisse-Bilanz | Bilan azote/phosphore obligatoire en Suisse. Calculé à partir du carnet champs + cheptel. |

---

*Fin du PRD. Une fois validé, créer la branche `feat/fusion-interventions` et commencer Sprint 1.*
