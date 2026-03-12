import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface NotificacaoContextType {
  mostrar: (mensagem: string, tipo?: AlertColor) => void;
  sucesso: (mensagem: string) => void;
  erro: (mensagem: string) => void;
  alerta: (mensagem: string) => void;
}

const NotificacaoContext = createContext<NotificacaoContextType>({
  mostrar: () => {},
  sucesso: () => {},
  erro: () => {},
  alerta: () => {},
});

export const useNotificacao = () => useContext(NotificacaoContext);

export const NotificacaoProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [tipo, setTipo] = useState<AlertColor>('success');

  const mostrar = useCallback((msg: string, t: AlertColor = 'info') => {
    setMensagem(msg);
    setTipo(t);
    setOpen(true);
  }, []);

  const sucesso = useCallback((msg: string) => mostrar(msg, 'success'), [mostrar]);
  const erro = useCallback((msg: string) => mostrar(msg, 'error'), [mostrar]);
  const alerta = useCallback((msg: string) => mostrar(msg, 'warning'), [mostrar]);

  return (
    <NotificacaoContext.Provider value={{ mostrar, sucesso, erro, alerta }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={tipo}
          variant="filled"
          sx={{
            borderRadius: 3,
            fontWeight: 600,
            fontSize: '0.85rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
        >
          {mensagem}
        </Alert>
      </Snackbar>
    </NotificacaoContext.Provider>
  );
};
