import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Subject, WeaknessArea, StrengthArea, UserProfile } from '../../types';
import { playTapSound } from '../../utils/audio';
import { CountUp } from '../Motion/CountUp';
import {
  TrendingUp,
  AlertTriangle,
  Award,
  Zap,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Layers,
  ChevronDown,
  Lock,
  Share2,
  Target,
  ArrowRight,
  LineChart,
  Building2,
  Radio,
} from 'lucide-react';
import { ShareScoreModal } from '../Modals/ShareScoreModal';
import { WeeklyActivityCharts } from './WeeklyActivityCharts';
import { ScreenGuideSheet, InfoTrigger, ScreenGuideContent } from '../Modals/ScreenGuideSheet';
import { AdmissionsOracleView } from '../Admissions/AdmissionsOracleView';
import { SyndicateDeskView } from '../Syndicate/SyndicateDeskView';
import { TopicRecurrencePredictor } from './TopicRecurrencePredictor';

interface AnalyticsViewProps {
  profile: UserProfile;
  subjects: Subject[];
  weaknesses: WeaknessArea[];
  strengths: StrengthArea[];
  onLaunchTargetedDrill: (subjectId: string) => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
  onNavigateToPlanner?: () => void;
  onNavigateToRecovery?: () => void;
  initialTab?: 'readiness' | 'predictor' | 'oracle' | 'syndicate';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  profile,
  subjects,
  weaknesses,
  strengths,
  onLaunchTargetedDrill,
  onUpdateProfile,
  onNavigateToPlanner,
  onNavigateToRecovery,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<'readiness' | 'predictor' | 'oracle' | 'syndicate'>(
    initialTab || 'readiness'
  );
  const [filterCategory, setFilterCategory] = useState<'All' | 'Sciences' | 'Arts'>('All');
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [simulatedBoost, setSimulatedBoost] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeGuide, setActiveGuide] = useState<ScreenGuideContent | null>(null);

  // Compute probability based on current score vs target score + simulation
  const effectiveScore = profile.currentEstimatedScore + simulatedBoost;
  const scoreRatio = effectiveScore / profile.targetScore;
  // Probability sigmoid curve representation
  const probability = Math.min(
    98,
    Math.max(15, Math.round(1 / (1 + Math.exp(-6 * (scoreRatio - 0.92))) * 100))
  );

  // Semi-circle SVG calculation
  const semiRadius = 75;
  const semiCircumference = Math.PI * semiRadius; // ~235.6
  const gaugeFillRatio = Math.min(Math.max(probability / 100, 0), 1);
  const semiDashoffset = semiCircumference - gaugeFillRatio * semiCircumference;

  // Filtered subjects
  const displayedSubjects = subjects.filter((s) => {
    if (filterCategory === 'All') return true;
    if (filterCategory === 'Sciences') return s.category === 'Sciences';
    return s.category === 'Arts' || s.category === 'Commercial';
  });

  return (
    <div className="w-full pb-32 pt-6 px-4 space-y-6 animate-fadeIn">
      {/* Top Segmented Controls: Readiness | 2026 Predictor | Admissions Oracle | Syndicate Desk */}
      <div className="flex p-1 bg-stone-100 dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800">
        {[
          { id: 'readiness', label: 'Readiness', icon: LineChart },
          { id: 'predictor', label: '2026 Predictor', icon: Sparkles },
          { id: 'oracle', label: 'Oracle', icon: Building2 },
          { id: 'syndicate', label: 'Syndicate', icon: Radio },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playTapSound();
                setActiveTab(tab.id as 'readiness' | 'predictor' | 'oracle' | 'syndicate');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-[#1a1c1e] text-stone-900 dark:text-stone-100 font-bold shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'predictor' && (
        <TopicRecurrencePredictor onLaunchDrill={onLaunchTargetedDrill} />
      )}

      {activeTab === 'oracle' && (
        <AdmissionsOracleView profile={profile} onNavigateToDrill={onLaunchTargetedDrill} />
      )}

      {activeTab === 'syndicate' && (
        <SyndicateDeskView profile={profile} onNavigateToDrill={onLaunchTargetedDrill} />
      )}

      {activeTab === 'readiness' && (
        <>
          {/* Title & Editorial Subtext - Clean Serif Header with Info Trigger */}
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal tracking-tight text-[#1C1D1B] dark:text-[#F4F4F2]">
            Analytics & Readiness
          </h1>
          <InfoTrigger
            onClick={() =>
              setActiveGuide({
                title: 'Analytics & Diagnostic Engine',
                subtitle: 'Mathematical Model & Cut-off Pacing',
                badge: 'System Architecture',
                icon: LineChart,
                description: [
                  'Score projections, admission cut-off probability, and targeted intervention metrics derived from your drill accuracy.',
                  'Diagnostic metrics are calibrated against historical UTME cohort results and course-specific faculty cut-off standards.',
                ],
                tips: [
                  'Practice consistently to improve accuracy above 75% on high-difficulty questions.',
                  'Use the simulation slider to forecast score gains from mastering specific topics.',
                ],
              })
            }
            label="View Analytics Guide"
          />
        </div>
        <span className="text-xs uppercase tracking-widest text-[#828581] dark:text-[#949793] font-ui font-medium">
          UTME Diagnostic
        </span>
      </section>

      {/* Target Score Probability Semi-Circle Gauge Card (Spacious p-6) */}
      <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <span className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-medium font-ui">
                Probability Projection
              </span>
              <h2 className="font-editorial text-xl font-normal text-stone-900 dark:text-stone-100 mt-0.5">
                Target Cut-off Probability
              </h2>
            </div>
            <InfoTrigger
              onClick={() =>
                setActiveGuide({
                  title: 'Admission Cut-off Probability',
                  subtitle: 'Sigmoid Predictive Modeling',
                  badge: 'Statistical Model',
                  icon: TrendingUp,
                  description: [
                    'This predictive gauge estimates the likelihood of clearing your target course cut-off based on recent accuracy and question volume.',
                    'A standing of 75%+ indicates highly competitive readiness for premier federal and state universities in Nigeria.',
                  ],
                  tips: [
                    'Score simulations simulate score improvements from targeted remedial study in physics mechanics and lexis.',
                  ],
                })
              }
              label="View Probability Guide"
            />
          </div>
          <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 font-mono tabular-nums">
            Goal: {profile.targetScore}+
          </span>
        </div>

        {/* Semi-Circle Gauge Display */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="relative flex items-center justify-center">
            <svg
              className="h-36 w-60 overflow-visible"
              viewBox="0 0 200 110"
            >
              {/* Background Arch Track */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                className="stroke-[#F4F4F0] dark:stroke-[#2B2C30]"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Target Cutoff Indicator Marker */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                className="stroke-[#BA5D38] dark:stroke-[#E28D6E] transition-all duration-[1200ms] ease-out"
                strokeWidth="14"
                strokeDasharray={`${semiCircumference}`}
                strokeDashoffset={semiDashoffset}
                strokeLinecap="round"
              />

              {/* Center Needle Marker */}
              <circle
                cx="100"
                cy="100"
                r="6"
                className="fill-[#1C1D1B] dark:fill-white"
              />
            </svg>

            {/* Inner Content inside Semi-Circle */}
            <div className="absolute bottom-2 flex flex-col items-center text-center">
              <span className="font-editorial text-4xl sm:text-5xl font-normal tracking-tight text-[#1C1D1B] dark:text-[#F4F4F2] tabular-nums leading-none">
                <CountUp value={probability} suffix="%" />
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-[#828581] dark:text-[#949793] font-ui mt-1.5">
                Admission Probability
              </span>
            </div>
          </div>

          {/* Comparative Score Bar */}
          <div className="mt-4 flex w-full items-center justify-between rounded-2xl bg-[#FBFBF9] dark:bg-[#232527] border border-[#EAE8E3] dark:border-[#2B2C30] p-4 text-xs font-ui">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#828581] dark:text-[#949793] block">Projected Score</span>
              <span className="font-editorial text-lg font-medium text-[#1C1D1B] dark:text-[#F4F4F2] tabular-nums">
                <CountUp value={effectiveScore} />{' '}
                <span className="text-xs text-[#828581] dark:text-[#949793] font-normal font-ui">/400</span>
              </span>
            </div>
            <div className="h-7 w-px bg-[#EAE8E3] dark:bg-[#2B2C30]" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#828581] dark:text-[#949793] block">Target Cut-Off</span>
              <span className="font-editorial text-lg font-medium text-[#BA5D38] dark:text-[#E28D6E] tabular-nums">
                <CountUp value={profile.targetScore} />
              </span>
            </div>
            <div className="h-7 w-px bg-[#EAE8E3] dark:bg-[#2B2C30]" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#828581] dark:text-[#949793] block">Standing</span>
              <span className="font-ui text-xs font-semibold text-[#426E55] dark:text-[#88C09D]">
                {probability >= 75 ? 'Highly Competitive' : 'Borderline Pace'}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Readiness Simulator */}
        <div className="rounded-2xl border border-[#EAE8E3] dark:border-[#2B2C30] bg-[#FBFBF9] dark:bg-[#232527] p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-ui">
            <span className="font-medium text-[#1C1D1B] dark:text-[#F4F4F2] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#D9B973]" />
              Simulation: Boost Physics & Mechanics
            </span>
            <span className="text-[#BA5D38] dark:text-[#E28D6E] font-semibold tabular-nums">
              +{simulatedBoost} Marks
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="5"
            value={simulatedBoost}
            onChange={(e) => {
              setSimulatedBoost(Number(e.target.value));
              playTapSound();
            }}
            className="w-full accent-[#1C1D1B] dark:accent-white cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#828581] dark:text-[#949793] font-ui">
            <span>Current baseline</span>
            <span>+15 marks</span>
            <span>+30 marks (+12% prob)</span>
          </div>

          {/* Send Scorecard to Friends & Family Action Row */}
          <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-ui">
              Projected Score: <strong className="text-stone-900 dark:text-stone-100 font-mono tabular-nums">{effectiveScore}/400</strong>
            </span>
            <button
              onClick={() => {
                playTapSound();
                setIsShareModalOpen(true);
              }}
              className="btn-matte flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold font-ui shadow-xs cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>Send Score to Friends & Family</span>
            </button>
          </div>
        </div>
      </div>

      {/* Strategy Pacing Link Banner (Spacious p-6) */}
      {onNavigateToPlanner && (
        <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 ring-1 ring-inset ring-black/5 dark:ring-white/10 shrink-0">
              <Target className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-editorial text-base font-semibold text-stone-900 dark:text-stone-100">
                  Active Quota: {profile.dailyQuestionGoal || 50} Qs / Day
                </h3>
                <InfoTrigger
                  onClick={() =>
                    setActiveGuide({
                      title: 'Active Quota Strategy',
                      subtitle: 'Milestone Velocity Management',
                      badge: 'Planner Sync',
                      icon: Target,
                      description: [
                        `Configured to reach the ${profile.targetScore} cut-off for ${profile.courseTrack?.name || 'your registered degree'}.`,
                        'Adjusting your daily quota recalculates subject pace and estimated days to syllabus completion.',
                      ],
                    })
                  }
                  label="View Strategy Guide"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound();
              onNavigateToPlanner();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-stone-50/50 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800/70 hover:opacity-90 active:scale-[0.98] duration-200 ease-out px-4 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 font-ui transition-all shadow-2xs shrink-0 cursor-pointer ring-1 ring-inset ring-black/5 dark:ring-white/10"
          >
            <span>Adjust Pacing</span>
            <ArrowRight className="h-3.5 w-3.5 text-stone-400" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Weekly Study Activity & Progress Charts */}
      <WeeklyActivityCharts
        currentScore={effectiveScore}
        targetScore={profile.targetScore}
        dailyGoal={profile.dailyQuestionGoal || 50}
      />

      {/* Recovery Lab Portal Card with Machined Edge */}
      {onNavigateToRecovery && (
        <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-black/5 dark:ring-white/10 shrink-0">
              <AlertTriangle className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-editorial text-lg font-medium text-stone-900 dark:text-stone-100">
                  Precision Recovery Lab ({weaknesses.length} Deficits)
                </h3>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 font-ui">
                  +18 Marks Est.
                </span>
                <InfoTrigger
                  onClick={() =>
                    setActiveGuide({
                      title: 'Precision Recovery Lab',
                      subtitle: 'Topic-Level Deficit Remediation',
                      badge: 'Score Recovery',
                      icon: AlertTriangle,
                      description: [
                        'Targets low-mastery topics identified across past practice drills in an isolated laboratory environment.',
                        'Mastering these high-yield topics recovers an estimated +18 marks on official exam day.',
                      ],
                    })
                  }
                  label="View Recovery Lab Guide"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound();
              onNavigateToRecovery();
            }}
            className="btn-matte flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold font-ui shadow-2xs shrink-0 cursor-pointer"
          >
            <span>Open Recovery Lab</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Interactive Subject Mastery Breakdown with Machined Edge */}
      <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#828581] dark:text-[#949793] font-medium font-ui">
                Subject Syllabi
              </span>
              <h2 className="font-editorial text-xl font-normal text-[#1C1D1B] dark:text-[#F4F4F2] mt-0.5">
                Mastery Breakdown
              </h2>
            </div>
            <InfoTrigger
              onClick={() =>
                setActiveGuide({
                  title: 'Subject Mastery Breakdown',
                  subtitle: 'Readiness & Syllabus Coverage',
                  badge: 'Subject Diagnostics',
                  icon: Award,
                  description: [
                    'Calculates syllabus mastery percentages per subject by evaluating your accuracy across past questions and recent timed drills.',
                    'Tap any row to view available UTME past questions and launch a focused single-subject practice drill.',
                  ],
                  tips: [
                    '80%+ indicates solid mastery ready for the UTME test day.',
                    'Below 65% triggers targeted recovery recommendations.',
                  ],
                })
              }
              label="View Mastery Guide"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 rounded-full bg-[#F4F4F0] dark:bg-[#232527] p-1 border border-[#EAE8E3] dark:border-[#2B2C30]">
            {(['All', 'Sciences', 'Arts'] as const).map((tab) => {
              const isActive = filterCategory === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setFilterCategory(tab);
                    playTapSound();
                  }}
                  className={`relative px-3 py-1 text-xs rounded-full font-ui transition-all cursor-pointer ${
                    isActive
                      ? 'text-white dark:text-[#141517] font-semibold'
                      : 'text-[#828581] dark:text-[#949793] hover:text-[#1C1D1B] dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeAnalyticsCategory"
                      className="absolute inset-0 rounded-full bg-[#1C1D1B] dark:bg-white shadow-xs -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* List of Subjects with Animated Progress Bars */}
        <div className="space-y-3 pt-1">
          {displayedSubjects.map((sub, idx) => {
            const isExpanded = expandedSubjectId === sub.id;

            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-[#EAE8E3] dark:border-[#2B2C30] p-4 transition-colors hover:bg-[#FBFBF9] dark:hover:bg-[#232527]"
              >
                <div
                  onClick={() => {
                    setExpandedSubjectId(isExpanded ? null : sub.id);
                    playTapSound();
                  }}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-editorial text-base font-medium text-[#1C1D1B] dark:text-[#F4F4F2]">
                      {sub.name}
                    </span>
                    <span className="text-xs text-[#828581] dark:text-[#949793] font-ui">
                      · {sub.topics}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-editorial text-base font-semibold text-[#1C1D1B] dark:text-[#F4F4F2] tabular-nums">
                      <CountUp value={sub.readiness} suffix="%" />
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#828581] dark:text-[#949793] transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Progress track */}
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#F4F4F0] dark:bg-[#2B2C30]">
                  <div
                    className={`h-full rounded-full transition-all duration-[1200ms] ease-out ${
                      sub.readiness >= 80
                        ? 'bg-[#426E55] dark:bg-[#88C09D]'
                        : sub.readiness >= 65
                        ? 'bg-[#BA5D38] dark:bg-[#E28D6E]'
                        : 'bg-[#BA5D38]/80 dark:bg-[#E28D6E]/80'
                    }`}
                    style={{ width: `${sub.readiness}%` }}
                  />
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3.5 pt-3 border-t border-[#F4F4F0] dark:border-[#2B2C30] space-y-2 animate-fadeIn">
                    <div className="flex justify-between text-xs text-[#828581] dark:text-[#949793] font-ui">
                      <span>Available UTME Past Questions:</span>
                      <span className="font-semibold text-[#1C1D1B] dark:text-white font-editorial">
                        {sub.questionsCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-[#828581] dark:text-[#949793] font-ui">
                      <span>Estimated UTME Scale Score:</span>
                      <span className="font-semibold text-[#1C1D1B] dark:text-white font-editorial">
                        {Math.round((sub.readiness / 100) * 100)}/100
                      </span>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          playTapSound();
                          onLaunchTargetedDrill(sub.id);
                        }}
                        className="text-xs font-semibold text-[#BA5D38] dark:text-[#E28D6E] hover:underline font-ui flex items-center gap-1 cursor-pointer"
                      >
                        Practice this subject now →
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
        </>
      )}

      {/* Share Score to Friends & Family Modal */}
      <ShareScoreModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={{
          ...profile,
          currentEstimatedScore: effectiveScore,
        }}
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
