import React, { useState } from 'react';
import {
  Download,
  KeyRound,
  Loader2,
  Lock,
  Search,
  Users,
  X
} from 'lucide-react';
import { CreatorSubmissionsResponse } from '../types/exam';
import { api } from '../services/api';

interface CreatorAuditModalProps {
  onClose: () => void;
}

export const CreatorAuditModal: React.FC<CreatorAuditModalProps> = ({ onClose }) => {
  const [examId, setExamId] = useState('');
  const [jwtToken, setJwtToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CreatorSubmissionsResponse | null>(null);
  const [filterText, setFilterText] = useState('');

  const handleFetchAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examId.trim()) {
      setError('Please provide an Exam ID (UUID).');
      return;
    }
    if (!jwtToken.trim()) {
      setError('Please provide your MS1 JWT Bearer Token.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await api.getCreatorSubmissions(examId.trim(), jwtToken.trim());
      setData(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch audit data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!examId.trim()) return;
    const cleanToken = jwtToken.startsWith('Bearer ') ? jwtToken : `Bearer ${jwtToken}`;

    // Download via fetch blob with authorization header
    fetch(api.getExportCsvUrl(examId.trim()), {
      headers: { Authorization: cleanToken }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Export failed');
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exam-${examId}-audit.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => alert(err.message));
  };

  const filteredSubmissions = (data?.submissions || []).filter((sub) => {
    const q = filterText.toLowerCase();
    return (
      sub.candidateName.toLowerCase().includes(q) ||
      sub.candidateEmail.toLowerCase().includes(q) ||
      sub.clientIp.includes(q) ||
      sub.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="modal-overlay">
      <div className="glass-panel max-w-4xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border-white/10 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 shadow-inner">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-white">
                Creator Candidate Tracking &amp; Submissions Audit
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit real client IP addresses, exam sessions, and automated scores for your exam.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleFetchAudit} className="glass-card p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Exam UUID <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-3.5 text-indigo-400/80" />
                <input
                  type="text"
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                  className="input-field pl-10 font-mono text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                MS1 Creator JWT Bearer Token <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-indigo-400/80" />
                <input
                  type="password"
                  value={jwtToken}
                  onChange={(e) => setJwtToken(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="input-field pl-10 font-mono text-xs"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs py-2.5 px-5 font-semibold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={15} className="animate-spin" />
                  <span>Loading Submissions...</span>
                </span>
              ) : (
                <span>Fetch Candidate Submissions</span>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Analytics Summary */}
        {data && data.analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass-card p-4 text-center border-white/10 shadow-sm">
                <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  Total Attempts
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1 block">
                  {data.analytics.totalAttempts}
                </span>
              </div>
              <div className="glass-card p-4 text-center border-white/10 shadow-sm">
                <span className="block text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                  Completed
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 mt-1 block">
                  {data.analytics.submittedCount}
                </span>
              </div>
              <div className="glass-card p-4 text-center border-white/10 shadow-sm">
                <span className="block text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                  In Progress
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400 mt-1 block">
                  {data.analytics.inProgressCount}
                </span>
              </div>
              <div className="glass-card p-4 text-center border-white/10 shadow-sm">
                <span className="block text-[11px] text-sky-400 font-bold uppercase tracking-wider">
                  Pass Rate
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-sky-400 mt-1 block">
                  {data.analytics.passRate}%
                </span>
              </div>
            </div>

            {/* Filter and CSV Export Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Filter by name, email, IP..."
                  className="input-field pl-9.5 py-2 text-xs"
                />
              </div>

              <button
                onClick={handleExportCsv}
                className="btn-secondary text-xs px-4 py-2 w-full sm:w-auto font-medium"
              >
                <Download size={14} />
                <span>Export CSV Audit Log</span>
              </button>
            </div>

            {/* Candidates Table */}
            <div className="glass-card overflow-x-auto p-0 border-white/10 rounded-2xl shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3.5 font-bold">Candidate</th>
                    <th className="px-4 py-3.5 font-bold">Recorded Client IP</th>
                    <th className="px-4 py-3.5 font-bold">Start / Submit</th>
                    <th className="px-4 py-3.5 font-bold">Score</th>
                    <th className="px-4 py-3.5 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((sub) => (
                      <tr key={sub.attemptId} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white">{sub.candidateName}</div>
                          <div className="text-slate-400 font-mono text-[11px]">{sub.candidateEmail}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/25 px-2 py-0.5 rounded text-[11px]">
                            {sub.clientIp}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-slate-300">
                          <div>Start: {new Date(sub.startTime).toLocaleTimeString()}</div>
                          {sub.submitTime && (
                            <div className="text-slate-400">
                              End: {new Date(sub.submitTime).toLocaleTimeString()}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-mono">
                          {sub.status === 'IN_PROGRESS' ? (
                            <span className="text-amber-400 text-[11px] font-semibold">Evaluating...</span>
                          ) : (
                            <div>
                              <span className="font-bold text-white">
                                {sub.score} / {sub.maxScore}
                              </span>{' '}
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                  sub.isPassed
                                    ? 'text-emerald-400 bg-emerald-950/50'
                                    : 'text-rose-400 bg-rose-950/50'
                                }`}
                              >
                                {sub.percentage}%
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`font-bold px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider ${
                              sub.status === 'SUBMITTED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : sub.status === 'TIMED_OUT'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                        No candidate attempts found matching the search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
