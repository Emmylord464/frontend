import React, { useState, useEffect, useMemo } from 'react';
import { Subject, UserProfile } from '../../types';
import { playTapSound, playCorrectSound, playCompleteSound } from '../../utils/audio';
import { ShareScoreModal } from '../Modals/ShareScoreModal';
import { ScreenGuideSheet, InfoTrigger, ScreenGuideContent } from '../Modals/ScreenGuideSheet';
import {
  Clock,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Award,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  HelpCircle,
  Filter,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  BookOpen,
  Check,
  X,
  History,
  Layers,
  ChevronDown,
  Share2,
} from 'lucide-react';

export interface MockQuestion {
  id: number;
  subject: string;
  subjectId: string;
  syllabusTopic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  text: string;
  options: { id: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface MockAttemptRecord {
  id: string;
  date: string;
  score: number;
  maxScore: number;
  accuracy: number;
  timeSpentSeconds: number;
  totalQuestions: number;
  correctCount: number;
}

interface MockExamViewProps {
  profile: UserProfile;
  subjects: Subject[];
  onFinishMock?: (score: number) => void;
  onNavigateToSyllabus: () => void;
  onLaunchTargetedDrill?: (subjectId: string) => void;
  onNavigateToRecovery?: () => void;
}

// 16-Question Comprehensive UTME CBT Simulation Bank
export const MOCK_EXAM_QUESTIONS: MockQuestion[] = [
  // --- USE OF ENGLISH ---
  {
    id: 1,
    subject: 'Use of English',
    subjectId: 'english',
    syllabusTopic: 'Antonyms & Lexis in Context',
    difficulty: 'Medium',
    text: 'From the words lettered A to D, choose the option that is OPPOSITE IN MEANING to the underlined word:\n\nThe minister made a "candid" confession about the treasury deficit during the senate hearing.',
    options: [
      { id: 'A', text: 'frank and outspoken' },
      { id: 'B', text: 'evasive and guarded' },
      { id: 'C', text: 'sincere and direct' },
      { id: 'D', text: 'eloquent and persuasive' },
    ],
    correctAnswer: 'B',
    explanation: '"Candid" means truthful, open, and straightforward. The exact antonym is "evasive and guarded", which means attempting to avoid or hide the truth.',
  },
  {
    id: 2,
    subject: 'Use of English',
    subjectId: 'english',
    syllabusTopic: 'Grammatical Concord & Verb Agreement',
    difficulty: 'Medium',
    text: 'Neither the principal nor the senior teachers ________ in attendance when the state education commissioner visited the academy.',
    options: [
      { id: 'A', text: 'was' },
      { id: 'B', text: 'were' },
      { id: 'C', text: 'is' },
      { id: 'D', text: 'has been' },
    ],
    correctAnswer: 'B',
    explanation: 'Under the rule of proximity for correlative conjunctions ("neither... nor"), the verb must agree with the closer subject ("senior teachers", plural). Therefore, the past plural verb "were" is required.',
  },
  {
    id: 3,
    subject: 'Use of English',
    subjectId: 'english',
    syllabusTopic: 'Idioms & Figurative Usage',
    difficulty: 'Hard',
    text: 'When questioned about the discrepancies in the departmental audit, the accountant decided to "throw caution to the winds". This means that the accountant:',
    options: [
      { id: 'A', text: 'acted recklessly without regard for consequences' },
      { id: 'B', text: 'apologized earnestly to the governing board' },
      { id: 'C', text: 'sought discreet legal counsel immediately' },
      { id: 'D', text: 'resigned quietly from public service' },
    ],
    correctAnswer: 'A',
    explanation: 'The idiom "throw caution to the winds" means to act rashly or heedlessly, disregarding potential risks or warnings.',
  },
  {
    id: 4,
    subject: 'Use of English',
    subjectId: 'english',
    syllabusTopic: 'Idiomatic Interpretation & Register',
    difficulty: 'Medium',
    text: 'Choose the interpretation that is most appropriate:\n\n"Chidi is an arm-chair critic in departmental affairs."',
    options: [
      { id: 'A', text: 'He criticizes work without having any practical experience of it' },
      { id: 'B', text: 'He sits in comfortable arm-chairs during board meetings' },
      { id: 'C', text: 'He never speaks up during executive policy debates' },
      { id: 'D', text: 'He praises all executive leadership decisions uncritically' },
    ],
    correctAnswer: 'A',
    explanation: 'An "arm-chair critic" is a person who offers advice and criticism on subjects they have no practical experience in.',
  },

  // --- MATHEMATICS ---
  {
    id: 5,
    subject: 'Mathematics',
    subjectId: 'maths',
    syllabusTopic: 'Logarithms & Laws of Indices',
    difficulty: 'Medium',
    text: 'If log₁₀ 2 = 0.3010 and log₁₀ 3 = 0.4771, evaluate log₁₀ 18 without using mathematical tables.',
    options: [
      { id: 'A', text: '1.2552' },
      { id: 'B', text: '1.4552' },
      { id: 'C', text: '0.9542' },
      { id: 'D', text: '1.0791' },
    ],
    correctAnswer: 'A',
    explanation: '18 = 2 × 3² = 2 × 9. Therefore, log₁₀ 18 = log₁₀ 2 + log₁₀(3²) = log₁₀ 2 + 2(log₁₀ 3) = 0.3010 + 2(0.4771) = 0.3010 + 0.9542 = 1.2552.',
  },
  {
    id: 6,
    subject: 'Mathematics',
    subjectId: 'maths',
    syllabusTopic: 'Differential Calculus & Polynomials',
    difficulty: 'Hard',
    text: 'Find the derivative of f(x) = (3x² - 2)(2x + 1) with respect to x.',
    options: [
      { id: 'A', text: '18x² + 6x - 4' },
      { id: 'B', text: '12x² + 6x - 4' },
      { id: 'C', text: '18x² + 3x - 2' },
      { id: 'D', text: '6x² + 2x - 4' },
    ],
    correctAnswer: 'A',
    explanation: 'Expand the function first: f(x) = 6x³ + 3x² - 4x - 2. Differentiating with respect to x: f\'(x) = d/dx(6x³) + d/dx(3x²) - d/dx(4x) = 18x² + 6x - 4.',
  },
  {
    id: 7,
    subject: 'Mathematics',
    subjectId: 'maths',
    syllabusTopic: 'Quadratic Equations & Roots',
    difficulty: 'Medium',
    text: 'Find the quadratic equation whose roots are 2/3 and -3/2.',
    options: [
      { id: 'A', text: '6x² + 5x - 6 = 0' },
      { id: 'B', text: '6x² - 5x - 6 = 0' },
      { id: 'C', text: '6x² + 5x + 6 = 0' },
      { id: 'D', text: '3x² - 5x - 2 = 0' },
    ],
    correctAnswer: 'A',
    explanation: 'Sum of roots: α + β = 2/3 + (-3/2) = (4 - 9)/6 = -5/6. Product: αβ = (2/3)(-3/2) = -1. Quadratic formula: x² - (sum)x + product = 0 → x² + (5/6)x - 1 = 0. Multiply by 6: 6x² + 5x - 6 = 0.',
  },
  {
    id: 8,
    subject: 'Mathematics',
    subjectId: 'maths',
    syllabusTopic: 'Trigonometric Ratios & Angles',
    difficulty: 'Medium',
    text: 'If tan θ = 3/4 and θ is an acute angle, evaluate the value of (sin θ + cos θ) / (sin θ - cos θ).',
    options: [
      { id: 'A', text: '-7' },
      { id: 'B', text: '7' },
      { id: 'C', text: '-1/7' },
      { id: 'D', text: '1/7' },
    ],
    correctAnswer: 'A',
    explanation: 'From tan θ = 3/4, opposite = 3, adjacent = 4, hypotenuse = √(3² + 4²) = 5. Hence sin θ = 3/5, cos θ = 4/5. Numerator = 3/5 + 4/5 = 7/5. Denominator = 3/5 - 4/5 = -1/5. (7/5) / (-1/5) = -7.',
  },

  // --- PHYSICS ---
  {
    id: 9,
    subject: 'Physics',
    subjectId: 'physics',
    syllabusTopic: 'Linear Motion & Kinematics',
    difficulty: 'Medium',
    text: 'A car travelling at 20 m/s accelerates uniformly at 2.5 m/s² for 8 seconds. What total distance does it cover in this duration?',
    options: [
      { id: 'A', text: '240 m' },
      { id: 'B', text: '160 m' },
      { id: 'C', text: '280 m' },
      { id: 'D', text: '200 m' },
    ],
    correctAnswer: 'A',
    explanation: 'Using the 2nd equation of motion: s = ut + ½at². Here u = 20 m/s, a = 2.5 m/s², t = 8 s. s = (20)(8) + ½(2.5)(8²) = 160 + ½(2.5)(64) = 160 + 80 = 240 m.',
  },
  {
    id: 10,
    subject: 'Physics',
    subjectId: 'physics',
    syllabusTopic: 'Electromagnetic Spectrum & Quanta',
    difficulty: 'Easy',
    text: 'Which of the following electromagnetic radiations has the shortest wavelength and highest photon energy?',
    options: [
      { id: 'A', text: 'Gamma rays' },
      { id: 'B', text: 'Ultraviolet rays' },
      { id: 'C', text: 'Infrared radiation' },
      { id: 'D', text: 'Microwaves' },
    ],
    correctAnswer: 'A',
    explanation: 'In the electromagnetic spectrum, gamma rays have the highest frequency (f > 10¹⁹ Hz), shortest wavelength (λ < 10⁻¹¹ m), and by Planck\'s relation E = hf, the highest photon energy.',
  },
  {
    id: 11,
    subject: 'Physics',
    subjectId: 'physics',
    syllabusTopic: 'Work, Energy & Conservation Laws',
    difficulty: 'Medium',
    text: 'A stone of mass 2.0 kg is dropped from a cliff 45 m high. Neglecting air resistance, what is its kinetic energy just before striking the ground? (Take g = 10 m/s²)',
    options: [
      { id: 'A', text: '900 J' },
      { id: 'B', text: '450 J' },
      { id: 'C', text: '1800 J' },
      { id: 'D', text: '90 J' },
    ],
    correctAnswer: 'A',
    explanation: 'By the law of conservation of mechanical energy, Loss of Potential Energy = Gain in Kinetic Energy. KE = mgh = 2.0 kg × 10 m/s² × 45 m = 900 J.',
  },
  {
    id: 12,
    subject: 'Physics',
    subjectId: 'physics',
    syllabusTopic: 'Optics & Total Internal Reflection',
    difficulty: 'Medium',
    text: 'Total internal reflection can only occur when light travels from a:',
    options: [
      { id: 'A', text: 'denser medium to a less dense medium at an angle greater than the critical angle' },
      { id: 'B', text: 'less dense medium to a denser medium at an angle greater than the critical angle' },
      { id: 'C', text: 'denser medium to a less dense medium at an angle less than the critical angle' },
      { id: 'D', text: 'medium with equal refractive index' },
    ],
    correctAnswer: 'A',
    explanation: 'Two mandatory conditions for total internal reflection: (1) Light must travel from an optically denser medium to a rarer (less dense) medium; (2) The angle of incidence in the denser medium must exceed the critical angle.',
  },

  // --- CHEMISTRY ---
  {
    id: 13,
    subject: 'Chemistry',
    subjectId: 'chemistry',
    syllabusTopic: 'Volumetric Analysis & Stoichiometry',
    difficulty: 'Hard',
    text: 'What volume of 0.50 mol/dm³ tetraoxosulphate(VI) acid (H₂SO₄) is needed to completely neutralize 25.0 cm³ of 1.0 mol/dm³ sodium hydroxide (NaOH) solution?',
    options: [
      { id: 'A', text: '25.0 cm³' },
      { id: 'B', text: '12.5 cm³' },
      { id: 'C', text: '50.0 cm³' },
      { id: 'D', text: '6.25 cm³' },
    ],
    correctAnswer: 'A',
    explanation: 'Balanced equation: H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O. Using (C_a × V_a) / (C_b × V_b) = n_a / n_b. (0.50 × V_a) / (1.0 × 25.0) = 1 / 2 → V_a = (1.0 × 25.0 × 1) / (0.50 × 2) = 25.0 / 1.0 = 25.0 cm³.',
  },
  {
    id: 14,
    subject: 'Chemistry',
    subjectId: 'chemistry',
    syllabusTopic: 'Chemical Equilibrium & Le Chatelier',
    difficulty: 'Medium',
    text: 'According to Le Chatelier’s principle, an increase in pressure on the gaseous equilibrium: N₂(g) + 3H₂(g) ⇌ 2NH₃(g) will:',
    options: [
      { id: 'A', text: 'Shift equilibrium to the right, producing more ammonia' },
      { id: 'B', text: 'Shift equilibrium to the left, decreasing yield' },
      { id: 'C', text: 'Have no effect on equilibrium position' },
      { id: 'D', text: 'Decrease the rate of forward reaction' },
    ],
    correctAnswer: 'A',
    explanation: 'The forward reaction has 4 moles of gas on the left (1 N₂ + 3 H₂) and 2 moles of gas on the right (2 NH₃). An increase in pressure favors the side with fewer gas molecules, shifting the equilibrium to the right.',
  },
  {
    id: 15,
    subject: 'Chemistry',
    subjectId: 'chemistry',
    syllabusTopic: 'Organic Chemistry & Isomerism',
    difficulty: 'Medium',
    text: 'Which of the following organic compounds is a functional group isomer of propanal (CH₃CH₂CHO)?',
    options: [
      { id: 'A', text: 'Propan-2-one (acetone)' },
      { id: 'B', text: 'Propanoic acid' },
      { id: 'C', text: 'Propan-1-ol' },
      { id: 'D', text: 'Methyl ethanoate' },
    ],
    correctAnswer: 'A',
    explanation: 'Propanal (an aldehyde) and propan-2-one (a ketone) both share the molecular formula C₃H₆O but possess different functional groups (-CHO vs -CO-). They are classical functional group isomers.',
  },
  {
    id: 16,
    subject: 'Chemistry',
    subjectId: 'chemistry',
    syllabusTopic: 'Periodic Properties & Ionization Energy',
    difficulty: 'Medium',
    text: 'Across Period 3 of the Periodic Table (from Sodium to Argon), the first ionization energy generally increases primarily due to:',
    options: [
      { id: 'A', text: 'Increase in effective nuclear charge with constant shielding' },
      { id: 'B', text: 'Increase in atomic radius across the period' },
      { id: 'C', text: 'Decrease in nuclear charge across the period' },
      { id: 'D', text: 'Addition of extra electron shells' },
    ],
    correctAnswer: 'A',
    explanation: 'Across Period 3, protons are added to the nucleus while shielding remains nearly constant in the same principal energy level (n=3). The increased nuclear attraction pulls the electrons tighter, requiring higher energy to remove an electron.',
  },
];

export const MockExamView: React.FC<MockExamViewProps> = ({
  profile,
  subjects,
  onFinishMock,
  onNavigateToSyllabus,
  onLaunchTargetedDrill,
  onNavigateToRecovery,
}) => {
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeGuide, setActiveGuide] = useState<ScreenGuideContent | null>(null);

  // Post-Mock Screen States
  const [activeResultsTab, setActiveResultsTab] = useState<'diagnostics' | 'review' | 'history'>('diagnostics');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<'all' | 'incorrect' | 'correct' | 'flagged'>('all');
  const [reviewSubjectFilter, setReviewSubjectFilter] = useState<string>('all');
  const [expandedExplanationId, setExpandedExplanationId] = useState<number | null>(null);

  // Mock attempts history persisted in localStorage
  const [mockHistory, setMockHistory] = useState<MockAttemptRecord[]>(() => {
    try {
      const saved = localStorage.getItem('scholar_mock_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'hist-1',
        date: '3 days ago',
        score: 284,
        maxScore: 400,
        accuracy: 71,
        timeSpentSeconds: 2420,
        totalQuestions: 16,
        correctCount: 11,
      },
      {
        id: 'hist-2',
        date: 'Yesterday',
        score: 298,
        maxScore: 400,
        accuracy: 75,
        timeSpentSeconds: 2280,
        totalQuestions: 16,
        correctCount: 12,
      },
    ];
  });

  const totalQuestions = MOCK_EXAM_QUESTIONS.length;
  const answeredCount = Object.keys(userAnswers).length;
  const currentQ = MOCK_EXAM_QUESTIONS[currentQuestionIndex];

  // Timer countdown
  useEffect(() => {
    if (!examStarted || examFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, examFinished]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSelectAnswer = (optionId: string) => {
    playTapSound();
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionId,
    }));
  };

  const handleToggleFlag = (index: number) => {
    playTapSound();
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleToggleBookmark = (questionId: number) => {
    playTapSound();
    setBookmarkedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const handleFinishExam = () => {
    playCorrectSound();
    playCompleteSound();
    setIsSubmitModalOpen(false);
    setExamFinished(true);

    // Calculate score
    let correct = 0;
    MOCK_EXAM_QUESTIONS.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    const estimatedJAMBScore = Math.round((correct / totalQuestions) * 400);

    // Save to history
    const newRecord: MockAttemptRecord = {
      id: `hist-${Date.now()}`,
      date: 'Just now',
      score: estimatedJAMBScore,
      maxScore: 400,
      accuracy: Math.round((correct / totalQuestions) * 100),
      timeSpentSeconds: 45 * 60 - timeLeft,
      totalQuestions,
      correctCount: correct,
    };

    setMockHistory((prev) => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem('scholar_mock_history', JSON.stringify(updated.slice(0, 10)));
      } catch {}
      return updated;
    });

    if (onFinishMock) {
      onFinishMock(estimatedJAMBScore);
    }
  };

  // Performance calculations
  const results = useMemo(() => {
    let correct = 0;
    const subjectStats: Record<string, { total: number; correct: number; subjectId: string }> = {};

    MOCK_EXAM_QUESTIONS.forEach((q, idx) => {
      if (!subjectStats[q.subject]) {
        subjectStats[q.subject] = { total: 0, correct: 0, subjectId: q.subjectId };
      }
      subjectStats[q.subject].total += 1;

      if (userAnswers[idx] === q.correctAnswer) {
        correct += 1;
        subjectStats[q.subject].correct += 1;
      }
    });

    const percentage = Math.round((correct / totalQuestions) * 100);
    const estimatedJAMBScore = Math.round((correct / totalQuestions) * 400);
    const timeSpent = 45 * 60 - timeLeft;
    const avgSecondsPerQ = Math.round(timeSpent / Math.max(1, answeredCount));

    return {
      correct,
      incorrect: totalQuestions - correct,
      percentage,
      estimatedJAMBScore,
      timeSpent,
      avgSecondsPerQ,
      subjectStats,
    };
  }, [userAnswers, totalQuestions, timeLeft, answeredCount]);

  // Questions filtered for Review Tab
  const reviewFilteredQuestions = useMemo(() => {
    return MOCK_EXAM_QUESTIONS.filter((q, idx) => {
      const userAnswer = userAnswers[idx];
      const isCorrect = userAnswer === q.correctAnswer;
      const isFlagged = flaggedQuestions.has(idx);

      // Status filter
      if (reviewStatusFilter === 'correct' && !isCorrect) return false;
      if (reviewStatusFilter === 'incorrect' && isCorrect) return false;
      if (reviewStatusFilter === 'flagged' && !isFlagged) return false;

      // Subject filter
      if (reviewSubjectFilter !== 'all' && q.subject !== reviewSubjectFilter) return false;

      return true;
    });
  }, [userAnswers, flaggedQuestions, reviewStatusFilter, reviewSubjectFilter]);

  const targetCutoff = profile.courseTrack?.targetCutoff || profile.targetScore || 320;
  const isTargetCleared = results.estimatedJAMBScore >= targetCutoff;

  // -------------------------------------------------------------
  // 1. BRIEFING / START SCREEN
  // -------------------------------------------------------------
  if (!examStarted) {
    return (
      <div className="w-full pb-28 pt-4 px-4 space-y-6 animate-fadeIn">
        {/* Calm Exam Briefing Header */}
        <section className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-editorial text-2xl sm:text-3xl font-medium tracking-tight text-[#1a1c1c] dark:text-white">
              CBT Mock Exam
            </h1>
            <InfoTrigger
              onClick={() =>
                setActiveGuide({
                  title: 'Official CBT Simulation',
                  subtitle: 'Timed Rehearsal Protocol',
                  badge: 'Exam Conditioning',
                  icon: FileCheck,
                  description: [
                    'Timed CBT rehearsal replicating official exam conditions with diagnostic review.',
                    'The countdown clock runs continuously across 45 minutes, training test-taking velocity and pacing under real exam stress.',
                  ],
                  tips: [
                    'Solutions remain locked until final exam submission.',
                    'Flag questions you are uncertain of and return to them using the question palette before submitting.',
                  ],
                })
              }
              label="View Mock Guide"
            />
          </div>
          <span className="text-xs font-semibold text-[#047857] dark:text-emerald-400 font-ui">
            Official Simulation
          </span>
        </section>

        {/* Exam Briefing Card */}
        <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-5 sm:p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <FileCheck className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-editorial text-lg font-semibold text-stone-900 dark:text-stone-100">
                UTME Diagnostic Simulation
              </h2>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-ui">
                Track: {profile.courseTrack?.name || 'Sciences'} · Target: {targetCutoff} Cut-off
              </span>
            </div>
          </div>

          {/* Conditions Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs font-ui">
            <div className="rounded-xl border border-stone-200/70 dark:border-stone-800/70 p-3 bg-stone-50/50 dark:bg-stone-900/40 ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <span className="text-[10px] uppercase font-mono font-medium text-stone-400 block">Duration</span>
              <strong className="text-stone-900 dark:text-stone-100 text-sm mt-0.5 block font-mono tabular-nums">45 Minutes</strong>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">Official countdown clock</span>
            </div>
            <div className="rounded-xl border border-stone-200/70 dark:border-stone-800/70 p-3 bg-stone-50/50 dark:bg-stone-900/40 ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <span className="text-[10px] uppercase font-mono font-medium text-stone-400 block">Questions</span>
              <strong className="text-stone-900 dark:text-stone-100 text-sm mt-0.5 block font-mono tabular-nums">{totalQuestions} Past Questions</strong>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">English, Maths, Physics, Chem</span>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/30 p-3.5 text-xs text-amber-900 dark:text-amber-200 font-ui space-y-1 ring-1 ring-inset ring-black/5 dark:ring-white/10">
            <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
              <span>Diagnostic Protocol</span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              Solutions remain hidden until final submission. Question review and cut-off clearance unlock upon completion.
            </p>
          </div>

          <button
            onClick={() => {
              playTapSound();
              setExamStarted(true);
            }}
            className="btn-matte w-full rounded-xl py-3.5 text-sm font-semibold font-ui shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Begin Mock Simulation</span>
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Previous Mock History Snippet */}
        {mockHistory.length > 0 && (
          <div className="rounded-2xl border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#1a1c1e] p-4 paper-shadow space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1a1c1c] dark:text-white font-ui flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-[#047857] dark:text-emerald-400" />
                <span>Recent Mock Trajectory</span>
              </span>
              <span className="text-[11px] text-[#747878] dark:text-[#9ca3af] font-ui">
                {mockHistory.length} Recorded
              </span>
            </div>

            <div className="space-y-2">
              {mockHistory.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#fbfbfa] dark:bg-[#202326] border border-[#f0f0ee] dark:border-[#2b2e31] text-xs font-ui"
                >
                  <div>
                    <strong className="text-sm font-editorial text-[#1a1c1c] dark:text-white">
                      {item.score} / 400
                    </strong>
                    <span className="text-[10px] text-[#747878] dark:text-[#9ca3af] ml-2">
                      ({item.accuracy}% Accuracy)
                    </span>
                  </div>
                  <span className="text-[10px] text-[#747878] dark:text-[#9ca3af]">
                    {item.date}
                  </span>
                </div>
              ))}
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
  }

  // -------------------------------------------------------------
  // 2. FINISHED SCREEN: POST-MOCK DIAGNOSTIC & REVIEW HUB
  // -------------------------------------------------------------
  if (examFinished) {
    return (
      <div className="w-full pb-28 pt-4 px-4 space-y-5 animate-fadeIn">
        {/* Top Header - Pure Serif Header with Info Trigger */}
        <section className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-editorial text-2xl sm:text-3xl font-medium tracking-tight text-[#1a1c1c] dark:text-white">
              Mock Exam Audit
            </h1>
            <InfoTrigger
              onClick={() =>
                setActiveGuide({
                  title: 'Mock Exam Audit & Review',
                  subtitle: 'Item-by-Item Diagnostic Hub',
                  badge: 'Performance Breakdown',
                  icon: Award,
                  description: [
                    'Diagnostic performance calculated from official UTME scoring.',
                    'The review section details the official answer, question explanation, syllabus domain, and time spent on each question.',
                  ],
                  tips: [
                    'Use the status filter above to review all incorrect or flagged answers.',
                    'Add challenging questions to your bookmarks for dedicated revision before test day.',
                  ],
                })
              }
              label="View Audit Guide"
            />
          </div>
          <span className={`text-xs font-semibold font-ui ${
            isTargetCleared
              ? 'text-[#047857] dark:text-emerald-400'
              : 'text-amber-700 dark:text-amber-400'
          }`}>
            {isTargetCleared ? 'Cut-off Cleared' : 'Deficit Identified'}
          </span>
        </section>

        {/* Hero Score & Cutoff Standing Banner */}
        <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-5 paper-shadow-lifted ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-mono font-medium text-stone-500 dark:text-stone-400 font-ui block">
                Estimated UTME Score
              </span>
              <div className="flex items-baseline gap-1.5 my-0.5">
                <span className="font-editorial text-4xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                  {results.estimatedJAMBScore}
                </span>
                <span className="text-sm text-stone-500 dark:text-stone-400 font-ui">/ 400</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider font-mono font-medium text-stone-500 dark:text-stone-400 font-ui block">
                Target Cut-off
              </span>
              <div className="font-editorial text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                {targetCutoff}
              </div>
              <span className={`text-[10px] font-semibold font-ui ${
                results.estimatedJAMBScore >= targetCutoff
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-amber-700 dark:text-amber-400'
              }`}>
                {results.estimatedJAMBScore >= targetCutoff
                  ? `+${results.estimatedJAMBScore - targetCutoff} over cut-off`
                  : `-${targetCutoff - results.estimatedJAMBScore} to qualify`}
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-ui">
            <div className="p-2 rounded-xl bg-stone-50/50 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800/70 ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <span className="text-[9px] uppercase font-mono text-stone-400 block">Accuracy</span>
              <strong className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">{results.percentage}%</strong>
            </div>
            <div className="p-2 rounded-xl bg-stone-50/50 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800/70 ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <span className="text-[9px] uppercase font-mono text-stone-400 block">Correct</span>
              <strong className="text-sm font-semibold text-stone-900 dark:text-stone-100 font-mono tabular-nums">{results.correct}/{totalQuestions}</strong>
            </div>
            <div className="p-2 rounded-xl bg-stone-50/50 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800/70 ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <span className="text-[9px] uppercase font-mono text-stone-400 block">Time Spent</span>
              <strong className="text-sm font-semibold text-stone-900 dark:text-stone-100 font-mono tabular-nums">{formatTimer(results.timeSpent)}</strong>
            </div>
            <div className="p-2 rounded-xl bg-stone-50/50 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800/70 ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <span className="text-[9px] uppercase font-mono text-stone-400 block">Avg Pace</span>
              <strong className="text-sm font-semibold text-stone-900 dark:text-stone-100 font-mono tabular-nums">{results.avgSecondsPerQ}s/Q</strong>
            </div>
          </div>

          {/* Share Official Mock Result Banner */}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-ui">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
              <span>Official CBT Mock diagnostic score verified</span>
            </div>
            <button
              onClick={() => {
                playTapSound();
                setIsShareModalOpen(true);
              }}
              className="btn-matte flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold font-ui shadow-xs cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>Send Score to Friends & Family</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Diagnostics vs Review vs History */}
        <div className="flex rounded-xl bg-[#f0f0ee] dark:bg-[#202326] p-1 border border-[#e5e5e3] dark:border-[#282b2e]">
          <button
            onClick={() => {
              playTapSound();
              setActiveResultsTab('diagnostics');
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold font-ui transition-all cursor-pointer ${
              activeResultsTab === 'diagnostics'
                ? 'bg-white dark:bg-[#1a1c1e] text-[#1a1c1c] dark:text-white shadow-xs'
                : 'text-[#747878] dark:text-[#9ca3af] hover:text-[#1a1c1c]'
            }`}
          >
            Diagnostics
          </button>
          <button
            onClick={() => {
              playTapSound();
              setActiveResultsTab('review');
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold font-ui transition-all cursor-pointer relative ${
              activeResultsTab === 'review'
                ? 'bg-white dark:bg-[#1a1c1e] text-[#1a1c1c] dark:text-white shadow-xs'
                : 'text-[#747878] dark:text-[#9ca3af] hover:text-[#1a1c1c]'
            }`}
          >
            <span>Question Review ({totalQuestions})</span>
          </button>
          <button
            onClick={() => {
              playTapSound();
              setActiveResultsTab('history');
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold font-ui transition-all cursor-pointer ${
              activeResultsTab === 'history'
                ? 'bg-white dark:bg-[#1a1c1e] text-[#1a1c1c] dark:text-white shadow-xs'
                : 'text-[#747878] dark:text-[#9ca3af] hover:text-[#1a1c1c]'
            }`}
          >
            Trajectory
          </button>
        </div>

        {/* TAB 1: DIAGNOSTICS */}
        {activeResultsTab === 'diagnostics' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Subject Mastery Breakdown */}
            <div className="rounded-2xl border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#1a1c1e] p-5 paper-shadow space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#f3f4f3] dark:border-[#282b2e]">
                <h3 className="font-editorial text-base font-semibold text-[#1a1c1c] dark:text-white">
                  Subject Performance Audit
                </h3>
                <span className="text-[11px] text-[#747878] dark:text-[#9ca3af] font-ui">
                  4 Tested Subjects
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(results.subjectStats).map(([subjName, stat]) => {
                  const pct = Math.round((stat.correct / stat.total) * 100);
                  const isLow = pct < 70;

                  return (
                    <div
                      key={subjName}
                      className="p-3.5 rounded-xl border border-[#f0f0ee] dark:border-[#282b2e] bg-[#fbfbfa] dark:bg-[#202326] space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-ui">
                        <div>
                          <strong className="text-[#1a1c1c] dark:text-white text-sm font-editorial block">
                            {subjName}
                          </strong>
                          <span className="text-[10px] text-[#747878] dark:text-[#9ca3af]">
                            {stat.correct} of {stat.total} Correct
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold tabular-nums ${
                            pct >= 75
                              ? 'text-[#047857] dark:text-emerald-400'
                              : pct >= 50
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-[#c2410c] dark:text-orange-400'
                          }`}>
                            {pct}%
                          </span>

                          {onLaunchTargetedDrill && (
                            <button
                              onClick={() => {
                                playTapSound();
                                onLaunchTargetedDrill(stat.subjectId);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1a1c1e] border border-[#e5e5e3] dark:border-[#282b2e] text-[11px] font-medium text-[#1a1c1c] dark:text-white hover:bg-[#f3f4f3] cursor-pointer flex items-center gap-1 active:scale-95"
                            >
                              <span>Drill</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-1.5 w-full rounded-full bg-[#e5e5e3] dark:bg-[#2d3135] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 75
                              ? 'bg-[#047857]'
                              : pct >= 50
                              ? 'bg-amber-500'
                              : 'bg-[#c2410c]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Syllabus Gaps / Remediation Recommendation */}
            <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-4 paper-shadow space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h4 className="font-editorial text-sm font-semibold text-[#1a1c1c] dark:text-white">
                  Identified Weak Syllabus Topics
                </h4>
              </div>

              <div className="space-y-1.5 text-xs font-ui">
                {MOCK_EXAM_QUESTIONS.filter((q, idx) => userAnswers[idx] !== q.correctAnswer).slice(0, 3).map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-[#1a1c1e] border border-amber-200/50 dark:border-amber-900/30"
                  >
                    <div>
                      <span className="text-[10px] text-[#747878] dark:text-[#9ca3af] block">
                        {q.subject}
                      </span>
                      <strong className="text-[#1a1c1c] dark:text-white">
                        {q.syllabusTopic}
                      </strong>
                    </div>
                    {onLaunchTargetedDrill && (
                      <button
                        onClick={() => {
                          playTapSound();
                          onLaunchTargetedDrill(q.subjectId);
                        }}
                        className="text-[11px] font-semibold text-[#047857] dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Drill Now
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {onNavigateToRecovery && (
                <button
                  onClick={() => {
                    playTapSound();
                    onNavigateToRecovery();
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-600 dark:bg-amber-700 text-white text-xs font-semibold font-ui cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs hover:bg-amber-700 active:scale-95"
                >
                  <Zap className="h-3.5 w-3.5 fill-current" />
                  <span>Open Precision Recovery Lab</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: QUESTION-BY-QUESTION REVIEW */}
        {activeResultsTab === 'review' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Filter Controls */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-ui">
                {[
                  { id: 'all', label: `All (${totalQuestions})` },
                  { id: 'incorrect', label: `Incorrect (${results.incorrect})` },
                  { id: 'correct', label: `Correct (${results.correct})` },
                  { id: 'flagged', label: `Flagged (${flaggedQuestions.size})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      playTapSound();
                      setReviewStatusFilter(tab.id as any);
                    }}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                      reviewStatusFilter === tab.id
                        ? 'bg-[#1a1c1c] dark:bg-white text-white dark:text-[#121314] shadow-2xs'
                        : 'bg-white dark:bg-[#1a1c1e] text-[#747878] dark:text-[#9ca3af] border border-[#e5e5e3] dark:border-[#282b2e]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Subject Filter Pill Selection */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] font-ui">
                {['all', 'Use of English', 'Mathematics', 'Physics', 'Chemistry'].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => {
                      playTapSound();
                      setReviewSubjectFilter(sub);
                    }}
                    className={`whitespace-nowrap px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      reviewSubjectFilter === sub
                        ? 'bg-[#047857] text-white font-semibold'
                        : 'bg-[#f0f0ee] dark:bg-[#202326] text-[#747878] dark:text-[#9ca3af]'
                    }`}
                  >
                    {sub === 'all' ? 'All Subjects' : sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions List */}
            {reviewFilteredQuestions.length === 0 ? (
              <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-8 sm:p-12 text-center paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800/50 text-stone-400">
                  <FileCheck className="h-7 w-7 text-stone-400" strokeWidth={1.2} />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h3 className="font-editorial text-xl font-normal text-stone-900 dark:text-stone-100">
                    No Questions In This Audit Filter
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-ui leading-relaxed">
                    Switch to all questions or choose another subject filter to inspect solutions and marked answers.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setReviewStatusFilter('all');
                    setReviewSubjectFilter('all');
                    playTapSound();
                  }}
                  className="btn-matte px-4 py-2 rounded-xl text-xs font-semibold font-ui shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Reset Review Filters</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {reviewFilteredQuestions.map((q) => {
                  const originalIndex = MOCK_EXAM_QUESTIONS.findIndex((item) => item.id === q.id);
                  const userAnswer = userAnswers[originalIndex];
                  const isCorrect = userAnswer === q.correctAnswer;
                  const isFlagged = flaggedQuestions.has(originalIndex);
                  const isBookmarked = bookmarkedQuestions.has(q.id);
                  const isExpanded = expandedExplanationId === q.id;

                  return (
                    <div
                      key={q.id}
                      className={`rounded-2xl border bg-white dark:bg-[#1a1c1e] p-5 paper-shadow space-y-3.5 transition-all ${
                        isCorrect
                          ? 'border-emerald-200 dark:border-emerald-900/40'
                          : 'border-orange-200 dark:border-orange-900/40'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-[#f3f4f3] dark:border-[#282b2e]">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                              isCorrect ? 'bg-[#047857]' : 'bg-[#c2410c]'
                            }`}
                          >
                            {isCorrect ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-[#1a1c1c] dark:text-white font-ui">
                              Question {originalIndex + 1} · {q.subject}
                            </span>
                            <span className="text-[10px] text-[#747878] dark:text-[#9ca3af] block font-ui">
                              Topic: {q.syllabusTopic}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleBookmark(q.id)}
                            className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                              isBookmarked
                                ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 text-amber-800 dark:text-amber-300'
                                : 'bg-[#fbfbfa] dark:bg-[#202326] border-[#e5e5e3] dark:border-[#282b2e] text-[#747878]'
                            }`}
                            title="Bookmark for Revision"
                          >
                            <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Question Text */}
                      <p className="font-editorial text-sm sm:text-base leading-relaxed text-[#1a1c1c] dark:text-white whitespace-pre-line">
                        {q.text}
                      </p>

                      {/* Options Review Matrix */}
                      <div className="space-y-1.5 pt-1">
                        {q.options.map((opt) => {
                          const isPicked = userAnswer === opt.id;
                          const isTheCorrect = q.correctAnswer === opt.id;

                          let optionStyle = 'border-[#e5e5e3] dark:border-[#2d3135] bg-[#f9f9f8] dark:bg-[#202326] text-[#444748] dark:text-[#d1d5db]';
                          if (isTheCorrect) {
                            optionStyle = 'border-[#047857] dark:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-[#1a1c1c] dark:text-white font-semibold';
                          } else if (isPicked && !isTheCorrect) {
                            optionStyle = 'border-[#c2410c] dark:border-orange-500 bg-orange-50/70 dark:bg-orange-950/40 text-[#c2410c] dark:text-orange-300 line-through opacity-85';
                          }

                          return (
                            <div
                              key={opt.id}
                              className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-ui transition-all ${optionStyle}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                                    isTheCorrect
                                      ? 'bg-[#047857] text-white'
                                      : isPicked
                                      ? 'bg-[#c2410c] text-white'
                                      : 'bg-white dark:bg-[#1a1c1e] text-[#747878]'
                                  }`}
                                >
                                  {opt.id}
                                </span>
                                <span className="leading-snug">{opt.text}</span>
                              </div>

                              <div className="text-[10px] font-semibold tracking-wider uppercase shrink-0">
                                {isTheCorrect && (
                                  <span className="text-[#047857] dark:text-emerald-400 flex items-center gap-1">
                                    <Check className="h-3 w-3" /> Correct Key
                                  </span>
                                )}
                                {isPicked && !isTheCorrect && (
                                  <span className="text-[#c2410c] dark:text-orange-400">
                                    Your Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Official Explanation Box */}
                      <div className="rounded-xl bg-[#fbfbfa] dark:bg-[#202326] border border-[#e5e5e3] dark:border-[#282b2e] p-3 space-y-1 text-xs font-ui">
                        <div className="flex items-center gap-1.5 font-semibold text-[#047857] dark:text-emerald-400">
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>Official JAMB Solution & Explanation</span>
                        </div>
                        <p className="text-[12px] text-[#444748] dark:text-[#d1d5db] leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>

                      {/* Card Action footer */}
                      {onLaunchTargetedDrill && (
                        <div className="pt-1 flex items-center justify-end">
                          <button
                            onClick={() => {
                              playTapSound();
                              onLaunchTargetedDrill(q.subjectId);
                            }}
                            className="text-xs font-semibold text-[#047857] dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <span>Drill questions on {q.syllabusTopic}</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HISTORY & TRAJECTORY */}
        {activeResultsTab === 'history' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="rounded-2xl border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#1a1c1e] p-5 paper-shadow space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#f3f4f3] dark:border-[#282b2e]">
                <div>
                  <h3 className="font-editorial text-base font-semibold text-[#1a1c1c] dark:text-white">
                    Historical Mock Progression
                  </h3>
                  <span className="text-xs text-[#747878] dark:text-[#9ca3af] font-ui">
                    Target Cutoff: {targetCutoff} marks
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#047857] dark:text-emerald-400 font-ui">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Tracking Active</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {mockHistory.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-[#e5e5e3] dark:border-[#282b2e] bg-[#fbfbfa] dark:bg-[#202326] flex items-center justify-between text-xs font-ui"
                  >
                    <div>
                      <div className="flex items-baseline gap-2">
                        <strong className="text-base font-editorial text-[#1a1c1c] dark:text-white">
                          {item.score} / 400
                        </strong>
                        <span className={`text-[10px] font-semibold ${
                          item.score >= targetCutoff
                            ? 'text-[#047857] dark:text-emerald-400'
                            : 'text-[#c2410c] dark:text-orange-400'
                        }`}>
                          {item.score >= targetCutoff ? 'Qualified' : 'Below Cutoff'}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#747878] dark:text-[#9ca3af] block mt-0.5">
                        {item.date} · {item.accuracy}% Accuracy · {formatTimer(item.timeSpentSeconds)}
                      </span>
                    </div>

                    <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#1a1c1e] border border-[#e5e5e3] dark:border-[#282b2e] flex items-center justify-center font-editorial font-bold text-xs text-[#1a1c1c] dark:text-white">
                      #{mockHistory.length - idx}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Footers */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => {
              playTapSound();
              setExamStarted(false);
              setExamFinished(false);
              setUserAnswers({});
              setFlaggedQuestions(new Set());
              setTimeLeft(45 * 60);
              setCurrentQuestionIndex(0);
            }}
            className="flex-1 rounded-xl border border-[#e5e5e3] dark:border-[#282b2e] py-3 text-xs font-semibold text-[#1a1c1c] dark:text-white hover:bg-[#f9f9f8] dark:hover:bg-[#202326] font-ui transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retake Mock</span>
          </button>
          <button
            onClick={() => {
              playTapSound();
              onNavigateToSyllabus();
            }}
            className="flex-1 rounded-xl bg-[#1a1c1c] dark:bg-white text-white dark:text-[#121314] py-3 text-xs font-semibold font-ui shadow-xs hover:bg-black transition-all cursor-pointer"
          >
            Back to Syllabus
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
  }

  // -------------------------------------------------------------
  // 3. ACTIVE CBT EXAM INTERFACE
  // -------------------------------------------------------------
  return (
    <div className="w-full pb-28 pt-3 px-4 space-y-4 animate-fadeIn">
      {/* Calm Exam Header */}
      <div className="rounded-xl border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#1a1c1e] p-3 paper-shadow flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-300 font-ui">
            UTME CBT Mode
          </span>
          <span className="text-xs text-[#747878] dark:text-[#9ca3af] font-ui">
            Q {currentQuestionIndex + 1} of {totalQuestions}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#c2410c] dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-lg border border-orange-200 dark:border-orange-800/30">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          <button
            onClick={() => {
              playTapSound();
              setIsSubmitModalOpen(true);
            }}
            className="rounded-lg bg-[#1a1c1c] dark:bg-white text-white dark:text-[#121314] px-3 py-1 text-xs font-semibold font-ui shadow-2xs active:scale-95 cursor-pointer"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="rounded-2xl border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#1a1c1e] p-5 sm:p-6 paper-shadow-lifted space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#f3f4f3] dark:border-[#282b2e]">
          <div>
            <span className="text-xs font-semibold text-[#047857] dark:text-emerald-400 font-ui">
              {currentQ.subject}
            </span>
            <span className="text-[11px] text-[#747878] dark:text-[#9ca3af] block font-ui">
              {currentQ.syllabusTopic}
            </span>
          </div>
          <button
            onClick={() => handleToggleFlag(currentQuestionIndex)}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border font-ui transition-all cursor-pointer ${
              flaggedQuestions.has(currentQuestionIndex)
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300'
                : 'bg-white dark:bg-[#202326] text-[#747878] dark:text-[#9ca3af] border-[#e5e5e3] dark:border-[#2d3135]'
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${flaggedQuestions.has(currentQuestionIndex) ? 'fill-amber-500' : ''}`} />
            <span>{flaggedQuestions.has(currentQuestionIndex) ? 'Flagged' : 'Flag'}</span>
          </button>
        </div>

        {/* Question Text */}
        <p className="font-editorial text-base sm:text-lg leading-relaxed text-[#1a1c1c] dark:text-white whitespace-pre-line py-1">
          {currentQ.text}
        </p>

        {/* 4 Tactile Options */}
        <div className="space-y-2 pt-2">
          {currentQ.options.map((opt) => {
            const isSelected = userAnswers[currentQuestionIndex] === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectAnswer(opt.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-[#047857] dark:border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-[#1a1c1c] dark:text-white shadow-2xs font-medium'
                    : 'border-[#e5e5e3] dark:border-[#2d3135] bg-[#f9f9f8] dark:bg-[#202326] text-[#444748] dark:text-[#d1d5db] hover:border-[#747878]'
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold font-ui ${
                    isSelected
                      ? 'bg-[#047857] text-white border-[#047857]'
                      : 'bg-white dark:bg-[#1a1c1e] border-[#e5e5e3] dark:border-[#2d3135] text-[#747878] dark:text-[#9ca3af]'
                  }`}
                >
                  {opt.id}
                </div>
                <span className="flex-1 font-ui text-[13px] leading-snug">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Prev / Next Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-[#f3f4f3] dark:border-[#282b2e]">
          <button
            onClick={() => {
              playTapSound();
              setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
            }}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-1 rounded-xl border border-[#e5e5e3] dark:border-[#282b2e] px-4 py-2 text-xs font-semibold text-[#1a1c1c] dark:text-white disabled:opacity-40 font-ui cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => {
              playTapSound();
              setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
            }}
            disabled={currentQuestionIndex === totalQuestions - 1}
            className="flex items-center gap-1 rounded-xl bg-[#1a1c1c] dark:bg-white text-white dark:text-[#121314] px-4 py-2 text-xs font-semibold font-ui shadow-2xs disabled:opacity-40 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Question Palette Matrix */}
      <div className="rounded-2xl border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#1a1c1e] p-4 paper-shadow space-y-2.5">
        <div className="flex items-center justify-between text-xs font-ui">
          <span className="font-semibold text-[#1a1c1c] dark:text-white">Question Navigator</span>
          <div className="flex items-center gap-3 text-[10px] text-[#747878] dark:text-[#9ca3af]">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#047857]" /> Answered ({answeredCount})
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Flagged ({flaggedQuestions.size})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-8 gap-1.5 pt-1">
          {MOCK_EXAM_QUESTIONS.map((q, idx) => {
            const isCurrent = currentQuestionIndex === idx;
            const isAnswered = userAnswers[idx] !== undefined;
            const isFlagged = flaggedQuestions.has(idx);

            return (
              <button
                key={idx}
                onClick={() => {
                  playTapSound();
                  setCurrentQuestionIndex(idx);
                }}
                className={`h-8 rounded-lg text-xs font-semibold font-ui transition-all cursor-pointer ${
                  isCurrent
                    ? 'ring-2 ring-[#1a1c1c] dark:ring-white scale-105'
                    : ''
                } ${
                  isFlagged
                    ? 'bg-amber-400 text-amber-950 font-bold'
                    : isAnswered
                    ? 'bg-[#047857] text-white'
                    : 'bg-[#f3f4f3] dark:bg-[#202326] text-[#747878] dark:text-[#9ca3af] hover:bg-[#e5e5e3]'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirm Submission Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1c1e] p-5 shadow-2xl border border-[#e5e5e3] dark:border-[#282b2e] space-y-4">
            <h3 className="font-editorial text-lg font-semibold text-[#1a1c1c] dark:text-white">
              Submit CBT Mock Exam?
            </h3>
            <p className="text-xs text-[#747878] dark:text-[#9ca3af] font-ui leading-relaxed">
              You have answered <strong className="text-[#1a1c1c] dark:text-white">{answeredCount} of {totalQuestions} questions</strong>.
              {totalQuestions - answeredCount > 0 && (
                <span className="text-amber-600 dark:text-amber-400 block mt-1">
                  Warning: You have {totalQuestions - answeredCount} unanswered questions remaining.
                </span>
              )}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 rounded-xl border border-stone-200/70 dark:border-stone-800 py-2.5 text-xs font-semibold text-stone-900 dark:text-stone-100 font-ui hover:opacity-90 active:scale-[0.98] duration-200 ease-out cursor-pointer"
              >
                Return to Exam
              </button>
              <button
                onClick={handleFinishExam}
                className="btn-matte flex-1 rounded-xl py-2.5 text-xs font-semibold font-ui shadow-xs cursor-pointer"
              >
                Confirm & Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Score Modal */}
      <ShareScoreModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={{
          ...profile,
          currentEstimatedScore: results.estimatedJAMBScore,
        }}
      />
    </div>
  );
};
