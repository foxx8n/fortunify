import { PaletteMode } from '@mui/material';

export const mysticalGradients = {
  background: (mode: PaletteMode) =>
    mode === 'dark'
      ? 'linear-gradient(135deg, rgba(123, 44, 191, 0.15) 0%, rgba(123, 44, 191, 0.05) 100%)'
      : 'linear-gradient(135deg, rgba(123, 44, 191, 0.1) 0%, rgba(255, 183, 3, 0.1) 100%)',
  
  radial: (mode: PaletteMode) =>
    mode === 'dark'
      ? 'radial-gradient(circle at 50% 50%, rgba(123, 44, 191, 0.1) 0%, rgba(0, 0, 0, 0) 100%)'
      : 'radial-gradient(circle at 50% 50%, rgba(123, 44, 191, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
  
  border: (mode: PaletteMode) =>
    mode === 'dark'
      ? 'linear-gradient(to right, transparent, rgba(123, 44, 191, 0.5), transparent)'
      : 'linear-gradient(to right, transparent, rgba(123, 44, 191, 0.3), transparent)',
  
  hover: (mode: PaletteMode) =>
    mode === 'dark'
      ? 'linear-gradient(135deg, rgba(123, 44, 191, 0.2) 0%, rgba(255, 183, 3, 0.1) 100%)'
      : 'linear-gradient(135deg, rgba(123, 44, 191, 0.15) 0%, rgba(255, 183, 3, 0.15) 100%)',
}; 