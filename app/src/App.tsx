import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import ParcellairePage from './modules/parcellaire/ParcellairePage';
import ParcelleDetailPage from './modules/parcellaire/ParcelleDetailPage';
import AssolementPage from './modules/assolement/AssolementPage';
import TravauxPage from './modules/travaux/TravauxPage';
import TroupeauPage from './modules/troupeau/TroupeauPage';
import RHLayout from './modules/rh/RHLayout';
import MesHeuresPage from './modules/rh/MesHeuresPage';
import SaisirPresencePage from './modules/rh/SaisirPresencePage';
import MesCongesPage from './modules/rh/MesCongesPage';
import ParametresPage from './modules/parametres/ParametresPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/parcellaire" replace />} />
        <Route path="/parcellaire" element={<ParcellairePage />} />
        <Route path="/parcellaire/:id" element={<ParcelleDetailPage />} />
        <Route path="/assolement" element={<AssolementPage />} />
        <Route path="/travaux" element={<TravauxPage />} />
        <Route path="/troupeau" element={<TroupeauPage />} />

        {/* RH avec layout + sous-routes */}
        <Route path="/rh" element={<RHLayout />}>
          <Route index element={<Navigate to="/rh/heures" replace />} />
          <Route path="heures" element={<MesHeuresPage />} />
          <Route path="saisir" element={<SaisirPresencePage />} />
          <Route path="conges" element={<MesCongesPage />} />
        </Route>

        <Route path="/parametres" element={<ParametresPage />} />
        <Route path="*" element={<Navigate to="/parcellaire" replace />} />
      </Route>
    </Routes>
  );
}
