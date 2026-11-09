import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, RefreshCw } from 'lucide-react';
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
    <div className="glass-card mb-6 border-indigo-500/20 bg-indigo-950/20 py-3 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          {status === 'online' ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>MS4 Engine & Neon DB Online</span>
            </span>
          ) : status === 'waking' ? (
            <span className="flex items-center gap-1.5 text-amber-300 font-medium">
              <Activity size={15} className="animate-spin text-amber-400" />
              <span>Render Cold-Start in Progress (Services waking up, please allow ~30-50s)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-indigo-300">
              <RefreshCw size={14} className="animate-spin text-indigo-400" />
              <span>Checking microservice gateway status...</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 hidden md:inline">
            MS2 (Exams) &bull; MS3 (Questions) &bull; MS4 (Taker)
          </span>
          <button
            onClick={() => setRetryCount((c) => c + 1)}
            className="text-indigo-300 hover:text-white underline cursor-pointer inline-flex items-center gap-1"
          >
            <RefreshCw size={11} /> Ping Services
          </button>
        </div>
      </div>
    </div>
  );
};
