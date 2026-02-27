import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, LinearProgress, Typography } from '@mui/material';
import api from './api/client';

function parseJwtExp(token) {
  try {
    const payload = token.split('.')[1];
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof json.exp === 'number' ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

function getStoredAccess() {
  const raw = localStorage.getItem('access');
  if (raw && raw !== 'null' && raw !== 'undefined') return raw.replace(/^"+|"+$/g, '');
  return null;
}

function getStoredRefresh() {
  const raw = localStorage.getItem('refresh');
  if (raw && raw !== 'null' && raw !== 'undefined') return raw.replace(/^"+|"+$/g, '');
  return null;
}

export default function RequireAuth({ children }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [ok, setOk] = useState(false);

  const access = useMemo(() => getStoredAccess(), []);
  const refresh = useMemo(() => getStoredRefresh(), []);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      // 1) tem access e não expirou? ok
      const token = getStoredAccess();
      const exp = token ? parseJwtExp(token) : null;
      const expired = exp ? Date.now() > exp - 15_000 : false; // 15s de folga

      if (token && !expired) {
        if (alive) { setOk(true); setChecking(false); }
        return;
      }

      // 2) tenta refresh (se existir)
      const r = getStoredRefresh();
      if (!r) {
        if (alive) { setOk(false); setChecking(false); }
        return;
      }

      try {
        // força um request simples que disparará o fluxo de refresh do axios.
        // se o refresh falhar, o interceptor limpa o storage.
        await api.get('/epis/?__auth_check=1');
        if (alive) { setOk(true); setChecking(false); }
      } catch {
        if (alive) { setOk(false); setChecking(false); }
      }
    };

    run();
    return () => { alive = false; };
  }, []);

  if (checking) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center', p: 2 }}>
        <Box sx={{ width: 'min(520px, 92vw)' }}>
          <LinearProgress />
          <Typography sx={{ mt: 1 }} color="text.secondary">
            Verificando sessão…
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!ok) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return children;
}
