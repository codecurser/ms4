import React from 'react';
import { Flag, CheckCircle, HelpCircle } from 'lucide-react';
import { PublicQuestion } from '../types/exam';

interface QuestionPaletteProps {
  questions: PublicQuestion[];
  currentIndex: number;
  answers: Record<string, string[]>;
  flaggedQuestionIds: Set<string>;
  onSelectQuestion: (index: number) => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  questions,
  currentIndex,
  answers,
  flaggedQuestionIds,
  onSelectQuestion
}) => {
  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    return a && a.length > 0;
  }).length;

  const flaggedCount = flaggedQuestionIds.size;
  const unansweredCount = questions.length - answeredCount;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div className="glass-panel p-5 sticky top-24 shadow-xl border-white/10">
      {/* Header & Percentage */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-sm text-white tracking-tight">Question Palette</h3>
          <p className="text-[11px] text-slate-400">Navigation &amp; Status</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-bold text-indigo-400">
            {answeredCount}/{questions.length}
          </span>
          <span className="text-[10px] text-slate-400 ml-1">({progressPercent}%)</span>
        </div>
      </div>

      {/* Mini Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4 border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Legend / Status Chips */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-[11px]">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 bg-emerald-950/40 border border-emerald-500/25 px-2 py-2 rounded-xl text-emerald-300 font-medium">
          <CheckCircle size={13} className="text-emerald-400 shrink-0" />
          <span>Ans ({answeredCount})</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 bg-amber-950/40 border border-amber-500/25 px-2 py-2 rounded-xl text-amber-300 font-medium">
          <Flag size={13} className="text-amber-400 shrink-0" />
          <span>Flag ({flaggedCount})</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 bg-slate-800/40 border border-slate-700/50 px-2 py-2 rounded-xl text-slate-400 font-medium">
          <HelpCircle size={13} className="shrink-0" />
          <span>Left ({unansweredCount})</span>
        </div>
      </div>

      {/* Question Grid Buttons */}
      <div className="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const isAnswered = Boolean(answers[q.id] && answers[q.id].length > 0);
          const isFlagged = flaggedQuestionIds.has(q.id);
          const isCurrent = idx === currentIndex;

          let btnClass = 'palette-btn-unanswered';
          if (isFlagged) {
            btnClass = 'palette-btn-flagged';
          } else if (isAnswered) {
            btnClass = 'palette-btn-answered';
          }

          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(idx)}
              className={`palette-btn ${btnClass} ${isCurrent ? 'palette-btn-current' : ''}`}
              title={`Question ${idx + 1} &bull; ${q.points} pt${q.points === 1 ? '' : 's'}`}
            >
              {idx + 1}
              {isFlagged && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-slate-900" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
