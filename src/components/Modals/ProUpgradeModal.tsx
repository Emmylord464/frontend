'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
  BookOpen,
  Award,
  Lock,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { playTapSound, playCorrectSound } from '../../utils/audio';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: 'free' | 'pro' | 'scholar';
  onUpgradeSuccess?: (tier: 'pro') => void;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentTier = 'free',
  onUpgradeSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'season' | 'monthly'>('season');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    playTapSound();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      playCorrectSound();
      if (onUpgradeSuccess) {
        onUpgradeSuccess('pro');
      }
    }, 1200);
  };

  const handleDone = () => {
    playTapSound();
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#181a1c] p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            playTapSound();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSuccess ? (
          <>
            {/* Header Badge */}
            <div className="space-y-1 pt-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>JAMB Scholar Pro Pass (Mockup)</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-white pt-1">
                Unlock 300+ Score Advantage
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Everything candidates need to master high-recurrence trap questions in one sitting.
              </p>
            </div>

            {/* Plan Selector Pills */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setSelectedPlan('season');
                }}
                className={`p-3 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  selectedPlan === 'season'
                    ? 'border-stone-900 dark:border-white bg-stone-50 dark:bg-stone-800/60 shadow-2xs ring-1 ring-stone-900/10'
                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
                }`}
              >
                <div className="absolute -top-2 right-2.5 px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider">
                  Best Value
                </div>
                <div className="text-[11px] font-semibold text-stone-900 dark:text-white">2026 Season Pass</div>
                <div className="text-base font-serif font-bold text-stone-900 dark:text-white mt-0.5">₦2,500</div>
                <div className="text-[10px] text-stone-400">One-time until exam day</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setSelectedPlan('monthly');
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedPlan === 'monthly'
                    ? 'border-stone-900 dark:border-white bg-stone-50 dark:bg-stone-800/60 shadow-2xs ring-1 ring-stone-900/10'
                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
                }`}
              >
                <div className="text-[11px] font-semibold text-stone-900 dark:text-white">Monthly Sprint</div>
                <div className="text-base font-serif font-bold text-stone-900 dark:text-white mt-0.5">₦1,000</div>
                <div className="text-[10px] text-stone-400">30 days unlimited access</div>
              </button>
            </div>

            {/* Feature Checklist */}
            <div className="space-y-2 py-1 bg-stone-50/80 dark:bg-stone-900/40 p-3.5 rounded-2xl border border-stone-100 dark:border-stone-800/60 text-xs">
              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Full 120-Min CBT Simulation</strong> with real JAMB 8-key UI</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>20-Year Recurrence AI Predictor</strong> (2026 appearance forecast)</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>20,000+ Verified Question Bank</strong> with 20Q, 30Q & 50Q modes</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Admissions Oracle</strong> (UNILAG, UI, OAU, UNN cut-off predictor)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Connecting to Paystack (Mock)...</span>
                  </span>
                ) : (
                  <>
                    <span>Unlock Pro Pass ({selectedPlan === 'season' ? '₦2,500' : '₦1,000'})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-stone-400 font-mono">
                🔒 Mockup Preview · No real charge occurs
              </p>
            </div>
          </>
        ) : (
          /* ─── Success Confirmation Card ─── */
          <div className="text-center space-y-4 py-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white">
                Pro Study Pass Activated!
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                You now have full access to all 20,000 questions, CBT Mocks, and 2026 AI Predictors.
              </p>
            </div>

            <button
              onClick={handleDone}
              className="w-full py-3 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <span>Start Exploring Pro Features</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
