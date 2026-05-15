# PRISMA.MD — DATA MODELS NEWAGRIQDODO V2

**Date:** 2026-05-15  
**ORM:** Prisma (PostgreSQL)  
**Format:** Prisma schema syntax

---

## SCHEMA COMPLET

```prisma
// ============================================================================
// AUTH & MULTI-TENANCY
// ============================================================================

model User {
  id                String   @id @default(cuid())
  email             String   @unique
  passwordHash      String
  firstName         String?
  lastName          String?
  phoneNumber       String?
  profilePicture    String?  // URL
  
  // Multi-tenancy
  userFarms         UserFarm[]
  currentFarmId     String?  // Quick access current farm
  
  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  deletedAt         DateTime?
  
  @@index([email])
}

model Farm {
  id                String   @id @default(cuid())
  name              String   // ex: "Cossy & Cie SARL"
  cantonNumber      String   @unique // Numéro cantonal agriculteur suisse (KEY!)
  address           String?
  city              String?
  zipCode           String?
  country           String   @default("CH")
  
  // Agricultural programs
  isSRPA            Boolean  @default(false) // Surfaces Rétribution Prestations Env
  isSST             Boolean  @default(false) // Système Suivi Terroir
  isBio             Boolean  @default(false) // Agriculture biologique
  
  // Contact
  contactName       String?
  contactEmail      String?
  contactPhone      String?
  
  // Odoo
  odooPartnerId     Int?     // Link to Odoo partner
  odooLastSyncAt    DateTime?
  
  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  deletedAt         DateTime?
  
  // Relations
  users             UserFarm[]
  parcels           Parcel[]
  cultures          Culture[]
  interventions     Intervention[]
  fertiBalance      FertilizerBalance[]
  assolementPlans   AssolementPlan[]
  animals           Animal[]
  phytoProducts     PhytoProduct[]
  
  @@index([cantonNumber])
  @@index([odooPartnerId])
}

model UserFarm {
  id                String   @id @default(cuid())
  userId            String
  farmId            String
  role              String   @default("Editor") // Editor, Viewer, Admin
  
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  farm              Farm     @relation(fields: [farmId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([userId, farmId])
  @@index([userId])
  @@index([farmId])
}

// ============================================================================
// PARCELS & GEOGRAPHY
// ============================================================================

model Parcel {
  id                String   @id @default(cuid())
  farmId            String
  
  // Identity
  name              String   // ex: "PF-2024-001"
  cadastralNumber   String?  // Numéro cadastre suisse (ex: "2683.123.4567")
  
  // Geography
  geometry          Json     // GeoJSON Polygon/MultiPolygon
  surfaceHa         Decimal  @db.Decimal(10, 2) // cached/computed from geom
  
  // Metadata
  ownerName         String?
  renterName        String?
  accessNotes       String?  // Plan d'accès libre (texte)
  otherNotes        String?
  
  // Photo/attachments (v2+)
  photoUrl          String?
  
  // Relations
  farm              Farm     @relation(fields: [farmId], references: [id], onDelete: Cascade)
  cultures          ParcelCulture[]
  interventions     Intervention[]
  fertiBalance      FertilizerBalance[]
  assolementPlans   AssolementPlan[]
  pointsOfInterest  PointOfInterest[]
  
  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  deletedAt         DateTime?
  syncedToOdooAt    DateTime?
  
  @@index([farmId])
  @@index([cadastralNumber])
}

model PointOfInterest {
  id                String   @id @default(cuid())
  parcelId          String
  
  type              String   // "borne", "regard", "piquet", "autre"
  latitude          Decimal  @db.Decimal(10, 8)
  longitude         Decimal  @db.Decimal(11, 8)
  description       String?
  
  parcel            Parcel   @relation(fields: [parcelId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([parcelId])
}

// ============================================================================
// CULTURES & CROP MANAGEMENT
// ============================================================================

model Culture {
  id                String   @id @default(cuid())
  farmId            String
  
  // Identity
  name              String   // ex: "Colza", "Blé"
  odooArticleId     Int?     // Link to Odoo article
  odooArticleTag    String?  // ex: "agriculture" tag in Odoo
  
  // Agricultural properties
  cycleStartMonth   Int?     // 1-12 (Janvier - Décembre)
  cycleEndMonth     Int?
  defaultYield      Decimal? @db.Decimal(10, 2) // kg/ha reference
  
  // Fertilizer requirements (templates)
  nitrogenNeedKgHa  Decimal? @db.Decimal(10, 2)
  phosphorNeedKgHa  Decimal? @db.Decimal(10, 2)
  potassiumNeedKgHa Decimal? @db.Decimal(10, 2)
  
  // Relations
  farm              Farm     @relation(fields: [farmId], references: [id], onDelete: Cascade)
  parcelCultures    ParcelCulture[]
  assolementPlans   AssolementPlan[]
  phytoProducts     PhytoProduct[]
  
  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  deletedAt         DateTime?
  
  @@unique([farmId, name])
  @@index([farmId])
  @@index([odooArticleId])
}

model ParcelCulture {
  id                String   @id @default(cuid())
  parcelId          String
  cultureId         String
  
  // Dates
  sowingDate        DateTime?
  harvestDate       DateTime?
  year              Int      // Crop year
  
  // Status
  status            String   @default("planned") // planned, active, harvested
  
  // Relations
  parcel            Parcel   @relation(fields: [parcelId], references: [id], onDelete: Cascade)
  culture           Culture  @relation(fields: [cultureId], references: [id], onDelete: Restrict)
  
  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([parcelId, cultureId, year])
  @@index([parcelId])
  @@index([cultureId])
}

// ============================================================================
// FIELD WORK & INTERVENTIONS
// ============================================================================

model Intervention {
  id                String   @id @default(cuid())
  farmId            String
  parcelId          String
  cultureId         String?  // Current culture on parcel
  
  // Type
  interventionType  String   // "labour", "semis", "épandage", "pulvérisation", "récolte", "autre"
  date              DateTime
  
  // Quantity (bimodal: kilo OR kilo/hectare)
  quantityKilo      Decimal? @db.Decimal(15, 2) // Total quantity in kg
  quantityKgHa      Decimal? @db.Decimal(10, 2) // kg/hectare (if relevant)
  unit              String?  // "kg", "kilo/hectare" (used for display)
  
  // Product (phytosanitary)
  phytoProductId    String?  // FK PhytoProduct
  productQuantity   String?  // ex: "5 L", "2 kg"
  
  // Notes
  notes             String?
  
  // Operator
  operatorName      String?
  
  // Relations
  farm              Farm     @relation(fields: [farmId], references: [id], onDelete: Cascade)
  parcel            Parcel   @relation(fields: [parcelId], references: [id], onDelete: Cascade)
  phytoProduct      PhytoProduct? @relation(fields: [phytoProductId], references: [id], onDelete: SetNull)
  
  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  deletedAt         DateTime?
  
  @@index([farmId])
  @@index([parcelId])
  @@index([phytoProductId])
  @@index([date])
}

// ============================================================================
// PHYTOSANITARY PRODUCTS
// ============================================================================

model PhytoProduct {
  id                String   @id @default(cuid())
  farmId            String
  
  name              String   // ex: "Glyphosate 360"
  homologationNum   String   // ex: "CHE-12345-ABC" (Swiss registration)
  
  // Odoo link
  odooProductId     Int?
  odooProductCode   String?
  
  // Delai d'attente (hours before harvest allowed)
  delaiAttente      Int?     // Jours (délai standard)
  delaiSRPA         Int?     // Délai si SRPA applicable
  delaiSwissGap     Int?     // Délai si Swiss Gap
  delaiBio          Int?     // Bio products (should be null)
  
  // Status
  isActive          Boolean  @default(true)
  
  // Relations
  farm              Farm     @relation(fields: [farmId], references: [id], onDelete: Cascade)
  cultures          Culture[] // Many-to-many via implicit relation
  interventions     Intervention[]
  
  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  syncedFromOdooAt  DateTime?
  
  @@unique([farmId, homologationNum])
  @@index([farmId])
  @@index([homologationNum])
  @@index([odooProductId])
}

// ============================================================================
// FERTILIZER BALANCE (Bilan de fumure)
// ============================================================================

model FertilizerBalance {
  id                String   @id @default(cuid())
  farmId            String
  parcelId          String
  cultureId         String?
  year              Int      // Fiscal year
  
  // NITROGEN (Azote)
  nitrogenApportKg  Decimal  @db.Decimal(15, 2) @default(0)
  nitrogenExportKg  Decimal  @db.Decimal(15, 2) @default(0)
  nitrogenBalanceKg Decimal  @db.Decimal(15, 2) @default(0) // apport - export
  nitrogenStatus    String   @default("vert") // "vert", "orange", "rouge"
  
  // PHOSPHOR (Phosphore)
  phosphorApportKg  Decimal  @db.Decimal(15, 2) @default(0)
  phosphorExportKg  Decimal  @db.Decimal(15, 2) @default(0)
  phosphorBalanceKg Decimal  @db.Decimal(15, 2) @default(0)
  phosphorStatus    String   @default("vert")
  
  // POTASSIUM (Potasse)
  potassiumApportKg Decimal  @db.Decimal(15, 2) @default(0)
  potassiumExportKg Decimal  @db.Decimal(15, 2) @default(0)
  potassiumBalanceKg Decimal @db.Decimal(15, 2) @default(0)
  potassiumStatus   String   @default("vert")
  
  // Calculation metadata
  lastCalculatedAt  DateTime?
  calculationNote   String?  // Explanation of sources
  
  // Relations
  farm              Farm     @relation(fields: [farmId], references: [id], onDelete: Cascade)
  parcel            Parcel   @relation(fields: [parcelId], references: [id], onDelete: Cascade)
  
  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([farmId, parcelId, year])
  @@index([farmId])
  @@index([parcelId])
  @@index([year])
}

// ============================================================================
// CROP ROTATION PLANNING (Plan d'assolement)
// ============================================================================

model AssolementPlan {
  id                String   @id @default(cuid())
  farmId            String
  parcelId          String
  cultureId         String
  year              Int
  
  // Period
  startDate         DateTime // Ex: 2026-01-01
  endDate           DateTime // Ex: 2026-12-31
  
  // Status
  isActive          Boolean  @default(false) // Actual vs. planned
  
  // Relations
  farm              Farm     @relation(fields: [farmId], references: [id], onDelete: Cascade)
  parcel            Parcel   @relation(fields: [parcelId], references: [id], onDelete: Cascade)
  culture           Culture  @relation(fields: [cultureId], references: [id], onDelete: Restrict)
  
  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([parcelId, year, startDate])
  @@index([farmId])
  @@index([parcelId])
  @@index([year])
}

// ============================================================================
// LIVESTOCK (Troupeau - Module add-on)
// ============================================================================

model Animal {
  id                String   @id @default(cuid())
  farmId            String
  
  // Identity
  earTag            String?  // Ear tag number
  name              String?  // Optional name
  
  // Type & breed
  animalType        String   // "bovin", "porcin", "ovin", "équidé", "volaille"
  breed             String?  // Race
  
  // Dates
  birthDate         DateTime
  deathDate         DateTime?
  
  // Current status
  status            String   @default("present") // "present", "sold", "died"
  quantity          Int      @default(1) // For herd/flocks
  
  // Relations
  farm              Farm     @relation(fields: [farmId], references: [id], onDelete: Cascade)
  events            AnimalEvent[]
  
  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  deletedAt         DateTime?
  
  @@index([farmId])
  @@index([birthDate])
}

model AnimalEvent {
  id                String   @id @default(cuid())
  animalId          String
  
  eventType         String   // "birth", "entry", "exit", "sale", "death", "medical"
  date              DateTime
  quantity          Int      @default(1)
  notes             String?
  
  animal            Animal   @relation(fields: [animalId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([animalId])
  @@index([date])
}

// ============================================================================
// AGRICULTURAL WORK (Module add-on) - Simple version
// ============================================================================

model AgriculturalWork {
  id                String   @id @default(cuid())
  farmId            String
  parcelId          String
  
  // Work description
  workType          String   // "labour", "seeding", "harvesting", etc.
  description       String?
  date              DateTime
  
  // Client/Contractor
  clientId          String?  // Odoo partner ID
  clientName        String?
  
  // Cost (for invoicing)
  costChf           Decimal? @db.Decimal(15, 2)
  invoiced          Boolean  @default(false)
  invoiceDate       DateTime?
  
  // Status
  status            String   @default("pending") // pending, completed, invoiced
  
  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([farmId])
  @@index([parcelId])
  @@index([date])
}

// ============================================================================
// ODOO SYNC TRACKING
// ============================================================================

model OdooSyncLog {
  id                String   @id @default(cuid())
  
  // What was synced
  entityType        String   // "culture", "phytoProduct", "partner", etc.
  entityId          String   // Odoo ID or NewagriQodo ID
  
  // Direction & status
  direction         String   // "odoo_to_agri", "agri_to_odoo"
  status            String   // "success", "failed", "pending_retry"
  
  // Error handling
  errorMessage      String?
  retryCount        Int      @default(0)
  nextRetryAt       DateTime?
  
  // Webhook metadata
  webhookId         String?  // Odoo webhook ID for tracking
  payload           Json?    // Store payload for debugging
  
  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([entityType])
  @@index([status])
  @@index([createdAt])
}

// ============================================================================
// AUDIT & CHANGES
// ============================================================================

model AuditLog {
  id                String   @id @default(cuid())
  farmId            String?  // Context farm
  userId            String?  // Who made change
  
  // Change metadata
  action            String   // "create", "update", "delete"
  entityType        String   // "parcel", "intervention", etc.
  entityId          String
  
  // What changed
  oldValue          Json?
  newValue          Json?
  
  // Context
  ipAddress         String?
  userAgent         String?
  
  createdAt         DateTime @default(now())
  
  @@index([farmId])
  @@index([userId])
  @@index([entityType])
  @@index([createdAt])
}
```

---

## INDEXES À CRÉER MANUELLEMENT (Perf critique)

```sql
-- Search performance
CREATE INDEX idx_parcel_farm_search 
  ON parcel(farm_id, name) 
  WHERE deleted_at IS NULL;

CREATE INDEX idx_intervention_farm_date 
  ON intervention(farm_id, date DESC) 
  WHERE deleted_at IS NULL;

-- Sorting/filtering
CREATE INDEX idx_user_farm_role 
  ON user_farm(farm_id, role);

-- Geo queries (PostGIS)
CREATE INDEX idx_parcel_geom 
  ON parcel USING GIST(geometry);
```

---

## UNIQUE CONSTRAINTS À RESPECTER

1. `User.email` → pas 2 accounts même email
2. `Farm.cantonNumber` → identifiant unique agriculteur suisse
3. `UserFarm.userId + farmId` → pas 2 relations utilisateur-farm
4. `ParcelCulture.parcelId + cultureId + year` → pas 2 cultures même parcelle même année
5. `Culture.farmId + name` → pas 2 cultures même nom par farm
6. `PhytoProduct.farmId + homologationNum` → pas 2 produits même homologation
7. `FertilizerBalance.farmId + parcelId + year` → max 1 bilan par parcelle/année
8. `AssolementPlan.parcelId + year + startDate` → pas overlap planification

---

## MIGRATION PATH v1 → v2

If coming from v1:
```typescript
// script/migrate-v1-to-v2.ts
// 1. Create new Farm + User + UserFarm relations
// 2. Map old Parcel → new Parcel (keep geometry)
// 3. Map old Intervention → new Intervention (handle bimodal quantity)
// 4. Create initial Culture types
// 5. Validate data integrity (no NaN balances, etc.)
```

---

**FIN PRISMA.md**

Schema ready for Prisma `npx prisma db push` or migrations.
All relations properly configured for scalability.
