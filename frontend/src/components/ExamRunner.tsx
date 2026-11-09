import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Flag,
  Globe,
  Loader2,
  Send,
  Trash2,
  User
} from 'lucide-react';
import { QuestionPalette } from './QuestionPalette';
import { PublicQuestion, ScorecardResponse, StartAttemptResponse } from '../types/exam';
import { api } from '../services/api';

interface ExamRunnerProps {
  session: StartAttemptResponse;
  onExamSubmitted: (scorecard: ScorecardResponse) => void;
}

export const ExamRunner: React.FC<ExamRunnerProps> = ({ session, onExamSubmitted }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>(session.savedAnswers || {});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [remainingSec, setRemainingSec] = useState<number>(session.remainingSeconds);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(new Date());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const questions: PublicQuestion[] = session.questions || [];
  const currentQuestion = questions[currentIdx];

  // Live Timer Countdown
  useEffect(() => {
    if (remainingSec <= 0) {
      handleFinalSubmit(true);
      return;
    }

    const timer = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSec]);

  // Format seconds to HH:MM:SS or MM:SS
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  // Timer color classes
  let timerClass = 'timer-normal';
  if (remainingSec < 60) {
    timerClass = 'timer-critical';
  } else if (remainingSec < 300) {
    timerClass = 'timer-amber';
  }

  // Auto-Save Handler
  const saveTimeoutRef = useRef<number | null>(null);

  const handleSelectOption = (questionId: string, optionId: string, isMulti: boolean) => {
    const currentSelected = answers[questionId] || [];
    let updated: string[];

    if (isMulti) {
      if (currentSelected.includes(optionId)) {
        updated = currentSelected.filter((id) => id !== optionId);
      } else {
        updated = [...currentSelected, optionId];
      }
    } else {
      updated = [optionId];
    }

    setAnswers((prev) => ({ ...prev, [questionId]: updated }));

    // Debounced or direct auto-save
    setIsSaving(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(async () => {
      try {
        await api.saveAnswer(session.attemptId, questionId, updated);
        setLastSavedTime(new Date());
      } catch (err) {
        console.error('Auto-save error:', err);
      } finally {
        setIsSaving(false);
      }
    }, 150);
  };

  const handleClearSelection = async (questionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: [] }));
    setIsSaving(true);
    try {
      await api.saveAnswer(session.attemptId, questionId, []);
      setLastSavedTime(new Date());
    } catch (err) {
      console.error('Clear selection error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  // Final Submit Handler
  const handleFinalSubmit = async (isAutoTimedOut: boolean = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const scorecard = await api.submitAttempt(session.attemptId);
      setShowSubmitModal(false);
      onExamSubmitted(scorecard);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      setSubmitError(msg);
      setIsSubmitting(false);
      if (isAutoTimedOut) {
        // Retry submission after 2 seconds if auto-timed out
        setTimeout(() => handleFinalSubmit(true), 2000);
      }
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 glass-panel text-center mt-12">
        <AlertTriangle size={36} className="text-amber-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-white">No Questions Found</h3>
        <p className="text-sm text-slate-400 mt-2">
          This examination does not contain any questions yet or the question service is unavailable.
        </p>
      </div>
    );
  }

  const isMulti = currentQuestion?.questionType === 'MULTIPLE_CHOICE';
  const selectedOptions = answers[currentQuestion?.id] || [];
  const isFlagged = flaggedIds.has(currentQuestion?.id);

  const totalAnswered = questions.filter((q) => answers[q.id]?.length > 0).length;
  const totalUnanswered = questions.length - totalAnswered;

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. STICKY RUNNER HEADER */}
      <header className="sticky top-0 z-30 bg-[#080c14]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Exam Title & Candidate Info */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg tracking-tight">
                {session.examTitle || 'Online Examination'}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1 text-slate-300 font-medium">
                  <User size={13} className="text-indigo-400" />
                  {session.studentName}
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="flex items-center gap-1 text-slate-300 font-mono bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
                  <Globe size={12} className="text-emerald-400" />
                  IP: {session.clientIp}
                </span>
              </div>
            </div>

            {/* Mobile Submit Button */}
            <div className="md:hidden">
              <button onClick={() => setShowSubmitModal(true)} className="btn-success text-xs py-1.5 px-3">
                <Send size={13} />
                <span>Submit</span>
              </button>
            </div>
          </div>

          {/* Right Header: Auto-save status, Live Timer, Submit Button */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            {/* Auto-Save Indicator */}
            <div className="text-xs flex items-center gap-1.5 text-slate-400">
              {isSaving ? (
                <>
                  <Loader2 size={13} className="animate-spin text-indigo-400" />
                  <span className="text-indigo-300">Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span className="text-slate-400 hidden sm:inline">
                    Saved {lastSavedTime ? lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                  </span>
                </>
              )}
            </div>

            {/* LIVE COUNTDOWN TIMER */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm sm:text-base font-bold transition-all ${timerClass}`}
            >
              <Clock size={17} className={remainingSec < 60 ? 'animate-bounce' : ''} />
              <span>{formatTime(remainingSec)}</span>
              {remainingSec < 60 && (
                <span className="text-[10px] uppercase tracking-wider font-sans font-bold bg-red-600 text-white px-1.5 py-0.2 rounded animate-pulse">
                  Ending
                </span>
              )}
            </div>

            {/* Desktop Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="btn-success text-sm py-2 px-4 hidden md:inline-flex"
            >
              <Send size={15} />
              <span>Submit Test</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN RUNNER BODY */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* LEFT 3 COLUMNS: Current Question */}
          <div className="lg:col-span-3 space-y-5">
            <div className="glass-panel p-6 sm:p-8">
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-sm border border-indigo-500/30">
                    Question {currentIdx + 1} of {questions.length}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium border border-slate-700/60">
                    {currentQuestion.points} {currentQuestion.points === 1 ? 'Mark' : 'Marks'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50">
                    {currentQuestion.questionType.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className={`text-xs px-3 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                      isFlagged
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold'
                        : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Flag size={13} className={isFlagged ? 'fill-amber-400 text-amber-400' : ''} />
                    <span>{isFlagged ? 'Flagged' : 'Flag for Review'}</span>
                  </button>
                </div>
              </div>

              {/* Question Text Prompt */}
              <div className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed mb-6">
                {currentQuestion.questionText}
              </div>

              {isMulti && (
                <div className="mb-4 text-xs text-indigo-300 bg-indigo-950/30 border border-indigo-500/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                  <span>Multiple Choice: Select all options that apply.</span>
                </div>
              )}

              {/* Options List */}
              <div className="space-y-3">
                {currentQuestion.options && currentQuestion.options.length > 0 ? (
                  currentQuestion.options.map((opt, oIdx) => {
                    const isSelected = selectedOptions.includes(opt.id);
                    const letter = String.fromCharCode(65 + oIdx);

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(currentQuestion.id, opt.id, isMulti)}
                        className={`option-card ${isSelected ? 'selected' : ''}`}
                      >
                        <div
                          className={`w-6 h-6 rounded-${isMulti ? 'md' : 'full'} flex items-center justify-center shrink-0 border transition-all text-xs font-bold ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'border-slate-600 text-slate-400 bg-slate-800/40'
                          }`}
                        >
                          {isSelected ? (isMulti ? <Check size={14} /> : letter) : letter}
                        </div>
                        <div className="text-sm sm:text-base text-slate-200 pt-0.5 select-none">
                          {opt.optionText}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-400 text-sm">No options provided for this question.</p>
                )}
              </div>

              {/* Bottom Actions for Current Question */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={() => handleClearSelection(currentQuestion.id)}
                  disabled={selectedOptions.length === 0}
                  className="btn-secondary text-xs px-3 py-1.5 text-slate-400 hover:text-red-400 disabled:opacity-30"
                >
                  <Trash2 size={13} />
                  <span>Clear Answer</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                    disabled={currentIdx === 0}
                    className="btn-secondary text-xs sm:text-sm px-4 py-2"
                  >
                    <ArrowLeft size={15} />
                    <span>Previous</span>
                  </button>

                  <button
                    onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
                    disabled={currentIdx === questions.length - 1}
                    className="btn-primary text-xs sm:text-sm px-4 py-2"
                  >
                    <span>Next</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 1 COLUMN: Question Palette Grid */}
          <div className="lg:col-span-1">
            <QuestionPalette
              questions={questions}
              currentIndex={currentIdx}
              answers={answers}
              flaggedQuestionIds={flaggedIds}
              onSelectQuestion={(idx) => setCurrentIdx(idx)}
            />
          </div>
        </div>
      </main>

      {/* 3. FINAL SUBMISSION CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="glass-panel max-w-md w-full p-6 sm:p-7 border-indigo-500/30">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <Send size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Submit Examination?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Once submitted, your responses will be evaluated instantly and the exam session will conclude.
              </p>
            </div>

            {/* Answer Summary Breakdown */}
            <div className="glass-card mb-5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Total Questions:</span>
                <span className="font-bold text-white font-mono">{questions.length}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-300">
                <span>Answered:</span>
                <span className="font-bold font-mono">{totalAnswered}</span>
              </div>
              <div className="flex justify-between items-center text-amber-300">
                <span>Unanswered:</span>
                <span className="font-bold font-mono">{totalUnanswered}</span>
              </div>
              <div className="flex justify-between items-center text-indigo-300">
                <span>Flagged for Review:</span>
                <span className="font-bold font-mono">{flaggedIds.size}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pt-2 border-t border-white/5 font-mono">
                <span>Time Remaining:</span>
                <span className="font-bold text-sky-400">{formatTime(remainingSec)}</span>
              </div>
            </div>

            {submitError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                {submitError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="btn-secondary w-1/2 py-2.5 text-xs sm:text-sm"
              >
                Back to Exam
              </button>
              <button
                onClick={() => handleFinalSubmit(false)}
                disabled={isSubmitting}
                className="btn-success w-1/2 py-2.5 text-xs sm:text-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={15} className="animate-spin" />
                    <span>Grading...</span>
                  </span>
                ) : (
                  <span>Yes, Submit</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

