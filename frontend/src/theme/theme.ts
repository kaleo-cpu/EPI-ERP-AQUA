import { createTheme, alpha } from '@mui/material/styles';

const BLUE_DARK = '#071A2B';
const BLUE_CORP = '#0B5ED7';
const BLUE_SEC = '#0A4CB8';
const YELLOW_MAIN = '#FFC400';
const YELLOW_SEC = '#FFB300';
const TEXT_DARK = '#0E1B2A';

const theme = createTheme({
  palette: {
    primary: {
      main: BLUE_CORP,
      dark: BLUE_SEC,
      light: '#3D8AE8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: YELLOW_MAIN,
      dark: YELLOW_SEC,
      light: '#FFD54F',
      contrastText: TEXT_DARK,
    },
    background: {
      default: '#F4F6F9',
      paper: '#FFFFFF',
    },
    text: {
      primary: TEXT_DARK,
      secondary: '#5A6A7E',
    },
    divider: '#E3E8EF',
    error: {
      main: '#E53935',
    },
    warning: {
      main: YELLOW_SEC,
    },
    success: {
      main: '#2E7D32',
    },
    info: {
      main: BLUE_CORP,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.25rem',
      color: TEXT_DARK,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.75rem',
      color: TEXT_DARK,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.5rem',
      color: TEXT_DARK,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: TEXT_DARK,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.1rem',
      color: TEXT_DARK,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      color: TEXT_DARK,
    },
    subtitle1: {
      fontWeight: 500,
      color: '#5A6A7E',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.85rem',
      color: '#5A6A7E',
    },
    body1: {
      fontSize: '0.938rem',
    },
    body2: {
      fontSize: '0.85rem',
      color: '#5A6A7E',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(7,26,43,0.06)',
    '0px 2px 6px rgba(7,26,43,0.08)',
    '0px 4px 12px rgba(7,26,43,0.1)',
    '0px 6px 16px rgba(7,26,43,0.1)',
    '0px 8px 24px rgba(7,26,43,0.12)',
    '0px 12px 32px rgba(7,26,43,0.12)',
    '0px 16px 40px rgba(7,26,43,0.14)',
    ...Array(17).fill('0px 16px 40px rgba(7,26,43,0.14)'),
  ] as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F4F6F9',
        },
        '*::-webkit-scrollbar': {
          width: 6,
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: alpha(BLUE_DARK, 0.15),
          borderRadius: 3,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(11,94,215,0.25)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${BLUE_CORP} 0%, ${BLUE_SEC} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${BLUE_SEC} 0%, ${BLUE_DARK} 100%)`,
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${YELLOW_MAIN} 0%, ${YELLOW_SEC} 100%)`,
          color: TEXT_DARK,
          '&:hover': {
            background: `linear-gradient(135deg, ${YELLOW_SEC} 0%, #FF9800 100%)`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 2px 8px rgba(7,26,43,0.06)',
          border: '1px solid #E3E8EF',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: BLUE_CORP,
            },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F4F6F9',
            fontWeight: 700,
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#5A6A7E',
            borderBottom: '2px solid #E3E8EF',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: alpha(BLUE_CORP, 0.03),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: alpha(BLUE_CORP, 0.1),
            color: BLUE_CORP,
            '& .MuiListItemIcon-root': {
              color: BLUE_CORP,
            },
            '&:hover': {
              backgroundColor: alpha(BLUE_CORP, 0.15),
            },
          },
        },
      },
    },
  },
});

export default theme;
