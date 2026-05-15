import { useMemo } from 'react';
import { StubPage } from '../_shared/StubPage';
import { useFabActions } from '../../layouts/useFab';

export default function TroupeauPage() {
  useFabActions(
    useMemo(
      () => [
        {
          id: 'nouvel-animal',
          label: 'Ajouter un animal',
          onClick: () => {
            alert("Création d'un animal (à brancher Phase 2.5).");
          },
        },
        {
          id: 'nouvel-evenement',
          label: 'Ajouter un événement',
          onClick: () => {
            alert("Création d'un événement (à brancher Phase 2.5).");
          },
        },
      ],
      [],
    ),
  );

  return (
    <StubPage
      title="Troupeau"
      subtitle="Animaux, événements, historique"
      description="Module troupeau — fonctionne offline (Odoo optionnel pour sync registre)."
    />
  );
}
