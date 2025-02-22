import '@mui/material/styles';
import { Theme, ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface CustomTheme extends Theme {
    background: {
      gradient: string;
    }
  }

  interface CustomThemeOptions extends ThemeOptions {
    background?: {
      gradient?: string;
    }
  }

  export function createTheme(options?: CustomThemeOptions): CustomTheme;
} 