declare module 'react-country-flag' {
  import * as React from 'react';

  interface ReactCountryFlagProps {
    countryCode: string;
    svg?: boolean;
    style?: React.CSSProperties;
    className?: string;
  }

  const ReactCountryFlag: React.FC<ReactCountryFlagProps>;

  export default ReactCountryFlag;
} 