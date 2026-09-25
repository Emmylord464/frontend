export type Department = 'Sciences' | 'Commercial' | 'Arts' | 'Languages';

export interface SubjectConfig {
  id: string; // Database key (e.g., 'MATHEMATICS')
  slug: string; // URL slug (e.g., 'mathematics')
  name: string;
  shortName: string;
  department: Department;
  color: string;
  border: string;
  bgGradient: string;
  accentBg: string;
  accentText: string;
  questionCount: number; // 60 for English, 40 for others
  examMinutes: number;
  description: string;
  coreTopics: string[];
}

export const ALL_19_SUBJECTS: SubjectConfig[] = [
  // ─── 1. Sciences (STEM) ───────────────────────────────────────────────────
  {
    id: 'MATHEMATICS',
    slug: 'mathematics',
    name: 'Mathematics',
    shortName: 'MTH',
    department: 'Sciences',
    color: '#06b6d4',
    border: 'border-cyan-500/30',
    bgGradient: 'from-cyan-950/30 via-slate-900 to-slate-950',
    accentBg: 'bg-cyan-500/10',
    accentText: 'text-cyan-300',
    questionCount: 40,
    examMinutes: 40,
    description: 'Algebra, calculus, trigonometry, and coordinate geometry.',
    coreTopics: ['Number & Numeration', 'Algebraic Processes', 'Geometry & Trigonometry', 'Calculus', 'Statistics & Probability'],
  },
  {
    id: 'PHYSICS',
    slug: 'physics',
    name: 'Physics',
    shortName: 'PHY',
    department: 'Sciences',
    color: '#6366f1',
    border: 'border-indigo-500/30',
    bgGradient: 'from-indigo-950/30 via-slate-900 to-slate-950',
    accentBg: 'bg-indigo-500/10',
    accentText: 'text-indigo-300',
    questionCount: 40,
    examMinutes: 40,
    description: 'Mechanics, heat, waves, electricity, magnetism, and modern physics.',
    coreTopics: ['Mechanics & Motion', 'Thermal Physics', 'Waves & Optics', 'Electricity & Magnetism', 'Atomic & Nuclear Physics'],
  },
  {
    id: 'CHEMISTRY',
    slug: 'chemistry',
    name: 'Chemistry',
    shortName: 'CHE',
    department: 'Sciences',
    color: '#f59e0b',
    border: 'border-amber-500/30',
    bgGradient: 'from-amber-950/30 via-slate-900 to-slate-950',
    accentBg: 'bg-amber-500/10',
    accentText: 'text-amber-300',
    questionCount: 40,
    examMinutes: 40,
    description: 'Atomic structure, stoichiometry, equilibria, and organic reactions.',
    coreTopics: ['Separation & Matter', 'Atomic Structure & Bonding', 'Stoichiometry & Gas Laws', 'Acids, Bases & Salts', 'Organic Chemistry'],
  },
  {
    id: 'BIOLOGY',
    slug: 'biology',
    name: 'Biology',
    shortName: 'BIO',
    department: 'Sciences',
    color: '#10b981',
    border: 'border-emerald-500/30',
    bgGradient: 'from-emerald-950/30 via-slate-900 to-slate-950',
    accentBg: 'bg-emerald-500/10',
    accentText: 'text-emerald-300',
    questionCount: 40,
    examMinutes: 40,
    description: 'Cell biology, heredity, ecology, and plant/animal physiology.',
    coreTopics: ['Living Organisms & Cell Biology', 'Plant & Animal Physiology', 'Genetics & Evolution', 'Ecology & Environment', 'Reproduction'],
  },
  {
    id: 'AGRICULTURAL_SCIENCE',
    slug: 'agricultural-science',
    name: 'Agricultural Science',
    shortName: 'AGR',
    department: 'Sciences',
    color: '#84cc16',
    border: 'border-lime-500/30',
    bgGradient: 'from-lime-950/30 via-slate-900 to-slate-950',
    accentBg: 'bg-lime-500/10',
    accentText: 'text-lime-300',
    questionCount: 40,
    examMinutes: 40,
    description: 'Crop production, soil science, animal husbandry, and farm economics.',
    coreTopics: ['General Agriculture & Soil', 'Crop Production & Protection', 'Animal Science & Management', 'Agricultural Economics', 'Farm Mechanization'],
  },

  // ─── 2. Commercial & Social Sciences ──────────────────────────────────────
  {
    id: 'ECONOMICS',
    slug: 'economics',
    name: 'Economics',
    shortName: 'ECO',
    department: 'Commercial',
    color: '#38bdf8',
    border: 'border-sky-500/30',
    bgGradient: 'from-sky-950/30 via-slate-900 to-slate-950',
    accentBg: 'bg-sky-500/10',
    accentText: 'text-sky-300',
    questionCount: 40,
    examMinutes: 40,
    description: 'Price theory, national income, international trade, and public finance.',
    coreTopics: ['Price Determination & Elasticity', 'Production & Market Structures', 'National Income & Money', 'Public Finance & Fiscal Policy', 'International Trade'],
  },
  {
    id: 'COMMERCE',
    slug: 'commerce',
    name: 'Commerce',
    shortName: 'COM',
    department: 'Commercial',
    color: '#fb923c',
    border: 'border-orange-500/30',
    bgGradient: 'from-orange-950/30 via-slate-900 to-slate-950',
    accentBg: 'bg-orange-500/10',
    accentText: 'text-orange-300',
    questionCount: 40,
    examMinutes: 40,
    description: 'Trade mechanisms, banking, warehousing, insurance, and advertising.',
    coreTopics: ['Home & Foreign Trade', 'Banking & Financial Institutions', 'Insurance & Risk', 'Warehousing & Transportation', 'Business Management & Law'],
  },
  {
    id: 'FINANCIAL_ACCOUNTING',
    slug: 'financial-accounting',
    name: 'Financial Accounting',
    shortName: 'ACC',
    department: 'Commercial',
    color: '#a855f7',
    border: 'border-purple-500/30',
    bgGradient: 'from-purple-950/30 via-slate-900 to-slate-950',
    accentBg: 'bg-purple-500/10',
    accentText: 'text-purple-300',
    questionCount: 40,
    examMinutes: 40,
    description: 'Double entry, ledger balancing, final accounts, and company statements.',
    coreTopics: ['Principles of Double Entry', 'Cash Books & Bank Reconciliation', 'Financial Statements & Adjustments', 'Partnership Accounts', 'Company Accounts'],
  },
  {
    id: 'GEOGRAPHY',
    slug: 'geography',
    name: 'Geography',
    shortName: 'GEO',
    department: 'Commercial',
    color: '#14b8a6',
    border: 'border-teal-500/30',
    bgGradient: 'from-teal-950/30 via-slate-900 to-slate-950',
    accentBg: 'bg-teal-500/10',
    accentText: 'text-teal-300',
    questionCount: 40,
    examMinutes: 40,
    description: 'Map reading, physical terrain, weather & climate, and regional economic geography.',
    coreTopics: ['Map Reading & Interpretation', 'Earth Internal & External Processes', 'Weather, Climate & Biomes', 'Human Settlement & Urbanization', 'Regional Geography of Nigeria'],
  },
  {
    id: 'GOVERNMENT',
    slug: 'government',
    name: 'Government',
    shortName: 'GOV',
    department: 'Commercial',
    color: '#e11d48',
    border: 'border-rose-500/30',
    bgGradient: 'from-rose-950/30 via-slate-900 to-slate-950',
    accentBg: 'bg-rose-500/10',
    accentText: 'text-rose-300',
    questionCount: 40,
    examMinutes: 40,
    description: 'Political theories, constitutional development, citizenship, and foreign policy.',
    coreTopics: ['Basic Concepts of Government', 'Constitutions & Political Systems', 'Colonial Administration in Nigeria', 'Constitutional Development (1922–1999)', 'Nigerian Foreign Policy & International Orgs'],
  },

  // ─── 3. Arts & Humanities ────────────────────────────────────────────────
  {
    id: 'LITERATURE_IN_ENGLISH',
    slug: 'literature-in-english',
    name: 'Literature in English',
    shortName: 'LIT',
    department: 'Arts',
    color: '#ec4899',
    border: 'border-pink-500/30',
    bgGradient: 'from-pink-950/30 via-slate-900 to-slate-950',
    accentBg: 'bg-pink-500/10',
    accentText: 'text-pink-300',
    questionCount: 40,
    examMinutes: 40,
    description: 'African & non-African drama, poetry analysis, prose fiction, and literary devices.',
    coreTopics: ['Literary Terms & Devices', 'African Drama', 'Non-African Drama', 'African Poetry', 'Non-African Poetry & Prose'],
  },
  {
    id: 'CRS',
    slug: 'crs',
    name: 'Christian Religious Studies',
    shortName: 'CRS',
    department: 'Arts',
    color: '#3b82f6',
    border: 'border-blue-500/30',
    bgGradient: 'from-blue-950/30 via-slate-900 to-slate-950',
    accentBg: 'bg-blue-500/10',
    accentText: 'text-blue-300',
    questionCount: 40,
    examMinutes: 40,
    description: 'Sovereignty of God, covenants, prophetic messages, and early church apostolic ministry.',
    coreTopics: ['Early Life & Covenant in Israel', 'Prophetic Tradition & Social Justice', 'Synoptic Gospels & Teachings of Jesus', 'Early Church Acts & Missionary Journeys', 'Epistles & Faith in Practice'],
  },
  {
    id: 'IRS',
    slug: 'irs',
    name: 'Islamic Religious Studies',
    shortName: 'IRS',
    department: 'Arts',
    color: '#059669',
    border: 'border-emerald-600/30',
    bgGradient: 'from-emerald-950/40 via-slate-900 to-slate-950',
    accentBg: 'bg-emerald-600/10',
    accentText: 'text-emerald-400',
    questionCount: 40,
    examMinutes: 40,
    description: 'Quranic revelation, Hadith transmission, Tawhid (Islamic monotheism), and Shariah jurisprudence.',
    coreTopics: ['Quranic Sciences & Tafsir', 'Hadith Classification & Matn', 'Tawhid & Pillars of Islam', 'Fiqh: Taharah, Salah, Zakah & Sawm', 'Islamic History & Caliphate'],
  },
  {
    id: 'HISTORY',
    slug: 'history',
    name: 'History',
    shortName: 'HIS',
    department: 'Arts',
    color: '#ca8a04',
    border: 'border-yellow-600/30',
    bgGradient: 'from-yellow-950/30 via-slate-900 to-slate-950',
    accentBg: 'bg-yellow-600/10',
    accentText: 'text-yellow-300',
    questionCount: 40,
    examMinutes: 40,
    description: 'Pre-colonial Nigerian kingdoms, colonial rule, independence struggle, and nation-building.',
    coreTopics: ['Pre-colonial States in Nigeria', 'External Contacts & Atlantic Slave Trade', 'British Conquest & Indirect Rule', 'Decolonization & Nationalist Movements', 'Post-Independence Politics & Civil War'],
  },
  {
    id: 'CIVIC_EDUCATION',
    slug: 'civic-education',
    name: 'Civic Education',
    shortName: 'CIV',
    department: 'Arts',
    color: '#2dd4bf',
    border: 'border-teal-400/30',
    bgGradient: 'from-teal-950/30 via-slate-900 to-slate-950',
    accentBg: 'bg-teal-400/10',
    accentText: 'text-teal-200',
    questionCount: 40,
    examMinutes: 40,
    description: 'Rule of law, human rights, democratic values, constitution, and citizen responsibilities.',
    coreTopics: ['Values & National Consciousness', 'Citizenship & Human Rights', 'Democracy & Rule of Law', 'Public Administration & Civil Society', 'Contemporary Social Challenges'],
  },

  // ─── 4. Languages & General ───────────────────────────────────────────────
  {
    id: 'USE_OF_ENGLISH',
    slug: 'use-of-english',
    name: 'Use of English',
    shortName: 'ENG',
    department: 'Languages',
    color: '#10b981',
    border: 'border-emerald-500/30',
    bgGradient: 'from-emerald-950/30 via-slate-900 to-slate-950',
    accentBg: 'bg-emerald-500/10',
    accentText: 'text-emerald-300',
    questionCount: 60, // Compulsory for every candidate
    examMinutes: 60,
    description: 'Comprehension passages, lexis and structure, oral phonetics, and novel analysis.',
    coreTopics: ['Comprehension & Summary', 'Lexis & Vocabulary', 'Sentence Structure & Concord', 'Oral Forms & Stress Patterns', 'Prescribed UTME Novel'],
  },
  {
    id: 'YORUBA',
    slug: 'yoruba',
    name: 'Yoruba',
    shortName: 'YOR',
    department: 'Languages',
    color: '#f97316',
    border: 'border-orange-500/30',
    bgGradient: 'from-orange-950/30 via-slate-900 to-slate-950',
    accentBg: 'bg-orange-500/10',
    accentText: 'text-orange-300',
    questionCount: 40,
    examMinutes: 40,
    description: 'Ede (Grammar/Tone), Asa (Culture/Traditions), and Litireso (Oral & Written Literature).',
    coreTopics: ['Aroko & Ede (Composition & Tone)', 'Girama & Fonetiki (Grammar & Phonology)', 'Asa & Isedale (Culture & Customs)', 'Litireso Alo & Abalaye (Oral Literature)', 'Litireso Apileko (Modern Literature)'],
  },
  {
    id: 'IGBO',
    slug: 'igbo',
    name: 'Igbo',
    shortName: 'IGB',
    department: 'Languages',
    color: '#06b6d4',
    border: 'border-cyan-500/30',
    bgGradient: 'from-cyan-950/30 via-slate-900 to-slate-950',
    accentBg: 'bg-cyan-500/10',
    accentText: 'text-cyan-300',
    questionCount: 40,
    examMinutes: 40,
    description: 'Utoasusu (Grammar), Omenala (Igbo Customs/Tradition), and Agumagu (Literature).',
    coreTopics: ['Utoasusu & Fonoloji (Grammar & Phonetics)', 'Omenala & Ndi Igbo (Customs & Heritage)', 'Agumagu Odinala (Folklore & Oral Art)', 'Agumagu Ederede (Modern Prose & Poetry)', 'Nkowa & Ntughari (Comprehension & Translation)'],
  },
  {
    id: 'HAUSA',
    slug: 'hausa',
    name: 'Hausa',
    shortName: 'HAU',
    department: 'Languages',
    color: '#22c55e',
    border: 'border-green-500/30',
    bgGradient: 'from-green-950/30 via-slate-900 to-slate-950',
    accentBg: 'bg-green-500/10',
    accentText: 'text-green-300',
    questionCount: 40,
    examMinutes: 40,
    description: 'Harshe (Grammar/Phonology), Al\'adu (Culture & Traditions), and Adabi (Literature).',
    coreTopics: ['Tsarin Sauti & Nahawu (Phonetics & Grammar)', 'Al\'adun Hausawa (Traditions & Culture)', 'Adabin Baka (Oral Literature & Proverbs)', 'Rubutaccen Adabi (Written Prose & Poetry)', 'Fassara & Fahimta (Translation & Comprehension)'],
  },
];

export const DEPARTMENTS: Department[] = ['Sciences', 'Commercial', 'Arts', 'Languages'];

export function getAllSubjects(): SubjectConfig[] {
  return ALL_19_SUBJECTS;
}

export function getSubjectBySlug(slug: string): SubjectConfig | undefined {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().replace(/_/g, '-');
  return ALL_19_SUBJECTS.find((s) => s.slug === normalized || s.id.toLowerCase() === slug.toLowerCase());
}

export function getSubjectById(id: string): SubjectConfig | undefined {
  if (!id) return undefined;
  const normalized = id.toUpperCase().replace(/-/g, '_');
  return ALL_19_SUBJECTS.find((s) => s.id === normalized || s.slug === id.toLowerCase());
}

export function getSubjectsByDepartment(dept: Department): SubjectConfig[] {
  return ALL_19_SUBJECTS.filter((s) => s.department === dept);
}

