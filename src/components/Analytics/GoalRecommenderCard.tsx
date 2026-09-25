import React, { useState } from 'react';
import {
  Sparkles,
  Target,
  Zap,
  Check,
  TrendingUp,
  Clock,
  Award,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { playTapSound, playCorrectSound } from '../../utils/audio';
import { ScreenGuideSheet, InfoTrigger, ScreenGuideContent } from '../Modals/ScreenGuideSheet';

interface GoalRecommenderCardProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const GoalRecommenderCard: React.FC<GoalRecommenderCardProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [activeGuide, setActiveGuide] = useState<ScreenGuideContent | null>(null);
  const currentGoal = profile.dailyQuestionGoal || 50;
  const targetScore = profile.targetScore;
  const currentScore = profile.currentEstimatedScore;
  const markGap = Math.max(0, targetScore - currentScore);

  const recentDailyAverage = 51;

  // Estimate ~1.2 marks gained per 100 questions drilled at current accuracy
  const totalQuestionsNeeded = Math.max(200, Math.round((markGap / 1.25) * 100));

  // Determine auto-recommended quota
  let autoRecommendedQuota: number;
  let reasonText: string;

  if (markGap <= 15) {
    autoRecommendedQuota = 40;
    reasonText = `Target gap: ${markGap} marks. At 40 Qs/day, consolidate retention with zero study fatigue.`;
  } else if (markGap <= 32) {
    autoRecommendedQuota = 60;
    reasonText = `Target gap: ${markGap} marks. At 60 Qs/day, reach your ${targetScore} cut-off in ~36 days.`;
  } else {
    autoRecommendedQuota = 70;
    reasonText = `Target gap: ${markGap} marks. 70 Qs/day locks comprehensive 4-subject coverage before mock exams.`;
  }

  const [selectedQuota, setSelectedQuota] = useState<number>(currentGoal);
  const [justApplied, setJustApplied] = useState(false);

  const calculateDaysNeeded = (quota: number) => {
    return Math.max(7, Math.ceil(totalQuestionsNeeded / quota));
  };

  const handleApplyQuota = (quota: number) => {
    playTapSound();
    playCorrectSound();
    setSelectedQuota(quota);
    onUpdateProfile({ dailyQuestionGoal: quota });
    setJustApplied(true);
    setTimeout(() => setJustApplied(false), 3000);
  };

  const quotaOptions = [
    {
      quota: 40,
      label: 'Steady Pacing',
      days: calculateDaysNeeded(40),
      description: 'Lower fatigue · Retention focus',
      isAuto: autoRecommendedQuota === 40,
    },
    {
      quota: 50,
      label: 'Benchmark',
      days: calculateDaysNeeded(50),
      description: 'UTME standard daily quota',
      isAuto: autoRecommendedQuota === 50,
    },
    {
      quota: 60,
      label: 'Accelerated Sprint',
      days: calculateDaysNeeded(60),
      description: 'Faster cut-off attainment',
      isAuto: autoRecommendedQuota === 60,
    },
  ];

  return (
    <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-stone-400 font-ui font-medium">
              Diagnostic Guidance
            </span>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 font-ui">
              Pacing Engine
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="font-editorial text-2xl font-normal text-stone-900 dark:text-stone-100 leading-tight">
              Intelligent Study Quota
            </h2>
            <InfoTrigger
              onClick={() =>
                setActiveGuide({
                  title: 'Intelligent Study Quota',
                  subtitle: 'Predictive Velocity Calibration',
                  badge: 'Pacing Engine',
                  icon: Target,
                  description: [
                    `Based on your ${recentDailyAverage} Qs/day baseline and ${markGap} marks remaining to the ${targetScore} cut-off.`,
                    'The pacing model factors in your subject accuracy rate and estimates approximately ~1.25 marks gained per 100 questions drilled across balanced UTME past sets.',
                  ],
                  tips: [
                    'Steady Pacing (40 Qs/day): Consolidates retention with zero study fatigue.',
                    'Benchmark (50 Qs/day): Standard UTME syllabus pacing.',
                    'Accelerated Sprint (60+ Qs/day): Rapid cutoff attainment.',
                  ],
                })
              }
              label="View Quota Guide"
            />
          </div>
        </div>

        {/* Current Active Goal Badge */}
        <div className="self-start sm:self-auto rounded-2xl bg-stone-50/50 dark:bg-stone-900/40 px-4 py-2 border border-stone-200/70 dark:border-stone-800/70 text-right ring-1 ring-inset ring-black/5 dark:ring-white/10">
          <span className="text-[10px] uppercase tracking-widest font-mono font-medium text-stone-400 block">
            Active Goal
          </span>
          <span className="font-mono text-lg font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
            {currentGoal} Qs/day
          </span>
        </div>
      </div>

      {/* Recommended Quota Callout */}
      <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/70 bg-stone-50/60 dark:bg-stone-900/40 p-5 space-y-3 ring-1 ring-inset ring-black/5 dark:ring-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-ui">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            <span>Recommended: {autoRecommendedQuota} Questions / Day</span>
          </div>
          <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
            Adaptive Pace
          </span>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-300 font-ui leading-relaxed">
          {reasonText}
        </p>

        {/* Diagnostic Metrics Strip */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-stone-200/60 dark:border-stone-800/60 text-xs font-ui">
          <div>
            <span className="text-[10px] text-stone-400 block uppercase font-mono tracking-wider">
              Mark Deficit
            </span>
            <strong className="text-stone-900 dark:text-stone-100 font-mono text-base block mt-0.5 tabular-nums">
              +{markGap} Marks
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block uppercase font-mono tracking-wider">
              Bank Volume
            </span>
            <strong className="text-stone-900 dark:text-stone-100 font-mono text-base block mt-0.5 tabular-nums">
              ~{totalQuestionsNeeded} Qs
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block uppercase font-mono tracking-wider">
              Est. Window
            </span>
            <strong className="text-amber-700 dark:text-amber-400 font-mono text-base block mt-0.5 tabular-nums">
              ~{calculateDaysNeeded(selectedQuota)} Days
            </strong>
          </div>
        </div>
      </div>

      {/* Quota Option Selector Cards */}
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-widest text-stone-400 font-ui font-medium block">
          Select Your Daily Target
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quotaOptions.map((opt) => {
            const isSelected = selectedQuota === opt.quota;
            const isCurrent = currentGoal === opt.quota;

            return (
              <button
                key={opt.quota}
                onClick={() => {
                  playTapSound();
                  setSelectedQuota(opt.quota);
                }}
                className={`relative rounded-2xl p-4 text-left transition-all duration-200 ease-out active:scale-[0.98] border font-ui flex flex-col justify-between cursor-pointer ring-1 ring-inset ring-black/5 dark:ring-white/10 ${
                  isSelected
                    ? 'border-stone-900 dark:border-stone-100 bg-stone-50/70 dark:bg-stone-900/60 shadow-xs'
                    : 'border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] hover:border-stone-400 hover:opacity-95'
                }`}
              >
                {opt.isAuto && (
                  <span className="absolute -top-2.5 right-3 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border border-stone-200/70 dark:border-stone-700/60 bg-white dark:bg-[#1a1c1e] text-stone-700 dark:text-stone-300">
                    Optimal
                  </span>
                )}

                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-mono text-3xl font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                      {opt.quota}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono tabular-nums">
                      ~{opt.days} days
                    </span>
                  </div>
                  <div className="font-medium text-xs text-stone-900 dark:text-stone-100">
                    {opt.label}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                    {opt.description}
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px]">
                  {isCurrent ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="h-3 w-3" strokeWidth={1.5} />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="text-stone-400">
                      Click to choose
                    </span>
                  )}
                  {isSelected && !isCurrent && (
                    <span className="text-stone-900 dark:text-stone-100 font-medium">Selected</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
        <span className="text-xs text-stone-500 dark:text-stone-400 font-ui">
          {justApplied
            ? `Daily quota set to ${selectedQuota} Qs/day.`
            : `Sets your daily drill target to ${selectedQuota} questions.`}
        </span>

        <button
          onClick={() => handleApplyQuota(selectedQuota)}
          className="btn-matte rounded-xl px-5 py-2.5 text-xs font-semibold font-ui shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          {justApplied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.5} />
              <span>Pace Applied</span>
            </>
          ) : (
            <>
              <Target className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>Apply {selectedQuota} Qs Quota</span>
            </>
          )}
        </button>
      </div>

      {/* Screen Guide Bottom Sheet */}
      <ScreenGuideSheet
        isOpen={activeGuide !== null}
        onClose={() => setActiveGuide(null)}
        guide={activeGuide}
      />
    </div>
  );
};
