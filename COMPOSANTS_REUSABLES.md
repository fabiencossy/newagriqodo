# COMPOSANTS RÉUTILISABLES — SPÉCIFICATIONS DÉTAILLÉES

**Date:** 2026-05-15  
**For:** Claude Code Phase 0 validation  
**Status:** Prêt pour validation + implémentation

---

## INTRODUCTION

Chaque composant doit être:
- ✅ Responsive (mobile XS-SM, desktop MD+)
- ✅ Accessible (WCAG AA, ARIA labels)
- ✅ Réutilisable (props clairs, pas de state global)
- ✅ TypeScript (types stricts)
- ✅ Mobile-first (design depuis mobile)

---

## 1. SEARCHBAR — Filtrage dynamique

### Purpose
Barre de recherche + filtres pour toutes les listes (parcelles, troupeau, travaux).

### Props
```typescript
interface SearchBarProps {
  placeholder?: string;              // "Rechercher parcelles..."
  value: string;                     // Controlled input
  onChange: (value: string) => void;
  onFilterChange?: (filters: any) => void;
  filters?: FilterConfig[];          // Available filters
  showAdvanced?: boolean;            // Show/hide advanced section
  debounceMs?: number;               // Default 300ms
}

interface FilterConfig {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'range';
  options?: { label: string; value: any }[];
}
```

### Behavior
```
┌─────────────────────────────────────┐
│ 🔍 [Rechercher...]        [Advanced v] │  ← Desktop
├─────────────────────────────────────┤
│ Culture: [dropdown] Status: [toggle] │
└─────────────────────────────────────┘

Mobile (stacked):
┌──────────────────┐
│ 🔍 [Search...]   │  ← Full width
├──────────────────┤
│ [Advanced ▼]     │
└──────────────────┘
```

### Features
- Real-time search (debounced 300ms)
- Advanced filters toggle (collapse/expand)
- Clear button (reset all filters)
- Filter pills (show active filters)
- Accessible: ARIA labels, keyboard navigation

---

## 2. VIEWSWITCHER — Toggle views

### Purpose
Switch between Table / Map / Dashboard views for same data.

### Props
```typescript
interface ViewSwitcherProps {
  views: ('table' | 'map' | 'dashboard')[];
  activeView: 'table' | 'map' | 'dashboard';
  onChange: (view: string) => void;
  disabled?: boolean;
}
```

### Behavior
```
Desktop:
┌─ TABLE ── MAP ── DASHBOARD ─┐
│ [TABLE]  [map]  [dashboard] │  ← Buttons
└─────────────────────────────┘

Mobile:
┌─ [TABLE] ▼ ─┐
│ table        │
│ map          │
│ dashboard    │
└──────────────┘
```

### Features
- Icon + label
- Active state (background #2d5016)
- Tooltip on hover (mobile: long-press)
- Accessible: ARIA roles

---

## 3. MAPVIEW — Parcelles sur carte

### Purpose
Interactive map showing parcelles (parcels) with satellite background.

### Props
```typescript
interface MapViewProps {
  parcels: Parcel[];                     // GeoJSON geometries
  selectedId?: string;
  onSelect: (parcelId: string) => void;
  onCreateNew?: (geometry: GeoJSON) => void;
  zoom?: number;
  center?: [lng, lat];
  basemap?: 'satellite' | 'street';     // Default satellite
  interactive?: boolean;                 // Allow click/draw
}

interface Parcel {
  id: string;
  name: string;
  geometry: GeoJSON;                    // Polygon
  surface_ha: number;
  culture?: string;
  color?: string;                       // Optional custom color
}
```

### Behavior
```
Desktop:
┌──────────────────────────────────┐
│ [Map with parcels + sidebar]      │
│ ┌─────────────────┐ ┌──────────┐ │
│ │ [Map]           │ │ Details  │ │  ← Aside panel 40% width
│ │ [Parcels drawn] │ │ PF-001   │ │
│ │ [Click to zoom] │ │ 2.5 ha   │ │
│ └─────────────────┘ └──────────┘ │
└──────────────────────────────────┘

Mobile (Fullscreen):
┌──────────────────────────────────┐
│ [Map fullscreen]                 │
│ [FAB + button (bottom right)]     │
│ [Swipe up → details panel]        │
└──────────────────────────────────┘
```

### Features
- Satellite basemap (Maplibre GL self-hosted tiles)
- Click parcel → select + show aside
- Zoom/pan/rotate
- FAB button to create new
- Mobile: fullscreen map, bottom sheet on parcel select
- Desktop: aside panel 40% width
- Color coding (optional): by culture or status
- Accessible: keyboard navigation, screen reader labels

---

## 4. EXPORTBUTTON — PDF/CSV/Excel export

### Purpose
Export list/table data in multiple formats.

### Props
```typescript
interface ExportButtonProps {
  data: any[];                      // Table rows
  filename: string;                 // Base filename (no extension)
  formats?: ('pdf' | 'csv' | 'xlsx')[];  // Default all
  columns?: string[];               // Column IDs to export (all if empty)
  title?: string;                   // For PDF header
  subtitle?: string;                // Optional
  filters?: any;                    // Metadata for PDF
}
```

### Behavior
```
┌─ [Download v] ─┐
│ Download PDF   │  ← Click to export
│ Download CSV   │
│ Download Excel │
└────────────────┘

Or single button if only one format:
[↓ Download]
```

### Features
- Multi-format: PDF (pretty), CSV (raw), Excel (formulas)
- Column selection (which columns to include)
- Filename auto-generated: "Parcelles_2026-05-15.csv"
- PDF includes: logo, title, filters applied, timestamp
- CSV: proper escaping, BOM for Excel compatibility
- Excel: structured with formulas if needed
- Accessible: button with aria-label

**Libraries:**
- PDF: pdfkit or jspdf
- CSV: papaparse
- Excel: exceljs

---

## 5. TIMESHEETENTRY — Ultra-simple form

### Purpose
Quick entry for hours worked (linked or standalone).

### Props
```typescript
interface TimesheetEntryProps {
  onSubmit: (entry: TimesheetEntryInput) => Promise<void>;
  interventionId?: string;           // If linked to intervention
  mode?: 'standalone' | 'linked';   // Default standalone
  defaultDate?: Date;                // Today if empty
  loading?: boolean;
}

interface TimesheetEntryInput {
  date: Date;
  hoursWorked: number;              // Decimal: 2.5 = 2h30m
  projectType: 'Parcellaire' | 'Travaux' | 'Troupeau' | 'RH';
  interventionId?: string;           // If linked
  notes?: string;                    // Optional
}
```

### Behavior
```
Desktop:
┌────────────────────────────────┐
│ Saisir Heures                  │
├────────────────────────────────┤
│ Date:     [pick date → today]  │
│ Heures:   [2.5] (HH:MM format) │
│ Travail:  [Parcellaire ▼]      │
│ Intervention: [search optional]│
│                                │
│ [Sauvegarder] [Annuler]        │
└────────────────────────────────┘

Mobile (stacked):
Same layout, full width inputs
```

### Features
- Date picker (default today)
- Hours input: HH:MM format auto-converts to decimal (2:30 → 2.5)
- Dropdown project type
- Optional intervention search (autocomplete)
- Auto-save confirmation: "✓ Présence créée dans Odoo"
- Error handling: show retry button if Odoo sync fails
- Accessible: labels, error messages, keyboard support

---

## 6. HOURSTABLEMONTH — Tableau bilan heures par mois

### Purpose
Show monthly hours worked vs hours due, with running balance.

### Props
```typescript
interface HoursTableMonthProps {
  employeeId: string;              // Fetch data from DB
  year?: number;                    // Default current year
  data?: HoursData[];              // Or provide directly
}

interface HoursData {
  month: number;                    // 1-12
  monthName: string;                // "Janvier"
  hoursWorked: number;              // Total hours entered
  hoursDue: number;                 // Contractual hours
  balance: number;                  // hoursWorked - hoursDue (+/-)
  leavesTaken?: number;             // For info
}
```

### Behavior
```
┌────────────────────────────────────────┐
│ Bilan Heures 2026                      │
├────────────────────────────────────────┤
│ Mois       │ Travaillées │ Dues │ Solde│
├────────────┼─────────────┼──────┼─────┤
│ Janvier    │    150h     │ 145h │ +5h │
│ Février    │    142h     │ 140h │ +2h │
│ Mars       │    145h     │ 145h │  0h │
│ Avril      │    148h     │ 145h │ +3h │
│ Mai        │    152h     │ 147h │ +5h │
├────────────┼─────────────┼──────┼─────┤
│ YTD TOTAL  │    737h     │ 722h │+15h │
└────────────────────────────────────────┘

Color coding:
- Balance +: green
- Balance -: orange/red
- Balance 0: neutral
```

### Features
- Real-time calculation from DB
- Monthly breakdown (Jan → current month)
- YTD total row
- Color coding (positive/negative/neutral)
- Sortable (month, balance)
- Responsive: stacked on mobile
- Accessible: table headers, summary

---

## 7. LEAVEREQUESTLIST — Liste congés read-only

### Purpose
Display leave requests synced from Odoo (read-only in app).

### Props
```typescript
interface LeaveRequestListProps {
  employeeId: string;               // Fetch from DB
  status?: 'all' | 'pending' | 'approved' | 'rejected'; // Filter
  onViewDetails?: (id: string) => void;
}

interface LeaveRequest {
  id: string;
  dateFrom: Date;
  dateTo: Date;
  days: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  approvedBy?: string;
}
```

### Behavior
```
┌──────────────────────────────────────────┐
│ Mes Congés                               │
├──────────────────────────────────────────┤
│ [All] [Pending] [Approved] [Rejected]   │  ← Filters
├──────────────────────────────────────────┤
│ 15-30 May 2026           │ Approved │    │
│ Summer holidays          │ 10 days  │    │
│                                          │
│ 01 June - 07 June 2026   │ Pending  │    │
│ Conference attendance    │ 5 days   │    │
│                                          │
│ 12-14 Aug 2026           │ Rejected │    │
│ Personal                 │ 3 days   │    │
└──────────────────────────────────────────┘

Mobile: Card view (stacked)
```

### Features
- Read-only (no create/edit in app)
- Status badges (color-coded)
- Date range display
- Filter by status
- Show remaining days this year (at top)
- Accessible: labels, status indicators

---

## 8. ASIDECARD — Detail panel

### Purpose
Show detailed info when item selected (from map/table).

### Props
```typescript
interface AsideCardProps {
  title: string;
  data: any;                         // Item details
  fields: FieldConfig[];             // Which fields to show
  editMode?: boolean;                // If editable
  onClose: () => void;
  onSave?: (data: any) => Promise<void>;
  loading?: boolean;
  width?: string;                    // Default 40% desktop, full mobile
}

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'readonly';
  readonly?: boolean;
  options?: any[];
}
```

### Behavior
```
Desktop:
┌─────────────────────┬──────────────────┐
│ [Map/Table]         │ [Panel 40%]      │
│                     │ ┌──────────────┐ │
│                     │ │ [X] Title    │ │
│                     │ ├──────────────┤ │
│                     │ │ Field 1: val │ │
│                     │ │ Field 2: val │ │
│                     │ │ Field 3: val │ │
│                     │ ├──────────────┤ │
│                     │ │ [Edit] [←]   │ │
│                     │ └──────────────┘ │
└─────────────────────┴──────────────────┘

Mobile:
┌──────────────────────────┐
│ [Content]                │
│                          │
├──────────────────────────┤
│ [Swipe up ↑]             │
├──────────────────────────┤
│ [← Back] Title           │
│ ┌──────────────────────┐ │
│ │ Field 1: val         │ │
│ │ Field 2: val         │ │
│ │ [Edit] [×]           │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

### Features
- Desktop: fixed right panel 40% width
- Mobile: bottom sheet (swipe up/down)
- Show/hide with animation
- Edit mode toggle (if editable)
- Read-only mode default
- Close button (X or swipe down mobile)
- Back button for mobile
- Accessible: focus management, ARIA roles

---

## VALIDATION CHECKLIST (For Each Component)

### Design & UX
- [ ] Wireframe mockup created
- [ ] Mobile layout verified (XS-SM)
- [ ] Desktop layout verified (MD+)
- [ ] Touch targets >= 44px (mobile)
- [ ] Colors accessible (contrast >= 4.5:1)

### Code
- [ ] TypeScript types defined
- [ ] Props interface documented
- [ ] Default values set
- [ ] Edge cases handled (empty data, loading, error)
- [ ] No console warnings

### Accessibility
- [ ] WCAG AA level
- [ ] ARIA labels present
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] Form fields labeled

### Performance
- [ ] Render time < 200ms
- [ ] No unnecessary re-renders
- [ ] Handles large datasets (pagination/virtualization if needed)
- [ ] Debounced inputs (search, etc.)

### Testing
- [ ] Unit tests (Jest/Vitest)
- [ ] Visual regression tests (Percy)
- [ ] Integration tests (Cypress)
- [ ] Mobile tests (responsive design)

---

## QUESTIONS POUR CLAUDE CODE

**Avant implémentation, clarifier:**

1. **SearchBar**: Quels filtres par défaut (par module: Parcellaire vs Travaux)?
2. **MapView**: Tiles source (Maplibre GL self-hosted ou external)?
3. **ExportButton**: PDF styling (logo, colors)? Excel with formulas ou raw data?
4. **TimesheetEntry**: Validation rules pour hours (max/min)? Allow past dates?
5. **HoursTableMonth**: Fetch from DB ou passed as prop? Real-time calculation ou cached?
6. **LeaveRequestList**: Show manager notes ou hidden from employee?
7. **AsideCard**: Custom styling per module ou consistent? Animation speed?

---

**Status:** ✅ READY FOR VALIDATION  
**Next:** Claude Code reviews + proposes implementation order

