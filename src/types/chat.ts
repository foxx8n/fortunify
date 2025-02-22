export type FortuneMethod = {
  id: string;
  name: string;
  description: string;
  icon: string; // Material-UI icon name
};

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'fortune-teller';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  method: FortuneMethod;
  lastMessage?: string;
  timestamp: Date;
  messages: Message[];
}

export interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
}

export const FORTUNE_METHODS: FortuneMethod[] = [
  {
    id: 'tarot',
    name: 'Tarot Reading',
    description: 'Discover your destiny through the ancient wisdom of tarot cards',
    icon: 'Style', // Cards icon
  },
  {
    id: 'crystal',
    name: 'Crystal Ball',
    description: 'Peer into the mystical crystal ball to see what the future holds',
    icon: 'Album', // Circular icon
  },
  {
    id: 'palm',
    name: 'Palm Reading',
    description: 'Uncover your life path through the ancient art of palmistry',
    icon: 'PanTool', // Hand icon
  },
  {
    id: 'astrology',
    name: 'Astrology',
    description: 'Let the stars and planets guide your way',
    icon: 'Stars', // Star icon
  },
  {
    id: 'runes',
    name: 'Norse Runes',
    description: 'Ancient Viking wisdom to illuminate your path',
    icon: 'Token', // Rune-like icon
  },
  {
    id: 'coffee',
    name: 'Turkish Coffee',
    description: 'Divine your future through the ancient art of reading coffee grounds',
    icon: 'Coffee', // Coffee cup icon
  },
]; 