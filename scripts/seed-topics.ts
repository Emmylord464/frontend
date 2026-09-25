import 'dotenv/config';
import { db } from '../src/db';
import { syllabusTopics, type SubjectEnumType } from '../src/db/schema';
import { eq, and } from 'drizzle-orm';

interface SyllabusTopic {
  topicName: string;
  questionWeight: string;
  orderIndex: number;
}

const JAMB_SYLLABUS: Record<SubjectEnumType, SyllabusTopic[]> = {
  USE_OF_ENGLISH: [
    { topicName: 'Lexis and Structure', questionWeight: '18.00%', orderIndex: 1 },
    { topicName: 'Comprehension and Passage Analysis', questionWeight: '16.00%', orderIndex: 2 },
    { topicName: 'Oral Forms and Vowel/Consonant Sounds', questionWeight: '14.00%', orderIndex: 3 },
    { topicName: 'Registers and Varieties of English', questionWeight: '10.00%', orderIndex: 4 },
    { topicName: 'Idioms and Idiomatic Expressions', questionWeight: '10.00%', orderIndex: 5 },
    { topicName: 'Synonyms and Nearest in Meaning', questionWeight: '12.00%', orderIndex: 6 },
    { topicName: 'Antonyms and Opposite in Meaning', questionWeight: '12.00%', orderIndex: 7 },
    { topicName: 'Stress and Intonation Patterns', questionWeight: '8.00%', orderIndex: 8 },
  ],
  MATHEMATICS: [
    { topicName: 'Number Bases and Fractions', questionWeight: '6.00%', orderIndex: 1 },
    { topicName: 'Modular Arithmetic and Indices', questionWeight: '6.00%', orderIndex: 2 },
    { topicName: 'Logarithms and Surds', questionWeight: '7.00%', orderIndex: 3 },
    { topicName: 'Sets and Venn Diagrams', questionWeight: '6.00%', orderIndex: 4 },
    { topicName: 'Polynomials and Factorization', questionWeight: '7.00%', orderIndex: 5 },
    { topicName: 'Linear and Quadratic Equations', questionWeight: '9.00%', orderIndex: 6 },
    { topicName: 'Simultaneous Equations and Inequalities', questionWeight: '7.00%', orderIndex: 7 },
    { topicName: 'Sequences and Series (AP & GP)', questionWeight: '8.00%', orderIndex: 8 },
    { topicName: 'Matrices and Determinants', questionWeight: '7.00%', orderIndex: 9 },
    { topicName: 'Coordinate Geometry and Straight Lines', questionWeight: '8.00%', orderIndex: 10 },
    { topicName: 'Trigonometry', questionWeight: '8.00%', orderIndex: 11 },
    { topicName: 'Calculus — Differentiation & Integration', questionWeight: '9.00%', orderIndex: 12 },
    { topicName: 'Statistics and Probability', questionWeight: '12.00%', orderIndex: 13 },
  ],
  PHYSICS: [
    { topicName: 'Measurements and Units', questionWeight: '5.00%', orderIndex: 1 },
    { topicName: 'Scalars, Vectors and Motion', questionWeight: '10.00%', orderIndex: 2 },
    { topicName: 'Dynamics and Newton\'s Laws', questionWeight: '9.00%', orderIndex: 3 },
    { topicName: 'Work, Energy and Power', questionWeight: '8.00%', orderIndex: 4 },
    { topicName: 'Simple Harmonic Motion (SHM)', questionWeight: '6.00%', orderIndex: 5 },
    { topicName: 'Fluids at Rest and in Motion', questionWeight: '7.00%', orderIndex: 6 },
    { topicName: 'Heat Energy and Thermodynamics', questionWeight: '10.00%', orderIndex: 7 },
    { topicName: 'Waves and Sound', questionWeight: '9.00%', orderIndex: 8 },
    { topicName: 'Light Energy and Optics', questionWeight: '9.00%', orderIndex: 9 },
    { topicName: 'Electrostatics and Capacitors', questionWeight: '7.00%', orderIndex: 10 },
    { topicName: 'Current Electricity and Circuits', questionWeight: '9.00%', orderIndex: 11 },
    { topicName: 'Magnetic Fields and Induction', questionWeight: '6.00%', orderIndex: 12 },
    { topicName: 'Atomic and Nuclear Physics', questionWeight: '5.00%', orderIndex: 13 },
  ],
  CHEMISTRY: [
    { topicName: 'Separation of Mixtures and Purification', questionWeight: '6.00%', orderIndex: 1 },
    { topicName: 'Atomic Structure and Chemical Bonding', questionWeight: '10.00%', orderIndex: 2 },
    { topicName: 'Stoichiometry and Mole Concept', questionWeight: '10.00%', orderIndex: 3 },
    { topicName: 'States of Matter and Gas Laws', questionWeight: '8.00%', orderIndex: 4 },
    { topicName: 'Energy Changes and Thermochemistry', questionWeight: '7.00%', orderIndex: 5 },
    { topicName: 'Rates of Chemical Reactions', questionWeight: '7.00%', orderIndex: 6 },
    { topicName: 'Chemical Equilibria', questionWeight: '6.00%', orderIndex: 7 },
    { topicName: 'Acids, Bases and Salts', questionWeight: '10.00%', orderIndex: 8 },
    { topicName: 'Oxidation and Reduction (Redox)', questionWeight: '8.00%', orderIndex: 9 },
    { topicName: 'Electrolysis and Electrochemical Cells', questionWeight: '8.00%', orderIndex: 10 },
    { topicName: 'Non-Metals and Their Compounds', questionWeight: '6.00%', orderIndex: 11 },
    { topicName: 'Metals and Their Compounds', questionWeight: '6.00%', orderIndex: 12 },
    { topicName: 'Organic Chemistry — Hydrocarbons', questionWeight: '8.00%', orderIndex: 13 },
  ],
  BIOLOGY: [],
  ECONOMICS: [],
  GOVERNMENT: [],
};

async function seedSyllabusTopics() {
  console.log('Seeding official JAMB syllabus topics into syllabus_topics table...');
  let count = 0;

  for (const [subject, topics] of Object.entries(JAMB_SYLLABUS)) {
    for (const t of topics) {
      const existing = await db
        .select({ id: syllabusTopics.id })
        .from(syllabusTopics)
        .where(
          and(
            eq(syllabusTopics.subject, subject as SubjectEnumType),
            eq(syllabusTopics.topicName, t.topicName)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(syllabusTopics).values({
          subject: subject as SubjectEnumType,
          topicName: t.topicName,
          subTopicName: t.topicName,
          objectives: `Master all official JAMB UTME questions for ${t.topicName}`,
          questionWeight: t.questionWeight,
          orderIndex: t.orderIndex,
          examYear: 2026,
        });
        count++;
      }
    }
  }

  console.log(`✅ Successfully seeded ${count} syllabus topics!`);
  process.exit(0);
}

seedSyllabusTopics().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});

