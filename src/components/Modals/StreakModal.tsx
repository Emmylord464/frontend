import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ShieldCheck, X, Award, Check } from 'lucide-react';
import { playTapSound } from '../../utils/audio';
import { CountUp } from '../Motion/CountUp';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  freezeTokens: number;
  studiedToday: boolean;
  onLogToday: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  streakDays,
  freezeTokens,
  studiedToday,
  onLogToday,
}) => {
  const pastDays = [
    { label: 'Sep 18', day: 'Wed', done: true },
    { label: 'Sep 19', day: 'Thu', done: true },
    { label: 'Sep 20', day: 'Fri', done: true },
    { label: 'Sep 21', day: 'Sat', done: true },
    { label: 'Sep 22', day: 'Sun', done: true },
    { label: 'Sep 23', day: 'Mon', done: true },
    { label: 'Sep 24', day: 'Tue', done: studiedToday },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Frosted Glass Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Heavy, Weighted Modal with Restrained Spring Physics */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 32, stiffness: 350, mass: 0.95 }}
            className="relative z-10 w-full max-w-sm rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow-lifted ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-black/5 dark:ring-white/10">
                  <Flame className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-editorial text-base font-semibold text-stone-900 dark:text-stone-100">
                    Study Momentum
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 font-ui font-mono tabular-nums">
                    Active Streak: <CountUp value={streakDays} /> Consecutive Days
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  playTapSound();
                  onClose();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/60 active:scale-[0.98] duration-200 ease-out transition-all cursor-pointer"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Streak Number Big Feature with CountUp */}
            <div className="text-center py-2 space-y-1">
              <div className="inline-flex items-center justify-center gap-1 font-mono text-5xl font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
                <CountUp value={streakDays} />
                <span className="text-lg font-normal font-ui text-amber-600 dark:text-amber-400">days</span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-ui">
                Top 5% of candidates for UTME 2025 consistency
              </p>
            </div>

            {/* 7-Day Matrix */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block">
                Last 7 Days
              </span>
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {pastDays.map((d, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-ui transition-all ring-1 ring-inset ring-black/5 dark:ring-white/10 ${
                      d.done
                        ? 'border-emerald-600/50 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold'
                        : 'border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 text-stone-400'
                    }`}
                  >
                    <span className="text-[9px] opacity-75">{d.day}</span>
                    <div className="my-1">
                      {d.done ? (
                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-stone-300 dark:bg-stone-700" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Freeze Tokens Vitals Strip with Machined Edge */}
            <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 p-4 ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                  <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 font-ui">
                    Streak Freeze Shields
                  </span>
                </div>
                <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  <CountUp value={freezeTokens} /> Available
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-ui leading-relaxed">
                Protects your study record if you miss a single calendar day due to power outages or school commitments.
              </p>
            </div>

            {/* Milestone Badge Ghost Info */}
            <div className="flex items-center gap-2 rounded-2xl border border-stone-200/70 dark:border-stone-800 p-3 bg-white dark:bg-[#1a1c1e] ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <Award className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" strokeWidth={1.5} />
              <div className="text-[11px] text-stone-600 dark:text-stone-300 font-ui">
                <strong className="text-stone-900 dark:text-stone-100">Next Milestone: 21 Days.</strong> Earn an extra Freeze Shield and unlock Advanced Past Mock Papers.
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-1">
              {!studiedToday ? (
                <button
                  onClick={() => {
                    onLogToday();
                    onClose();
                  }}
                  className="btn-matte w-full rounded-xl py-3 text-xs font-semibold shadow-xs font-ui cursor-pointer"
                >
                  Log Today's Practice Session
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full rounded-xl border border-stone-200/70 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 py-3 text-xs font-semibold text-stone-900 dark:text-stone-100 hover:opacity-90 active:scale-[0.98] duration-200 ease-out font-ui transition-all cursor-pointer ring-1 ring-inset ring-black/5 dark:ring-white/10"
                >
                  Close
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
