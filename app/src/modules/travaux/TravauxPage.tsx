import { useMemo } from 'react';
import { StubPage } from '../_shared/StubPage';
import { useFabActions } from '../../layouts/useFab';

export default function TravauxPage() {
  useFabActions(
    useMemo(
      () => [
        {
          id: 'nouvelle-tache',
          label: 'Nouvelle tâche',
          onClick: () => {
            alert("Création d'une tâche (à brancher Phase 2.5 avec Odoo).");
          },
        },
      ],
      [],
    ),
  );

  return (
    <StubPage
      title="Travaux"
      subtitle="Gestion des tâches pour tiers"
      description="Création, assignation et suivi des travaux. Liaison Odoo obligatoire (employés + analytics)."
    />
  );
}
