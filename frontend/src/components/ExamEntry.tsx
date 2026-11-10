import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Check, Edit2, Globe, KeyRound, Mail, Server, ShieldAlert, Sparkles, User } from 'lucide-react';
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
    <div className="max-w-xl mx-auto w-full px-4 py-6">
      <ColdStartBanner />

      <div className="glass-panel p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3 shadow-inner">
            <BookOpen size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Candidate Examination Entry</h2>
          <p className="text-sm text-slate-400 mt-1">
            Enter your details and examination share code to initiate your evaluated session.
          </p>

          {/* Active Backend Indicator */}
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-mono text-slate-300 bg-slate-900/60 px-2.5 py-0.5 rounded border border-white/5">
              <Server size={11} className="text-emerald-400" />
              <span>{getApiBaseUrl() || 'Relative Proxy'}</span>
            </span>
            <button
              type="button"
              onClick={() => setShowServerConfig(!showServerConfig)}
              className="text-indigo-400 hover:text-indigo-300 underline inline-flex items-center gap-1 text-[11px]"
            >
              <Edit2 size={10} /> Change
            </button>
          </div>

          {/* Collapsible Backend Server URL Config */}
          {showServerConfig && (
            <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-indigo-500/30 text-left space-y-2">
              <label className="block text-[11px] font-semibold text-slate-300">
                Backend API URL (Render / Localhost):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="https://ms4-d7da.onrender.com"
                  className="input-field py-1.5 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleSaveServerUrl}
                  className="btn-primary py-1.5 px-3 text-xs"
                >
                  <Check size={13} /> Save
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
            <ShieldAlert size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200">Unable to Start Exam</p>
              <p className="mt-0.5 text-xs text-red-300/90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Exam Code or Share Link */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Exam Code or Share Link <span className="text-indigo-400">*</span>
              </label>
              {isUrlPasted && (
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Extracted Code: {extractedCode}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound size={17} />
              </div>
              <input
                type="text"
                value={examCode}
                onChange={(e) => setExamCode(e.target.value)}
                placeholder="e.g. EXAM-A1B2C3D4 or paste full share URL"
                className="input-field pl-10 font-mono tracking-wide"
                required
                disabled={loading}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports short codes (e.g. <code className="text-slate-300">EXAM-XYZ</code>) or full share links.
            </p>
          </div>

          {/* 2. Candidate Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Candidate Full Name <span className="text-indigo-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User size={17} />
              </div>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. John Doe"
                className="input-field pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* 3. Candidate Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Email Address <span className="text-indigo-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={17} />
              </div>
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                className="input-field pl-10"
                required
                disabled={loading}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Official scorecard receipt will be tied to this email.</p>
          </div>

          {/* Mandatory Proctoring IP Tracking Disclosure */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-1">
              <Globe size={15} className="text-emerald-400" />
              <span>Mandatory Proctoring Audit Active</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your real Client IP Address (<code className="text-slate-300">X-Forwarded-For</code>), device User-Agent, and initiation timestamp are recorded upon entry. Anonymous attempts are strictly forbidden.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-base mt-2 shadow-indigo-600/30"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Validating &amp; Loading Exam...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles size={18} />
                <span>Start Examination Now</span>
                <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
