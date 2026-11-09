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

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-slate-200">Question Palette</h3>
        <span className="text-xs text-slate-400 font-mono">
          {answeredCount}/{questions.length} Done
        </span>
      </div>

      {/* Legend / Status Chips */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-[11px]">
        <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/20 px-2 py-1.5 rounded-lg text-emerald-300">
          <CheckCircle size={13} className="text-emerald-400" />
          <span>Ans ({answeredCount})</span>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/20 px-2 py-1.5 rounded-lg text-amber-300">
          <Flag size={13} className="text-amber-400" />
          <span>Flag ({flaggedCount})</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800/40 border border-slate-700/50 px-2 py-1.5 rounded-lg text-slate-400">
          <HelpCircle size={13} />
          <span>Left ({unansweredCount})</span>
        </div>
      </div>

      {/* Question Grid Buttons */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1">
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
              title={`Question ${idx + 1} (${q.points} pts)`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

