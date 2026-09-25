'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  AlertTriangle,
  Trophy,
  TrendingUp,
  BookOpen,
  Target,
  ArrowLeft,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import type { Question } from '@/types';
import { fetchMockExamQuestionsAction, recordMockExamAttemptAction } from '@/actions/aloc-questions';
import { playCorrectSound, playIncorrectSound, playTapSound } from '@/utils/audio';

type ExamPhase = 'loading' | 'countdown' | 'exam' | 'submitting' | 'results';

interface Answer {
  questionId: string;
  selected: 'A' | 'B' | 'C' | 'D' | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
  markedForReview: boolean;
}

interface SubjectResult {
  subject: string;
  subjectId: string;
  total: number;
  correct: number;
  score: number;
}

const EXAM_DURATION_SECONDS = 120 * 60; // 120 minutes

const SUBJECT_LABELS: Record<string, string> = {
  english: 'Use of English',
  mathematics: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  economics: 'Economics',
  government: 'Government',
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function calcJambScore(results: SubjectResult[]): number {
  if (!results.length) return 0;
  const avg = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  return Math.round((avg / 100) * 400);
}

export default function MockExamPage() {
  const [phase, setPhase] = useState<ExamPhase>('loading');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [totalTimeUsed, setTotalTimeUsed] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [showReviewPanel, setShowReviewPanel] = useState(false);

  const questionStartTime = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadQuestions = useCallback(async () => {
    setPhase('loading');
    setError(null);
    try {
      const { questions: qs } = await fetchMockExamQuestionsAction();
      if (!qs || qs.length === 0) {
        setError('Could not load questions. Please check connection or retry.');
        return;
      }
      setQuestions(qs);
      setAnswers(
        qs.map((q) => ({
          questionId: q.id,
          selected: null,
          isCorrect: false,
          timeSpentSeconds: 0,
          markedForReview: false,
        }))
      );
      setCurrentIndex(0);
      setTimeLeft(EXAM_DURATION_SECONDS);
      setCountdown(3);
      setPhase('countdown');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load exam questions.');
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('exam');
      questionStartTime.current = Date.now();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const handleSubmit = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('submitting');

    const toRecord = answers.filter((a) => a.selected !== null);
    Promise.allSettled(
      toRecord.map((a) =>
        recordMockExamAttemptAction({
          questionId: a.questionId,
          selectedOption: a.selected!,
          isCorrect: a.isCorrect,
          timeSpentSeconds: a.timeSpentSeconds,
        })
      )
    );

    const used = EXAM_DURATION_SECONDS - timeLeft;
    setTotalTimeUsed(used);
    setPhase('results');
  }, [answers, timeLeft]);

  useEffect(() => {
    if (phase !== 'exam') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTotalTimeUsed((t) => t + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, handleSubmit]);

  const handleSelect = useCallback(
    (option: 'A' | 'B' | 'C' | 'D') => {
      const q = questions[currentIndex];
      if (!q) return;
      playTapSound();
      const timeSpent = Math.round((Date.now() - questionStartTime.current) / 1000);
      questionStartTime.current = Date.now();

      setAnswers((prev) =>
        prev.map((a) =>
          a.questionId === q.id
            ? {
                ...a,
                selected: option,
                isCorrect: option === q.correctAnswer,
                timeSpentSeconds: timeSpent,
              }
            : a
        )
      );
    },
    [currentIndex, questions]
  );

  const goTo = useCallback(
    (idx: number) => {
      const q = questions[currentIndex];
      if (q) {
        const timeSpent = Math.round((Date.now() - questionStartTime.current) / 1000);
        questionStartTime.current = Date.now();
        setAnswers((prev) =>
          prev.map((a) =>
            a.questionId === q.id && a.timeSpentSeconds === 0
              ? { ...a, timeSpentSeconds: timeSpent }
              : a
          )
        );
      }
      setCurrentIndex(Math.max(0, Math.min(idx, questions.length - 1)));
      setShowReviewPanel(false);
    },
    [currentIndex, questions]
  );

  const toggleReview = useCallback(() => {
    const q = questions[currentIndex];
    if (!q) return;
    playTapSound();
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionId === q.id ? { ...a, markedForReview: !a.markedForReview } : a
      )
    );
  }, [currentIndex, questions]);

  // Loading Phase
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-[#f9f9f8] dark:bg-[#121314] flex flex-col items-center justify-center p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a1c1c] dark:bg-white text-white dark:text-[#121314] shadow-md animate-pulse mb-4">
          <span className="font-editorial text-lg font-bold italic">S</span>
        </div>
        <p className="font-editorial text-xl text-[#1a1c1c] dark:text-white font-semibold">
          Assembling JAMB Mock Exam
        </p>
        <p className="text-xs text-[#747878] dark:text-[#9ca3af] mt-1">
          Loading 120 curated questions from the past question bank…
        </p>
      </div>
    );
  }

  // Countdown Phase
  if (phase === 'countdown') {
    return (
      <div className="min-h-screen bg-[#f9f9f8] dark:bg-[#121314] flex flex-col items-center justify-center p-6 text-center">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-[#747878] dark:text-[#9ca3af] mb-2 font-ui">
          Official UTME Simulation
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1a1c1c] dark:text-white mb-6">
          JAMB Mock Exam
        </h1>
        <div className="w-24 h-24 rounded-full border-2 border-[#1a1c1c] dark:border-white flex items-center justify-center mb-6 shadow-lg">
          <span className="font-editorial text-5xl font-bold text-[#1a1c1c] dark:text-white">
            {countdown}
          </span>
        </div>
        <p className="text-sm text-[#747878] dark:text-[#9ca3af] max-w-xs font-ui">
          120 questions across 4 subjects · 2 hours allotted time
        </p>
      </div>
    );
  }

  // Results Phase
  if (phase === 'results') {
    const answered = answers.filter((a) => a.selected !== null);
    const correct = answers.filter((a) => a.isCorrect).length;
    const accuracy = answered.length > 0 ? Math.round((correct / answered.length) * 100) : 0;

    const subjectMap: Record<string, { total: number; correct: number; subjectId: string }> = {};
    for (const q of questions) {
      const sid = q.subjectId;
      if (!subjectMap[sid]) subjectMap[sid] = { total: 0, correct: 0, subjectId: sid };
      subjectMap[sid].total++;
      const ans = answers.find((a) => a.questionId === q.id);
      if (ans?.isCorrect) subjectMap[sid].correct++;
    }

    const subjectResults: SubjectResult[] = Object.entries(subjectMap).map(([sid, v]) => ({
      subject: SUBJECT_LABELS[sid] ?? sid,
      subjectId: sid,
      total: v.total,
      correct: v.correct,
      score: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
    }));

    const jambScore = calcJambScore(subjectResults);
    const targetScore = 320;
    const gap = Math.max(0, targetScore - jambScore);
    const dailyGoal = gap > 80 ? 60 : gap > 40 ? 40 : 25;

    return (
      <div className="min-h-screen bg-[#f9f9f8] dark:bg-[#121314] text-[#1a1c1c] dark:text-[#f3f4f6] pb-16 antialiased">
        <div className="mx-auto max-w-md px-4 pt-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#e5e5e3] dark:border-[#282b2e]">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-[#747878] dark:text-[#9ca3af] hover:text-[#1a1c1c] dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Scholar</span>
            </Link>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#9ca3af]">
              Exam Scorecard
            </span>
          </div>

          {/* Aggregate Score Card */}
          <div className="rounded-2xl bg-white dark:bg-[#1a1c1e] p-6 border border-[#e5e5e3] dark:border-[#282b2e] shadow-sm text-center">
            <span className="text-xs uppercase font-medium tracking-wider text-[#747878] dark:text-[#9ca3af]">
              Estimated Aggregate Score
            </span>
            <div className="font-editorial text-6xl font-bold text-[#1a1c1c] dark:text-white my-2">
              {jambScore}
              <span className="text-xl font-normal text-[#747878] dark:text-[#9ca3af]"> / 400</span>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[#f3f4f3] dark:border-[#282b2e] text-xs font-ui">
              <div>
                <p className="font-semibold text-[#1a1c1c] dark:text-white">{correct}</p>
                <p className="text-[#747878] dark:text-[#9ca3af]">Correct</p>
              </div>
              <div>
                <p className="font-semibold text-[#1a1c1c] dark:text-white">{answered.length - correct}</p>
                <p className="text-[#747878] dark:text-[#9ca3af]">Incorrect</p>
              </div>
              <div>
                <p className="font-semibold text-[#1a1c1c] dark:text-white">{accuracy}%</p>
                <p className="text-[#747878] dark:text-[#9ca3af]">Accuracy</p>
              </div>
              <div>
                <p className="font-semibold text-[#1a1c1c] dark:text-white">{formatTime(totalTimeUsed)}</p>
                <p className="text-[#747878] dark:text-[#9ca3af]">Time Used</p>
              </div>
            </div>
          </div>

          {/* Subject Mastery Breakdown */}
          <div className="rounded-2xl bg-white dark:bg-[#1a1c1e] p-5 border border-[#e5e5e3] dark:border-[#282b2e] shadow-sm space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#747878] dark:text-[#9ca3af]">
              Subject Performance
            </h2>
            <div className="space-y-2.5">
              {subjectResults.map((r) => (
                <div key={r.subjectId} className="space-y-1">
                  <div className="flex justify-between text-xs font-ui">
                    <span className="font-medium text-[#1a1c1c] dark:text-white">{r.subject}</span>
                    <span className="text-[#747878] dark:text-[#9ca3af]">
                      {r.correct}/{r.total} ({r.score}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#f3f4f3] dark:bg-[#282b2e] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1a1c1c] dark:bg-white rounded-full transition-all duration-500"
                      style={{ width: `${r.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Assistant Card */}
          <div className="rounded-2xl bg-white dark:bg-[#1a1c1e] p-5 border border-[#e5e5e3] dark:border-[#282b2e] shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c2410c]" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1a1c1c] dark:text-white">
                Growth Assistant Guidance
              </h2>
            </div>
            <p className="text-xs text-[#444748] dark:text-[#d1d5db] leading-relaxed">
              To close your <span className="font-semibold">{gap} point gap</span> toward your target score of{' '}
              <span className="font-semibold">{targetScore}</span>, maintain a daily quota of{' '}
              <span className="font-semibold text-[#c2410c]">{dailyGoal} flashcard drills/day</span>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={loadQuestions}
              className="w-full py-3.5 px-4 rounded-xl bg-[#1a1c1c] dark:bg-white text-white dark:text-[#121314] font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all shadow-sm font-ui"
            >
              Take Another Mock
            </button>
            <Link
              href="/"
              className="block w-full text-center py-2.5 text-xs text-[#747878] dark:text-[#9ca3af] hover:text-[#1a1c1c] dark:hover:text-white"
            >
              Return to Scholar App
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active Exam View
  const currentQ = questions[currentIndex];
  const currentAnswer = answers.find((a) => a.questionId === currentQ?.id);
  const answeredCount = answers.filter((a) => a.selected !== null).length;
  const examSubjects = [...new Set(questions.map((q) => q.subjectId))];
  const filteredIndices = filterSubject
    ? questions.reduce<number[]>((acc, q, i) => {
        if (q.subjectId === filterSubject) acc.push(i);
        return acc;
      }, [])
    : questions.map((_, i) => i);

  return (
    <div className="min-h-screen bg-[#f9f9f8] dark:bg-[#121314] text-[#1a1c1c] dark:text-[#f3f4f6] flex flex-col antialiased">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-[#e5e5e3] dark:border-[#282b2e] bg-[#f9f9f8]/95 dark:bg-[#121314]/95 backdrop-blur-md px-4 py-2.5">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#c2410c]" />
            <span className="font-mono text-sm font-semibold tracking-tight text-[#1a1c1c] dark:text-white">
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="text-xs text-[#747878] dark:text-[#9ca3af]">
            <span className="font-semibold text-[#1a1c1c] dark:text-white">{answeredCount}</span> /{' '}
            {questions.length} answered
          </div>

          <button
            onClick={() => {
              if (window.confirm('Submit your mock exam?')) {
                handleSubmit();
              }
            }}
            className="px-3 py-1 rounded-md bg-[#1a1c1c] dark:bg-white text-white dark:text-[#121314] text-xs font-semibold hover:opacity-90 active:scale-95 transition-all font-ui"
          >
            Submit
          </button>
        </div>

        {/* Linear progress */}
        <div className="mx-auto max-w-md mt-2">
          <div className="h-1 w-full bg-[#e5e5e3] dark:bg-[#282b2e] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1a1c1c] dark:bg-white rounded-full transition-all duration-300"
              style={{
                width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </header>

      {/* Subject Filter Tabs */}
      <div className="border-b border-[#e5e5e3] dark:border-[#282b2e] bg-[#f9f9f8] dark:bg-[#121314] px-4 overflow-x-auto no-scrollbar">
        <div className="mx-auto max-w-md flex gap-2 py-2">
          <button
            onClick={() => {
              setFilterSubject(null);
              goTo(0);
            }}
            className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterSubject === null
                ? 'bg-[#1a1c1c] text-white dark:bg-white dark:text-[#121314]'
                : 'bg-[#f3f4f3] dark:bg-[#1a1c1e] text-[#747878] dark:text-[#9ca3af]'
            }`}
          >
            All ({questions.length})
          </button>
          {examSubjects.map((sid) => (
            <button
              key={sid}
              onClick={() => {
                setFilterSubject(sid);
                const first = questions.findIndex((q) => q.subjectId === sid);
                if (first >= 0) goTo(first);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filterSubject === sid
                  ? 'bg-[#1a1c1c] text-white dark:bg-white dark:text-[#121314]'
                  : 'bg-[#f3f4f3] dark:bg-[#1a1c1e] text-[#747878] dark:text-[#9ca3af]'
              }`}
            >
              {SUBJECT_LABELS[sid] ?? sid}
            </button>
          ))}
        </div>
      </div>

      {/* Main Question View */}
      <main className="flex-1 mx-auto max-w-md w-full px-4 py-4 space-y-4">
        {currentQ ? (
          <>
            {/* Meta info */}
            <div className="flex items-center justify-between text-xs text-[#747878] dark:text-[#9ca3af]">
              <span className="font-semibold uppercase tracking-wider text-[#1a1c1c] dark:text-white">
                {SUBJECT_LABELS[currentQ.subjectId] ?? currentQ.subjectId}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleReview}
                  className={`px-2 py-0.5 rounded text-xs transition-colors ${
                    currentAnswer?.markedForReview
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-semibold'
                      : 'hover:text-[#1a1c1c] dark:hover:text-white'
                  }`}
                >
                  {currentAnswer?.markedForReview ? '★ Flagged' : '☆ Review'}
                </button>
                <span>
                  Q{currentIndex + 1} of {questions.length}
                </span>
              </div>
            </div>

            {/* Question Text Box */}
            <div className="rounded-2xl bg-white dark:bg-[#1a1c1e] p-5 border border-[#e5e5e3] dark:border-[#282b2e] shadow-sm">
              <p className="font-editorial text-lg sm:text-xl text-[#1a1c1c] dark:text-white leading-relaxed">
                {currentQ.text}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt) => {
                const isSelected = currentAnswer?.selected === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id as 'A' | 'B' | 'C' | 'D')}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 active:scale-[0.99] ${
                      isSelected
                        ? 'border-[#1a1c1c] dark:border-white bg-[#f3f4f3] dark:bg-[#282b2e]'
                        : 'border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#1a1c1e] hover:border-[#747878]'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold font-ui ${
                        isSelected
                          ? 'bg-[#1a1c1c] text-white dark:bg-white dark:text-[#121314]'
                          : 'bg-[#f3f4f3] dark:bg-[#282b2e] text-[#444748] dark:text-[#9ca3af]'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className="text-sm font-ui pt-0.5 text-[#1a1c1c] dark:text-white">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
      </main>

      {/* Bottom Sticky Navigation */}
      <footer className="sticky bottom-0 border-t border-[#e5e5e3] dark:border-[#282b2e] bg-[#f9f9f8]/95 dark:bg-[#121314]/95 backdrop-blur-md px-4 py-3">
        <div className="mx-auto max-w-md flex items-center justify-between gap-2">
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="p-2.5 rounded-lg border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#1a1c1e] disabled:opacity-30 hover:bg-[#f3f4f3] dark:hover:bg-[#282b2e] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowReviewPanel(!showReviewPanel)}
            className="flex-1 py-2.5 px-3 rounded-lg border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#1a1c1e] text-xs font-semibold text-[#1a1c1c] dark:text-white text-center hover:bg-[#f3f4f3] dark:hover:bg-[#282b2e] transition-colors"
          >
            Question Grid ({answeredCount}/{questions.length})
          </button>

          <button
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === questions.length - 1}
            className="p-2.5 rounded-lg border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#1a1c1e] disabled:opacity-30 hover:bg-[#f3f4f3] dark:hover:bg-[#282b2e] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </footer>

      {/* Grid Modal */}
      {showReviewPanel && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowReviewPanel(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-white dark:bg-[#1a1c1e] border border-[#e5e5e3] dark:border-[#282b2e] p-5 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e3] dark:border-[#282b2e] mb-4">
              <h3 className="font-editorial text-base font-semibold text-[#1a1c1c] dark:text-white">
                Question Navigator
              </h3>
              <button
                onClick={() => setShowReviewPanel(false)}
                className="text-xs text-[#747878] dark:text-[#9ca3af] hover:text-[#1a1c1c] dark:hover:text-white font-semibold"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {filteredIndices.map((qi) => {
                const q = questions[qi];
                const a = answers.find((ans) => ans.questionId === q?.id);
                const isAnswered = a?.selected !== null;
                const isFlagged = a?.markedForReview;
                const isCurrent = qi === currentIndex;

                return (
                  <button
                    key={qi}
                    onClick={() => goTo(qi)}
                    className={`aspect-square rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
                      isCurrent ? 'ring-2 ring-[#c2410c]' : ''
                    } ${
                      isFlagged
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200'
                        : isAnswered
                        ? 'bg-[#1a1c1c] text-white dark:bg-white dark:text-[#121314]'
                        : 'bg-[#f3f4f3] dark:bg-[#282b2e] text-[#747878] dark:text-[#9ca3af]'
                    }`}
                  >
                    {qi + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
