import React from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import TarotCard from './TarotCard';
import { TarotSpreadType, TAROT_SPREADS } from '../types/tarot';

interface TarotSpreadDisplayProps {
  content: string;
  spreadType: TarotSpreadType;
}

const SpreadContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'grid',
  gap: theme.spacing(3),
  padding: theme.spacing(2),
}));

// Different grid layouts for each spread type
const spreadLayouts = {
  [TarotSpreadType.SINGLE_CARD]: {
    gridTemplateColumns: '1fr',
    maxWidth: '300px',
    margin: '0 auto',
  },
  [TarotSpreadType.THREE_CARD]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  [TarotSpreadType.CELTIC_CROSS]: {
    gridTemplateAreas: `
      ". card5 . card9 ."
      "card4 card1 card2 card6 card10"
      ". card3 . card7 ."
      ". . . card8 ."
    `,
    gridTemplateColumns: 'repeat(5, 1fr)',
  },
  [TarotSpreadType.HORSESHOE]: {
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '16px',
  },
  [TarotSpreadType.PENTAGRAM]: {
    gridTemplateAreas: `
      ". . card1 . ."
      ". card2 . card3 ."
      "card4 . . . card5"
    `,
    gridTemplateColumns: 'repeat(5, 1fr)',
  },
  [TarotSpreadType.TREE_OF_LIFE]: {
    gridTemplateAreas: `
      ". . card1 . ."
      ". card2 . card3 ."
      ". . card6 . ."
      "card4 . . . card5"
      ". card7 . card8 ."
      ". . card9 . ."
      ". . card10 . ."
    `,
    gridTemplateColumns: 'repeat(5, 1fr)',
  },
};

const TarotSpreadDisplay: React.FC<TarotSpreadDisplayProps> = ({ content, spreadType }) => {
  // Split content into parts based on spread positions
  const positions = TAROT_SPREADS[spreadType].positions;
  
  // Parse content to extract individual card readings
  const parseContent = (content: string) => {
    console.log('Raw content:', content);

    // Check if the content is already formatted with **
    if (content.includes('**')) {
      // Handle formatted content
      const mainContent = content.split('**').slice(1).join('**');
      const parts = mainContent.split('**').map(part => part.trim()).filter(Boolean);
      
      const readings: { [key: string]: string } = {};
      parts.forEach(part => {
        const colonIndex = part.indexOf(':');
        if (colonIndex > -1) {
          const title = part.substring(0, colonIndex).trim();
          const text = part.substring(colonIndex + 1).trim();
          readings[title] = text;
        }
      });
      return readings;
    } else {
      // Handle unformatted content - treat the entire content as a single reading
      return {
        [positions[0].name]: content
      };
    }
  };

  const readings = parseContent(content);

  // Create an array of position-content pairs
  const cards = positions.map((position) => {
    // For single card readings with unformatted content, use the entire content
    if (spreadType === TarotSpreadType.SINGLE_CARD && !content.includes('**')) {
      return {
        title: position.name,
        content: content,
        description: position.description,
      };
    }

    // Try to find matching content for each position
    const matchingContent = Object.entries(readings).find(([title]) => {
      const normalizedTitle = title.toLowerCase();
      const normalizedPosition = position.name.toLowerCase();
      return normalizedTitle.includes(normalizedPosition) || normalizedPosition.includes(normalizedTitle);
    });

    return {
      title: position.name,
      content: matchingContent ? matchingContent[1] : '',
      description: position.description,
    };
  });

  return (
    <SpreadContainer sx={spreadLayouts[spreadType]}>
      {cards.map((card, index) => (
        <Box
          key={index}
          sx={{
            gridArea: spreadType !== TarotSpreadType.SINGLE_CARD && 
                     spreadType !== TarotSpreadType.THREE_CARD && 
                     spreadType !== TarotSpreadType.HORSESHOE 
              ? `card${index + 1}` 
              : undefined,
            transform: spreadType === TarotSpreadType.HORSESHOE
              ? `rotate(${-30 + (index * 10)}deg)` // Create a curved layout for horseshoe
              : undefined,
          }}
        >
          <TarotCard
            title={card.title}
            content={card.content || 'No reading available'} // Fallback text
            position={index + 1}
            total={positions.length}
          />
        </Box>
      ))}
    </SpreadContainer>
  );
};

export default TarotSpreadDisplay; 