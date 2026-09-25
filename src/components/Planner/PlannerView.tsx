import React, { useState } from 'react';
import {
  Compass,
  Target,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Sparkles,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { UserProfile, Subject } from '../../types';
import { GoalRecommenderCard } from '../Analytics/GoalRecommenderCard';
import { playTapSound } from '../../utils/audio';
import { ScreenGuideSheet, InfoTrigger, ScreenGuideContent } from '../Modals/ScreenGuideSheet';

interface PlannerViewProps {
  profile: UserProfile;
  subjects: Subject[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onLaunchDrill: (subjectId?: string) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  profile,
  subjects,
  onUpdateProfile,
  onLaunchDrill,
}) => {
  const [activeGuide, setActiveGuide] = useState<ScreenGuideContent | null>(null);
  const currentGoal = profile.dailyQuestionGoal || 50;
  const courseTrack = profile.courseTrack;
  const requiredSubjectNames = courseTrack?.requiredSubjects || [
    'Use of English',
    'Mathematics',
    'Physics',
    'Chemistry',
  ];

  // Filter subjects matching track
  const trackSubjects = subjects.filter((s) =>
    requiredSubjectNames.includes(s.name)
  );

  return (
    <div className="w-full pb-32 pt-6 px-4 space-y-7 animate-fadeIn">
      {/* Editorial Header - Pure Serif Header with Info Trigger */}
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal tracking-tight text-[#1C1D1B] dark:text-[#F4F4F2]">
            Strategy & Goals
          </h1>
          <InfoTrigger
            onClick={() =>
              setActiveGuide({
                title: 'Strategy & Goal Planning',
                subtitle: 'Velocity, Phasing & Cut-off Pacing',
                badge: 'Strategic Protocol',
                icon: Compass,
                description: [
                  'Pacing strategy, syllabus velocity, and milestone targets toward your university cut-off.',
                  'The timeline partitions your study duration into 4 distinct pedagogical phases, transitioning from diagnostic scoping to full mock conditioning.',
                ],
                tips: [
                  'Phase 1: Diagnostic Baseline & Syllabus Scope.',
                  'Phase 2: High-Yield Weighting & Topic Mastery.',
                  'Phase 3: CBT Speed Conditioning & Negative-Mark Avoidance.',
                  'Phase 4: Full Simulation Dress Rehearsals.',
                ],
              })
            }
            label="View Strategy Guide"
          />
        </div>
        <span className="text-xs uppercase tracking-widest text-[#828581] dark:text-[#949793] font-ui font-medium">
          UTME 2025
        </span>
      </section>

      {/* Main Intelligent Goal Recommender Card */}
      <GoalRecommenderCard
        profile={profile}
        onUpdateProfile={onUpdateProfile}
      />

      {/* UTME Exam Countdown & Phase Roadmap (Spacious p-6) */}
      <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
          <div>
            <span className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-medium font-ui">
              Preparation Roadmap
            </span>
            <h2 className="font-editorial text-xl font-normal text-stone-900 dark:text-stone-100 mt-0.5">
              Target Milestones
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-medium font-ui">
              Time Remaining
            </span>
            <span className="font-editorial text-2xl font-normal text-stone-900 dark:text-stone-100 tabular-nums block">
              48 Days
            </span>
          </div>
        </div>

        {/* 4 Strategic Phases */}
        <div className="space-y-3 pt-1">
          {[
            {
              phase: 'Phase 1',
              title: 'Diagnostic Baseline & Syllabus Scope',
              status: 'Completed',
              desc: 'Identified core weaknesses across mechanics & lexis.',
              active: false,
              done: true,
            },
            {
              phase: 'Phase 2',
              title: `High-Yield Velocity (${currentGoal} Qs/Day Quota)`,
              status: 'Current Focus',
              desc: 'Targeting remaining mark deficit to lock admission standing.',
              active: true,
              done: false,
            },
            {
              phase: 'Phase 3',
              title: 'Full CBT Mock Simulations (400 Marks / 2 Hours)',
              status: 'Upcoming (Day 30)',
              desc: 'Timed full-length exam rehearsal and endurance testing.',
              active: false,
              done: false,
            },
            {
              phase: 'Phase 4',
              title: 'Speed Precision & Final Lexis Polish',
              status: 'Final Week',
              desc: 'Formula consolidation and high-confidence revision.',
              active: false,
              done: false,
            },
          ].map((m, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-4 border transition-all duration-200 ease-out ring-1 ring-inset ring-black/5 dark:ring-white/10 ${
                m.active
                  ? 'border-emerald-600/60 dark:border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/30'
                  : m.done
                  ? 'border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40'
                  : 'border-stone-200/40 dark:border-stone-800/40 bg-white/60 dark:bg-[#1a1c1e]/60 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider font-ui ${
                      m.active
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : m.done
                        ? 'text-stone-900 dark:text-stone-100'
                        : 'text-stone-400'
                    }`}
                  >
                    {m.phase}
                  </span>
                  <span className="text-stone-400 text-xs">·</span>
                  <h3 className="font-editorial text-sm font-medium text-stone-900 dark:text-stone-100">
                    {m.title}
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider font-ui ${
                    m.active
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : m.done
                      ? 'text-stone-500 dark:text-stone-400'
                      : 'text-stone-400'
                  }`}
                >
                  {m.status}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-ui mt-2 leading-relaxed">
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Required Subjects Coverage Breakdown for Candidate's Course (Spacious p-6) */}
      <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
          <div>
            <span className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-medium font-ui">
              Curriculum Scope
            </span>
            <h2 className="font-editorial text-xl font-normal text-stone-900 dark:text-stone-100 mt-0.5">
              {courseTrack?.name || 'Chosen Course'} Track
            </h2>
          </div>
          <span className="text-xs font-mono font-medium px-3 py-1 rounded-full border border-stone-200/70 dark:border-stone-700/60 bg-transparent text-stone-800 dark:text-stone-200 font-ui tabular-nums">
            Target: {profile.targetScore}+
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {trackSubjects.map((sub) => (
            <div
              key={sub.id}
              className="rounded-2xl border border-stone-200/70 dark:border-stone-800 p-4 space-y-2.5 hover:border-stone-400 dark:hover:border-stone-600 transition-colors ring-1 ring-inset ring-black/5 dark:ring-white/10"
            >
              <div className="flex items-center justify-between text-xs font-ui">
                <div>
                  <span className="font-editorial text-base font-medium text-stone-900 dark:text-stone-100">{sub.name}</span>
                  <span className="text-stone-500 dark:text-stone-400 block text-xs mt-0.5">
                    {sub.topics} · {sub.questionsCount.toLocaleString()} past questions in repository
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-editorial text-lg font-medium text-stone-900 dark:text-stone-100 tabular-nums">
                    {sub.readiness}%
                  </span>
                  <span className="text-[10px] text-stone-400 block uppercase tracking-wider">Readiness</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                <div
                  className="h-full rounded-full bg-stone-900 dark:bg-stone-100 transition-all duration-500"
                  style={{ width: `${sub.readiness}%` }}
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    playTapSound();
                    onLaunchDrill(sub.id);
                  }}
                  className="text-xs font-semibold text-stone-900 dark:text-stone-100 hover:opacity-90 active:scale-[0.98] duration-200 ease-out font-ui flex items-center gap-1 cursor-pointer transition-all"
                >
                  <span>Drill {sub.name}</span>
                  <ArrowRight className="h-3 w-3 text-stone-400" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Daily Session Launch CTA (Spacious p-6) */}
      <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest font-semibold text-emerald-700 dark:text-emerald-400 font-ui block">
            Ready to drill today?
          </span>
          <h3 className="font-editorial text-lg font-medium text-stone-900 dark:text-stone-100">
            Complete today's {currentGoal} questions
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-ui">
            Pacing locked to hit {profile.targetScore} cut-off.
          </p>
        </div>

        <button
          onClick={() => {
            playTapSound();
            onLaunchDrill();
          }}
          className="btn-matte px-5 py-2.5 rounded-xl text-xs font-semibold font-ui shadow-xs shrink-0 cursor-pointer"
        >
          Start Drill
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
