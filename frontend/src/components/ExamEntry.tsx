import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Edit2,
  KeyRound,
  Mail,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  X
} from 'lucide-react';
import { ColdStartBanner } from './ColdStartBanner';
import { StartAttemptRequest, StartAttemptResponse } from '../types/exam';
import { api, getApiBaseUrl, setApiBaseUrl } from '../services/api';

interface ExamEntryProps {
  onSessionStarted: (session: StartAttemptResponse) => void;
}

export function extractCleanExamCode(input: string): string {
  if (!input) return '';
  let clean = input.trim();
  while (clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  if (clean.includes('?')) {
    try {
      const url = new URL(clean.startsWith('http') ? clean : `http://dummy.com/${clean}`);
      const code = url.searchParams.get('code') || url.searchParams.get('examCode') || url.searchParams.get('shareCode');
      if (code) return code.trim();
      clean = url.pathname;
    } catch {
      clean = clean.split('?')[0];
    }
  }
  if (clean.includes('/')) {
    const parts = clean.split('/').filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i].trim();
      if (p && !['share', 'exams', 'exam', 'public'].includes(p.toLowerCase())) {
        return p;
      }
    }
  }
  return clean;
}

export const ExamEntry: React.FC<ExamEntryProps> = ({ onSessionStarted }) => {
  const [examCode, setExamCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Backend URL configuration modal/input
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverUrl, setServerUrl] = useState(getApiBaseUrl());

  // Auto-fill exam code from URL params if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code') || params.get('examCode') || params.get('shareCode');
    if (code) {
      setExamCode(code.trim());
    }
  }, []);

  const extractedCode = extractCleanExamCode(examCode);
  const isUrlPasted = examCode.trim().length > 0 && examCode.trim() !== extractedCode;

  const handleSaveServerUrl = () => {
    setApiBaseUrl(serverUrl.trim());
    setShowServerConfig(false);
    setError(null);
  };

  const handleSelectPreset = (url: string) => {
    setServerUrl(url);
    setApiBaseUrl(url);
    setShowServerConfig(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = extractCleanExamCode(examCode);
    if (!cleanCode) {
      setError('Please provide an Exam Code or Share Link.');
      return;
    }
    if (!studentName.trim()) {
      setError('Please provide your Full Name.');
      return;
    }
    if (!studentEmail.trim() || !studentEmail.includes('@')) {
      setError('Please provide a valid Email Address.');
      return;
    }

    setLoading(true);
    try {
      const payload: StartAttemptRequest = {
        examCode: cleanCode,
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim().toLowerCase()
      };

      const response = await api.startAttempt(payload);
      onSessionStarted(response);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start examination';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
      <ColdStartBanner />

      <div className="glass-panel p-6 sm:p-10 relative overflow-hidden shadow-2xl border-white/10">
        {/* Decorative Top Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent blur-sm" />

        <div className="text-center mb-8">
          <div className="relative inline-flex mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-md opacity-40 animate-pulse" />
            <div className="relative p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/10 border border-indigo-500/30 text-indigo-400 shadow-inner">
              <BookOpen size={30} className="text-indigo-400" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Candidate Examination Entry
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            Enter your candidate details and examination share code to initiate your evaluated session.
          </p>

          {/* Active Backend Indicator */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-mono text-slate-300 bg-slate-900/80 px-3 py-1 rounded-full border border-white/10 shadow-sm">
              <Server size={12} className="text-emerald-400" />
              <span className="text-[11px] truncate max-w-[200px]">{getApiBaseUrl() || 'Relative Proxy'}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowServerConfig(!showServerConfig)}
              className="text-indigo-400 hover:text-indigo-300 underline inline-flex items-center gap-1 text-xs font-medium transition-colors"
            >
              <Edit2 size={11} /> {showServerConfig ? 'Close' : 'Change Target'}
            </button>
          </div>

          {/* Collapsible Backend Server URL Config */}
          {showServerConfig && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 text-left space-y-3 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-200">
                  Backend API Endpoint (Render / Local):
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('https://ms4-d7da.onrender.com')}
                    className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 transition-colors"
                  >
                    Render
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('http://localhost:8084')}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
                  >
                    Local 8084
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="https://ms4-d7da.onrender.com"
                  className="input-field py-2 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleSaveServerUrl}
                  className="btn-primary py-2 px-3.5 text-xs shrink-0"
                >
                  <Check size={14} /> Save
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 shadow-lg">
            <ShieldAlert size={20} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-rose-200">Unable to Start Exam</p>
              <p className="mt-0.5 text-xs text-rose-300/90 leading-relaxed">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-200 p-0.5"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Exam Code or Share Link */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Exam Code or Share Link <span className="text-indigo-400">*</span>
              </label>
              {isUrlPasted && (
                <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-400" />
                  Code: {extractedCode}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound size={18} className="text-indigo-400/80" />
              </div>
              <input
                type="text"
                value={examCode}
                onChange={(e) => setExamCode(e.target.value)}
                placeholder="e.g. EXAM-A1B2C3D4 or paste full share URL"
                className="input-field pl-10.5 font-mono tracking-wide text-sm placeholder:font-sans"
                required
                disabled={loading}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
              <span>Supports direct exam code or share URL links from MS2.</span>
            </p>
          </div>

          {/* 2. Candidate Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              Candidate Full Name <span className="text-indigo-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User size={18} className="text-indigo-400/80" />
              </div>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. John Doe"
                className="input-field pl-10.5 text-sm"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* 3. Candidate Email */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              Email Address <span className="text-indigo-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} className="text-indigo-400/80" />
              </div>
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="e.g. candidate@example.com"
                className="input-field pl-10.5 text-sm font-mono placeholder:font-sans"
                required
                disabled={loading}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Your official completion scorecard and proctored receipt will be tied to this email.
            </p>
          </div>

          {/* Mandatory Proctoring IP Tracking Disclosure */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700/60 text-xs text-slate-300 shadow-inner">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-1.5">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>Mandatory Proctoring Audit Active</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your real Client IP Address (<code className="text-slate-300 font-mono">X-Forwarded-For</code>), device User-Agent, and initiation timestamp are cryptographically logged upon entry. Anonymous attempts are strictly forbidden.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-base font-bold mt-2 shadow-xl hover:shadow-indigo-500/25 transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2.5">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Validating &amp; Launching Session...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles size={19} />
                <span>Start Examination Now</span>
                <ArrowRight size={19} className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
