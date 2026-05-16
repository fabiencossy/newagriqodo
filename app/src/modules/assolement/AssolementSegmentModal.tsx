import { useMemo } from 'react';
import { AssolementSegmentEditor } from './AssolementSegmentEditor';
import { removeSegment, saveSegment } from './assolement.store';
import type { AssolementSegment } from './assolement.types';

/**
 * Modal réutilisable pour créer/éditer un segment d'assolement.
 *
 * Cas d'usage :
 *   - ParcelleDetailPage / AssolementSection : édition inline
 *   - ParcelleSummaryPanel (carte) : ajout/édition depuis le panneau
 *   - AssolementPage : édition depuis le panneau de sélection
 *
 * Mode "nouveau" : `target = { draft: true, parcelId, year }`. Le composant
 * pré-remplit un segment par défaut (Blé d'automne, avril-août de l'année).
 *
 * Mode "édition" : `target = segment`.
 */

interface AssolementSegmentModalProps {
  target: AssolementSegment | { draft: true; parcelId: string; year: number };
  onClose: () => void;
}

export function AssolementSegmentModal({ target, onClose }: AssolementSegmentModalProps) {
  const isDraft = 'draft' in target;

  const segment: AssolementSegment = useMemo(() => {
    if (!isDraft) return target;
    const { parcelId, year } = target;
    return {
      id: `AS-${parcelId}-${year}-NEW`,
      parcelId,
      culture: "Blé d'automne",
      startDate: `${year}-04-01`,
      endDate: `${year}-08-31`,
    };
  }, [isDraft, target]);

  const handleSave = (next: AssolementSegment) => {
    saveSegment(next);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Supprimer ce segment ?')) {
      removeSegment(segment.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/40 backdrop-blur-sm md:items-center md:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Éditer le segment d'assolement"
        className="flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-(--radius-lg) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-popup) md:max-w-[480px] md:rounded-(--radius-lg)"
      >
        <header className="flex items-center gap-2 border-b border-(--color-border) px-4 py-3">
          <h2 className="m-0 text-sm font-semibold">
            {isDraft ? 'Nouveau segment' : 'Modifier le segment'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-(--radius-sm) text-(--color-muted) hover:bg-[#f1f1ee] hover:text-(--color-text)"
          >
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
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          <AssolementSegmentEditor
            segment={segment}
            onSave={handleSave}
            onCancel={onClose}
            onDelete={isDraft ? undefined : handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
