// frontend/src/AppShell.jsx (ou Layout.jsx)
import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { LinearProgress, Box, Typography } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError:false, err:null }; }
  static getDerivedStateFromError(error){ return { hasError:true, err:error }; }
  componentDidCatch(error, info){ console.error('Erro no boundary:', error, info); }
  render(){
    if (this.state.hasError) {
      return (
        <Box sx={{ p:4 }}>
          <Typography variant="h5" color="error">Ops, algo quebrou nesta página.</Typography>
          <Typography variant="body2" sx={{ mt:1 }}>{String(this.state.err?.message || '')}</Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default function AppShell(){
  return (
    <ErrorBoundary>
      <Suspense fallback={<LinearProgress sx={{ position:'fixed', top:0, left:0, right:0 }} />}>
        <Outlet />
      </Suspense>
    </ErrorBoundary>
  );
}
