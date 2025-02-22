import { createTheme, alpha } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    primary: {
      main: '#7B2CBF', // Deep mystical purple
      light: '#9D4EDD',
      dark: '#5A189A',
    },
    secondary: {
      main: '#FFB703', // Mystical gold
      light: '#FFD60A',
      dark: '#FB8500',
    },
    background: {
      default: mode === 'dark' ? '#0A0A0F' : '#F8F9FE',
      paper: mode === 'dark' ? '#121218' : '#FFFFFF',
    },
    text: {
      primary: mode === 'dark' ? '#FFFFFF' : '#1A1A1A',
      secondary: mode === 'dark' ? '#B0B0B0' : '#666666',
    },
    divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Arial', sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    h6: {
      letterSpacing: '0.02em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
});

// Separate component overrides to avoid type issues
const getThemedComponents = (mode: PaletteMode) => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundImage: mode === 'dark'
          ? 'radial-gradient(circle at 50% 50%, rgba(123, 44, 191, 0.1) 0%, rgba(0, 0, 0, 0) 100%)'
          : 'radial-gradient(circle at 50% 50%, rgba(123, 44, 191, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
        backgroundAttachment: 'fixed',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        backgroundColor: mode === 'dark' ? '#121218' : '#FFFFFF',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 'inherit',
          border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          pointerEvents: 'none',
        },
      },
    },
  },
  MuiButton: {
    defaultProps: {
      disableRipple: true,
    },
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        padding: '8px 16px',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: `0 0 20px ${alpha('#7B2CBF', 0.3)}`,
          transform: 'translateY(-1px)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 'inherit',
          background: mode === 'dark'
            ? 'linear-gradient(135deg, rgba(123, 44, 191, 0.1) 0%, rgba(255, 183, 3, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(123, 44, 191, 0.05) 0%, rgba(255, 183, 3, 0.05) 100%)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        '&:hover::after': {
          opacity: 1,
        },
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        transition: 'all 0.2s ease-in-out',
        '&.Mui-selected': {
          backgroundColor: mode === 'dark' ? 'rgba(123, 44, 191, 0.2)' : 'rgba(123, 44, 191, 0.1)',
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'rgba(123, 44, 191, 0.3)' : 'rgba(123, 44, 191, 0.2)',
          },
        },
      },
    },
  },
});

export const createAppTheme = (mode: PaletteMode) => {
  const themeOptions = getDesignTokens(mode);
  const theme = createTheme(themeOptions);

  return createTheme(theme, {
    components: getThemedComponents(mode),
  });
}; 