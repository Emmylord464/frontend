'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, Subject, Department } from '../../types';
import { playCorrectSound, playIncorrectSound, playTapSound, playCompleteSound } from '../../utils/audio';
import { HARD_JAMB_QUESTIONS } from '../../data/hardQuestions';
import { fetchSubjectQuestionsAction } from '../../actions/aloc-questions';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Volume2,
  VolumeX,
  Flame,
  Filter,
  Sparkles,
  Zap,
} from 'lucide-react';

interface DrillViewProps {
  questions: Question[];
  subjects: Subject[];
  activeSubjectId: string;
  onSubjectChange: (subjectId: string) => void;
  onRecordResult: (correct: boolean, subjectId: string) => void;
  onNavigateToAnalytics: () => void;
  dailyQuestionsAnswered?: number;
  dailyGoal?: number;
  userDepartment?: Department;
  englishUnlocked?: boolean;
  onUnlockEnglish?: () => void;
  onIngestQuestions?: (newQuestions: Question[]) => void;
}

const QUESTION_COUNT_OPTIONS = [10, 15, 20, 30, 50] as const;

export const DrillView: React.FC<DrillViewProps> = ({
  questions: initialQuestions,
  subjects,
  activeSubjectId,
  onSubjectChange,
  onRecordResult,
  onNavigateToAnalytics,
}) => {
  // Session Configuration State
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [drillMode, setDrillMode] = useState<'hardest' | 'all'>('hardest');
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Drill Progress State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [drillCompleted, setDrillCompleted] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  // Combine and prepare master pool of questions
  const masterPool = useMemo(() => {
    const combined = [...HARD_JAMB_QUESTIONS, ...initialQuestions];
    // De-duplicate by ID
    const seen = new Set<string>();
    return combined.filter((q) => {
      if (seen.has(q.id)) return false;
      seen.add(q.id);
      return true;
    });
  }, [initialQuestions]);

  // Build the session question set based on active subject, difficulty, and target count
  const buildSessionQuestions = useCallback(
    async (targetSubject: string, targetCount: number, mode: 'hardest' | 'all') => {
      setIsLoading(true);

      // 1. Filter local hard pool
      let filtered = masterPool.filter((q) => {
        const matchesSub = targetSubject === 'all' || q.subjectId === targetSubject;
        if (!matchesSub) return false;
        if (mode === 'hardest') return q.difficulty === 'Hard' || q.difficulty === 'Medium';
        return true;
      });

      // If we don't have enough and target is a specific subject, try fetching from ALOC / DB
      if (filtered.length < targetCount && targetSubject !== 'all') {
        try {
          const res = await fetchSubjectQuestionsAction(targetSubject, targetCount);
          if (res.success && res.questions.length > 0) {
            const fetched = res.questions.map((q) => ({
              ...q,
              difficulty: 'Hard' as const,
            }));
            const combined = [...filtered, ...fetched];
            const seen = new Set<string>();
            filtered = combined.filter((q) => {
              if (seen.has(q.id)) return false;
              seen.add(q.id);
              return true;
            });
          }
        } catch {
          // Fallback to local pool
        }
      }

      // If "all subjects", shuffle across all subjects prioritizing Hard
      if (targetSubject === 'all') {
        filtered = [...masterPool].sort(() => Math.random() - 0.5);
      }

      // If still fewer than targetCount, cycle with varied IDs to ensure candidate always gets full chosen count (10, 15, 20...)
      let result = [...filtered];
      if (result.length === 0) {
        result = [...HARD_JAMB_QUESTIONS];
      }

      while (result.length < targetCount) {
        const duplicate = result.map((q, idx) => ({
          ...q,
          id: `${q.id}-r${idx}-${Math.random().toString(36).substring(2, 5)}`,
        }));
        result = [...result, ...duplicate];
      }

      // Slice to exact chosen count and shuffle
      const finalSet = result.slice(0, targetCount).sort(() => Math.random() - 0.5);
      setSessionQuestions(finalSet);
      setCurrentIndex(0);
      setCorrectCount(0);
      setDrillCompleted(false);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsLoading(false);
    },
    [masterPool]
  );

  // Initialize session whenever subject or target count changes
  useEffect(() => {
    buildSessionQuestions(activeSubjectId, selectedCount, drillMode);
  }, [activeSubjectId, selectedCount, drillMode, buildSessionQuestions]);

  const currentQ = sessionQuestions[currentIndex] || sessionQuestions[0];
  const activeSubject = subjects.find((s) => s.id === activeSubjectId) || {
    id: 'all',
    name: 'All Subjects (Cross-Curriculum)',
  };

  // Reset state on card transition
  const resetCardState = useCallback(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsShaking(false);
    setIsSpeaking(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  useEffect(() => {
    resetCardState();
  }, [currentIndex, resetCardState]);

  // Voice narration
  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#]/g, ''));
    utterance.rate = 0.93;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Option selection
  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered || !currentQ) return;
    setSelectedOption(key);
    setIsAnswered(true);

    const isCorrect = key === currentQ.correctAnswer;
    if (isCorrect) {
      playCorrectSound();
      setCorrectCount((prev) => prev + 1);
    } else {
      playIncorrectSound();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    }

    onRecordResult(isCorrect, currentQ.subjectId);
  };

  const handleNext = () => {
    playTapSound();
    if (currentIndex + 1 < sessionQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setDrillCompleted(true);
      playCompleteSound();
    }
  };

  const handleRestart = () => {
    playTapSound();
    buildSessionQuestions(activeSubjectId, selectedCount, drillMode);
  };

  // Keyboard shortcuts: 1-4 or A-D to select, Space/Enter to advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();
      if (!isAnswered) {
        if (['A', '1'].includes(key)) handleSelectOption('A');
        if (['B', '2'].includes(key)) handleSelectOption('B');
        if (['C', '3'].includes(key)) handleSelectOption('C');
        if (['D', '4'].includes(key)) handleSelectOption('D');
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, currentIndex, sessionQuestions.length]);

  if (isLoading || !currentQ) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 animate-pulse mb-3">
          <Zap className="h-6 w-6 text-[#c2410c]" />
        </div>
        <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">
          Curating {selectedCount} Hardest Questions...
        </p>
        <p className="text-[11px] text-stone-400 font-mono mt-1">
          Filtering 2005–2025 high-recurrence trap patterns
        </p>
      </div>
    );
  }

  const isSelectedCorrect = selectedOption === currentQ.correctAnswer;

  return (
    <div className="w-full flex-1 flex flex-col justify-between px-3 sm:px-4 py-2 max-w-lg mx-auto select-none">
      {/* ─── Sleek Control Bar (Subject & Question Count Selector) ─── */}
      <div className="space-y-2 mb-2">
        <div className="flex items-center justify-between gap-2">
          {/* Subject Switcher Capsule */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => {
                playTapSound();
                onSubjectChange('all');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                activeSubjectId === 'all'
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              <Flame className="w-3 h-3 text-[#c2410c]" />
              <span>All Subjects (Hardest)</span>
            </button>

            {subjects.slice(0, 4).map((sub) => (
              <button
                key={sub.id}
                onClick={() => {
                  playTapSound();
                  onSubjectChange(sub.id);
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                  activeSubjectId === sub.id
                    ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-2xs'
                    : 'bg-stone-100 dark:bg-stone-800/80 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {sub.name.replace('Use of ', '')}
              </button>
            ))}
          </div>

          {/* Question Count Selector Pills (Starting from 10) */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800/80 p-0.5 rounded-lg shrink-0">
            {QUESTION_COUNT_OPTIONS.map((count) => (
              <button
                key={count}
                onClick={() => {
                  playTapSound();
                  setSelectedCount(count);
                }}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                  selectedCount === count
                    ? 'bg-white dark:bg-[#1f2124] text-stone-900 dark:text-white shadow-2xs'
                    : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
              >
                {count}Q
              </button>
            ))}
          </div>
        </div>

        {/* Progress & Question Counter Line */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1">
              <span className="text-stone-400 font-normal">
                {activeSubjectId === 'all' ? currentQ.subjectName : activeSubject.name}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider">
                ⚡ Hard Drill
              </span>
            </span>
            <span className="text-[11px] font-mono text-stone-400 font-medium">
              {currentIndex + 1} / {sessionQuestions.length}
            </span>
          </div>

          <div className="w-full bg-stone-100 dark:bg-stone-800 h-1 rounded-full overflow-hidden">
            <motion.div
              className="bg-stone-900 dark:bg-white h-full rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentIndex + (isAnswered ? 1 : 0.2)) / sessionQuestions.length) * 100}%`,
              }}
              transition={{ duration: 0.25 }}
            />
          </div>
        </div>
      </div>

      {/* ─── Main Question Display ─── */}
      {!drillCompleted ? (
        <motion.div
          key={currentQ.id}
          animate={isShaking ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.35 }}
          className="flex-1 flex flex-col justify-between space-y-2.5"
        >
          {/* Question Prompt Card */}
          <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#181a1c] p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 font-mono">
                <span>{currentQ.year || 'Past UTME'}</span>
                <span>•</span>
                <span className="text-stone-500 dark:text-stone-300">{currentQ.syllabusTopic || 'Core Syllabus'}</span>
              </div>
              <button
                type="button"
                onClick={() => handleSpeak(currentQ.text)}
                className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Read question"
              >
                {isSpeaking ? (
                  <VolumeX className="w-3.5 h-3.5 text-[#c2410c] animate-pulse" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <h2 className="font-serif text-base sm:text-lg font-semibold leading-relaxed text-stone-900 dark:text-white">
              {currentQ.text}
            </h2>
          </div>

          {/* 4 Tactile Option Tiles */}
          <div className="space-y-1.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === opt.id;
              const isCorrectOpt = opt.id === currentQ.correctAnswer;

              let style =
                'border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#181a1c] text-stone-900 dark:text-white hover:border-stone-400 active:scale-[0.99]';

              if (isAnswered) {
                if (isCorrectOpt) {
                  style =
                    'border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20';
                } else if (isSelected && !isCorrectOpt) {
                  style =
                    'border-red-500 bg-red-50/90 dark:bg-red-950/40 text-red-950 dark:text-red-200';
                } else {
                  style =
                    'opacity-35 border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#121314] text-stone-400';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id as 'A' | 'B' | 'C' | 'D')}
                  disabled={isAnswered}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${style}`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-semibold ${
                      isAnswered && isCorrectOpt
                        ? 'bg-emerald-600 text-white'
                        : isAnswered && isSelected && !isCorrectOpt
                        ? 'bg-red-600 text-white'
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

          {/* Instant Inline Explanation (Collapsed until answered) */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`rounded-xl border p-3 text-xs space-y-1 overflow-hidden ${
                  isSelectedCorrect
                    ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                    : 'border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 text-stone-800 dark:text-stone-200'
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-[11px]">
                  <span className="flex items-center gap-1.5">
                    {isSelectedCorrect ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    {isSelectedCorrect
                      ? 'Correct Solution'
                      : `Correct Answer: (${currentQ.correctAnswer})`}
                  </span>
                </div>
                <p className="leading-relaxed text-[11px] text-stone-600 dark:text-stone-300">
                  {currentQ.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Action: Next Button */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-1 flex justify-end"
            >
              <button
                onClick={handleNext}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-2xs cursor-pointer"
              >
                <span>{currentIndex + 1 < sessionQuestions.length ? 'Next Question' : 'View Drill Results'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </motion.div>
      ) : (
        /* ─── Sleek Drill Results Victory Card ─── */
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#181a1c] p-6 text-center space-y-4 shadow-sm my-auto"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white">
              {selectedCount}-Question Drill Completed
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              High-difficulty performance recorded for {activeSubject.name}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 py-1">
            <div className="rounded-2xl bg-[#f9f9f8] dark:bg-[#121314] p-3">
              <span className="text-[10px] uppercase text-stone-400 block font-mono">Score</span>
              <span className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                {correctCount} / {sessionQuestions.length}
              </span>
            </div>
            <div className="rounded-2xl bg-[#f9f9f8] dark:bg-[#121314] p-3">
              <span className="text-[10px] uppercase text-stone-400 block font-mono">Accuracy</span>
              <span className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round((correctCount / sessionQuestions.length) * 100)}%
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={handleRestart}
              className="w-full py-3 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Drill Another {selectedCount} Hard Questions</span>
            </button>
            <button
              onClick={() => {
                playTapSound();
                onNavigateToAnalytics();
              }}
              className="w-full py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors cursor-pointer"
            >
              Check 250+ Recurrence Index
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
