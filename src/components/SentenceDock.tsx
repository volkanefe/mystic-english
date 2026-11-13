import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, HelpCircle, RotateCcw, Undo2 } from 'lucide-react';
import { FeedbackState, SentenceEntry, WordToken } from '../types/game';
import { joinWordTokens } from '../data/sentences';

interface SentenceDockProps {
  sentence: SentenceEntry;
  availableTokens: WordToken[];
  placedTokens: WordToken[];
  feedback: FeedbackState;
  showHint: boolean;
  isBusy: boolean;
  collapsed: boolean;
  lives: number;
  onPlaceToken: (uid: string) => void;
  onRemoveToken: (uid: string) => void;
  onReorderPlaced: (fromIdx: number, toIdx: number) => void;
  onUndoLast: () => void;
  onClearPlaced: () => void;
  onCheckAnswer: () => void;
  onToggleHint: () => void;
  onToggleCollapsed: () => void;
}

export function SentenceDock({
  sentence,
  availableTokens,
  placedTokens,
  feedback,
  showHint,
  isBusy,
  collapsed,
  lives,
  onPlaceToken,
  onRemoveToken,
  onReorderPlaced,
  onUndoLast,
  onClearPlaced,
  onCheckAnswer,
  onToggleHint,
  onToggleCollapsed,
}: SentenceDockProps) {
  const [dragData, setDragData] = useState<{ source: 'pool' | 'placed'; uid: string; index: number } | null>(null);
  const [dropActive, setDropActive] = useState(false);

  const previewText = joinWordTokens(placedTokens.map((t) => t.text));

  const handleDragStartPool = (e: React.DragEvent, token: WordToken, idx: number) => {
    setDragData({ source: 'pool', uid: token.uid, index: idx });
    e.dataTransfer.setData('text/plain', token.uid);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragStartPlaced = (e: React.DragEvent, token: WordToken, idx: number) => {
    setDragData({ source: 'placed', uid: token.uid, index: idx });
    e.dataTransfer.setData('text/plain', token.uid);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropOnZone = (e: React.DragEvent) => {
    e.preventDefault();
    setDropActive(false);
    if (!dragData || isBusy) return;
    if (dragData.source === 'pool') {
      onPlaceToken(dragData.uid);
    }
    setDragData(null);
  };

  const handleDropOnPlacedChip = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropActive(false);
    if (!dragData || isBusy) return;
    if (dragData.source === 'placed') {
      onReorderPlaced(dragData.index, targetIdx);
    } else if (dragData.source === 'pool') {
      onPlaceToken(dragData.uid);
    }
    setDragData(null);
  };

  const handleDropOnPool = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragData || isBusy) return;
    if (dragData.source === 'placed') {
      onRemoveToken(dragData.uid);
    }
    setDragData(null);
  };

  return (
    <section
      aria-label="Cümle Kurma Alanı"
      className="fixed bottom-0 left-0 right-0 z-20 flex flex-col items-center px-3 pb-3 sm:px-5 sm:pb-5 pointer-events-none"
    >
      {/* Collapse / Expand 3D View Toggle */}
      <button
        type="button"
        onClick={onToggleCollapsed}
        className="pointer-events-auto mb-1.5 inline-flex items-center gap-1.5 rounded-t-lg bg-[#090e18]/90 hover:bg-slate-800 border border-b-0 border-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
      >
        {collapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-sky-300" />
            <span>Paneli Göster</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sahneyi İzle</span>
          </>
        )}
      </button>

      {/* Main Bottom Dock */}
      {!collapsed && (
        <div
          className={`pointer-events-auto w-full max-w-4xl rounded-xl bg-[#090e18]/90 border px-3.5 py-3.5 sm:px-5 sm:py-4 shadow-2xl transition-transform duration-200 ${
            feedback.type === 'error'
              ? 'border-rose-500/60 animate-shake'
              : feedback.type === 'success'
                ? 'border-emerald-400/60'
                : lives === 1
                  ? 'border-rose-500/35'
                  : 'border-white/10'
          }`}
        >
          {/* Turkish Prompt + Tip Toggle */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-sky-300/90 tracking-wide mb-0.5">
                Türkçe Anlam
              </p>
              <h2 className="text-base sm:text-lg font-semibold text-slate-100 leading-snug">
                {sentence.turkish}
              </h2>
            </div>

            <button
              type="button"
              onClick={onToggleHint}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer shrink-0 min-h-[34px] ${
                showHint
                  ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 border-white/10 text-slate-300'
              }`}
              title="Dilbilgisi İpucu"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">İpucu</span>
            </button>
          </div>

          {showHint && (
            <p className="mb-2.5 text-xs text-amber-200/90 bg-amber-950/35 border border-amber-500/25 rounded-lg px-3 py-1.5">
              {sentence.grammarTip}
            </p>
          )}

          {/* Sentence Construction Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDropActive(true);
            }}
            onDragLeave={() => setDropActive(false)}
            onDrop={handleDropOnZone}
            className={`min-h-[58px] rounded-lg border px-3 py-2 mb-3 flex flex-wrap items-center gap-2 transition-colors ${
              dropActive
                ? 'bg-sky-950/40 border-sky-400/60'
                : 'bg-[#05080f]/85 border-white/10'
            }`}
          >
            {placedTokens.length === 0 ? (
              <span className="text-xs sm:text-sm text-slate-500">
                Aşağıdaki kelimelere dokun veya buraya sürükleyerek cümleyi oluştur...
              </span>
            ) : (
              placedTokens.map((token, idx) => (
                <button
                  key={token.uid}
                  type="button"
                  draggable={!isBusy}
                  onDragStart={(e) => handleDragStartPlaced(e, token, idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnPlacedChip(e, idx)}
                  onClick={() => !isBusy && onRemoveToken(token.uid)}
                  className="inline-flex items-center justify-center rounded-lg bg-sky-500/20 hover:bg-rose-500/25 border border-sky-400/40 hover:border-rose-400/50 px-3 py-1.5 min-h-[38px] text-sm font-medium text-sky-100 transition-colors cursor-pointer select-none"
                  title="Geri almak için tıkla veya sırayı değiştirmek için sürükle"
                >
                  {token.text}
                </button>
              ))
            )}
          </div>

          {/* Live Sentence Preview + Feedback */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 min-h-[20px]">
            <p className="text-xs text-slate-400 truncate max-w-full">
              {placedTokens.length > 0 ? (
                <>
                  Önizleme: <span className="text-slate-200 font-medium">{previewText}</span>
                </>
              ) : (
                'Büyük harf ve noktalama işaretine dikkat et.'
              )}
            </p>
            {feedback.type !== 'idle' && (
              <p
                className={`text-xs font-medium ${
                  feedback.type === 'success'
                    ? 'text-emerald-300'
                    : feedback.type === 'punctuation_warning'
                      ? 'text-amber-300'
                      : 'text-rose-300'
                }`}
              >
                {feedback.message}
              </p>
            )}
          </div>

          {/* Shuffled Word Pool + Primary Actions */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropOnPool}
              className="flex flex-wrap items-center gap-2 flex-1"
            >
              {availableTokens.length === 0 ? (
                <span className="text-xs text-slate-500 py-2">
                  Tüm kelimeler yerleştirildi — kontrol etmeye hazır.
                </span>
              ) : (
                availableTokens.map((token, idx) => (
                  <button
                    key={token.uid}
                    type="button"
                    draggable={!isBusy}
                    onDragStart={(e) => handleDragStartPool(e, token, idx)}
                    onClick={() => !isBusy && onPlaceToken(token.uid)}
                    className="inline-flex items-center justify-center rounded-lg bg-slate-800/95 hover:bg-slate-700 active:scale-95 border border-white/15 hover:border-sky-400/50 px-3.5 py-2 min-h-[42px] text-sm font-medium text-slate-100 shadow-sm transition-all cursor-pointer select-none"
                  >
                    {token.text}
                  </button>
                ))
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 justify-end">
              <button
                type="button"
                onClick={onUndoLast}
                disabled={placedTokens.length === 0 || isBusy}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none border border-white/10 px-3 py-2 min-h-[42px] text-xs font-medium text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                title="Son Kelimeyi Geri Al (Backspace)"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Geri Al</span>
              </button>

              <button
                type="button"
                onClick={onClearPlaced}
                disabled={placedTokens.length === 0 || isBusy}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none border border-white/10 px-3 py-2 min-h-[42px] text-xs font-medium text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Temizle</span>
              </button>

              <button
                type="button"
                onClick={onCheckAnswer}
                disabled={placedTokens.length === 0 || isBusy}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-400 disabled:pointer-events-none px-4 py-2 min-h-[42px] text-xs sm:text-sm font-semibold text-slate-950 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Check className="w-4 h-4" />
                <span>Kontrol Et</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
