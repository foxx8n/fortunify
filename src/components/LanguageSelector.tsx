import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { mysticalGradients } from '../styles/gradients';
import { useLanguage } from '../contexts/LanguageContext';
import ReactCountryFlag from 'react-country-flag';

const Container = styled(Box)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: theme.spacing(4),
  background: mysticalGradients.background(theme.palette.mode),
}));

const LanguageGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: theme.spacing(3),
  maxWidth: '800px',
  padding: theme.spacing(3),
}));

const LanguageCard = styled(motion.div)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: mysticalGradients.hover(theme.palette.mode),
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  backgroundColor: `${theme.palette.primary.main}20`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 1,
  overflow: 'hidden',
}));

const languages = [
  {
    code: 'en',
    name: 'English',
    countryCode: 'GB',
  },
  {
    code: 'tr',
    name: 'Türkçe',
    countryCode: 'TR',
  },
] as const;

const LanguageSelector: React.FC = () => {
  const { setLanguage } = useLanguage();

  return (
    <Container>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
          Select Your Language
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
          Dilinizi Seçin
        </Typography>
      </Box>
      <LanguageGrid>
        {languages.map((lang) => (
          <LanguageCard
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <IconWrapper>
              <ReactCountryFlag
                countryCode={lang.countryCode}
                svg
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </IconWrapper>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 500 }}>
              {lang.name}
            </Typography>
          </LanguageCard>
        ))}
      </LanguageGrid>
    </Container>
  );
};

export default LanguageSelector; 