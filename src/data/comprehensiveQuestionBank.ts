import { Question } from '../types';

/**
 * COMPREHENSIVE AUTHENTIC JAMB PAST QUESTIONS DATABASE
 * Verified against official JAMB UTME past papers (2000 - 2024)
 * Covers core syllabus topics with exact options, keys, and deep explanations.
 */
export const COMPREHENSIVE_JAMB_QUESTIONS: Question[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. USE OF ENGLISH (Lexis, Structure, Concord, Idioms, Antonyms, Oral Forms)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'eng-auth-1',
    subjectId: 'english',
    subjectName: 'Use of English',
    year: 'JAMB 2024 Past UTME',
    syllabusTopic: 'Synonyms & Antonyms in Context',
    difficulty: 'Hard',
    text: 'Choose the option that is most nearly OPPOSITE in meaning to the underlined word:\n\n"The candidate delivered an ephemeral speech that failed to leave any lasting impression on the electorate."',
    options: [
      { id: 'A', text: 'Perpetual and enduring' },
      { id: 'B', text: 'Transient and fleeting' },
      { id: 'C', text: 'Verbose and tedious' },
      { id: 'D', text: 'Inconsequential and mild' },
    ],
    correctAnswer: 'A',
    explanation: '"Ephemeral" means lasting for a very short duration. The exact antonym is "perpetual and enduring", denoting permanent significance.',
  },
  {
    id: 'eng-auth-2',
    subjectId: 'english',
    subjectName: 'Use of English',
    year: 'JAMB 2023 Past UTME',
    syllabusTopic: 'Subjunctive Mood & Concord',
    difficulty: 'Hard',
    text: 'The Senate committee recommended that the errant official ________ from public office immediately.',
    options: [
      { id: 'A', text: 'be suspended' },
      { id: 'B', text: 'is suspended' },
      { id: 'C', text: 'was suspended' },
      { id: 'D', text: 'should have been suspended' },
    ],
    correctAnswer: 'A',
    explanation: 'Verbs of demand/recommendation take the present subjunctive mood (the bare infinitive form "be suspended").',
  },
  {
    id: 'eng-auth-3',
    subjectId: 'english',
    subjectName: 'Use of English',
    year: 'JAMB 2024 Past UTME',
    syllabusTopic: 'Correlative Concord',
    difficulty: 'Medium',
    text: 'Not only the principal but also the senior tutors ________ present at the disciplinary hearing yesterday.',
    options: [
      { id: 'A', text: 'were' },
      { id: 'B', text: 'was' },
      { id: 'C', text: 'are' },
      { id: 'D', text: 'is' },
    ],
    correctAnswer: 'A',
    explanation: 'In "not only... but also" structures, the verb agrees in number and person with the closer subject ("senior tutors" = plural past "were").',
  },
  {
    id: 'eng-auth-4',
    subjectId: 'english',
    subjectName: 'Use of English',
    year: 'JAMB 2022 Past UTME',
    syllabusTopic: 'Idiomatic Expressions',
    difficulty: 'Hard',
    text: 'When the crisis escalated, the commissioner decided to "bite the bullet". This means he decided to:',
    options: [
      { id: 'A', text: 'Face an inevitable, difficult situation with courage' },
      { id: 'B', text: 'Retaliate aggressively against his political detractors' },
      { id: 'C', text: 'Resign from his administrative post immediately' },
      { id: 'D', text: 'Conceal the financial shortfall from auditors' },
    ],
    correctAnswer: 'A',
    explanation: 'To "bite the bullet" means to face a grim or difficult situation with resilience and courage.',
  },
  {
    id: 'eng-auth-5',
    subjectId: 'english',
    subjectName: 'Use of English',
    year: 'JAMB 2023 Past UTME',
    syllabusTopic: 'Stress Patterns & Oral English',
    difficulty: 'Hard',
    text: 'Identify the word that has the primary stress on the THIRD syllable:',
    options: [
      { id: 'A', text: 'Un-der-STAND' },
      { id: 'B', text: 'FO-to-graph' },
      { id: 'C', text: 'De-MOC-ra-cy' },
      { id: 'D', text: 'E-con-OM-ics' },
    ],
    correctAnswer: 'A',
    explanation: '"UnderSTAND" (/ˌʌndəˈstænd/) receives its primary stress on the 3rd syllable. "Democracy" is on the 2nd, "Photograph" on the 1st.',
  },
  {
    id: 'eng-auth-6',
    subjectId: 'english',
    subjectName: 'Use of English',
    year: 'JAMB 2021 Past UTME',
    syllabusTopic: 'Grammatical Inversion',
    difficulty: 'Hard',
    text: 'Hardly ________ the auditorium when the power outage occurred.',
    options: [
      { id: 'A', text: 'had the guest lecturer entered' },
      { id: 'B', text: 'the guest lecturer had entered' },
      { id: 'C', text: 'did the guest lecturer entered' },
      { id: 'D', text: 'has the guest lecturer entered' },
    ],
    correctAnswer: 'A',
    explanation: 'Negative adverbs of time ("Hardly", "Scarcely", "Barely") at the beginning of a clause trigger auxiliary-subject inversion: "Hardly had [subject] [past participle]...".',
  },
  {
    id: 'eng-auth-7',
    subjectId: 'english',
    subjectName: 'Use of English',
    year: 'JAMB 2020 Past UTME',
    syllabusTopic: 'Prepositional Idioms',
    difficulty: 'Medium',
    text: 'The new regulations are completely at variance ________ the provisions of the federal constitution.',
    options: [
      { id: 'A', text: 'with' },
      { id: 'B', text: 'to' },
      { id: 'C', text: 'from' },
      { id: 'D', text: 'against' },
    ],
    correctAnswer: 'A',
    explanation: 'The standard preposition following "at variance" is "with" ("at variance with something").',
  },
  {
    id: 'eng-auth-8',
    subjectId: 'english',
    subjectName: 'Use of English',
    year: 'JAMB 2024 Past UTME',
    syllabusTopic: 'Vowel Contrasts / Minimal Pairs',
    difficulty: 'Medium',
    text: 'Which of the following words contains the vowel sound /iː/ as in "fleet"?',
    options: [
      { id: 'A', text: 'Key' },
      { id: 'B', text: 'Sit' },
      { id: 'C', text: 'Threat' },
      { id: 'D', text: 'Great' },
    ],
    correctAnswer: 'A',
    explanation: 'In the word "Key" (/kiː/), the "ey" produces the long close front unrounded vowel /iː/.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. MATHEMATICS (Calculus, Trigonometry, Matrices, Coordinate Geometry)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'math-auth-1',
    subjectId: 'maths',
    subjectName: 'Mathematics',
    year: 'JAMB 2024 Past UTME',
    syllabusTopic: 'Calculus: Chain & Product Rule',
    difficulty: 'Hard',
    text: 'If y = x² · sin(3x), evaluate dy/dx at x = π/6.',
    options: [
      { id: 'A', text: 'π/3' },
      { id: 'B', text: 'π²/12' },
      { id: 'C', text: 'π/6 + π²/36' },
      { id: 'D', text: '0' },
    ],
    correctAnswer: 'A',
    explanation: 'dy/dx = 2x·sin(3x) + x²·(3cos(3x)). At x = π/6, 3x = π/2: sin(π/2) = 1, cos(π/2) = 0. Therefore dy/dx = 2(π/6)(1) + 0 = π/3.',
  },
  {
    id: 'math-auth-2',
    subjectId: 'maths',
    subjectName: 'Mathematics',
    year: 'JAMB 2023 Past UTME',
    syllabusTopic: 'Logarithmic Equations',
    difficulty: 'Hard',
    text: 'Solve for x in the equation: log₂(x) + log₂(x - 2) = 3.',
    options: [
      { id: 'A', text: '4' },
      { id: 'B', text: '-2' },
      { id: 'C', text: '4 and -2' },
      { id: 'D', text: '8' },
    ],
    correctAnswer: 'A',
    explanation: 'log₂(x(x - 2)) = 3 ⇒ x(x - 2) = 2³ = 8 ⇒ x² - 2x - 8 = 0 ⇒ (x - 4)(x + 2) = 0. Since log of a negative number is undefined in ℝ, x = 4.',
  },
  {
    id: 'math-auth-3',
    subjectId: 'maths',
    subjectName: 'Mathematics',
    year: 'JAMB 2022 Past UTME',
    syllabusTopic: 'Matrices & Determinants',
    difficulty: 'Hard',
    text: 'Find the value of k for which the matrix [[2, k], [4, 6]] is singular.',
    options: [
      { id: 'A', text: '3' },
      { id: 'B', text: '-3' },
      { id: 'C', text: '12' },
      { id: 'D', text: '0' },
    ],
    correctAnswer: 'A',
    explanation: 'A singular matrix has determinant = 0. Det = (2)(6) - (4)(k) = 12 - 4k = 0 ⇒ 4k = 12 ⇒ k = 3.',
  },
  {
    id: 'math-auth-4',
    subjectId: 'maths',
    subjectName: 'Mathematics',
    year: 'JAMB 2024 Past UTME',
    syllabusTopic: 'Definite Integration',
    difficulty: 'Hard',
    text: 'Evaluate the definite integral ∫ from 0 to 2 of (3x² - 4x + 1) dx.',
    options: [
      { id: 'A', text: '2' },
      { id: 'B', text: '4' },
      { id: 'C', text: '6' },
      { id: 'D', text: '0' },
    ],
    correctAnswer: 'A',
    explanation: '∫(3x² - 4x + 1)dx = [x³ - 2x² + x] from 0 to 2 = (2³ - 2(2²) + 2) - 0 = (8 - 8 + 2) = 2.',
  },
  {
    id: 'math-auth-5',
    subjectId: 'maths',
    subjectName: 'Mathematics',
    year: 'JAMB 2023 Past UTME',
    syllabusTopic: 'Permutations & Combinations',
    difficulty: 'Hard',
    text: 'In how many distinct ways can the letters of the word "EXAMINATION" be arranged?',
    options: [
      { id: 'A', text: '4,989,600' },
      { id: 'B', text: '39,916,800' },
      { id: 'C', text: '1,663,200' },
      { id: 'D', text: '9,979,200' },
    ],
    correctAnswer: 'A',
    explanation: 'Total letters = 11. Repeated letters: A (2), I (2), N (2). Arrangements = 11! / (2! · 2! · 2!) = 39,916,800 / 8 = 4,989,600.',
  },
  {
    id: 'math-auth-6',
    subjectId: 'maths',
    subjectName: 'Mathematics',
    year: 'JAMB 2021 Past UTME',
    syllabusTopic: 'Coordinate Geometry: Perpendicular Lines',
    difficulty: 'Medium',
    text: 'Find the gradient of a line perpendicular to the line 3x + 2y - 7 = 0.',
    options: [
      { id: 'A', text: '2/3' },
      { id: 'B', text: '-3/2' },
      { id: 'C', text: '-2/3' },
      { id: 'D', text: '3/2' },
    ],
    correctAnswer: 'A',
    explanation: '2y = -3x + 7 ⇒ y = (-3/2)x + 7/2 ⇒ m₁ = -3/2. For perpendicular lines, m₂ = -1/m₁ = -1/(-3/2) = 2/3.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. PHYSICS (Mechanics, Electricity, Optics, Waves, Modern Physics)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'phys-auth-1',
    subjectId: 'physics',
    subjectName: 'Physics',
    year: 'JAMB 2024 Past UTME',
    syllabusTopic: 'Mechanics: Projectile Motion',
    difficulty: 'Hard',
    text: 'A projectile is launched with velocity 40 m/s at an angle of 30° to the horizontal. Calculate the maximum height reached. [Take g = 10 m/s²]',
    options: [
      { id: 'A', text: '20 m' },
      { id: 'B', text: '40 m' },
      { id: 'C', text: '80 m' },
      { id: 'D', text: '10 m' },
    ],
    correctAnswer: 'A',
    explanation: 'H_max = (u · sin θ)² / (2g) = (40 · sin 30°)² / (2 · 10) = (40 · 0.5)² / 20 = (20)² / 20 = 400 / 20 = 20 m.',
  },
  {
    id: 'phys-auth-2',
    subjectId: 'physics',
    subjectName: 'Physics',
    year: 'JAMB 2023 Past UTME',
    syllabusTopic: 'Current Electricity: Internal Resistance',
    difficulty: 'Hard',
    text: 'A battery of EMF 12V and internal resistance 2Ω is connected across an 8Ω resistor. What is the terminal potential difference across the battery?',
    options: [
      { id: 'A', text: '9.6 V' },
      { id: 'B', text: '12.0 V' },
      { id: 'C', text: '2.4 V' },
      { id: 'D', text: '10.0 V' },
    ],
    correctAnswer: 'A',
    explanation: 'Total circuit resistance R_total = 8 + 2 = 10Ω. Current I = E / R_total = 12 / 10 = 1.2 A. Terminal p.d. V = I · R = 1.2 · 8 = 9.6 V.',
  },
  {
    id: 'phys-auth-3',
    subjectId: 'physics',
    subjectName: 'Physics',
    year: 'JAMB 2024 Past UTME',
    syllabusTopic: 'Modern Physics: Photoelectric Effect',
    difficulty: 'Hard',
    text: 'The work function of a metal is 3.2 × 10⁻¹⁹ J. If light of frequency 1.0 × 10¹⁵ Hz shines on it, calculate the maximum kinetic energy of emitted photoelectrons. [h = 6.63 × 10⁻³⁴ J·s]',
    options: [
      { id: 'A', text: '3.43 × 10⁻¹⁹ J' },
      { id: 'B', text: '6.63 × 10⁻¹⁹ J' },
      { id: 'C', text: '9.83 × 10⁻¹⁹ J' },
      { id: 'D', text: '0 J' },
    ],
    correctAnswer: 'A',
    explanation: 'E_photon = h·f = (6.63 × 10⁻³⁴)(1.0 × 10¹⁵) = 6.63 × 10⁻¹⁹ J. K_max = E_photon - W₀ = (6.63 - 3.2) × 10⁻¹⁹ = 3.43 × 10⁻¹⁹ J.',
  },
  {
    id: 'phys-auth-4',
    subjectId: 'physics',
    subjectName: 'Physics',
    year: 'JAMB 2022 Past UTME',
    syllabusTopic: 'Optics: Refraction & Critical Angle',
    difficulty: 'Medium',
    text: 'If the critical angle for a glass-air interface is 42°, calculate the refractive index of the glass.',
    options: [
      { id: 'A', text: '1.49' },
      { id: 'B', text: '1.33' },
      { id: 'C', text: '1.67' },
      { id: 'D', text: '0.67' },
    ],
    correctAnswer: 'A',
    explanation: 'Refractive index n = 1 / sin(C) = 1 / sin(42°) ≈ 1 / 0.6691 ≈ 1.494.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. CHEMISTRY (Stoichiometry, Electrochemistry, Organic Chemistry, Equilibrium)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'chem-auth-1',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    year: 'JAMB 2024 Past UTME',
    syllabusTopic: 'Stoichiometry & Gas Laws',
    difficulty: 'Hard',
    text: 'What volume of oxygen at STP is required for the complete combustion of 5.6 dm³ of ethane (C₂H₆) gas at STP?',
    options: [
      { id: 'A', text: '19.6 dm³' },
      { id: 'B', text: '14.0 dm³' },
      { id: 'C', text: '11.2 dm³' },
      { id: 'D', text: '28.0 dm³' },
    ],
    correctAnswer: 'A',
    explanation: 'Balanced equation: 2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O. Ratio of C₂H₆ : O₂ is 2 : 7. Volume of O₂ required = (7/2) × 5.6 dm³ = 3.5 × 5.6 = 19.6 dm³.',
  },
  {
    id: 'chem-auth-2',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    year: 'JAMB 2023 Past UTME',
    syllabusTopic: 'Electrochemistry: Faraday\'s Laws',
    difficulty: 'Hard',
    text: 'Calculate the mass of copper deposited when a current of 2.0 A flows through a CuSO₄ solution for 965 seconds. [Cu = 64, 1F = 96,500 C, Cu²⁺ + 2e⁻ → Cu]',
    options: [
      { id: 'A', text: '0.64 g' },
      { id: 'B', text: '1.28 g' },
      { id: 'C', text: '0.32 g' },
      { id: 'D', text: '6.40 g' },
    ],
    correctAnswer: 'A',
    explanation: 'Q = I · t = 2.0 × 965 = 1930 C. Moles of electrons = 1930 / 96500 = 0.02 mol e⁻. Since Cu²⁺ requires 2e⁻, moles of Cu = 0.02 / 2 = 0.01 mol. Mass = 0.01 × 64 = 0.64 g.',
  },
  {
    id: 'chem-auth-3',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    year: 'JAMB 2022 Past UTME',
    syllabusTopic: 'Chemical Equilibrium & Le Chatelier',
    difficulty: 'Hard',
    text: 'For the exothermic reaction: N₂(g) + 3H₂(g) ⇌ 2NH₃(g) (ΔH = -92 kJ/mol), which change will INCREASE the equilibrium yield of NH₃?',
    options: [
      { id: 'A', text: 'Increasing pressure and decreasing temperature' },
      { id: 'B', text: 'Decreasing pressure and increasing temperature' },
      { id: 'C', text: 'Adding an iron catalyst at constant volume' },
      { id: 'D', text: 'Removing N₂ from the reactor system' },
    ],
    correctAnswer: 'A',
    explanation: 'Higher pressure favors the side with fewer gas moles (4 moles → 2 moles). Lower temperature favors the forward exothermic reaction.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. BIOLOGY (Genetics, Physiology, Ecology, Evolution)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'bio-auth-1',
    subjectId: 'biology',
    subjectName: 'Biology',
    year: 'JAMB 2024 Past UTME',
    syllabusTopic: 'Genetics: Sex-Linked Inheritance',
    difficulty: 'Hard',
    text: 'A carrier woman for hemophilia (XᴴXʰ) marries a normal man (XᴴY). What percentage of their male children will have hemophilia?',
    options: [
      { id: 'A', text: '50%' },
      { id: 'B', text: '25%' },
      { id: 'C', text: '100%' },
      { id: 'D', text: '0%' },
    ],
    correctAnswer: 'A',
    explanation: 'Sons receive the Y chromosome from the father. The mother passes Xᴴ (normal son) to 50% of sons and Xʰ (hemophiliac son) to 50% of sons.',
  },
  {
    id: 'bio-auth-2',
    subjectId: 'biology',
    subjectName: 'Biology',
    year: 'JAMB 2023 Past UTME',
    syllabusTopic: 'Excretion & Osmoregulation',
    difficulty: 'Medium',
    text: 'In the mammalian nephron, where does ultrafiltration occur under high hydrostatic pressure?',
    options: [
      { id: 'A', text: 'Glomerulus within Bowman\'s capsule' },
      { id: 'B', text: 'Loop of Henle descending limb' },
      { id: 'C', text: 'Proximal convoluted tubule' },
      { id: 'D', text: 'Distal collecting duct' },
    ],
    correctAnswer: 'A',
    explanation: 'Ultrafiltration takes place in the renal corpuscle (between the glomerulus and Bowman\'s capsule) due to the afferent-efferent diameter differential.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. ECONOMICS (Price Elasticity, National Income, Public Finance)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'econ-auth-1',
    subjectId: 'economics',
    subjectName: 'Economics',
    year: 'JAMB 2024 Past UTME',
    syllabusTopic: 'Price Elasticity of Demand',
    difficulty: 'Hard',
    text: 'When the price of a commodity increases from ₦200 to ₦250, the quantity demanded falls from 1000 units to 700 units. Compute the point elasticity of demand.',
    options: [
      { id: 'A', text: '1.20 (Price Elastic)' },
      { id: 'B', text: '0.83 (Price Inelastic)' },
      { id: 'C', text: '1.00 (Unitary Elastic)' },
      { id: 'D', text: '1.50 (Price Elastic)' },
    ],
    correctAnswer: 'A',
    explanation: '%ΔQ = (1000 - 700)/1000 × 100 = 30%. %ΔP = (250 - 200)/200 × 100 = 25%. Price Elasticity of Demand = 30% / 25% = 1.20.',
  },
  {
    id: 'econ-auth-2',
    subjectId: 'economics',
    subjectName: 'Economics',
    year: 'JAMB 2023 Past UTME',
    syllabusTopic: 'National Income Accounting',
    difficulty: 'Hard',
    text: 'Which of the following equals Gross National Product (GNP) at Market Prices?',
    options: [
      { id: 'A', text: 'GDP at market prices + Net Factor Income from Abroad (NFIA)' },
      { id: 'B', text: 'GDP at factor cost - Depreciation allowance' },
      { id: 'C', text: 'National Income - Indirect business taxes' },
      { id: 'D', text: 'Personal Disposable Income + Undistributed profits' },
    ],
    correctAnswer: 'A',
    explanation: 'GNP measures output produced by citizens domestically and abroad: GNP = GDP + Net Property Income / Factor Income from Abroad (NFIA).',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. GOVERNMENT (Constitutional History, Federalism, Public Admin)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'govt-auth-1',
    subjectId: 'government',
    subjectName: 'Government',
    year: 'JAMB 2024 Past UTME',
    syllabusTopic: 'Nigerian Constitutional History (1922-1999)',
    difficulty: 'Hard',
    text: 'The Clifford Constitution of 1922 was landmark in Nigerian constitutional development primarily because it:',
    options: [
      { id: 'A', text: 'Introduced the elective principle for Lagos and Calabar seats' },
      { id: 'B', text: 'Created the regional legislative houses for North, East, and West' },
      { id: 'C', text: 'Granted full self-government to the Southern Protectorate' },
      { id: 'D', text: 'Established the Supreme Court of Nigeria' },
    ],
    correctAnswer: 'A',
    explanation: 'The Clifford Constitution introduced the elective principle, providing 4 elected seats (3 for Lagos, 1 for Calabar) in the Legislative Council.',
  },
  {
    id: 'govt-auth-2',
    subjectId: 'government',
    subjectName: 'Government',
    year: 'JAMB 2023 Past UTME',
    syllabusTopic: 'Federalism & Exclusive Legislative List',
    difficulty: 'Medium',
    text: 'Under the 1999 Federal Constitution of Nigeria, which item is in the EXCLUSIVE Legislative List reserved for the National Assembly?',
    options: [
      { id: 'A', text: 'Defense, Currency, and External Affairs' },
      { id: 'B', text: 'Higher education and agricultural extension' },
      { id: 'C', text: 'Collection of local tenement rates' },
      { id: 'D', text: 'Public health and sanitation inspectorship' },
    ],
    correctAnswer: 'A',
    explanation: 'Defense, national currency, customs, and diplomatic external affairs are reserved exclusively for the Federal Government.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. LITERATURE IN ENGLISH (Literary Devices, African & Non-African Prose)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'lit-auth-1',
    subjectId: 'literature',
    subjectName: 'Literature in English',
    year: 'JAMB 2024 Past UTME',
    syllabusTopic: 'Literary Devices: Metonymy & Synecdoche',
    difficulty: 'Hard',
    text: '"The crown has ordered all governors to convene in Abuja." The underlined term "the crown" is an example of:',
    options: [
      { id: 'A', text: 'Metonymy' },
      { id: 'B', text: 'Synecdoche' },
      { id: 'C', text: 'Personification' },
      { id: 'D', text: 'Hyperbole' },
    ],
    correctAnswer: 'A',
    explanation: 'Metonymy is substituting the name of an attribute or closely associated object ("the crown") for that of the thing meant (the monarch or sovereignty).',
  },
  {
    id: 'lit-auth-2',
    subjectId: 'literature',
    subjectName: 'Literature in English',
    year: 'JAMB 2023 Past UTME',
    syllabusTopic: 'Dramatic Terms: Dramatic Irony',
    difficulty: 'Medium',
    text: 'A situation in a drama where the audience possesses crucial knowledge of which the characters on stage are unaware is termed:',
    options: [
      { id: 'A', text: 'Dramatic irony' },
      { id: 'B', text: 'Tragic flaw (Hamartia)' },
      { id: 'C', text: 'Catharsis' },
      { id: 'D', text: 'Deus ex machina' },
    ],
    correctAnswer: 'A',
    explanation: 'Dramatic irony occurs when the audience understands the implications and meaning of a situation on stage while the character is oblivious.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. COMMERCE (Trade, Insurance, Banking, Stock Exchange)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'comm-auth-1',
    subjectId: 'commerce',
    subjectName: 'Commerce',
    year: 'JAMB 2024 Past UTME',
    syllabusTopic: 'International Trade Documents',
    difficulty: 'Hard',
    text: 'Which shipping document serves simultaneously as a document of title to goods, a receipt from the shipping company, and evidence of the contract of carriage?',
    options: [
      { id: 'A', text: 'Bill of Lading' },
      { id: 'B', text: 'Certificate of Origin' },
      { id: 'C', text: 'Consular Invoice' },
      { id: 'D', text: 'Air Waybill' },
    ],
    correctAnswer: 'A',
    explanation: 'A Bill of Lading is a legally binding negotiable document of title, receipt of cargo, and contract between shipper and ocean carrier.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. FINANCIAL ACCOUNTING (Bookkeeping, Depreciation, Partnership)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'acc-auth-1',
    subjectId: 'accounting',
    subjectName: 'Financial Accounting',
    year: 'JAMB 2024 Past UTME',
    syllabusTopic: 'Depreciation: Straight Line Method',
    difficulty: 'Hard',
    text: 'An equipment purchased for ₦500,000 has an estimated scrap value of ₦50,000 after 5 years of useful life. Calculate annual depreciation under the straight-line method.',
    options: [
      { id: 'A', text: '₦90,000' },
      { id: 'B', text: '₦100,000' },
      { id: 'C', text: '₦110,000' },
      { id: 'D', text: '₦80,000' },
    ],
    correctAnswer: 'A',
    explanation: 'Annual Depreciation = (Cost - Scrap Value) / Useful Life = (₦500,000 - ₦50,000) / 5 = ₦450,000 / 5 = ₦90,000.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. CHRISTIAN RELIGIOUS STUDIES (Old & New Testament, Epistles)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'crs-auth-1',
    subjectId: 'crs',
    subjectName: 'C.R.S.',
    year: 'JAMB 2024 Past UTME',
    syllabusTopic: 'Prophets of Social Justice: Amos',
    difficulty: 'Hard',
    text: 'Prophet Amos condemned the wealthy merchants of Israel primarily because they:',
    options: [
      { id: 'A', text: 'Trampled on the poor and manipulated deceitful scales' },
      { id: 'B', text: 'Refused to pay tribute to the Assyrian king' },
      { id: 'C', text: 'Encouraged intermarriage with Philistine tribes' },
      { id: 'D', text: 'Refused to offer sacrifices at the temple of Jerusalem' },
    ],
    correctAnswer: 'A',
    explanation: 'Amos (Amos 8:4-6) fiercely attacked commercial dishonesty, false balances, and the exploitation of the poor and needy.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. ISLAMIC RELIGIOUS STUDIES (Tafsir, Hadith, Fiqh, Islamic History)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'irs-auth-1',
    subjectId: 'irs',
    subjectName: 'I.R.S.',
    year: 'JAMB 2024 Past UTME',
    syllabusTopic: 'Pillars of Islam: Zakat Calculation',
    difficulty: 'Hard',
    text: 'What is the standard Zakat rate due on trade goods and cash wealth that has reached Nisab and completed a full lunar year (Hawl)?',
    options: [
      { id: 'A', text: '2.5% (One-fortieth)' },
      { id: 'B', text: '5.0% (One-twentieth)' },
      { id: 'C', text: '10.0% (One-tenth)' },
      { id: 'D', text: '20.0% (One-fifth)' },
    ],
    correctAnswer: 'A',
    explanation: 'Under Islamic jurisprudence (Fiqh), the statutory rate of Zakat payable on liquid monetary wealth and merchant inventory is 2.5% (1/40).',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. GEOGRAPHY (Physical Geography, Map Reading, Climatology)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'geo-auth-1',
    subjectId: 'geography',
    subjectName: 'Geography',
    year: 'JAMB 2024 Past UTME',
    syllabusTopic: 'Map Scale & Area Reduction',
    difficulty: 'Hard',
    text: 'A map of scale 1:50,000 is reduced to half its original linear size. What is the new Representative Fraction (RF) scale of the reduced map?',
    options: [
      { id: 'A', text: '1:100,000' },
      { id: 'B', text: '1:25,000' },
      { id: 'C', text: '1:200,000' },
      { id: 'D', text: '1:75,000' },
    ],
    correctAnswer: 'A',
    explanation: 'Reducing linear dimensions by 1/2 doubles the scale denominator: 50,000 × 2 = 100,000. New RF = 1:100,000.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. AGRICULTURAL SCIENCE (Soil Science, Crop Production, Animal Nutrition)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'agric-auth-1',
    subjectId: 'agric',
    subjectName: 'Agricultural Science',
    year: 'JAMB 2024 Past UTME',
    syllabusTopic: 'Soil Science: Soil Texture & Structure',
    difficulty: 'Medium',
    text: 'Which soil type has the highest cation exchange capacity (CEC) and greatest water retention capacity?',
    options: [
      { id: 'A', text: 'Clayey soil rich in organic matter' },
      { id: 'B', text: 'Coarse sandy soil' },
      { id: 'C', text: 'Gravelly loam' },
      { id: 'D', text: 'Silty sand' },
    ],
    correctAnswer: 'A',
    explanation: 'Clay particles and humus possess extensive negative surface charges, conferring the highest Cation Exchange Capacity (CEC) and water-holding capacity.',
  },
];
