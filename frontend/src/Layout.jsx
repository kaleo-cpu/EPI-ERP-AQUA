import React, { useMemo, useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  Avatar,
  useMediaQuery,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  alpha,
  Button,
  Paper
} from '@mui/material'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'

import MenuIcon from '@mui/icons-material/Menu'
import HomeRounded from '@mui/icons-material/HomeRounded'
import Inventory2Rounded from '@mui/icons-material/Inventory2Rounded'
import GroupRounded from '@mui/icons-material/GroupRounded'
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded'
import QueryStatsRounded from '@mui/icons-material/QueryStatsRounded'
import AssessmentRounded from '@mui/icons-material/AssessmentRounded'
import ManageAccountsRounded from '@mui/icons-material/ManageAccountsRounded'
import LogoutRounded from '@mui/icons-material/LogoutRounded'
import DashboardRounded from '@mui/icons-material/DashboardRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'

const AQUA = {
  navy: '#071A2B',
  deep: '#0A2E4E',
  blue: '#0B5ED7',
  blue2: '#0A4CB8',
  yellow: '#FFC400',
  yellow2: '#FFB300',
  ink: '#0E1B2A',
}

const DRAWER_W = 284
const DRAWER_W_MINI = 86

export default function Layout({ children }) {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const isMobile = useMediaQuery('(max-width: 900px)')

  const [openMobile, setOpenMobile] = useState(false)
  const [mini, setMini] = useState(false)

  const handleLogout = () => {
    try {
      localStorage.removeItem('access')
      localStorage.removeItem('auth')
    } catch {}
    nav('/login', { replace: true })
  }

  const navItems = useMemo(
    () => [
      { label: 'Início', to: '/dashboard', icon: <DashboardRounded /> },
      { label: 'EPIs', to: '/epis', icon: <Inventory2Rounded /> },
      { label: 'Funcionários', to: '/funcionarios', icon: <GroupRounded /> },
      { label: 'Entrega', to: '/entrega', icon: <AssignmentTurnedInRounded /> },
      { label: 'Monitor', to: '/monitor', icon: <QueryStatsRounded /> },
      { label: 'Relatórios', to: '/relatorios', icon: <AssessmentRounded /> },
      { label: 'Usuários', to: '/usuarios', icon: <ManageAccountsRounded /> },
    ],
    []
  )

  const drawerContent = (mode = 'desktop') => {
    const isMini = mode === 'desktop' && mini

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Brand / Logo */}
        <Box
          sx={{
            px: 2,
            pt: 2,
            pb: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          {/* ✅ Coloque sua logo aqui: /public/logo-aquaslides.png */}
          <Avatar
            src="/logo.png"
            alt="Aqua Slides"
            variant="rounded"
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: 'common.white',
              boxShadow: '0 10px 18px rgba(7,26,43,0.18)',
              border: '1px solid rgba(7,26,43,0.08)'
            }}
            imgProps={{
              style: { objectFit: 'contain', background: 'transparent' }
            }}
          />

          {!isMini && (
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 950,
                  lineHeight: 1.05,
                  letterSpacing: -0.3,
                  color: AQUA.ink,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Aqua Slides
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontWeight: 800 }}
              >
                Gestão de EPI
              </Typography>
            </Box>
          )}

          {mode === 'desktop' && (
            <Box sx={{ flexGrow: 1 }} />
          )}

          {mode === 'desktop' && (
            <Tooltip title={isMini ? 'Expandir menu' : 'Recolher menu'}>
              <IconButton
                onClick={() => setMini(v => !v)}
                size="small"
                sx={{
                  borderRadius: 2,
                  bgcolor: 'rgba(7,26,43,0.04)',
                  border: '1px solid rgba(7,26,43,0.06)',
                  '&:hover': { bgcolor: 'rgba(7,26,43,0.08)' }
                }}
              >
                {isMini ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider />

        {/* Navigation */}
        <Box sx={{ px: 1.2, pt: 1.2 }}>
          <List sx={{ py: 0 }}>
            {/* (Opcional) Início duplicado no seu arquivo anterior tinha HomeRounded no drawer.
                Mantive apenas o navItems + ícone específico de Início. */}
            {navItems.map((item) => {
              const active = pathname === item.to
              return (
                <Tooltip
                  key={item.to}
                  title={isMini ? item.label : ''}
                  placement="right"
                  disableHoverListener={!isMini}
                >
                  <ListItemButton
                    onClick={() => {
                      if (mode === 'mobile') setOpenMobile(false)
                      nav(item.to)
                    }}
                    selected={active}
                    sx={{
                      borderRadius: 2,
                      mb: 0.7,
                      px: isMini ? 1.4 : 1.6,
                      py: 1.15,
                      gap: 1.2,
                      alignItems: 'center',
                      border: active ? `1px solid ${alpha(AQUA.blue, 0.25)}` : '1px solid transparent',
                      bgcolor: active
                        ? `linear-gradient(135deg, ${alpha(AQUA.blue, 0.12)} 0%, ${alpha(AQUA.yellow, 0.10)} 100%)`
                        : 'transparent',
                      '&.Mui-selected': {
                        bgcolor: `linear-gradient(135deg, ${alpha(AQUA.blue, 0.12)} 0%, ${alpha(AQUA.yellow, 0.10)} 100%)`,
                      },
                      '&:hover': {
                        bgcolor: active
                          ? `linear-gradient(135deg, ${alpha(AQUA.blue, 0.16)} 0%, ${alpha(AQUA.yellow, 0.14)} 100%)`
                          : alpha(AQUA.navy, 0.04),
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        color: active ? AQUA.blue : alpha(AQUA.navy, 0.70),
                        '& svg': { fontSize: 22 }
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    {!isMini && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: active ? 950 : 850,
                          color: active ? AQUA.ink : alpha(AQUA.navy, 0.86),
                        }}
                      />
                    )}

                    {/* barrinha lateral ativa */}
                    {active && (
                      <Box
                        sx={{
                          ml: 'auto',
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          bgcolor: AQUA.yellow2,
                          boxShadow: `0 0 0 4px ${alpha(AQUA.yellow2, 0.18)}`
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              )
            })}
          </List>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Footer / Logout */}
        <Box sx={{ p: 1.2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.2,
              borderRadius: 2,
              border: '1px solid rgba(7,26,43,0.08)',
              bgcolor: 'rgba(255,255,255,0.80)'
            }}
          >
            <Button
              fullWidth
              onClick={() => {
                if (mode === 'mobile') setOpenMobile(false)
                handleLogout()
              }}
              startIcon={<LogoutRounded />}
              sx={{
                borderRadius: 2,
                fontWeight: 900,
                textTransform: 'none',
                justifyContent: isMini ? 'center' : 'flex-start',
                px: 1.6,
                color: AQUA.ink,
                bgcolor: alpha(AQUA.navy, 0.04),
                '&:hover': { bgcolor: alpha(AQUA.navy, 0.08) }
              }}
            >
              {!isMini && 'Sair'}
            </Button>
          </Paper>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Topbar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: `linear-gradient(90deg, ${AQUA.blue} 0%, ${AQUA.blue2} 70%, ${AQUA.deep} 100%)`,
          borderBottom: `1px solid ${alpha('#000', 0.08)}`
        }}
      >
        <Toolbar sx={{ minHeight: 72, display: 'flex', gap: 2 }}>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setOpenMobile(true)}
              aria-label="menu"
              sx={{ borderRadius: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            onClick={() => nav('/dashboard')}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.3, cursor: 'pointer' }}
          >
            <Avatar
              src="/logo.png"
              alt="Aqua Slides"
              variant="rounded"
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: 'common.white',
                border: '1px solid rgba(255,255,255,0.35)'
              }}
              imgProps={{ style: { objectFit: 'contain', background: 'transparent' } }}
            />
            <Box>
              <Typography sx={{ fontWeight: 950, letterSpacing: -0.3, lineHeight: 1.05 }}>
                Aqua Slides
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.90, fontWeight: 800 }}>
                EPI • ERP
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* atalho: sair (mantém função) */}
          {!isMobile && (
            <Tooltip title="Sair">
              <Button
                onClick={handleLogout}
                startIcon={<LogoutRounded />}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1.0,
                  fontWeight: 900,
                  textTransform: 'none',
                  bgcolor: alpha('#fff', 0.14),
                  '&:hover': { bgcolor: alpha('#fff', 0.22) },
                  color: 'white'
                }}
              >
                Sair
              </Button>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={openMobile} onClose={() => setOpenMobile(false)}>
        <Box
          sx={{
            width: 300,
            height: '100%',
            background: `
              radial-gradient(900px 240px at 12% 20%, ${AQUA.yellow}18, transparent 60%),
              radial-gradient(900px 240px at 88% 15%, ${AQUA.blue}14, transparent 60%),
              linear-gradient(180deg, #ffffff 0%, #ffffff 100%)
            `
          }}
        >
          {drawerContent('mobile')}
        </Box>
      </Drawer>

      <Box sx={{ display: 'flex' }}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Box
            sx={{
              width: mini ? DRAWER_W_MINI : DRAWER_W,
              transition: 'width .18s ease',
              flexShrink: 0,
              borderRight: '1px solid rgba(7,26,43,0.08)',
              bgcolor: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(8px)',
              minHeight: 'calc(100vh - 72px)',
              position: 'sticky',
              top: 72
            }}
          >
            {drawerContent('desktop')}
          </Box>
        )}

        {/* Content */}
        <Box sx={{ flexGrow: 1 }}>
          <Container sx={{ py: 3 }}>
            {children || <Outlet />}
          </Container>
        </Box>
      </Box>
    </Box>
  )
}