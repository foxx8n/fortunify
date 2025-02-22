import React, { useState, useCallback, useRef } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { useTheme } from './contexts/ThemeContext';
import { createAppTheme } from './styles/theme';
import { mysticalGradients } from './styles/gradients';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import MethodSelector from './components/MethodSelector';
import LanguageSelector from './components/LanguageSelector';
import { ChatSession, Message, FortuneMethod, FORTUNE_METHODS } from './types/chat';
import { translations } from './translations';
import { v4 as uuidv4 } from 'uuid';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import * as Icons from '@mui/icons-material';

const MethodGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  position: 'relative',
  willChange: 'transform',
}));

const MethodCard = styled(motion.div)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  willChange: 'transform',
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
    willChange: 'opacity',
  },
  '&:hover::before': {
    opacity: 1,
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: '50%',
  backgroundColor: `${theme.palette.primary.main}20`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 1,
}));

const ThemedApp = () => {
  const { mode } = useTheme();
  const { language, isLanguageSelected } = useLanguage();
  const theme = createAppTheme(mode);
  const gridRef = useRef<HTMLDivElement>(null);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isMethodSelectorOpen, setIsMethodSelectorOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const t = translations[language];

  const handleNewSession = useCallback(() => {
    setIsMethodSelectorOpen(true);
  }, []);

  const handleMethodSelect = useCallback((method: FortuneMethod) => {
    console.log('Creating new session with method:', method);
    const newSession: ChatSession = {
      id: uuidv4(),
      title: `${t.methods[method.id as keyof typeof t.methods].name} - ${sessions.length + 1}`,
      method: {
        ...method,
        name: t.methods[method.id as keyof typeof t.methods].name,
        description: t.methods[method.id as keyof typeof t.methods].description,
      },
      timestamp: new Date(),
      messages: [],
    };
    setSessions((prevSessions) => [...prevSessions, newSession]);
    setCurrentSessionId(newSession.id);
    setIsMethodSelectorOpen(false);
  }, [sessions.length, t.methods]);

  const handleSendMessage = useCallback((content: string, sender: 'user' | 'fortune-teller' = 'user') => {
    if (!currentSessionId) return;

    const newMessage: Message = {
      id: uuidv4(),
      content,
      sender,
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
  }, [currentSessionId]);

  const handleUploadImage = useCallback((file: File) => {
    if (!currentSessionId) return;

    // Create a blob URL for the uploaded file
    const imageUrl = URL.createObjectURL(file);

    // Create a message for the image upload
    const newMessage: Message = {
      id: uuidv4(),
      content: '',
      sender: 'user',
      timestamp: new Date(),
      image: {
        url: imageUrl,
        width: 800, // We're using the max width from our compression
        height: 600, // This will be adjusted based on aspect ratio
      },
    };

    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              messages: [...session.messages, newMessage],
              lastMessage: '📎 Image uploaded',
            }
          : session
      )
    );

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

  // If language is not selected, show language selector
  if (!isLanguageSelected) {
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <LanguageSelector />
      </MuiThemeProvider>
    );
  }

  const currentSession = sessions.find(
    (session) => session.id === currentSessionId
  );

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
              {!isSidebarOpen && (
                <IconButton
                  onClick={() => setIsSidebarOpen(true)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 1200,
                    backgroundColor: 'background.paper',
                    boxShadow: 1,
                    width: 40,
                    height: 40,
                    '&:hover': {
                      backgroundColor: 'background.paper',
                    },
                  }}
                  color="primary"
                >
                  <MenuIcon />
                </IconButton>
              )}
              <ChatInterface
                messages={currentSession.messages}
                method={currentSession.method}
                onSendMessage={handleSendMessage}
                onUploadImage={handleUploadImage}
                sessionId={currentSession.id}
              />
            </>
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                backgroundColor: 'background.default',
                color: 'text.secondary',
                background: mysticalGradients.background(mode),
                flexDirection: 'column',
                gap: 2,
                position: 'relative',
                zIndex: 0,
                pl: '30%',
                pr: '30%',
                pt: 10,
                overflow: 'auto',
                overscrollBehavior: 'none',
              }}
            >
              {!isSidebarOpen && (
                <IconButton
                  onClick={() => setIsSidebarOpen(true)}
                  sx={{
                    position: 'fixed',
                    top: 8,
                    left: 8,
                    zIndex: 1200,
                    backgroundColor: 'background.paper',
                    boxShadow: 1,
                    width: 40,
                    height: 40,
                    '&:hover': {
                      backgroundColor: 'background.paper',
                    },
                  }}
                  color="primary"
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Box sx={{ textAlign: 'center', width: '100%', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                  {t.welcome.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t.welcome.subtitle}
                </Typography>
              </Box>
              <MethodGrid ref={gridRef}>
                {FORTUNE_METHODS.map((method) => {
                  const localizedMethod = t.methods[method.id as keyof typeof t.methods];
                  return (
                    <MethodCard
                      key={method.id}
                      onClick={() => handleMethodSelect({
                        ...method,
                        name: localizedMethod.name,
                        description: localizedMethod.description,
                      })}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      layout
                      transition={{ 
                        layout: { duration: 0.3 },
                        scale: { type: "spring", stiffness: 300, damping: 25 }
                      }}
                    >
                      <IconWrapper>
                        {React.createElement(
                          (Icons as any)[method.icon],
                          { color: 'primary', fontSize: 'large' }
                        )}
                      </IconWrapper>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 500 }}>
                        {localizedMethod.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {localizedMethod.description}
                      </Typography>
                    </MethodCard>
                  );
                })}
              </MethodGrid>
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
    <LanguageProvider>
      <ThemedApp />
    </LanguageProvider>
  </ThemeProvider>
);

export default App;
