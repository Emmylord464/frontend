'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lightbulb,
  Clock,
  BookOpen,
  Volume2,
  VolumeX,
  Keyboard,
  Award,
} from 'lucide-react';
import type { Flashcard } from '@/lib/constants/initial-decks';
import { SocraticHintDrawer } from '@/components/SocraticHintDrawer';
import { playCorrectSound, playIncorrectSound, playTapSound } from '@/utils/audio';

interface FlashcardPlayerProps {
  cards: Flashcard[];
  currentIndex: number;
  onRecordResult: (params: {
    flashcardId: string;
    topicSlug: string;
    isCorrect: boolean;
    timeSpentSeconds: number;
    selectedOption?: string;
  }) => void;
  onNextCard: () => void;
  onFinishWorkout: () => void;
  subjectTitle?: string;
}

export const FlashcardPlayer: React.FC<FlashcardPlayerProps> = ({
  cards,
  currentIndex,
  onRecordResult,
  onNextCard,
  onFinishWorkout,
  subjectTitle = 'Use of English',
}) => {
  const currentCard = cards[currentIndex] || cards[0];
  const isLastCard = currentIndex >= cards.length - 1;

  // State
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedOptionKey, setSelectedOptionKey] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Simulated Spaced Repetition Mastery Level (1 to 4)
  const [masteryLevel, setMasteryLevel] = useState(1);

  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Per-card reset
  useEffect(() => {
    setIsFlipped(false);
    setSelectedOptionKey(null);
    setIsAnswered(false);
    setIsShaking(false);
    setTimeSpentSeconds(0);
    setIsSpeaking(false);
    startTimeRef.current = Date.now();

    // Cancel speech on card change
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    timerRef.current = setInterval(() => {
      setTimeSpentSeconds(Math.round((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentIndex]);

  // Text-To-Speech (Vocabulary.com style pronunciation/reading)
  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*_]/g, ''));
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Flip card handler
  const handleFlip = useCallback(() => {
    playTapSound();
    setIsFlipped((prev) => !prev);
  }, []);

  // Flip card answer self-assessment
  const handleFlipSelfAssess = useCallback(
    (known: boolean) => {
      if (isAnswered) return;
      setIsAnswered(true);
      if (timerRef.current) clearInterval(timerRef.current);

      if (known) {
        playCorrectSound();
        setMasteryLevel((prev) => Math.min(4, prev + 1));
      } else {
        playIncorrectSound();
        setMasteryLevel((prev) => Math.max(1, prev - 1));
      }

      onRecordResult({
        flashcardId: currentCard.id,
        topicSlug: currentCard.topicSlug,
        isCorrect: known,
        timeSpentSeconds: Math.max(1, timeSpentSeconds),
      });
    },
    [isAnswered, currentCard, onRecordResult, timeSpentSeconds]
  );

  // Interactive drill option select handler
  const handleSelectOption = useCallback(
    (key: 'A' | 'B' | 'C' | 'D') => {
      if (isAnswered) return;
      setSelectedOptionKey(key);
      setIsAnswered(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const chosenOption = currentCard.options?.find((opt) => opt.key === key);
      const correct = chosenOption?.isCorrect ?? false;

      if (correct) {
        playCorrectSound();
        setMasteryLevel((prev) => Math.min(4, prev + 1));
      } else {
        playIncorrectSound();
        setIsShaking(true);
        setMasteryLevel((prev) => Math.max(1, prev - 1));
        setTimeout(() => setIsShaking(false), 500);
      }

      onRecordResult({
        flashcardId: currentCard.id,
        topicSlug: currentCard.topicSlug,
        isCorrect: correct,
        timeSpentSeconds: Math.max(1, timeSpentSeconds),
        selectedOption: key,
      });
    },
    [isAnswered, currentCard, onRecordResult, timeSpentSeconds]
  );

  const handleContinue = useCallback(() => {
    playTapSound();
    if (isLastCard) {
      onFinishWorkout();
    } else {
      onNextCard();
    }
  }, [isLastCard, onFinishWorkout, onNextCard]);

  // Keyboard navigation (1-4 for options, Space/Enter to advance/flip, H for hint)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (currentCard.cardType === 'interactive_drill' && !isAnswered) {
        if (e.key === '1' || e.key.toUpperCase() === 'A') handleSelectOption('A');
        if (e.key === '2' || e.key.toUpperCase() === 'B') handleSelectOption('B');
        if (e.key === '3' || e.key.toUpperCase() === 'C') handleSelectOption('C');
        if (e.key === '4' || e.key.toUpperCase() === 'D') handleSelectOption('D');
      }

      if (currentCard.cardType === 'flashcard_flip') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (!isFlipped) handleFlip();
        }
        if (isFlipped && !isAnswered) {
          if (e.key === '1' || e.key.toLowerCase() === 'x') handleFlipSelfAssess(false);
          if (e.key === '2' || e.key.toLowerCase() === 'c') handleFlipSelfAssess(true);
        }
      }

      if (isAnswered && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleContinue();
      }

      if (e.key.toLowerCase() === 'h') {
        setIsHintOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentCard.cardType,
    isAnswered,
    isFlipped,
    handleSelectOption,
    handleFlip,
    handleFlipSelfAssess,
    handleContinue,
  ]);

  if (!currentCard) {
    return (
      <div className="p-8 text-center text-sm text-[#747878] dark:text-[#9ca3af]">
        No cards available for this session.
      </div>
    );
  }

  const isFlipType = currentCard.cardType === 'flashcard_flip';
  const chosenOpt = currentCard.options?.find((o) => o.key === selectedOptionKey);
  const correctOpt = currentCard.options?.find((o) => o.isCorrect);
  const isSelectedCorrect = chosenOpt?.isCorrect;

  return (
    <div className="mx-auto w-full max-w-lg flex flex-col flex-1 px-3 sm:px-4 py-2 select-none">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between mb-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#1a1c1c] dark:text-white uppercase tracking-wider text-[11px]">
            {subjectTitle}
          </span>
          <span className="text-[#d5d5d3] dark:text-[#333638]">•</span>
          <span className="text-[#747878] dark:text-[#9ca3af] capitalize text-[11px] truncate max-w-[140px]">
            {currentCard.topicSlug.replace(/-/g, ' ')}
          </span>
        </div>

        {/* Vocabulary.com 4-Dot Mastery Meter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#f3f4f3] dark:bg-[#1f2224] px-2 py-1 rounded-full text-[10px] text-[#747878] dark:text-[#9ca3af]">
            <Award className="w-3 h-3 text-[#c2410c]" />
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4].map((dot) => (
                <span
                  key={dot}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    dot <= masteryLevel
                      ? 'bg-[#c2410c] scale-110'
                      : 'bg-[#d5d5d3] dark:bg-[#333638]'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 font-mono text-[#747878] dark:text-[#9ca3af] text-[11px]">
            <Clock className="w-3 h-3 text-[#c2410c]" />
            <span>{timeSpentSeconds}s</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#e5e5e3] dark:bg-[#282b2e] h-1.5 rounded-full overflow-hidden mb-3">
        <motion.div
          className="bg-[#1a1c1c] dark:bg-white h-full rounded-full"
          initial={{ width: 0 }}
          animate={{
            width: `${((currentIndex + (isAnswered ? 1 : 0.35)) / cards.length) * 100}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Flashcard Container with Spring Physics */}
      <motion.div
        animate={isShaking ? { x: [-10, 10, -7, 7, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col flex-1"
      >
        {/* FLASHCARD FLIP MODE */}
        {isFlipType ? (
          <div className="flex flex-col flex-1">
            <motion.div
              onClick={handleFlip}
              className="relative cursor-pointer min-h-[300px] sm:min-h-[340px] rounded-3xl border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#181a1c] p-6 shadow-sm hover:border-[#1a1c1c]/40 dark:hover:border-white/40 transition-all flex flex-col justify-between"
              whileTap={{ scale: 0.985 }}
            >
              <div className="flex items-center justify-between text-xs text-[#747878] dark:text-[#9ca3af]">
                <span className="px-2 py-0.5 rounded-md bg-[#f3f4f3] dark:bg-[#222528] font-medium text-[10px] uppercase tracking-wider">
                  Active Recall Flip
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(isFlipped ? currentCard.backAnswer : currentCard.frontPrompt);
                    }}
                    className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
                    title="Pronounce prompt"
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-4 h-4 text-[#c2410c] animate-pulse" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <span className="flex items-center gap-1 text-[11px] text-[#c2410c] font-medium">
                    <RotateCcw className="w-3 h-3" /> Tap to flip
                  </span>
                </div>
              </div>

              {/* Card Prompt / Answer */}
              <div className="my-auto py-4 text-center">
                <AnimatePresence mode="wait">
                  {!isFlipped ? (
                    <motion.div
                      key="front"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="space-y-2"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#747878] dark:text-[#9ca3af]">
                        Question Prompt
                      </span>
                      <p className="font-serif text-xl sm:text-2xl font-semibold leading-relaxed text-[#1a1c1c] dark:text-white">
                        {currentCard.frontPrompt}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="back"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="space-y-3"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#059669]">
                        Verified Answer
                      </span>
                      <p className="font-serif text-lg sm:text-xl font-medium leading-relaxed text-[#1a1c1c] dark:text-white">
                        {currentCard.backAnswer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Textbook Citation Tag */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#747878] dark:text-[#9ca3af] italic">
                <BookOpen className="w-3.5 h-3.5 text-[#c2410c] shrink-0" />
                <span className="truncate">{currentCard.textbookRef.split(',')[0]}</span>
              </div>
            </motion.div>

            {/* Flip Mode Assessment Controls */}
            {isFlipped && !isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 grid grid-cols-2 gap-3"
              >
                <button
                  onClick={() => handleFlipSelfAssess(false)}
                  className="py-3 px-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  Still Learning [1]
                </button>
                <button
                  onClick={() => handleFlipSelfAssess(true)}
                  className="py-3 px-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Got It Right [2]
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          /* INTERACTIVE 4-OPTION DRILL MODE (Vocabulary.com style) */
          <div className="flex flex-col flex-1 space-y-3">
            {/* Question Prompt Card */}
            <div className="rounded-3xl border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#181a1c] p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 text-xs text-[#747878] dark:text-[#9ca3af]">
                <span className="px-2 py-0.5 rounded-md bg-[#f3f4f3] dark:bg-[#222528] font-medium text-[10px] uppercase tracking-wider">
                  Micro-Drill • Card {currentIndex + 1} of {cards.length}
                </span>
                <button
                  type="button"
                  onClick={() => handleSpeak(currentCard.frontPrompt)}
                  className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
                  title="Read aloud"
                >
                  {isSpeaking ? (
                    <VolumeX className="w-4 h-4 text-[#c2410c] animate-pulse" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              <p className="font-serif text-lg sm:text-xl font-semibold leading-relaxed text-[#1a1c1c] dark:text-white">
                {currentCard.frontPrompt}
              </p>
            </div>

            {/* 4 Tactile Options */}
            <div className="space-y-2">
              {currentCard.options?.map((option, index) => {
                const isSelected = selectedOptionKey === option.key;
                let optionStyle =
                  'border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#181a1c] text-[#1a1c1c] dark:text-white hover:border-[#1a1c1c]/40';

                if (isAnswered) {
                  if (option.isCorrect) {
                    optionStyle =
                      'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20';
                  } else if (isSelected && !option.isCorrect) {
                    optionStyle =
                      'border-red-500 bg-red-50/80 dark:bg-red-950/30 text-red-900 dark:text-red-200';
                  } else {
                    optionStyle =
                      'opacity-40 border-[#e5e5e3] dark:border-[#282b2e] bg-[#f9f9f8] dark:bg-[#121314] text-[#747878] dark:text-[#9ca3af]';
                  }
                }

                return (
                  <motion.button
                    key={option.key}
                    onClick={() => handleSelectOption(option.key)}
                    disabled={isAnswered}
                    whileTap={!isAnswered ? { scale: 0.985 } : {}}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start gap-3 ${optionStyle}`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                        isAnswered && option.isCorrect
                          ? 'bg-emerald-600 text-white'
                          : isAnswered && isSelected && !option.isCorrect
                          ? 'bg-red-600 text-white'
                          : 'bg-[#f3f4f3] dark:bg-[#282b2e] text-[#444748] dark:text-[#9ca3af]'
                      }`}
                    >
                      {option.key}
                    </span>
                    <span className="text-sm font-medium pt-0.5 flex-1">{option.text}</span>
                    <span className="text-[10px] text-stone-400 opacity-60 font-mono hidden sm:inline">
                      [{index + 1}]
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Vocabulary.com Instant Conversational Explanation Box */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 8 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`rounded-2xl border p-4 text-xs space-y-2 overflow-hidden ${
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
                        : `Correct answer: (${correctOpt?.key}) ${correctOpt?.text}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSpeak(currentCard.socraticHint)}
                      className="p-1 rounded hover:bg-stone-200/50 dark:hover:bg-stone-800/50"
                      title="Listen to explanation"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="leading-relaxed text-stone-600 dark:text-stone-300">
                    {currentCard.socraticHint}
                  </p>

                  <div className="flex items-center gap-1.5 pt-1 text-[11px] text-stone-500 dark:text-stone-400 italic">
                    <BookOpen className="w-3 h-3 text-[#c2410c] shrink-0" />
                    <span>{currentCard.textbookRef}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Bottom Bar: Hint & Continue */}
        <div className="mt-3 pt-2 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              playTapSound();
              setIsHintOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs text-[#c2410c] hover:text-[#ea580c] font-semibold py-2 px-3 rounded-lg hover:bg-[#c2410c]/5 transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            <span>Socratic Hint [H]</span>
          </button>

          {isAnswered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleContinue}
              className="flex items-center gap-1.5 py-3 px-6 rounded-xl bg-[#1a1c1c] dark:bg-white text-white dark:text-[#121314] font-semibold text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              <span>{isLastCard ? 'View Diagnostics' : 'Next Card'}</span>
              <span className="text-[10px] opacity-70 font-mono hidden sm:inline">[Space]</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Socratic Hint Drawer */}
      <SocraticHintDrawer
        isOpen={isHintOpen}
        onClose={() => setIsHintOpen(false)}
        hint={currentCard.socraticHint}
        textbookRef={currentCard.textbookRef}
        topicTitle={currentCard.topicSlug.replace(/-/g, ' ').toUpperCase()}
      />
    </div>
  );
};

