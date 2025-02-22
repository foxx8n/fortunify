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
  maxWidth: '60%',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
  },
}));

const MessageBubble = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isUser',
})<{ isUser: boolean }>(({ theme, isUser }) => ({
  padding: theme.spacing(2),
  maxWidth: '70%',
  position: 'relative',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  backgroundColor: isUser
    ? theme.palette.primary.main
    : theme.palette.background.paper,
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 'inherit',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
  },
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.background.paper,
  position: 'relative',
  zIndex: 1,
  borderRadius: theme.shape.borderRadius * 2,
  marginBottom: theme.spacing(2),
}));

const MethodHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingLeft: theme.spacing(9),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  position: 'relative',
  zIndex: 2,
  borderRadius: theme.shape.borderRadius * 2,
  marginTop: theme.spacing(2),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: mysticalGradients.border(theme.palette.mode),
  },
}));

interface ChatInterfaceProps {
  messages: Message[];
  method: FortuneMethod;
  onSendMessage: (content: string) => void;
  onUploadImage?: (file: File) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  method,
  onSendMessage,
  onUploadImage,
}) => {
  console.log('ChatInterface render - method:', method);
  console.log('ChatInterface render - messages:', messages);
  
  const [input, setInput] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (input.trim()) {
      console.log('Sending message:', input.trim());
      onSendMessage(input.trim());
      setInput('');
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

      if (onUploadImage) {
        onUploadImage(compressedFile);
      }
    } catch (error) {
      console.error('Failed to process image:', error);
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
      <MessagesContainer>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
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
                        aspectRatio: `${message.image.width} / ${message.image.height}`,
                      }}
                    />
                  </ImageContainer>
                )}
              </MessageBubble>
            </motion.div>
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
            placeholder={`Ask the ${method.name.toLowerCase()} fortune teller...`}
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