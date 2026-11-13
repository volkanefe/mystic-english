import { SavedProgress } from '../types/game';

const STORAGE_KEY = 'mystic_english_progress_v3';
const PREV_STORAGE_KEY = 'mystic_english_progress_v2';

export const DEFAULT_PROGRESS: SavedProgress = {
  currentLevel: 1,
  score: 0,
  highScore: 0,
  streak: 0,
  bestStreak: 0,
  completedIds: [],
  muted: false,
  musicMood: 'calm',
};

function parseValidMood(mood: unknown): SavedProgress['musicMood'] {
  return mood === 'calm' || mood === 'motivating' || mood === 'focus' || mood === 'off'
    ? mood
    : 'calm';
}

export function loadProgress(): SavedProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Carry over audio/music preferences if user had an earlier v2 save
      const prevRaw = window.localStorage.getItem(PREV_STORAGE_KEY);
      if (prevRaw) {
        const prev = JSON.parse(prevRaw) as Partial<SavedProgress>;
        return {
          ...DEFAULT_PROGRESS,
          muted: Boolean(prev.muted),
          musicMood: parseValidMood(prev.musicMood),
        };
      }
      return { ...DEFAULT_PROGRESS };
    }
    const parsed = JSON.parse(raw) as Partial<SavedProgress>;
    return {
      currentLevel:
        typeof parsed.currentLevel === 'number' &&
        parsed.currentLevel >= 1 &&
        parsed.currentLevel <= 6
          ? parsed.currentLevel
          : 1,
      score: typeof parsed.score === 'number' ? parsed.score : 0,
      highScore: typeof parsed.highScore === 'number' ? parsed.highScore : 0,
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      bestStreak: typeof parsed.bestStreak === 'number' ? parsed.bestStreak : 0,
      completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds : [],
      muted: Boolean(parsed.muted),
      musicMood: parseValidMood(parsed.musicMood),
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress: SavedProgress): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function clearProgress(): SavedProgress {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
  return { ...DEFAULT_PROGRESS };
}
