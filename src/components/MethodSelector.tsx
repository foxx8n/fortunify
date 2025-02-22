import React, { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  useTheme,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import * as Icons from '@mui/icons-material';
import { FortuneMethod, FORTUNE_METHODS } from '../types/chat';
import { motion } from 'framer-motion';
import { mysticalGradients } from '../styles/gradients';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

const MotionCard = motion(Card);

const MethodCard = styled(MotionCard)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  height: '100%',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  zIndex: 1,
  '& .MuiCardContent-root': {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: theme.spacing(2),
  },
  '& .MuiCardActionArea-root': {
    height: '100%',
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    position: 'relative',
    zIndex: 2,
  },
  '&:hover': {
    borderColor: theme.palette.primary.main,
    '& .MuiCardActionArea-root': {
      background: mysticalGradients.hover(theme.palette.mode),
    },
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 24, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${theme.palette.divider}`,
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: mysticalGradients.background(theme.palette.mode),
      opacity: 0.5,
      pointerEvents: 'none',
      zIndex: 0,
    },
  },
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
}));

interface MethodSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (method: FortuneMethod) => void;
}

const MethodSelector: React.FC<MethodSelectorProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const theme = useTheme();
  const { language } = useLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  const handleMethodSelect = (method: FortuneMethod) => {
    console.log('Method selected:', method);
    onSelect({
      ...method,
      name: t.methods[method.id as keyof typeof t.methods].name,
      description: t.methods[method.id as keyof typeof t.methods].description,
    });
    onClose();
  };

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon ? <Icon fontSize="large" color="primary" /> : null;
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      onClick={(e) => {
        e.stopPropagation();
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
    >
      <DialogTitle 
        onClick={(e) => e.stopPropagation()}
        sx={{ 
          textAlign: 'center', 
          pb: 3,
          background: mysticalGradients.radial(theme.palette.mode),
        }}
      >
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          {t.ui.selectMethod}
        </Typography>
      </DialogTitle>
      <DialogContent 
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        sx={{ pb: 4 }}
      >
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {FORTUNE_METHODS.map((method) => {
            const localizedMethod = t.methods[method.id as keyof typeof t.methods];
            return (
              <Grid item xs={12} sm={6} md={4} key={method.id}>
                <MethodCard
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: `0 0 20px ${theme.palette.primary.main}40`,
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <CardActionArea
                    component="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMethodSelect({
                        ...method,
                        name: localizedMethod.name,
                        description: localizedMethod.description,
                      });
                    }}
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      zIndex: 2,
                      border: 'none',
                      background: 'none',
                      width: '100%',
                      padding: 0,
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    <CardContent sx={{ width: '100%', p: 3, position: 'relative', zIndex: 3 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          backgroundColor: `${theme.palette.primary.main}20`,
                          mb: 2,
                        }}
                      >
                        {getIcon(method.icon)}
                      </Box>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 500, mb: 1 }}>
                        {localizedMethod.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ flex: 1 }}
                      >
                        {localizedMethod.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </MethodCard>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
    </StyledDialog>
  );
};

export default MethodSelector; 