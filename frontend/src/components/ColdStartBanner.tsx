import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import { api } from '../services/api';

export const ColdStartBanner: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'online' | 'waking'>('checking');
  const [retryCount, setRetryCount] = useState(0);

  const checkStatus = async () => {
    setStatus('checking');
    try {
      await api.checkHealth();
      setStatus('online');
    } catch {
      setStatus('waking');
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 25000);
    return () => clearInterval(interval);
  }, [retryCount]);

  return (
    <div className="glass-card mb-6 border-indigo-500/20 bg-gradient-to-r from-indigo-950/20 via-slate-900/40 to-indigo-950/20 py-2.5 px-4 rounded-xl shadow-inner">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2.5">
          {status === 'online' ? (
            <span className="flex items-center gap-2 text-emerald-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>MS4 Microservice &amp; Neon DB Online</span>
            </span>
          ) : status === 'waking' ? (
            <span className="flex items-center gap-2 text-amber-300 font-medium">
              <Activity size={15} className="animate-spin text-amber-400" />
              <span>Backend Cold-Start in Progress (Render waking up, ~30s)</span>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-indigo-300">
              <RefreshCw size={14} className="animate-spin text-indigo-400" />
              <span>Verifying microservice cluster connectivity...</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-[11px] hidden md:inline-flex items-center gap-1.5">
            <Zap size={12} className="text-indigo-400" />
            <span>MS2 (Exams) &bull; MS3 (Questions) &bull; MS4 (Evaluator)</span>
          </span>
          <button
            onClick={() => setRetryCount((c) => c + 1)}
            className="text-indigo-300 hover:text-white underline text-[11px] cursor-pointer inline-flex items-center gap-1 transition-colors"
          >
            <RefreshCw size={11} className={status === 'checking' ? 'animate-spin' : ''} /> Ping Status
          </button>
        </div>
      </div>
    </div>
  );
};
