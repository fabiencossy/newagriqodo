import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../_shared/PageContainer';
import { MapView } from '../../components/MapView';
import { useFabActions, useHideFab } from '../../layouts/useFab';
import { PARCELLES, type ParcelDetail } from './parcellaire.mocks';
import { AssolementTimeline } from '../assolement/AssolementTimeline';
import { getActiveSegment, getSegmentsForParcelYear } from '../assolement/assolement.helpers';
import { cultureColor } from '../assolement/cultures';

const TODAY = new Date().toISOString().slice(0, 10);

/** URL Google Maps en mode itinéraire vers le centroïde de la parcelle. */
function googleMapsDirUrl(parcel: ParcelDetail): string {
  const [lng, lat] = computeCentroid(parcel);
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/** Calcule le centroïde d'un polygone (moyenne des points du ring extérieur). */
function computeCentroid(parcel: ParcelDetail): [number, number] {
  const ring =
    parcel.geometry.type === 'Polygon'
      ? parcel.geometry.coordinates[0]!
      : parcel.geometry.coordinates[0]![0]!;
  let sumX = 0;
  let sumY = 0;
  let count = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    // ignorer le dernier point (= premier point pour fermer le ring)
    sumX += ring[i]![0]!;
    sumY += ring[i]![1]!;
    count++;
  }
  return [sumX / count, sumY / count];
}

const STATUS_LABELS: Record<NonNullable<ParcelDetail['status']>, string> = {
  active: 'Actif',
  fallow: 'Jachère',
  archived: 'Archivé',
};

const STATUS_STYLES: Record<NonNullable<ParcelDetail['status']>, string> = {
  active: 'bg-(--color-success)/12 text-[#166534]',
  fallow: 'bg-(--color-warning)/12 text-[#92400e]',
  archived: 'bg-[#e5e5e5] text-(--color-muted)',
};

export default function ParcelleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const initial = useMemo(() => PARCELLES.find((p) => p.id === id), [id]);
  const [draft, setDraft] = useState<ParcelDetail | undefined>(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // FAB principal : "Créer une intervention" (et observation).
  // Masqué quand le footer sticky d'enregistrement est visible (dirty).
  useFabActions(
    useMemo(
      () => [
        {
          id: 'add-intervention',
          label: 'Créer une intervention',
          onClick: () => {
            alert("Création d'une intervention (à brancher Phase 2.5 avec le Carnet).");
          },
        },
        {
          id: 'add-observation',
          label: 'Ajouter une observation',
          onClick: () => {
            alert('Marker observation (à brancher Phase 2.5).');
          },
        },
      ],
      [],
    ),
  );

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  // Le FAB ("Créer une intervention") cède la place au footer sticky d'enregistrement
  // quand il y a des modifications à sauvegarder (sinon ils se chevauchent).
  useHideFab(dirty);

  if (!initial || !draft) {
    return (
      <PageContainer>
        <div className="mx-auto max-w-2xl rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-8 text-center">
          <h1 className="m-0 text-lg font-semibold">Parcelle introuvable</h1>
          <p className="m-0 mt-2 text-sm text-(--color-muted)">
            Le code <strong>{id}</strong> ne correspond à aucune parcelle.
          </p>
          <button
            type="button"
            onClick={() => navigate('/parcellaire')}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-(--radius) border border-(--color-primary) bg-(--color-primary) px-4 text-sm font-medium text-white hover:bg-(--color-primary-hover)"
          >
            <BackIcon /> Retour au parcellaire
          </button>
        </div>
      </PageContainer>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    // TODO Phase 2.5 : persist via Odoo / API. Pour l'instant juste UI.
    setSavedAt(new Date());
    setSaving(false);
  };

  const setField = <K extends keyof ParcelDetail>(key: K, value: ParcelDetail[K]) => {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  };

  return (
    <PageContainer>
      <header className="mb-5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/parcellaire')}
          aria-label="Retour au parcellaire"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-(--radius-sm) text-(--color-text) hover:bg-[#f1f1ee]"
        >
          <BackIcon />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="m-0 truncate text-xl font-semibold">
            {draft.id} — {draft.name}
          </h1>
          <p className="m-0 mt-0.5 truncate text-sm text-(--color-muted)">
            {draft.surfaceHa.toFixed(2)} ha
            {(() => {
              const active = getActiveSegment(draft.id, TODAY);
              return active ? ` · ${active.culture}` : '';
            })()}
          </p>
        </div>
        {draft.status && (
          <span
            className={[
              'hidden shrink-0 items-center rounded-(--radius-pill) px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase sm:inline-flex',
              STATUS_STYLES[draft.status],
            ].join(' ')}
          >
            {STATUS_LABELS[draft.status]}
          </span>
        )}
        {/* Icône fine "Itinéraire" — accès rapide à Google Maps */}
        <a
          href={googleMapsDirUrl(draft)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Itinéraire (Google Maps)"
          title="Itinéraire vers la parcelle"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-(--radius-sm) text-(--color-muted) hover:bg-[#f1f1ee] hover:text-(--color-text)"
        >
          <GoogleMapsIcon />
        </a>
        {/* Kebab : actions secondaires */}
        <KebabMenu
          actions={[
            {
              id: 'duplicate',
              label: 'Dupliquer',
              onClick: () => alert('Duplication de parcelle (à brancher Phase 2.5).'),
            },
            {
              id: 'archive',
              label: draft.status === 'archived' ? 'Désarchiver' : 'Archiver',
              onClick: () =>
                setField('status', draft.status === 'archived' ? 'active' : 'archived'),
            },
            {
              id: 'delete',
              label: 'Supprimer',
              variant: 'danger',
              onClick: () =>
                confirm(`Supprimer la parcelle ${draft.id} ?`) && navigate('/parcellaire'),
            },
          ]}
        />
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Identification */}
        <section className="rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5 lg:col-span-2">
          <h2 className="m-0 mb-4 text-sm font-semibold tracking-wider text-(--color-muted) uppercase">
            Identification
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Code" htmlFor="f-code">
              <input id="f-code" type="text" value={draft.id} readOnly className={readonlyClass} />
            </Field>
            <Field label="Nom" htmlFor="f-name">
              <input
                id="f-name"
                type="text"
                value={draft.name}
                onChange={(e) => setField('name', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Surface (ha)" htmlFor="f-surf">
              <input
                id="f-surf"
                type="number"
                step="0.01"
                value={draft.surfaceHa}
                onChange={(e) => setField('surfaceHa', Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label="Année" htmlFor="f-year">
              <input
                id="f-year"
                type="number"
                value={draft.year}
                onChange={(e) => setField('year', Number(e.target.value))}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        {/* Status card */}
        <section className="rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5">
          <h2 className="m-0 mb-4 text-sm font-semibold tracking-wider text-(--color-muted) uppercase">
            Statut
          </h2>
          <div className="space-y-3">
            <Field label="Statut" htmlFor="f-status">
              <select
                id="f-status"
                value={draft.status ?? 'active'}
                onChange={(e) => setField('status', e.target.value as ParcelDetail['status'])}
                className={inputClass}
              >
                <option value="active">Actif</option>
                <option value="fallow">Jachère</option>
                <option value="archived">Archivé</option>
              </select>
            </Field>
          </div>
        </section>

        {/* Assolement — timeline + segments de la campagne */}
        <AssolementSection parcelId={draft.id} year={draft.year} />

        {/* Plan de fumure — apports N/P/K + stats */}
        <FumureSection parcelId={draft.id} surfaceHa={draft.surfaceHa} />

        {/* Notes */}
        <section className="rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5">
          <h2 className="m-0 mb-4 text-sm font-semibold tracking-wider text-(--color-muted) uppercase">
            Notes
          </h2>
          <textarea
            value={draft.notes ?? ''}
            onChange={(e) => setField('notes', e.target.value)}
            placeholder="Observations, contexte, voisins…"
            rows={5}
            className={inputClass.replace('h-10', 'min-h-[120px] py-2')}
          />
        </section>

        {/* Localisation — mini-carte avec la parcelle centrée */}
        <section className="rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="m-0 text-sm font-semibold tracking-wider text-(--color-muted) uppercase">
              Localisation
            </h2>
            <a
              href={googleMapsDirUrl(draft)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-3 text-xs font-medium text-(--color-text) hover:bg-[#f8f8f5]"
            >
              <GoogleMapsIcon />
              <span>Itinéraire</span>
              <ExternalLinkIcon />
            </a>
          </div>
          <MapView
            parcels={[draft]}
            selectedId={draft.id}
            onSelectionChange={() => {
              /* lecture seule */
            }}
            center={computeCentroid(draft)}
            zoom={16}
            enabledTools={[]}
            showBasemapToggle
            height="360px"
            className="!rounded-(--radius)"
          />
        </section>

        {/* Interventions placeholder */}
        <section className="rounded-(--radius) border border-dashed border-(--color-border) bg-(--color-surface) p-5 lg:col-span-3">
          <h2 className="m-0 mb-2 text-sm font-semibold tracking-wider text-(--color-muted) uppercase">
            Interventions
          </h2>
          <p className="m-0 text-sm text-(--color-muted)">
            Liste des interventions (semis, traitements, récolte…) à brancher en Phase 2.5 avec le
            Carnet des champs.
          </p>
        </section>
      </div>

      {/* Sticky footer save */}
      <footer className="sticky bottom-0 mt-6 -mx-4 flex items-center gap-3 border-t border-(--color-border) bg-(--color-surface) px-4 py-3 sm:-mx-6">
        {savedAt && !dirty && (
          <span className="text-xs text-(--color-success)">
            ✓ Enregistré {savedAt.toLocaleTimeString('fr-CH')}
          </span>
        )}
        {dirty && (
          <span className="text-xs text-(--color-warning)">Modifications non enregistrées</span>
        )}
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => setDraft(initial)}
            disabled={!dirty || saving}
            className="h-10 rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-4 text-sm font-medium hover:bg-[#f8f8f5] disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="h-10 rounded-(--radius) border border-(--color-primary) bg-(--color-primary) px-5 text-sm font-medium text-white hover:bg-(--color-primary-hover) disabled:opacity-50"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </footer>
    </PageContainer>
  );
}

/* ============ Plan de fumure ============ */

interface NutrientEntry {
  element: string;
  applied: number;
  needed: number;
  unit: string;
}

const FUMURE_NEEDS_KG_HA: Record<string, [number, number, number]> = {
  "Blé d'automne": [180, 60, 90],
  'Blé de printemps': [160, 60, 80],
  'Maïs ensilage': [200, 70, 200],
  'Maïs grain': [200, 70, 200],
  "Colza d'automne": [220, 60, 110],
  "Orge d'automne": [150, 50, 80],
  'Orge de printemps': [130, 50, 70],
};

function fumureForCulture(culture: string | undefined): NutrientEntry[] | null {
  if (!culture) return null;
  const need = FUMURE_NEEDS_KG_HA[culture];
  if (!need) return null;
  return [
    { element: 'N', applied: Math.round(need[0] * 0.7), needed: need[0], unit: 'kg/ha' },
    { element: 'P₂O₅', applied: Math.round(need[1] * 0.9), needed: need[1], unit: 'kg/ha' },
    { element: 'K₂O', applied: Math.round(need[2] * 0.5), needed: need[2], unit: 'kg/ha' },
  ];
}

function FumureSection({ parcelId, surfaceHa }: { parcelId: string; surfaceHa: number }) {
  const active = useMemo(() => getActiveSegment(parcelId, TODAY), [parcelId]);
  const data = fumureForCulture(active?.culture);
  if (!data || !active) return null;

  const totalNeeded = data.reduce((s, n) => s + n.needed, 0);
  const totalApplied = data.reduce((s, n) => s + n.applied, 0);
  const coverage = totalNeeded > 0 ? Math.round((totalApplied / totalNeeded) * 100) : 0;
  const remainingPerHa = Math.max(0, totalNeeded - totalApplied);
  const remainingTotalKg = Math.round(remainingPerHa * surfaceHa);
  const statusLabel =
    coverage >= 95 && coverage <= 110
      ? 'Équilibré'
      : coverage < 80
        ? 'Sous-fertilisé'
        : 'Sur-fertilisé';
  const statusColor =
    coverage >= 95 && coverage <= 110 ? '#16a34a' : coverage < 80 ? '#f59e0b' : '#ef4444';

  return (
    <section className="rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5 lg:col-span-2">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 text-sm font-semibold tracking-wider text-(--color-muted) uppercase">
          Plan de fumure
        </h2>
        <span className="text-xs text-(--color-muted)">{active.culture}</span>
      </div>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {data.map((n) => (
          <FumureNutrient key={n.element} {...n} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <FumureStat label="Couverture totale" value={`${coverage} %`} color={statusColor} />
        <FumureStat
          label="Reste à apporter"
          value={`${remainingTotalKg} kg`}
          sub={`(${remainingPerHa} kg/ha × ${surfaceHa.toFixed(2)} ha)`}
        />
        <FumureStat label="Bilan" value={statusLabel} color={statusColor} />
      </div>
    </section>
  );
}

function FumureNutrient({ element, applied, needed, unit }: NutrientEntry) {
  const ratio = needed > 0 ? Math.min(1.2, applied / needed) : 0;
  const overshoot = needed > 0 && applied > needed;
  const color = overshoot ? '#ef4444' : applied < needed * 0.6 ? '#f59e0b' : '#16a34a';
  return (
    <div className="rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9] p-3">
      <div className="text-[10px] font-semibold tracking-wider text-(--color-muted) uppercase">
        {element}
      </div>
      <div className="mt-1 font-mono text-base tabular-nums">
        {applied}
        <span className="text-(--color-muted)">/{needed}</span>
        <span className="ml-1 text-[11px] text-(--color-muted)">{unit}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-(--radius-pill) bg-[#f1f1ee]">
        <div
          className="h-full"
          style={{ width: `${Math.min(100, ratio * 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}

function FumureStat({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9] p-3">
      <div className="text-[10px] font-semibold tracking-wider text-(--color-muted) uppercase">
        {label}
      </div>
      <div className="mt-1 text-base font-semibold" style={{ color }}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-[11px] text-(--color-muted)">{sub}</div>}
    </div>
  );
}

function AssolementSection({ parcelId, year }: { parcelId: string; year: number }) {
  const navigate = useNavigate();
  const segments = useMemo(() => getSegmentsForParcelYear(parcelId, year), [parcelId, year]);
  const active = useMemo(() => getActiveSegment(parcelId, TODAY), [parcelId]);

  return (
    <section className="rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5 lg:col-span-2">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 text-sm font-semibold tracking-wider text-(--color-muted) uppercase">
          Assolement · campagne {year}
        </h2>
        <button
          type="button"
          onClick={() => navigate(`/assolement?parcel=${parcelId}`)}
          className="inline-flex h-9 items-center gap-1.5 rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-3 text-xs font-medium text-(--color-text) hover:bg-[#f8f8f5]"
        >
          Modifier dans le Plan d'assolement
        </button>
      </div>

      {/* Culture en place aujourd'hui */}
      <div className="mb-4 rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9] p-3">
        <div className="text-[10px] font-semibold tracking-wider text-(--color-muted) uppercase">
          Aujourd'hui
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm font-medium">
          {active ? (
            <>
              <span
                aria-hidden="true"
                className="inline-block h-3 w-3 rounded-(--radius-pill)"
                style={{ background: cultureColor(active.culture) }}
              />
              <span>
                {active.culture}
                {active.varietyName ? ` · ${active.varietyName}` : ''}
              </span>
              <span className="ml-auto shrink-0 font-mono text-[11px] text-(--color-muted)">
                {fmtDate(active.startDate)} → {fmtDate(active.endDate)}
              </span>
            </>
          ) : (
            <span className="text-(--color-muted)">Aucun segment actif</span>
          )}
        </div>
      </div>

      {/* Timeline */}
      <AssolementTimeline segments={segments} year={year} variant="detail" today={TODAY} />
    </section>
  );
}

function fmtDate(date: string): string {
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y}`;
}

const inputClass =
  'h-10 w-full rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-3 text-sm focus:border-(--color-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15';

const readonlyClass = inputClass + ' bg-[#fbfbf9] text-(--color-muted)';

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-(--color-text)">
        {label}
      </label>
      {children}
    </div>
  );
}

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={20}
      height={20}
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function GoogleMapsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={14}
      height={14}
      aria-hidden="true"
    >
      <path d="M12 22s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={12}
      height={12}
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6M10 14 21 3" />
    </svg>
  );
}

interface KebabAction {
  id: string;
  label: string;
  onClick: () => void;
  variant?: 'danger';
}

function KebabMenu({ actions }: { actions: ReadonlyArray<KebabAction> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Plus d'actions"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-(--radius-sm) text-(--color-muted) hover:bg-[#f1f1ee] hover:text-(--color-text)"
      >
        <MoreVerticalGlyph />
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute right-0 z-[1200] mt-1 w-[200px] rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-1 shadow-(--shadow-popup)"
        >
          {actions.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  a.onClick();
                  setOpen(false);
                }}
                className={[
                  'flex h-9 w-full items-center rounded-(--radius-sm) px-2.5 text-sm hover:bg-[#f8f8f5]',
                  a.variant === 'danger' ? 'text-(--color-error)' : 'text-(--color-text)',
                ].join(' ')}
              >
                {a.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MoreVerticalGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18} aria-hidden="true">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}
