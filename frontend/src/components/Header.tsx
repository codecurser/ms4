import React from 'react';
import { Award, ShieldAlert, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenAudit: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAudit }) => {
  return (
    <header className="glass-panel mx-4 sm:mx-8 mt-4 mb-6 px-6 py-4 flex items-center justify-between no-print">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
          <Award size={22} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-white tracking-tight">ExamPortal</h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              MS4 Engine
            </span>
          </div>
          <p className="text-xs text-slate-400">Candidate Examination &amp; Automated Evaluation Portal</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400/90 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
          <ShieldCheck size={14} />
          <span>Proctoring IP Audit Active</span>
        </div>
        <button
          onClick={onOpenAudit}
          className="btn-secondary text-xs px-3 py-1.5 border-slate-700 hover:border-indigo-500/50"
          title="Creator Auditing & Submissions Portal"
        >
          <ShieldAlert size={14} className="text-indigo-400" />
          <span>Creator Audit</span>
        </button>
      </div>
    </header>
  );
};

