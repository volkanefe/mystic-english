import { CloudLightning, CloudMoon, Layers, Music, Sun, Volume2, VolumeX } from 'lucide-react';
import { CEFRLevel, MusicMood, WeatherType } from '../types/game';

interface TopHudProps {
  level: number;
  cefr: CEFRLevel;
  levelTitle: string;
  questionIndex: number;
  totalQuestions: number;
  lives: number;
  maxLives: number;
  score: number;
  streak: number;
  weather: WeatherType;
  musicMood: MusicMood;
  muted: boolean;
  onCycleWeather: () => void;
  onCycleMusicMood: () => void;
  onToggleMute: () => void;
  onOpenLevels: () => void;
}

const WEATHER_LABELS: Record<WeatherType, string> = {
  normal: 'Normal',
  storm: 'Fırtına',
  sunny: 'Güneşli',
};

const MUSIC_LABELS: Record<MusicMood, string> = {
  calm: 'Dinlendirici',
  motivating: 'Motive',
  focus: 'Odak',
  off: 'Müzik Yok',
};

function CrystalSigil({ active, danger }: { active: boolean; danger: boolean }) {
  const fill = !active
    ? '#1e293b'
    : danger
      ? '#f43f5e'
      : '#38bdf8';
  const stroke = !active
    ? '#334155'
    : danger
      ? '#fda4af'
      : '#bae6fd';

  return (
    <svg
      width="16"
      height="20"
      viewBox="0 0 16 20"
      aria-hidden="true"
      className="transition-transform duration-200"
      style={{
        opacity: active ? 1 : 0.35,
        transform: active ? 'scale(1)' : 'scale(0.84)',
      }}
    >
      <polygon
        points="8,1 14,7 12,17 8,19 4,17 2,7"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.2"
      />
      {active && (
        <polyline
          points="8,2 8,18"
          stroke={stroke}
          strokeWidth="0.8"
          opacity="0.65"
          fill="none"
        />
      )}
    </svg>
  );
}

export function TopHud({
  level,
  cefr,
  levelTitle,
  questionIndex,
  totalQuestions,
  lives,
  maxLives,
  score,
  streak,
  weather,
  musicMood,
  muted,
  onCycleWeather,
  onCycleMusicMood,
  onToggleMute,
  onOpenLevels,
}: TopHudProps) {
  const progressPct =
    totalQuestions > 0 ? Math.min(100, Math.round((questionIndex / totalQuestions) * 100)) : 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-20 px-3 pt-2.5 sm:px-6 sm:pt-3 pointer-events-none">
      <div className="mx-auto max-w-6xl rounded-xl bg-[#090e18]/88 border border-white/10 px-3.5 py-2.5 sm:px-5 sm:py-3 shadow-lg pointer-events-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Level Metadata */}
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="font-display text-base sm:text-lg font-bold tracking-wide text-slate-100 whitespace-nowrap shrink-0">
              Mystic English
            </h1>
            <span className="hidden sm:inline text-slate-600" aria-hidden="true">
              /
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono-tabular whitespace-nowrap truncate">
              <span className="text-sky-300 font-semibold">Seviye {level}</span>
              <span className="text-slate-500" aria-hidden="true">·</span>
              <span>{cefr}</span>
              <span className="hidden md:inline text-slate-500" aria-hidden="true">·</span>
              <span className="hidden md:inline text-slate-400">{levelTitle}</span>
              <span className="text-slate-500" aria-hidden="true">·</span>
              <span>
                {Math.min(questionIndex + 1, totalQuestions)}/{totalQuestions}
              </span>
            </div>
          </div>

          {/* Center Progress & Score */}
          <div className="hidden lg:flex items-center gap-5 flex-1 max-w-xs mx-4">
            <div className="flex-1 h-1.5 rounded-full bg-slate-800/90 overflow-hidden">
              <div
                className="h-full bg-sky-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center gap-3 text-xs font-mono-tabular text-slate-300 whitespace-nowrap shrink-0">
              <span>Puan: {score}</span>
              {streak > 1 && <span className="text-amber-300">Seri: {streak}x</span>}
            </div>
          </div>

          {/* Right: Crystal Lives & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div
              className="flex items-center gap-1 pr-1 sm:pr-2"
              aria-label={`Kalan can: ${lives} / ${maxLives}`}
              title={`Kalan Can: ${lives}/${maxLives}`}
            >
              {Array.from({ length: maxLives }).map((_, i) => (
                <CrystalSigil
                  key={i}
                  active={i < lives}
                  danger={lives === 1}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={onCycleWeather}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[36px]"
              title="Hava Durumunu Değiştir"
            >
              {weather === 'normal' && <CloudMoon className="w-3.5 h-3.5 text-sky-300" />}
              {weather === 'storm' && <CloudLightning className="w-3.5 h-3.5 text-indigo-300" />}
              {weather === 'sunny' && <Sun className="w-3.5 h-3.5 text-amber-300" />}
              <span className="hidden sm:inline">{WEATHER_LABELS[weather]}</span>
            </button>

            <button
              type="button"
              onClick={onOpenLevels}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[36px]"
              title="Seviyeler"
            >
              <Layers className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Seviyeler</span>
            </button>

            <button
              type="button"
              onClick={onCycleMusicMood}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[36px]"
              title="Arka Plan Müziğini Değiştir"
            >
              <Music
                className={`w-3.5 h-3.5 ${
                  musicMood === 'off'
                    ? 'text-slate-500'
                    : musicMood === 'motivating'
                      ? 'text-amber-300'
                      : musicMood === 'focus'
                        ? 'text-indigo-300'
                        : 'text-emerald-300'
                }`}
              />
              <span className="hidden sm:inline">{MUSIC_LABELS[musicMood]}</span>
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              className="inline-flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 w-9 h-9 text-slate-200 transition-colors cursor-pointer shrink-0"
              aria-label={muted ? 'Sesi Aç' : 'Sesi Kapat'}
              title={muted ? 'Sesi Aç' : 'Sesi Kapat'}
            >
              {muted ? (
                <VolumeX className="w-4 h-4 text-rose-300" />
              ) : (
                <Volume2 className="w-4 h-4 text-sky-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet secondary compact progress row */}
        <div className="mt-2 flex lg:hidden items-center gap-3">
          <div className="flex-1 h-1 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-sky-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-[11px] font-mono-tabular text-slate-300 whitespace-nowrap">
            Puan: {score} {streak > 1 ? `· ${streak}x` : ''}
          </span>
        </div>
      </div>
    </header>
  );
}
