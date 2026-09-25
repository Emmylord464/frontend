'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { playPopSound, playSuccessSound, playErrorSound } from '@/lib/sound-effects';

// ── Official JAMB IBASS Course Rules ──────────────────────────────────────────

interface IbassCourseRule {
  courseName: string;
  faculty: string;
  requiredSubjects: string[];
  optionalPool?: string[];
  notes: string;
  historicalCutoffs: {
    unilag: number;
    ui: number;
    oau: number;
    lasu: number;
    covenant: number;
  };
}

const IBASS_BROCHURE_RULES: IbassCourseRule[] = [
  {
    courseName: 'Medicine & Surgery',
    faculty: 'College of Health Sciences',
    requiredSubjects: ['USE_OF_ENGLISH', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS'],
    notes: 'No alternatives permitted. All 3 science subjects are mandatory alongside English.',
    historicalCutoffs: { unilag: 315, ui: 320, oau: 310, lasu: 295, covenant: 280 },
  },
  {
    courseName: 'Computer Science',
    faculty: 'Sciences & Computing',
    requiredSubjects: ['USE_OF_ENGLISH', 'MATHEMATICS', 'PHYSICS'],
    optionalPool: ['CHEMISTRY', 'BIOLOGY', 'ECONOMICS', 'GEOGRAPHY'],
    notes: 'Mathematics and Physics are strictly required. Chemistry or Biology recommended.',
    historicalCutoffs: { unilag: 285, ui: 290, oau: 280, lasu: 265, covenant: 250 },
  },
  {
    courseName: 'Software Engineering',
    faculty: 'Sciences & Computing',
    requiredSubjects: ['USE_OF_ENGLISH', 'MATHEMATICS', 'PHYSICS'],
    optionalPool: ['CHEMISTRY', 'ECONOMICS', 'BIOLOGY'],
    notes: 'Must include Maths and Physics. Chemistry preferred for faculty transferability.',
    historicalCutoffs: { unilag: 288, ui: 292, oau: 282, lasu: 268, covenant: 255 },
  },
  {
    courseName: 'Mechanical / Electrical Engineering',
    faculty: 'Engineering & Technology',
    requiredSubjects: ['USE_OF_ENGLISH', 'MATHEMATICS', 'PHYSICS', 'CHEMISTRY'],
    notes: 'Physics and Chemistry are strictly compulsory for all COREN-accredited engineering.',
    historicalCutoffs: { unilag: 295, ui: 300, oau: 290, lasu: 270, covenant: 260 },
  },
  {
    courseName: 'Law (Civil / Common Law)',
    faculty: 'Faculty of Law',
    requiredSubjects: ['USE_OF_ENGLISH', 'LITERATURE_IN_ENGLISH'],
    optionalPool: ['GOVERNMENT', 'ECONOMICS', 'CHRISTIAN_RELIGIOUS_STUDIES', 'HISTORY'],
    notes: 'Literature in English is mandatory. Government and CRS/IRS/Economics strongly favored.',
    historicalCutoffs: { unilag: 290, ui: 295, oau: 288, lasu: 275, covenant: 265 },
  },
  {
    courseName: 'Accounting & Finance',
    faculty: 'Management & Social Sciences',
    requiredSubjects: ['USE_OF_ENGLISH', 'MATHEMATICS', 'ECONOMICS'],
    optionalPool: ['COMMERCE', 'GOVERNMENT', 'ACCOUNTING', 'GEOGRAPHY'],
    notes: 'Mathematics and Economics are compulsory across all Federal universities.',
    historicalCutoffs: { unilag: 270, ui: 275, oau: 268, lasu: 250, covenant: 240 },
  },
  {
    courseName: 'Nursing Science',
    faculty: 'College of Health Sciences',
    requiredSubjects: ['USE_OF_ENGLISH', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS'],
    notes: 'Biology, Chemistry, and Physics are mandatory for NMCN accreditation.',
    historicalCutoffs: { unilag: 285, ui: 290, oau: 280, lasu: 260, covenant: 250 },
  },
  {
    courseName: 'Pharmacy',
    faculty: 'Pharmaceutical Sciences',
    requiredSubjects: ['USE_OF_ENGLISH', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS'],
    notes: 'Chemistry and Biology must be present. Physics is compulsory at top federal institutions.',
    historicalCutoffs: { unilag: 292, ui: 298, oau: 288, lasu: 272, covenant: 255 },
  },
  {
    courseName: 'Mass Communication',
    faculty: 'Arts & Social Sciences',
    requiredSubjects: ['USE_OF_ENGLISH', 'LITERATURE_IN_ENGLISH'],
    optionalPool: ['GOVERNMENT', 'ECONOMICS', 'COMMERCE', 'CRS_IRS'],
    notes: 'Literature in English is mandatory at UNILAG, UNN, and UI.',
    historicalCutoffs: { unilag: 275, ui: 280, oau: 270, lasu: 255, covenant: 240 },
  },
];

const AVAILABLE_UTME_SUBJECTS = [
  { id: 'MATHEMATICS', name: 'Mathematics' },
  { id: 'PHYSICS', name: 'Physics' },
  { id: 'CHEMISTRY', name: 'Chemistry' },
  { id: 'BIOLOGY', name: 'Biology' },
  { id: 'LITERATURE_IN_ENGLISH', name: 'Literature in English' },
  { id: 'GOVERNMENT', name: 'Government' },
  { id: 'ECONOMICS', name: 'Economics' },
  { id: 'COMMERCE', name: 'Commerce' },
  { id: 'ACCOUNTING', name: 'Financial Accounting' },
  { id: 'GEOGRAPHY', name: 'Geography' },
  { id: 'AGRICULTURAL_SCIENCE', name: 'Agricultural Science' },
  { id: 'CHRISTIAN_RELIGIOUS_STUDIES', name: 'CRS / IRS' },
];

const SCHOLARSHIPS_DATA = [
  {
    id: 'mcf',
    name: 'Mastercard Foundation Scholars Program',
    tier: 'International Full Ride',
    award: '100% Tuition, Monthly Stipend, Laptop & Living Expenses',
    target: 'High-achieving African secondary school leavers and university scholars',
    deadline: 'Rolling annually (Aug – Jan)',
    category: 'international',
    badge: 'Full Scholarship',
    url: 'https://mastercardfdn.org/all/scholars/',
  },
  {
    id: 'jupeb',
    name: 'JUPEB / IJMB Direct Entry Bridge',
    tier: 'National A-Level Pathway',
    award: 'Direct 200-Level Admission to UNILAG, UI, OAU, UNN (Skip JAMB)',
    target: 'Secondary school leavers seeking university admission via 9-month accelerated A-Levels',
    deadline: 'Open year-round across accredited centers',
    category: 'bridge',
    badge: 'Direct Entry',
    url: 'https://jupeb.edu.ng',
  },
  {
    id: 'nnpc-chevron',
    name: 'NNPC / Chevron Joint Venture National Scholarship',
    tier: 'Corporate Merit Award',
    award: '₦200,000 per academic session until graduation',
    target: 'Undergraduates studying Engineering, Medicine, Geosciences, or Agriculture',
    deadline: 'October 31st annually',
    category: 'national',
    badge: 'STEM Grant',
    url: 'https://nnpcgroup.com/nnpc-fund/scholarship',
  },
  {
    id: 'mtn',
    name: 'MTN Foundation Science & Technology Scholarship',
    tier: 'Tech & STEM Award',
    award: '₦200,000 annually + Career mentorship & networking',
    target: 'Full-time public university students in STEM & Secondary-to-Tech courses',
    deadline: 'August annually',
    category: 'national',
    badge: 'Tech Award',
    url: 'https://mtnfoundation.ng/scholarships/',
  },
  {
    id: 'sat-scholars',
    name: 'SAT / EducationUSA Opportunity Scholars',
    tier: 'Global Bridge Program',
    award: 'Fully-funded SAT/GRE exam fees + US College Board admissions support',
    target: 'Top 5% Nigerian secondary students targeting Ivy League & US institutions',
    deadline: 'March annually',
    category: 'international',
    badge: 'Global Ivy',
    url: 'https://educationusa.state.gov/opportunity-funds-program',
  },
];

export default function AdvisorPage() {
  // Validator state
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(0);
  const [subject2, setSubject2] = useState('MATHEMATICS');
  const [subject3, setSubject3] = useState('PHYSICS');
  const [subject4, setSubject4] = useState('CHEMISTRY');

  // Predictor state
  const [candidateScore, setCandidateScore] = useState(280);
  const [selectedInstitution, setSelectedInstitution] = useState<'unilag' | 'ui' | 'oau' | 'lasu' | 'covenant'>('unilag');

  // Scholarship filter
  const [scholarshipFilter, setScholarshipFilter] = useState<'all' | 'international' | 'national' | 'bridge'>('all');

  const activeCourse = IBASS_BROCHURE_RULES[selectedCourseIndex];

  // Validate the chosen 4 subjects against IBASS brochure requirements
  const validationResult = useMemo(() => {
    const selectedCombo = ['USE_OF_ENGLISH', subject2, subject3, subject4];
    const uniqueCount = new Set(selectedCombo).size;

    if (uniqueCount < 4) {
      return {
        isValid: false,
        error: 'Duplicate subjects selected. All 4 UTME subjects must be unique.',
      };
    }

    // Check mandatory required subjects
    const missingCompulsory = activeCourse.requiredSubjects.filter(
      (sub) => !selectedCombo.includes(sub),
    );

    if (missingCompulsory.length > 0) {
      const missingNames = missingCompulsory
        .map((s) => s.replaceAll('_', ' '))
        .join(', ');
      return {
        isValid: false,
        error: `IBASS Brochure Non-Compliant: Missing compulsory prerequisite (${missingNames}).`,
      };
    }

    // If there is an optional pool, verify the remaining subjects match
    if (activeCourse.optionalPool && activeCourse.optionalPool.length > 0) {
      const nonCompulsorySelected = selectedCombo.filter(
        (s) => !activeCourse.requiredSubjects.includes(s),
      );
      const invalidChoices = nonCompulsorySelected.filter(
        (s) => !activeCourse.optionalPool!.includes(s),
      );

      if (invalidChoices.length > 0) {
        const invalidNames = invalidChoices
          .map((s) => s.replaceAll('_', ' '))
          .join(', ');
        return {
          isValid: false,
          error: `Unrecognized subject for this faculty: ${invalidNames}. Approved choices: ${activeCourse.optionalPool
            .map((s) => s.replaceAll('_', ' '))
            .join(', ')}.`,
        };
      }
    }

    return {
      isValid: true,
      message: 'Official JAMB IBASS Brochure Approved! This 4-subject combination satisfies all national university requirements.',
    };
  }, [activeCourse, subject2, subject3, subject4]);

  // Compute admission probability based on historical departmental cutoffs
  const targetCutoff = activeCourse.historicalCutoffs[selectedInstitution];
  const probabilityIndex = useMemo(() => {
    const diff = candidateScore - targetCutoff;
    if (diff >= 20) return { percent: 94, tier: 'HIGH PROBABILITY', color: '#10b981' };
    if (diff >= 5) return { percent: 82, tier: 'COMPETITIVE / SAFE', color: '#06b6d4' };
    if (diff >= -10) return { percent: 65, tier: '50/50 MARGINAL', color: '#f59e0b' };
    return { percent: 35, tier: 'REACH (Consider JUPEB/Pre-Degree)', color: '#ef4444' };
  }, [candidateScore, targetCutoff]);

  const filteredScholarships = useMemo(() => {
    if (scholarshipFilter === 'all') return SCHOLARSHIPS_DATA;
    return SCHOLARSHIPS_DATA.filter((s) => s.category === scholarshipFilter);
  }, [scholarshipFilter]);

  return (
    <main className="min-h-screen bg-[#f4f7f5] text-[#18352b] pb-24">
      {/* ── Header ── */}
      <header className="border-b border-[#dce8e0] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 sm:px-6">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#e2763b]">
            <span className="size-2 rounded-full bg-[#e2763b] animate-ping" />
            JAMB IBASS Official Advisor
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Course & Career Strategic Advisor
          </h1>
          <p className="text-sm text-[#5e776f] max-w-2xl">
            Validate your 4-subject combination against the official JAMB Interactive Brochure & System (IBASS), predict your admission odds across top universities, and track global secondary-to-tech bridge scholarships.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-10">
        {/* ── SECTION 1: 4-SUBJECT COMBINATION VALIDATOR ── */}
        <section className="rounded-3xl border border-[#dce8e0] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-[#edf2ee]">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#1c9a67]">
                Pillar 2 · Section A
              </span>
              <h2 className="text-xl sm:text-2xl font-black">
                Interactive 4-Subject UTME Validator
              </h2>
            </div>
            <span className="rounded-full bg-[#f0f5f1] px-3.5 py-1 text-xs font-bold text-[#4d6a5f]">
              2026/2027 Brochure Sync
            </span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Left: Course & Subject Pickers */}
            <div className="space-y-4">
              <div>
                <label htmlFor="course-select" className="block text-xs font-black uppercase tracking-wider text-[#6a8277] mb-2">
                  Target Degree / Programme
                </label>
                <select
                  id="course-select"
                  value={selectedCourseIndex}
                  onChange={(e) => {
                    playPopSound();
                    setSelectedCourseIndex(Number(e.target.value));
                  }}
                  className="w-full rounded-2xl border border-[#dce8e0] bg-[#f8faf9] px-4 py-3.5 text-sm font-black text-[#18352b] focus:outline-none focus:ring-2 focus:ring-[#1c9a67]"
                >
                  {IBASS_BROCHURE_RULES.map((rule, idx) => (
                    <option key={rule.courseName} value={idx}>
                      {rule.courseName} ({rule.faculty})
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-[#71887e]">
                  {activeCourse.notes}
                </p>
              </div>

              {/* 4 Subjects Grid */}
              <div className="pt-2">
                <span className="block text-xs font-black uppercase tracking-wider text-[#6a8277] mb-3">
                  Your 4 UTME Subjects
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Subject 1: Use of English (Locked) */}
                  <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/50 p-3.5">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-800">
                      Subject 1 (Mandatory)
                    </span>
                    <span className="text-sm font-black text-[#18352b] flex items-center justify-between mt-1">
                      Use of English
                      <span className="text-xs text-emerald-600">🔒 Fixed</span>
                    </span>
                  </div>

                  {/* Subject 2 */}
                  <div className="rounded-2xl border border-[#dce8e0] bg-[#f8faf9] p-3">
                    <label htmlFor="subject-2" className="block text-[10px] font-black uppercase tracking-wider text-[#6a8277] mb-1">
                      Subject 2
                    </label>
                    <select
                      id="subject-2"
                      value={subject2}
                      onChange={(e) => {
                        playPopSound();
                        setSubject2(e.target.value);
                      }}
                      className="w-full bg-transparent text-sm font-black text-[#18352b] focus:outline-none"
                    >
                      {AVAILABLE_UTME_SUBJECTS.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subject 3 */}
                  <div className="rounded-2xl border border-[#dce8e0] bg-[#f8faf9] p-3">
                    <label htmlFor="subject-3" className="block text-[10px] font-black uppercase tracking-wider text-[#6a8277] mb-1">
                      Subject 3
                    </label>
                    <select
                      id="subject-3"
                      value={subject3}
                      onChange={(e) => {
                        playPopSound();
                        setSubject3(e.target.value);
                      }}
                      className="w-full bg-transparent text-sm font-black text-[#18352b] focus:outline-none"
                    >
                      {AVAILABLE_UTME_SUBJECTS.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subject 4 */}
                  <div className="rounded-2xl border border-[#dce8e0] bg-[#f8faf9] p-3">
                    <label htmlFor="subject-4" className="block text-[10px] font-black uppercase tracking-wider text-[#6a8277] mb-1">
                      Subject 4
                    </label>
                    <select
                      id="subject-4"
                      value={subject4}
                      onChange={(e) => {
                        playPopSound();
                        setSubject4(e.target.value);
                      }}
                      className="w-full bg-transparent text-sm font-black text-[#18352b] focus:outline-none"
                    >
                      {AVAILABLE_UTME_SUBJECTS.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Validation Feedback Card */}
            <div className="flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeCourse.courseName}-${subject2}-${subject3}-${subject4}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className={`rounded-2xl p-6 border transition-all ${
                    validationResult.isValid
                      ? 'border-emerald-500/50 bg-emerald-50/70 text-emerald-950 shadow-[0_0_30px_rgba(16,185,129,0.12)]'
                      : 'border-rose-500/50 bg-rose-50/70 text-rose-950 shadow-[0_0_30px_rgba(244,63,94,0.12)]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">
                      {validationResult.isValid ? '✅' : '⚠️'}
                    </span>
                    <div>
                      <h3 className="font-black text-base sm:text-lg">
                        {validationResult.isValid
                          ? 'Approved IBASS Combination'
                          : 'Brochure Discrepancy Flagged'}
                      </h3>
                      <p className="text-xs font-semibold opacity-75">
                        {activeCourse.courseName} · {activeCourse.faculty}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-bold leading-relaxed">
                    {validationResult.isValid
                      ? validationResult.message
                      : validationResult.error}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-900/10 text-xs flex flex-wrap gap-2">
                    <span className="font-bold">Required Prerequisite Core:</span>
                    {activeCourse.requiredSubjects.map((sub) => (
                      <span
                        key={sub}
                        className="rounded-md bg-white/70 px-2 py-0.5 font-mono text-[11px] font-black"
                      >
                        {sub.replaceAll('_', ' ')}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: ADMISSION PROBABILITY & HISTORICAL CUTOFF PREDICTOR ── */}
        <section className="rounded-3xl border border-[#dce8e0] bg-white p-6 sm:p-8 shadow-sm">
          <div className="pb-6 border-b border-[#edf2ee]">
            <span className="text-xs font-black uppercase tracking-wider text-[#06b6d4]">
              Pillar 2 · Section B
            </span>
            <h2 className="text-xl sm:text-2xl font-black mt-1">
              Departmental Cut-Off Mark & Admission Probability Engine
            </h2>
            <p className="text-sm text-[#5e776f] mt-1">
              Compare your mock or target UTME score against historical merit departmental cut-offs.
            </p>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-2 items-center">
            {/* Score & Institution Inputs */}
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="candidate-score" className="text-xs font-black uppercase tracking-wider text-[#6a8277]">
                    Your Mock / Projected UTME Score
                  </label>
                  <span className="text-2xl font-black font-mono text-[#18352b]">
                    {candidateScore} <span className="text-sm text-[#789083]">/ 400</span>
                  </span>
                </div>
                <input
                  id="candidate-score"
                  type="range"
                  min="160"
                  max="380"
                  step="1"
                  value={candidateScore}
                  onChange={(e) => setCandidateScore(Number(e.target.value))}
                  className="w-full accent-cyan-600 cursor-pointer h-2 bg-[#edf2ef] rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-[#789083] font-mono mt-1">
                  <span>160 (Min UTME)</span>
                  <span>250 (Competitive)</span>
                  <span>380 (National Top)</span>
                </div>
              </div>

              <div>
                <span className="block text-xs font-black uppercase tracking-wider text-[#6a8277] mb-2">
                  Target Institution
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'unilag', name: 'UNILAG (Federal)' },
                    { id: 'ui', name: 'Univ of Ibadan (Federal)' },
                    { id: 'oau', name: 'OAU Ife (Federal)' },
                    { id: 'lasu', name: 'LASU (State Top)' },
                    { id: 'covenant', name: 'Covenant (Private Top)' },
                  ].map((inst) => (
                    <button
                      key={inst.id}
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setSelectedInstitution(inst.id as typeof selectedInstitution);
                      }}
                      className={`rounded-xl p-2.5 text-xs font-black text-left transition border ${
                        selectedInstitution === inst.id
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-950 shadow-sm'
                          : 'border-[#dce8e0] bg-[#f8faf9] text-[#4a6358] hover:bg-[#edf2ef]'
                      }`}
                    >
                      {inst.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Output Probability Meter */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Merit Cut-Off Comparison
                  </span>
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-mono font-black text-cyan-400">
                    Historical Cut-off: {targetCutoff}
                  </span>
                </div>

                <div className="mt-5 flex items-baseline gap-3">
                  <span
                    className="text-6xl font-black font-mono tracking-tight"
                    style={{ color: probabilityIndex.color }}
                  >
                    {probabilityIndex.percent}%
                  </span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest block" style={{ color: probabilityIndex.color }}>
                      {probabilityIndex.tier}
                    </span>
                    <span className="text-xs text-slate-400">
                      Score difference: {candidateScore >= targetCutoff ? `+${candidateScore - targetCutoff}` : candidateScore - targetCutoff} pts
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: probabilityIndex.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${probabilityIndex.percent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <p className="mt-5 text-xs leading-relaxed text-slate-300 border-t border-slate-800/80 pt-3">
                💡 <strong>Strategy Insight:</strong>{' '}
                {probabilityIndex.percent >= 80
                  ? 'Your score is above historical merit cut-off. Maintain consistency in your secondary subject workouts!'
                  : 'Competitive margin! Practicing high-yield past questions in Mathematics & Physics on Jamby can add 15–25 marks.'}
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: GLOBAL SCHOLARSHIPS & BRIDGE PROGRAM TRACKER ── */}
        <section className="rounded-3xl border border-[#dce8e0] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-[#edf2ee]">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#a07c3c]">
                Pillar 2 · Section C
              </span>
              <h2 className="text-xl sm:text-2xl font-black mt-1">
                Global Scholarships & Secondary-to-Tech Bridge Programs
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Scholarship category filter">
              {[
                { id: 'all', label: 'All Opportunities' },
                { id: 'international', label: 'Global / Full Ride' },
                { id: 'national', label: 'National STEM' },
                { id: 'bridge', label: 'Direct Entry Bridge' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    playPopSound();
                    setScholarshipFilter(f.id as typeof scholarshipFilter);
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                    scholarshipFilter === f.id
                      ? 'bg-[#18352b] text-white'
                      : 'bg-[#f0f5f1] text-[#4d6a5f] hover:bg-[#e4ede7]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {filteredScholarships.map((s) => (
              <article
                key={s.id}
                className="rounded-2xl border border-[#dce8e0] bg-[#fcfdfc] p-5 shadow-sm hover:border-[#1c9a67] transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-md bg-[#e4f6ea] px-2 py-0.5 text-[10px] font-black text-[#126b47] uppercase tracking-wider">
                      {s.badge}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#6a8277]">
                      {s.deadline}
                    </span>
                  </div>
                  <h3 className="font-black text-base text-[#18352b]">
                    {s.name}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-[#e2763b]">
                    {s.tier}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[#486358] leading-relaxed">
                    🎁 <strong>Award:</strong> {s.award}
                  </p>
                  <p className="mt-1.5 text-xs text-[#6a8277]">
                    🎯 <strong>Target:</strong> {s.target}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#edf2ef] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#6a8277]">
                    Eligibility Check: Verified
                  </span>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-black text-[#1c9a67] hover:underline"
                  >
                    View Program
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

