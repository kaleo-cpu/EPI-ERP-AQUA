import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';

// ErrorBoundary evita “tela branca” quando algum componente dispara erro de runtime.
// Em produção, isso é a causa #1 de página em branco “às vezes”.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Mantém no console para diagnóstico.
    // Se quiser, você pode enviar isso para seu backend no futuro.
    // eslint-disable-next-line no-console
    console.error('UI crash:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
        <Paper sx={{ p: 3, maxWidth: 560, width: '100%', borderRadius: 3 }} elevation={2}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Opa… algo deu errado na tela
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Para evitar “tela branca”, o sistema interceptou um erro de interface.
            Se ao atualizar volta ao normal, é sinal de erro intermitente em algum componente.
          </Typography>
          <Button variant="contained" onClick={this.handleReload}>
            Atualizar página
          </Button>
          {import.meta.env.DEV && this.state.error && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                (DEV) Detalhe do erro:
              </Typography>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{String(this.state.error?.stack || this.state.error)}</pre>
            </Box>
          )}
        </Paper>
      </Box>
    );
  }
}
