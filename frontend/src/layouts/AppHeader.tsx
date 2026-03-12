import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Badge,
  InputBase,
  useMediaQuery,
  useTheme,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Search,
  ErrorOutline,
  WarningAmber,
  InfoOutlined,
  Circle,
  Logout,
} from '@mui/icons-material';
import { alertas } from '../mock/mockData';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AppHeaderProps {
  onMenuToggle: () => void;
}

const tipoConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  critico: { color: '#E53935', icon: <ErrorOutline sx={{ color: '#E53935', fontSize: 20 }} />, label: 'Crítico' },
  alerta: { color: '#F57F17', icon: <WarningAmber sx={{ color: '#F57F17', fontSize: 20 }} />, label: 'Alerta' },
  info: { color: '#0B5ED7', icon: <InfoOutlined sx={{ color: '#0B5ED7', fontSize: 20 }} />, label: 'Info' },
};

const getInitials = (name?: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
};

const AppHeader = ({ onMenuToggle }: AppHeaderProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [avatarAnchor, setAvatarAnchor] = useState<null | HTMLElement>(null);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());

  const unreadCount = alertas.filter((a) => !readIds.has(a.id)).length;

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleAvatarOpen = (e: React.MouseEvent<HTMLElement>) => setAvatarAnchor(e.currentTarget);
  const handleAvatarClose = () => setAvatarAnchor(null);

  const markAllRead = () => {
    setReadIds(new Set(alertas.map((a) => a.id)));
  };

  const handleLogout = () => {
    handleAvatarClose();
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E3E8EF',
        color: '#0E1B2A',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isMobile && (
            <IconButton onClick={onMenuToggle} sx={{ color: '#0E1B2A' }}>
              <MenuIcon />
            </IconButton>
          )}

          {!isMobile && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F4F6F9',
                borderRadius: 2.5,
                px: 2,
                py: 0.5,
                width: 320,
              }}
            >
              <Search sx={{ color: '#9CA3AF', mr: 1, fontSize: 20 }} />
              <InputBase
                placeholder="Buscar EPIs, funcionários..."
                sx={{ fontSize: '0.875rem', flex: 1 }}
              />
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={handleOpen} sx={{ color: '#5A6A7E' }}>
            <Badge
              badgeContent={unreadCount}
              color="error"
              sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', minWidth: 18, height: 18 } }}
            >
              <Notifications fontSize="small" />
            </Badge>
          </IconButton>

          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                sx: {
                  width: 380,
                  maxHeight: 460,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  mt: 1,
                },
              },
            }}
          >
            <Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Notificações</Typography>
              {unreadCount > 0 && (
                <Typography
                  onClick={markAllRead}
                  sx={{
                    fontSize: '0.75rem',
                    color: '#0B5ED7',
                    cursor: 'pointer',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Marcar todas como lidas
                </Typography>
              )}
            </Box>

            <Divider />

            <List disablePadding sx={{ overflowY: 'auto', maxHeight: 380 }}>
              {alertas.map((alerta) => {
                const cfg = tipoConfig[alerta.tipo] || tipoConfig.info;
                const isUnread = !readIds.has(alerta.id);

                return (
                  <ListItem
                    key={alerta.id}
                    onClick={() => setReadIds((prev) => new Set(prev).add(alerta.id))}
                    sx={{
                      px: 2.5,
                      py: 1.5,
                      cursor: 'pointer',
                      backgroundColor: isUnread ? 'rgba(11, 94, 215, 0.04)' : 'transparent',
                      '&:hover': { backgroundColor: '#F4F6F9' },
                      alignItems: 'flex-start',
                      gap: 1.5,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>{cfg.icon}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                          <Typography
                            sx={{
                              fontSize: '0.8rem',
                              fontWeight: isUnread ? 700 : 600,
                              color: '#0E1B2A',
                              flex: 1,
                            }}
                          >
                            {alerta.titulo}
                          </Typography>
                          {isUnread && <Circle sx={{ fontSize: 8, color: '#0B5ED7' }} />}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography sx={{ fontSize: '0.73rem', color: '#5A6A7E', lineHeight: 1.4 }}>
                            {alerta.descricao}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip
                              label={cfg.label}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                backgroundColor: `${cfg.color}14`,
                                color: cfg.color,
                                border: `1px solid ${cfg.color}30`,
                              }}
                            />
                            <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF' }}>{alerta.data}</Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Popover>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 1 }}>
            <Avatar
              onClick={handleAvatarOpen}
              sx={{
                width: 34,
                height: 34,
                bgcolor: '#0B5ED7',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {getInitials(user?.nome || user?.username)}
            </Avatar>

            {!isMobile && (
              <Box>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.3 }}>
                  {user?.nome || user?.username || 'Usuário'}
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF' }}>
                  {user?.perfil || 'Autenticado'}
                </Typography>
              </Box>
            )}
          </Box>

          <Menu
            anchorEl={avatarAnchor}
            open={Boolean(avatarAnchor)}
            onClose={handleAvatarClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Sair</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;