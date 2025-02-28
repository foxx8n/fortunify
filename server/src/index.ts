import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { FortuneMode, Language } from './types/fortune';
import { constructSystemPrompt } from './functions';

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

    const response = completion.choices[0].message.content || (
      language === 'tr' ? 
        'Şu anda fal bakamıyorum.' :
        'I could not provide a fortune reading at this moment.'
    );

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