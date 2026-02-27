import './index.css';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, LinearProgress } from '@mui/material';
import theme from './theme';
import Layout from './Layout.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import RequireAuth from './RequireAuth.jsx';

// Páginas
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EPIs from './pages/EPIs.jsx';
import Funcionarios from './pages/Funcionarios.jsx';
import Entrega from './pages/Entrega.jsx';
import Monitor from './pages/Monitor.jsx';
import Relatorios from './pages/Relatorios.jsx';
import Usuarios from './pages/Usuarios.jsx'

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0 }} />}>
        <Routes>
          {/* Login fora do layout */}
          <Route path="/login" element={<Login />} />

          {/* Demais páginas dentro do layout (protegidas) */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="epis" element={<EPIs />} />
            <Route path="funcionarios" element={<Funcionarios />} />
            <Route path="entrega" element={<Entrega />} />
            <Route path="monitor" element={<Monitor />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

const rootEl = document.getElementById('root');
const root = ReactDOM.createRoot(rootEl);
root.render(<App />);

// HMR: use UNMOUNT (não "destroy")
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    root.unmount();
  });
}
