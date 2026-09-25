'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, Subject, Department } from '../../types';
import { playCorrectSound, playIncorrectSound, playTapSound, playCompleteSound } from '../../utils/audio';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Volume2,
  VolumeX,
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

export const DrillView: React.FC<DrillViewProps> = ({
  questions,
  subjects,
  activeSubjectId,
  onSubjectChange,
  onRecordResult,
  onNavigateToAnalytics,
}) => {
  const subjectQuestions = questions.filter(
    (q) => activeSubjectId === 'all' || q.subjectId === activeSubjectId
  );
  const activeQuestions = subjectQuestions.length > 0 ? subjectQuestions : questions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [drillCompleted, setDrillCompleted] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentQ = activeQuestions[currentIndex] || activeQuestions[0];
  const activeSubject = subjects.find((s) => s.id === activeSubjectId) || {
    id: 'all',
    name: 'Use of English',
  };

  // Reset state on card change
  const resetQuestionState = useCallback(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsShaking(false);
    setShowHint(false);
    setIsSpeaking(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  useEffect(() => {
    resetQuestionState();
  }, [currentIndex, activeSubjectId, resetQuestionState]);

  // Voice narration with natural voice selection
  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    playTapSound();
    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.92;
    utterance.pitch = 1.02;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        (v.name.includes('Natural') ||
          v.name.includes('Google UK English Female') ||
          v.name.includes('Google US English') ||
          v.name.includes('Sonia') ||
          v.name.includes('Samantha') ||
          v.name.includes('Victoria')) &&
        v.lang.startsWith('en')
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

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
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
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

  // Keyboard navigation: 1-4 or A-D to select, Space/Enter to advance
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
  }, [isAnswered, currentIndex, activeQuestions.length]);

  if (!currentQ) {
    return (
      <div className="w-full max-w-lg mx-auto py-12 px-4 text-center text-xs text-stone-500">
        No questions available for this subject.
      </div>
    );
  }

  const isSelectedCorrect = selectedOption === currentQ.correctAnswer;

  return (
    <div className="w-full flex-1 flex flex-col justify-between px-3 sm:px-4 py-2 max-w-lg mx-auto select-none">
      {/* Whisper-Thin Top Meta & Progress */}
      <div className="space-y-2 mb-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-900 dark:text-white uppercase tracking-wider text-[11px]">
            {activeSubject.name}
          </span>
          <span className="text-[11px] font-mono text-stone-400">
            {currentIndex + 1} / {activeQuestions.length}
          </span>
        </div>

        {/* Progress line */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-1 rounded-full overflow-hidden">
          <motion.div
            className="bg-stone-900 dark:bg-white h-full rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentIndex + (isAnswered ? 1 : 0.3)) / activeQuestions.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Card Container */}
      {!drillCompleted ? (
        <motion.div
          animate={isShaking ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.35 }}
          className="flex-1 flex flex-col justify-between space-y-3"
        >
          {/* Question Prompt Card */}
          <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#181a1c] p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                {currentQ.syllabusTopic || 'Core Concept'}
              </span>
              <button
                type="button"
                onClick={() => handleSpeak(currentQ.text)}
                className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                title="Read aloud"
              >
                {isSpeaking ? (
                  <VolumeX className="w-4 h-4 text-[#c2410c] animate-pulse" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </div>

            <h2 className="font-serif text-lg sm:text-xl font-semibold leading-relaxed text-stone-900 dark:text-white">
              {currentQ.text}
            </h2>
          </div>

          {/* 4 Tactile Option Tiles */}
          <div className="space-y-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === opt.id;
              const isCorrectOpt = opt.id === currentQ.correctAnswer;

              let style =
                'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#181a1c] text-stone-900 dark:text-white hover:border-stone-400';

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
                  className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start gap-3 ${style}`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                      isAnswered && isCorrectOpt
                        ? 'bg-emerald-600 text-white'
                        : isAnswered && isSelected && !isCorrectOpt
                        ? 'bg-red-600 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span className="text-sm font-medium pt-0.5 flex-1 leading-snug">{opt.text}</span>
                  <span className="text-[10px] text-stone-400 font-mono hidden sm:inline opacity-60">
                    [{idx + 1}]
                  </span>
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
                className={`rounded-2xl border p-4 text-xs space-y-1.5 overflow-hidden ${
                  isSelectedCorrect
                    ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                    : 'border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 text-stone-800 dark:text-stone-200'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5">
                    {isSelectedCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-600" />
                    )}
                    {isSelectedCorrect
                      ? 'Spot on! Correct answer.'
                      : `Correct answer: (${currentQ.correctAnswer})`}
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
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                <span>{currentIndex + 1 < activeQuestions.length ? 'Next Question' : 'Finish Drill'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </motion.div>
      ) : (
        /* Clean Completion Victory Card */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#181a1c] p-6 text-center space-y-5 shadow-sm my-auto"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
              Drill Set Completed
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Your results are synced to your 250+ Probability Index.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="rounded-2xl bg-[#f9f9f8] dark:bg-[#121314] p-3.5">
              <span className="text-[10px] uppercase text-stone-400 block font-mono">Score</span>
              <span className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                {correctCount} / {activeQuestions.length}
              </span>
            </div>
            <div className="rounded-2xl bg-[#f9f9f8] dark:bg-[#121314] p-3.5">
              <span className="text-[10px] uppercase text-stone-400 block font-mono">Accuracy</span>
              <span className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round((correctCount / activeQuestions.length) * 100)}%
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleRestart}
              className="w-full py-3.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Drill Another Round</span>
            </button>
            <button
              onClick={() => {
                playTapSound();
                onNavigateToAnalytics();
              }}
              className="w-full py-3 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors"
            >
              View 250+ Probability
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
