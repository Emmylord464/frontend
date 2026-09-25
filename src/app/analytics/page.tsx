'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Target,
  Flame,
  Award,
  ChevronRight,
} from 'lucide-react';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { ProbabilityGauge } from '@/components/ProbabilityGauge';
import { calculateScoreProbability } from '@/lib/analytics';
import { playCompleteSound, playTapSound } from '@/utils/audio';

const SUBJECT_NAMES: Record<string, string> = {
  use_of_english: 'Use of English',
  mathematics: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  economics: 'Economics',
  government: 'Government',
};

export default function AnalyticsPage() {
  const router = useRouter();
  const {
    lastSessionSummary,
    selectedSubject,
    targetScore,
    targetCourse,
    streakCount,
    setSubject,
    resetWorkout,
  } = useWorkoutStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    playCompleteSound();
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#f9f9f8] dark:bg-[#121314] flex items-center justify-center">
        <div className="text-sm text-[#747878] dark:text-[#9ca3af] animate-pulse">
          Computing 250+ Probability Metrics…
        </div>
      </div>
    );
  }

  // Fallback if accessed directly without completing workout
  const summary = lastSessionSummary || {
    subject: selectedSubject || 'use_of_english',
    totalCards: 5,
    correctCards: 4,
    accuracyPercentage: 80,
    averageSpeedSeconds: 14,
    totalTimeSeconds: 70,
    attempts: [],
    strengths: ['Subject-Verb Concord', 'Root Word Analysis'],
    weaknesses: ['Rapid Elimination in Lexis'],
    calculatedScoreProbability: 82,
  };

  const probAnalysis = calculateScoreProbability({
    accuracyPercentage: summary.accuracyPercentage,
    averageSpeedSeconds: summary.averageSpeedSeconds,
    targetScore: targetScore || 280,
    strengths: summary.strengths,
    weaknesses: summary.weaknesses,
  });

  const subjectName = SUBJECT_NAMES[summary.subject] || 'Use of English';

  const handleRetakeWorkout = () => {
    playTapSound();
    resetWorkout();
    router.push('/workout');
  };

  const handleSelectNewSubject = () => {
    playTapSound();
    resetWorkout();
    router.push('/select-subject');
  };

  return (
    <div className="min-h-screen bg-[#f9f9f8] dark:bg-[#121314] text-[#1a1c1c] dark:text-[#f3f4f6] flex flex-col antialiased pb-12 selection:bg-[#e2e2e2]">
      {/* Header */}
      <header className="border-b border-[#e5e5e3] dark:border-[#282b2e] bg-[#f9f9f8]/90 dark:bg-[#121314]/90 backdrop-blur-md px-4 py-3 sticky top-0 z-20">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link
            href="/select-subject"
            className="text-xs text-[#747878] dark:text-[#9ca3af] hover:text-[#1a1c1c] dark:hover:text-white transition-colors font-ui"
          >
            ← Subjects
          </Link>

          <span className="font-editorial text-base font-semibold text-[#1a1c1c] dark:text-white">
            Diagnostic Scorecard
          </span>

          <div className="flex items-center gap-1 text-xs font-semibold text-[#c2410c] font-ui">
            <Flame className="w-3.5 h-3.5 fill-[#c2410c]/20" />
            <span>{streakCount}d</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-4 space-y-4 font-ui">
        {/* Probability Gauge Hero Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#181a1c] p-6 shadow-sm text-center flex flex-col items-center"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#747878] dark:text-[#9ca3af] mb-2">
            250+ Score Probability Predictor
          </span>

          <ProbabilityGauge
            percentage={probAnalysis.probabilityPercentage}
            ratingTier={probAnalysis.ratingTier}
            ratingColor={probAnalysis.ratingColor}
          />

          <p className="text-xs text-[#444748] dark:text-[#d1d5db] mt-4 max-w-xs leading-relaxed">
            {probAnalysis.summaryMessage}
          </p>

          <div className="mt-4 pt-4 border-t border-[#f3f4f3] dark:border-[#282b2e] w-full grid grid-cols-2 gap-2 text-center text-xs">
            <div>
              <span className="text-[#747878] dark:text-[#9ca3af] block">Equivalent JAMB Score</span>
              <span className="font-editorial text-xl font-bold text-[#1a1c1c] dark:text-white">
                ~{probAnalysis.estimatedJambScore} <span className="text-xs font-normal text-[#747878]">/ 400</span>
              </span>
            </div>
            <div>
              <span className="text-[#747878] dark:text-[#9ca3af] block">Target Course Goal</span>
              <span className="font-editorial text-xl font-bold text-[#c2410c]">
                {targetScore}+
              </span>
            </div>
          </div>
        </motion.div>

        {/* Workout Performance Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center font-ui">
          <div className="rounded-2xl border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#181a1c] p-3.5 shadow-2xs">
            <span className="text-[10px] text-[#747878] dark:text-[#9ca3af] uppercase tracking-wider block">
              Accuracy
            </span>
            <span className="font-editorial text-xl font-bold text-[#1a1c1c] dark:text-white">
              {summary.accuracyPercentage}%
            </span>
            <span className="text-[10px] text-[#747878] dark:text-[#9ca3af] block">
              {summary.correctCards}/{summary.totalCards} cards
            </span>
          </div>

          <div className="rounded-2xl border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#181a1c] p-3.5 shadow-2xs">
            <span className="text-[10px] text-[#747878] dark:text-[#9ca3af] uppercase tracking-wider block">
              Avg Speed
            </span>
            <span className="font-editorial text-xl font-bold text-[#1a1c1c] dark:text-white">
              {summary.averageSpeedSeconds}s
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
              Benchmark: &lt;40s
            </span>
          </div>

          <div className="rounded-2xl border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#181a1c] p-3.5 shadow-2xs">
            <span className="text-[10px] text-[#747878] dark:text-[#9ca3af] uppercase tracking-wider block">
              Subject
            </span>
            <span className="font-editorial text-sm font-bold text-[#1a1c1c] dark:text-white truncate block">
              {subjectName}
            </span>
            <span className="text-[10px] text-[#747878] dark:text-[#9ca3af] block">
              UTME Core
            </span>
          </div>
        </div>

        {/* Strengths & Weaknesses Breakdown */}
        <div className="rounded-3xl border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#181a1c] p-5 shadow-sm space-y-4 font-ui">
          {/* Strengths */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Mastered Strengths</span>
            </div>
            <ul className="space-y-1.5 text-xs text-[#1a1c1c] dark:text-[#e5e7eb] pl-5 list-disc">
              {probAnalysis.strengths.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="space-y-2 pt-2 border-t border-[#f3f4f3] dark:border-[#282b2e]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#c2410c] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>High-Yield Weak Spots</span>
            </div>
            <ul className="space-y-1.5 text-xs text-[#1a1c1c] dark:text-[#e5e7eb] pl-5 list-disc">
              {probAnalysis.weaknesses.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Socratic Recommendation Card */}
        <div className="rounded-2xl border border-[#e5e5e3] dark:border-[#282b2e] bg-[#f3f4f3] dark:bg-[#16181a] p-4 text-xs font-ui flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-[#c2410c] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#1a1c1c] dark:text-white block">
              Recommended Socratic Strategy
            </span>
            <p className="text-[#444748] dark:text-[#9ca3af] mt-0.5 leading-relaxed">
              Maintain your daily 5-card flashcard streak to cement active recall. Review the cited textbook chapters before full CBT mock tests.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 space-y-2.5 font-ui">
          <button
            onClick={handleRetakeWorkout}
            className="w-full rounded-xl bg-[#1a1c1c] dark:bg-white text-white dark:text-[#121314] py-3.5 px-4 font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Another 5 Cards</span>
          </button>

          <button
            onClick={handleSelectNewSubject}
            className="w-full rounded-xl border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#181a1c] text-[#1a1c1c] dark:text-white py-3 px-4 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#f3f4f3] dark:hover:bg-[#202326] active:scale-[0.99] transition-all"
          >
            <span>Switch to Another UTME Subject</span>
            <ChevronRight className="w-4 h-4 text-[#747878]" />
          </button>
        </div>
      </main>
    </div>
  );
}
