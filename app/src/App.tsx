import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import ParcellairePage from './modules/parcellaire/ParcellairePage';
import TravauxPage from './modules/travaux/TravauxPage';
import TroupeauPage from './modules/troupeau/TroupeauPage';
import RHPage from './modules/rh/RHPage';
import ParametresPage from './modules/parametres/ParametresPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/parcellaire" replace />} />
        <Route path="/parcellaire/*" element={<ParcellairePage />} />
        <Route path="/travaux" element={<TravauxPage />} />
        <Route path="/troupeau" element={<TroupeauPage />} />
        <Route path="/rh" element={<RHPage />} />
        <Route path="/parametres" element={<ParametresPage />} />
        <Route path="*" element={<Navigate to="/parcellaire" replace />} />
      </Route>
    </Routes>
  );
}
