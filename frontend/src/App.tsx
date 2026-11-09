import React, { useState } from 'react';
import { Header } from './components/Header';
import { ExamEntry } from './components/ExamEntry';
import { ExamRunner } from './components/ExamRunner';
import { ExamResult } from './components/ExamResult';
import { CreatorAuditModal } from './components/CreatorAuditModal';
import { ScorecardResponse, StartAttemptResponse } from './types/exam';

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
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Portal Header */}
      {view !== 'runner' && <Header onOpenAudit={() => setShowAuditModal(true)} />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
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
        <footer className="mt-auto py-6 text-center text-xs text-slate-400 border-t border-white/5 no-print">
          <p>
            Online Examination Portal &bull; Microservice 4 (Candidate Examination &amp; Auto-Grading Engine)
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Automated Proctoring Audit &bull; SHA-256 Verified Certificates &bull; Instant Multi-format Scoring
          </p>
        </footer>
      )}

      {/* Creator Auditing Modal */}
      {showAuditModal && <CreatorAuditModal onClose={() => setShowAuditModal(false)} />}
    </div>
  );
};

export default App;

