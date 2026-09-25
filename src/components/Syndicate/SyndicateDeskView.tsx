import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../../types';
import { playTapSound } from '../../utils/audio';
import { CountUp } from '../Motion/CountUp';
import {
  Users,
  Zap,
  Flame,
  ShieldAlert,
  Award,
  Radio,
  Target,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Gift,
} from 'lucide-react';
import { ScreenGuideSheet, InfoTrigger, ScreenGuideContent } from '../Modals/ScreenGuideSheet';

interface SyndicateDeskViewProps {
  profile: UserProfile;
  onNavigateToDrill?: (subjectId: string) => void;
}

interface OperativeFeedItem {
  id: string;
  codename: string;
  action: string;
  timeAgo: string;
  accent: string;
}

const INITIAL_FEED: OperativeFeedItem[] = [
  {
    id: '1',
    codename: 'LAGOS_OP_84',
    action: 'Cleared 20/20 Chemistry Thermodynamics (36s avg pace)',
    timeAgo: 'Just now',
    accent: '#ccff00',
  },
  {
    id: '2',
    codename: 'ABUJA_OP_19',
    action: 'Elevated projected UTME score to 338/400 (UNILAG Medicine Track)',
    timeAgo: '2m ago',
    accent: '#00f0ff',
  },
  {
    id: '3',
    codename: 'IBADAN_OP_07',
    action: 'Extended Focus Streak to 21 Consecutive Days',
    timeAgo: '5m ago',
    accent: '#f59e0b',
  },
  {
    id: '4',
    codename: 'ENUGU_OP_42',
    action: 'Mastered Grammatical Concord & Proximity in Use of English',
    timeAgo: '8m ago',
    accent: '#ff5e62',
  },
  {
    id: '5',
    codename: 'PH_OP_11',
    action: 'Logged 94% diagnostic accuracy in Physics Optics drill',
    timeAgo: '12m ago',
    accent: '#ccff00',
  },
];

export const SyndicateDeskView: React.FC<SyndicateDeskViewProps> = ({
  profile,
  onNavigateToDrill,
}) => {
  const [feed, setFeed] = useState<OperativeFeedItem[]>(INITIAL_FEED);
  const [dailyCollectiveProgress, setDailyCollectiveProgress] = useState(19420);
  const [activeGuide, setActiveGuide] = useState<ScreenGuideContent | null>(null);
  const dailyQuotaGoal = 25000;
  const collectivePercent = Math.min(100, Math.round((dailyCollectiveProgress / dailyQuotaGoal) * 100));

  // Pulse simulation adds realistic ambient syndicate telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setDailyCollectiveProgress((prev) => Math.min(dailyQuotaGoal, prev + Math.floor(Math.random() * 3) + 1));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const personalQuestionsContributed = (profile.totalQuestionsAnswered % 50) + 18;

  return (
    <div className="w-full pb-32 pt-6 px-4 space-y-6 animate-fadeIn">
      {/* Editorial Title */}
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal tracking-tight text-stone-900 dark:text-stone-100">
            Syndicate Desk
          </h1>
          <InfoTrigger
            onClick={() =>
              setActiveGuide({
                title: 'UTME 2025 Cohort Syndicate',
                subtitle: 'Collective Candidate Quota & Readiness Index',
                badge: 'Syndicate Protocol',
                icon: Radio,
                description: [
                  'The Syndicate anonymously pools drill accuracy and question volume from top UTME candidates across Nigeria.',
                  'When the collective national daily quota hits 100%, high-yield formula dossiers and verified syllabus cheat sheets unlock for all operatives.',
                ],
                tips: [
                  'Every drill question you answer directly increments the national community quota.',
                  'Operatives in the Top 5% percentile gain early access to university post-UTME composite predictors.',
                ],
              })
            }
            label="View Syndicate Guide"
          />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 dark:bg-stone-800 text-xs font-mono text-[#ccff00] border border-stone-800">
          <Radio className="h-3 w-3 animate-pulse" />
          <span>COHORT // '25</span>
        </div>
      </section>

      {/* Hero Collective Quota Tracker Card */}
      <div className="rounded-3xl border border-stone-800/80 bg-[#0c0e12] text-white p-6 shadow-2xl relative overflow-hidden space-y-5">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #ccff00 1px, transparent 0)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="flex items-start justify-between relative">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full animate-pulse bg-[#ccff00]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ccff00]">
                DAILY COLLECTIVE QUOTA
              </span>
            </div>
            <h2 className="text-2xl font-bold font-ui mt-1">
              National Candidate Pool
            </h2>
            <p className="text-xs font-mono text-stone-400 mt-0.5">
              Target: 25,000 Questions Cracked Today to Unlock Bonus Dossier
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-stone-400 block uppercase">
              Cohort Readiness
            </span>
            <span className="text-3xl font-mono font-extrabold text-[#ccff00] tracking-tight">
              74.8%
            </span>
          </div>
        </div>

        {/* Progress Bar & Counter */}
        <div className="space-y-2 relative">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white font-bold tabular-nums">
              <CountUp value={dailyCollectiveProgress} /> / {dailyQuotaGoal.toLocaleString()} Questions
            </span>
            <span className="text-[#ccff00] font-bold">
              {collectivePercent}% Completed
            </span>
          </div>

          {/* High-vibe segmented energy bar */}
          <div className="h-3.5 w-full bg-stone-900 rounded-xl overflow-hidden p-0.5 border border-stone-800 flex gap-0.5">
            {[...Array(25)].map((_, i) => {
              const active = (collectivePercent / 100) * 25 > i;
              return (
                <div
                  key={i}
                  className={`h-full flex-1 rounded-xs transition-all ${
                    active ? 'bg-[#ccff00]' : 'bg-stone-800/60'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Collective Daily Reward Status */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 relative text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#ccff00]/15 text-[#ccff00] flex items-center justify-center">
              <Gift className="h-4 w-4" />
            </div>
            <div>
              <span className="text-white font-bold block">
                Bonus Dossier: 2025 Physics Hard Derivations & Lexis Keys
              </span>
              <span className="text-[10px] text-stone-400">
                Unlocks automatically once quota reaches 100% (5,580 questions remaining)
              </span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold text-amber-400 px-2 py-1 rounded-md bg-amber-400/10 border border-amber-400/20">
            Pending Quota
          </span>
        </div>
      </div>

      {/* Candidate Operative Standing Card */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-5 text-center paper-shadow">
          <span className="text-[10px] font-mono uppercase text-stone-400 block">
            SYNDICATE RANK
          </span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 block mt-1">
            Top 2.4%
          </span>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
            Tier-1 Merit
          </span>
        </div>

        <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-5 text-center paper-shadow">
          <span className="text-[10px] font-mono uppercase text-stone-400 block">
            TODAY'S SHARE
          </span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 block mt-1">
            +{personalQuestionsContributed}
          </span>
          <span className="text-[10px] font-mono text-stone-500">
            To Daily Quota
          </span>
        </div>

        <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-5 text-center paper-shadow">
          <span className="text-[10px] font-mono uppercase text-stone-400 block">
            ACTIVE SQUAD
          </span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 block mt-1">
            14.2k
          </span>
          <span className="text-[10px] font-mono text-[#00f0ff]">
            Operatives Online
          </span>
        </div>
      </div>

      {/* Live Anonymous Operative Telemetry Pulse */}
      <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <h3 className="font-editorial text-lg font-medium text-stone-900 dark:text-stone-100">
              Live Operative Stream
            </h3>
          </div>
          <span className="text-xs font-mono text-stone-400">
            Real-time Telemetry
          </span>
        </div>

        <div className="space-y-2.5">
          {feed.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800 text-xs font-mono transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.accent }}
                />
                <div className="min-w-0">
                  <span className="font-bold text-stone-900 dark:text-stone-100 block truncate">
                    {item.codename}
                  </span>
                  <span className="text-stone-500 dark:text-stone-400 text-[11px] block truncate">
                    {item.action}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-stone-400 shrink-0 ml-2">
                {item.timeAgo}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Contextual Screen Guide */}
      <ScreenGuideSheet
        isOpen={activeGuide !== null}
        onClose={() => setActiveGuide(null)}
        guide={activeGuide}
      />
    </div>
  );
};
