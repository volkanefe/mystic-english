import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  joinWordTokens,
  LEVEL_METADATA,
  loadSentenceBank,
  MAX_LEVEL,
  MAX_LIVES,
  shufflePool,
  STAGE_SIZE,
  STARTER_SENTENCES,
  stripPunctuationAndCase,
} from './data/sentences';
import {
  FeedbackState,
  GameStatus,
  MusicMood,
  SentenceEntry,
  WeatherType,
  WordToken,
} from './types/game';
import { clearProgress, loadProgress, saveProgress } from './utils/storage';
import { SoundEngine } from './audio/SoundEngine';
import { MysticCanvas } from './components/MysticCanvas';
import { TopHud } from './components/TopHud';
import { SentenceDock } from './components/SentenceDock';
import { GameModal } from './components/GameModal';

const WEATHER_ORDER: WeatherType[] = ['normal', 'storm', 'sunny'];
const MUSIC_ORDER: MusicMood[] = ['calm', 'motivating', 'focus', 'off'];

function buildShuffledTokens(entry: SentenceEntry): WordToken[] {
  const tokens: WordToken[] = entry.wordPool.map((text, idx) => ({
    uid: `${entry.id}-${idx}-${text}`,
    text,
    poolIndex: idx,
  }));
  // Ensure shuffled order differs from exact answer when length > 2
  let shuffled = shufflePool(tokens);
  if (tokens.length > 2) {
    const joined = joinWordTokens(shuffled.map((t) => t.text));
    if (joined === entry.english) {
      shuffled = shufflePool(tokens);
    }
  }
  return shuffled;
}

function drawStageQueue(
  allSentences: SentenceEntry[],
  level: number,
  completedIds: string[],
): string[] {
  const doneSet = new Set(completedIds);
  const levelList = allSentences.filter((s) => s.level === level);
  const remaining = levelList.filter((s) => !doneSet.has(s.id));
  const source = remaining.length > 0 ? remaining : levelList;
  return shufflePool(source)
    .slice(0, Math.min(STAGE_SIZE, source.length))
    .map((s) => s.id);
}

export default function App() {
  const initialProgress = useMemo(() => loadProgress(), []);

  const [sentences, setSentences] = useState<SentenceEntry[]>(STARTER_SENTENCES);
  const [bankReady, setBankReady] = useState<boolean>(false);

  const [currentLevel, setCurrentLevel] = useState<number>(initialProgress.currentLevel);
  const [score, setScore] = useState<number>(initialProgress.score);
  const [highScore, setHighScore] = useState<number>(initialProgress.highScore);
  const [streak, setStreak] = useState<number>(initialProgress.streak);
  const [bestStreak, setBestStreak] = useState<number>(initialProgress.bestStreak);
  const [completedIds, setCompletedIds] = useState<string[]>(initialProgress.completedIds);
  const [muted, setMuted] = useState<boolean>(initialProgress.muted);
  const [musicMood, setMusicMood] = useState<MusicMood>(initialProgress.musicMood);

  const [stageQueue, setStageQueue] = useState<string[]>(() =>
    drawStageQueue(STARTER_SENTENCES, initialProgress.currentLevel, initialProgress.completedIds),
  );
  const [stageIndex, setStageIndex] = useState<number>(0);

  const [lives, setLives] = useState<number>(MAX_LIVES);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [weather, setWeather] = useState<WeatherType>('normal');
  const [weatherOverride, setWeatherOverride] = useState<WeatherType | null>(null);
  const [pulseKey, setPulseKey] = useState<number>(0);
  const [shakeKey, setShakeKey] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [showLevelsModal, setShowLevelsModal] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<FeedbackState>({ type: 'idle', message: '' });

  // Sound engine ref
  const soundRef = useRef<SoundEngine | null>(null);
  if (!soundRef.current) {
    soundRef.current = new SoundEngine(initialProgress.muted, initialProgress.musicMood);
  }

  useEffect(() => {
    const unlockOnce = () => {
      soundRef.current?.unlock();
    };
    window.addEventListener('pointerdown', unlockOnce, { once: true });
    window.addEventListener('keydown', unlockOnce, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlockOnce);
      window.removeEventListener('keydown', unlockOnce);
      soundRef.current?.dispose();
    };
  }, []);

  // Load full 4,592-sentence corpus from /data/sentences.json on mount
  useEffect(() => {
    let cancelled = false;
    loadSentenceBank()
      .then((loaded) => {
        if (cancelled || loaded.length === 0) return;
        setSentences(loaded);
        setStageQueue(drawStageQueue(loaded, initialProgress.currentLevel, initialProgress.completedIds));
        setStageIndex(0);
        setBankReady(true);
      })
      .catch(() => {
        if (!cancelled) setBankReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [initialProgress.currentLevel, initialProgress.completedIds]);

  const sentenceById = useMemo(() => {
    const map = new Map<string, SentenceEntry>();
    for (const s of sentences) {
      map.set(s.id, s);
    }
    return map;
  }, [sentences]);

  const activeSentence: SentenceEntry = useMemo(() => {
    const id = stageQueue[stageIndex];
    if (id && sentenceById.has(id)) {
      return sentenceById.get(id)!;
    }
    return sentences.find((s) => s.level === currentLevel) ?? sentences[0];
  }, [stageQueue, stageIndex, sentenceById, sentences, currentLevel]);

  const [availableTokens, setAvailableTokens] = useState<WordToken[]>(() =>
    buildShuffledTokens(activeSentence),
  );
  const [placedTokens, setPlacedTokens] = useState<WordToken[]>([]);

  // Reset tokens whenever activeSentence changes
  useEffect(() => {
    setAvailableTokens(buildShuffledTokens(activeSentence));
    setPlacedTokens([]);
    setShowHint(false);
    setFeedback({ type: 'idle', message: '' });
  }, [activeSentence]);

  // Persist progress
  useEffect(() => {
    saveProgress({
      currentLevel,
      score,
      highScore,
      streak,
      bestStreak,
      completedIds,
      muted,
      musicMood,
    });
  }, [currentLevel, score, highScore, streak, bestStreak, completedIds, muted, musicMood]);

  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);

  const totalSentencesByLevel = useMemo(() => {
    const map: Record<number, { total: number; done: number }> = {};
    for (let lvl = 1; lvl <= MAX_LEVEL; lvl++) {
      map[lvl] = { total: 0, done: 0 };
    }
    for (const s of sentences) {
      const bucket = map[s.level];
      if (!bucket) continue;
      bucket.total += 1;
      if (completedSet.has(s.id)) {
        bucket.done += 1;
      }
    }
    return map;
  }, [sentences, completedSet]);

  const totalSolvedCount = useMemo(() => {
    if (!bankReady) return 0;
    let count = 0;
    for (const s of sentences) {
      if (completedSet.has(s.id)) count += 1;
    }
    return count;
  }, [bankReady, sentences, completedSet]);

  const handlePlaceToken = useCallback((uid: string) => {
    soundRef.current?.playWordPlace();
    setFeedback({ type: 'idle', message: '' });
    setAvailableTokens((prev) => {
      const idx = prev.findIndex((t) => t.uid === uid);
      if (idx === -1) return prev;
      const target = prev[idx];
      setPlacedTokens((p) => [...p, target]);
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  }, []);

  const handleRemoveToken = useCallback((uid: string) => {
    soundRef.current?.playWordRemove();
    setFeedback({ type: 'idle', message: '' });
    setPlacedTokens((prev) => {
      const idx = prev.findIndex((t) => t.uid === uid);
      if (idx === -1) return prev;
      const target = prev[idx];
      setAvailableTokens((a) => [...a, target]);
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  }, []);

  const handleReorderPlaced = useCallback((fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    soundRef.current?.playWordPlace();
    setPlacedTokens((prev) => {
      if (fromIdx < 0 || fromIdx >= prev.length || toIdx < 0 || toIdx >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }, []);

  const handleUndoLast = useCallback(() => {
    setPlacedTokens((prev) => {
      if (prev.length === 0) return prev;
      soundRef.current?.playWordRemove();
      const last = prev[prev.length - 1];
      setAvailableTokens((a) => [...a, last]);
      setFeedback({ type: 'idle', message: '' });
      return prev.slice(0, -1);
    });
  }, []);

  const handleClearPlaced = useCallback(() => {
    if (placedTokens.length === 0) return;
    soundRef.current?.playWordRemove();
    setAvailableTokens((prev) => [...prev, ...placedTokens]);
    setPlacedTokens([]);
    setFeedback({ type: 'idle', message: '' });
  }, [placedTokens]);

  const handleCheckAnswer = useCallback(() => {
    if (status !== 'playing' || placedTokens.length === 0) return;

    const built = joinWordTokens(placedTokens.map((t) => t.text));
    const expected = activeSentence.english;

    if (built === expected) {
      const nextStreak = streak + 1;
      const pointsEarned = 100 * currentLevel + (nextStreak - 1) * 25;
      const nextScore = score + pointsEarned;

      setScore(nextScore);
      setHighScore((prev) => Math.max(prev, nextScore));
      setStreak(nextStreak);
      setBestStreak((prev) => Math.max(prev, nextStreak));
      setPulseKey((k) => k + 1);
      setStatus('checking_success');
      setFeedback({
        type: 'success',
        message: `Doğru! +${pointsEarned} puan`,
      });
      soundRef.current?.playSuccess();

      const updatedCompleted = completedSet.has(activeSentence.id)
        ? completedIds
        : [...completedIds, activeSentence.id];

      window.setTimeout(() => {
        setCompletedIds(updatedCompleted);
        const nextIdx = stageIndex + 1;
        if (nextIdx >= stageQueue.length) {
          soundRef.current?.playLevelComplete();
          setStatus(currentLevel >= MAX_LEVEL ? 'victory' : 'level_complete');
        } else {
          setStageIndex(nextIdx);
          setStatus('playing');
        }
      }, 950);
    } else {
      const isPunctuationOrCaseIssue =
        stripPunctuationAndCase(built) === stripPunctuationAndCase(expected);

      const nextLives = Math.max(0, lives - 1);
      setLives(nextLives);
      setStreak(0);
      setShakeKey((k) => k + 1);
      soundRef.current?.playCrack();

      if (nextLives === 0) {
        setStatus('game_over');
        setFeedback({
          type: 'error',
          message: 'Kristal parçalandı!',
        });
        window.setTimeout(() => {
          soundRef.current?.playGameOver();
        }, 260);
      } else {
        setStatus('checking_error');
        setFeedback({
          type: isPunctuationOrCaseIssue ? 'punctuation_warning' : 'error',
          message: isPunctuationOrCaseIssue
            ? `Büyük harf veya noktalama hatalı! Kalan can: ${nextLives}`
            : `Cümle sırası yanlış, kristal çatladı! Kalan can: ${nextLives}`,
        });
        window.setTimeout(() => {
          setStatus('playing');
        }, 650);
      }
    }
  }, [
    status,
    placedTokens,
    activeSentence,
    streak,
    currentLevel,
    score,
    completedSet,
    completedIds,
    stageIndex,
    stageQueue.length,
    lives,
  ]);

  // Keyboard shortcuts (Enter = check, Backspace = undo)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (status !== 'playing' || showLevelsModal) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCheckAnswer();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleUndoLast();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [status, showLevelsModal, handleCheckAnswer, handleUndoLast]);

  const handleToggleMute = useCallback(() => {
    soundRef.current?.unlock();
    setMuted((prev) => {
      const next = !prev;
      soundRef.current?.setMuted(next);
      return next;
    });
  }, []);

  const handleCycleMusicMood = useCallback(() => {
    soundRef.current?.unlock();
    setMusicMood((prev) => {
      const idx = MUSIC_ORDER.indexOf(prev);
      const next = MUSIC_ORDER[(idx + 1) % MUSIC_ORDER.length];
      soundRef.current?.setMusicMood(next);
      return next;
    });
  }, []);

  const handleCycleWeather = useCallback(() => {
    soundRef.current?.unlock();
    const idx = WEATHER_ORDER.indexOf(weather);
    const next = WEATHER_ORDER[(idx + 1) % WEATHER_ORDER.length];
    setWeather(next);
    setWeatherOverride(next);
  }, [weather]);

  const startFreshStage = useCallback(
    (lvl: number, doneIds: string[]) => {
      const levelList = sentences.filter((s) => s.level === lvl);
      const doneSetLocal = new Set(doneIds);
      const remaining = levelList.filter((s) => !doneSetLocal.has(s.id));

      let effectiveDone = doneIds;
      if (remaining.length === 0 && levelList.length > 0) {
        const levelIds = new Set(levelList.map((s) => s.id));
        effectiveDone = doneIds.filter((id) => !levelIds.has(id));
        setCompletedIds(effectiveDone);
      }

      setStageQueue(drawStageQueue(sentences, lvl, effectiveDone));
      setStageIndex(0);
      setLives(MAX_LIVES);
      setStatus('playing');
      setFeedback({ type: 'idle', message: '' });
    },
    [sentences],
  );

  const handleRetryLevel = useCallback(() => {
    setStreak(0);
    startFreshStage(currentLevel, completedIds);
  }, [currentLevel, completedIds, startFreshStage]);

  const handleContinueLevel = useCallback(() => {
    startFreshStage(currentLevel, completedIds);
  }, [currentLevel, completedIds, startFreshStage]);

  const handleNextLevel = useCallback(() => {
    const nextLvl = Math.min(MAX_LEVEL, currentLevel + 1);
    setCurrentLevel(nextLvl);
    startFreshStage(nextLvl, completedIds);
  }, [currentLevel, completedIds, startFreshStage]);

  const handleSelectLevel = useCallback(
    (lvl: number) => {
      setCurrentLevel(lvl);
      startFreshStage(lvl, completedIds);
      setShowLevelsModal(false);
    },
    [completedIds, startFreshStage],
  );

  const handleResetAll = useCallback(() => {
    const fresh = clearProgress();
    setCurrentLevel(fresh.currentLevel);
    setScore(fresh.score);
    setHighScore(fresh.highScore);
    setStreak(fresh.streak);
    setBestStreak(fresh.bestStreak);
    setCompletedIds(fresh.completedIds);
    setStageQueue(drawStageQueue(sentences, fresh.currentLevel, []));
    setStageIndex(0);
    setLives(MAX_LIVES);
    setStatus('playing');
    setShowLevelsModal(false);
    setFeedback({ type: 'idle', message: '' });
  }, [sentences]);

  const levelMeta = LEVEL_METADATA[currentLevel];
  const hudQuestionIndex =
    status === 'level_complete' || status === 'victory' ? stageQueue.length : stageIndex;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#070a10] select-none">
      {/* 1. Full-Viewport 3D World */}
      <MysticCanvas
        lives={lives}
        maxLives={MAX_LIVES}
        weatherOverride={weatherOverride}
        pulseKey={pulseKey}
        shakeKey={shakeKey}
        onWeatherChange={(w) => {
          setWeather(w);
          setWeatherOverride(null);
        }}
        onThunderStrike={(intensity) => soundRef.current?.playThunder(intensity)}
        onAtmosphereUpdate={(wind, rain) => soundRef.current?.setAtmosphere(wind, rain)}
      />

      {/* 2. Top Minimal Fantasy HUD */}
      <TopHud
        level={currentLevel}
        cefr={levelMeta.cefr}
        levelTitle={levelMeta.title}
        questionIndex={hudQuestionIndex}
        totalQuestions={Math.max(1, stageQueue.length)}
        lives={lives}
        maxLives={MAX_LIVES}
        score={score}
        streak={streak}
        weather={weather}
        musicMood={musicMood}
        muted={muted}
        onCycleWeather={handleCycleWeather}
        onCycleMusicMood={handleCycleMusicMood}
        onToggleMute={handleToggleMute}
        onOpenLevels={() => setShowLevelsModal(true)}
      />

      {/* 3. Lower Sentence Builder & Shuffled Word Pool */}
      <SentenceDock
        sentence={activeSentence}
        availableTokens={availableTokens}
        placedTokens={placedTokens}
        feedback={feedback}
        showHint={showHint}
        isBusy={status !== 'playing' || !bankReady}
        collapsed={collapsed}
        lives={lives}
        onPlaceToken={handlePlaceToken}
        onRemoveToken={handleRemoveToken}
        onReorderPlaced={handleReorderPlaced}
        onUndoLast={handleUndoLast}
        onClearPlaced={handleClearPlaced}
        onCheckAnswer={handleCheckAnswer}
        onToggleHint={() => setShowHint((h) => !h)}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
      />

      {/* 4. Game Over / Level Complete / Level Select Modals */}
      <GameModal
        status={status}
        showLevelsModal={showLevelsModal}
        currentLevel={currentLevel}
        score={score}
        highScore={highScore}
        bestStreak={bestStreak}
        totalSolvedCount={totalSolvedCount}
        totalBankCount={bankReady ? sentences.length : 4592}
        totalSentencesByLevel={totalSentencesByLevel}
        onRetryLevel={handleRetryLevel}
        onContinueLevel={handleContinueLevel}
        onNextLevel={handleNextLevel}
        onSelectLevel={handleSelectLevel}
        onResetAll={handleResetAll}
        onCloseLevels={() => setShowLevelsModal(false)}
      />
    </main>
  );
}
