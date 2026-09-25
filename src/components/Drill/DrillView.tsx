import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, Subject, Department } from '../../types';
import { playCorrectSound, playIncorrectSound, playTapSound, playCompleteSound } from '../../utils/audio';
import { isSubjectAccessible } from '../../utils/departmentAccess';
import {
  Timer,
  Pause,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bookmark,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Layers,
  ArrowRight,
  BookOpen,
  Lock,
} from 'lucide-react';
import { QuestionIngestionModal } from '../Modals/QuestionIngestionModal';
import { ScreenGuideSheet, InfoTrigger, ScreenGuideContent } from '../Modals/ScreenGuideSheet';
import { SensoryPacingHUD } from './SensoryPacingHUD';

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

export const DrillView: React.FC<DrillViewProps> = ({
  questions,
  subjects,
  activeSubjectId,
  onSubjectChange,
  onRecordResult,
  onNavigateToAnalytics,
  dailyQuestionsAnswered = 0,
  dailyGoal = 50,
  userDepartment = 'Sciences',
  englishUnlocked = false,
  onIngestQuestions,
}) => {
  // Filter questions for the chosen subject, fallback to all if empty
  const subjectQuestions = questions.filter(
    (q) => activeSubjectId === 'all' || q.subjectId === activeSubjectId
  );
  const activeQuestions = subjectQuestions.length > 0 ? subjectQuestions : questions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isFlagged, setIsFlagged] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);
  const [activeGuide, setActiveGuide] = useState<ScreenGuideContent | null>(null);
  const [activeKeyHighlight, setActiveKeyHighlight] = useState<string | null>(null);

  // Local daily count tracker (starting at dailyQuestionsAnswered)
  const [todayDrillCount, setTodayDrillCount] = useState(dailyQuestionsAnswered);

  // Session tallies
  const [correctCount, setCorrectCount] = useState(0);
  const [drillCompleted, setDrillCompleted] = useState(false);
  const [flashColor, setFlashColor] = useState<'none' | 'green' | 'red'>('none');

  const currentQ = activeQuestions[currentIndex] || activeQuestions[0];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTimeUp = () => {
    if (!isAnswered && currentQ) {
      setIsAnswered(true);
      playIncorrectSound();
      setFlashColor('red');
      onRecordResult(false, currentQ.subjectId);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (isTimerRunning && !isAnswered && !drillCompleted && timeLeft > 0 && currentQ) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isAnswered, drillCompleted, timeLeft, currentQ?.subjectId]);

  // Reset when question index changes
  const resetQuestionState = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setTimeLeft(45);
    setIsTimerRunning(true);
    setFlashColor('none');
  };

  const handleSelectOption = (optionId: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered || !currentQ) return;

    setSelectedOption(optionId);
    setIsAnswered(true);
    setIsTimerRunning(false);

    const isCorrect = optionId === currentQ.correctAnswer;
    setTodayDrillCount((prev) => prev + 1);

    if (isCorrect) {
      playCorrectSound();
      setFlashColor('green');
      setCorrectCount((prev) => prev + 1);
      onRecordResult(true, currentQ.subjectId);
    } else {
      playIncorrectSound();
      setFlashColor('red');
      onRecordResult(false, currentQ.subjectId);
    }
  };

  const handleNext = () => {
    playTapSound();
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      resetQuestionState();
    } else {
      setDrillCompleted(true);
      playCompleteSound();
    }
  };

  const handleRestart = () => {
    playTapSound();
    setCurrentIndex(0);
    setCorrectCount(0);
    setDrillCompleted(false);
    resetQuestionState();
  };

  // Keyboard shortcut listener (Authentic JAMB 8-key shortcut engine: A, B, C, D, N, P, R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName) || isIngestionOpen) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        setActiveKeyHighlight(key);
        setTimeout(() => setActiveKeyHighlight(null), 300);
        handleSelectOption(key as 'A' | 'B' | 'C' | 'D');
      } else if (key === 'N') {
        setActiveKeyHighlight('N');
        setTimeout(() => setActiveKeyHighlight(null), 300);
        if (isAnswered) {
          handleNext();
        }
      } else if (key === 'P') {
        setActiveKeyHighlight('P');
        setTimeout(() => setActiveKeyHighlight(null), 300);
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
          resetQuestionState();
        }
      } else if (key === 'R') {
        setActiveKeyHighlight('R');
        setTimeout(() => setActiveKeyHighlight(null), 300);
        setIsFlagged((prev) => !prev);
        playTapSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, isIngestionOpen, currentIndex, activeQuestions.length]);

  const activeSubject = subjects.find((s) => s.id === activeSubjectId) || {
    id: 'all',
    name: 'All Subjects Mixed',
  };

  const progressPercentage = activeQuestions.length > 0
    ? Math.round(((currentIndex + (isAnswered ? 1 : 0)) / activeQuestions.length) * 100)
    : 0;

  if (activeQuestions.length === 0 || !currentQ) {
    return (
      <div className="w-full pb-28 pt-8 px-4 space-y-6 animate-fadeIn">
        <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-8 sm:p-12 text-center paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800/50 text-stone-400">
            <BookOpen className="h-8 w-8 text-stone-400" strokeWidth={1.2} />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h2 className="font-editorial text-2xl font-normal text-stone-900 dark:text-stone-100">
              No Questions Found
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-ui leading-relaxed">
              No syllabus questions are currently active in this filter. Switch to all subjects to continue drilling.
            </p>
          </div>
          <button
            onClick={() => onSubjectChange('all')}
            className="btn-matte px-5 py-2.5 rounded-xl text-xs font-semibold font-ui shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <span>Reset to All Subjects</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-28 pt-4 px-4 space-y-4 animate-fadeIn">
      {/* Daily Quota Tracker Strip with Machined Edge */}
      <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-3.5 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 font-ui">
              Daily Target: {dailyGoal} Questions
            </span>
            <InfoTrigger
              onClick={() =>
                setActiveGuide({
                  title: 'Timed Question Drills',
                  subtitle: 'Tactile Examination Conditioning',
                  badge: 'Drill Protocol',
                  icon: Timer,
                  description: [
                    'High-yield UTME question drilling featuring instantaneous acoustic feedback and step-by-step rationales.',
                    'Each drill tracks response velocity against the 45-second per question official CBT benchmark.',
                  ],
                  tips: [
                    'Study Pass unlocks the Use of English question repository across comprehension and lexis.',
                    'Review detailed explanations immediately after answering to imprint correct concepts before moving forward.',
                  ],
                })
              }
              label="View Drill Guide"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-medium text-stone-700 dark:text-stone-300 font-mono tabular-nums">
              {todayDrillCount} / {dailyGoal} Qs
            </span>
            <button
              onClick={() => {
                playTapSound();
                setIsIngestionOpen(true);
              }}
              className="text-[10px] font-medium text-stone-600 dark:text-stone-300 border border-stone-200/70 dark:border-stone-700/60 bg-transparent px-2.5 py-1 rounded-full transition-all hover:opacity-90 active:scale-[0.98] duration-200 ease-out font-ui cursor-pointer"
              title="Ingest & view 20,000 question repository"
            >
              20k Bank
            </button>
          </div>
        </div>

        {/* Minimal Progress Track */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800/80">
          <div
            className="h-full rounded-full bg-stone-900 dark:bg-stone-100 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.round((todayDrillCount / dailyGoal) * 100))}%` }}
          />
        </div>
      </div>

      {/* Top Bar: Subject Selector Pill & Timer */}
      <div className="flex items-center justify-between">
        {/* Subject Switcher with Ghost Badge & Machined Edge */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSubjectMenu(!showSubjectMenu);
              playTapSound();
            }}
            className="flex items-center gap-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] px-3 py-1.5 text-xs font-medium text-stone-900 dark:text-stone-100 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 hover:opacity-90 active:scale-[0.98] duration-200 ease-out transition-all font-ui cursor-pointer"
          >
            <Layers className="h-3.5 w-3.5 text-stone-600 dark:text-stone-400" strokeWidth={1.5} />
            <span className="truncate max-w-[130px]">{activeSubject.name}</span>
            <ChevronDown className="h-3 w-3 text-stone-400" strokeWidth={1.5} />
          </button>

          {showSubjectMenu && (
            <div className="absolute left-0 top-full z-30 mt-1.5 w-64 max-h-72 overflow-y-auto rounded-2xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-1.5 paper-shadow-lifted ring-1 ring-inset ring-black/5 dark:ring-white/10 no-scrollbar">
              <button
                onClick={() => {
                  onSubjectChange('all');
                  setShowSubjectMenu(false);
                  setCurrentIndex(0);
                  resetQuestionState();
                  playTapSound();
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-ui transition-all active:scale-[0.98] duration-200 ease-out cursor-pointer ${
                  activeSubjectId === 'all'
                    ? 'bg-stone-100 dark:bg-stone-800/60 font-semibold text-stone-900 dark:text-stone-100'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/30'
                }`}
              >
                All Department Subjects Mixed
              </button>
              {subjects.map((s) => {
                const accessible = isSubjectAccessible(s, userDepartment, englishUnlocked);
                const isEnglish = s.id === 'english' || s.name === 'Use of English';

                return (
                  <button
                    key={s.id}
                    disabled={!accessible}
                    onClick={() => {
                      if (!accessible) {
                        playIncorrectSound();
                        return;
                      }
                      onSubjectChange(s.id);
                      setShowSubjectMenu(false);
                      setCurrentIndex(0);
                      resetQuestionState();
                      playTapSound();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-ui transition-all active:scale-[0.98] duration-200 ease-out cursor-pointer ${
                      activeSubjectId === s.id
                        ? 'bg-stone-100 dark:bg-stone-800/60 font-semibold text-stone-900 dark:text-stone-100'
                        : accessible
                        ? 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/30'
                        : 'text-stone-400 dark:text-stone-600 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span className="truncate">{s.name}</span>
                    {isEnglish ? (
                      englishUnlocked ? (
                        <span className="text-[10px] uppercase font-mono font-medium text-emerald-600 dark:text-emerald-400">
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-mono text-stone-400 flex items-center gap-1">
                          <Lock className="h-2.5 w-2.5" strokeWidth={1.5} />
                          <span>Locked</span>
                        </span>
                      )
                    ) : !accessible ? (
                      <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5" strokeWidth={1.5} />
                        <span>{s.category}</span>
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Timer with Tabular Figures & Ghost Styling */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono tabular-nums transition-colors border ring-1 ring-inset ring-black/5 dark:ring-white/10 ${
              timeLeft <= 10
                ? 'bg-red-50/50 dark:bg-red-950/30 border-red-300/50 dark:border-red-800/40 text-red-600 dark:text-red-400 font-semibold animate-pulse'
                : 'bg-white dark:bg-[#1a1c1e] border-stone-200/70 dark:border-stone-800/70 text-stone-800 dark:text-stone-200 paper-shadow'
            }`}
          >
            <Timer className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
            <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
          </div>

          <button
            onClick={() => {
              setIsTimerRunning(!isTimerRunning);
              playTapSound();
            }}
            disabled={isAnswered}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] text-stone-500 dark:text-stone-400 hover:opacity-90 active:scale-[0.98] duration-200 ease-out paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 transition-all cursor-pointer"
            title={isTimerRunning ? 'Pause timer' : 'Resume timer'}
          >
            {isTimerRunning ? (
              <Pause className="h-3 w-3" strokeWidth={1.5} />
            ) : (
              <Play className="h-3 w-3" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Top Animated Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-stone-500 font-ui">
          <span>
            Question <strong className="font-mono tabular-nums text-stone-800 dark:text-stone-200">{currentIndex + 1}</strong> of <span className="font-mono tabular-nums">{activeQuestions.length}</span>
          </span>
          <span className="font-mono tabular-nums font-medium text-stone-800 dark:text-stone-200">
            {progressPercentage}% Completed
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800/80">
          <div
            className="h-full rounded-full bg-stone-900 dark:bg-stone-100 transition-all duration-[1200ms] ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Zenith Sensory Pacing & Binaural Focus Room */}
      <SensoryPacingHUD
        currentQuestionTime={45 - timeLeft}
        targetTime={45}
        totalElapsedSeconds={Math.max(15, (currentIndex + 1) * 38)}
        questionsAnsweredCount={currentIndex + 1}
        activeKeyHighlight={activeKeyHighlight}
      />

      {/* Main Flashcard Container with Machined Edge & Spatial Motion Transition */}
      {!drillCompleted ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={`relative rounded-2xl border bg-white dark:bg-[#1a1c1e] p-5 sm:p-6 transition-colors duration-300 paper-shadow-lifted ring-1 ring-inset ring-black/5 dark:ring-white/10 ${
              flashColor === 'green'
                ? 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/20'
                : flashColor === 'red'
                ? 'border-red-500 dark:border-red-400 ring-2 ring-red-500/20 animate-shake bg-red-50/10 dark:bg-red-950/20'
                : 'border-stone-200/70 dark:border-stone-800/70'
            }`}
          >
          {/* Flashcard Header: Syllabus topic and Bookmark */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-ui">
              <span className="font-semibold text-stone-900 dark:text-stone-100">
                {currentQ.subjectName}
              </span>
              <span>·</span>
              <span className="truncate max-w-[170px]">{currentQ.syllabusTopic}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setShowHint(!showHint);
                  playTapSound();
                }}
                className={`p-1.5 rounded-lg text-xs font-ui transition-all active:scale-[0.98] duration-200 ease-out cursor-pointer ${
                  showHint
                    ? 'text-amber-700 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-950/40'
                    : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:opacity-90'
                }`}
                title="View syllabus hint"
              >
                <HelpCircle className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => {
                  setIsFlagged(!isFlagged);
                  playTapSound();
                }}
                className={`p-1.5 rounded-lg transition-all active:scale-[0.98] duration-200 ease-out cursor-pointer ${
                  isFlagged
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:opacity-90'
                }`}
                title="Bookmark question"
              >
                <Bookmark
                  className="h-4 w-4"
                  strokeWidth={1.5}
                  fill={isFlagged ? 'currentColor' : 'none'}
                />
              </button>
            </div>
          </div>

          {/* Hint Dropdown */}
          {showHint && (
            <div className="my-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800/60 p-3 text-xs text-stone-700 dark:text-stone-300 font-ui flex items-start gap-2.5 ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" strokeWidth={1.5} />
              <div>
                <span className="font-semibold text-stone-900 dark:text-stone-100">Syllabus Guide:</span> Apply standard concord, fundamental principles, and verified examination rules.
              </div>
            </div>
          )}

          {/* Question Text */}
          <div className="py-4">
            {currentQ.year && (
              <span className="inline-block text-[10px] font-mono font-medium text-stone-400 uppercase tracking-widest mb-1">
                {currentQ.year}
              </span>
            )}
            <h2 className="font-editorial text-lg sm:text-xl font-normal leading-relaxed text-stone-900 dark:text-stone-100 whitespace-pre-line">
              {currentQ.text}
            </h2>
          </div>

          {/* 4 Tactile Options (A-D) with Machined Edges */}
          <div className="space-y-2.5 pt-1">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const isCorrectOpt = opt.id === currentQ.correctAnswer;

              let buttonStyle =
                'border-stone-200/70 dark:border-stone-800/70 bg-stone-50/50 dark:bg-stone-900/40 text-stone-800 dark:text-stone-200 hover:border-stone-400 dark:hover:border-stone-600 active:scale-[0.98]';
              let badgeStyle = 'bg-white dark:bg-[#1a1c1e] border-stone-200/70 dark:border-stone-700 text-stone-600 dark:text-stone-400';

              if (isAnswered) {
                if (isCorrectOpt) {
                  buttonStyle =
                    'border-emerald-500 dark:border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium shadow-xs';
                  badgeStyle = 'bg-emerald-600 border-emerald-600 text-white';
                } else if (isSelected && !isCorrectOpt) {
                  buttonStyle =
                    'border-red-400 dark:border-red-500 bg-red-50/60 dark:bg-red-950/40 text-red-900 dark:text-red-200 font-medium';
                  badgeStyle = 'bg-red-600 border-red-600 text-white';
                } else {
                  buttonStyle = 'border-stone-200/40 dark:border-stone-800/40 bg-stone-50/30 dark:bg-stone-900/20 text-stone-400 dark:text-stone-600 opacity-60';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={isAnswered}
                  className={`flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all duration-200 ease-out min-h-[50px] cursor-pointer ring-1 ring-inset ring-black/5 dark:ring-white/10 ${buttonStyle}`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-mono font-semibold transition-colors ring-1 ring-inset ring-black/5 dark:ring-white/10 ${badgeStyle}`}
                  >
                    {opt.id}
                  </div>
                  <span className="flex-1 font-ui text-[13px] sm:text-sm leading-snug">
                    {opt.text}
                  </span>
                  {isAnswered && isCorrectOpt && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                  )}
                  {isAnswered && isSelected && !isCorrectOpt && (
                    <XCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" strokeWidth={1.5} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box on Answer */}
          {isAnswered && (
            <div className="mt-5 rounded-xl border border-stone-200/70 dark:border-stone-800/70 bg-stone-50/70 dark:bg-stone-900/50 p-4 text-xs font-ui animate-fadeIn space-y-2 ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <div className="flex items-center justify-between">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-stone-900 dark:text-stone-100">
                  Official Solution
                </span>
                <span
                  className={`text-xs font-mono font-medium ${
                    selectedOption === currentQ.correctAnswer
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-red-700 dark:text-red-400'
                  }`}
                >
                  {selectedOption === currentQ.correctAnswer ? '+1 Mark Earned' : 'Reviewed'}
                </span>
              </div>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed font-ui text-[13px]">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Action Footer: Next Question (Rich Matte Button) */}
          {isAnswered && (
            <div className="mt-4 pt-3 flex items-center justify-end">
              <button
                onClick={handleNext}
                className="btn-matte flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-xs font-ui cursor-pointer"
              >
                <span>
                  {currentIndex + 1 < activeQuestions.length ? 'Next Question' : 'Complete Drill'}
                </span>
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          )}
          </motion.div>
        </AnimatePresence>
      ) : (
        /* Drill Completion Card with Machined Edge */
        <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 text-center paper-shadow-lifted ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-5 animate-fadeIn">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 ring-1 ring-inset ring-black/5 dark:ring-white/10">
            <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
          </div>

          <div className="space-y-1">
            <h2 className="font-editorial text-2xl font-normal text-stone-900 dark:text-stone-100">
              Drill Set Completed
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-ui">
              Performance verified and synced to your readiness index.
            </p>
          </div>

          {/* Score Grid with Tabular Numerals */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="rounded-xl border border-stone-200/70 dark:border-stone-800/70 bg-stone-50/50 dark:bg-stone-900/40 p-3 ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <span className="text-[10px] uppercase font-mono font-medium text-stone-400 block">
                Score
              </span>
              <span className="font-mono text-xl font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
                {correctCount}/{activeQuestions.length}
              </span>
            </div>

            <div className="rounded-xl border border-stone-200/70 dark:border-stone-800/70 bg-stone-50/50 dark:bg-stone-900/40 p-3 ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <span className="text-[10px] uppercase font-mono font-medium text-stone-400 block">
                Accuracy
              </span>
              <span className="font-mono text-xl font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {Math.round((correctCount / activeQuestions.length) * 100)}%
              </span>
            </div>

            <div className="rounded-xl border border-stone-200/70 dark:border-stone-800/70 bg-stone-50/50 dark:bg-stone-900/40 p-3 ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <span className="text-[10px] uppercase font-mono font-medium text-stone-400 block">
                Readiness
              </span>
              <span className="font-mono text-xl font-semibold text-stone-800 dark:text-stone-200 tabular-nums">
                +3.5%
              </span>
            </div>
          </div>

          {/* Action Buttons: Rich Matte Finish & Tactile Physics */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleRestart}
              className="btn-matte flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold shadow-xs font-ui cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
              <span>Drill Another Set</span>
            </button>

            <button
              onClick={() => {
                playTapSound();
                onNavigateToAnalytics();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] py-3 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:opacity-90 active:scale-[0.98] duration-200 ease-out font-ui transition-all cursor-pointer ring-1 ring-inset ring-black/5 dark:ring-white/10"
            >
              <span>View Updated Analytics</span>
              <ArrowRight className="h-4 w-4 text-stone-400" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* 20,000 Question Ingestion Modal */}
      <QuestionIngestionModal
        isOpen={isIngestionOpen}
        onClose={() => setIsIngestionOpen(false)}
        subjects={subjects}
        onIngestQuestions={onIngestQuestions}
      />

      {/* Screen Guide Bottom Sheet */}
      <ScreenGuideSheet
        isOpen={activeGuide !== null}
        onClose={() => setActiveGuide(null)}
        guide={activeGuide}
      />
    </div>
  );
};
