import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  Shield,
  Inventory2,
  LocalShipping,
  People,
  ManageAccounts,
  Business,
  Assessment,
  Settings,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED = 72;

interface AppSidebarProps {
  open: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'EPIs', icon: <Shield />, path: '/epis' },
  { text: 'Estoque / Lotes', icon: <Inventory2 />, path: '/estoque' },
  { text: 'Entregas', icon: <LocalShipping />, path: '/entregas' },
  { text: 'Funcionários', icon: <People />, path: '/funcionarios' },
  { text: 'Usuários', icon: <ManageAccounts />, path: '/usuarios' },
  { text: 'Setores', icon: <Business />, path: '/setores' },
  { text: 'Relatórios', icon: <Assessment />, path: '/relatorios' },
  { text: 'Configurações', icon: <Settings />, path: '/configuracoes' },
];

const AppSidebar = ({ open, collapsed, onToggleCollapse, onClose }: AppSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawerWidth = collapsed && !isMobile ? DRAWER_COLLAPSED : DRAWER_WIDTH;

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #071A2B 0%, #0E2A45 100%)',
        color: '#FFFFFF',
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          px: collapsed && !isMobile ? 1 : 2.5,
          py: 2,
          minHeight: 64,
        }}
      >
        {(!collapsed || isMobile) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #0B5ED7, #FFC400)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.85rem',
              }}
            >
              EPI
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#FFF', lineHeight: 1.2 }}>
                ERP-EPI
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Gestão de EPIs
              </Typography>
            </Box>
          </Box>
        )}
        {collapsed && !isMobile && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #0B5ED7, #FFC400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.7rem',
              color: '#FFF',
            }}
          >
            EPI
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* Menu */}
      <List sx={{ flex: 1, py: 1.5 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const button = (
            <ListItemButton
              key={item.text}
              selected={isActive}
              onClick={() => {
                navigate(item.path);
                if (isMobile) onClose();
              }}
              sx={{
                minHeight: 44,
                justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                px: collapsed && !isMobile ? 2 : 2.5,
                my: 0.3,
                borderRadius: '10px',
                mx: 1,
                color: isActive ? '#FFC400' : 'rgba(255,255,255,0.7)',
                backgroundColor: isActive ? 'rgba(11,94,215,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive ? 'rgba(11,94,215,0.25)' : 'rgba(255,255,255,0.06)',
                  color: '#FFF',
                },
                '& .MuiListItemIcon-root': {
                  color: isActive ? '#FFC400' : 'rgba(255,255,255,0.5)',
                  minWidth: collapsed && !isMobile ? 0 : 40,
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              {(!collapsed || isMobile) && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 400 }}
                />
              )}
            </ListItemButton>
          );

          return collapsed && !isMobile ? (
            <Tooltip key={item.text} title={item.text} placement="right" arrow>
              {button}
            </Tooltip>
          ) : (
            button
          );
        })}
      </List>

      {/* Collapse Toggle */}
      {!isMobile && (
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
          <IconButton
            onClick={onToggleCollapse}
            sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#FFF' } }}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Box>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: 'width 0.2s ease-in-out',
          overflowX: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default AppSidebar;
