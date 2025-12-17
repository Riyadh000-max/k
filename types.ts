export interface VocabularyItem {
  word: string;
  definition: string;
  emoji: string;
}

export interface GeneratedImage {
  word: string;
  base64: string;
}

export enum AppState {
  HOME = 'HOME',
  LEARNING = 'LEARNING',
  ERROR = 'ERROR'
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  prompt: string;
}
