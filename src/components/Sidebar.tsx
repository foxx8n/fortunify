import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  List,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  ListItemButton,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Drawer,
  Menu,
  MenuItem,
  Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsIcon from '@mui/icons-material/Settings';
import LanguageIcon from '@mui/icons-material/Language';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import * as Icons from '@mui/icons-material';
import { ChatSession } from '../types/chat';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { alpha } from '@mui/material/styles';
import ReactCountryFlag from 'react-country-flag';

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 280,
  height: '100vh',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgb(18, 18, 24)' : 'rgb(255, 255, 255)',
  display: 'flex',
  flexDirection: 'column',
  border: 'none',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, rgba(123, 44, 191, 0.1) 0%, rgba(0, 0, 0, 0) 100%)'
      : 'linear-gradient(135deg, rgba(123, 44, 191, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    pointerEvents: 'none',
  }
}));

const Header = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const MotionListItemButton = motion(ListItemButton);

const SessionItem = styled(MotionListItemButton)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(123, 44, 191, 0.1)' : 'rgba(123, 44, 191, 0.05)',
  backdropFilter: 'blur(5px)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(123, 44, 191, 0.2)' : 'rgba(123, 44, 191, 0.1)',
    boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(123, 44, 191, 0.3)' : 'rgba(123, 44, 191, 0.15)',
    boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(123, 44, 191, 0.35)' : 'rgba(123, 44, 191, 0.2)',
    },
  },
}));

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession?: (sessionId: string) => void;
  onDeleteAllSessions?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onDeleteSession,
  onDeleteAllSessions,
  isOpen,
  onClose,
}) => {
  const { mode, toggleColorMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  console.log('Sidebar render - sessions:', sessions);
  console.log('Sidebar render - currentSessionId:', currentSessionId);

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon ? <Icon color="primary" fontSize="medium" /> : null;
  };

  const handleSessionSelect = (sessionId: string) => {
    console.log('Session selected:', sessionId);
    onSessionSelect(sessionId);
  };

  const handleDeleteClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSessionToDelete(sessionId);
  };

  const handleConfirmDelete = () => {
    if (sessionToDelete && onDeleteSession) {
      onDeleteSession(sessionToDelete);
    }
    setSessionToDelete(null);
  };

  const handleConfirmDeleteAll = () => {
    if (onDeleteAllSessions) {
      onDeleteAllSessions();
    }
    setConfirmDeleteAll(false);
  };

  const handleLanguageChange = (newLang: 'en' | 'tr') => {
    setLanguage(newLang);
  };

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={onClose}
      variant="temporary"
      PaperProps={{
        sx: {
          width: 280,
          border: 'none',
          boxShadow: 'none',
          backgroundColor: 'transparent',
          backgroundImage: 'none',
          '& > *': {
            backdropFilter: 'blur(20px)',
          }
        },
      }}
      ModalProps={{
        sx: {
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
          }
        }
      }}
      sx={{
        '& .MuiDrawer-paper': {
          backgroundColor: 'transparent',
        }
      }}
    >
      <SidebarContainer>
        <Header>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={onClose} size="small">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="h1">
              Fortunify
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={() => setConfirmDeleteAll(true)} color="primary" size="small">
              <DeleteIcon />
            </IconButton>
            <IconButton onClick={onNewSession} color="primary" size="small">
              <AddIcon />
            </IconButton>
          </Box>
        </Header>
        <Divider />
        <List sx={{ overflow: 'auto', flex: 1, px: 1 }}>
          {sessions.map((session) => (
            <SessionItem
              key={session.id}
              selected={session.id === currentSessionId}
              onClick={() => {
                handleSessionSelect(session.id);
                onClose();
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              sx={{ pr: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {getIcon(session.method.icon)}
              </ListItemIcon>
              <ListItemText
                primary={session.title}
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ maxWidth: '160px' }}
                  >
                    {session.lastMessage}
                  </Typography>
                }
              />
              <IconButton
                size="small"
                onClick={(e) => handleDeleteClick(e, session.id)}
                sx={{
                  opacity: 0.7,
                  '&:hover': { opacity: 1 },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </SessionItem>
          ))}
        </List>

        <Divider />
        <List>
          <ListItemButton onClick={() => setSettingsOpen(!settingsOpen)}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary={t.ui.settings} />
            {settingsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton 
                sx={{ pl: 4 }}
                onClick={toggleColorMode}
              >
                <ListItemIcon>
                  {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </ListItemIcon>
                <ListItemText primary={mode === 'dark' ? t.ui.lightMode : t.ui.darkMode} />
              </ListItemButton>
              <ListItemButton 
                sx={{ pl: 4 }}
                onClick={() => handleLanguageChange(language === 'en' ? 'tr' : 'en')}
              >
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={language === 'en' ? 'Türkçe' : 'English'}
                />
              </ListItemButton>
            </List>
          </Collapse>
        </List>

        {/* Delete Single Session Dialog */}
        <Dialog
          open={!!sessionToDelete}
          onClose={() => setSessionToDelete(null)}
        >
          <DialogTitle>{t.ui.deleteSession}</DialogTitle>
          <DialogContent>
            <Typography>{t.ui.confirmDelete}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSessionToDelete(null)}>{t.ui.cancel}</Button>
            <Button onClick={handleConfirmDelete} color="error">{t.ui.delete}</Button>
          </DialogActions>
        </Dialog>

        {/* Delete All Sessions Dialog */}
        <Dialog
          open={confirmDeleteAll}
          onClose={() => setConfirmDeleteAll(false)}
        >
          <DialogTitle>{t.ui.deleteAll}</DialogTitle>
          <DialogContent>
            <Typography>{t.ui.confirmDeleteAll}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDeleteAll(false)}>{t.ui.cancel}</Button>
            <Button onClick={handleConfirmDeleteAll} color="error">{t.ui.deleteAllButton}</Button>
          </DialogActions>
        </Dialog>
      </SidebarContainer>
    </Drawer>
  );
};

export default Sidebar; 