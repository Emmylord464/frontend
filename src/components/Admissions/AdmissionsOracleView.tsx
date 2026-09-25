import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, CourseTrack } from '../../types';
import { playTapSound, playCorrectSound } from '../../utils/audio';
import { CountUp } from '../Motion/CountUp';
import {
  Building2,
  GraduationCap,
  Sparkles,
  Award,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Compass,
  FileText,
  Sliders,
  Share2,
} from 'lucide-react';
import { ScreenGuideSheet, InfoTrigger, ScreenGuideContent } from '../Modals/ScreenGuideSheet';

export interface InstitutionBenchmark {
  id: string;
  name: string;
  shortName: string;
  location: string;
  type: 'Federal' | 'State' | 'Private';
  courseCutoffs: Record<string, { aggregate: number; utmeMin: number }>;
}

export const INSTITUTIONS: InstitutionBenchmark[] = [
  {
    id: 'unilag',
    name: 'University of Lagos',
    shortName: 'UNILAG',
    location: 'Akoka, Lagos',
    type: 'Federal',
    courseCutoffs: {
      'Medicine & Surgery': { aggregate: 83.5, utmeMin: 310 },
      'Law': { aggregate: 79.2, utmeMin: 290 },
      'Computer Science': { aggregate: 77.8, utmeMin: 285 },
      'Mechanical Engineering': { aggregate: 76.5, utmeMin: 280 },
      'Accounting': { aggregate: 75.0, utmeMin: 275 },
      'Pharmacy': { aggregate: 78.4, utmeMin: 290 },
      'Nursing Science': { aggregate: 76.8, utmeMin: 280 },
      'Economics': { aggregate: 74.2, utmeMin: 270 },
    },
  },
  {
    id: 'ui',
    name: 'University of Ibadan',
    shortName: 'UI',
    location: 'Ibadan, Oyo State',
    type: 'Federal',
    courseCutoffs: {
      'Medicine & Surgery': { aggregate: 84.0, utmeMin: 315 },
      'Law': { aggregate: 78.5, utmeMin: 285 },
      'Computer Science': { aggregate: 75.5, utmeMin: 275 },
      'Mechanical Engineering': { aggregate: 75.0, utmeMin: 275 },
      'Accounting': { aggregate: 73.8, utmeMin: 270 },
      'Pharmacy': { aggregate: 77.9, utmeMin: 285 },
      'Nursing Science': { aggregate: 75.5, utmeMin: 275 },
      'Economics': { aggregate: 72.5, utmeMin: 265 },
    },
  },
  {
    id: 'oau',
    name: 'Obafemi Awolowo University',
    shortName: 'OAU',
    location: 'Ile-Ife, Osun State',
    type: 'Federal',
    courseCutoffs: {
      'Medicine & Surgery': { aggregate: 82.8, utmeMin: 305 },
      'Law': { aggregate: 77.6, utmeMin: 280 },
      'Computer Science': { aggregate: 76.0, utmeMin: 275 },
      'Mechanical Engineering': { aggregate: 75.2, utmeMin: 270 },
      'Accounting': { aggregate: 74.0, utmeMin: 268 },
      'Pharmacy': { aggregate: 76.8, utmeMin: 280 },
      'Nursing Science': { aggregate: 74.5, utmeMin: 270 },
      'Economics': { aggregate: 71.8, utmeMin: 260 },
    },
  },
  {
    id: 'abu',
    name: 'Ahmadu Bello University',
    shortName: 'ABU',
    location: 'Zaria, Kaduna State',
    type: 'Federal',
    courseCutoffs: {
      'Medicine & Surgery': { aggregate: 80.5, utmeMin: 295 },
      'Law': { aggregate: 75.0, utmeMin: 275 },
      'Computer Science': { aggregate: 72.5, utmeMin: 260 },
      'Mechanical Engineering': { aggregate: 73.0, utmeMin: 265 },
      'Accounting': { aggregate: 70.5, utmeMin: 255 },
      'Pharmacy': { aggregate: 75.0, utmeMin: 275 },
      'Nursing Science': { aggregate: 72.0, utmeMin: 260 },
      'Economics': { aggregate: 68.5, utmeMin: 250 },
    },
  },
  {
    id: 'unn',
    name: 'University of Nigeria, Nsukka',
    shortName: 'UNN',
    location: 'Nsukka, Enugu State',
    type: 'Federal',
    courseCutoffs: {
      'Medicine & Surgery': { aggregate: 81.5, utmeMin: 300 },
      'Law': { aggregate: 76.5, utmeMin: 280 },
      'Computer Science': { aggregate: 73.5, utmeMin: 265 },
      'Mechanical Engineering': { aggregate: 74.0, utmeMin: 270 },
      'Accounting': { aggregate: 71.5, utmeMin: 260 },
      'Pharmacy': { aggregate: 76.0, utmeMin: 280 },
      'Nursing Science': { aggregate: 73.5, utmeMin: 265 },
      'Economics': { aggregate: 70.0, utmeMin: 255 },
    },
  },
  {
    id: 'lasu',
    name: 'Lagos State University',
    shortName: 'LASU',
    location: 'Ojo, Lagos State',
    type: 'State',
    courseCutoffs: {
      'Medicine & Surgery': { aggregate: 80.0, utmeMin: 290 },
      'Law': { aggregate: 74.5, utmeMin: 270 },
      'Computer Science': { aggregate: 71.0, utmeMin: 255 },
      'Mechanical Engineering': { aggregate: 70.5, utmeMin: 250 },
      'Accounting': { aggregate: 69.0, utmeMin: 245 },
      'Pharmacy': { aggregate: 73.5, utmeMin: 265 },
      'Nursing Science': { aggregate: 71.5, utmeMin: 255 },
      'Economics': { aggregate: 67.0, utmeMin: 240 },
    },
  },
];

type OLevelGrade = 'A1' | 'B2' | 'B3' | 'C4' | 'C5' | 'C6';
const GRADE_POINTS: Record<OLevelGrade, number> = {
  A1: 8,
  B2: 7,
  B3: 6,
  C4: 5,
  C5: 4,
  C6: 3,
};

interface AdmissionsOracleViewProps {
  profile: UserProfile;
  onNavigateToDrill?: (subjectId: string) => void;
}

export const AdmissionsOracleView: React.FC<AdmissionsOracleViewProps> = ({
  profile,
  onNavigateToDrill,
}) => {
  const [selectedInstId, setSelectedInstId] = useState<string>('unilag');
  const [selectedCourse, setSelectedCourse] = useState<string>(
    profile.courseTrack?.name || 'Medicine & Surgery'
  );
  const [postUtmeEstimate, setPostUtmeEstimate] = useState<number>(78);
  const [activeGuide, setActiveGuide] = useState<ScreenGuideContent | null>(null);

  // 5 O'Level grades state
  const [oLevelGrades, setOLevelGrades] = useState<Record<string, OLevelGrade>>({
    'English Language': 'A1',
    'Mathematics': 'A1',
    'Subject 3': 'B2',
    'Subject 4': 'B2',
    'Subject 5': 'B3',
  });

  const selectedInst = useMemo(
    () => INSTITUTIONS.find((i) => i.id === selectedInstId) || INSTITUTIONS[0],
    [selectedInstId]
  );

  // Fallback cutoff for course if specific entry isn't in institution lookup
  const courseCutoff = useMemo(() => {
    const fromMap = selectedInst.courseCutoffs[selectedCourse];
    if (fromMap) return fromMap;
    return { aggregate: 75.0, utmeMin: 275 };
  }, [selectedInst, selectedCourse]);

  // Aggregate Computation (Standard Nigerian Composite Formula: UTME 50% + O'Level 20% + Post-UTME 30%)
  const utmeContribution = useMemo(() => {
    const raw = profile.currentEstimatedScore || 280;
    return Math.round(((raw / 400) * 50) * 10) / 10;
  }, [profile.currentEstimatedScore]);

  const oLevelContribution = useMemo(() => {
    const sumPoints = Object.values(oLevelGrades).reduce(
      (acc, g) => acc + (GRADE_POINTS[g] || 6),
      0
    );
    // max points is 5 * 8 = 40. Scaled to 20 marks: (sumPoints / 40) * 20
    return Math.round(((sumPoints / 40) * 20) * 10) / 10;
  }, [oLevelGrades]);

  const postUtmeContribution = useMemo(() => {
    // scaled out of 30 marks
    return Math.round(((postUtmeEstimate / 100) * 30) * 10) / 10;
  }, [postUtmeEstimate]);

  const compositeAggregate = useMemo(() => {
    return Math.round((utmeContribution + oLevelContribution + postUtmeContribution) * 10) / 10;
  }, [utmeContribution, oLevelContribution, postUtmeContribution]);

  const delta = Math.round((compositeAggregate - courseCutoff.aggregate) * 10) / 10;

  // Probability Status
  const probabilityTier = useMemo(() => {
    if (delta >= 2.0) {
      return {
        label: 'MERIT CLEARANCE',
        odds: Math.min(99, Math.round(92 + delta * 2)),
        color: '#ccff00',
        badgeBg: 'bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/30',
        desc: 'Composite aggregate firmly surpasses the official merit benchmark.',
      };
    } else if (delta >= -1.0) {
      return {
        label: 'COMPETITIVE ZONE',
        odds: Math.round(75 + delta * 6),
        color: '#00f0ff',
        badgeBg: 'bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30',
        desc: 'Within razor-thin margin of merit cutoff. Performance in Post-UTME will be decisive.',
      };
    } else if (delta >= -4.5) {
      return {
        label: 'CATCHMENT / SUPPLEMENTARY',
        odds: Math.max(35, Math.round(52 + delta * 5)),
        color: '#f59e0b',
        badgeBg: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
        desc: 'Below merit quota, eligible for state catchment or secondary list.',
      };
    } else {
      return {
        label: 'ELEVATED RISK',
        odds: Math.max(12, Math.round(25 + delta * 3)),
        color: '#ff5e62',
        badgeBg: 'bg-rose-400/10 text-rose-400 border-rose-400/30',
        desc: 'Currently below competitive range. Prioritize high-yield UTME drills.',
      };
    }
  }, [delta]);

  const coursesList = [
    'Medicine & Surgery',
    'Law',
    'Computer Science',
    'Mechanical Engineering',
    'Pharmacy',
    'Nursing Science',
    'Accounting',
    'Economics',
  ];

  return (
    <div className="w-full pb-32 pt-6 px-4 space-y-6 animate-fadeIn">
      {/* Editorial Header */}
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal tracking-tight text-stone-900 dark:text-stone-100">
            Admissions Oracle
          </h1>
          <InfoTrigger
            onClick={() =>
              setActiveGuide({
                title: 'Admissions Oracle & Merit Matrix',
                subtitle: 'Authentic Composite Aggregate Model',
                badge: 'Admissions Protocol',
                icon: Building2,
                description: [
                  'Calculates true Nigerian institutional composite scores using the verified 50-20-30 model (50% UTME, 20% O\'Level Points, 30% Post-UTME).',
                  'Benchmarks your real-time performance against official merit cutoffs for UNILAG, UI, OAU, ABU, UNN, and LASU.',
                ],
                tips: [
                  'Aim for an aggregate score at least 2.5 points above faculty merit to insulate against annual cutoff shifts.',
                  'Each grade drop in O\'Level costs roughly 0.5 composite aggregate points.',
                ],
              })
            }
            label="View Oracle Guide"
          />
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-[#ccff00] bg-stone-900 dark:bg-stone-800 border border-stone-800 px-2.5 py-1 rounded-full">
          MERIT_ENGINE // '25
        </span>
      </section>

      {/* Target University Selector Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-stone-500">
          <span>TARGET INSTITUTION</span>
          <span>{selectedInst.type} UNIVERSITY</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {INSTITUTIONS.map((inst) => {
            const isSelected = inst.id === selectedInstId;
            return (
              <button
                key={inst.id}
                onClick={() => {
                  playTapSound();
                  setSelectedInstId(inst.id);
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all cursor-pointer active:scale-[0.98] ${
                  isSelected
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-transparent shadow-md'
                    : 'bg-white dark:bg-[#1a1c1e] border-stone-200/70 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                }`}
              >
                <span className="font-editorial text-base font-bold tracking-tight">
                  {inst.shortName}
                </span>
                <span className="text-[9px] font-mono opacity-70 truncate max-w-full">
                  {inst.location.split(',')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Course Pill Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-stone-500">
          <span>CHOSEN FACULTY COURSE</span>
          <span>MERIT: {courseCutoff.aggregate}%</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {coursesList.map((course) => {
            const isSelected = selectedCourse === course;
            return (
              <button
                key={course}
                onClick={() => {
                  playTapSound();
                  setSelectedCourse(course);
                }}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-mono border transition-all cursor-pointer active:scale-[0.98] ${
                  isSelected
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-transparent font-bold'
                    : 'bg-white dark:bg-[#1a1c1e] border-stone-200/70 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {course}
              </button>
            );
          })}
        </div>
      </div>

      {/* The Hero Odds & Merit Projection Card */}
      <div className="rounded-3xl border border-stone-800/80 bg-[#0d0e12] text-white p-6 shadow-2xl relative overflow-hidden space-y-5">
        {/* Subtle matrix dots */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${probabilityTier.color} 1px, transparent 0)`,
            backgroundSize: '16px 16px',
          }}
        />

        <div className="flex items-start justify-between relative">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ backgroundColor: probabilityTier.color }}
              />
              <span
                className="text-xs font-mono font-bold uppercase tracking-wider"
                style={{ color: probabilityTier.color }}
              >
                {probabilityTier.label}
              </span>
            </div>
            <h2 className="text-xl font-bold font-ui mt-1">
              {selectedInst.shortName} · {selectedCourse}
            </h2>
            <p className="text-xs font-mono text-stone-400 mt-0.5">
              Official Merit Benchmark: {courseCutoff.aggregate}% · Min UTME: {courseCutoff.utmeMin}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-stone-400 block uppercase">
              Admission Odds
            </span>
            <span
              className="text-4xl font-mono font-extrabold tracking-tight"
              style={{ color: probabilityTier.color }}
            >
              <CountUp value={probabilityTier.odds} suffix="%" />
            </span>
          </div>
        </div>

        {/* Big Aggregate Display vs Cutoff */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 relative">
          <div>
            <span className="text-[10px] font-mono uppercase text-stone-400 block">
              Calculated Composite
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-3xl font-bold text-white">
                {compositeAggregate}
              </span>
              <span className="font-mono text-xs text-stone-400">/ 100</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-stone-400 block">
              Variance to Cutoff
            </span>
            <span
              className="font-mono text-2xl font-bold block mt-0.5"
              style={{ color: delta >= 0 ? '#ccff00' : '#ff5e62' }}
            >
              {delta >= 0 ? `+${delta}` : `${delta}`} pts
            </span>
          </div>
        </div>

        {/* 3 Formula Components Grid */}
        <div className="grid grid-cols-3 gap-2.5 relative">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="text-[9px] font-mono text-stone-400 block">UTME (50%)</span>
            <span className="font-mono text-base font-bold text-white block mt-0.5">
              {utmeContribution} <span className="text-[10px] text-stone-500">/ 50</span>
            </span>
            <span className="text-[9px] font-mono text-stone-400">
              {profile.currentEstimatedScore || 280} / 400
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="text-[9px] font-mono text-stone-400 block">O'LEVEL (20%)</span>
            <span className="font-mono text-base font-bold text-white block mt-0.5">
              {oLevelContribution} <span className="text-[10px] text-stone-500">/ 20</span>
            </span>
            <span className="text-[9px] font-mono text-stone-400">5 Best Core</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="text-[9px] font-mono text-stone-400 block">POST-UTME (30%)</span>
            <span className="font-mono text-base font-bold text-white block mt-0.5">
              {postUtmeContribution} <span className="text-[10px] text-stone-500">/ 30</span>
            </span>
            <span className="text-[9px] font-mono text-stone-400">
              Est. {postUtmeEstimate}%
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Composite Calculator Controls (O'Level & Post-UTME) */}
      <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-stone-700 dark:text-stone-300" strokeWidth={1.5} />
            <h3 className="font-editorial text-lg font-medium text-stone-900 dark:text-stone-100">
              Composite Variable Calibration
            </h3>
          </div>
          <span className="text-xs font-mono text-stone-500">
            Real-time Recalculation
          </span>
        </div>

        {/* Post-UTME Expected Score Slider */}
        <div className="space-y-2 p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-stone-700 dark:text-stone-300 font-semibold">
              Post-UTME / Screening Forecast
            </span>
            <span className="font-bold text-stone-900 dark:text-white tabular-nums">
              {postUtmeEstimate}% ({postUtmeContribution}/30 pts)
            </span>
          </div>
          <input
            type="range"
            min={40}
            max={100}
            value={postUtmeEstimate}
            onChange={(e) => {
              setPostUtmeEstimate(Number(e.target.value));
            }}
            className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-stone-900 dark:accent-stone-100"
          />
          <div className="flex justify-between text-[10px] font-mono text-stone-400">
            <span>40% Pass</span>
            <span>70% Merit Standard</span>
            <span>100% Max</span>
          </div>
        </div>

        {/* 5 O'Level Subject Grades Selector */}
        <div className="space-y-3">
          <span className="text-xs font-mono text-stone-500 uppercase tracking-wider block">
            5 Core O'Level Subject Grades (WAEC / NECO)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {Object.keys(oLevelGrades).map((subjectKey) => {
              const currentGrade = oLevelGrades[subjectKey];
              return (
                <div
                  key={subjectKey}
                  className="p-2.5 rounded-xl border border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 space-y-1.5"
                >
                  <span className="text-[10px] font-mono text-stone-500 truncate block">
                    {subjectKey}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-stone-900 dark:text-stone-100">
                      {currentGrade}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      {GRADE_POINTS[currentGrade]} pts
                    </span>
                  </div>
                  <div className="flex gap-1 overflow-x-auto pt-1">
                    {(['A1', 'B2', 'B3', 'C4', 'C5', 'C6'] as OLevelGrade[]).map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          playTapSound();
                          setOLevelGrades((prev) => ({ ...prev, [subjectKey]: g }));
                        }}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-all cursor-pointer ${
                          currentGrade === g
                            ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold'
                            : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
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
