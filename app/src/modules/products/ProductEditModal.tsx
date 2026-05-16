import { useState } from 'react';
import { addProduct, updateProduct } from './products.store';
import type {
  FertilizerCategory,
  FertilizerProduct,
  PhytoCategory,
  PhytoProduct,
  Product,
  ProductType,
  SeedProduct,
} from './products.types';

interface ProductEditModalProps {
  /** Si fourni avec id : édition. Sinon : création. */
  initial?: Partial<Product>;
  /** Type fixe (depuis l'onglet courant). */
  defaultType?: ProductType;
  onClose: () => void;
}

const TYPE_LABELS: Record<ProductType, string> = {
  phyto: 'Produit phytosanitaire',
  fertilizer: 'Engrais / amendement',
  seed: 'Semence',
};

const PHYTO_CATEGORIES: PhytoCategory[] = [
  'herbicide',
  'fungicide',
  'insecticide',
  'growth-regulator',
  'molluscicide',
  'other',
];
const PHYTO_LABELS: Record<PhytoCategory, string> = {
  herbicide: 'Herbicide',
  fungicide: 'Fongicide',
  insecticide: 'Insecticide',
  'growth-regulator': 'Régulateur de croissance',
  molluscicide: 'Molluscicide',
  other: 'Autre',
};

const FERT_CATEGORIES: FertilizerCategory[] = ['mineral', 'organic', 'amendment'];
const FERT_LABELS: Record<FertilizerCategory, string> = {
  mineral: 'Minéral',
  organic: 'Organique',
  amendment: 'Amendement',
};

export function ProductEditModal({ initial, defaultType, onClose }: ProductEditModalProps) {
  const isExisting = Boolean(initial?.id);
  const [type, setType] = useState<ProductType>(
    (initial?.type as ProductType | undefined) ?? defaultType ?? 'phyto',
  );

  // Champs partagés
  const [name, setName] = useState(initial?.name ?? '');
  const [manufacturer, setManufacturer] = useState(initial?.manufacturer ?? '');
  const [active, setActive] = useState(initial?.active ?? true);

  // Phyto
  const phytoInit = initial?.type === 'phyto' ? (initial as PhytoProduct) : undefined;
  const [phytoCategory, setPhytoCategory] = useState<PhytoCategory>(
    phytoInit?.category ?? 'herbicide',
  );
  const [ofagNumber, setOfagNumber] = useState(phytoInit?.ofagNumber ?? '');
  const [activeSubstance, setActiveSubstance] = useState(phytoInit?.activeSubstance ?? '');
  const [withholdingDays, setWithholdingDays] = useState<number | ''>(
    phytoInit?.withholdingDays ?? '',
  );

  // Fertilizer
  const fertInit = initial?.type === 'fertilizer' ? (initial as FertilizerProduct) : undefined;
  const [fertCategory, setFertCategory] = useState<FertilizerCategory>(
    fertInit?.category ?? 'mineral',
  );
  const [nPerUnit, setNPerUnit] = useState<number | ''>(fertInit?.nPerUnit ?? '');
  const [pPerUnit, setPPerUnit] = useState<number | ''>(fertInit?.pPerUnit ?? '');
  const [kPerUnit, setKPerUnit] = useState<number | ''>(fertInit?.kPerUnit ?? '');

  // Seed
  const seedInit = initial?.type === 'seed' ? (initial as SeedProduct) : undefined;
  const [cropName, setCropName] = useState(seedInit?.cropName ?? '');
  const [varietyName, setVarietyName] = useState(seedInit?.varietyName ?? '');
  const [certified, setCertified] = useState(seedInit?.certified ?? true);

  // Dose commune
  const [defaultDoseUnit, setDefaultDoseUnit] = useState(
    initial && 'defaultDoseUnit' in initial && initial.defaultDoseUnit
      ? initial.defaultDoseUnit
      : 'kg/ha',
  );
  const [defaultDoseValue, setDefaultDoseValue] = useState<number | ''>(
    initial && 'defaultDoseValue' in initial && typeof initial.defaultDoseValue === 'number'
      ? initial.defaultDoseValue
      : '',
  );

  const submit = () => {
    if (!name.trim()) return;
    const id = initial?.id ?? `${type.slice(0, 3).toUpperCase()}-${Date.now()}`;
    const base = {
      id,
      name: name.trim(),
      manufacturer: manufacturer.trim() || undefined,
      active,
    };
    let product: Product;
    if (type === 'phyto') {
      product = {
        ...base,
        type: 'phyto',
        category: phytoCategory,
        ofagNumber: ofagNumber.trim(),
        activeSubstance: activeSubstance.trim(),
        withholdingDays: typeof withholdingDays === 'number' ? withholdingDays : 0,
        defaultDoseUnit,
        defaultDoseValue: typeof defaultDoseValue === 'number' ? defaultDoseValue : undefined,
      };
    } else if (type === 'fertilizer') {
      product = {
        ...base,
        type: 'fertilizer',
        category: fertCategory,
        nPerUnit: typeof nPerUnit === 'number' ? nPerUnit : 0,
        pPerUnit: typeof pPerUnit === 'number' ? pPerUnit : 0,
        kPerUnit: typeof kPerUnit === 'number' ? kPerUnit : 0,
        defaultDoseUnit,
      };
    } else {
      product = {
        ...base,
        type: 'seed',
        cropName: cropName.trim(),
        varietyName: varietyName.trim(),
        certified,
        defaultDoseUnit,
        defaultDoseValue: typeof defaultDoseValue === 'number' ? defaultDoseValue : undefined,
      };
    }
    if (isExisting && initial?.id) {
      updateProduct(initial.id, product);
    } else {
      addProduct(product);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/40 backdrop-blur-sm md:items-center md:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isExisting ? 'Modifier produit' : 'Nouveau produit'}
        className="flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-(--radius-lg) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-popup) md:max-w-[560px] md:rounded-(--radius-lg)"
      >
        <header className="flex items-center gap-2 border-b border-(--color-border) px-4 py-3">
          <h2 className="m-0 text-sm font-semibold">
            {isExisting ? 'Modifier produit' : 'Nouveau produit'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-(--radius-sm) text-(--color-muted) hover:bg-[#f1f1ee] hover:text-(--color-text)"
          >
            <CloseIcon />
          </button>
        </header>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {/* Type (verrouillé en édition pour éviter incohérences) */}
          <Field label="Type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ProductType)}
              disabled={isExisting}
              className={inputClass}
            >
              {(Object.keys(TYPE_LABELS) as ProductType[]).map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Nom commercial">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Adexar"
              autoFocus
              className={inputClass}
            />
          </Field>

          <Field label="Fabricant">
            <input
              type="text"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              placeholder="Ex. BASF"
              className={inputClass}
            />
          </Field>

          {/* Champs phyto */}
          {type === 'phyto' && (
            <>
              <Field label="Catégorie phyto">
                <select
                  value={phytoCategory}
                  onChange={(e) => setPhytoCategory(e.target.value as PhytoCategory)}
                  className={inputClass}
                >
                  {PHYTO_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {PHYTO_LABELS[c]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="N° homologation OFAG">
                <input
                  type="text"
                  value={ofagNumber}
                  onChange={(e) => setOfagNumber(e.target.value)}
                  placeholder="Ex. W-7239"
                  className={inputClass}
                />
              </Field>
              <Field label="Substance active">
                <input
                  type="text"
                  value={activeSubstance}
                  onChange={(e) => setActiveSubstance(e.target.value)}
                  placeholder="Ex. Fluxapyroxad + Epoxiconazole"
                  className={inputClass}
                />
              </Field>
              <Field label="Délai d'attente avant récolte (jours)">
                <input
                  type="number"
                  value={withholdingDays}
                  onChange={(e) => setWithholdingDays(e.target.value ? Number(e.target.value) : '')}
                  className={inputClass}
                />
              </Field>
            </>
          )}

          {/* Champs engrais */}
          {type === 'fertilizer' && (
            <>
              <Field label="Catégorie engrais">
                <select
                  value={fertCategory}
                  onChange={(e) => setFertCategory(e.target.value as FertilizerCategory)}
                  className={inputClass}
                >
                  {FERT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {FERT_LABELS[c]}
                    </option>
                  ))}
                </select>
              </Field>
              <p className="m-0 text-[11px] text-(--color-muted)">
                Composition en kg d'élément par unité de dose (cf. <code>defaultDoseUnit</code>).
                Ex. Ammonitrate 27% → 0.27 kg N/kg ; Lisier bovin → 4.5 kg N/m³.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <Field label="N / unité">
                  <input
                    type="number"
                    step="0.01"
                    value={nPerUnit}
                    onChange={(e) => setNPerUnit(e.target.value ? Number(e.target.value) : '')}
                    className={inputClass}
                  />
                </Field>
                <Field label="P₂O₅ / unité">
                  <input
                    type="number"
                    step="0.01"
                    value={pPerUnit}
                    onChange={(e) => setPPerUnit(e.target.value ? Number(e.target.value) : '')}
                    className={inputClass}
                  />
                </Field>
                <Field label="K₂O / unité">
                  <input
                    type="number"
                    step="0.01"
                    value={kPerUnit}
                    onChange={(e) => setKPerUnit(e.target.value ? Number(e.target.value) : '')}
                    className={inputClass}
                  />
                </Field>
              </div>
            </>
          )}

          {/* Champs semence */}
          {type === 'seed' && (
            <>
              <Field label="Culture">
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="Ex. Blé d'automne"
                  className={inputClass}
                />
              </Field>
              <Field label="Variété">
                <input
                  type="text"
                  value={varietyName}
                  onChange={(e) => setVarietyName(e.target.value)}
                  placeholder="Ex. Arnold"
                  className={inputClass}
                />
              </Field>
              <Field label="Certifiée">
                <select
                  value={String(certified)}
                  onChange={(e) => setCertified(e.target.value === 'true')}
                  className={inputClass}
                >
                  <option value="true">Oui (semence certifiée)</option>
                  <option value="false">Non (semence fermière)</option>
                </select>
              </Field>
            </>
          )}

          {/* Dose par défaut commune */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Dose par défaut">
              <input
                type="number"
                step="0.1"
                value={defaultDoseValue}
                onChange={(e) => setDefaultDoseValue(e.target.value ? Number(e.target.value) : '')}
                className={inputClass}
              />
            </Field>
            <Field label="Unité de dose">
              <select
                value={defaultDoseUnit}
                onChange={(e) => setDefaultDoseUnit(e.target.value)}
                className={inputClass}
              >
                <option value="kg/ha">kg/ha</option>
                <option value="L/ha">L/ha</option>
                <option value="g/ha">g/ha</option>
                <option value="m³/ha">m³/ha</option>
                <option value="t/ha">t/ha</option>
                <option value="grains/ha">grains/ha</option>
              </select>
            </Field>
          </div>

          <Field label="Statut">
            <select
              value={String(active)}
              onChange={(e) => setActive(e.target.value === 'true')}
              className={inputClass}
            >
              <option value="true">Actif au catalogue</option>
              <option value="false">Retiré (archivé)</option>
            </select>
          </Field>

          <p className="m-0 rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9] px-3 py-2 text-[11px] text-(--color-muted)">
            <strong>Phase 3</strong> — sync Odoo <code>product.product</code> + import automatique
            catalogue OFAG à venir.
          </p>
        </div>
        <footer className="flex items-center gap-2 border-t border-(--color-border) p-3">
          <button
            type="button"
            onClick={onClose}
            className="ml-auto inline-flex h-10 items-center rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-4 text-sm font-medium hover:bg-[#f8f8f5]"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!name.trim()}
            className="inline-flex h-10 items-center rounded-(--radius) border border-(--color-primary) bg-(--color-primary) px-5 text-sm font-medium text-white hover:bg-(--color-primary-hover) disabled:opacity-50"
          >
            {isExisting ? 'Enregistrer' : 'Créer'}
          </button>
        </footer>
      </div>
    </div>
  );
}

const inputClass =
  'h-10 w-full rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-3 text-sm focus:border-(--color-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15 disabled:bg-[#fbfbf9] disabled:text-(--color-muted)';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium">{label}</label>
      {children}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={16}
      height={16}
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
