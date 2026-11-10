import React, { useState } from 'react';
import { Header } from './components/Header';
import { ExamEntry } from './components/ExamEntry';
import { ExamRunner } from './components/ExamRunner';
import { ExamResult } from './components/ExamResult';
import { CreatorAuditModal } from './components/CreatorAuditModal';
import { ScorecardResponse, StartAttemptResponse } from './types/exam';
import { Sparkles, Zap } from 'lucide-react';

export const App: React.FC = () => {
  const [view, setView] = useState<'entry' | 'runner' | 'result'>('entry');
  const [session, setSession] = useState<StartAttemptResponse | null>(null);
  const [scorecard, setScorecard] = useState<ScorecardResponse | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);

  const handleSessionStarted = (newSession: StartAttemptResponse) => {
    setSession(newSession);
    setView('runner');
  };

  const handleExamSubmitted = (result: ScorecardResponse) => {
    setScorecard(result);
    setView('result');
  };

  const handleReset = () => {
    setSession(null);
    setScorecard(null);
    setView('entry');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060911] text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Portal Header */}
      {view !== 'runner' && <Header onOpenAudit={() => setShowAuditModal(true)} />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {view === 'entry' && <ExamEntry onSessionStarted={handleSessionStarted} />}
        {view === 'runner' && session && (
          <ExamRunner session={session} onExamSubmitted={handleExamSubmitted} />
        )}
        {view === 'result' && scorecard && (
          <ExamResult scorecard={scorecard} onReset={handleReset} />
        )}
      </div>

      {/* Footer */}
      {view !== 'runner' && (
        <footer className="mt-auto py-8 text-center text-xs text-slate-400 border-t border-white/[0.06] bg-[#060911]/60 backdrop-blur-md no-print relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-2">
            <div className="flex flex-wrap items-center justify-center gap-3 text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Sparkles size={13} className="text-indigo-400" />
                Online Examination Portal
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="flex items-center gap-1.5 text-indigo-300">
                <Zap size={13} className="text-amber-400" />
                MS4 Automated Auto-Grading &amp; Proctoring Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex flex-wrap items-center justify-center gap-2 mt-1">
              <span>Mandatory Real IP Proctoring</span>
              <span>&bull;</span>
              <span>SHA-256 Verified Certificates</span>
              <span>&bull;</span>
              <span>Real-Time Multi-Format Evaluation</span>
            </p>
          </div>
        </footer>
      )}

      {/* Creator Auditing Modal */}
      {showAuditModal && <CreatorAuditModal onClose={() => setShowAuditModal(false)} />}
    </div>
  );
};

export default App;
