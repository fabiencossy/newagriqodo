import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimesheetEntry } from '../../components/TimesheetEntry';

export default function SaisirPresencePage() {
  const navigate = useNavigate();
  const [confirmation, setConfirmation] = useState<string | null>(null);

  return (
    <div>
      <header className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/rh/heures')}
          aria-label="Retour à Mes heures"
          className="inline-flex h-9 w-9 items-center justify-center rounded-(--radius-sm) text-(--color-text) hover:bg-[#f1f1ee]"
        >
          <BackIcon />
        </button>
        <h1 className="m-0 text-lg font-semibold tracking-tight">Saisir une présence</h1>
      </header>

      <TimesheetEntry
        onSubmit={async (entry) => {
          await new Promise((r) => setTimeout(r, 400));
          setConfirmation(
            `${entry.hoursWorked.toFixed(2)}h effectives · ${entry.breaks.length + 1} attendance(s) Odoo`,
          );
          // Retour automatique après confirmation
          setTimeout(() => navigate('/rh/heures'), 1200);
        }}
        onCancel={() => navigate('/rh/heures')}
      />

      {confirmation && (
        <div
          role="status"
          className="mx-auto mt-3 max-w-xl rounded-(--radius) border border-[#c9e3bb] bg-[#ecf6e6] px-3 py-2 text-xs text-[#1a5e1a]"
        >
          ✓ Présence enregistrée · {confirmation}
        </div>
      )}
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
