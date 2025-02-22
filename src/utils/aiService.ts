import { OpenAI } from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat';

// OpenRouter model selection based on capabilities
const MODEL = 'google/gemini-2.0-flash-001';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.REACT_APP_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, you should use a backend proxy
  defaultHeaders: {
    'HTTP-Referer': window.location.origin,
    'X-Title': 'Fortunify',
  }
});

// Store conversation history for each session with metadata
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

const MAX_HISTORY_LENGTH = 10; // Maximum number of messages to keep (excluding system message)
const MAX_INACTIVE_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds
const conversationStates: { [sessionId: string]: ConversationState } = {};

// Clean up old conversations periodically
setInterval(() => {
  const now = Date.now();
  Object.entries(conversationStates).forEach(([sessionId, state]) => {
    if (now - state.lastActive > MAX_INACTIVE_TIME) {
      delete conversationStates[sessionId];
    }
  });
}, 5 * 60 * 1000); // Run cleanup every 5 minutes

const getSystemMessage = (language: string): string => {
  return language === 'tr' ? 
    'Sen bir Türk falcısısın. Cevaplarını Türkçe, kısa ve öz olarak ver. Her cevap 2-3 cümleyi geçmemeli. Mistik bir üslup kullan ama gereksiz detaylardan kaçın. Uygunsuz içeriğe yanıt verme.' :
    'You are a fortune teller. Keep responses in English, brief and focused. Each response should be 2-3 sentences max. Use a mystical tone but avoid unnecessary details. Do not respond to inappropriate content.';
};

const summarizeContext = (messages: ConversationEntry[]): string => {
  if (messages.length <= 1) return '';
  
  const relevantMessages = messages.slice(-4); // Get last 4 messages for summary
  const summary = relevantMessages.map(msg => {
    const role = msg.role === 'assistant' ? 'You' : 'The seeker';
    return `${role}: ${msg.content.slice(0, 100)}${msg.content.length > 100 ? '...' : ''}`;
  }).join('\n');
  
  return `\nRecent conversation context:\n${summary}\n`;
};

const getMethodPrompt = (method: string, userInput: string, language: string = 'en') => {
  const prompts = {
    en: {
      tarot: `Draw a single tarot card for "${userInput}" and briefly interpret its meaning in 2-3 sentences.`,
      crystal: `Look into the crystal ball and share a brief vision about "${userInput}" in 2-3 sentences.`,
      palm: `Read the most significant line in the palm regarding "${userInput}" and share its meaning in 2-3 sentences.`,
      astrology: `Share the most relevant astrological insight about "${userInput}" in 2-3 sentences.`,
      runes: `Draw one rune regarding "${userInput}" and interpret its message in 2-3 sentences.`,
      coffee: `Find the most prominent symbol in the coffee grounds about "${userInput}" and share its meaning in 2-3 sentences.`,
    },
    tr: {
      tarot: `"${userInput}" için tek bir tarot kartı çek ve anlamını 2-3 cümleyle yorumla.`,
      crystal: `Kristal küreye bakarak "${userInput}" hakkında kısa bir vizyon paylaş, 2-3 cümleyi geçme.`,
      palm: `"${userInput}" ile ilgili eldeki en önemli çizgiyi oku ve anlamını 2-3 cümleyle paylaş.`,
      astrology: `"${userInput}" hakkında en önemli astrolojik görüşü 2-3 cümleyle paylaş.`,
      runes: `"${userInput}" için bir run çek ve mesajını 2-3 cümleyle yorumla.`,
      coffee: `"${userInput}" hakkında telvedeki en belirgin sembolü bul ve anlamını 2-3 cümleyle paylaş.`,
    }
  };
  return prompts[language as keyof typeof prompts][method as keyof typeof prompts.en] || prompts[language as keyof typeof prompts].crystal;
};

const getImagePrompt = (method: string, language: string = 'en') => {
  const prompts = {
    en: {
      tarot: "Examine this image for tarot-related symbols and patterns. What story do the visual elements tell from a tarot perspective? If the image contains inappropriate or adult content, respond with 'I must respectfully decline to read this image.'",
      crystal: "Gaze into this image as if it were a crystal ball. What mystical visions and predictions can you derive from its contents? If the image contains inappropriate or adult content, respond with 'The crystal ball clouds over for this image.'",
      palm: "Study this image as if reading a palm. What life lines, fate patterns, and fortune indicators do you observe? If the image contains inappropriate or adult content, respond with 'I must respectfully decline to read this image.'",
      astrology: "Analyze this image through an astrological lens. What celestial connections and cosmic meanings do you perceive? If the image contains inappropriate or adult content, respond with 'The stars veil themselves from this image.'",
      runes: "Interpret this image using Norse runic wisdom. What ancient symbols and meanings do you discover? If the image contains inappropriate or adult content, respond with 'The runes refuse to speak of this image.'",
      coffee: "Analyze this coffee-related image. If it shows Turkish coffee grounds (telve), interpret the patterns and symbols. If it's another type of coffee (like latte art), describe what you see and provide a mystical interpretation of the patterns. Share your insights in 2-3 sentences.",
    },
    tr: {
      tarot: "Bu görseli tarot sembolleri ve desenleri açısından incele. Görsel öğeler tarot perspektifinden nasıl bir hikaye anlatıyor? Eğer görsel uygunsuz veya yetişkin içeriği barındırıyorsa, 'Bu görseli okumayı saygıyla reddetmek durumundayım.' şeklinde yanıt ver.",
      crystal: "Bu görsele kristal küreye bakıyormuş gibi bak. İçeriğinden hangi mistik vizyonları ve kehanetleri çıkarabilirsin? Eğer görsel uygunsuz veya yetişkin içeriği barındırıyorsa, 'Kristal küre bu görsel için sislerle kaplanıyor.' şeklinde yanıt ver.",
      palm: "Bu görseli bir el falı okuyormuş gibi incele. Hangi yaşam çizgilerini, kader desenlerini ve şans göstergelerini gözlemliyorsun? Eğer görsel uygunsuz veya yetişkin içeriği barındırıyorsa, 'Bu görseli okumayı saygıyla reddetmek durumundayım.' şeklinde yanıt ver.",
      astrology: "Bu görseli astrolojik bir bakış açısıyla analiz et. Hangi göksel bağlantıları ve kozmik anlamları algılıyorsun? Eğer görsel uygunsuz veya yetişkin içeriği barındırıyorsa, 'Yıldızlar bu görsel için kendilerini gizliyorlar.' şeklinde yanıt ver.",
      runes: "Bu görseli İskandinav run bilgeliğini kullanarak yorumla. Hangi kadim sembolleri ve anlamları keşfediyorsun? Eğer görsel uygunsuz veya yetişkin içeriği barındırıyorsa, 'Runlar bu görsel hakkında konuşmayı reddediyor.' şeklinde yanıt ver.",
      coffee: "Bu kahve görselini analiz et. Eğer Türk kahvesi telvesi görüyorsan, şekilleri ve sembolleri yorumla. Eğer başka bir kahve türüyse (latte art gibi), gördüğün desenleri mistik bir şekilde yorumla. Yorumunu 2-3 cümleyle paylaş.",
    }
  };
  return prompts[language as keyof typeof prompts][method as keyof typeof prompts.en] || prompts[language as keyof typeof prompts].crystal;
};

export const analyzeImage = async (imageUrl: string, method: string = 'crystal', language: string = 'en'): Promise<string> => {
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: language === 'tr' ? 
            'Sen bir Türk falcısısın. Cevaplarını Türkçe olarak ver ve mistik bir üslup kullan. Uygunsuz, müstehcen veya yetişkin içeriği olan sorulara yanıt verme.' :
            'You are a fortune teller. Provide responses in English and use a mystical tone. Do not respond to inappropriate, obscene, or adult content.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: getImagePrompt(method, language)
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ]
    });

    return completion.choices[0].message.content || (
      language === 'tr' ? 
        'Bu görseli şu anda analiz edemiyorum.' :
        'I could not analyze this image.'
    );
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    
    // Handle specific OpenRouter error cases
    if (error?.status === 429) {
      throw new Error(language === 'tr' ? 
        'API kullanım limiti aşıldı. Lütfen daha sonra tekrar deneyin.' : 
        'API rate limit exceeded. Please try again later.');
    }
    
    throw new Error(language === 'tr' ? 'Görsel analizi başarısız oldu' : 'Failed to analyze image');
  }
};

export const getFortuneTelling = async (text: string, method: string = 'crystal', language: string = 'en', sessionId: string): Promise<string> => {
  try {
    // Initialize or update conversation state
    if (!conversationStates[sessionId] || conversationStates[sessionId].methodId !== method) {
      conversationStates[sessionId] = {
        messages: [{
          role: 'system',
          content: getSystemMessage(language),
          timestamp: Date.now()
        }],
        lastActive: Date.now(),
        methodId: method
      };
    }

    const state = conversationStates[sessionId];
    state.lastActive = Date.now();

    // Add context summary to the prompt
    const contextSummary = summarizeContext(state.messages);
    const methodPrompt = getMethodPrompt(method, text, language);
    const fullPrompt = `${methodPrompt}${contextSummary}`;

    // Add user's message to history
    state.messages.push({
      role: 'user',
      content: fullPrompt,
      timestamp: Date.now()
    });

    // Keep history size manageable
    if (state.messages.length > MAX_HISTORY_LENGTH + 1) { // +1 for system message
      state.messages = [
        state.messages[0], // Keep system message
        ...state.messages.slice(-MAX_HISTORY_LENGTH) // Keep last N messages
      ];
    }

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: state.messages.map(({ role, content }) => ({ role, content })),
      temperature: 0.7,
      max_tokens: 150, // Reduced from 1000 to encourage shorter responses
      presence_penalty: 0.6, // Encourage more focused responses
      frequency_penalty: 0.6, // Discourage repetitive language
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

    return response;
  } catch (error: any) {
    console.error('Error getting fortune telling:', error);
    
    // Handle specific OpenRouter error cases
    if (error?.status === 429) {
      throw new Error(language === 'tr' ? 
        'API kullanım limiti aşıldı. Lütfen daha sonra tekrar deneyin.' : 
        'API rate limit exceeded. Please try again later.');
    }
    
    throw new Error(language === 'tr' ? 'Fal okuma başarısız oldu' : 'Failed to get fortune telling');
  }
}; 