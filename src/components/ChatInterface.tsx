import React, { useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import * as Icons from '@mui/icons-material';
import { Message, FortuneMethod } from '../types/chat';
import { mysticalGradients } from '../styles/gradients';
import { motion, AnimatePresence } from 'framer-motion';
import ImageIcon from '@mui/icons-material/Image';
import { compressImage, createImagePreview } from '../utils/imageUtils';
import ImagePreviewDialog from './ImagePreviewDialog';
import { Crop } from 'react-image-crop';
import { analyzeImage, getFortuneTelling } from '../utils/aiService';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { alpha } from '@mui/material/styles';

const ChatContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'transparent',
  position: 'relative',
  paddingLeft: '30%',
  paddingRight: '30%',
  paddingBottom: '5vh',
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  position: 'relative',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
  },
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  maxWidth: '100%',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  marginTop: theme.spacing(2),
  boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)'}`,
  '& img': {
    width: '100%',
    height: 'auto',
    display: 'block',
    objectFit: 'cover',
  }
}));

const MessageWrapper = styled(motion.div)<{ isUser: boolean }>(({ isUser }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: isUser ? 'flex-end' : 'flex-start',
  alignItems: 'flex-end',
}));

const MessageBubble = styled(Paper)<{ isUser: boolean }>(({ theme, isUser }) => ({
  padding: theme.spacing(2),
  maxWidth: '70%',
  width: 'fit-content',
  marginBottom: theme.spacing(1),
  backgroundColor: isUser ? theme.palette.primary.main : theme.palette.mode === 'dark' ? 'rgba(18, 18, 24, 0.8)' : 'rgba(255, 255, 255, 0.8)',
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  borderRadius: '20px',
  boxShadow: isUser 
    ? `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}, inset 0 0 10px ${alpha(theme.palette.primary.light, 0.3)}`
    : theme.palette.mode === 'dark'
      ? `0 0 20px ${alpha('#FFB703', 0.1)}, inset 0 0 10px ${alpha('#FFB703', 0.05)}`
      : `0 0 20px ${alpha(theme.palette.primary.main, 0.1)}, inset 0 0 10px ${alpha(theme.palette.primary.light, 0.05)}`,
  backdropFilter: 'blur(10px)',
  border: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: isUser 
      ? `0 0 30px ${alpha(theme.palette.primary.main, 0.5)}, inset 0 0 20px ${alpha(theme.palette.primary.light, 0.4)}`
      : theme.palette.mode === 'dark'
        ? `0 0 25px ${alpha('#FFB703', 0.15)}, inset 0 0 15px ${alpha('#FFB703', 0.08)}`
        : `0 0 25px ${alpha(theme.palette.primary.main, 0.15)}, inset 0 0 15px ${alpha(theme.palette.primary.light, 0.08)}`
  }
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 24, 0.8)' : 'rgba(255, 255, 255, 0.8)',
  position: 'relative',
  zIndex: 1,
  borderRadius: theme.shape.borderRadius * 2,
  marginBottom: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  border: 'none'
}));

const MethodHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingLeft: theme.spacing(9),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 24, 0.8)' : 'rgba(255, 255, 255, 0.8)',
  position: 'relative',
  zIndex: 2,
  borderRadius: theme.shape.borderRadius * 2,
  marginTop: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  border: 'none'
}));

interface ChatInterfaceProps {
  messages: Message[];
  method: FortuneMethod;
  onSendMessage: (content: string, sender?: 'user' | 'fortune-teller') => void;
  onUploadImage?: (file: File) => void;
  sessionId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  method,
  onSendMessage,
  onUploadImage,
  sessionId,
}) => {
  const { language } = useLanguage();
  const t = translations[language];
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (messagesContainerRef.current && messages.length > 0) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  const [input, setInput] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (input.trim()) {
      const message = input.trim();
      setInput('');
      console.log('Sending message:', message);
      onSendMessage(message);
      
      try {
        const response = await getFortuneTelling(message, method.id, language, sessionId);
        onSendMessage(response, 'fortune-teller');
      } catch (error) {
        console.error('Failed to get fortune telling:', error);
        onSendMessage(t.chat.readingError, 'fortune-teller');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const preview = await createImagePreview(file);
        setPreviewImage(preview);
        setSelectedFile(file);
      } catch (error) {
        console.error('Failed to create image preview:', error);
      }
    }
  };

  const handleImageConfirm = async (crop: Crop) => {
    if (!selectedFile) return;

    try {
      const compressedBlob = await compressImage(selectedFile);
      const compressedFile = new File([compressedBlob], selectedFile.name, {
        type: 'image/jpeg',
      });

      // Create a temporary URL for the compressed image
      const imageUrl = URL.createObjectURL(compressedBlob);

      // Get AI analysis of the image based on the method
      const analysis = await analyzeImage(imageUrl, method.id, language);

      // Create messages for both the image and the AI's response
      if (onUploadImage) {
        onUploadImage(compressedFile);
      }

      // Add the AI's response
      onSendMessage(analysis, 'fortune-teller');

      // Clean up the temporary URL
      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error('Failed to process image:', error);
      onSendMessage(t.chat.imageError, 'fortune-teller');
    }

    setPreviewImage(null);
    setSelectedFile(null);
  };

  const getMethodIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon ? <Icon fontSize="large" color="primary" /> : null;
  };

  return (
    <ChatContainer>
      <MethodHeader>
        <Box sx={{ minWidth: 48, display: 'flex', alignItems: 'center' }}>
          {getMethodIcon(method.icon)}
        </Box>
        <Box>
          <Typography variant="h6">{method.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {method.description}
          </Typography>
        </Box>
      </MethodHeader>
      <MessagesContainer ref={messagesContainerRef}>
        <AnimatePresence>
          {messages.map((message) => (
            <MessageWrapper
              key={message.id}
              isUser={message.sender === 'user'}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <MessageBubble isUser={message.sender === 'user'}>
                <Typography variant="body1">{message.content}</Typography>
                {message.image && (
                  <ImageContainer>
                    <img
                      src={message.image.url}
                      alt="Uploaded"
                      style={{
                        maxHeight: '300px',
                        objectFit: 'cover',
                        width: '100%',
                      }}
                    />
                  </ImageContainer>
                )}
              </MessageBubble>
            </MessageWrapper>
          ))}
        </AnimatePresence>
      </MessagesContainer>
      <InputContainer>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.chat.placeholder.replace('{method}', method.name)}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: '28px',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'transparent',
                },
              },
            }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <IconButton
              color="primary"
              onClick={handleUploadClick}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: '24px',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  '& .MuiSvgIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ImageIcon />
            </IconButton>
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!input.trim()}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: '24px',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  '& .MuiSvgIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </InputContainer>
      <ImagePreviewDialog
        open={!!previewImage}
        onClose={() => {
          setPreviewImage(null);
          setSelectedFile(null);
        }}
        imageUrl={previewImage || ''}
        onConfirm={handleImageConfirm}
      />
    </ChatContainer>
  );
};

export default ChatInterface; 