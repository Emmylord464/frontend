'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, Subject, Department } from '../../types';
import { playCorrectSound, playIncorrectSound, playTapSound, playCompleteSound } from '../../utils/audio';
import { getFreshQuestionsForSubject, get4SubjectMixedDrill } from '../../utils/questionEngine';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronDown,
  Layers,
  Flame,
  HelpCircle,
  BookOpen,
  Info,
} from 'lucide-react';

interface DrillViewProps {
  questions?: Question[];
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

export const DrillView: React.FC<DrillViewProps> = ({
  subjects,
  activeSubjectId,
  onSubjectChange,
  onRecordResult,
  onNavigateToAnalytics,
  userDepartment = 'Sciences',
}) => {
  // Drill Mode: 'mixed4' (4 Subjects × 10Q = 40Q Total) or 'single' (Single Subject)
  const [drillMode, setDrillMode] = useState<'mixed4' | 'single'>('mixed4');
  const [singleCount, setSingleCount] = useState<number>(20);
  const [showExplanationGuide, setShowExplanationGuide] = useState<boolean>(false);

  // Candidate's 4 default subjects based on department
  const candidate4SubjectIds = useMemo(() => {
    if (userDepartment === 'Commercial') {
      return ['english', 'maths', 'economics', 'commerce'];
    } else if (userDepartment === 'Arts') {
      return ['english', 'literature', 'government', 'crs'];
    }
    // Default Sciences
    return ['english', 'biology', 'chemistry', 'physics'];
  }, [userDepartment]);

  // Questions and Subject Transition Offsets
  const [drillQuestions, setDrillQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [subjectScoreTracker, setSubjectScoreTracker] = useState<Record<string, { correct: number; total: number }>>({});
  const [drillCompleted, setDrillCompleted] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

  // Load fresh drill questions
  const loadFreshDrill = useCallback(() => {
    if (drillMode === 'mixed4') {
      const { questions } = get4SubjectMixedDrill(candidate4SubjectIds, 10);
      setDrillQuestions(questions);
    } else {
      const fresh = getFreshQuestionsForSubject(activeSubjectId, singleCount);
      setDrillQuestions(fresh);
    }

    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setSubjectScoreTracker({});
    setDrillCompleted(false);
    setIsShaking(false);
    setIsSpeaking(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [drillMode, candidate4SubjectIds, activeSubjectId, singleCount]);

  useEffect(() => {
    loadFreshDrill();
  }, [loadFreshDrill]);

  const currentQ = drillQuestions[currentIndex] || drillQuestions[0];

  // Current Question Subject Name
  const currentSubjectName = useMemo(() => {
    if (!currentQ) return 'Use of English';
    const sub = subjects.find((s) => s.id === currentQ.subjectId);
    return sub?.name || currentQ.subjectName || 'Use of English';
  }, [currentQ, subjects]);

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
    utterance.rate = 0.92;
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

    // Update subject score tracker
    setSubjectScoreTracker((prev) => {
      const current = prev[currentQ.subjectId] || { correct: 0, total: 0 };
      return {
        ...prev,
        [currentQ.subjectId]: {
          correct: current.correct + (isCorrect ? 1 : 0),
          total: current.total + 1,
        },
      };
    });

    onRecordResult(isCorrect, currentQ.subjectId);
  };

  const handleNext = () => {
    playTapSound();
    if (currentIndex + 1 < drillQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsShaking(false);
      setIsSpeaking(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      setDrillCompleted(true);
      playCompleteSound();
    }
  };

  const handleRestart = () => {
    playTapSound();
    loadFreshDrill();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

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
  }, [isAnswered, currentIndex, drillQuestions.length]);

  if (!currentQ) {
    return (
      <div className="w-full max-w-lg mx-auto py-12 px-4 text-center text-xs text-stone-500">
        Preparing fresh 4-subject drill...
      </div>
    );
  }

  const isSelectedCorrect = selectedOption === currentQ.correctAnswer;

  return (
    <div className="w-full flex-1 flex flex-col justify-between px-3.5 sm:px-5 py-3 max-w-lg mx-auto select-none space-y-3 pb-24 text-stone-900 dark:text-stone-100">
      {/* ─── Mode Selector & Explain Drawer Trigger ─── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* 4-Subject Mixed Drill vs Single Subject Tabs */}
          <div className="flex p-1 bg-stone-100 dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 flex-1">
            <button
              onClick={() => {
                playTapSound();
                setDrillMode('mixed4');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                drillMode === 'mixed4'
                  ? 'bg-white dark:bg-[#181a1c] text-stone-900 dark:text-white shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>4-Subject Mix (40Q)</span>
            </button>

            <button
              onClick={() => {
                playTapSound();
                setDrillMode('single');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                drillMode === 'single'
                  ? 'bg-white dark:bg-[#181a1c] text-stone-900 dark:text-white shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Single Subject</span>
            </button>
          </div>

          {/* Explanation Info Trigger */}
          <button
            onClick={() => {
              playTapSound();
              setShowExplanationGuide(!showExplanationGuide);
            }}
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
            title="What is a Drill Set?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* What is a Drill Set Explanatory Card (Collapsible) */}
        <AnimatePresence>
          {showExplanationGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/90 dark:bg-[#181a1c] p-3.5 text-xs text-stone-600 dark:text-stone-300 space-y-2 overflow-hidden shadow-2xs"
            >
              <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-white">
                <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>What is a Drill Set?</span>
              </div>
              <p className="leading-relaxed">
                <strong>Drills</strong> are rapid-fire daily practice workouts (unlike the full 2-hour 200Q CBT simulation).
              </p>
              <ul className="space-y-1 list-disc list-inside font-mono text-[11px] text-stone-500 dark:text-stone-400">
                <li><strong>4-Subject Mixed Drill:</strong> 10 high-yield questions from each of your 4 registered subjects = <strong>40 questions total</strong>.</li>
                <li><strong>Instant Feedback:</strong> Full step-by-step explanations appear immediately after each answer.</li>
                <li><strong>Zero Timer Pressure:</strong> Practice at your own pace to build accuracy and master difficult concepts.</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Single Subject Picker (when single mode is active) */}
        {drillMode === 'single' && (
          <div className="flex items-center justify-between gap-2 pt-0.5">
            {/* Subject Selector */}
            <div className="relative flex-1">
              <button
                onClick={() => {
                  playTapSound();
                  setIsSubjectDropdownOpen(!isSubjectDropdownOpen);
                }}
                className="w-full flex items-center justify-between py-1.5 px-3 rounded-xl bg-white dark:bg-[#181a1c] border border-stone-200/80 dark:border-stone-800 text-xs font-semibold hover:border-stone-400 dark:hover:border-stone-600 transition-all cursor-pointer"
              >
                <span className="truncate text-stone-900 dark:text-white">
                  {currentSubjectName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {isSubjectDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#181a1c] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl z-50 p-1.5 space-y-1 max-h-48 overflow-y-auto">
                  {subjects.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        playTapSound();
                        onSubjectChange(sub.id);
                        setIsSubjectDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between ${
                        activeSubjectId === sub.id
                          ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-semibold'
                          : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <span>{sub.name}</span>
                      <span className="text-[10px] font-mono opacity-60">{sub.readiness}%</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Single Count Pills */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-1 rounded-xl border border-stone-200/60 dark:border-stone-800">
              {[10, 20, 40].map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    playTapSound();
                    setSingleCount(count);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    singleCount === count
                      ? 'bg-white dark:bg-[#181a1c] text-stone-900 dark:text-white shadow-2xs'
                      : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                  }`}
                >
                  {count}Q
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Active Progress Header & Round Pill Subject Badge ─── */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold border border-stone-200/60 dark:border-stone-700/60">
                {currentSubjectName}
              </span>
            </div>

            <span className="font-semibold text-stone-900 dark:text-white">
              Question {currentIndex + 1} of {drillQuestions.length}
            </span>
          </div>

          <div className="w-full bg-stone-100 dark:bg-stone-800/80 h-1 rounded-full overflow-hidden">
            <motion.div
              className="bg-[#c2410c] h-full rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentIndex + (isAnswered ? 1 : 0.3)) / drillQuestions.length) * 100}%`,
              }}
              transition={{ duration: 0.25 }}
            />
          </div>
        </div>
      </div>

      {/* ─── Main Tactical Drill Question & Options ─── */}
      {!drillCompleted ? (
        <motion.div
          animate={isShaking ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.35 }}
          className="flex-1 flex flex-col justify-between space-y-3"
        >
          {/* Question Prompt Card */}
          <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#181a1c] p-5 sm:p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center h-5 px-2 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-mono text-stone-500 dark:text-stone-400 font-semibold border border-stone-200/60 dark:border-stone-700/60">
                  {currentQ.year || 'Authentic UTME'}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 truncate max-w-[160px]">
                  {currentQ.syllabusTopic || 'Core Concept'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleSpeak(currentQ.text)}
                className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Read aloud"
              >
                {isSpeaking ? (
                  <VolumeX className="w-4 h-4 text-[#c2410c] animate-pulse" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </div>

            <h2 className="font-serif text-lg sm:text-xl font-bold leading-relaxed text-stone-900 dark:text-white whitespace-pre-line">
              {currentQ.text}
            </h2>
          </div>

          {/* 4 Tactile Option Cards */}
          <div className="space-y-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === opt.id;
              const isCorrectOpt = opt.id === currentQ.correctAnswer;

              let style =
                'border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#181a1c] text-stone-900 dark:text-stone-100 hover:border-stone-400 dark:hover:border-stone-600 shadow-2xs';

              if (isAnswered) {
                if (isCorrectOpt) {
                  style =
                    'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20';
                } else if (isSelected && !isCorrectOpt) {
                  style =
                    'border-red-500 bg-red-50/80 dark:bg-red-950/30 text-red-950 dark:text-red-200';
                } else {
                  style =
                    'opacity-40 border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#121314] text-stone-400';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id as 'A' | 'B' | 'C' | 'D')}
                  disabled={isAnswered}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${style}`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
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
                  <span className="text-[10px] text-stone-400 font-mono hidden sm:inline opacity-60">
                    [{idx + 1}]
                  </span>
                </button>
              );
            })}
          </div>

          {/* Instant Inline Step-by-Step Explanation */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`rounded-2xl border p-4 text-xs space-y-1.5 overflow-hidden shadow-2xs ${
                  isSelectedCorrect
                    ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                    : 'border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 text-stone-800 dark:text-stone-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    {isSelectedCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-600" />
                    )}
                    {isSelectedCorrect
                      ? 'Accurate derivation! Correct answer.'
                      : `Key: (${currentQ.correctAnswer})`}
                  </span>
                </div>
                <p className="leading-relaxed text-stone-600 dark:text-stone-300">
                  {currentQ.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Action: Next Button */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-1 flex justify-end"
            >
              <button
                onClick={handleNext}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-2xs cursor-pointer"
              >
                <span>{currentIndex + 1 < drillQuestions.length ? 'Next Question' : 'Finish Drill'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </motion.div>
      ) : (
        /* ─── Ultra-Sleek Drill Set Completion & 4-Subject Breakdown ─── */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#181a1c] p-5 sm:p-6 text-center space-y-4 shadow-2xs my-auto"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                Drill Set Completed
              </h2>
              <span className="inline-flex items-center justify-center h-5 px-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-200/60 dark:border-emerald-800/60">
                {drillMode === 'mixed4' ? '4-Subject 40Q' : `${drillQuestions.length}Q`}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {correctCount} of {drillQuestions.length} answered correctly ({Math.round((correctCount / drillQuestions.length) * 100)}% accuracy).
            </p>
          </div>

          {/* 4 Subjects Performance Grid (if mixed4 mode) */}
          {drillMode === 'mixed4' && (
            <div className="grid grid-cols-2 gap-2 text-left pt-1">
              {candidate4SubjectIds.map((subjId) => {
                const subObj = subjects.find((s) => s.id === subjId);
                const score = subjectScoreTracker[subjId] || { correct: 0, total: 10 };
                const pct = Math.round((score.correct / (score.total || 10)) * 100);

                return (
                  <div
                    key={subjId}
                    className="p-2.5 rounded-2xl bg-stone-50 dark:bg-[#121314] border border-stone-100 dark:border-stone-800/80 space-y-0.5"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                      <span className="truncate">{subObj?.name || subjId}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{pct}%</span>
                    </div>
                    <div className="text-xs font-serif font-bold text-stone-900 dark:text-white">
                      {score.correct} / {score.total || 10} Correct
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Overall Metrics Cards */}
          <div className="grid grid-cols-2 gap-2.5 py-1">
            <div className="rounded-2xl bg-stone-50 dark:bg-[#121314] p-3 border border-stone-100 dark:border-stone-800/60">
              <span className="text-[10px] uppercase text-stone-400 block font-mono">Score</span>
              <span className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                {correctCount} / {drillQuestions.length}
              </span>
            </div>
            <div className="rounded-2xl bg-stone-50 dark:bg-[#121314] p-3 border border-stone-100 dark:border-stone-800/60">
              <span className="text-[10px] uppercase text-stone-400 block font-mono">Accuracy</span>
              <span className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round((correctCount / drillQuestions.length) * 100)}%
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={handleRestart}
              className="w-full py-3 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Drill Another Fresh 40Q Set</span>
            </button>

            <button
              onClick={() => {
                playTapSound();
                onNavigateToAnalytics();
              }}
              className="w-full py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              View Probability Diagnostics
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
