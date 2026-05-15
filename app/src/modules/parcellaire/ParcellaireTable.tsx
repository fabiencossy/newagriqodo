import type { ParcelDetail } from './parcellaire.mocks';

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

export function ParcellaireTable({
  parcels,
  selectedId,
  onSelect,
}: {
  parcels: ReadonlyArray<ParcelDetail>;
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  if (parcels.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-(--color-muted)">
        Aucune parcelle ne correspond aux filtres.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-(--radius) border border-(--color-border) bg-(--color-surface)">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] tracking-wider text-(--color-muted) uppercase">
            <th className="border-b border-(--color-border) px-3 py-2 text-left font-medium">
              Code
            </th>
            <th className="border-b border-(--color-border) px-3 py-2 text-left font-medium">
              Nom
            </th>
            <th className="border-b border-(--color-border) px-3 py-2 text-right font-medium">
              Surface
            </th>
            <th className="border-b border-(--color-border) px-3 py-2 text-left font-medium">
              Culture
            </th>
            <th className="border-b border-(--color-border) px-3 py-2 text-left font-medium">
              Variété
            </th>
            <th className="border-b border-(--color-border) px-3 py-2 text-left font-medium">
              Statut
            </th>
            <th className="border-b border-(--color-border) px-3 py-2 text-right font-medium">
              Année
            </th>
          </tr>
        </thead>
        <tbody>
          {parcels.map((p) => {
            const isSel = p.id === selectedId;
            return (
              <tr
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={[
                  'cursor-pointer border-b border-(--color-border) last:border-b-0',
                  isSel ? 'bg-(--color-primary)/8' : 'hover:bg-[#fbfbf9]',
                ].join(' ')}
              >
                <td className="px-3 py-2 font-mono text-xs">{p.id}</td>
                <td className="px-3 py-2 font-medium">{p.name}</td>
                <td className="px-3 py-2 text-right font-mono tabular-nums">
                  {p.surfaceHa.toFixed(2)} ha
                </td>
                <td className="px-3 py-2">{p.culture}</td>
                <td className="px-3 py-2 text-(--color-muted)">{p.varietyName ?? '—'}</td>
                <td className="px-3 py-2">
                  {p.status && (
                    <span
                      className={[
                        'inline-flex items-center rounded-(--radius-pill) px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase',
                        STATUS_STYLES[p.status],
                      ].join(' ')}
                    >
                      {STATUS_LABELS[p.status]}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{p.year}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
