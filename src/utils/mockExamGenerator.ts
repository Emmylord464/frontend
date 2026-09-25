import { COMPREHENSIVE_JAMB_QUESTIONS } from '../data/comprehensiveQuestionBank';
import { HARD_JAMB_QUESTIONS } from '../data/hardQuestions';
import { INITIAL_QUESTIONS } from '../data/jambData';
import { getFreshQuestionsForSubject, randomizeQuestionOptions } from './questionEngine';
import { Question } from '../types';

export interface CBTQuestion {
  id: number;
  globalIndex: number;
  subjectIndex: number;
  subjectId: string;
  subjectName: string;
  syllabusTopic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  text: string;
  options: { id: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

const SUBJECT_TOPIC_MAP: Record<string, string[]> = {
  english: [
    'Lexis & Structure',
    'Synonyms & Antonyms',
    'Concord & Agreement',
    'Idiomatic Expressions',
    'Sentence Completion',
    'Grammatical Inversion',
    'Comprehension Analysis',
    'Spelling & Stress Patterns',
  ],
  maths: [
    'Calculus: Differentiation',
    'Calculus: Integration',
    'Logarithms & Indices',
    'Matrices & Determinants',
    'Coordinate Geometry',
    'Trigonometry & Identities',
    'Quadratic & Polynomial Equations',
    'Permutations & Combinations',
  ],
  physics: [
    'Mechanics: Projectile Motion',
    'Mechanics: Work, Energy & Power',
    'Optics: Refraction & Reflection',
    'Current Electricity & Ohm\'s Law',
    'Electromagnetism & AC Resonance',
    'Modern Physics: Photoelectric Effect',
    'Thermal Physics & Gas Laws',
    'Wave Motion & Sound',
  ],
  chemistry: [
    'Stoichiometry & Gas Laws',
    'Electrochemistry & Faraday\'s Laws',
    'Chemical Equilibrium & Le Chatelier',
    'Organic Chemistry: Isomerism',
    'Periodic Table & Ionization Energy',
    'Acids, Bases & pH Calculations',
    'Thermodynamics & Enthalpy',
    'Nuclear Chemistry & Radioactivity',
  ],
  biology: [
    'Genetics & Mendelian Inheritance',
    'Sex-Linked Traits & Pedigrees',
    'Plant Physiology & Photosynthesis',
    'Cell Structure & Organelles',
    'Ecology & Energy Flow',
    'Human Physiology & Circulation',
    'Excretion & Osmoregulation',
    'Evolution & Natural Selection',
  ],
  economics: [
    'Price Elasticity of Demand',
    'National Income Accounting (GDP/GNP)',
    'Market Structures: Monopoly & Oligopoly',
    'Money, Banking & Inflation',
    'International Trade & Balance of Payments',
    'Production Theory & Diminishing Returns',
    'Public Finance & Taxation',
    'Economic Growth & Development',
  ],
  government: [
    'Constitutional History of Nigeria (1922-1999)',
    'Federalism & Division of Powers',
    'The Rule of Law & Fundamental Rights',
    'Electoral Systems & Political Parties',
    'Public Administration & Civil Service',
    'Foreign Policy of Nigeria (NEPAD/AU)',
    'Colonial Administration: Indirect Rule',
    'International Organizations (UN, ECOWAS)',
  ],
  literature: [
    'Literary Devices: Metaphor & Metonymy',
    'Poetic Tropes & Rhyme Scheme',
    'African Prose & Narrative Techniques',
    'Non-African Drama & Tragedy',
    'Characterization & Themes',
    'Dramatic Irony & Catharsis',
    'Figurative Language & Imagery',
    'Stylistic Devices in African Poetry',
  ],
  commerce: [
    'International Trade & Documents (Bill of Lading)',
    'Banking & Financial Institutions',
    'Insurance: Principles & Indemnity',
    'Wholesale & Retail Distribution',
    'Business Organizations & Companies',
    'E-Commerce & Digital Payments',
    'Consumer Protection & Standard Bodies',
    'Stock Exchange & Capital Markets',
  ],
  accounting: [
    'Accounting Concepts & Principles',
    'Double Entry Bookkeeping',
    'Trial Balance & Correction of Errors',
    'Depreciation: Straight Line & Reducing',
    'Final Accounts: Trading, P&L Balance Sheet',
    'Bank Reconciliation Statements',
    'Partnership Accounts & Goodwill',
    'Company Accounts & Ratio Analysis',
  ],
  crs: [
    'The Sovereignty of God & Creation',
    'The Covenant: Abraham & Moses',
    'Prophets of Social Justice: Amos & Hosea',
    'The Ministry of Jesus Christ & Miracles',
    'The Passion, Death & Resurrection',
    'The Early Church: Pentecost & Fellowship',
    'Paul\'s Epistles: Faith & Justification',
    'Christian Living in the Community',
  ],
  irs: [
    'Pillars of Islam & Tawhid',
    'Surah Al-Fatihah & Selected Chapters',
    'Hadith: Authenticity & Science of Sunnah',
    'Zakat & Charitable Obligations (Fiqh)',
    'The Life of Prophet Muhammad (SAW) in Makkah & Madinah',
    'Khulafa ar-Rashidun (The Rightly Guided Caliphs)',
    'Islamic Moral Code & Social Ethics',
    'Hajj: Rites & Spiritual Significance',
  ],
  geography: [
    'Map Reading & Scale Calculations',
    'Earth\'s Structure & Plate Tectonics',
    'Climate Zones & Biomes of West Africa',
    'Geomorphology: Weathering & Landforms',
    'Population & Urbanization in Nigeria',
    'Agricultural & Mineral Resources',
    'Hydrology & Drainage Systems',
    'Environmental Hazards & Conservation',
  ],
  agric: [
    'Soil Science: Soil Texture & Structure',
    'Crop Production: Agronomic Practices',
    'Plant Nutrition: Macro & Micro Nutrients',
    'Animal Husbandry & Livestock Nutrition',
    'Agricultural Economics & Extension',
    'Farm Mechanization & Implements',
    'Pest & Weed Management',
    'Forestry & Wildlife Conservation',
  ],
};

/**
 * Generate 50 distinct, verified past-question style questions for a given subject
 * Uses fresh question engine to eliminate duplicates and repetitive patterns.
 */
export function generate50QuestionsForSubject(
  subjectId: string,
  subjectName: string,
  startIndex: number
): CBTQuestion[] {
  const freshQuestions = getFreshQuestionsForSubject(subjectId, 50);
  const topics = SUBJECT_TOPIC_MAP[subjectId] || SUBJECT_TOPIC_MAP['english'] || ['General Core Topic'];

  return freshQuestions.map((q, idx) => {
    const globalIdx = startIndex + idx;
    const topic = q.syllabusTopic || topics[idx % topics.length];

    return {
      id: globalIdx + 1,
      globalIndex: globalIdx,
      subjectIndex: idx,
      subjectId,
      subjectName,
      syllabusTopic: topic,
      difficulty: (q.difficulty as any) || (idx % 3 === 0 ? 'Hard' : 'Medium'),
      text: q.text,
      options: q.options as any,
      correctAnswer: q.correctAnswer as any,
      explanation: q.explanation || `According to official JAMB syllabus principles for ${topic}, option (${q.correctAnswer}) is correct.`,
    };
  });
}

/**
 * Generate a complete 4-Subject 200-Question Exam Set (50 Questions per Subject)
 */
export function generateFull200QuestionExam(
  selectedSubjects: { id: string; name: string }[]
): {
  questions: CBTQuestion[];
  subjectRanges: Record<string, { start: number; end: number; count: number }>;
} {
  const allQuestions: CBTQuestion[] = [];
  const subjectRanges: Record<string, { start: number; end: number; count: number }> = {};

  selectedSubjects.forEach((sub, subIdx) => {
    const start = subIdx * 50;
    const subQuestions = generate50QuestionsForSubject(sub.id, sub.name, start);
    allQuestions.push(...subQuestions);
    subjectRanges[sub.id] = {
      start,
      end: start + 49,
      count: 50,
    };
  });

  return {
    questions: allQuestions,
    subjectRanges,
  };
}
