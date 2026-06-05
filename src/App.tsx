import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import AcessosPage from './pages/Acessos';
import VisitantesPage from './pages/Visitantes';
import EncomendasPage from './pages/Encomendas';
import DispositivosPage from './pages/Dispositivos';
import OcorrenciasPage from './pages/Ocorrencias';
import PessoasPage from './pages/Pessoas';
import { useAuth } from './lib/auth';
import { useThemeBootstrap } from './lib/theme';
import Shell from './components/Shell';
import { ModuleGate } from './components/ModuleGate';

export default function App() {
  useThemeBootstrap();
  const { accessToken } = useAuth();
  if (!accessToken) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<ModuleGate moduleKey="portaria.operacao"><DashboardPage /></ModuleGate>} />
        <Route path="/acessos" element={<ModuleGate moduleKey="portaria.acessos"><AcessosPage /></ModuleGate>} />
        <Route path="/visitantes" element={<ModuleGate moduleKey="portaria.visitantes"><VisitantesPage /></ModuleGate>} />
        <Route path="/encomendas" element={<ModuleGate moduleKey="portaria.correspondencias"><EncomendasPage /></ModuleGate>} />
        <Route path="/pessoas" element={<ModuleGate moduleKey="portaria.pessoas"><PessoasPage /></ModuleGate>} />
        <Route path="/dispositivos" element={<ModuleGate moduleKey="portaria.dispositivos"><DispositivosPage /></ModuleGate>} />
        <Route path="/ocorrencias" element={<ModuleGate moduleKey="portaria.ocorrencias"><OcorrenciasPage /></ModuleGate>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
