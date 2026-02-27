import React, { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Alert,
  Divider,
  useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function Login() {
  const nav = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))

  const [email, setEmail] = useState('admin')
  const [password, setPassword] = useState('admin')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const to = useMemo(() => location.state?.from || '/dashboard', [location.state])

  const submit = async () => {
    if (loading) return
    setError(null)
    setLoading(true)
    try {
      const res = await api.post('/auth/token/', { username: email, password })
      localStorage.setItem('access', res.data.access)
      localStorage.setItem('refresh', res.data.refresh)
      nav(to, { replace: true })
    } catch (e) {
      setError('Usuário ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') submit()
  }

  // Paleta Aqua Slides (azul + amarelo)
  const aquaBlue = '#0B5ED7'
  const aquaNavy = '#071A2B'
  const aquaDeep = '#0A2E4E'
  const aquaYellow = '#FFC400'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: 6,
        background: `
          radial-gradient(1200px 650px at 12% 12%, rgba(255, 196, 0, 0.18), transparent 55%),
          radial-gradient(900px 520px at 88% 22%, rgba(11, 94, 215, 0.26), transparent 58%),
          radial-gradient(800px 520px at 50% 90%, rgba(11, 94, 215, 0.18), transparent 60%),
          linear-gradient(135deg, ${aquaNavy} 0%, ${aquaDeep} 55%, ${aquaNavy} 100%)
        `
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={14}
          sx={{
            overflow: 'hidden',
            borderRadius: 4,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' },
            minHeight: { xs: 560, md: 540 },
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(8px)'
          }}
        >
          {/* Lado esquerdo (branding Aqua Slides) */}
          <Box
            sx={{
              position: 'relative',
              px: { xs: 3.5, md: 5 },
              py: { xs: 4, md: 5 },
              color: 'common.white',
              background: `
                radial-gradient(900px 500px at 20% 15%, rgba(255, 196, 0, 0.22), transparent 55%),
                radial-gradient(900px 550px at 85% 35%, rgba(255, 196, 0, 0.12), transparent 62%),
                linear-gradient(135deg, rgba(11, 94, 215, 0.96) 0%, rgba(7, 26, 43, 0.96) 70%, rgba(10, 46, 78, 0.96) 100%)
              `
            }}
          >
            {/* “Faixa” amarela decorativa */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: 6,
                width: '100%',
                background: `linear-gradient(90deg, ${aquaYellow} 0%, rgba(255,196,0,0.55) 35%, rgba(255,196,0,0) 100%)`
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: 'rgba(255,196,0,0.22)',
                  color: 'common.white',
                  width: 46,
                  height: 46,
                  border: '1px solid rgba(255,196,0,0.35)'
                }}
              >
                <LockOutlinedIcon />
              </Avatar>

              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: 0.4,
                    lineHeight: 1.1
                  }}
                >
                  Aqua Slides • EPI-ERP
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.92 }}>
                  Controle • Almoxarifado • Relatórios
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 5 }}>
              <Typography
                variant={isMdUp ? 'h4' : 'h5'}
                sx={{
                  fontWeight: 900,
                  lineHeight: 1.1,
                  textShadow: '0 10px 25px rgba(0,0,0,0.35)'
                }}
              >
                Gestão mais rápida,
                <br />
                produção mais segura.
              </Typography>

              <Typography sx={{ mt: 1.5, opacity: 0.92, maxWidth: 420 }}>
                Acesse o sistema para acompanhar EPIs, entregas e funcionários com organização e rastreabilidade.
              </Typography>
            </Box>

            {/* Placeholder de logo (sem depender de arquivo) */}
            <Box
              sx={{
                mt: 5,
                p: 2.5,
                borderRadius: 3,
                border: '1px dashed rgba(255,196,0,0.45)',
                background: 'rgba(0,0,0,0.12)',
                maxWidth: 460
              }}
            >
                <Avatar
                src="/logo.png"
                alt="Aqua Slides"
                variant="rounded"
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: 5,
                  bgcolor: 'common.white',
                  border: '1px solid rgba(255,255,255,0.35)'
                }}
                imgProps={{ style: { objectFit: 'contain', background: 'transparent' } }}
              />
            </Box>

            {/* “bolhas” sutis */}
            <Box
              sx={{
                position: 'absolute',
                right: -70,
                bottom: -70,
                width: 220,
                height: 220,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, rgba(255,196,0,0.22), rgba(255,196,0,0) 60%)',
                filter: 'blur(1px)'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                right: 25,
                bottom: 40,
                width: 90,
                height: 90,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, rgba(255,196,0,0.16), rgba(255,196,0,0) 62%)'
              }}
            />
          </Box>

          {/* Lado direito (form) */}
          <Box sx={{ px: { xs: 3.5, md: 5 }, py: { xs: 4, md: 5 }, bgcolor: 'background.paper' }}>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              Entrar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
              Use seu usuário e senha para acessar o sistema.
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }} onKeyDown={onKeyDown}>
              <TextField
                label="Usuário"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    backgroundColor: 'rgba(7, 26, 43, 0.03)'
                  },
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                    borderColor: aquaBlue
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: aquaBlue
                  }
                }}
              />

              <TextField
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Mostrar senha"
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    backgroundColor: 'rgba(7, 26, 43, 0.03)'
                  },
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                    borderColor: aquaBlue
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: aquaBlue
                  }
                }}
              />

              {error && (
                <Alert severity="error" variant="outlined" sx={{ borderRadius: 2.5 }}>
                  {error}
                </Alert>
              )}

              <Button
                size="large"
                variant="contained"
                onClick={submit}
                disabled={loading}
                sx={{
                  py: 1.25,
                  fontWeight: 900,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  background: `linear-gradient(135deg, ${aquaBlue} 0%, #0A4CB8 55%, ${aquaBlue} 100%)`,
                  boxShadow: '0 14px 28px rgba(11, 94, 215, 0.26)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    background: `linear-gradient(135deg, #0A4CB8 0%, ${aquaBlue} 60%, #0A4CB8 100%)`
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(90deg, rgba(255,196,0,0) 0%, rgba(255,196,0,0.22) 50%, rgba(255,196,0,0) 100%)`,
                    transform: 'translateX(-80%)',
                    transition: 'transform 650ms ease'
                  },
                  '&:hover::after': {
                    transform: 'translateX(80%)'
                  }
                }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>

              <Typography variant="caption" color="text.secondary">
                Dica: pressione <b>Enter</b> para entrar.
                <Box component="span" sx={{ display: 'inline-block', mx: 1, opacity: 0.35 }}>
                  •
                </Box>
                <Box component="span" sx={{ fontWeight: 800, color: aquaYellow }}>
                  Aqua Slides
                </Box>
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 2.5,
            color: 'rgba(255,255,255,0.78)'
          }}
        >
          © {new Date().getFullYear()} • Aqua Slides Equipamentos Aquáticos
        </Typography>
      </Container>
    </Box>
  )
}