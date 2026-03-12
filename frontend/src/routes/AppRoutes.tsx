import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import AppLayout from '../layouts/AppLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import EPIsPage from '../pages/EPIsPage';
import EstoquePage from '../pages/EstoquePage';
import EntregasPage from '../pages/EntregasPage';
import FuncionariosPage from '../pages/FuncionariosPage';
import UsuariosPage from '../pages/UsuariosPage';
import SetoresPage from '../pages/SetoresPage';
import RelatoriosPage from '../pages/RelatoriosPage';
import ConfiguracoesPage from '../pages/ConfiguracoesPage';
import { useAuth } from '../contexts/AuthContext';

const FullScreenLoader = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #071A2B 0%, #0B5ED7 50%, #071A2B 100%)',
    }}
  >
    <CircularProgress sx={{ color: '#fff' }} />
  </Box>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authenticated, loading } = useAuth();

  if (loading) return <FullScreenLoader />;

  return authenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { authenticated, loading } = useAuth();

  if (loading) return <FullScreenLoader />;

  return authenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      }
    />

    <Route
      path="/"
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="epis" element={<EPIsPage />} />
      <Route path="estoque" element={<EstoquePage />} />
      <Route path="entregas" element={<EntregasPage />} />
      <Route path="funcionarios" element={<FuncionariosPage />} />
      <Route path="usuarios" element={<UsuariosPage />} />
      <Route path="setores" element={<SetoresPage />} />
      <Route path="relatorios" element={<RelatoriosPage />} />
      <Route path="configuracoes" element={<ConfiguracoesPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;