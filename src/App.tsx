import React, { useState, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './contexts/ThemeContext';
import { createAppTheme } from './styles/theme';
import { mysticalGradients } from './styles/gradients';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import MethodSelector from './components/MethodSelector';
import { ChatSession, Message, FortuneMethod } from './types/chat';
import { v4 as uuidv4 } from 'uuid';

const ThemedApp = () => {
  const { mode } = useTheme();
  const theme = createAppTheme(mode);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isMethodSelectorOpen, setIsMethodSelectorOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentSession = sessions.find(
    (session) => session.id === currentSessionId
  );

  const handleNewSession = useCallback(() => {
    setIsMethodSelectorOpen(true);
  }, []);

  const handleMethodSelect = useCallback((method: FortuneMethod) => {
    console.log('Creating new session with method:', method); // Debug log
    const newSession: ChatSession = {
      id: uuidv4(),
      title: `${method.name} - Reading ${sessions.length + 1}`,
      method,
      timestamp: new Date(),
      messages: [],
    };
    setSessions((prevSessions) => {
      const nextSessions = [...prevSessions, newSession];
      console.log('Updated sessions:', nextSessions); // Debug log
      return nextSessions;
    });
    console.log('Setting current session ID to:', newSession.id); // Debug log
    setCurrentSessionId(newSession.id);
    setIsMethodSelectorOpen(false);
  }, []);

  const handleSendMessage = useCallback((content: string) => {
    if (!currentSessionId) return;

    const newMessage: Message = {
      id: uuidv4(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              messages: [...session.messages, newMessage],
              lastMessage: content,
            }
          : session
      )
    );

    // TODO: Add fortune teller response logic here based on the session.method
  }, [currentSessionId]);

  const handleUploadImage = useCallback((file: File) => {
    if (!currentSessionId) return;

    // Create a message for the image upload
    const newMessage: Message = {
      id: uuidv4(),
      content: `📎 Uploaded image: ${file.name}`,
      sender: 'user',
      timestamp: new Date(),
    };

    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              messages: [...session.messages, newMessage],
              lastMessage: `📎 Image: ${file.name}`,
            }
          : session
      )
    );

    // TODO: Add image processing logic here
    console.log('Image uploaded:', file);
  }, [currentSessionId]);

  const handleDeleteSession = useCallback((sessionId: string) => {
    setSessions((prevSessions) => prevSessions.filter((session) => session.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  }, [currentSessionId]);

  const handleDeleteAllSessions = useCallback(() => {
    setSessions([]);
    setCurrentSessionId(null);
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSessionSelect={setCurrentSessionId}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onDeleteAllSessions={handleDeleteAllSessions}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <Box sx={{ flex: 1, position: 'relative' }}>
          {currentSession ? (
            <>
              <IconButton
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: isSidebarOpen ? 288 : 8, // 280px (sidebar width) + 8px
                  zIndex: 1200,
                  backgroundColor: 'background.paper',
                  boxShadow: 1,
                  transition: 'left 0.3s ease',
                  transform: isSidebarOpen ? 'rotate(180deg)' : 'none',
                  '&:hover': {
                    backgroundColor: 'background.paper',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
              <ChatInterface
                messages={currentSession.messages}
                method={currentSession.method}
                onSendMessage={handleSendMessage}
                onUploadImage={handleUploadImage}
              />
            </>
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'background.default',
                color: 'text.secondary',
                background: mysticalGradients.background(mode),
                flexDirection: 'column',
                gap: 2,
                position: 'relative',
                zIndex: 0,
              }}
            >
              <IconButton
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: isSidebarOpen ? 288 : 8, // 280px (sidebar width) + 8px
                  zIndex: 1200,
                  backgroundColor: 'background.paper',
                  boxShadow: 1,
                  transition: 'left 0.3s ease',
                  transform: isSidebarOpen ? 'rotate(180deg)' : 'none',
                  '&:hover': {
                    backgroundColor: 'background.paper',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h5" sx={{ fontWeight: 500 }}>
                Welcome to Fortunify
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Select a chat or start a new fortune reading session
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      <MethodSelector
        open={isMethodSelectorOpen}
        onClose={() => setIsMethodSelectorOpen(false)}
        onSelect={handleMethodSelect}
      />
    </MuiThemeProvider>
  );
};

const App = () => (
  <ThemeProvider>
    <ThemedApp />
  </ThemeProvider>
);

export default App;
