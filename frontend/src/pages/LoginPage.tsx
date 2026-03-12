import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotificacao } from '../components/NotificacaoProvider';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { sucesso, erro: notificarErro } = useNotificacao();

  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!username || !senha) {
      setErro('Preencha usuário e senha.');
      return;
    }

    try {
      setLoading(true);
      await login(username, senha);

      if (lembrar) {
        localStorage.setItem('erp-epi-remember-user', username);
      } else {
        localStorage.removeItem('erp-epi-remember-user');
      }

      sucesso('Login realizado com sucesso.');
      navigate('/dashboard');
    } catch (error: any) {
      const mensagem =
        error?.message === 'No active account found with the given credentials'
          ? 'Usuário ou senha incorretos.'
          : error?.message || 'Não foi possível realizar o login.';

      setErro(mensagem);
      notificarErro(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #071A2B 0%, #0B5ED7 50%, #071A2B 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 160,
                height: 80,
                borderRadius: 3,
                border: '2px dashed #E3E8EF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F4F6F9',
              }}
            >
              <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', textAlign: 'center', px: 1 }}>
                Insira sua logo aqui
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              fontWeight: 800,
              color: '#0E1B2A',
              mb: 0.5,
              letterSpacing: '-0.02em',
            }}
          >
            ERP-EPI
          </Typography>

          <Typography
            sx={{
              textAlign: 'center',
              fontSize: '0.85rem',
              color: '#5A6A7E',
              mb: 4,
            }}
          >
            Gestão de Equipamentos de Proteção Individual
          </Typography>

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Usuário"
              placeholder="Digite seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: '#9CA3AF', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              sx={{ mb: 1.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#9CA3AF', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={lembrar}
                    onChange={(e) => setLembrar(e.target.checked)}
                    size="small"
                    sx={{ '&.Mui-checked': { color: '#0B5ED7' } }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '0.8rem', color: '#5A6A7E' }}>
                    Lembrar-me
                  </Typography>
                }
              />

              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#0B5ED7',
                  fontWeight: 600,
                }}
              >
                Acesso protegido
              </Typography>
            </Box>

            {erro && (
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#E53935',
                  textAlign: 'center',
                  mb: 2,
                  fontWeight: 600,
                  backgroundColor: 'rgba(229,57,53,0.06)',
                  borderRadius: 2,
                  py: 1,
                }}
              >
                {erro}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: 2.5,
                textTransform: 'none',
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Entrar'}
            </Button>
          </Box>

          <Typography
            sx={{
              textAlign: 'center',
              fontSize: '0.7rem',
              color: '#9CA3AF',
              mt: 4,
            }}
          >
            © {new Date().getFullYear()} ERP-EPI · Todos os direitos reservados
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;