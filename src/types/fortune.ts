import { TarotSpreadType } from './tarot';

export enum FortuneMode {
  TAROT = 'tarot',
  CRYSTAL = 'crystal',
  PALM = 'palm',
  ASTROLOGY = 'astrology',
  RUNES = 'runes',
  COFFEE = 'coffee'
}

export enum Language {
  ENGLISH = 'en',
  TURKISH = 'tr'
}

export type ModeFunction = (mode: FortuneMode, spreadType?: TarotSpreadType, language?: Language) => string;
export type LanguageFunction = (language: Language) => string; 