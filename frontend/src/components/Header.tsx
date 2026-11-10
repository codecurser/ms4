import React from 'react';
import { Award, ShieldAlert, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenAudit: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAudit }) => {
  return (
    <header className="no-print w-full border-b border-white/[0.08] bg-[#060911]/80 backdrop-blur-xl sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3.5">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-300" />
            <div className="relative w-11 h-11 rounded-xl bg-[#0b1120] border border-white/10 flex items-center justify-center text-indigo-400 shadow-lg">
              <Award size={24} className="text-indigo-400 group-hover:scale-105 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl text-white tracking-tight flex items-center gap-1.5">
                <span>ExamPortal</span>
                <span className="text-indigo-400 font-normal text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 font-mono">
                  v4.0
                </span>
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 tracking-normal hidden sm:block">
              Candidate Examination &amp; Automated Microservice Evaluator
            </p>
          </div>
        </div>

        {/* Right Section: Proctoring & Creator Portal */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="hidden lg:flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/25 px-3 py-1.5 rounded-xl shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="font-medium">Mandatory IP Proctoring Active</span>
          </div>

          <button
            onClick={onOpenAudit}
            className="btn-secondary text-xs px-3.5 py-2 hover:border-indigo-500/40 hover:shadow-indigo-500/10 hover:shadow-md transition-all flex items-center gap-2"
            title="Creator Auditing & Submissions Portal"
          >
            <ShieldAlert size={14} className="text-indigo-400" />
            <span className="font-medium">Creator Audit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
