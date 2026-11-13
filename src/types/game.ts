export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type WeatherType = 'normal' | 'storm' | 'sunny';

export type MusicMood = 'calm' | 'motivating' | 'focus' | 'off';

export type GameStatus =
  | 'playing'
  | 'checking_success'
  | 'checking_error'
  | 'level_complete'
  | 'game_over'
  | 'victory';

export interface SentenceEntry {
  id: string;
  level: number;
  cefr: CEFRLevel;
  turkish: string;
  english: string;
  wordPool: string[];
  grammarTip: string;
}

export interface WordToken {
  uid: string;
  text: string;
  poolIndex: number;
}

export interface SavedProgress {
  currentLevel: number;
  score: number;
  highScore: number;
  streak: number;
  bestStreak: number;
  completedIds: string[];
  muted: boolean;
  musicMood: MusicMood;
}

export interface FeedbackState {
  type: 'idle' | 'success' | 'error' | 'punctuation_warning';
  message: string;
}
