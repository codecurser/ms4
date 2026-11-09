import React, { useEffect, useState } from 'react';
import { triggerCelebrationConfetti } from '../utils/confetti';
import {
  Award,
  CheckCircle2,
  Clock,
  FileCheck,
  Globe,
  Mail,
  Printer,
  RefreshCcw,
  ShieldCheck,
  Trophy,
  User,
  XCircle
} from 'lucide-react';
import { ScorecardResponse } from '../types/exam';

interface ExamResultProps {
  scorecard: ScorecardResponse;
  onReset: () => void;
}

export const ExamResult: React.FC<ExamResultProps> = ({ scorecard, onReset }) => {
  const [showReview, setShowReview] = useState(false);

  const isPassed = Boolean(scorecard.isPassed);
  const receipt = scorecard.completionReceipt;

  // Trigger celebration confetti on pass!
  useEffect(() => {
    if (isPassed) {
      triggerCelebrationConfetti();
    }
  }, [isPassed]);

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      {/* 1. CELEBRATORY PASS / FAIL BANNER */}
      <div
        className={`glass-panel p-6 sm:p-8 text-center relative overflow-hidden ${
          isPassed
            ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 to-slate-900/60'
            : 'border-rose-500/40 bg-gradient-to-b from-rose-950/40 to-slate-900/60'
        }`}
      >
        <div
          className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-white mb-4 shadow-xl ${
            isPassed
              ? 'bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/30'
              : 'bg-gradient-to-br from-rose-500 to-red-700 shadow-rose-500/30'
          }`}
        >
          {isPassed ? <Trophy size={34} /> : <Award size={34} />}
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {isPassed ? 'Congratulations! You Passed' : 'Assessment Completed'}
        </h2>
        <p className="text-sm text-slate-300 mt-1 max-w-md mx-auto">
          {isPassed
            ? `Outstanding performance! You successfully met the passing criteria for ${scorecard.examTitle}.`
            : `You achieved ${scorecard.percentage}% on ${scorecard.examTitle}. Keep practicing and review key topics.`}
        </p>

        {/* Big Score and Percentage Chips */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
          <div className="glass-card px-6 py-3 border-white/10 text-center">
            <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold">Percentage</span>
            <span
              className={`text-3xl font-black font-mono ${
                isPassed ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {scorecard.percentage}%
            </span>
          </div>

          <div className="glass-card px-6 py-3 border-white/10 text-center">
            <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold">Score Earned</span>
            <span className="text-3xl font-black font-mono text-white">
              {scorecard.totalScore}
              <span className="text-base font-normal text-slate-400"> / {scorecard.maxScore}</span>
            </span>
          </div>

          <div className="glass-card px-6 py-3 border-white/10 text-center">
            <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold">Passing Target</span>
            <span className="text-2xl font-bold font-mono text-slate-300">
              {scorecard.passingMarks} pts
            </span>
          </div>

          <div className="glass-card px-6 py-3 border-white/10 text-center">
            <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold">Time Spent</span>
            <span className="text-2xl font-bold font-mono text-sky-400">
              {formatDuration(scorecard.durationSpentSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. OFFICIAL PROCTORING COMPLETION RECEIPT */}
      <div className="glass-panel p-6 sm:p-8 receipt-certificate border-indigo-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Official Examination Receipt</h3>
              <p className="text-xs text-slate-400 font-mono">
                Receipt ID: {receipt?.receiptId || scorecard.attemptId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handlePrint}
              className="btn-secondary text-xs px-3.5 py-2 hover:border-indigo-500/50"
            >
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* 2-Column Receipt Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="glass-card space-y-2.5">
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <User size={13} className="text-indigo-400" /> Candidate Name
              </span>
              <span className="font-semibold text-white text-sm">{scorecard.studentName}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mail size={13} className="text-indigo-400" /> Candidate Email
              </span>
              <span className="font-mono text-slate-200">{scorecard.studentEmail}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Globe size={13} className="text-emerald-400" /> Recorded Real IP
              </span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                {scorecard.clientIp}
              </span>
            </div>
          </div>

          <div className="glass-card space-y-2.5">
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Award size={13} className="text-indigo-400" /> Examination Title
              </span>
              <span className="font-medium text-slate-200 text-right">{scorecard.examTitle}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock size={13} className="text-indigo-400" /> Submission Time
              </span>
              <span className="font-mono text-slate-300 text-right">
                {scorecard.submittedAt ? new Date(scorecard.submittedAt).toUTCString() : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-indigo-400" /> Evaluation Status
              </span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  isPassed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {isPassed ? 'PASSED' : 'NOT PASSED'} ({scorecard.status})
              </span>
            </div>
          </div>
        </div>

        {/* Cryptographic Verification Checksum */}
        {receipt?.verificationChecksum && (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-indigo-400 shrink-0" />
              <span>SHA-256 Cryptographic Tamper-Proof Signature:</span>
            </div>
            <code className="font-mono text-indigo-300 font-semibold bg-slate-900/80 px-2.5 py-1 rounded border border-indigo-500/20">
              {receipt.verificationChecksum}
            </code>
          </div>
        )}
      </div>

      {/* 3. QUESTION BREAKDOWN TOGGLE (Optional) */}
      {scorecard.questionBreakdown && scorecard.questionBreakdown.length > 0 && (
        <div className="glass-panel p-6 no-print">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Question Breakdown &amp; Solutions</h3>
              <p className="text-xs text-slate-400">Review which questions were answered correctly.</p>
            </div>
            <button
              onClick={() => setShowReview(!showReview)}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              {showReview ? 'Hide Review' : 'View Question Breakdown'}
            </button>
          </div>

          {showReview && (
            <div className="space-y-4 mt-4 pt-4 border-t border-white/10">
              {scorecard.questionBreakdown.map((q, idx) => (
                <div
                  key={q.questionId}
                  className={`p-4 rounded-xl border ${
                    q.isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-300">
                      Question {idx + 1} &bull; {q.pointsAwarded}/{q.maxPoints} pts
                    </span>
                    <span
                      className={`text-xs font-bold flex items-center gap-1 ${
                        q.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {q.isCorrect ? (
                        <>
                          <CheckCircle2 size={13} /> Correct
                        </>
                      ) : (
                        <>
                          <XCircle size={13} /> Incorrect
                        </>
                      )}
                    </span>
                  </div>

                  {q.questionText && (
                    <p className="text-sm text-slate-200 mb-2">{q.questionText}</p>
                  )}

                  {q.explanation && (
                    <div className="text-xs text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-white/5 mt-2">
                      <span className="font-semibold text-slate-300">Solution Explanation: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. ACTIONS */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2 no-print">
        <button onClick={onReset} className="btn-primary px-6 py-3">
          <RefreshCcw size={16} />
          <span>Take Another Exam</span>
        </button>
      </div>
    </div>
  );
};
