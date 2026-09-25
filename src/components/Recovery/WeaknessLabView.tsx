import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Subject, WeaknessArea, StrengthArea, UserProfile } from '../../types';
import { playTapSound } from '../../utils/audio';
import { CountUp } from '../Motion/CountUp';
import {
  AlertTriangle,
  Award,
  Zap,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Filter,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { ScreenGuideSheet, InfoTrigger, ScreenGuideContent } from '../Modals/ScreenGuideSheet';

interface WeaknessLabViewProps {
  profile: UserProfile;
  subjects: Subject[];
  weaknesses: WeaknessArea[];
  strengths: StrengthArea[];
  onLaunchTargetedDrill: (subjectId: string) => void;
  onNavigateToDrill: () => void;
}

export const WeaknessLabView: React.FC<WeaknessLabViewProps> = ({
  profile,
  subjects,
  weaknesses,
  strengths,
  onLaunchTargetedDrill,
  onNavigateToDrill,
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'deficits' | 'mastered'>('deficits');
  const [activeGuide, setActiveGuide] = useState<ScreenGuideContent | null>(null);

  const subjectIdMap: Record<string, string> = {
    'Use of English': 'english',
    Mathematics: 'maths',
    Physics: 'physics',
    Chemistry: 'chemistry',
    Biology: 'biology',
  };

  const filteredWeaknesses = weaknesses.filter((w) => {
    if (selectedSubjectFilter === 'All') return true;
    return w.subject.toLowerCase() === selectedSubjectFilter.toLowerCase();
  });

  const filteredStrengths = strengths.filter((s) => {
    if (selectedSubjectFilter === 'All') return true;
    return s.subject.toLowerCase() === selectedSubjectFilter.toLowerCase();
  });

  return (
    <div className="w-full pb-28 pt-4 px-4 space-y-6 animate-fadeIn">
      {/* Editorial Header - Pure Serif Header with Info Trigger */}
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-editorial text-2xl sm:text-3xl font-medium tracking-tight text-[#1a1c1c] dark:text-white">
            Precision Recovery Lab
          </h1>
          <InfoTrigger
            onClick={() =>
              setActiveGuide({
                title: 'Precision Recovery Lab',
                subtitle: 'Adaptive Remediation Protocol',
                badge: 'Deficit Intervention',
                icon: AlertTriangle,
                description: [
                  'Targeted intervention on low-accuracy syllabus topics to recover lost marks.',
                  'Each identified deficit includes isolated remedial drills to repair conceptual gaps without repeating entire subjects.',
                ],
                tips: [
                  'Topics with accuracy below 65% receive highest recovery priority.',
                  'Targeted drills focus strictly on question patterns where errors previously occurred.',
                ],
              })
            }
            label="View Recovery Lab Guide"
          />
        </div>
        <span className="text-xs font-semibold text-[#047857] dark:text-emerald-400 font-ui">
          Adaptive Diagnostic
        </span>
      </section>

      {/* High-Yield Impact Card with Machined Edge */}
      <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-black/5 dark:ring-white/10 shrink-0">
              <Zap className="h-5 w-5 fill-amber-500 text-amber-600 dark:text-amber-300" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial text-base font-semibold text-stone-900 dark:text-stone-100">
                  Projected Mark Recovery
                </span>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 font-ui">
                  +18 Projected Gain
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-ui mt-0.5">
                Recovering these {weaknesses.length} bottlenecks lifts your estimated score from{' '}
                <strong className="text-stone-900 dark:text-stone-100 font-mono tabular-nums">{profile.currentEstimatedScore}</strong> to{' '}
                <strong className="text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">{profile.currentEstimatedScore + 18}</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1 text-center font-ui">
          <div className="p-3 rounded-2xl bg-stone-50/50 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800/70 ring-1 ring-inset ring-black/5 dark:ring-white/10">
            <span className="text-stone-400 text-[10px] block uppercase font-mono font-medium">Active Deficits</span>
            <span className="font-mono text-lg font-semibold text-amber-700 dark:text-amber-400 tabular-nums">{weaknesses.length} Topics</span>
          </div>
          <div className="p-3 rounded-2xl bg-stone-50/50 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800/70 ring-1 ring-inset ring-black/5 dark:ring-white/10">
            <span className="text-stone-400 text-[10px] block uppercase font-mono font-medium">Mastery Baseline</span>
            <span className="font-mono text-lg font-semibold text-stone-900 dark:text-stone-100 tabular-nums">52% Avg</span>
          </div>
          <div className="p-3 rounded-2xl bg-stone-50/50 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800/70 ring-1 ring-inset ring-black/5 dark:ring-white/10">
            <span className="text-stone-400 text-[10px] block uppercase font-mono font-medium">Recommended</span>
            <span className="font-mono text-lg font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">10 Qs / Set</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher: Deficits vs Mastered Areas */}
      <div className="flex items-center justify-between border-b border-[#f3f4f3] dark:border-[#282b2e] pb-2">
        <div className="inline-flex rounded-xl bg-[#f4f4f2] dark:bg-[#202326] p-1 border border-[#e5e5e3] dark:border-[#2d3135]">
          <button
            onClick={() => {
              playTapSound();
              setActiveTab('deficits');
            }}
            className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium font-ui transition-all cursor-pointer ${
              activeTab === 'deficits'
                ? 'text-[#1a1c1c] dark:text-white font-semibold'
                : 'text-[#747878] dark:text-[#9ca3af] hover:text-[#1a1c1c] dark:hover:text-white'
            }`}
          >
            {activeTab === 'deficits' && (
              <motion.div
                layoutId="activeWeaknessTab"
                className="absolute inset-0 rounded-lg bg-white dark:bg-[#2c3035] shadow-2xs -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <AlertTriangle className="h-3.5 w-3.5 text-[#c2410c]" />
            <span>Deficit Areas ({weaknesses.length})</span>
          </button>

          <button
            onClick={() => {
              playTapSound();
              setActiveTab('mastered');
            }}
            className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium font-ui transition-all cursor-pointer ${
              activeTab === 'mastered'
                ? 'text-[#1a1c1c] dark:text-white font-semibold'
                : 'text-[#747878] dark:text-[#9ca3af] hover:text-[#1a1c1c] dark:hover:text-white'
            }`}
          >
            {activeTab === 'mastered' && (
              <motion.div
                layoutId="activeWeaknessTab"
                className="absolute inset-0 rounded-lg bg-white dark:bg-[#2c3035] shadow-2xs -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <Award className="h-3.5 w-3.5 text-[#047857]" />
            <span>High Mastery ({strengths.length})</span>
          </button>
        </div>

        {/* Subject Filter Pill */}
        <select
          value={selectedSubjectFilter}
          onChange={(e) => {
            playTapSound();
            setSelectedSubjectFilter(e.target.value);
          }}
          className="rounded-xl border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#1a1c1e] text-[#1a1c1c] dark:text-white text-xs px-2.5 py-1.5 font-ui outline-hidden cursor-pointer"
        >
          <option value="All">All Subjects</option>
          <option value="Physics">Physics</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Chemistry">Chemistry</option>
          <option value="Use of English">English</option>
        </select>
      </div>

      {/* Tab 1: Deficit Topic Cards */}
      {activeTab === 'deficits' && (
        <div className="space-y-3">
          {filteredWeaknesses.map((w, idx) => {
            const mappedSubId = subjectIdMap[w.subject] || 'physics';

            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-5 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-3.5 hover:border-stone-400 dark:hover:border-stone-600 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#c2410c] dark:text-orange-400 font-ui">
                        {w.subject}
                      </span>
                      <span className="text-[#747878] text-xs">·</span>
                      <span className="text-xs text-[#747878] dark:text-[#9ca3af] font-ui">
                        {w.questionsMissed} missed
                      </span>
                    </div>
                    <h3 className="font-editorial text-base sm:text-lg font-semibold text-[#1a1c1c] dark:text-white">
                      {w.topic}
                    </h3>
                  </div>

                  <span className="font-editorial text-xl font-bold text-[#c2410c] dark:text-orange-400 tabular-nums">
                    <CountUp value={w.mastery} suffix="%" />
                    <span className="text-[10px] font-ui text-[#747878] dark:text-[#9ca3af] ml-1 font-normal">mastery</span>
                  </span>
                </div>

                {/* Mastery Progress Bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#f3f4f3] dark:bg-[#282b2e]">
                    <div
                      className={`h-full rounded-full transition-all duration-[1200ms] ease-out ${
                        w.mastery < 45
                          ? 'bg-red-500'
                          : w.mastery < 65
                          ? 'bg-amber-500'
                          : 'bg-[#047857]'
                      }`}
                      style={{ width: `${w.mastery}%` }}
                    />
                  </div>
                </div>

                {/* Prescribed Action with Matte Button */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-ui">
                    Target: Drill 10 questions to unlock +2.5% boost
                  </span>
                  <button
                    onClick={() => {
                      playTapSound();
                      onLaunchTargetedDrill(mappedSubId);
                    }}
                    className="btn-matte flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold font-ui shadow-2xs cursor-pointer"
                  >
                    <span>Launch Recovery Drill</span>
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {filteredWeaknesses.length === 0 && (
            <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-8 sm:p-12 text-center paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-3.5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800/50 text-stone-400">
                <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" strokeWidth={1.2} />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-editorial text-xl font-normal text-stone-900 dark:text-stone-100">
                  No Active Syllabus Deficits
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-ui leading-relaxed">
                  Your diagnostic mastery for {selectedSubjectFilter} currently meets or exceeds the university admissions benchmark.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: High Mastery Cards */}
      {activeTab === 'mastered' && (
        <div className="space-y-3">
          {filteredStrengths.map((s, idx) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-5 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#047857] dark:text-emerald-400 font-ui">
                    {s.subject}
                  </span>
                  <h3 className="font-editorial text-base font-semibold text-[#1a1c1c] dark:text-white mt-1">
                    {s.topic}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="font-editorial text-xl font-bold text-[#047857] dark:text-emerald-400 tabular-nums">
                    <CountUp value={s.mastery} suffix="%" />
                  </span>
                  <span className="text-[10px] text-[#747878] dark:text-[#9ca3af] block font-ui">Locked Mastery</span>
                </div>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f3f4f3] dark:bg-[#282b2e]">
                <div
                  className="h-full rounded-full bg-[#047857] dark:bg-emerald-400 transition-all duration-[1200ms] ease-out"
                  style={{ width: `${s.mastery}%` }}
                />
              </div>

              <p className="text-[11px] text-[#747878] dark:text-[#9ca3af] font-ui pt-1">
                Streak: {s.streak} consecutive correct answers in previous drills.
              </p>
            </motion.div>
          ))}
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
