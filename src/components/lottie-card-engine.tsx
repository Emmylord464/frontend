'use client';

import { useState, useTransition, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { askSocraticTutorAction } from '@/actions/ask-tutor';
import {
  playPopSound,
  playSuccessSound,
  playErrorSound,
  playThinkSound,
} from '@/lib/sound-effects';

export type CharacterState = 'idle' | 'thinking' | 'celebration' | 'encouragement';

export interface DrillCardOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface DrillCard {
  stepOrder: number; // 1 to 5
  subject: string;
  topic: string;
  questionText: string;
  options: DrillCardOption[];
  explanation: string;
  conceptTip?: string;
}

interface LottieCardEngineProps {
  cards: DrillCard[];
  onComplete?: () => void;
  lottieSources?: Partial<Record<CharacterState, string>>;
}

const confetti = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  x: ((i * 37) % 120) - 60,
  y: -30 - ((i * 23) % 65),
  color: ['#10b981', '#06b6d4', '#f59e0b', '#ec4899'][i % 4],
}));

export function LottieCardEngine({
  cards,
  onComplete,
  lottieSources = {
    idle: '/animations/jamby-idle.lottie',
    thinking: '/animations/jamby-thinking.lottie',
    celebration: '/animations/jamby-celebration.lottie',
    encouragement: '/animations/jamby-encouragement.lottie',
  },
}: LottieCardEngineProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [characterState, setCharacterState] = useState<CharacterState>('idle');
  const [hint, setHint] = useState<string | null>(null);
  const [hintError, setHintError] = useState<string | null>(null);
  const [hasLottieError, setHasLottieError] = useState(false);
  const [isHintPending, startHintTransition] = useTransition();

  const totalCards = cards.length;
  const currentCard = cards[currentStep];

  const handleSelectOption = (option: DrillCardOption) => {
    if (isAnswered && isCorrect) return;

    playPopSound();
    setSelectedOptionId(option.id);
    setIsAnswered(true);

    if (option.isCorrect) {
      setIsCorrect(true);
      setCharacterState('celebration');
      playSuccessSound();
    } else {
      setIsCorrect(false);
      setCharacterState('encouragement');
      playErrorSound();

      // Trigger requested horizontal shake: x: [-12, 12, -8, 8, 0]
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 380);
    }
  };

  const handleRequestHint = useCallback(() => {
    if (isHintPending || !currentCard) return;

    playThinkSound();
    setCharacterState('thinking');
    setHint(null);
    setHintError(null);

    startHintTransition(async () => {
      try {
        const result = await askSocraticTutorAction(
          `Give me one concise Socratic hint for this question without revealing the answer: ${currentCard.questionText}`,
          currentCard.subject,
          currentCard.topic,
        );

        if (!result.success) {
          setHintError(result.error ?? 'Could not retrieve tutor hint.');
          setCharacterState('encouragement');
          return;
        }

        setHint(result.answer ?? 'Analyze the relationship between the key terms.');
        setCharacterState('encouragement');
      } catch {
        setHintError('Tutor is currently thinking offline. Try eliminating wrong answers!');
        setCharacterState('encouragement');
      }
    });
  }, [currentCard, isHintPending]);

  const handleNextCard = () => {
    playPopSound();
    if (currentStep < totalCards - 1) {
      setCurrentStep((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setHint(null);
      setHintError(null);
      setCharacterState('idle');
    } else {
      onComplete?.();
    }
  };

  if (!currentCard) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center text-white">
        <p className="text-4xl mb-3">🎉</p>
        <h3 className="text-2xl font-black">Micro-Drill Completed!</h3>
        <p className="mt-2 text-sm text-slate-400">You mastered this high-yield topic set.</p>
        <button
          type="button"
          onClick={() => {
            setCurrentStep(0);
            setIsAnswered(false);
            setIsCorrect(false);
            setSelectedOptionId(null);
            setCharacterState('idle');
          }}
          className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-black text-slate-950 hover:bg-emerald-400 transition"
        >
          Review Drill Again
        </button>
      </div>
    );
  }

  const activeLottieSrc = lottieSources[characterState] || lottieSources.idle;

  return (
    <div className="mx-auto w-full max-w-[560px] px-3 py-6 sm:px-0">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            <span>Step {currentStep + 1} of {totalCards}</span>
            <span className="text-emerald-300">{currentCard.subject}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / totalCards) * 100}%` }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            />
          </div>
        </div>

        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/80 p-1 shadow-md">
          {!hasLottieError && activeLottieSrc ? (
            <DotLottieReact
              src={activeLottieSrc}
              autoplay
              loop={characterState !== 'celebration'}
              onError={() => setHasLottieError(true)}
              className="h-full w-full object-contain"
            />
          ) : (
            <motion.div
              key={characterState}
              animate={
                characterState === 'thinking'
                  ? { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] }
                  : characterState === 'celebration'
                    ? { y: [0, -10, 0], scale: [1, 1.25, 1] }
                    : characterState === 'encouragement'
                      ? { rotate: [0, -6, 0] }
                      : { y: [0, -3, 0] }
              }
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative select-none text-3xl"
              role="img"
              aria-label={`Jamby ${characterState}`}
            >
              🦅
              {characterState === 'celebration' && <span className="absolute -right-1 -top-1 text-xs">✨</span>}
            </motion.div>
          )}

          <AnimatePresence>
            {characterState === 'celebration' &&
              confetti.map((piece) => (
                <motion.span
                  key={piece.id}
                  initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                  animate={{ opacity: 0, scale: 1, x: piece.x, y: piece.y }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75, ease: 'easeOut' }}
                  className="pointer-events-none absolute h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: piece.color }}
                />
              ))}
          </AnimatePresence>
        </div>
      </div>

      <motion.article
        key={currentStep}
        initial={{ opacity: 0, rotateY: 90, scale: 0.95 }}
        animate={
          isShaking
            ? { opacity: 1, rotateY: 0, scale: 1, x: [-12, 12, -8, 8, 0] }
            : { opacity: 1, rotateY: 0, scale: 1, x: 0 }
        }
        exit={{ opacity: 0, rotateY: -90, scale: 0.95 }}
        transition={{
          rotateY: { type: 'spring', stiffness: 220, damping: 22 },
          x: { duration: 0.35, ease: 'easeInOut' },
          scale: { type: 'spring', stiffness: 350, damping: 28 },
          opacity: { duration: 0.25 },
        }}
        style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
        className="relative overflow-hidden rounded-[1.5rem] border border-slate-800 bg-[#131b2e] p-6 text-white shadow-[0_25px_90px_rgba(15,23,42,0.75)] sm:p-7"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-slate-300">
            {currentCard.topic}
          </span>
          <span className="text-xs font-bold text-slate-400">
            {currentCard.conceptTip ? '💡 Concept Check' : '⚡ Exam Drill'}
          </span>
        </div>

        <h3 className="mb-6 text-lg font-black leading-snug tracking-[-0.05em] text-slate-100 sm:text-xl">
          {currentCard.questionText}
        </h3>

        <div className="grid gap-3" role="group" aria-label="Answer options">
          {currentCard.options.map((option, index) => {
            const isSelected = selectedOptionId === option.id;
            const showCorrect = isAnswered && option.isCorrect;
            const showWrong = isSelected && !option.isCorrect;

            let buttonStyles =
              'border-slate-700 bg-slate-900/70 text-slate-200 hover:border-cyan-500/60 hover:bg-slate-800/80';
            if (showCorrect) {
              buttonStyles =
                'border-emerald-500/80 bg-emerald-500/10 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.22)]';
            } else if (showWrong) {
              buttonStyles =
                'border-rose-500/80 bg-rose-500/10 text-rose-100 shadow-[0_0_22px_rgba(244,63,94,0.2)]';
            }

            return (
              <motion.button
                key={option.id}
                type="button"
                whileHover={{ scale: isAnswered && isCorrect ? 1 : 1.015, borderColor: '#06b6d4' }}
                whileTap={{ scale: isAnswered && isCorrect ? 1 : 0.98 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                onClick={() => handleSelectOption(option)}
                disabled={isAnswered && isCorrect}
                className={`flex min-h-[60px] items-center gap-3.5 rounded-2xl border p-4 text-left text-sm font-bold transition-colors sm:text-base ${buttonStyles}`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                    showCorrect
                      ? 'bg-emerald-500 text-slate-950'
                      : showWrong
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option.text}</span>
                {showCorrect && <span className="text-lg text-emerald-300">✓</span>}
                {showWrong && <span className="text-lg text-rose-300">✕</span>}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className={`rounded-2xl border p-4 text-sm leading-relaxed ${
                isCorrect
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
                  : 'border-rose-500/40 bg-rose-500/10 text-rose-100'
              }`}
            >
              <p className="mb-1 flex items-center gap-1.5 font-black">
                {isCorrect ? '🎉 Spot on!' : '🤔 Not quite yet.'}
              </p>
              <p className="text-xs text-slate-300 sm:text-sm">{currentCard.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAnswered && !isCorrect && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200/80">Socratic nudge</p>
                  <p className="mt-2 text-sm text-amber-50">Try the rule behind the concept before choosing again.</p>
                </div>
                <button
                  type="button"
                  onClick={handleRequestHint}
                  disabled={isHintPending}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs font-black text-amber-100 transition hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>💡</span>
                  {isHintPending ? 'Thinking…' : 'Ask Jamby for a Hint'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(hint || hintError) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className={`mt-4 rounded-2xl border p-4 text-sm leading-relaxed ${
                hintError
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-100'
                  : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-100'
              }`}
            >
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-200/80">Jamby Socratic Hint</p>
              <p className="text-sm text-slate-100">{hint || hintError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleRequestHint}
            disabled={isHintPending || (isAnswered && isCorrect)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-xs font-black text-slate-300 transition hover:border-cyan-500/60 hover:text-cyan-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
          >
            <span>💡</span>
            {isHintPending ? 'Jamby is thinking...' : 'Ask Jamby for a Hint'}
          </button>

          {isAnswered && isCorrect && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextCard}
              className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-black text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition hover:bg-emerald-400"
            >
              {currentStep < totalCards - 1 ? 'Next Card →' : 'Complete Drill 🏆'}
            </motion.button>
          )}
        </div>
      </motion.article>
    </div>
  );
}

