export enum FortuneMode {
  TAROT = 'tarot',
  CRYSTAL = 'crystal',
  PALM = 'palm',
  ASTROLOGY = 'astrology',
  RUNES = 'runes',
  COFFEE = 'coffee'
}

export enum TarotSpreadType {
  SINGLE_CARD = 'single_card',
  THREE_CARD = 'three_card',
  CELTIC_CROSS = 'celtic_cross',
  HORSESHOE = 'horseshoe',
  PENTAGRAM = 'pentagram',
  TREE_OF_LIFE = 'tree_of_life'
}

export enum Language {
  ENGLISH = 'en',
  TURKISH = 'tr'
}

export interface FortuneRequest {
  query: string;
  mode: FortuneMode;
  language: Language;
  sessionId?: string;
  spreadType?: TarotSpreadType;
}

export interface FortuneResponse {
  answer: string;
  mode: FortuneMode;
  timestamp: number;
}

export interface NSFWFilter {
  enabled: boolean;
  strictness: 'low' | 'medium' | 'high';
  customResponses?: Record<Language, string[]>;
}

// Type for mode functions that define how each fortune telling method works
export type ModeFunction = (mode: FortuneMode, spreadType?: TarotSpreadType, language?: Language) => string;

// Type for language functions that define response style
export type LanguageFunction = (language: Language) => string; 