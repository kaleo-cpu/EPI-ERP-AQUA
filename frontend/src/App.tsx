import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import theme from './theme/theme';
import AppRoutes from './routes/AppRoutes';
import { NotificacaoProvider } from './components/NotificacaoProvider';
import { AuthProvider } from './contexts/AuthContext';

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <NotificacaoProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </NotificacaoProvider>
  </ThemeProvider>
);

export default App;