import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import ParcellairePage from './modules/parcellaire/ParcellairePage';
import ParcelleDetailPage from './modules/parcellaire/ParcelleDetailPage';
import AssolementPage from './modules/assolement/AssolementPage';
import CarnetPage from './modules/carnet/CarnetPage';
import TravauxPage from './modules/travaux/TravauxPage';
import TroupeauPage from './modules/troupeau/TroupeauPage';
import RHLayout from './modules/rh/RHLayout';
import MesHeuresPage from './modules/rh/MesHeuresPage';
import SaisirPresencePage from './modules/rh/SaisirPresencePage';
import MesCongesPage from './modules/rh/MesCongesPage';
import ParametresPage from './modules/parametres/ParametresPage';
import LoginPage from './modules/auth/LoginPage';
import ResetPasswordPage from './modules/auth/ResetPasswordPage';
import AcceptInvitePage from './modules/auth/AcceptInvitePage';
import { initAuthListener, useAuth } from './modules/auth/auth.store';
import { initFarmsBootstrap } from './modules/farms/farms.store';
import { initProductsBootstrap } from './modules/products/products.store';
import { initUsersBootstrap } from './modules/users/users.store';
import { initParcelsBootstrap } from './modules/parcellaire/parcellaire.store';
import { initParcelGroupsBootstrap } from './modules/parcel-groups/parcel-groups.store';
import { initAssolementBootstrap } from './modules/assolement/assolement.store';
import { initCarnetBootstrap } from './modules/carnet/carnet.store';

export default function App() {
  const { mode } = useAuth();

  useEffect(() => {
    initFarmsBootstrap();
    initProductsBootstrap();
    initUsersBootstrap();
    initParcelsBootstrap();
    initParcelGroupsBootstrap();
    initAssolementBootstrap();
    initCarnetBootstrap();
    return initAuthListener();
  }, []);

  // Pas connecté : login + reset password + accept invite accessibles.
  if (mode === 'logged-out') {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/accept-invite" element={<AcceptInvitePage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/parcellaire" replace />} />
        <Route path="/parcellaire" element={<ParcellairePage />} />
        <Route path="/parcellaire/:id" element={<ParcelleDetailPage />} />
        <Route path="/assolement" element={<AssolementPage />} />
        <Route path="/carnet" element={<CarnetPage />} />
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
        {/* /login accessible aussi en mode connecté (pour déconnexion) */}
        <Route path="/login" element={<Navigate to="/parcellaire" replace />} />
        <Route path="*" element={<Navigate to="/parcellaire" replace />} />
      </Route>
      {/* Reset password + accept invite accessibles aussi en mode connecté (rare). */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/accept-invite" element={<AcceptInvitePage />} />
    </Routes>
  );
}
