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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import * as Icons from '@mui/icons-material';
import { ChatSession } from '../types/chat';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 280,
  height: '100vh',
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
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
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
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
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

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
          boxShadow: 3,
        },
      }}
    >
      <SidebarContainer>
        <Header>
          <Typography variant="h6" component="h1">
            Fortunify
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={toggleColorMode} color="primary" size="small">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
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

        {/* Delete Single Session Dialog */}
        <Dialog
          open={!!sessionToDelete}
          onClose={() => setSessionToDelete(null)}
        >
          <DialogTitle>Delete Session</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this session?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSessionToDelete(null)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error">Delete</Button>
          </DialogActions>
        </Dialog>

        {/* Delete All Sessions Dialog */}
        <Dialog
          open={confirmDeleteAll}
          onClose={() => setConfirmDeleteAll(false)}
        >
          <DialogTitle>Delete All Sessions</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete all sessions? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDeleteAll(false)}>Cancel</Button>
            <Button onClick={handleConfirmDeleteAll} color="error">Delete All</Button>
          </DialogActions>
        </Dialog>
      </SidebarContainer>
    </Drawer>
  );
};

export default Sidebar; 