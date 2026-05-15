import { useNavigate } from 'react-router-dom';
import type { Assolement } from './assolement.types';
import { cultureColor } from './cultures';
import { PARCELLES } from '../parcellaire/parcellaire.mocks';

interface Row {
  assolement: Assolement;
  parcelName: string;
  surfaceHa: number;
}

export function AssolementTable({ assolements }: { assolements: ReadonlyArray<Assolement> }) {
  const navigate = useNavigate();

  const rows: Row[] = assolements
    .map<Row | undefined>((a) => {
      const parcel = PARCELLES.find((p) => p.id === a.parcelId);
      if (!parcel) return undefined;
      return { assolement: a, parcelName: parcel.name, surfaceHa: parcel.surfaceHa };
    })
    .filter((r): r is Row => Boolean(r))
    .sort((a, b) => a.assolement.parcelId.localeCompare(b.assolement.parcelId));

  if (rows.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-(--color-muted)">
        Aucun assolement pour cette campagne.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-(--radius) border border-(--color-border) bg-(--color-surface)">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] tracking-wider text-(--color-muted) uppercase">
            <Th>Parcelle</Th>
            <Th>Culture</Th>
            <Th>Variété</Th>
            <Th align="right">Surface</Th>
            <Th>Semis</Th>
            <Th>Récolte</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ assolement, parcelName, surfaceHa }) => (
            <tr
              key={assolement.id}
              onClick={() => navigate(`/parcellaire/${assolement.parcelId}`)}
              className="cursor-pointer border-b border-(--color-border) last:border-b-0 hover:bg-[#fbfbf9]"
            >
              <td className="px-3 py-2">
                <div className="font-medium">{parcelName}</div>
                <div className="font-mono text-[11px] text-(--color-muted)">
                  {assolement.parcelId}
                </div>
              </td>
              <td className="px-3 py-2">
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block h-3 w-3 rounded-(--radius-pill)"
                    style={{ background: cultureColor(assolement.culture) }}
                  />
                  {assolement.culture}
                </span>
              </td>
              <td className="px-3 py-2 text-(--color-muted)">{assolement.varietyName ?? '—'}</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">
                {surfaceHa.toFixed(2)} ha
              </td>
              <td className="px-3 py-2 font-mono text-xs">{formatDate(assolement.sowingDate)}</td>
              <td className="px-3 py-2 font-mono text-xs">{formatDate(assolement.harvestDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={[
        'border-b border-(--color-border) px-3 py-2 font-medium',
        align === 'right' ? 'text-right' : 'text-left',
      ].join(' ')}
    >
      {children}
    </th>
  );
}

function formatDate(date: string | undefined): string {
  if (!date) return '—';
  const parts = date.split('-');
  if (parts.length !== 3) return date;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
