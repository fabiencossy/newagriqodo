import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../_shared/PageContainer';
import { MapView } from '../../components/MapView';
import { useFabActions, useHideFab } from '../../layouts/useFab';
import { PARCELLES, type ParcelDetail } from './parcellaire.mocks';
import { AssolementTimeline } from '../assolement/AssolementTimeline';
import {
  getActiveSegment,
  getDominantCulture,
  getSegmentsForParcelYear,
} from '../assolement/assolement.helpers';
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

  // FAB contextuel : actions disponibles sur la fiche parcelle.
  // (Affichées dans le header `PageContainer` via `actions` ci-dessous pour ne pas
  // chevaucher le bouton Enregistrer du footer sticky.)
  useFabActions(useMemo(() => [], []));
  // Masque le FAB sur cette page : le footer sticky d'enregistrement prime.
  useHideFab(true);

  const headerActions = useMemo(() => {
    if (!draft) return undefined;
    return [
      {
        label: 'Itinéraire',
        onClick: () => window.open(googleMapsDirUrl(draft), '_blank', 'noopener'),
      },
      {
        label: 'Intervention',
        onClick: () => {
          alert("Création d'une intervention (à brancher Phase 2.5 avec le Carnet).");
        },
      },
      {
        label: 'Dupliquer',
        onClick: () => {
          alert('Duplication de parcelle (à brancher Phase 2.5).');
        },
      },
    ];
  }, [draft]);

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

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  return (
    <PageContainer>
      <header className="mb-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/parcellaire')}
          aria-label="Retour au parcellaire"
          className="inline-flex h-9 w-9 items-center justify-center rounded-(--radius-sm) text-(--color-text) hover:bg-[#f1f1ee]"
        >
          <BackIcon />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="m-0 truncate text-xl font-semibold">
            {draft.id} — {draft.name}
          </h1>
          <p className="m-0 mt-0.5 text-sm text-(--color-muted)">
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
              'inline-flex items-center rounded-(--radius-pill) px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase',
              STATUS_STYLES[draft.status],
            ].join(' ')}
          >
            {STATUS_LABELS[draft.status]}
          </span>
        )}
        {headerActions && headerActions.length > 0 && (
          <div className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto">
            {headerActions.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={a.onClick}
                className="inline-flex h-9 items-center rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-3 text-xs font-medium hover:bg-[#f8f8f5]"
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
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

function AssolementSection({ parcelId, year }: { parcelId: string; year: number }) {
  const navigate = useNavigate();
  const segments = useMemo(() => getSegmentsForParcelYear(parcelId, year), [parcelId, year]);
  const active = useMemo(() => getActiveSegment(parcelId, TODAY), [parcelId]);
  const dominant = useMemo(() => getDominantCulture(parcelId, year), [parcelId, year]);

  return (
    <section className="rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5 lg:col-span-2">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 text-sm font-semibold tracking-wider text-(--color-muted) uppercase">
          Assolement · campagne {year}
        </h2>
        <button
          type="button"
          onClick={() => navigate('/assolement')}
          className="inline-flex h-9 items-center gap-1.5 rounded-(--radius) border border-(--color-border) bg-(--color-surface) px-3 text-xs font-medium text-(--color-text) hover:bg-[#f8f8f5]"
        >
          Modifier dans le Plan d'assolement
        </button>
      </div>

      {/* Résumé : segment actif (instant T) + culture dominante de la campagne */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ResumeCard
          title="Aujourd'hui"
          culture={active?.culture}
          variety={active?.varietyName}
          subtitle={
            active
              ? `${fmtDate(active.startDate)} → ${fmtDate(active.endDate)}`
              : 'Aucun segment actif'
          }
        />
        <ResumeCard
          title="Dominant"
          culture={dominant?.culture}
          variety={dominant?.segment.varietyName}
          subtitle={
            dominant ? `${Math.round((dominant.days / 365) * 12)} mois sur la campagne` : '—'
          }
        />
      </div>

      {/* Timeline */}
      <AssolementTimeline segments={segments} year={year} variant="detail" today={TODAY} />
    </section>
  );
}

function ResumeCard({
  title,
  culture,
  variety,
  subtitle,
}: {
  title: string;
  culture?: string;
  variety?: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-(--radius-sm) border border-(--color-border) bg-[#fbfbf9] p-3">
      <div className="text-[10px] font-semibold tracking-wider text-(--color-muted) uppercase">
        {title}
      </div>
      <div className="mt-1 flex items-center gap-2 text-sm font-medium">
        {culture ? (
          <>
            <span
              aria-hidden="true"
              className="inline-block h-3 w-3 rounded-(--radius-pill)"
              style={{ background: cultureColor(culture) }}
            />
            <span>
              {culture}
              {variety ? ` · ${variety}` : ''}
            </span>
          </>
        ) : (
          <span className="text-(--color-muted)">—</span>
        )}
      </div>
      <div className="mt-0.5 text-[11px] text-(--color-muted)">{subtitle}</div>
    </div>
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
