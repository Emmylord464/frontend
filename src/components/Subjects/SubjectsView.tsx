import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Subject, SubjectCategory, Department } from '../../types';
import { CountUp } from '../Motion/CountUp';
import { playTapSound, playCorrectSound, playIncorrectSound } from '../../utils/audio';
import { isSubjectAccessible, getSubjectRestrictionReason } from '../../utils/departmentAccess';
import {
  Search,
  X,
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  Leaf,
  TrendingUp,
  Landmark,
  Scroll,
  Globe,
  Wheat,
  Receipt,
  Church,
  ArrowRight,
  Flame,
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Target,
} from 'lucide-react';
import { ScreenGuideSheet, InfoTrigger, ScreenGuideContent } from '../Modals/ScreenGuideSheet';

interface SubjectsViewProps {
  subjects: Subject[];
  userDepartment?: Department;
  englishUnlocked?: boolean;
  dailyGoal?: number;
  dailyProgressBySubject?: Record<string, number>;
  onSelectSubject: (subjectId: string) => void;
  onUpdateDepartment?: (department: Department) => void;
  onUnlockEnglish?: () => void;
  onUpdateDailyGoal?: (goal: number) => void;
}

const CATEGORIES: SubjectCategory[] = [
  'All',
  'Sciences',
  'Commercial',
  'Arts',
  'Languages',
];

const DEFAULT_DAILY_PROGRESS: Record<string, number> = {
  maths: 11,
  physics: 8,
  chemistry: 6,
  biology: 14,
  english: 0,
  economics: 5,
  government: 9,
  literature: 4,
  geography: 2,
  agric: 6,
  commerce: 4,
  crs: 10,
};

const DEPARTMENTS: { id: Department; label: string; icon: string; subjectsSummary: string }[] = [
  { id: 'Sciences', label: 'Sciences Track', icon: 'Atom', subjectsSummary: 'Maths, Physics, Chem, Bio, Geo, Agric' },
  { id: 'Commercial', label: 'Commercial Track', icon: 'TrendingUp', subjectsSummary: 'Economics, Commerce' },
  { id: 'Arts', label: 'Arts & Humanities', icon: 'Scroll', subjectsSummary: 'Government, Literature, C.R.S.' },
];

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  Leaf,
  TrendingUp,
  Landmark,
  Scroll,
  Globe,
  Wheat,
  Receipt,
  Church,
};

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  userDepartment = 'Sciences',
  englishUnlocked = false,
  dailyGoal = 50,
  dailyProgressBySubject,
  onSelectSubject,
  onUpdateDepartment,
  onUnlockEnglish,
  onUpdateDailyGoal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [lockedSubjectPrompt, setLockedSubjectPrompt] = useState<Subject | null>(null);
  const [activeGuide, setActiveGuide] = useState<ScreenGuideContent | null>(null);

  // Daily study goal pacing calculations
  const targetPerSubject = Math.max(10, Math.ceil(dailyGoal / 4));

  const totalQuestionsAnsweredToday = useMemo(() => {
    return subjects.reduce((sum, s) => {
      const isLockedEnglish = (s.id === 'english' || s.name === 'Use of English') && !englishUnlocked;
      if (isLockedEnglish) return sum;
      const count = (dailyProgressBySubject && typeof dailyProgressBySubject[s.id] === 'number')
        ? dailyProgressBySubject[s.id]
        : (DEFAULT_DAILY_PROGRESS[s.id] ?? 0);
      return sum + count;
    }, 0);
  }, [subjects, dailyProgressBySubject, englishUnlocked]);

  const overallDailyPercentage = Math.min(100, Math.round((totalQuestionsAnsweredToday / dailyGoal) * 100));

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const matchesCategory =
        selectedCategory === 'All' || subject.category === selectedCategory;
      const matchesSearch =
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.topics.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [subjects, selectedCategory, searchQuery]);

  const handleCardClick = (subject: Subject) => {
    const accessible = isSubjectAccessible(subject, userDepartment, englishUnlocked);

    if (!accessible) {
      playIncorrectSound();
      setLockedSubjectPrompt(subject);
      return;
    }

    playTapSound();
    setSelectedSubjectId(subject.id);
    setTimeout(() => {
      onSelectSubject(subject.id);
    }, 180);
  };

  const handleSwitchDepartmentAndOpen = (targetDepartment: Department) => {
    playTapSound();
    playCorrectSound();
    if (onUpdateDepartment) {
      onUpdateDepartment(targetDepartment);
    }
    const targetSub = lockedSubjectPrompt;
    setLockedSubjectPrompt(null);
    if (targetSub) {
      setTimeout(() => {
        onSelectSubject(targetSub.id);
      }, 150);
    }
  };

  const handleUnlockEnglishAction = () => {
    playTapSound();
    playCorrectSound();
    if (onUnlockEnglish) {
      onUnlockEnglish();
    }
    setLockedSubjectPrompt(null);
    setTimeout(() => {
      onSelectSubject('english');
    }, 180);
  };

  return (
    <div className="w-full pb-32 pt-6 px-4 space-y-7 animate-fadeIn">
      {/* Title & Delicate Info Trigger - Clean Editorial Header */}
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal tracking-tight text-[#1C1D1B] dark:text-[#F4F4F2]">
            Syllabus & Access
          </h1>
          <InfoTrigger
            onClick={() =>
              setActiveGuide({
                title: 'Syllabus & Curriculum Access',
                subtitle: 'JAMB UTME Official Regulations',
                badge: 'Curriculum Guide',
                icon: BookOpen,
                description: [
                  'Targeted curriculum for your registered UTME stream. Select any verified subject to drill past examination questions.',
                  'Each candidate practices the 4 subjects prescribed by the Joint Admissions and Matriculation Board for their chosen faculty.',
                ],
                tips: [
                  'Tap any unlocked subject card to start timed question drilling with immediate step-by-step solutions.',
                  'Switch your departmental stream above to access subjects in Sciences, Commercial, or Arts.',
                ],
              })
            }
            label="View Syllabus Guide"
          />
        </div>
        <span className="text-xs uppercase tracking-widest text-[#828581] dark:text-[#949793] font-ui font-medium">
          UTME 2025
        </span>
      </section>

      {/* Department Stream Selection Banner (Spacious p-6) */}
      <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-900 dark:text-stone-100 font-ui">
              Registered Candidate Stream
            </span>
            <InfoTrigger
              onClick={() =>
                setActiveGuide({
                  title: 'Candidate Stream Control',
                  subtitle: 'Subject Eligibility & Quotas',
                  badge: 'Stream Policy',
                  icon: ShieldCheck,
                  description: [
                    'Departmental tracks prevent preparing for inappropriate combinations and reflect genuine university requirements.',
                    'Sciences candidates drill STEM papers; Commercial prepares for business and accounting disciplines; Arts focuses on law, media, and humanities.',
                  ],
                })
              }
              label="View Stream Policy Guide"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-ui">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            <span>{userDepartment} Active</span>
          </div>
        </div>

        {/* Stream Switcher Buttons */}
        <div className="grid grid-cols-3 gap-2.5">
          {DEPARTMENTS.map((dept) => {
            const isCurrent = userDepartment === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => {
                  playTapSound();
                  if (onUpdateDepartment) onUpdateDepartment(dept.id);
                }}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 ease-out active:scale-[0.98] font-ui cursor-pointer ring-1 ring-inset ring-black/5 dark:ring-white/10 ${
                  isCurrent
                    ? 'border-emerald-600/60 dark:border-emerald-500/60 text-emerald-900 dark:text-emerald-200 shadow-2xs font-semibold'
                    : 'border-stone-200/70 dark:border-stone-800/70 bg-stone-50/50 dark:bg-stone-900/40 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:opacity-90'
                }`}
              >
                {isCurrent && (
                  <motion.div
                    layoutId="activeDepartmentTrack"
                    className="absolute inset-0 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 -z-10 ring-1 ring-inset ring-black/5 dark:ring-white/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="text-xs font-medium">{dept.label}</span>
                <span className="text-[10px] mt-0.5 opacity-75 truncate max-w-full font-mono">
                  {dept.id === 'Sciences' ? 'Sciences' : dept.id === 'Commercial' ? 'Commercial' : 'Arts & Hum'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#F4F4F0] dark:border-[#2B2C30] text-xs text-[#828581] dark:text-[#949793] font-ui">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-[#BA5D38] shrink-0" />
            <span>Use of English: <strong>Core</strong></span>
          </div>
          {englishUnlocked ? (
            <span className="text-[10px] font-semibold text-[#426E55] dark:text-[#88C09D] flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Study Pass Active</span>
            </span>
          ) : (
            <button
              onClick={() => {
                playTapSound();
                if (onUnlockEnglish) onUnlockEnglish();
              }}
              className="text-[10px] font-semibold uppercase tracking-wider text-[#BA5D38] dark:text-[#E28D6E] hover:underline cursor-pointer"
            >
              Unlock English Pass
            </button>
          )}
        </div>
      </div>

      {/* Daily Study Goal Pacing Banner */}
      <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 shrink-0 ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <Target className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-stone-900 dark:text-stone-100 font-ui">
                  Daily Study Goal
                </span>
                <InfoTrigger
                  onClick={() =>
                    setActiveGuide({
                      title: 'Daily Study Goal & Pacing',
                      subtitle: 'Balanced Multi-Subject Velocity',
                      badge: 'Study Strategy',
                      icon: Target,
                      description: [
                        `Your daily quota is calibrated to ${dailyGoal} total questions across your 4 UTME subjects (~${targetPerSubject} questions per subject).`,
                        'Distributed multi-subject drilling creates higher retention than single-subject cramming, replicating the 4-subject CBT format.',
                      ],
                      tips: [
                        'Complete the daily quota consistently to maintain your Day Streak and earn Freeze Tokens.',
                        'Subject progress bars reflect questions drilled in the current 24-hour cycle.',
                      ],
                    })
                  }
                  label="View Daily Goal Guide"
                />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 font-ui">
                  {overallDailyPercentage >= 100 ? 'Target Met' : `${overallDailyPercentage}% Completed`}
                </span>
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 font-ui mt-0.5 font-mono tabular-nums">
                {targetPerSubject} Qs / subject quota
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-2xl font-semibold tabular-nums text-stone-900 dark:text-stone-100">
              <CountUp value={totalQuestionsAnsweredToday} />
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-mono tabular-nums">/{dailyGoal} Qs</span>
          </div>
        </div>

        {/* Global Progress Track */}
        <div className="space-y-1.5">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#F0EFEA] dark:bg-[#28292C]">
            <div
              className="h-full rounded-full bg-[#426E55] dark:bg-[#88C09D] transition-all duration-[1200ms] ease-out"
              style={{ width: `${overallDailyPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#828581] dark:text-[#949793] font-ui tabular-nums">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100% Target</span>
          </div>
        </div>

        {/* Quick Goal Pacing Selector */}
        {onUpdateDailyGoal && (
          <div className="pt-2 border-t border-[#F4F4F0] dark:border-[#2B2C30] flex items-center justify-between">
            <span className="text-[11px] text-[#828581] dark:text-[#949793] font-ui">
              Adjust Daily Goal:
            </span>
            <div className="flex items-center gap-1.5">
              {[40, 50, 60, 70].map((goalVal) => (
                <button
                  key={goalVal}
                  onClick={() => {
                    playTapSound();
                    onUpdateDailyGoal(goalVal);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-ui transition-all cursor-pointer ${
                    dailyGoal === goalVal
                      ? 'bg-[#1C1D1B] dark:bg-white text-white dark:text-[#141517] font-semibold shadow-2xs'
                      : 'bg-[#FBFBF9] dark:bg-[#232527] text-[#828581] dark:text-[#949793] border border-[#EAE8E3] dark:border-[#2B2C30] hover:border-[#828581]'
                  }`}
                >
                  {goalVal} Qs
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Minimalist Search Bar */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#828581] dark:text-[#949793]">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search syllabus or topic..."
          className="w-full rounded-2xl border border-[#EAE8E3] dark:border-[#2B2C30] bg-[#FFFFFF] dark:bg-[#1C1D1F] py-3 pl-10 pr-10 text-xs text-[#1C1D1B] dark:text-[#F4F4F2] placeholder-[#828581] dark:placeholder-[#949793] transition-colors focus:border-[#1C1D1B] dark:focus:border-white focus:outline-hidden paper-shadow font-ui"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              playTapSound();
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#828581] hover:text-[#1C1D1B] dark:hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-0.5">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                playTapSound();
              }}
              className={`relative whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium font-ui transition-all duration-200 ease-out active:scale-[0.98] cursor-pointer ${
                isActive
                  ? 'text-stone-50 dark:text-stone-900 font-semibold shadow-xs ring-1 ring-inset ring-black/5 dark:ring-white/10'
                  : 'border border-stone-200/70 dark:border-stone-800 bg-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategoryPill"
                  className="absolute inset-0 rounded-full bg-stone-900 dark:bg-stone-100 -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              {cat}
            </button>
          );
        })}
      </div>

      {/* 12 Minimal Subject Cards Grid (Spacious p-5 cards) */}
      <div className="grid grid-cols-2 gap-3.5">
        {filteredSubjects.map((subject, index) => {
          const IconComponent = ICON_MAP[subject.iconName] || BookOpen;
          const isTransitioning = selectedSubjectId === subject.id;
          const isEnglish = subject.id === 'english' || subject.name === 'Use of English';
          const accessible = isSubjectAccessible(subject, userDepartment, englishUnlocked);

          const answeredToday = (dailyProgressBySubject && typeof dailyProgressBySubject[subject.id] === 'number')
            ? dailyProgressBySubject[subject.id]
            : (DEFAULT_DAILY_PROGRESS[subject.id] ?? 0);

          const isLockedEnglish = isEnglish && !englishUnlocked;
          const effectiveAnswered = isLockedEnglish ? 0 : answeredToday;
          const completionPercentage = Math.min(100, Math.round((effectiveAnswered / targetPerSubject) * 100));
          const isGoalMet = completionPercentage >= 100;

          return (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => handleCardClick(subject)}
              className={`group relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200 paper-shadow cursor-pointer overflow-hidden ${
                accessible
                  ? 'bg-[#FFFFFF] dark:bg-[#1C1D1F] border-[#EAE8E3] dark:border-[#2B2C30] hover:border-[#828581] dark:hover:border-zinc-500 hover:shadow-sm active:scale-[0.98]'
                  : 'bg-[#FAF9F5]/90 dark:bg-[#18191B]/90 border-[#EAE8E3]/70 dark:border-[#242528] opacity-80 hover:opacity-100 hover:border-[#BA5D38]/50'
              } ${
                isTransitioning
                  ? 'scale-[0.97] border-[#1C1D1B] dark:border-white ring-2 ring-[#1C1D1B]/10 dark:ring-white/10'
                  : ''
              }`}
            >
              {/* Card Top: Icon & Status / Tag */}
              <div className="flex items-start justify-between mb-5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                    isEnglish && !englishUnlocked
                      ? 'bg-[#FAF1EB] dark:bg-[#2F1F19] text-[#BA5D38] dark:text-[#E28D6E]'
                      : isEnglish && englishUnlocked
                      ? 'bg-[#EEF4F0] dark:bg-[#1B2B21] text-[#385E49] dark:text-[#88C09D]'
                      : accessible
                      ? 'bg-[#F4F4F0] dark:bg-[#232527] text-[#1C1D1B] dark:text-[#F4F4F2] group-hover:bg-[#1C1D1B] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-[#141517]'
                      : 'bg-[#F0EFEA] dark:bg-[#232527] text-[#828581] dark:text-[#949793]'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                </div>

                {isEnglish ? (
                  englishUnlocked ? (
                    <span className="text-[11px] font-semibold text-[#426E55] dark:text-[#88C09D] font-ui flex items-center gap-1">
                      <Unlock className="h-3 w-3" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-[#BA5D38] dark:text-[#E28D6E] font-ui flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      <span>Locked</span>
                    </span>
                  )
                ) : accessible ? (
                  <span
                    className={`text-xs font-semibold tabular-nums font-ui ${
                      subject.readiness >= 80
                        ? 'text-[#385E49] dark:text-[#88C09D]'
                        : subject.readiness >= 65
                        ? 'text-[#BA5D38] dark:text-[#E28D6E]'
                        : 'text-[#9B2C2C] dark:text-[#F29B9B]'
                    }`}
                  >
                    {subject.readiness}% ready
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-[#828581] dark:text-[#949793] font-ui flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    <span>{subject.category}</span>
                  </span>
                )}
              </div>

              {/* Card Bottom: Subject Title & Topics */}
              <div className="space-y-1">
                <h2 className="font-editorial text-lg font-medium text-[#1C1D1B] dark:text-[#F4F4F2] leading-snug">
                  {subject.name}
                </h2>
                <p className="text-xs text-[#828581] dark:text-[#949793] font-ui line-clamp-1 leading-relaxed">
                  {subject.topics}
                </p>

                {/* Question count and practice action */}
                <div className="mt-3 pt-2 border-t border-[#F4F4F0] dark:border-[#2B2C30] flex items-center justify-between text-xs text-[#828581] dark:text-[#949793] font-ui">
                  <span className="tabular-nums font-editorial">{subject.questionsCount.toLocaleString()} Qs</span>
                  {accessible ? (
                    <span className="flex items-center gap-1 text-[#1C1D1B] dark:text-[#F4F4F2] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Practice</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[#BA5D38] dark:text-[#E28D6E] font-medium text-[11px]">
                      <Lock className="h-3 w-3" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>

                {/* Subtle, elegant progress bar under subject card */}
                <div className="mt-3 pt-2.5 border-t border-[#F4F4F0] dark:border-[#2B2C30] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-ui">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#828581] dark:text-[#949793]">
                      Daily Goal
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isLockedEnglish ? (
                        <span className="text-[10px] font-semibold text-[#BA5D38] dark:text-[#E28D6E] flex items-center gap-0.5">
                          <Lock className="h-2.5 w-2.5" />
                          <span>Locked</span>
                        </span>
                      ) : isGoalMet ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#426E55] dark:text-[#88C09D] tabular-nums">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>100% Met</span>
                        </span>
                      ) : (
                        <span className="font-ui text-xs font-medium text-[#1C1D1B] dark:text-[#F4F4F2]">
                          <span className="font-editorial tabular-nums font-semibold">{effectiveAnswered}</span>
                          <span className="text-[#828581] dark:text-[#949793]">/{targetPerSubject}</span>
                          <span className={`ml-1 text-[10px] font-semibold tabular-nums ${
                            completionPercentage >= 50
                              ? 'text-[#9E7B35] dark:text-[#E5B368]'
                              : 'text-[#828581] dark:text-[#949793]'
                          }`}>
                            {completionPercentage}%
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Subtle Progress Bar Track */}
                  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#F0EFEA] dark:bg-[#28292C]">
                    <div
                      className={`h-full rounded-full transition-all duration-[1200ms] ease-out ${
                        isLockedEnglish
                          ? 'bg-transparent'
                          : isGoalMet
                          ? 'bg-[#426E55] dark:bg-[#88C09D]'
                          : completionPercentage >= 50
                          ? 'bg-[#9E7B35] dark:bg-[#D4A359]'
                          : completionPercentage > 0
                          ? 'bg-[#BA5D38] dark:bg-[#E28D6E]'
                          : 'bg-transparent'
                      }`}
                      style={{ width: `${isLockedEnglish ? 0 : completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Edge Micro-Accent Indicator */}
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-transparent">
                <div
                  className={`h-full transition-all duration-[1200ms] ease-out ${
                    isLockedEnglish
                      ? 'bg-transparent'
                      : isGoalMet
                      ? 'bg-[#426E55] dark:bg-[#88C09D]'
                      : completionPercentage >= 50
                      ? 'bg-[#9E7B35]/80 dark:bg-[#D4A359]/80'
                      : completionPercentage > 0
                      ? 'bg-[#BA5D38]/70 dark:bg-[#E28D6E]/70'
                      : 'bg-transparent'
                  }`}
                  style={{ width: `${isLockedEnglish ? 0 : completionPercentage}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-8 sm:p-12 text-center paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800/50 text-stone-400">
            <BookOpen className="h-7 w-7 text-stone-400" strokeWidth={1.2} />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="font-editorial text-xl font-normal text-stone-900 dark:text-stone-100">
              No Subjects Found
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-ui leading-relaxed">
              No syllabus subjects matched "{searchQuery}". Reset filters to explore all UTME streams.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              playTapSound();
            }}
            className="btn-matte px-4 py-2 rounded-xl text-xs font-semibold font-ui shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <span>Reset Curriculum Filters</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* English Access Banner with Machined Edge */}
      <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-5 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 ring-1 ring-inset ring-black/5 dark:ring-white/10">
            <BookOpen className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-editorial text-base font-semibold text-stone-900 dark:text-stone-100">
                Use of English
              </span>
              <span className={`text-xs font-semibold font-ui ${
                englishUnlocked
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-amber-700 dark:text-amber-400'
              }`}>
                {englishUnlocked ? 'Unlocked' : 'Locked Core'}
              </span>
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400 font-mono mt-0.5">
              2,650 verified past questions · Compulsory
            </div>
          </div>
        </div>

        {englishUnlocked ? (
          <button
            onClick={() => {
              playTapSound();
              onSelectSubject('english');
            }}
            className="btn-matte rounded-xl px-4 py-2 text-xs font-semibold font-ui shadow-2xs cursor-pointer"
          >
            Drill English
          </button>
        ) : (
          <button
            onClick={() => {
              playTapSound();
              if (onUnlockEnglish) onUnlockEnglish();
            }}
            className="btn-matte rounded-xl px-4 py-2 text-xs font-semibold font-ui shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Unlock className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>Unlock English</span>
          </button>
        )}
      </div>

      {/* Subject Restriction Modal */}
      {lockedSubjectPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#FFFFFF] dark:bg-[#1C1D1F] p-6 shadow-2xl border border-[#EAE8E3] dark:border-[#2B2C30] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F4F4F0] dark:border-[#2B2C30] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF1EB] dark:bg-[#2F1F19] text-[#BA5D38] dark:text-[#E28D6E]">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-editorial text-base font-semibold text-[#1C1D1B] dark:text-[#F4F4F2]">
                    {lockedSubjectPrompt.id === 'english' || lockedSubjectPrompt.name === 'Use of English'
                      ? 'Locked for Everyone'
                      : 'Department Restricted'}
                  </h3>
                  <span className="text-[10px] text-[#828581] dark:text-[#949793] font-ui">
                    UTME Subject Policy
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  playTapSound();
                  setLockedSubjectPrompt(null);
                }}
                className="text-[#828581] hover:text-[#1C1D1B] dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {lockedSubjectPrompt.id === 'english' || lockedSubjectPrompt.name === 'Use of English' ? (
              <>
                <p className="text-xs text-[#4A4D4A] dark:text-[#D1D5DB] font-ui leading-relaxed">
                  <strong className="text-[#1C1D1B] dark:text-[#F4F4F2]">Use of English</strong> is locked by default across all streams.
                </p>

                <div className="rounded-2xl bg-[#FBFBF9] dark:bg-[#232527] p-3 text-xs text-[#828581] dark:text-[#949793] font-ui border border-[#EAE8E3] dark:border-[#2B2C30]">
                  Unlock English for all candidate streams with your complimentary UTME 2025 Study Pass.
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      playTapSound();
                      setLockedSubjectPrompt(null);
                    }}
                    className="flex-1 rounded-2xl border border-[#EAE8E3] dark:border-[#2B2C30] py-2.5 text-xs font-semibold text-[#1C1D1B] dark:text-white hover:bg-[#F4F4F0] dark:hover:bg-[#232527] font-ui transition-all cursor-pointer"
                  >
                    Keep Locked
                  </button>

                  <button
                    onClick={handleUnlockEnglishAction}
                    className="flex-1 rounded-2xl bg-[#BA5D38] hover:bg-[#a64e2d] text-white py-2.5 text-xs font-semibold font-ui shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Unlock className="h-3.5 w-3.5" />
                    <span>Unlock Pass</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-[#4A4D4A] dark:text-[#D1D5DB] font-ui leading-relaxed">
                  <strong className="text-[#1C1D1B] dark:text-[#F4F4F2]">{lockedSubjectPrompt.name}</strong> belongs to the{' '}
                  <strong className="text-[#426E55] dark:text-[#88C09D]">{lockedSubjectPrompt.category}</strong> stream.
                </p>

                <div className="rounded-2xl bg-[#FBFBF9] dark:bg-[#232527] p-3 text-xs text-[#828581] dark:text-[#949793] font-ui border border-[#EAE8E3] dark:border-[#2B2C30]">
                  Switch to the {lockedSubjectPrompt.category} track to practice this syllabus topic.
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      playTapSound();
                      setLockedSubjectPrompt(null);
                    }}
                    className="flex-1 rounded-2xl border border-[#EAE8E3] dark:border-[#2B2C30] py-2.5 text-xs font-semibold text-[#1C1D1B] dark:text-white hover:bg-[#F4F4F0] dark:hover:bg-[#232527] font-ui transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => handleSwitchDepartmentAndOpen(lockedSubjectPrompt.category as Department)}
                    className="flex-1 rounded-2xl bg-[#426E55] hover:bg-[#345843] text-white py-2.5 text-xs font-semibold font-ui shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    Switch to {lockedSubjectPrompt.category}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Screen Guide Bottom Sheet */}
      <ScreenGuideSheet
        isOpen={activeGuide !== null}
        onClose={() => setActiveGuide(null)}
        guide={activeGuide}
      />
    </div>
  );
};
