'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { getExamAttemptAction, type ExamAttemptDiagnostic } from '@/actions/get-exam-attempt';
import { AnimatedScore } from '@/components/animated-score';

const fallbackResult: ExamAttemptDiagnostic = {
  attemptId: 'demo-sample',
  totalScore: 285,
  targetScore: 320,
  totalQuestions: 400,
  timeSpentMins: 112,
  subjects: [
    { name: 'Use of English', score: 74, max: 100, status: 'STRONG', color: '#e2763b' },
    { name: 'Mathematics', score: 62, max: 100, status: 'AVERAGE', color: '#2f7653' },
    { name: 'Physics', score: 78, max: 100, status: 'STRONG', color: '#5d7e9c' },
    { name: 'Chemistry', score: 71, max: 100, status: 'STRONG', color: '#a07c3c' },
  ],
  weakTopics: [
    { title: 'Trigonometric Ratios & Waves', subject: 'MATHEMATICS', accuracy: 38 },
    { title: 'Organic Hydrocarbons', subject: 'CHEMISTRY', accuracy: 42 },
    { title: 'Proximate vs Notional Concord', subject: 'USE_OF_ENGLISH', accuracy: 45 },
  ],
};

function subjectLabel(subject: string) {
  return subject.replaceAll('_', ' ').replace('USE OF ENGLISH', 'Use of English');
}

export default function CBTResultsDashboard() {
  const params = useParams<{ attemptId: string }>();
  const attemptId = params?.attemptId;
  const [data, setData] = useState<ExamAttemptDiagnostic>(fallbackResult);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) {
      setLoading(false);
      return;
    }

    getExamAttemptAction(attemptId)
      .then((res) => {
        if (res.success && res.diagnostic) {
          setData(res.diagnostic);
        }
      })
      .finally(() => setLoading(false));
  }, [attemptId]);

  const scoreProgress = Math.min(
    100,
    Math.round((data.totalScore / Math.max(data.targetScore, 1)) * 100)
  );
  const scoreGap = Math.max(0, data.targetScore - data.totalScore);

  return (
    <main className="min-h-screen bg-[#f4f7f5] px-4 py-6 text-[#18352b] sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] bg-[#18352b] p-6 text-white shadow-[0_18px_55px_rgba(24,53,43,0.14)] sm:p-8"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link href="/exam" className="text-xs font-black uppercase tracking-[0.18em] text-[#a9c3b0] hover:text-white">
                ← Practice
              </Link>
              <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#f3b28e]">
                Exam diagnostic report
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                UTME Mock Exam Results
              </h1>
              <p className="mt-3 text-sm text-[#d6e5da]">
                Attempt {attemptId ? attemptId.slice(0, 8) + '...' : 'Latest'} · completed in {data.timeSpentMins} minutes
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5 lg:min-w-[230px]">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a9c3b0]">Total score</p>
              <p className="mt-2 text-5xl font-black">
                <span className="text-[#f3b28e]">
                  <AnimatedScore value={data.totalScore} />
                </span>
                <span className="text-xl text-[#a9c3b0]"> / {data.totalQuestions}</span>
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${scoreProgress}%` }}
                  transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                  className="h-full rounded-full bg-[#f3b28e]"
                />
              </div>
              <p className="mt-2 text-xs font-bold text-[#d6e5da]">
                {scoreGap > 0 ? `${scoreGap} points to your target` : 'Target achieved! 🎉'}
              </p>
            </div>
          </div>
        </motion.header>

        {data.subjects.length > 0 && (
          <section aria-labelledby="subject-breakdown-heading">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6a8277]">
                  Performance by subject
                </p>
                <h2 id="subject-breakdown-heading" className="mt-1 text-2xl font-black">
                  Subject breakdown
                </h2>
              </div>
              <span className="text-sm font-bold text-[#789083]">
                {data.subjects.length} subjects tested
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.subjects.map((subject, index) => {
                const pct = Math.round((subject.score / Math.max(subject.max, 1)) * 100);
                return (
                  <motion.article
                    key={subject.name}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="rounded-2xl border border-[#dce8e0] bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-black text-[#355449]">{subject.name}</span>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-black tracking-[0.08em] ${
                          subject.status === 'STRONG'
                            ? 'bg-[#e4f6ea] text-[#126b47]'
                            : subject.status === 'AVERAGE'
                              ? 'bg-[#fff0d9] text-[#a76716]'
                              : 'bg-[#fff0e9] text-[#9c4228]'
                        }`}
                      >
                        {subject.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-6 text-3xl font-black" style={{ color: subject.color }}>
                      {subject.score}
                      <span className="text-sm font-bold text-[#9aaca0]"> / {subject.max}</span>
                    </p>
                    <div className="mt-4 h-2 rounded-full bg-[#edf2ee]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: 0.15 + index * 0.08 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>
        )}

        {data.weakTopics.length > 0 && (
          <section
            className="overflow-hidden rounded-[2rem] border border-[#f0d5c5] bg-[#fffaf6]"
            aria-labelledby="weak-topics-heading"
          >
            <div className="flex flex-col gap-4 border-b border-[#f0d5c5] p-5 sm:flex-row sm:items-start sm:justify-between sm:p-7">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d95c32]">
                  Accuracy below 50%
                </p>
                <h2 id="weak-topics-heading" className="mt-1 text-2xl font-black">
                  🚨 Weak syllabus topics detected
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#876f63]">
                  These are the fastest opportunities to move your score higher. Send a topic straight into Jamby&apos;s five-card remedial workout.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[#ffe9dc] px-3 py-1.5 text-xs font-black text-[#a94322]">
                {data.weakTopics.length} focus areas
              </span>
            </div>

            <div className="divide-y divide-[#f0d5c5] px-5 sm:px-7">
              {data.weakTopics.map((topic, index) => (
                <motion.article
                  key={topic.title}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + index * 0.1 }}
                  className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#ffe9dc] text-lg font-black text-[#d95c32]">
                      {topic.accuracy}%
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#a77c69]">
                        {subjectLabel(topic.subject)} · accuracy
                      </p>
                      <h3 className="mt-1 truncate text-base font-black sm:text-lg">{topic.title}</h3>
                    </div>
                  </div>
                  <Link
                    href={`/learn/workout?subject=${encodeURIComponent(topic.subject)}&topic=${encodeURIComponent(topic.title)}`}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[#d95c32] px-4 text-sm font-black text-white transition hover:bg-[#b94b27] focus:outline-none focus:ring-2 focus:ring-[#d95c32] focus:ring-offset-2"
                  >
                    Remediate with Jamby 💡
                  </Link>
                </motion.article>
              ))}
            </div>
          </section>
        )}

        <footer className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link
            href="/exam"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dce8e0] bg-white px-5 text-sm font-black text-[#37604d] hover:bg-[#f2faf4]"
          >
            🔄 Retake mock exam
          </Link>
          <Link
            href="/learn"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#18352b] px-5 text-sm font-black text-white hover:bg-[#285443]"
          >
            Return to skill tree
          </Link>
        </footer>
      </div>
    </main>
  );
}
