import React, { useEffect, useState } from 'react';
import { triggerCelebrationConfetti } from '../utils/confetti';
import {
  Award,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FileCheck,
  Globe,
  Lightbulb,
  Mail,
  Printer,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
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
  const [copiedHash, setCopiedHash] = useState(false);

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

  const handleCopyChecksum = () => {
    if (!receipt?.verificationChecksum) return;
    navigator.clipboard.writeText(receipt.verificationChecksum);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* 1. CELEBRATORY PASS / FAIL BANNER */}
      <div
        className={`glass-panel p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl ${
          isPassed
            ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/30 via-slate-900/60 to-slate-900/80 shadow-emerald-950/30'
            : 'border-rose-500/40 bg-gradient-to-b from-rose-950/30 via-slate-900/60 to-slate-900/80 shadow-rose-950/30'
        }`}
      >
        {/* Ambient Top Glow */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent ${
            isPassed ? 'via-emerald-400' : 'via-rose-400'
          } to-transparent blur-xs`}
        />

        <div
          className={`w-18 h-18 sm:w-20 sm:h-20 rounded-3xl mx-auto flex items-center justify-center text-white mb-5 shadow-2xl ${
            isPassed
              ? 'bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/40 border border-emerald-300/30'
              : 'bg-gradient-to-br from-rose-500 to-red-700 shadow-rose-500/40 border border-rose-300/30'
          }`}
        >
          {isPassed ? <Trophy size={40} /> : <Award size={40} />}
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border backdrop-blur-md">
          {isPassed ? (
            <span className="text-emerald-400 flex items-center gap-1.5">
              <Sparkles size={14} /> Evaluation Result: Passed
            </span>
          ) : (
            <span className="text-rose-400 flex items-center gap-1.5">
              <Award size={14} /> Evaluation Result: Assessment Completed
            </span>
          )}
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
          {isPassed ? 'Congratulations! You Passed' : 'Assessment Completed'}
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
          {isPassed
            ? `Outstanding performance! You successfully satisfied the passing threshold for ${scorecard.examTitle}.`
            : `You achieved a final score of ${scorecard.percentage}% on ${scorecard.examTitle}. Continue practicing to meet the passing target.`}
        </p>

        {/* Big Score and Percentage Metrics Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8">
          <div className="glass-card px-4 py-4 text-center border-white/10 shadow-lg">
            <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
              Percentage
            </span>
            <span
              className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                isPassed ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {scorecard.percentage}%
            </span>
          </div>

          <div className="glass-card px-4 py-4 text-center border-white/10 shadow-lg">
            <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
              Final Score
            </span>
            <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
              {scorecard.totalScore}
              <span className="text-sm font-normal text-slate-400">/{scorecard.maxScore}</span>
            </span>
          </div>

          <div className="glass-card px-4 py-4 text-center border-white/10 shadow-lg">
            <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
              Pass Target
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-200 tracking-tight pt-1 block">
              {scorecard.passingMarks} <span className="text-xs font-normal text-slate-400">pts</span>
            </span>
          </div>

          <div className="glass-card px-4 py-4 text-center border-white/10 shadow-lg">
            <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
              Time Spent
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-sky-400 tracking-tight pt-1 block">
              {formatDuration(scorecard.durationSpentSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. OFFICIAL PROCTORING COMPLETION RECEIPT CERTIFICATE */}
      <div className="glass-panel p-6 sm:p-10 receipt-certificate border-indigo-500/30 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 shadow-inner">
              <FileCheck size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl text-white">
                  Official Examination Certificate
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Receipt ID: {receipt?.receiptId || scorecard.attemptId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handlePrint}
              className="btn-secondary text-xs px-4 py-2 hover:border-indigo-500/40 shadow-sm"
            >
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* 2-Column Receipt Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="glass-card p-4 space-y-3">
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <User size={14} className="text-indigo-400" /> Candidate Name
              </span>
              <span className="font-bold text-white text-sm">{scorecard.studentName}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mail size={14} className="text-indigo-400" /> Registered Email
              </span>
              <span className="font-mono text-slate-200">{scorecard.studentEmail}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Globe size={14} className="text-emerald-400" /> Proctored Real IP
              </span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-500/30">
                {scorecard.clientIp}
              </span>
            </div>
          </div>

          <div className="glass-card p-4 space-y-3">
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Award size={14} className="text-indigo-400" /> Examination Title
              </span>
              <span className="font-semibold text-slate-200 text-right">{scorecard.examTitle}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock size={14} className="text-indigo-400" /> Submission Time
              </span>
              <span className="font-mono text-slate-300 text-right">
                {scorecard.submittedAt ? new Date(scorecard.submittedAt).toUTCString() : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-indigo-400" /> Final Result
              </span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded text-[11px] ${
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
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-indigo-400 shrink-0" />
              <span>SHA-256 Tamper-Proof Cryptographic Verification Checksum:</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <code className="font-mono text-indigo-300 font-semibold bg-slate-900/90 px-3 py-1.5 rounded-lg border border-indigo-500/25 text-[11px] truncate max-w-full sm:max-w-xs select-all">
                {receipt.verificationChecksum}
              </code>
              <button
                onClick={handleCopyChecksum}
                className="btn-secondary text-[11px] px-2.5 py-1.5 shrink-0"
                title="Copy SHA-256 Signature"
              >
                {copiedHash ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedHash ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. QUESTION BREAKDOWN ACCORDION */}
      {scorecard.questionBreakdown && scorecard.questionBreakdown.length > 0 && (
        <div className="glass-panel p-6 sm:p-8 no-print shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                Question Breakdown &amp; Solutions
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review individual questions, awarded scores, and expert explanations.
              </p>
            </div>
            <button
              onClick={() => setShowReview(!showReview)}
              className="btn-secondary text-xs px-4 py-2 font-medium"
            >
              {showReview ? 'Hide Review' : `View All (${scorecard.questionBreakdown.length}) Solutions`}
            </button>
          </div>

          {showReview && (
            <div className="space-y-4 mt-6 pt-4 border-t border-white/[0.08] animate-in fade-in duration-200">
              {scorecard.questionBreakdown.map((q, idx) => (
                <div
                  key={q.questionId}
                  className={`p-5 rounded-2xl border transition-all ${
                    q.isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/25 shadow-sm'
                      : 'bg-rose-950/20 border-rose-500/25 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-bold text-xs text-slate-300 font-mono">
                      Question {idx + 1} &bull; {q.pointsAwarded}/{q.maxPoints} pts
                    </span>
                    <span
                      className={`text-xs font-bold flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${
                        q.isCorrect
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {q.isCorrect ? (
                        <>
                          <CheckCircle2 size={13} /> Correct Answer
                        </>
                      ) : (
                        <>
                          <XCircle size={13} /> Incorrect Answer
                        </>
                      )}
                    </span>
                  </div>

                  {q.questionText && (
                    <p className="text-sm text-slate-200 mb-3 font-medium leading-relaxed">
                      {q.questionText}
                    </p>
                  )}

                  {q.explanation && (
                    <div className="text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-xl border border-white/5 mt-3 flex items-start gap-2.5">
                      <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-200 block mb-0.5">
                          Solution Explanation:
                        </span>
                        <p className="text-slate-400 leading-relaxed">{q.explanation}</p>
                      </div>
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
        <button
          onClick={onReset}
          className="btn-primary px-8 py-3.5 text-sm sm:text-base font-bold shadow-xl shadow-indigo-600/30"
        >
          <RefreshCcw size={17} />
          <span>Take Another Examination</span>
        </button>
      </div>
    </div>
  );
};
