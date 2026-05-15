import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../_shared/PageContainer';
import { MapView } from '../../components/MapView';
import { useFabActions } from '../../layouts/useFab';
import { PARCELLES, type ParcelDetail } from './parcellaire.mocks';

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

const CULTURES = ['Blé', 'Maïs', 'Colza', 'Orge', 'Jachère', 'Archivé'];

export default function ParcelleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const initial = useMemo(() => PARCELLES.find((p) => p.id === id), [id]);
  const [draft, setDraft] = useState<ParcelDetail | undefined>(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // FAB contextuel : actions disponibles sur la fiche parcelle
  useFabActions(
    useMemo(() => {
      if (!draft) return [];
      return [
        {
          id: 'gmaps',
          label: 'Itinéraire (Google Maps)',
          onClick: () => window.open(googleMapsDirUrl(draft), '_blank', 'noopener'),
        },
        {
          id: 'add-intervention',
          label: 'Ajouter une intervention',
          onClick: () => {
            alert("Création d'une intervention (à brancher Phase 2.5 avec le Carnet).");
          },
        },
        {
          id: 'duplicate',
          label: 'Dupliquer la parcelle',
          onClick: () => {
            alert('Duplication de parcelle (à brancher Phase 2.5).');
          },
        },
      ];
    }, [draft]),
  );

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
            {draft.surfaceHa.toFixed(2)} ha · {draft.culture}
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

        {/* Culture */}
        <section className="rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-5 lg:col-span-2">
          <h2 className="m-0 mb-4 text-sm font-semibold tracking-wider text-(--color-muted) uppercase">
            Culture en place
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Culture" htmlFor="f-cult">
              <select
                id="f-cult"
                value={draft.culture ?? ''}
                onChange={(e) => setField('culture', e.target.value)}
                className={inputClass}
              >
                {CULTURES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Variété" htmlFor="f-var">
              <input
                id="f-var"
                type="text"
                value={draft.varietyName ?? ''}
                onChange={(e) => setField('varietyName', e.target.value)}
                placeholder="ex. Arnold"
                className={inputClass}
              />
            </Field>
            <Field label="Date de semis" htmlFor="f-sow">
              <input
                id="f-sow"
                type="date"
                value={draft.sowingDate ?? ''}
                onChange={(e) => setField('sowingDate', e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

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
