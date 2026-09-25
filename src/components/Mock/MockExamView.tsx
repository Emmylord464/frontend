'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Subject, UserProfile } from '../../types';
import { playTapSound, playCorrectSound, playCompleteSound, playIncorrectSound } from '../../utils/audio';
import {
  generateFull200QuestionExam,
  CBTQuestion,
} from '../../utils/mockExamGenerator';
import {
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Award,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Lock,
  Unlock,
  ShieldAlert,
  FileText,
} from 'lucide-react';

interface MockExamViewProps {
  profile: UserProfile;
  subjects: Subject[];
  onFinishMock?: (score: number) => void;
  onNavigateToSyllabus?: () => void;
  onLaunchTargetedDrill?: (subjectId: string) => void;
  onNavigateToRecovery?: () => void;
}

export const MockExamView: React.FC<MockExamViewProps> = ({
  profile,
  subjects,
  onFinishMock,
}) => {
  // ─── 4 Selected Subjects State (50 Questions Each) ─────────────────────────
  const default4Subjects = useMemo(() => {
    const english = subjects.find((s) => s.id === 'english') || { id: 'english', name: 'Use of English' };
    const others = subjects.filter((s) => s.id !== 'english');

    if (profile.department === 'Commercial') {
      const comm = others.filter((s) => ['economics', 'accounting', 'commerce', 'maths'].includes(s.id));
      return [english, ...(comm.slice(0, 3).length === 3 ? comm.slice(0, 3) : others.slice(0, 3))];
    } else if (profile.department === 'Arts') {
      const arts = others.filter((s) => ['government', 'literature', 'crs', 'economics'].includes(s.id));
      return [english, ...(arts.slice(0, 3).length === 3 ? arts.slice(0, 3) : others.slice(0, 3))];
    }
    // Default Sciences
    const sci = others.filter((s) => ['maths', 'physics', 'chemistry', 'biology'].includes(s.id));
    return [english, ...(sci.slice(0, 3).length === 3 ? sci.slice(0, 3) : others.slice(0, 3))];
  }, [subjects, profile.department]);

  const [selectedSubjects] = useState<{ id: string; name: string }[]>(default4Subjects);

  // ─── Exam Execution State ──────────────────────────────────────────────────
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [activeSubjectTab, setActiveSubjectTab] = useState<string>('english');
  const [currentGlobalIndex, setCurrentGlobalIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(120 * 60); // 120 minutes (2 Hours)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [lockedTabWarning, setLockedTabWarning] = useState<string | null>(null);

  // Generate 200 Questions (50 per subject)
  const { questions: examQuestions, subjectRanges } = useMemo(() => {
    return generateFull200QuestionExam(selectedSubjects);
  }, [selectedSubjects]);

  const currentQ = examQuestions[currentGlobalIndex] || examQuestions[0];
  const activeSubjectInfo = selectedSubjects.find((s) => s.id === activeSubjectTab) || selectedSubjects[0];
  const activeSubjectRange = subjectRanges[activeSubjectTab] || { start: 0, end: 49, count: 50 };

  // Timer countdown
  useEffect(() => {
    if (!examStarted || examFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, examFinished]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Option selection
  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D') => {
    playTapSound();
    setUserAnswers((prev) => ({
      ...prev,
      [currentGlobalIndex]: key,
    }));
  };

  const handleToggleFlag = (globalIdx: number) => {
    playTapSound();
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(globalIdx)) next.delete(globalIdx);
      else next.add(globalIdx);
      return next;
    });
  };

  // Strict Tab Switching Validation (Must complete 50 questions before switching subject tab)
  const handleSubjectTabChange = (targetSubjectId: string) => {
    if (targetSubjectId === activeSubjectTab) return;

    // Check if active subject has answered all 50 questions
    const currentRange = subjectRanges[activeSubjectTab];
    let currentSubjectAnswered = 0;
    let firstUnansweredIdx: number | null = null;

    if (currentRange) {
      for (let i = currentRange.start; i <= currentRange.end; i++) {
        if (userAnswers[i] !== undefined) {
          currentSubjectAnswered++;
        } else if (firstUnansweredIdx === null) {
          firstUnansweredIdx = i;
        }
      }
    }

    if (currentSubjectAnswered < 50) {
      playIncorrectSound();
      const remaining = 50 - currentSubjectAnswered;
      setLockedTabWarning(
        `Answer all 50 questions in ${activeSubjectInfo.name} before changing tabs (${remaining} remaining).`
      );
      setTimeout(() => setLockedTabWarning(null), 4000);
      return;
    }

    playTapSound();
    setActiveSubjectTab(targetSubjectId);
    const range = subjectRanges[targetSubjectId];
    if (range) {
      setCurrentGlobalIndex(range.start);
    }
  };

  const handleJumpToNextUnansweredInSubject = () => {
    playTapSound();
    const currentRange = subjectRanges[activeSubjectTab];
    if (currentRange) {
      for (let i = currentRange.start; i <= currentRange.end; i++) {
        if (userAnswers[i] === undefined) {
          setCurrentGlobalIndex(i);
          setLockedTabWarning(null);
          return;
        }
      }
    }
  };

  const handleNext = () => {
    playTapSound();
    if (currentGlobalIndex < examQuestions.length - 1) {
      const nextIdx = currentGlobalIndex + 1;
      const nextQ = examQuestions[nextIdx];

      // If moving to next subject, check if current subject is fully answered
      if (nextQ && nextQ.subjectId !== activeSubjectTab) {
        handleSubjectTabChange(nextQ.subjectId);
      } else {
        setCurrentGlobalIndex(nextIdx);
      }
    }
  };

  const handlePrev = () => {
    playTapSound();
    if (currentGlobalIndex > 0) {
      const prevIdx = currentGlobalIndex - 1;
      const prevQ = examQuestions[prevIdx];
      if (prevQ && prevQ.subjectId !== activeSubjectTab) {
        setActiveSubjectTab(prevQ.subjectId);
      }
      setCurrentGlobalIndex(prevIdx);
    }
  };

  const handleJumpToQuestion = (globalIdx: number) => {
    playTapSound();
    setCurrentGlobalIndex(globalIdx);
  };

  const handleFinishExam = () => {
    playCorrectSound();
    playCompleteSound();
    setIsSubmitModalOpen(false);
    setExamFinished(true);

    if (onFinishMock) {
      let totalCorrect = 0;
      examQuestions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctAnswer) totalCorrect++;
      });
      const compositeScore = Math.round((totalCorrect / examQuestions.length) * 400);
      onFinishMock(compositeScore);
    }
  };

  const handleRestart = () => {
    playTapSound();
    setUserAnswers({});
    setFlaggedQuestions(new Set());
    setCurrentGlobalIndex(0);
    setActiveSubjectTab(selectedSubjects[0].id);
    setTimeLeft(120 * 60);
    setExamStarted(false);
    setExamFinished(false);
  };

  // Keyboard navigation (JAMB 8-key simulation: A, B, C, D, N, P, R, S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!examStarted || examFinished) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();
      if (['A', '1'].includes(key)) handleSelectOption('A');
      if (['B', '2'].includes(key)) handleSelectOption('B');
      if (['C', '3'].includes(key)) handleSelectOption('C');
      if (['D', '4'].includes(key)) handleSelectOption('D');
      if (key === 'N' || key === 'ARROWDOWN' || key === 'ARROWRIGHT') handleNext();
      if (key === 'P' || key === 'ARROWUP' || key === 'ARROWLEFT') handlePrev();
      if (key === 'R') handleToggleFlag(currentGlobalIndex);
      if (key === 'S') setIsSubmitModalOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [examStarted, examFinished, currentGlobalIndex]);

  const answeredCount = Object.keys(userAnswers).length;

  const subjectScores = useMemo(() => {
    return selectedSubjects.map((sub) => {
      const range = subjectRanges[sub.id] || { start: 0, end: 49, count: 50 };
      let correct = 0;
      for (let i = range.start; i <= range.end; i++) {
        if (userAnswers[i] === examQuestions[i]?.correctAnswer) {
          correct++;
        }
      }
      return {
        subjectId: sub.id,
        subjectName: sub.name,
        correct,
        total: 50,
        scaledScore: Math.round((correct / 50) * 100),
      };
    });
  }, [selectedSubjects, subjectRanges, userAnswers, examQuestions]);

  const totalCorrect = subjectScores.reduce((acc, s) => acc + s.correct, 0);
  const compositeScore = subjectScores.reduce((acc, s) => acc + s.scaledScore, 0);

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW 1: PRE-EXAM SETUP & 4-SUBJECT SELECTOR
  // ──────────────────────────────────────────────────────────────────────────
  if (!examStarted) {
    return (
      <div className="w-full flex-1 flex flex-col px-3.5 sm:px-5 py-4 max-w-lg mx-auto space-y-3.5 select-none pb-24 text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
              UTME CBT Mock Exam
            </h1>
            <span className="inline-flex items-center justify-center h-5 px-2 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-mono text-stone-500 font-semibold border border-stone-200/60 dark:border-stone-700/60">
              Strict CBT Mode
            </span>
          </div>
          <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold">
            200 Qs · 120 Mins
          </span>
        </div>

        {/* 4 Selected Subjects Card */}
        <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#181a1c] p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/80 pb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
              4 Exam Subjects (50Q Each)
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              Strict Progression Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {selectedSubjects.map((sub, idx) => (
              <div
                key={sub.id}
                className="p-2.5 rounded-2xl bg-stone-50 dark:bg-[#121314] border border-stone-100 dark:border-stone-800/80 flex items-center justify-between"
              >
                <div>
                  <span className="text-[9px] font-mono uppercase text-stone-400 block">
                    Subject {idx + 1} {idx === 0 ? '(Core)' : ''}
                  </span>
                  <span className="font-serif font-bold text-xs sm:text-sm text-stone-900 dark:text-white truncate">
                    {sub.name}
                  </span>
                </div>
                <span className="inline-flex items-center justify-center h-4.5 px-1.5 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono text-[9px] font-bold">
                  50Q
                </span>
              </div>
            ))}
          </div>

          {/* Chief Examiner's Note Alert */}
          <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] uppercase">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>JAMB Chief Examiner's Regulation:</span>
            </div>
            <p className="leading-relaxed text-[10px] text-stone-600 dark:text-stone-400">
              Candidates must complete all 50 questions in the current subject before the next subject tab unlocks. Negative guessing traps are tagged in post-exam analytics.
            </p>
          </div>

          {/* Launch Button */}
          <button
            onClick={() => {
              playTapSound();
              setExamStarted(true);
            }}
            className="w-full py-3.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <span>Launch 200-Question CBT Exam</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW 2: ACTIVE CBT 4-SUBJECT EXAM PLAYER
  // ──────────────────────────────────────────────────────────────────────────
  if (!examFinished) {
    const activeSubjectAnsweredCount = Object.keys(userAnswers).filter(
      (idx) => Number(idx) >= activeSubjectRange.start && Number(idx) <= activeSubjectRange.end
    ).length;
    const isCurrentSubjectComplete = activeSubjectAnsweredCount === 50;

    return (
      <div className="w-full flex-1 flex flex-col px-3 sm:px-4 py-2 max-w-lg mx-auto select-none pb-20">
        {/* ─── Top Timer & Subject Switcher Tabs ─── */}
        <div className="space-y-2 mb-2">
          {/* Timer & Global Progress */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#c2410c]" />
              <span className="font-mono font-bold text-stone-900 dark:text-white text-sm">
                {formatTimer(timeLeft)}
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-stone-400">
              <span>
                Answered: <strong className="text-stone-900 dark:text-white">{answeredCount}</strong> / 200
              </span>
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-2.5 py-0.5 rounded-md bg-stone-900 text-white dark:bg-white dark:text-stone-900 text-[10px] font-bold uppercase cursor-pointer"
              >
                Submit (S)
              </button>
            </div>
          </div>

          {/* 4 Subject Switcher Tabs with Lock States */}
          <div className="grid grid-cols-4 gap-1 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl">
            {selectedSubjects.map((sub) => {
              const isActive = activeSubjectTab === sub.id;
              const subRange = subjectRanges[sub.id] || { start: 0, end: 49 };
              const subAnswered = Object.keys(userAnswers).filter(
                (idx) => Number(idx) >= subRange.start && Number(idx) <= subRange.end
              ).length;
              const isSubDone = subAnswered === 50;

              return (
                <button
                  key={sub.id}
                  onClick={() => handleSubjectTabChange(sub.id)}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-semibold transition-all truncate text-center flex flex-col items-center justify-center cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#1f2124] text-stone-900 dark:text-white shadow-2xs'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1 truncate">
                    <span className="truncate">{sub.name.replace('Use of ', '')}</span>
                    {isSubDone && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />}
                  </div>
                  <div className="text-[8px] opacity-60 font-mono">{subAnswered}/50</div>
                </button>
              );
            })}
          </div>

          {/* Locked Tab Enforcement Toast / Alert */}
          {lockedTabWarning && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2"
            >
              <span className="truncate">{lockedTabWarning}</span>
              <button
                onClick={handleJumpToNextUnansweredInSubject}
                className="px-2 py-0.5 rounded bg-amber-800 dark:bg-amber-300 text-white dark:text-stone-900 text-[9px] font-bold uppercase shrink-0 cursor-pointer"
              >
                Jump to Next
              </button>
            </motion.div>
          )}

          {/* Question Index Subtext with Circular Pill */}
          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-stone-900 dark:text-white">
                {activeSubjectInfo.name}
              </span>
              <span className="inline-flex items-center justify-center h-4.5 px-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 text-[9px] font-mono">
                Q{currentQ.subjectIndex + 1} of 50
              </span>
            </div>

            <button
              onClick={() => handleToggleFlag(currentGlobalIndex)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                flaggedQuestions.has(currentGlobalIndex)
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <span>Flag (R)</span>
            </button>
          </div>
        </div>

        {/* ─── Question Card ─── */}
        <div className="flex-1 flex flex-col justify-between space-y-2.5">
          <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#181a1c] p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono text-stone-400 uppercase tracking-wider">
              <span>{currentQ.syllabusTopic}</span>
              <span>Item {currentGlobalIndex + 1} / 200</span>
            </div>
            <h2 className="font-serif text-base sm:text-lg font-semibold leading-relaxed text-stone-900 dark:text-white">
              {currentQ.text}
            </h2>
          </div>

          {/* 4 Options */}
          <div className="space-y-1.5">
            {currentQ.options.map((opt) => {
              const isSelected = userAnswers[currentGlobalIndex] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'border-stone-900 dark:border-white bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-2xs'
                      : 'border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#181a1c] text-stone-900 dark:text-white hover:border-stone-400'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-semibold ${
                      isSelected
                        ? 'bg-white/20 dark:bg-black/20 text-white dark:text-stone-900'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span className="text-xs sm:text-sm font-medium pt-0.5 flex-1 leading-snug">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* 50-Question Quick Jump Grid for Active Subject */}
          <div className="rounded-2xl bg-stone-50/80 dark:bg-[#121314] p-2.5 border border-stone-100 dark:border-stone-800 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 px-0.5">
              <span>{activeSubjectInfo.name} Jump Grid (1–50)</span>
              <span>{activeSubjectAnsweredCount}/50 Answered</span>
            </div>

            <div className="grid grid-cols-10 gap-1 max-h-24 overflow-y-auto pr-0.5">
              {Array.from({ length: 50 }).map((_, i) => {
                const gIdx = activeSubjectRange.start + i;
                const isAns = userAnswers[gIdx] !== undefined;
                const isCur = currentGlobalIndex === gIdx;
                const isFlg = flaggedQuestions.has(gIdx);

                let bg = 'bg-stone-200/70 dark:bg-stone-800 text-stone-500';
                if (isAns) bg = 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-bold';
                if (isFlg) bg = 'bg-amber-400 text-stone-900 font-bold';

                return (
                  <button
                    key={i}
                    onClick={() => handleJumpToQuestion(gIdx)}
                    className={`h-5 rounded text-[9px] font-mono flex items-center justify-center transition-all cursor-pointer ${bg} ${
                      isCur ? 'ring-2 ring-[#c2410c]' : ''
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Next / Previous Controls */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={handlePrev}
              disabled={currentGlobalIndex === 0}
              className="py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs flex items-center gap-1 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous (P)</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentGlobalIndex === examQuestions.length - 1}
              className="py-2.5 px-5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-xs flex items-center gap-1 hover:opacity-90 disabled:opacity-30 cursor-pointer shadow-2xs"
            >
              <span>Next (N)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#181a1c] p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4 text-center">
              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white">
                Submit 200-Question Exam?
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                You have answered <strong>{answeredCount} of 200</strong> questions across 4 subjects.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Keep Testing
                </button>
                <button
                  onClick={handleFinishExam}
                  className="py-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold hover:opacity-90 cursor-pointer shadow-2xs"
                >
                  Confirm & Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW 3: POST-EXAM 4-SUBJECT 400-POINT DIAGNOSTICS WITH CHIEF EXAMINER'S REPORT
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex-1 flex flex-col px-3.5 sm:px-5 py-4 max-w-lg mx-auto space-y-3.5 select-none pb-24 text-stone-900 dark:text-stone-100">
      {/* Victory Header */}
      <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#181a1c] p-5 shadow-2xs text-center space-y-3.5">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
          <Award className="h-6 w-6" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs font-serif font-bold text-stone-400 uppercase tracking-widest">
              UTME Composite Score
            </span>
            <span className="inline-flex items-center justify-center h-4.5 px-2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-mono font-bold">
              Scaled / 400
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white">
            {compositeScore} <span className="text-sm font-normal text-stone-400">/ 400</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {totalCorrect} of 200 questions answered correctly ({Math.round((totalCorrect / 200) * 100)}% accuracy).
          </p>
        </div>

        {/* 4 Subjects Breakdown Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {subjectScores.map((sub) => (
            <div
              key={sub.subjectId}
              className="p-3 rounded-2xl bg-stone-50 dark:bg-[#121314] border border-stone-100 dark:border-stone-800/80 text-left space-y-0.5"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                <span className="truncate">{sub.subjectName}</span>
                <span className="font-bold text-stone-900 dark:text-white">{sub.scaledScore}/100</span>
              </div>
              <div className="text-xs font-serif font-bold text-stone-800 dark:text-stone-200">
                {sub.correct} / 50 Correct
              </div>
            </div>
          ))}
        </div>

        {/* ─── Chief Examiner's Report & Diagnostic Pitfall Insight ─── */}
        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#121314] border border-stone-200/80 dark:border-stone-800 text-left space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#c2410c]" />
              <span>JAMB Chief Examiner's Performance Report</span>
            </span>
            <span className="inline-flex items-center justify-center h-4 px-1.5 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[8px] font-mono font-semibold">
              Official Analysis
            </span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
            {compositeScore >= 300
              ? 'Candidate demonstrates mastery above the 95th percentile. Recommendation: Maintain pacing consistency in calculation subjects (Maths/Physics).'
              : 'Candidate shows strong concept grasp but experienced distractor traps in Section B and Section C. Recommendation: Review correlative concord and stoichiometry calculations in Micro-Drills.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleRestart}
            className="w-full py-3 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake 200-Question CBT Simulation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
