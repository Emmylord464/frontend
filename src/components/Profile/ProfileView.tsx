import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserProfile, CourseTrack, Department, ThemeMode } from '../../types';
import { INITIAL_COURSE_TRACKS } from '../../data/jambData';
import { playTapSound, playCorrectSound } from '../../utils/audio';
import { applyTheme } from '../../utils/theme';
import { CountUp } from '../Motion/CountUp';
import {
  Flame,
  Target,
  Award,
  BookCheck,
  ShieldCheck,
  ChevronDown,
  Plus,
  Minus,
  Sparkles,
  LogOut,
  RefreshCw,
  Lock,
  Unlock,
  Share2,
  Sun,
  Moon,
  Settings,
  ArrowRight,
  BookOpen,
  Building2,
  Radio,
} from 'lucide-react';
import { CelebratoryConfetti } from '../Effects/CelebratoryConfetti';
import { ShareScoreModal } from '../Modals/ShareScoreModal';
import { ScreenGuideSheet, InfoTrigger, ScreenGuideContent } from '../Modals/ScreenGuideSheet';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onStartDrillForSubject?: (subjectId: string) => void;
  onSignOut?: () => void;
  onReplayIntro?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToAdmissions?: () => void;
  onNavigateToSyndicate?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onStartDrillForSubject,
  onSignOut,
  onReplayIntro,
  onNavigateToSettings,
  onNavigateToAdmissions,
  onNavigateToSyndicate,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [streakNotification, setStreakNotification] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeGuide, setActiveGuide] = useState<ScreenGuideContent | null>(null);

  // SVG Gauge calculations
  // JAMB maximum possible score is 400
  const maxScore = 400;
  const radius = 68;
  const circumference = 2 * Math.PI * radius; // ~427.25
  const progressRatio = Math.min(profile.targetScore / maxScore, 1);
  const strokeDashoffset = circumference - progressRatio * circumference;

  const currentScoreRatio = Math.min(profile.currentEstimatedScore / profile.targetScore, 1);
  const currentCircumference = circumference * 0.85; // inner or secondary ring
  const currentDashoffset = currentCircumference - currentScoreRatio * currentCircumference;

  const handleTargetChange = (newTarget: number) => {
    const clamped = Math.max(200, Math.min(400, newTarget));
    onUpdateProfile({ targetScore: clamped });
    playTapSound();
  };

  const handleSelectTrack = (track: CourseTrack) => {
    onUpdateProfile({
      courseTrack: track,
      targetScore: Math.max(profile.targetScore, track.targetCutoff),
    });
    setIsDropdownOpen(false);
    playTapSound();
  };

  const handleClaimDailyStreak = () => {
    playTapSound();
    setShowConfetti(true);

    if (!profile.studiedToday) {
      const nextDays = profile.streakDays + 1;
      onUpdateProfile({
        streakDays: nextDays,
        studiedToday: true,
      });
      setStreakNotification(`Goal hit! Day ${nextDays} streak recorded & protected.`);
    } else {
      setStreakNotification(`Day ${profile.streakDays} streak active! Keep up the momentum.`);
    }

    setTimeout(() => setStreakNotification(null), 4000);
  };

  const handleToggleTheme = () => {
    playTapSound();
    const next: ThemeMode = (profile.themeMode || 'light') === 'dark' ? 'light' : 'dark';
    onUpdateProfile({ themeMode: next });
    applyTheme(next);
  };

  const handleToggleEnglishLock = () => {
    playTapSound();
    playCorrectSound();
    onUpdateProfile({ englishUnlocked: !profile.englishUnlocked });
  };

  const presetTargets = [280, 300, 320, 340, 360];

  return (
    <div className="w-full pb-32 pt-6 px-4 space-y-7 animate-fadeIn">
      {/* Editorial Header - Pure Serif Header with Delicate Info Trigger */}
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal tracking-tight text-[#1C1D1B] dark:text-[#F4F4F2]">
            Candidate Dossier
          </h1>
          <InfoTrigger
            onClick={() =>
              setActiveGuide({
                title: 'Candidate Dossier',
                subtitle: 'UTME 2025 Verification Protocol',
                badge: 'Profile Overview',
                icon: ShieldCheck,
                description: [
                  'Your Candidate Dossier stores your official examination profile, academic departmental stream, and target cutoff pace.',
                  'Target scores and accuracy diagnostics dynamically update your projected performance based on verified JAMB past questions.',
                ],
                tips: [
                  'Keep your target score aligned with your chosen course cut-off benchmark.',
                  'Use your Study Pass to unlock English and full multi-subject past mock questions.',
                ],
              })
            }
            label="View Dossier Guide"
          />
        </div>
        <span className="text-xs uppercase tracking-widest text-[#828581] dark:text-[#949793] font-ui font-medium">
          UTME 2025
        </span>
      </section>

      {/* Candidate Badge Card with Machined Edge */}
      <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 text-stone-900 dark:text-stone-100 font-editorial text-xl font-semibold border border-black/[0.06] dark:border-white/[0.08] ring-1 ring-inset ring-black/5 dark:ring-white/10">
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <h2 className="font-editorial text-lg font-medium tracking-tight leading-none text-stone-900 dark:text-stone-100">
                  {profile.name}
                </h2>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-ui">
                  Scholar Candidate
                </span>
              </div>
              <div className="flex items-baseline gap-2 text-xs text-stone-500 dark:text-stone-400 font-ui">
                <span className="font-mono">{profile.jambRegNumber}</span>
                <span>·</span>
                <span className="truncate max-w-[150px]">{profile.email}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-ui font-medium leading-none">
              Est. Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-3xl font-semibold text-stone-900 dark:text-stone-100 tabular-nums leading-none">
                <CountUp value={profile.currentEstimatedScore} />
              </span>
              <span className="text-xs text-stone-400 font-mono leading-none">/400</span>
            </div>
          </div>
        </div>

        {/* Modern Dossier, Oracle & Syndicate Action Deck (Flush Container & Concentric Nested Radii) */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ccff00] animate-pulse" />
              <span>INTELLIGENCE & SHARING</span>
            </div>
            <span>UTME '25</span>
          </div>

          <div className="p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            <button
              onClick={() => {
                playTapSound();
                setIsShareModalOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-2.5 px-3 text-xs font-mono font-bold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              <Share2 className="h-3.5 w-3.5 text-[#ccff00] dark:text-emerald-700" strokeWidth={1.5} />
              <span>Send Dossier</span>
            </button>

            {onNavigateToAdmissions && (
              <button
                onClick={() => {
                  playTapSound();
                  onNavigateToAdmissions();
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-stone-900/60 text-stone-800 dark:text-stone-200 py-2.5 px-3 text-xs font-mono hover:border-stone-400 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Building2 className="h-3.5 w-3.5 text-blue-500" strokeWidth={1.5} />
                <span>Admissions Oracle</span>
              </button>
            )}

            {onNavigateToSyndicate && (
              <button
                onClick={() => {
                  playTapSound();
                  onNavigateToSyndicate();
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-stone-900/60 text-stone-800 dark:text-stone-200 py-2.5 px-3 text-xs font-mono hover:border-stone-400 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" strokeWidth={1.5} />
                <span>Syndicate Desk</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Academic Stream & Subject Access Policy Strip with Machined Edge */}
      <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            <h3 className="font-editorial text-base font-semibold tracking-tight leading-tight text-stone-900 dark:text-stone-100">
              Academic Stream & Subject Access
            </h3>
            <InfoTrigger
              onClick={() =>
                setActiveGuide({
                  title: 'Academic Stream Policy',
                  subtitle: 'Curriculum Access Control',
                  badge: 'UTME Regulations',
                  icon: ShieldCheck,
                  description: [
                    'Curriculum access is strictly segmented by your registered UTME stream (Sciences, Commercial, or Arts & Humanities).',
                    'Use of English is universally compulsory for all Nigerian candidates and can be toggled using your Study Pass.',
                  ],
                  tips: [
                    'Sciences: Mathematics, Physics, Chemistry, Biology, Agriculture, Geography.',
                    'Commercial: Economics, Commerce.',
                    'Arts: Government, Literature in English, Christian Religious Studies.',
                  ],
                })
              }
              label="View Academic Stream Guide"
            />
          </div>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-ui">
            {profile.department || 'Sciences'} Active
          </span>
        </div>

        {/* 3 Department Tracks (Concentric Rounded-2xl Buttons) */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {(['Sciences', 'Commercial', 'Arts'] as Department[]).map((dept) => {
            const isCurrent = (profile.department || 'Sciences') === dept;
            return (
              <button
                key={dept}
                onClick={() => {
                  playTapSound();
                  playCorrectSound();
                  onUpdateProfile({ department: dept });
                }}
                className={`relative py-3 px-2 rounded-2xl text-xs font-ui border transition-all duration-200 text-center cursor-pointer active:scale-[0.98] ${
                  isCurrent
                    ? 'border-emerald-600/70 dark:border-emerald-500/70 text-emerald-900 dark:text-emerald-200 font-semibold shadow-2xs'
                    : 'border-black/[0.06] dark:border-white/[0.08] bg-black/5 dark:bg-white/5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:opacity-90'
                }`}
              >
                {isCurrent && (
                  <motion.div
                    layoutId="activeProfileDepartmentTrack"
                    className="absolute inset-0 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 -z-10 ring-1 ring-inset ring-black/5 dark:ring-white/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="block font-medium">{dept}</span>
                <span className="text-[9px] opacity-75 mt-0.5 block truncate font-mono">
                  {dept === 'Sciences' ? 'Sciences' : dept === 'Commercial' ? 'Commercial' : 'Arts & Hum'}
                </span>
              </button>
            );
          })}
        </div>

        {/* English Access Lock Status Row (Flush Material Block) */}
        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              profile.englishUnlocked
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
            }`}>
              {profile.englishUnlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-stone-900 dark:text-stone-100 leading-tight font-ui">
                Use of English Access
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-ui leading-tight">
                {profile.englishUnlocked ? 'Unlocked via Study Pass' : 'Locked core subject'}
              </span>
            </div>
          </div>

          <button
            onClick={handleToggleEnglishLock}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-ui transition-all duration-200 ease-out flex items-center gap-1 cursor-pointer active:scale-[0.98] ${
              profile.englishUnlocked
                ? 'bg-black/5 dark:bg-white/10 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 border border-black/[0.06] dark:border-white/[0.08]'
                : 'btn-matte shadow-xs'
            }`}
          >
            {profile.englishUnlocked ? (
              <>
                <Lock className="h-3 w-3" strokeWidth={1.5} />
                <span>Lock</span>
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3" strokeWidth={1.5} />
                <span>Unlock Pass</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Target Score & Live Animating Circular Gauge (Spacious p-6) */}
      <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs uppercase tracking-widest font-medium text-stone-500 dark:text-stone-400 font-ui leading-none">
                Goal Pacing
              </span>
              <h3 className="font-editorial text-xl font-normal leading-tight tracking-tight text-stone-900 dark:text-stone-100">
                Target UTME Score
              </h3>
            </div>
            <InfoTrigger
              onClick={() =>
                setActiveGuide({
                  title: 'Target Score Calibration',
                  subtitle: 'UTME Maximum: 400 Marks',
                  badge: 'Goal Setting',
                  icon: Target,
                  description: [
                    'Your target score directly dictates your study pace and question difficulty recommendations.',
                    'The outer solid ring tracks your selected benchmark, while the amber inner arc tracks your current diagnostic estimate.',
                  ],
                  tips: [
                    'Maintain a target at least 15–20 marks higher than your desired university faculty cutoff.',
                    'Preset pills allow instant snapping to competitive admission tiers.',
                  ],
                })
              }
              label="View Target Score Guide"
            />
          </div>
          <div className="flex items-baseline gap-1 rounded-full bg-black/5 dark:bg-white/5 px-3 py-1 border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-stone-800 dark:text-stone-200 font-ui tabular-nums">
            <Target className="h-3 w-3 text-stone-500 dark:text-stone-400 self-center" strokeWidth={1.5} />
            <span className="font-mono font-bold leading-none">{Math.round((profile.targetScore / 400) * 100)}</span>
            <span className="text-[10px] font-mono text-stone-400 leading-none">% of Max</span>
          </div>
        </div>

        {/* Circular SVG Progress Gauge */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative flex items-center justify-center">
            <svg
              className="h-44 w-44 -rotate-90 transform transition-all duration-[1200ms] ease-out"
              viewBox="0 0 160 160"
            >
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-stone-100 dark:stroke-stone-800"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Target Score Arc */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-stone-900 dark:stroke-stone-100 transition-all duration-[1200ms] ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
              {/* Estimated Current Score Indicator (Terracotta) */}
              <circle
                cx="80"
                cy="80"
                r={radius - 12}
                className="stroke-amber-600 dark:stroke-amber-400 transition-all duration-[1200ms] ease-out"
                strokeWidth="4"
                strokeDasharray={circumference * 0.85}
                strokeDashoffset={currentDashoffset}
                strokeLinecap="round"
                fill="transparent"
                opacity="0.85"
              />
            </svg>

            {/* Inner Content Display with Perfect Baselines */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-1">
              <span className="text-[11px] uppercase tracking-widest text-stone-500 dark:text-stone-400 font-medium font-ui leading-none">
                Target Score
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-editorial text-4xl font-normal text-stone-900 dark:text-stone-100 tracking-tight tabular-nums leading-none">
                  <CountUp value={profile.targetScore} />
                </span>
                <span className="text-xs text-stone-400 font-mono leading-none">/400</span>
              </div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-ui font-medium leading-none">
                {profile.courseTrack?.name.split(' ')[0] || 'Target'} Benchmark
              </span>
            </div>
          </div>
        </div>

        {/* Stepper Buttons & Preset Pills (Flush Stamped Aesthetic) */}
        <div className="flex flex-col gap-3 pt-1">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handleTargetChange(profile.targetScore - 5)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/5 dark:bg-white/5 text-stone-900 dark:text-stone-100 hover:opacity-90 active:scale-[0.98] duration-200 ease-out transition-all cursor-pointer ring-1 ring-inset ring-black/5 dark:ring-white/10"
              title="Decrease target by 5 marks"
            >
              <Minus className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <span className="text-xs font-mono font-medium text-stone-700 dark:text-stone-300 tabular-nums px-2">
              ± 5 marks
            </span>
            <button
              onClick={() => handleTargetChange(profile.targetScore + 5)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/5 dark:bg-white/5 text-stone-900 dark:text-stone-100 hover:opacity-90 active:scale-[0.98] duration-200 ease-out transition-all cursor-pointer ring-1 ring-inset ring-black/5 dark:ring-white/10"
              title="Increase target by 5 marks"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {presetTargets.map((pt) => {
              const active = profile.targetScore === pt;
              return (
                <button
                  key={pt}
                  onClick={() => handleTargetChange(pt)}
                  className={`px-3 py-1 rounded-full text-xs font-ui transition-all duration-200 ease-out tabular-nums cursor-pointer active:scale-[0.98] ${
                    active
                      ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 font-semibold shadow-xs ring-1 ring-inset ring-black/5 dark:ring-white/10'
                      : 'border border-black/[0.06] dark:border-white/[0.08] bg-black/5 dark:bg-white/5 text-stone-600 dark:text-stone-400 hover:opacity-90'
                  }`}
                >
                  {pt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dream Course Track & Cutoff Card with Machined Edge */}
      <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-medium font-ui leading-none">
                Program Selection
              </span>
              <h3 className="font-editorial text-xl font-normal leading-tight tracking-tight text-stone-900 dark:text-stone-100">
                Target Degree Course
              </h3>
            </div>
            <InfoTrigger
              onClick={() =>
                setActiveGuide({
                  title: 'Degree Course Selection',
                  subtitle: 'University Faculty Alignment',
                  badge: 'Curriculum Pacing',
                  icon: BookOpen,
                  description: [
                    'Selecting your registered undergraduate program determines the mandatory 4 UTME subjects and minimum admission cut-off threshold.',
                    'The system validates each answer against syllabus question pools required specifically for this course.',
                  ],
                  tips: [
                    'Ensure your chosen degree subject combination strictly matches your university of first choice requirements.',
                  ],
                })
              }
              label="View Degree Course Guide"
            />
          </div>
          <span className="text-xs font-mono font-medium text-stone-600 dark:text-stone-300 border border-black/[0.06] dark:border-white/[0.08] bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full">
            {profile.courseTrack?.competitiveness || 'High'} Demand
          </span>
        </div>

        {/* Selected Course Display Button (Flush Stamped Surface) */}
        <div className="relative">
          <button
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              playTapSound();
            }}
            className="w-full flex items-center justify-between rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-black/5 dark:bg-white/5 p-3.5 text-left text-xs font-ui hover:border-stone-400 transition-all cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <span className="font-editorial text-base font-semibold leading-tight text-stone-900 dark:text-stone-100 block">
                {profile.courseTrack?.name || 'Medicine & Surgery'}
              </span>
              <div className="flex items-baseline gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-ui">
                <span>{profile.courseTrack?.faculty}</span>
                <span>·</span>
                <span>Min Cut-Off:</span>
                <strong className="font-mono text-stone-900 dark:text-white font-semibold leading-none">
                  {profile.courseTrack?.targetCutoff}
                </strong>
                <span className="text-[10px] font-mono text-stone-400">pts</span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-stone-400" />
          </button>

          {/* Dropdown Menu (Concentric Rounded-2xl with Rounded-xl items) */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 z-30 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1C1D1F] p-2 paper-shadow-lifted flex flex-col gap-1">
              {INITIAL_COURSE_TRACKS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTrack(t)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-ui transition-colors cursor-pointer ${
                    profile.courseTrack?.id === t.id
                      ? 'bg-black/5 dark:bg-white/10 font-semibold text-stone-900 dark:text-white'
                      : 'text-stone-600 dark:text-stone-300 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="block font-medium">{t.name}</span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {t.faculty} · Min: {t.targetCutoff} pts
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono text-stone-700 dark:text-stone-300">
                    {t.targetCutoff}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4 Required Subjects for Course (Concentric Rounded-xl with Flush Material) */}
        <div className="flex flex-col gap-2 pt-1">
          <span className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-medium font-ui leading-none">
            Mandatory 4 UTME Subjects
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(profile.courseTrack?.requiredSubjects || [
              'Use of English',
              'Biology',
              'Chemistry',
              'Physics',
            ]).map((sub) => {
              const isEng = sub === 'Use of English';
              return (
                <div
                  key={sub}
                  className="flex items-center justify-between rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/5 dark:bg-white/5 px-3 py-2.5 text-xs font-ui text-stone-900 dark:text-stone-100"
                >
                  <span className="truncate">{sub}</span>
                  {isEng ? (
                    <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-0.5 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                      <Lock className="h-2.5 w-2.5" />
                      <span>Core</span>
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                      Active
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Preparation Vitals with Machined Edge & Perfect Baselines */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-ui">
            <BookCheck className="h-4 w-4 text-stone-800 dark:text-stone-200" strokeWidth={1.5} />
            <span>Total Answered</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-semibold text-stone-900 dark:text-stone-100 tabular-nums leading-none">
              <CountUp value={profile.totalQuestionsAnswered} />
            </span>
            <span className="text-xs text-stone-400 font-mono leading-none">Qs</span>
          </div>
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-ui leading-none pt-0.5">
            +45 this week
          </span>
        </div>

        <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-ui">
            <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
            <span>Accuracy Rate</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-3xl font-semibold text-stone-900 dark:text-stone-100 tabular-nums leading-none">
              <CountUp value={profile.accuracyRate} />
            </span>
            <span className="text-sm font-mono text-stone-400 leading-none">%</span>
          </div>
          <span className="text-xs text-stone-400 font-ui leading-none pt-0.5">
            Past 100 questions
          </span>
        </div>
      </div>

      {/* Sensory & Theme Focus Controls (Spacious p-6) */}
      <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-medium font-ui leading-none">
                Sensory Environment
              </span>
              <h3 className="font-editorial text-xl font-normal leading-tight tracking-tight text-stone-900 dark:text-stone-100">
                Night Scholar Theme
              </h3>
            </div>
            <InfoTrigger
              onClick={() =>
                setActiveGuide({
                  title: 'Night Scholar Environment',
                  subtitle: 'Sensory Calibration & Contrast',
                  badge: 'Aesthetic System',
                  icon: Moon,
                  description: [
                    'Switch effortlessly between crisp paper off-white (#FBFBF9) and the deep charcoal Night Scholar focus mode engineered for low-glare study sessions.',
                    'The visual palette is tuned with precise WCAG AA optical compensation to minimize eye fatigue during extended CBT drill blocks.',
                  ],
                })
              }
              label="View Theme Guide"
            />
          </div>
          <button
            onClick={handleToggleTheme}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/5 dark:bg-white/5 text-xs font-medium text-stone-900 dark:text-stone-100 hover:opacity-90 active:scale-[0.98] duration-200 ease-out transition-all cursor-pointer font-ui ring-1 ring-inset ring-black/5 dark:ring-white/10"
          >
            {(profile.themeMode || 'light') === 'dark' ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" strokeWidth={1.5} />
                <span>Daylight</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                <span>Night Scholar</span>
              </>
            )}
          </button>
        </div>

        {onNavigateToSettings && (
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-ui">
              More alarms & reminders in settings
            </span>
            <button
              onClick={() => {
                playTapSound();
                onNavigateToSettings();
              }}
              className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1 hover:opacity-90 active:scale-[0.98] duration-200 ease-out cursor-pointer"
            >
              <span>Settings</span>
              <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>

      {/* Account Session Actions */}
      <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-ui font-medium leading-none">
            Candidate Session
          </span>
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-ui font-medium leading-none">
            Registered · All Diagnostics Synced
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {onReplayIntro && (
            <button
              onClick={() => {
                playTapSound();
                onReplayIntro();
              }}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-black/5 dark:bg-white/5 p-3 text-xs font-medium text-stone-900 dark:text-stone-100 hover:opacity-90 active:scale-[0.98] duration-200 ease-out transition-all font-ui cursor-pointer ring-1 ring-inset ring-black/5 dark:ring-white/10"
            >
              <RefreshCw className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
              <span>Replay Intro</span>
            </button>
          )}

          {onSignOut && (
            <button
              onClick={() => {
                playTapSound();
                onSignOut();
              }}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-black/5 dark:bg-white/5 p-3 text-xs font-medium text-amber-700 dark:text-amber-400 hover:opacity-90 active:scale-[0.98] duration-200 ease-out transition-all font-ui cursor-pointer ring-1 ring-inset ring-black/5 dark:ring-white/10"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Celebratory Confetti Particle System */}
      {showConfetti && (
        <CelebratoryConfetti
          streakDays={profile.streakDays}
          onClose={() => setShowConfetti(false)}
        />
      )}

      {/* Share Score to Friends & Family Modal */}
      <ShareScoreModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={profile}
      />

      {/* Contextual Screen Guide Bottom Sheet */}
      <ScreenGuideSheet
        isOpen={activeGuide !== null}
        onClose={() => setActiveGuide(null)}
        guide={activeGuide}
      />
    </div>
  );
};

