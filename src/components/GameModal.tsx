import { ArrowRight, Award, RefreshCw, RotateCcw, ShieldAlert, X } from 'lucide-react';
import { GameStatus } from '../types/game';
import { LEVEL_METADATA, MAX_LEVEL, STAGE_SIZE } from '../data/sentences';

interface GameModalProps {
  status: GameStatus;
  showLevelsModal: boolean;
  currentLevel: number;
  score: number;
  highScore: number;
  bestStreak: number;
  totalSolvedCount: number;
  totalBankCount: number;
  totalSentencesByLevel: Record<number, { total: number; done: number }>;
  onRetryLevel: () => void;
  onContinueLevel: () => void;
  onNextLevel: () => void;
  onSelectLevel: (level: number) => void;
  onResetAll: () => void;
  onCloseLevels: () => void;
}

export function GameModal({
  status,
  showLevelsModal,
  currentLevel,
  score,
  highScore,
  bestStreak,
  totalSolvedCount,
  totalBankCount,
  totalSentencesByLevel,
  onRetryLevel,
  onContinueLevel,
  onNextLevel,
  onSelectLevel,
  onResetAll,
  onCloseLevels,
}: GameModalProps) {
  if (showLevelsModal) {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 px-4">
        <div className="w-full max-w-lg rounded-xl bg-[#0b101b] border border-white/15 p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-100">
                Tapınak Seviyeleri
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono-tabular">
                CEFR A1–C2 · Toplam {totalSolvedCount.toLocaleString('tr-TR')} /{' '}
                {totalBankCount.toLocaleString('tr-TR')} cümle çözüldü
              </p>
            </div>
            <button
              type="button"
              onClick={onCloseLevels}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 mb-5">
            {Array.from({ length: MAX_LEVEL }).map((_, idx) => {
              const lvl = idx + 1;
              const meta = LEVEL_METADATA[lvl];
              const stats = totalSentencesByLevel[lvl] || { total: 0, done: 0 };
              const isCurrent = lvl === currentLevel;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onSelectLevel(lvl)}
                  className={`w-full text-left rounded-lg border px-4 py-3 transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-sky-500/15 border-sky-400/50 text-slate-100'
                      : 'bg-slate-900/80 hover:bg-slate-800/90 border-white/10 text-slate-200'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-mono-tabular text-sky-300 mb-0.5">
                      <span>Seviye {lvl}</span>
                      <span className="text-slate-500" aria-hidden="true">·</span>
                      <span>{meta.cefr}</span>
                      <span className="text-slate-500" aria-hidden="true">·</span>
                      <span className="text-slate-400">
                        {stats.done.toLocaleString('tr-TR')}/{stats.total.toLocaleString('tr-TR')} cümle
                      </span>
                    </div>
                    <p className="text-sm font-semibold truncate">{meta.title}</p>
                    <p className="text-xs text-slate-400 truncate">{meta.subtitle}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
            <span className="text-xs font-mono-tabular text-slate-400">
              En Yüksek Puan: {highScore} · En İyi Seri: {bestStreak}x
            </span>
            <button
              type="button"
              onClick={onResetAll}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/30 px-3 py-2 text-xs font-medium text-rose-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>İlerlemeyi Sıfırla</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status !== 'game_over' && status !== 'level_complete' && status !== 'victory') {
    return null;
  }

  const isGameOver = status === 'game_over';
  const isVictory = status === 'victory';
  const meta = LEVEL_METADATA[currentLevel];
  const currentStats = totalSentencesByLevel[currentLevel] || { total: 0, done: 0 };
  const nextMeta = currentLevel < MAX_LEVEL ? LEVEL_METADATA[currentLevel + 1] : null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/72 px-4">
      <div className="w-full max-w-md rounded-xl bg-[#0b101b] border border-white/15 p-6 shadow-2xl text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-slate-900">
          {isGameOver ? (
            <ShieldAlert className="w-7 h-7 text-rose-400" />
          ) : (
            <Award className="w-7 h-7 text-amber-300" />
          )}
        </div>

        <h2 className="font-display text-2xl font-bold text-slate-100 mb-1.5">
          {isGameOver
            ? 'Kristal Parçalandı'
            : isVictory
              ? `${meta.cefr} Turu Tamamlandı`
              : `Seviye ${currentLevel} Turu Tamamlandı`}
        </h2>

        <p className="text-sm text-slate-300 mb-5 leading-relaxed">
          {isGameOver
            ? 'Tüm canların tükendi ve kadim kristal karanlığa gömüldü. Yeni bir turla ışığı geri getirebilirsin.'
            : isVictory
              ? `${meta.cefr} — ${meta.title} bölümünden ${STAGE_SIZE} cümlelik turu tamamladın! Havuzda toplam ${currentStats.done.toLocaleString('tr-TR')}/${currentStats.total.toLocaleString('tr-TR')} cümle çözüldü.`
              : `${meta.cefr} — ${meta.title} bölümünde bir turu başarıyla tamamladın. (${currentStats.done.toLocaleString('tr-TR')}/${currentStats.total.toLocaleString('tr-TR')} çözüldü)`}
        </p>

        <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-900/80 border border-white/10 p-3 mb-6 text-center font-mono-tabular">
          <div>
            <p className="text-[11px] text-slate-400">Puan</p>
            <p className="text-base font-semibold text-slate-100">{score}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Rekor</p>
            <p className="text-base font-semibold text-sky-300">{highScore}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">En İyi Seri</p>
            <p className="text-base font-semibold text-amber-300">{bestStreak}x</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
          {isGameOver ? (
            <button
              type="button"
              onClick={onRetryLevel}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-500 hover:bg-rose-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Yeniden Dene</span>
            </button>
          ) : isVictory ? (
            <>
              <button
                type="button"
                onClick={onContinueLevel}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>C2’de Yeni Tur</span>
              </button>
              <button
                type="button"
                onClick={onResetAll}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/15 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Baştan Oyna</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onContinueLevel}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/15 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Aynı Seviyede Yeni Tur</span>
              </button>
              <button
                type="button"
                onClick={onNextLevel}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors cursor-pointer"
              >
                <span>Sonraki Seviye{nextMeta ? ` (${nextMeta.cefr})` : ''}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
