import React from 'react';
import { styled } from '@mui/material/styles';
import { Paper, Typography, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { mysticalGradients } from '../styles/gradients';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface TarotCardProps {
  title: string;
  content: string;
  position?: number;
  total?: number;
}

const StyledCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: theme.palette.mode === 'dark' 
    ? 'rgba(18, 18, 24, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)',
  borderRadius: theme.shape.borderRadius * 2,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  position: 'relative',
  overflow: 'hidden',
  minHeight: 300,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: mysticalGradients.card(theme.palette.mode),
    opacity: 0.1,
    transition: 'opacity 0.3s ease',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `url('/tarot-pattern.png')`,
    backgroundSize: 'cover',
    opacity: 0.05,
    mixBlendMode: 'overlay',
    pointerEvents: 'none',
  },
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
    '&::before': {
      opacity: 0.2,
    },
  },
}));

const CardTitle = styled(Typography)(({ theme }) => ({
  fontFamily: '"Cinzel", serif',
  color: theme.palette.primary.main,
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  position: 'relative',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontSize: '1.2rem',
  fontWeight: 600,
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    width: '30%',
    height: 2,
    background: mysticalGradients.border(theme.palette.mode),
  },
  '&::before': {
    left: 0,
  },
  '&::after': {
    right: 0,
  },
}));

const CardName = styled(Typography)(({ theme }) => ({
  color: theme.palette.secondary.main,
  textAlign: 'center',
  fontStyle: 'italic',
  fontSize: '1rem',
  marginBottom: theme.spacing(2),
  '&::before': {
    content: '"★ "',
    color: theme.palette.secondary.main,
  },
  '&::after': {
    content: '" ★"',
    color: theme.palette.secondary.main,
  },
}));

const CardContent = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  textAlign: 'center',
  position: 'relative',
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  fontSize: '0.95rem',
  lineHeight: 1.6,
  fontStyle: 'italic',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  color: alpha(theme.palette.primary.main, 0.3),
  transform: 'rotate(30deg)',
}));

const TarotCard: React.FC<TarotCardProps> = ({ title, content, position, total }) => {
  // Extract card name if present
  const cardName = React.useMemo(() => {
    // First try to find the card name after "The Message:" or "Mesaj:"
    const messageMatch = content.match(/\*\*(The Message|Mesaj):\*\*\s*([^.\n]+)/i);
    if (messageMatch) {
      return messageMatch[2].trim();
    }

    // Fallback to looking for Card: or Kart: pattern
    const cardMatch = content.match(/(?:Card:|Kart:)\s*([^.!?\n]+)/i);
    return cardMatch ? cardMatch[1].trim() : null;
  }, [content]);
  
  // Clean content by removing the card name and message markers
  const cleanContent = React.useMemo(() => {
    let cleaned = content;
    
    // Remove any "The Message:" or "Mesaj:" markers
    cleaned = cleaned.replace(/\*\*(The Message|Mesaj):\*\*\s*/gi, '');
    
    // Remove the card name line if present
    cleaned = cleaned.replace(/(?:Card:|Kart:)\s*[^.!?\n]+\n?/gi, '');
    
    // Clean up any extra whitespace
    cleaned = cleaned.trim();
    
    return cleaned;
  }, [content]);

  return (
    <StyledCard elevation={3}>
      <IconWrapper>
        <AutoAwesomeIcon />
      </IconWrapper>
      <CardTitle variant="h6">
        {title}
      </CardTitle>
      {cardName && (
        <CardName>
          {cardName}
        </CardName>
      )}
      <CardContent>
        {cleanContent}
      </CardContent>
    </StyledCard>
  );
};

export default TarotCard; 