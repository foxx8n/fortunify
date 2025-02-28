import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { FortuneMode, Language } from './types/fortune';
import { constructSystemPrompt } from './functions';
import { TAROT_SPREADS, TarotSpreadType } from './types/tarot';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// OpenRouter client setup
const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
    'X-Title': 'Fortunify',
  }
});

// Store conversation history for each session
interface ConversationEntry {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ConversationState {
  messages: ConversationEntry[];
  lastActive: number;
  methodId: string;
}

const MAX_HISTORY_LENGTH = 10;
const MAX_INACTIVE_TIME = 30 * 60 * 1000; // 30 minutes
const conversationStates: { [sessionId: string]: ConversationState } = {};

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Clean up old conversations periodically
setInterval(() => {
  const now = Date.now();
  Object.entries(conversationStates).forEach(([sessionId, state]) => {
    if (now - state.lastActive > MAX_INACTIVE_TIME) {
      delete conversationStates[sessionId];
    }
  });
}, 5 * 60 * 1000);

const isTarotReading = (content: string, language: string = 'en'): boolean => {
  // Check for card name pattern
  const hasCardPattern = /(?:Card:|Kart:)\s*([^.!?\n]+)/i.test(content);
  if (hasCardPattern) return true;

  // Check for the specific message pattern
  const hasMessagePattern = content.includes('**The Message:**') || content.includes('**Mesaj:**');
  if (hasMessagePattern) return true;

  // Common tarot reading indicators in English
  const englishIndicators = [
    "*Kartları bir kez daha karıştırıyorum",
    "*I shuffle the cards once more",
    "*I select",
    "*I draw",
    "*I place",
    "*I arrange",
    "*I lay out",
    "the cards reveal",
    "the tarot shows",
    "from my ancient deck",
    "the cards speak",
    "in this spread",
    "this card represents",
    "this position shows",
    "in the tarot spread"
  ];

  // Common tarot reading indicators in Turkish
  const turkishIndicators = [
    "*Antika tarot destemi",
    "*Bir kart seçiyorum",
    "*Kartı çekiyorum",
    "*Kartları diziyorum",
    "*Kartları yerleştiriyorum",
    "kartlar gösteriyor",
    "tarot gösteriyor",
    "kadim destemden",
    "kartlar konuşuyor",
    "bu dizilimde",
    "bu kart temsil ediyor",
    "bu pozisyon gösteriyor",
    "tarot diziliminde"
  ];

  // Select indicators based on language
  const indicators = language === 'tr' ? turkishIndicators : englishIndicators;

  // Check for any of the indicators
  const hasIndicator = indicators.some(indicator => 
    content.toLowerCase().includes(indicator.toLowerCase())
  );

  // Additional checks for tarot-specific patterns
  const hasTarotPatterns = (
    content.includes('**') || // Position markers
    /\*[^*]+\*/.test(content) || // Action descriptions between asterisks
    content.toLowerCase().includes('tarot') ||
    (language === 'tr' && content.toLowerCase().includes('kart'))
  );

  // Check for mystical action patterns
  const hasMysticalActions = (
    content.match(/\*[^*]+\*/) !== null || // Any text between asterisks
    content.includes('...') || // Ellipsis indicating mystical pauses
    content.match(/\([^)]+\)/) !== null // Parenthetical descriptions
  );

  // Return true if we have any of the indicators
  return hasCardPattern || hasMessagePattern || (hasIndicator && (hasTarotPatterns || hasMysticalActions));
};

// Extract card name from the response
const extractCardName = (content: string, language: string = 'en'): string | null => {
  // First try to find the card name after "The Message:" or "Mesaj:"
  const messageMatch = content.match(/\*\*(The Message|Mesaj):\*\*\s*([^.\n]+)/i);
  if (messageMatch) {
    return messageMatch[2].trim();
  }

  // Fallback to looking for Card: or Kart: pattern
  const cardMatch = content.match(/(?:Card:|Kart:)\s*([^.!?\n]+)/i);
  return cardMatch ? cardMatch[1].trim() : null;
};

// Format the response into proper tarot reading structure
const formatTarotResponse = (response: string, spreadType: TarotSpreadType, language: string): string => {
  const positions = TAROT_SPREADS[spreadType].positions;
  
  // For single card readings
  if (positions.length === 1) {
    // Extract the card name
    const cardName = extractCardName(response, language);
    
    // Split the response into parts
    const parts = response.split(/\*\*(The Message|Mesaj):\*\*/i);
    
    // Get the action description (everything before the first "The Message:")
    const actionPart = parts[0].trim();
    
    // Get the reading content (everything after the last "The Message:")
    const readingContent = parts[parts.length - 1].trim();
    
    // Format the response with proper structure
    const cardInfo = cardName ? `\nKart: ${cardName}` : '';
    return `${actionPart}${cardInfo}\n**${positions[0].name}:** ${readingContent}`;
  }

  // For multi-card spreads (shouldn't reach here in normal cases)
  return response;
};

// Routes
app.post('/api/fortune', async (req, res) => {
  try {
    const { text, method = 'crystal', language = 'en', sessionId, spreadType, max_tokens = 500 } = req.body;

    // Initialize or update conversation state
    if (!conversationStates[sessionId] || conversationStates[sessionId].methodId !== method) {
      conversationStates[sessionId] = {
        messages: [{
          role: 'system',
          content: constructSystemPrompt(
            method as FortuneMode,
            language as Language,
            false,
            spreadType
          ),
          timestamp: Date.now()
        }],
        lastActive: Date.now(),
        methodId: method
      };
    }

    const state = conversationStates[sessionId];
    state.lastActive = Date.now();

    // Add user's message to history
    state.messages.push({
      role: 'user',
      content: text,
      timestamp: Date.now()
    });

    // Keep history size manageable
    if (state.messages.length > MAX_HISTORY_LENGTH + 1) {
      state.messages = [
        state.messages[0],
        ...state.messages.slice(-MAX_HISTORY_LENGTH)
      ];
    }

    const completion = await client.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: state.messages.map(({ role, content }) => ({ role, content })),
      temperature: 0.7,
      max_tokens: max_tokens,
      presence_penalty: 0.6,
      frequency_penalty: 0.6,
    });

    let response = completion.choices[0].message.content || (
      language === 'tr' ? 
        'Şu anda fal bakamıyorum.' :
        'I could not provide a fortune reading at this moment.'
    );

    // Format tarot readings only for tarot method and when it's a reading
    if (method === 'tarot' && spreadType && isTarotReading(response, language)) {
      console.log('Formatting tarot response for spread type:', spreadType);
      response = formatTarotResponse(response, spreadType as TarotSpreadType, language);
      console.log('Formatted response:', response);
    }

    // Add AI's response to history
    state.messages.push({
      role: 'assistant',
      content: response,
      timestamp: Date.now()
    });

    res.json({ response });
  } catch (error: any) {
    console.error('Error in fortune telling:', error);
    res.status(error?.status || 500).json({
      error: error?.status === 429 
        ? 'API rate limit exceeded. Please try again later.'
        : 'Failed to get fortune telling'
    });
  }
});

app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageUrl, method = 'crystal', language = 'en', max_tokens = 500 } = req.body;

    const completion = await client.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'system',
          content: constructSystemPrompt(
            method as FortuneMode,
            language as Language,
            true
          )
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      temperature: 0.7,
      max_tokens: max_tokens,
      presence_penalty: 0.6,
      frequency_penalty: 0.6,
    });

    const response = completion.choices[0].message.content || (
      language === 'tr' ? 
        'Bu görseli şu anda analiz edemiyorum.' :
        'I could not analyze this image.'
    );

    res.json({ response });
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    res.status(error?.status || 500).json({
      error: error?.status === 429 
        ? 'API rate limit exceeded. Please try again later.'
        : 'Failed to analyze image'
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 