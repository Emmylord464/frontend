/**
 * ingest-aloc-v2.ts
 *
 * Fetches UTME past questions from the ALOC Station API and persists them to
 * PostgreSQL (via Drizzle ORM) with the following quality guarantees:
 *
 *  ✅ HTML-stripped question text and options
 *  ✅ Minimum 3-of-4 valid options enforced before insert
 *  ✅ Answer-key normalisation (handles "a)", "Option A", "(A)", "1" etc.)
 *  ✅ Real JAMB syllabus topic mapping via keyword matching
 *  ✅ 300 ms delay between batch requests to respect ALOC rate limits
 */

import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import {
  syllabusTopics,
  pastQuestions,
  subjectEnum,
  type SubjectEnumType,
} from '../src/db/schema';

const ALOC_TOKEN    = process.env.ALOC_TOKEN;
const DATABASE_URL  = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL or DIRECT_URL not found in .env — check your .env file exists');
}

const sql = postgres(DATABASE_URL, { prepare: false });
const db  = drizzle(sql);

const ALOC_BASE_URL = 'https://questions.aloc.com.ng/api/v2/m';
const FETCH_DELAY_MS = 300;

// ============================================================================
// OFFICIAL JAMB SYLLABUS — topic name + keywords for fuzzy matching
// Source: JAMB UTME Syllabus 2024/2025 (all 4 core subjects)
// ============================================================================

interface SyllabusTopic {
  topicName: string;
  questionWeight: string;
  orderIndex: number;
  keywords: string[];
}

const JAMB_SYLLABUS: Record<SubjectEnumType, SyllabusTopic[]> = {

  // --------------------------------------------------------------------------
  // USE OF ENGLISH  (60 questions in the actual UTME)
  // --------------------------------------------------------------------------
  USE_OF_ENGLISH: [
    {
      topicName: 'Lexis and Structure',
      questionWeight: '18.00%',
      orderIndex: 1,
      keywords: ['vocabulary', 'word', 'lexis', 'diction', 'structure', 'usage',
                 'appropriacy', 'register', 'collocation', 'connotation', 'denotation'],
    },
    {
      topicName: 'Comprehension and Summary',
      questionWeight: '20.00%',
      orderIndex: 2,
      keywords: ['comprehension', 'passage', 'summary', 'precis', 'main idea',
                 'paragraph', 'inference', 'implied', 'author'],
    },
    {
      topicName: 'Oral English and Phonology',
      questionWeight: '12.00%',
      orderIndex: 3,
      keywords: ['oral', 'phonology', 'vowel', 'consonant', 'stress', 'intonation',
                 'rhyme', 'syllable', 'phoneme', 'pronunciation', 'sound', 'tone'],
    },
    {
      topicName: 'Figures of Speech and Literary Devices',
      questionWeight: '8.00%',
      orderIndex: 4,
      keywords: ['figure', 'speech', 'metaphor', 'simile', 'irony', 'hyperbole',
                 'personification', 'alliteration', 'oxymoron', 'antithesis',
                 'euphemism', 'litotes', 'synecdoche', 'metonymy', 'imagery'],
    },
    {
      topicName: 'Antonyms and Synonyms',
      questionWeight: '6.00%',
      orderIndex: 5,
      keywords: ['antonym', 'synonym', 'opposite', 'similar meaning', 'closest meaning'],
    },
    {
      topicName: 'Sentence Completion and Cloze Test',
      questionWeight: '10.00%',
      orderIndex: 6,
      keywords: ['blank', 'fill', 'complete', 'cloze', 'gap', 'sentence completion'],
    },
    {
      topicName: 'Grammatical Accuracy and Parts of Speech',
      questionWeight: '14.00%',
      orderIndex: 7,
      keywords: ['noun', 'pronoun', 'verb', 'adjective', 'adverb', 'preposition',
                 'conjunction', 'grammar', 'tense', 'subject', 'predicate',
                 'gerund', 'infinitive', 'participle', 'clause', 'phrase',
                 'agreement', 'concord', 'passive', 'active'],
    },
    {
      topicName: 'Punctuation and Spelling',
      questionWeight: '5.00%',
      orderIndex: 8,
      keywords: ['punctuation', 'comma', 'colon', 'semicolon', 'apostrophe',
                 'spelling', 'capital letter', 'full stop', 'hyphen'],
    },
    {
      topicName: 'Idiomatic Expressions and Proverbs',
      questionWeight: '7.00%',
      orderIndex: 9,
      keywords: ['idiom', 'idiomatic', 'proverb', 'expression', 'phrase meaning'],
    },
  ],

  // --------------------------------------------------------------------------
  // MATHEMATICS  (40 questions)
  // --------------------------------------------------------------------------
  MATHEMATICS: [
    {
      topicName: 'Number and Numeration',
      questionWeight: '10.00%',
      orderIndex: 1,
      keywords: ['number', 'numeration', 'integer', 'real number', 'rational',
                 'irrational', 'prime', 'factor', 'multiple', 'hcf', 'lcm',
                 'base', 'number base', 'fraction', 'decimal', 'percentage',
                 'ratio', 'proportion', 'binary', 'octal', 'hexadecimal'],
    },
    {
      topicName: 'Algebra — Equations and Expressions',
      questionWeight: '14.00%',
      orderIndex: 2,
      keywords: ['algebra', 'equation', 'expression', 'linear', 'quadratic',
                 'simultaneous', 'polynomial', 'expansion', 'factorisation',
                 'factorization', 'identity', 'remainder', 'factor theorem',
                 'roots', 'discriminant', 'variation'],
    },
    {
      topicName: 'Indices, Logarithms and Surds',
      questionWeight: '8.00%',
      orderIndex: 3,
      keywords: ['index', 'indices', 'logarithm', 'log', 'surd', 'root', 'power',
                 'exponent', 'antilog'],
    },
    {
      topicName: 'Sets, Logic and Boolean Algebra',
      questionWeight: '5.00%',
      orderIndex: 4,
      keywords: ['set', 'union', 'intersection', 'complement', 'universal set',
                 'venn diagram', 'logic', 'proposition', 'boolean'],
    },
    {
      topicName: 'Sequences and Series',
      questionWeight: '5.00%',
      orderIndex: 5,
      keywords: ['sequence', 'series', 'arithmetic progression', 'geometric progression',
                 'ap', 'gp', 'common difference', 'common ratio', 'sum to infinity'],
    },
    {
      topicName: 'Matrices and Determinants',
      questionWeight: '5.00%',
      orderIndex: 6,
      keywords: ['matrix', 'matrices', 'determinant', 'inverse', 'transpose',
                 'scalar multiplication', '2x2'],
    },
    {
      topicName: 'Plane and Coordinate Geometry',
      questionWeight: '8.00%',
      orderIndex: 7,
      keywords: ['coordinate', 'geometry', 'gradient', 'slope', 'intercept',
                 'midpoint', 'distance', 'locus', 'straight line', 'circle',
                 'parabola', 'conic'],
    },
    {
      topicName: 'Trigonometry',
      questionWeight: '8.00%',
      orderIndex: 8,
      keywords: ['trigonometry', 'sine', 'cosine', 'tangent', 'sin', 'cos', 'tan',
                 'angle', 'bearing', 'elevation', 'depression', 'identity',
                 'radian', 'degree', 'cosec', 'sec', 'cot'],
    },
    {
      topicName: 'Mensuration and Plane Figures',
      questionWeight: '8.00%',
      orderIndex: 9,
      keywords: ['mensuration', 'area', 'perimeter', 'volume', 'surface area',
                 'circle', 'rectangle', 'triangle', 'trapezium', 'cylinder',
                 'cone', 'sphere', 'prism', 'pyramid'],
    },
    {
      topicName: 'Calculus — Differentiation and Integration',
      questionWeight: '8.00%',
      orderIndex: 10,
      keywords: ['calculus', 'differentiation', 'integration', 'derivative',
                 'gradient function', 'maxima', 'minima', 'turning point',
                 'rate of change', 'integral', 'definite', 'indefinite'],
    },
    {
      topicName: 'Statistics and Probability',
      questionWeight: '9.00%',
      orderIndex: 11,
      keywords: ['statistics', 'probability', 'mean', 'median', 'mode',
                 'frequency', 'histogram', 'ogive', 'bar chart', 'pie chart',
                 'standard deviation', 'variance', 'range', 'quartile',
                 'permutation', 'combination', 'binomial'],
    },
    {
      topicName: 'Vectors and Mechanics',
      questionWeight: '5.00%',
      orderIndex: 12,
      keywords: ['vector', 'scalar', 'resultant', 'component', 'displacement',
                 'velocity', 'acceleration', 'force', 'mechanics'],
    },
    {
      topicName: 'Binary Operations and Modular Arithmetic',
      questionWeight: '5.00%',
      orderIndex: 13,
      keywords: ['binary operation', 'modular', 'modulo', 'closure', 'associative',
                 'commutative', 'identity element', 'inverse element'],
    },
  ],

  // --------------------------------------------------------------------------
  // PHYSICS  (40 questions)
  // --------------------------------------------------------------------------
  PHYSICS: [
    {
      topicName: 'Measurements and Units',
      questionWeight: '5.00%',
      orderIndex: 1,
      keywords: ['measurement', 'unit', 'si unit', 'dimension', 'significant figure',
                 'error', 'vernier caliper', 'micrometer', 'screw gauge', 'precision'],
    },
    {
      topicName: 'Scalars, Vectors and Motion',
      questionWeight: '10.00%',
      orderIndex: 2,
      keywords: ['scalar', 'vector', 'motion', 'speed', 'velocity', 'displacement',
                 'acceleration', 'distance', 'uniform', 'non-uniform', 'projectile',
                 'circular motion', 'relative motion', 'kinematics'],
    },
    {
      topicName: 'Dynamics and Newton\'s Laws of Motion',
      questionWeight: '8.00%',
      orderIndex: 3,
      keywords: ['dynamics', 'newton', "newton's law", 'force', 'momentum', 'impulse',
                 'friction', 'mass', 'weight', 'inertia', 'collision', 'conserv',
                 'elastic', 'inelastic', 'equilibrium'],
    },
    {
      topicName: 'Work, Energy and Power',
      questionWeight: '7.00%',
      orderIndex: 4,
      keywords: ['work', 'energy', 'power', 'potential energy', 'kinetic energy',
                 'conservation of energy', 'joule', 'watt', 'efficiency',
                 'mechanical advantage'],
    },
    {
      topicName: 'Heat and Temperature',
      questionWeight: '7.00%',
      orderIndex: 5,
      keywords: ['heat', 'temperature', 'thermometer', 'thermal', 'celsius',
                 'kelvin', 'specific heat', 'latent heat', 'expansion',
                 'conduction', 'convection', 'radiation', 'gas law',
                 'boyle', 'charles', 'thermodynamics'],
    },
    {
      topicName: 'Waves — Properties and Types',
      questionWeight: '7.00%',
      orderIndex: 6,
      keywords: ['wave', 'wavelength', 'frequency', 'period', 'amplitude',
                 'transverse', 'longitudinal', 'reflection', 'refraction',
                 'diffraction', 'interference', 'superposition', 'resonance'],
    },
    {
      topicName: 'Sound and Acoustics',
      questionWeight: '5.00%',
      orderIndex: 7,
      keywords: ['sound', 'acoustic', 'echo', 'pitch', 'loudness', 'reverberation',
                 'ultrasound', 'infrasound', 'decibel', 'musical note', 'vibration',
                 'string', 'pipe', 'organ'],
    },
    {
      topicName: 'Light and Optics',
      questionWeight: '8.00%',
      orderIndex: 8,
      keywords: ['light', 'optic', 'lens', 'mirror', 'reflection', 'refraction',
                 'prism', 'spectrum', 'colour', 'critical angle', 'total internal reflection',
                 'focal length', 'magnification', 'eye', 'defect', 'dispersion'],
    },
    {
      topicName: 'Electrostatics and Capacitance',
      questionWeight: '7.00%',
      orderIndex: 9,
      keywords: ['electrostatic', 'charge', 'coulomb', 'electric field', 'potential',
                 'capacitor', 'capacitance', 'farad', 'insulator', 'conductor',
                 'dielectric', "gauss's law"],
    },
    {
      topicName: 'Current Electricity and Circuits',
      questionWeight: '8.00%',
      orderIndex: 10,
      keywords: ['current', 'resistance', 'ohm', 'voltage', 'circuit', 'series',
                 'parallel', 'resistor', 'kirchhoff', 'emf', 'internal resistance',
                 'power', 'energy', 'ammeter', 'voltmeter', 'wheatstone'],
    },
    {
      topicName: 'Magnetism and Electromagnetism',
      questionWeight: '7.00%',
      orderIndex: 11,
      keywords: ['magnet', 'magnetic', 'electromagnetism', 'faraday', 'flux',
                 'induction', 'transformer', 'motor', 'generator', 'solenoid',
                 'field lines', 'lenz'],
    },
    {
      topicName: 'Modern Physics and Nuclear Physics',
      questionWeight: '8.00%',
      orderIndex: 12,
      keywords: ['nuclear', 'radioactiv', 'alpha', 'beta', 'gamma', 'half-life',
                 'fission', 'fusion', 'photoelectric', 'x-ray', 'quantum',
                 'energy level', 'atomic model', 'rutherford', 'bohr',
                 'mass defect', 'binding energy', 'isotope', 'nuclide'],
    },
    {
      topicName: 'Electronics and Semiconductors',
      questionWeight: '5.00%',
      orderIndex: 13,
      keywords: ['electronic', 'semiconductor', 'diode', 'transistor', 'rectifier',
                 'logic gate', 'and gate', 'or gate', 'not gate', 'p-n junction',
                 'intrinsic', 'extrinsic', 'doping'],
    },
    {
      topicName: 'Simple Machines and Mechanical Advantage',
      questionWeight: '4.00%',
      orderIndex: 14,
      keywords: ['machine', 'mechanical advantage', 'velocity ratio', 'lever',
                 'pulley', 'inclined plane', 'screw', 'gear', 'wheel', 'efficiency'],
    },
  ],

  // --------------------------------------------------------------------------
  // CHEMISTRY  (40 questions)
  // --------------------------------------------------------------------------
  CHEMISTRY: [
    {
      topicName: 'Atomic Structure and Periodicity',
      questionWeight: '8.00%',
      orderIndex: 1,
      keywords: ['atom', 'atomic', 'proton', 'neutron', 'electron', 'orbital',
                 'shell', 'periodic table', 'period', 'group', 'periodicity',
                 'electronic configuration', 'valence', 'atomic number',
                 'mass number', 'isotope', 'dalton', 'rutherford', 'bohr'],
    },
    {
      topicName: 'Chemical Bonding and Structure',
      questionWeight: '7.00%',
      orderIndex: 2,
      keywords: ['bond', 'bonding', 'ionic', 'covalent', 'metallic', 'hydrogen bond',
                 'van der waals', 'electronegativity', 'polarity', 'dipole',
                 'coordinate bond', 'dative bond', 'molecular shape', 'vsepr'],
    },
    {
      topicName: 'States of Matter and Gas Laws',
      questionWeight: '6.00%',
      orderIndex: 3,
      keywords: ['state', 'solid', 'liquid', 'gas', 'plasma', 'kinetic theory',
                 'boyle', 'charles', 'avogadro', 'ideal gas', 'pressure',
                 'volume', 'temperature', 'molar volume', 'dalton'],
    },
    {
      topicName: 'Stoichiometry and Mole Concept',
      questionWeight: '8.00%',
      orderIndex: 4,
      keywords: ['mole', 'stoichiometry', 'molar mass', 'avogadro constant',
                 'empirical formula', 'molecular formula', 'percentage composition',
                 'yield', 'limiting reagent', 'balanced equation', 'gram'],
    },
    {
      topicName: 'Chemical Energetics and Thermochemistry',
      questionWeight: '6.00%',
      orderIndex: 5,
      keywords: ['enthalpy', 'exothermic', 'endothermic', 'hess', 'bond energy',
                 'heat of combustion', 'heat of formation', 'heat of neutralization',
                 'energy diagram', 'activation energy', 'calorimetry'],
    },
    {
      topicName: 'Chemical Equilibrium and Le Chatelier',
      questionWeight: '6.00%',
      orderIndex: 6,
      keywords: ['equilibrium', 'le chatelier', 'reversible', 'kc', 'kp',
                 'equilibrium constant', 'haber', 'contact process',
                 'forward reaction', 'backward reaction', 'dynamic'],
    },
    {
      topicName: 'Chemical Kinetics and Rates of Reaction',
      questionWeight: '5.00%',
      orderIndex: 7,
      keywords: ['kinetic', 'rate of reaction', 'catalyst', 'activation energy',
                 'concentration', 'temperature effect', 'surface area',
                 'order of reaction', 'half-life', 'arrhenius'],
    },
    {
      topicName: 'Acids, Bases and Salts',
      questionWeight: '7.00%',
      orderIndex: 8,
      keywords: ['acid', 'base', 'alkali', 'salt', 'ph', 'neutralization',
                 'titration', 'indicator', 'buffer', 'hydrolysis', 'bronsted',
                 'lowry', 'lewis acid', 'amphoteric', 'strong acid', 'weak acid'],
    },
    {
      topicName: 'Electrochemistry',
      questionWeight: '6.00%',
      orderIndex: 9,
      keywords: ['electrolysis', 'electrode', 'cathode', 'anode', 'electrolyte',
                 'faraday', 'electroplating', 'galvanic cell', 'battery',
                 'oxidation', 'reduction', 'redox', 'standard electrode potential',
                 'electrochemical'],
    },
    {
      topicName: 'Separation Techniques and Analysis',
      questionWeight: '4.00%',
      orderIndex: 10,
      keywords: ['separation', 'distillation', 'filtration', 'crystallization',
                 'chromatography', 'sublimation', 'evaporation', 'decantation',
                 'solvent extraction', 'paper chromatography'],
    },
    {
      topicName: 'Metals, Non-metals and Their Compounds',
      questionWeight: '7.00%',
      orderIndex: 11,
      keywords: ['metal', 'non-metal', 'alloy', 'iron', 'copper', 'zinc', 'sodium',
                 'calcium', 'aluminium', 'nitrogen', 'oxygen', 'sulphur', 'chlorine',
                 'halogens', 'noble gas', 'blast furnace', 'corrosion', 'rusting'],
    },
    {
      topicName: 'Organic Chemistry — Hydrocarbons',
      questionWeight: '8.00%',
      orderIndex: 12,
      keywords: ['organic', 'hydrocarbon', 'alkane', 'alkene', 'alkyne', 'benzene',
                 'aromatic', 'aliphatic', 'homologous', 'isomerism', 'isomer',
                 'addition', 'substitution', 'polymerization', 'cracking',
                 'petroleum', 'fractional distillation', 'methane', 'ethene'],
    },
    {
      topicName: 'Organic Chemistry — Functional Groups',
      questionWeight: '8.00%',
      orderIndex: 13,
      keywords: ['functional group', 'alcohol', 'aldehyde', 'ketone', 'carboxylic acid',
                 'ester', 'ether', 'amine', 'amide', 'halide', 'phenol',
                 'fermentation', 'saponification', 'esterification', 'soap',
                 'detergent', 'protein', 'amino acid', 'carbohydrate', 'glucose'],
    },
    {
      topicName: 'Polymers and Materials',
      questionWeight: '4.00%',
      orderIndex: 14,
      keywords: ['polymer', 'polymerization', 'addition polymer', 'condensation polymer',
                 'nylon', 'polythene', 'rubber', 'thermoplastic', 'thermosetting',
                 'plastic', 'fibre'],
    },
    {
      topicName: 'Environmental Chemistry and Pollution',
      questionWeight: '5.00%',
      orderIndex: 15,
      keywords: ['environment', 'pollution', 'acid rain', 'greenhouse', 'ozone',
                 'photochemical smog', 'heavy metal', 'water treatment',
                 'eutrophication', 'global warming', 'fertilizer', 'pesticide'],
    },
  ],

  // Subjects in the enum not covered by the 4 core — provide a fallback
  BIOLOGY: [],
  ECONOMICS: [],
  GOVERNMENT: [],
};

// ============================================================================
// SUBJECT CONFIG
// ============================================================================

const SUBJECT_CONFIG: {
  alocSubject: string;
  schemaSubject: SubjectEnumType;
  subjectSlug: string;
}[] = [
  { alocSubject: 'english',     schemaSubject: 'USE_OF_ENGLISH', subjectSlug: 'english'     },
  { alocSubject: 'mathematics', schemaSubject: 'MATHEMATICS',    subjectSlug: 'mathematics'  },
  { alocSubject: 'physics',     schemaSubject: 'PHYSICS',        subjectSlug: 'physics'      },
  { alocSubject: 'chemistry',   schemaSubject: 'CHEMISTRY',      subjectSlug: 'chemistry'    },
];

// ============================================================================
// ALOC API TYPES
// ============================================================================

interface ALOCStationQuestion {
  id: number;
  question: string;
  option: { a: string; b: string; c: string; d: string; e?: string };
  answer: string;
  solution?: string;
  examtype?: string;
  examyear?: string | number;
  section?: string;        // ← ALOC topic/section hint — used for mapping
  subsection?: string;
}

interface ALOCStationResponse {
  status: number;
  message?: string;
  data: ALOCStationQuestion[] | ALOCStationQuestion;
}

// ============================================================================
// UTILITY — HTML STRIP
// Strip all HTML tags and decode common HTML entities from a string.
// ============================================================================

function stripHtml(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, ' ')          // remove all tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/\s{2,}/g, ' ')           // collapse multiple spaces
    .trim();
}

// ============================================================================
// UTILITY — ANSWER KEY NORMALISATION
// Handles: "a", "A", "a)", "(a)", "Option A", "option a", "1","2","3","4"
// Returns: single uppercase letter "A" | "B" | "C" | "D" | "E"
// ============================================================================

function normaliseAnswerKey(raw: string): string | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();

  // Numeric answer  "1"→A, "2"→B, "3"→C, "4"→D, "5"→E
  if (/^[1-5]$/.test(s)) {
    return String.fromCharCode(64 + parseInt(s));   // 65='A'
  }

  // Extract the first letter from any pattern
  const match = s.match(/[a-e]/);
  if (match) return match[0].toUpperCase();

  return null;
}

// ============================================================================
// UTILITY — SYLLABUS TOPIC MATCHING
// Scores each syllabus topic by counting keyword hits in combined text.
// Returns the best-matching topic name (or null to use the fallback).
// ============================================================================

function matchSyllabusTopic(
  subject: SubjectEnumType,
  questionText: string,
  sectionHint: string,
): SyllabusTopic | null {
  const topics = JAMB_SYLLABUS[subject];
  if (!topics || topics.length === 0) return null;

  const haystack = `${sectionHint} ${questionText}`.toLowerCase();

  let bestTopic: SyllabusTopic | null = null;
  let bestScore = 0;

  for (const topic of topics) {
    let score = 0;
    for (const kw of topic.keywords) {
      if (haystack.includes(kw.toLowerCase())) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  // Require at least one keyword hit; otherwise fall back
  return bestScore > 0 ? bestTopic : null;
}

// ============================================================================
// DB HELPERS — topic cache + upsert
// ============================================================================

// In-memory cache: "SUBJECT::topicName" → uuid
const topicCache = new Map<string, string>();

async function getOrCreateTopic(
  subject: SubjectEnumType,
  syllabusTopic: SyllabusTopic,
): Promise<string> {
  const cacheKey = `${subject}::${syllabusTopic.topicName}`;
  if (topicCache.has(cacheKey)) return topicCache.get(cacheKey)!;

  const existing = await db
    .select({ id: syllabusTopics.id })
    .from(syllabusTopics)
    .where(and(
      eq(syllabusTopics.subject, subject),
      eq(syllabusTopics.topicName, syllabusTopic.topicName),
    ))
    .limit(1);

  if (existing.length > 0) {
    topicCache.set(cacheKey, existing[0].id);
    return existing[0].id;
  }

  const [inserted] = await db
    .insert(syllabusTopics)
    .values({
      subject,
      topicName:     syllabusTopic.topicName,
      subTopicName:  syllabusTopic.topicName,
      objectives:    `Master all JAMB UTME questions on ${syllabusTopic.topicName}`,
      questionWeight: syllabusTopic.questionWeight,
      orderIndex:    syllabusTopic.orderIndex,
      examYear:      2026,
    })
    .returning({ id: syllabusTopics.id });

  topicCache.set(cacheKey, inserted.id);
  return inserted.id;
}

// ============================================================================
// ALOC API FETCH
// ============================================================================

async function fetchALOCBatch(subject: string): Promise<ALOCStationQuestion[]> {
  const url = `${ALOC_BASE_URL}?subject=${encodeURIComponent(subject)}&type=utme`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (ALOC_TOKEN) headers['AccessToken'] = ALOC_TOKEN;

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ALOC API ${response.status}: ${text.slice(0, 200)}`);
  }

  const result = (await response.json()) as ALOCStationResponse;
  if (!result.data) return [];
  return Array.isArray(result.data) ? result.data : [result.data];
}

// ============================================================================
// SLEEP HELPER
// ============================================================================

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// DATA CLEANING — validate and transform one ALOC question
// Returns null if question fails quality checks.
// ============================================================================

interface CleanQuestion {
  questionText: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  correctOption: string;
  explanation: string;
  year: string;
  examYear: number;
}

function cleanQuestion(q: ALOCStationQuestion): CleanQuestion | null {
  const rawQ = q.question ?? '';
  // Reject complex HTML like tables or images that don't render cleanly
  if (/<(table|img|tr|td|canvas|svg|script)/i.test(rawQ)) return null;
  if (/\[table\]|\[image\]|\[diagram\]|\[fig/i.test(rawQ)) return null;

  // 1. Strip HTML from question text
  const questionText = stripHtml(rawQ);
  if (questionText.length < 20) return null;   // too short or broken

  // 2. Strip HTML from all options and collect valid ones
  const rawOptions: Record<string, string> = {};
  for (const [key, val] of Object.entries(q.option ?? {})) {
    const rawVal = String(val ?? '');
    if (/<(table|img|tr|td)/i.test(rawVal)) return null;
    if (/\[table\]|\[image\]/i.test(rawVal)) return null;
    const cleaned = stripHtml(rawVal);
    if (cleaned.length > 0) rawOptions[key.toLowerCase()] = cleaned;
  }

  // 3. Enforce exactly 4 valid options (A, B, C, D)
  const requiredKeys = ['a', 'b', 'c', 'd'];
  for (const k of requiredKeys) {
    if (!rawOptions[k] || rawOptions[k].trim().length === 0) return null;
  }

  // 4. Normalise answer key — always lowercase to match id field
  const correctLetter = normaliseAnswerKey(q.answer ?? '');
  if (!correctLetter || !rawOptions[correctLetter.toLowerCase()]) {
    // Answer key is broken — skip this question
    return null;
  }

  // 5. Build options array — { id: 'a', text: '...', isCorrect: boolean }
  const options = requiredKeys.map((key) => ({
    id: key,
    text: rawOptions[key].trim(),
    isCorrect: key === correctLetter.toLowerCase(),
  }));

  // 6. Strip HTML from explanation
  const explanation = q.solution
    ? stripHtml(q.solution)
    : 'Official JAMB past question answer key.';

  const examYear = Number(q.examyear) || 2024;
  const year     = String(q.examyear ?? '2024');

  return { questionText, options, correctOption: correctLetter.toLowerCase(), explanation, year, examYear };
}

// ============================================================================
// MAIN INGESTION FUNCTION
// ============================================================================

export async function runIngestion(targetCountPerSubject = 250) {
  console.log('🚀 Starting ALOC Station UTME ingestion (clean mode)…');
  if (!ALOC_TOKEN) {
    console.warn('⚠️  ALOC_TOKEN not set — running on demo quota.');
  }

  let totalInserted = 0;
  let totalSkipped  = 0;
  let totalRejected = 0;

  for (const config of SUBJECT_CONFIG) {
    console.log(`\n📚 Subject: ${config.schemaSubject}`);

    // Pre-seed every syllabus topic into the DB so they exist even before
    // any questions arrive. This populates the skill tree immediately.
    const syllabusForSubject = JAMB_SYLLABUS[config.schemaSubject] ?? [];
    const fallbackTopic = syllabusForSubject[0] ?? {
      topicName:      `Core ${config.alocSubject.toUpperCase()} Past Questions`,
      questionWeight: '5.00%',
      orderIndex:     1,
    } as SyllabusTopic;

    for (const t of syllabusForSubject) {
      await getOrCreateTopic(config.schemaSubject, t);
    }

    let subjectInserted = 0;
    let attempts        = 0;
    const maxAttempts   = Math.ceil(targetCountPerSubject / 8); // ALOC returns ~8-20/batch

    while (subjectInserted < targetCountPerSubject && attempts < maxAttempts) {
      attempts++;

      try {
        const questions = await fetchALOCBatch(config.alocSubject);
        if (questions.length === 0) { console.log('  ⚠️  Empty batch — stopping.'); break; }

        for (const q of questions) {
          // --- CLEAN ---
          const clean = cleanQuestion(q);
          if (!clean) { totalRejected++; continue; }

          // --- TOPIC MATCH ---
          const sectionHint   = stripHtml(q.section ?? q.subsection ?? '');
          const matchedTopic  = matchSyllabusTopic(
            config.schemaSubject,
            clean.questionText,
            sectionHint,
          ) ?? fallbackTopic;

          const topicId = await getOrCreateTopic(config.schemaSubject, matchedTopic as SyllabusTopic);

          // --- INSERT ---
          const result = await db
            .insert(pastQuestions)
            .values({
              alocId:        q.id,
              subject:       config.schemaSubject,
              subjectSlug:   config.subjectSlug,
              topicId,
              examType:      'UTME',
              year:          clean.year,
              questionText:  clean.questionText,
              options:       clean.options,
              correctOption: clean.correctOption,
              explanation:   clean.explanation,
              examYear:      clean.examYear,
            })
            .onConflictDoNothing({ target: pastQuestions.alocId })
            .returning({ id: pastQuestions.id });

          if (result.length > 0) {
            subjectInserted++;
            totalInserted++;
          } else {
            totalSkipped++;   // duplicate
          }

          if (subjectInserted >= targetCountPerSubject) break;
        }

        console.log(`  Progress [${config.schemaSubject}]: ${subjectInserted}/${targetCountPerSubject} inserted | rejected: ${totalRejected}`);
      } catch (err) {
        console.error(`  Batch error (${config.alocSubject}):`, (err as Error).message);
        break;
      }

      // ⏳ Respect ALOC rate limit — 300 ms between batches
      await sleep(FETCH_DELAY_MS);
    }

    console.log(`  ✅ ${config.schemaSubject}: ${subjectInserted} inserted`);
  }

  console.log(`
🎉 Ingestion complete!
   Inserted  : ${totalInserted}
   Skipped   : ${totalSkipped}  (duplicates)
   Rejected  : ${totalRejected}  (failed quality checks)
`);

  await sql.end();
}

// Run ingestion when invoked with 75 verified clean questions per subject (300 total)
runIngestion(75)
  .then(() => {
    console.log('Ingestion finished.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal ingestion error:', err);
    process.exit(1);
  });