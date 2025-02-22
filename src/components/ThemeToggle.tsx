import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const MotionIconButton = motion(IconButton);

const StyledIconButton = styled(MotionIconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(6),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[4],
  zIndex: 1300,
  '&:hover': {
    backgroundColor: theme.palette.background.paper,
  },
}));

const ThemeToggle: React.FC = () => {
  const { mode, toggleColorMode } = useTheme();

  return (
    <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
      <StyledIconButton
        onClick={toggleColorMode}
        color="primary"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </StyledIconButton>
    </Tooltip>
  );
};

export default ThemeToggle; 