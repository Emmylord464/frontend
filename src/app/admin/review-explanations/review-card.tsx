'use client';

import { useState } from 'react';
import { approveExplanation, rejectExplanation, editExplanation } from './actions';

type Option = { key: string; text: string; isCorrect: boolean };

interface Props {
  question: {
    id: string;
    alocId: number | null;
    subject: string | null;
    year: string;
    questionText: string;
    options: unknown;
    correctOption: string;
    explanation: string;
    explanationSource: string | null;
    topicName: string | null;
  };
  index: number;
  total: number;
}

const SUBJECT_COLORS: Record<string, string> = {
  USE_OF_ENGLISH: 'text-blue-400 border-blue-700/40 bg-blue-900/20',
  MATHEMATICS:    'text-purple-400 border-purple-700/40 bg-purple-900/20',
  PHYSICS:        'text-cyan-400 border-cyan-700/40 bg-cyan-900/20',
  CHEMISTRY:      'text-emerald-400 border-emerald-700/40 bg-emerald-900/20',
};

export function ReviewCard({ question: q, index, total }: Props) {
  const [explanation, setExplanation] = useState(q.explanation);
  const [editing, setEditing]         = useState(false);
  const [status, setStatus]           = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading]         = useState(false);

  const options = (q.options as Option[]) ?? [];
  const colorClass = SUBJECT_COLORS[q.subject ?? ''] ?? 'text-slate-400 border-slate-700/40 bg-slate-900/20';

  async function handleApprove() {
    setLoading(true);
    await approveExplanation(q.id, explanation);
    setStatus('approved');
    setLoading(false);
  }

  async function handleReject() {
    setLoading(true);
    await rejectExplanation(q.id);
    setStatus('rejected');
    setLoading(false);
  }

  async function handleSaveEdit() {
    setLoading(true);
    await editExplanation(q.id, explanation);
    setEditing(false);
    setStatus('approved');
    setLoading(false);
  }

  if (status === 'approved') {
    return (
      <div className="rounded-2xl border border-emerald-700/40 bg-emerald-900/10 p-4 flex items-center gap-3">
        <span className="text-xl">✅</span>
        <span className="text-emerald-400 font-bold text-sm">
          Approved — question {index}/{total}
        </span>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="rounded-2xl border border-rose-700/40 bg-rose-900/10 p-4 flex items-center gap-3">
        <span className="text-xl">🗑️</span>
        <span className="text-rose-400 font-bold text-sm">
          Rejected — explanation will be re-generated on next run.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-600/30 bg-slate-900 p-5 space-y-4">
      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-black">
        <span className="text-slate-500">{index}/{total}</span>
        <span className={`rounded-full border px-2 py-0.5 ${colorClass}`}>
          {q.subject?.replace('_', ' ')}
        </span>
        <span className="text-slate-500">{q.topicName ?? 'Unknown Topic'}</span>
        <span className="text-slate-600 ml-auto">JAMB {q.year}</span>
      </div>

      {/* Question */}
      <p className="text-sm text-slate-200 leading-relaxed">{q.questionText}</p>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map(opt => (
          <div
            key={opt.key}
            className={`rounded-lg border px-3 py-2 text-xs font-mono ${
              opt.isCorrect
                ? 'border-emerald-600/60 bg-emerald-900/30 text-emerald-300'
                : 'border-slate-700/40 bg-slate-800/40 text-slate-400'
            }`}
          >
            <span className="font-black mr-2">{opt.key}.</span>{opt.text}
            {opt.isCorrect && <span className="ml-1 text-[10px] text-emerald-500">✓ CORRECT</span>}
          </div>
        ))}
      </div>

      {/* Explanation */}
      <div className="rounded-xl border border-amber-600/30 bg-amber-900/10 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
            🤖 AI-Generated Explanation
          </span>
          <button
            onClick={() => setEditing(!editing)}
            className="text-[10px] font-black text-slate-400 hover:text-white border border-slate-700 rounded px-2 py-0.5"
          >
            {editing ? 'Cancel Edit' : '✏️ Edit'}
          </button>
        </div>

        {editing ? (
          <textarea
            value={explanation}
            onChange={e => setExplanation(e.target.value)}
            rows={5}
            className="w-full rounded-lg bg-slate-800 border border-slate-600 text-sm text-white p-3 font-mono resize-none focus:outline-none focus:border-emerald-500"
          />
        ) : (
          <p className="text-sm text-slate-300 leading-relaxed">{explanation}</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {editing ? (
          <button
            onClick={handleSaveEdit}
            disabled={loading}
            className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-2.5 transition disabled:opacity-50"
          >
            {loading ? 'Saving…' : '✅ Save & Approve'}
          </button>
        ) : (
          <button
            onClick={handleApprove}
            disabled={loading}
            className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-2.5 transition disabled:opacity-50"
          >
            {loading ? 'Approving…' : '✅ Approve'}
          </button>
        )}
        <button
          onClick={handleReject}
          disabled={loading}
          className="rounded-xl border border-rose-700/60 bg-rose-900/20 hover:bg-rose-900/40 text-rose-400 font-black text-sm px-5 py-2.5 transition disabled:opacity-50"
        >
          🗑️ Reject
        </button>
      </div>
    </div>
  );
}

