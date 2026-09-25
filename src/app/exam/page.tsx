"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useExamStore, type Subject } from "@/store/use-exam-store";
import { SocraticTutor } from "@/components/socratic-tutor";
import { submitCbtExamAction } from "@/actions/submit-exam";
import {
  fetchExamQuestionsAction,
  QUESTIONS_PER_SUBJECT,
  type ExamQuestion,
  type SubjectKey,
} from "@/actions/fetch-exam-questions";
import { JambCalculator } from "@/components/jamb-calculator";

import { ALL_19_SUBJECTS, getSubjectById } from "@/lib/subjects-config";

// ─── dynamic 19-subject config ───────────────────────────────────────────────

const subjects = ALL_19_SUBJECTS.map((s) => ({
  value: s.id,
  label: s.name,
  shortLabel: s.shortName,
}));

const tutorTopics: Record<string, string> = Object.fromEntries(
  ALL_19_SUBJECTS.map((s) => [s.id, s.coreTopics[0] || "General Concept"]),
);

const examDurationSeconds = 2 * 60 * 60;

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((unit) => unit.toString().padStart(2, "0"))
    .join(":");
}

// ─── component ────────────────────────────────────────────────────────────────

export default function ExamPage() {
  // ── hydration guard
  const [hasHydrated, setHasHydrated] = useState(false);

  // ── DB questions
  const [dbQuestions, setDbQuestions] = useState<Record<string, ExamQuestion[]>>({});
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  // ── exam UI state
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    () => new Set(),
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const router = useRouter();

  // ── zustand
  const activeSubject = useExamStore((s) => s.activeSubject);
  const currentQuestionIndex = useExamStore((s) => s.currentQuestionIndex);
  const answers = useExamStore((s) => s.answers);
  const timeRemainingSeconds = useExamStore((s) => s.timeRemainingSeconds);
  const isExamActive = useExamStore((s) => s.isExamActive);
  const setActiveSubject = useExamStore((s) => s.setActiveSubject);
  const setCurrentQuestionIndex = useExamStore((s) => s.setCurrentQuestionIndex);
  const setAnswer = useExamStore((s) => s.setAnswer);
  const setTimeRemainingSeconds = useExamStore((s) => s.setTimeRemainingSeconds);
  const startExam = useExamStore((s) => s.startExam);
  const pauseExam = useExamStore((s) => s.pauseExam);
  const resetExam = useExamStore((s) => s.resetExam);

  // ── hydrate store
  useEffect(() => {
    const unsub = useExamStore.persist.onFinishHydration(() =>
      setHasHydrated(true),
    );
    if (useExamStore.persist.hasHydrated()) {
      queueMicrotask(() => setHasHydrated(true));
    }
    return unsub;
  }, []);

  // ── load DB questions once hydrated
  const loadQuestions = useCallback(() => {
    setQuestionsLoading(true);
    setQuestionsError(null);
    fetchExamQuestionsAction(
      subjects.map((s) => s.value as SubjectKey),
    )
      .then((result) => {
        if (!result.success) {
          setQuestionsError(result.error);
          return;
        }
        setDbQuestions(result.questions);
      })
      .catch(() =>
        setQuestionsError("Could not reach the question bank. Try again."),
      )
      .finally(() => setQuestionsLoading(false));
  }, []);

  useEffect(() => {
    if (hasHydrated) loadQuestions();
  }, [hasHydrated, loadQuestions]);

  // ── start / init exam
  useEffect(() => {
    if (!hasHydrated || questionsLoading) return;
    if (timeRemainingSeconds === 0 && !isSubmitted) {
      setTimeRemainingSeconds(examDurationSeconds);
      startExam();
    }
  }, [
    hasHydrated,
    questionsLoading,
    isSubmitted,
    startExam,
    setTimeRemainingSeconds,
    timeRemainingSeconds,
  ]);

  // ── countdown timer
  useEffect(() => {
    if (!hasHydrated || !isExamActive || isSubmitted) return;
    const timer = window.setInterval(() => {
      const current = useExamStore.getState().timeRemainingSeconds;
      if (current <= 1) {
        setTimeRemainingSeconds(0);
        pauseExam();
        return;
      }
      setTimeRemainingSeconds(current - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [hasHydrated, isExamActive, isSubmitted, pauseExam, setTimeRemainingSeconds]);

  // ── derive current question from DB questions
  const subjectQuestions: ExamQuestion[] = useMemo(
    () => dbQuestions[activeSubject] ?? [],
    [dbQuestions, activeSubject],
  );

  const question: ExamQuestion | undefined =
    subjectQuestions[currentQuestionIndex % Math.max(subjectQuestions.length, 1)];
  const totalQuestions = QUESTIONS_PER_SUBJECT[activeSubject];

  const currentAnswer = question ? answers[question.id] : undefined;
  const isFlagged = flaggedQuestions.has(currentQuestionIndex);
  const answeredCount = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers],
  );

  // ── handlers
  const selectSubject = (subject: string) => {
    setActiveSubject(subject as Subject);
    setCurrentQuestionIndex(0);
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestionIndex)) next.delete(currentQuestionIndex);
      else next.add(currentQuestionIndex);
      return next;
    });
  };

  const submitExam = async () => {
    if (isSubmitting || isSubmitted) return;
    setIsSubmitting(true);
    setSubmissionError("");
    pauseExam();

    const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

    const result = await submitCbtExamAction({
      userId: process.env.NEXT_PUBLIC_USER_ID ?? DEMO_USER_ID,
      answers: Object.fromEntries(
        Object.entries(answers).filter(([, optionKey]) => Boolean(optionKey)),
      ),
    });

    if (!result.success) {
      setSubmissionError(result.error);
      setIsSubmitting(false);
      startExam();
      return;
    }

    setIsSubmitted(true);
    resetExam();
    router.push(`/cbt/results/${result.attemptId}`);
  };

  // ─── loading / error states ────────────────────────────────────────────────
  if (!hasHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071017] px-6 text-slate-100">
        <p className="rounded-2xl border border-[#dce8e0] bg-white px-6 py-4 text-sm font-medium shadow-sm">
          Restoring your offline exam session...
        </p>
      </main>
    );
  }

  if (questionsLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071017] px-6 text-slate-100">
        <section className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <div
            className="mx-auto flex size-16 animate-pulse items-center justify-center rounded-2xl bg-[#f3b28e] text-3xl"
            aria-hidden="true"
          >
            📚
          </div>
          <h1 className="mt-5 text-xl font-black">Loading your exam...</h1>
          <p className="mt-2 text-sm text-[#6a8277]">
            Fetching JAMB questions from the database
          </p>
        </section>
      </main>
    );
  }

  if (questionsError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071017] px-6 text-slate-100">
        <section className="w-full max-w-md rounded-[2rem] border border-[#f0d5c5] bg-white p-8 text-center shadow-sm">
          <p className="text-4xl" aria-hidden="true">
            😥
          </p>
          <h1 className="mt-4 text-xl font-black">Questions unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-[#6a8277]">{questionsError}</p>
          <p className="mt-1 text-xs text-[#6a8277]">
            Make sure the database has been seeded with past questions.
          </p>
          <button
            type="button"
            onClick={loadQuestions}
            className="mt-6 rounded-xl bg-[#18352b] px-5 py-3 text-sm font-black text-white hover:bg-[#285443]"
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  if (!question) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7f5] px-6 text-[#18352b]">
        <section className="w-full max-w-md rounded-[2rem] border border-[#f0d5c5] bg-white p-8 text-center shadow-sm">
          <p className="text-4xl" aria-hidden="true">📭</p>
          <h1 className="mt-4 text-xl font-black">No questions found</h1>
          <p className="mt-2 text-sm leading-6 text-[#6a8277]">
            No past questions are seeded yet for{" "}
            <strong>{activeSubject.replace(/_/g, " ")}</strong>.
            Run <code className="rounded bg-[#f0f5f1] px-1">npm run seed:questions</code> first.
          </p>
        </section>
      </main>
    );
  }

  // ─── main exam UI ──────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#071017] text-slate-100">
      {/* ── header ── */}
      <header className="border-b border-white/10 bg-[#0b161e]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                  JAMB AI Prep
                </p>
                <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-300 ring-1 ring-cyan-400/20">
                  Focus session
                </span>
              </div>
              <h1 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">
                {subjects.find((s) => s.value === activeSubject)?.label ?? "Practice Room"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCalculatorOpen((prev) => !prev)}
                className={`rounded-xl border px-3 py-2 text-xs font-black transition flex items-center gap-1.5 shadow-sm ${
                  isCalculatorOpen
                      ? "border-emerald-400 bg-emerald-400/15 text-emerald-200"
                      : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
                aria-label="Toggle JAMB calculator"
              >
                <span>🧮</span>
                <span className="hidden sm:inline">Calculator</span>
              </button>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Time left
                </p>
                <p className="font-mono text-lg font-bold tabular-nums text-white">
                  {formatTime(timeRemainingSeconds)}
                </p>
              </div>
              <button
                type="button"
                onClick={submitExam}
                disabled={isSubmitting || isSubmitted}
                className="rounded-xl bg-[#d95c32] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#bd4b28] focus:outline-none focus:ring-2 focus:ring-[#d95c32] focus:ring-offset-2"
              >
                {isSubmitting
                  ? "Submitting..."
                  : isSubmitted
                    ? "Submitted"
                    : "Submit Exam"}
              </button>
            </div>
            {submissionError && (
              <p
                className="mt-3 text-right text-sm font-semibold text-[#b34a28]"
                role="alert"
              >
                {submissionError}
              </p>
            )}
          </div>

          {/* subject tabs */}
          <nav aria-label="Select subject" className="flex gap-2 overflow-x-auto pb-1">
            {subjects.map((subject) => (
              <button
                type="button"
                key={subject.value}
                onClick={() => selectSubject(subject.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                  activeSubject === subject.value
                    ? "bg-emerald-400 text-slate-950 shadow-[0_0_18px_rgba(52,211,153,0.25)]"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="sm:hidden">{subject.shortLabel}</span>
                <span className="hidden sm:inline">{subject.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-8 lg:py-8">
        {/* ── question panel ── */}
        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                {subjects.find((s) => s.value === activeSubject)?.label}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-200">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
            </div>
            <p className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-400 ring-1 ring-white/10">
              {answeredCount} answered
            </p>
          </div>

          <article className="rounded-3xl border border-white/10 bg-[#111d27] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <p className="max-w-2xl text-lg font-bold leading-8 text-slate-100 sm:text-2xl sm:leading-9">
                {question.questionText}
              </p>
                <span className="hidden rounded-lg bg-amber-400/10 px-2.5 py-1 text-xs font-black text-amber-300 sm:inline-block">
                {isFlagged ? "FLAGGED" : "MOCK"}
              </span>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {question.options.map((option) => {
                const isSelected = currentAnswer === option.key;
                return (
                  <button
                    type="button"
                    key={option.key}
                    onClick={() => setAnswer(question.id, option.key)}
                    className={`flex min-h-16 items-center gap-4 rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-[#e2763b] focus:ring-offset-2 ${
                      isSelected
                        ? "border-[#18352b] bg-[#e8f2ea] shadow-[inset_4px_0_0_#18352b]"
                        : "border-white/10 bg-white/5 hover:border-cyan-400/60 hover:bg-white/10"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                        isSelected
                          ? "bg-[#18352b] text-white"
                          : "bg-white/10 text-slate-400"
                      }`}
                    >
                      {option.key}
                    </span>
                    <span className="text-sm font-semibold text-slate-200">
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf2ee] pt-5">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                className="rounded-xl border border-[#dce8e0] px-4 py-2.5 text-sm font-bold text-[#355449] transition hover:border-[#8eaa98] hover:bg-[#f7faf7] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={toggleFlag}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  isFlagged
                    ? "bg-[#fff0b8] text-[#735b00]"
                    : "text-[#6a8277] hover:bg-[#fff8d9] hover:text-[#735b00]"
                }`}
              >
                {isFlagged ? "Unflag Question" : "Flag Question"}
              </button>
              <button
                type="button"
                disabled={currentQuestionIndex === totalQuestions - 1}
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                className="rounded-xl bg-[#18352b] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#285342] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </article>

          <SocraticTutor
            subject={
              subjects.find((s) => s.value === activeSubject)?.label ??
              activeSubject
            }
            topic={tutorTopics[activeSubject]}
          />
        </section>

        {/* ── question palette ── */}
          <aside className="h-fit rounded-3xl border border-white/10 bg-[#111d27] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.25)] lg:sticky lg:top-6">
          <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Question palette
              </p>
              <h2 className="mt-1 text-lg font-black text-white">
                Jump to question
              </h2>
            </div>
            <span className="rounded-lg bg-white/5 px-2 py-1 text-xs font-bold text-slate-400">
              1–{totalQuestions}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-8 gap-2 sm:grid-cols-10 lg:grid-cols-5">
            {Array.from({ length: totalQuestions }, (_, idx) => {
              const isAnswered = Boolean(answers[idx]);
              const questionIsFlagged = flaggedQuestions.has(idx);
              const isCurrent = currentQuestionIndex === idx;
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`aspect-square rounded-lg text-xs font-black transition focus:outline-none focus:ring-2 focus:ring-[#e2763b] focus:ring-offset-1 ${
                    isAnswered
                      ? "bg-[#b8dfc1] text-[#1c5c2d] hover:bg-[#9dceb0]"
                      : questionIsFlagged
                        ? "bg-[#ffe58a] text-[#735b00] hover:bg-[#f6d96a]"
                        : "bg-[#edf0ee] text-[#718178] hover:bg-[#dfe7e1]"
                  } ${isCurrent ? "ring-2 ring-[#18352b] ring-offset-2" : ""}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid gap-2 border-t border-[#edf2ee] pt-5 text-xs font-semibold text-[#6a8277]">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#b8dfc1]" /> Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#ffe58a]" /> Flagged for review
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#edf0ee]" /> Unanswered
            </div>
          </div>
        </aside>
      </div>

      <JambCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </main>
  );
}