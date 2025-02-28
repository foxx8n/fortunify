import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  Box,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { TarotSpreadType, TAROT_SPREADS } from '../types/tarot';
import { motion } from 'framer-motion';
import { mysticalGradients } from '../styles/gradients';
import * as Icons from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

const MotionCard = motion(Card);

const StyledCard = styled(MotionCard)(({ theme }) => ({
  height: '100%',
  background: theme.palette.mode === 'dark' 
    ? 'rgba(30, 30, 40, 0.9)' 
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: mysticalGradients.card(theme.palette.mode),
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out',
  },
  '&:hover::before': {
    opacity: 1,
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  position: 'relative',
  zIndex: 1,
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: '50%',
  backgroundColor: `${theme.palette.primary.main}20`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  '& .MuiSvgIcon-root': {
    fontSize: 32,
    color: theme.palette.primary.main,
  },
}));

const SpreadTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontFamily: '"Cinzel", serif',
  fontWeight: 600,
  fontSize: '1.25rem',
  marginBottom: theme.spacing(1),
}));

const SpreadDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  flexGrow: 1,
  fontSize: '0.875rem',
}));

const CardCount = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontStyle: 'italic',
  fontSize: '0.875rem',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

interface TarotSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectSpread: (spreadType: TarotSpreadType) => void;
}

export const TarotSelector: React.FC<TarotSelectorProps> = ({
  open,
  onClose,
  onSelectSpread
}) => {
  const theme = useTheme();
  const { language } = useLanguage();
  const t = translations[language];

  const handleSpreadSelect = (spreadType: TarotSpreadType) => {
    onSelectSpread(spreadType);
    onClose();
  };

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon ? <Icon /> : null;
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          background: theme.palette.mode === 'dark'
            ? 'rgba(20, 20, 30, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${theme.palette.divider}`,
        }
      }}
    >
      <DialogTitle sx={{
        color: theme.palette.text.primary,
        fontFamily: '"Cinzel", serif',
        textAlign: 'center',
        fontSize: '2rem',
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: '1.5rem',
        background: mysticalGradients.title(theme.palette.mode),
      }}>
        {t.tarot.chooseSpreads}
      </DialogTitle>
      <DialogContent sx={{ padding: '2rem' }}>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
        >
          <Grid container spacing={3}>
            {Object.values(TAROT_SPREADS).map((spread) => (
              <Grid item xs={12} sm={6} md={4} key={spread.type} component={motion.div} variants={item}>
                <StyledCard
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: `0 8px 32px ${theme.palette.primary.main}40`
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CardActionArea 
                    onClick={() => handleSpreadSelect(spread.type)}
                    sx={{ height: '100%' }}
                  >
                    <StyledCardContent>
                      <IconWrapper>
                        {getIcon(spread.icon)}
                      </IconWrapper>
                      <SpreadTitle variant="h6">
                        {t.tarot.spreads[spread.type].name || spread.name}
                      </SpreadTitle>
                      <SpreadDescription>
                        {t.tarot.spreads[spread.type].description || spread.description}
                      </SpreadDescription>
                      <CardCount>
                        <Icons.Style fontSize="small" />
                        {spread.cardCount} {t.tarot.cards}
                      </CardCount>
                    </StyledCardContent>
                  </CardActionArea>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}; 