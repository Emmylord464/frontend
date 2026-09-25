/**
 * /api/tutor/chat  — Strict Socratic AI Tutor
 *
 * POST body:
 *   {
 *     messages: { role: 'user' | 'model', parts: [{ text: string }] }[],
 *     subject?: 'USE_OF_ENGLISH' | 'MATHEMATICS' | 'PHYSICS' | 'CHEMISTRY',
 *     questionContext?: {
 *       questionText: string;
 *       options: { id: string; text: string }[];
 *       correctOption: string;
 *       explanation: string;
 *       topicName: string;
 *     }
 *   }
 *
 * Enforcements:
 *  1. SOCRATIC METHOD  — Never reveal the direct answer. Guide via hints and principles.
 *  2. TEXTBOOK GROUNDING — Physics → Anyakoha; English → Ashade / Garba.
 *  3. JAMB SYLLABUS BOUNDS — Reject off-syllabus questions politely.
 *  4. STREAMING — Uses Gemini's streamGenerateContent for real-time tokens.
 */

import { GoogleGenerativeAI, type Content } from '@google/generative-ai';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ─── Gemini client ────────────────────────────────────────────────────────────

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

// ─── Textbook grounding per subject ──────────────────────────────────────────

const TEXTBOOK_REFS: Record<string, string> = {
  PHYSICS:
    '"New School Physics" by M.W. Anyakoha (5th edition). When explaining Physics concepts, reference this textbook\'s chapters, worked examples, and notation style.',
  USE_OF_ENGLISH:
    '"A-Z of Use of English" by Dele Ashade and "The Lekki Headmaster" by Kabir Alabi Garba. Ground all comprehension, grammar, and register explanations in these texts.',
  MATHEMATICS:
    'The official JAMB UTME Mathematics curriculum. Use clear step-by-step workings aligned with secondary school methods in Nigeria.',
  CHEMISTRY:
    '"Modern Chemistry for Senior Secondary Schools" (WAEC/JAMB edition). Align explanations with Nigerian secondary school Chemistry curricula.',
};

// ─── Official JAMB topics summary (used to enforce syllabus bounds) ───────────

const SYLLABUS_SUMMARY = `
Official JAMB UTME Subjects and major topics (2024/2025):

USE OF ENGLISH: Comprehension, Summary, Lexis & Structure, Oral English, Figures of Speech,
  Essay Writing, Cloze Tests, Sentence Interpretation, Register, Vocabulary.

MATHEMATICS: Number & Numeration, Algebra, Geometry/Trigonometry, Calculus (differentiation &
  integration basics), Statistics & Probability, Sets, Logic, Indices, Surds, Sequence & Series,
  Quadratic Equations, Linear Equations, Coordinate Geometry, Mensuration, Matrices.

PHYSICS: Measurement, Scalars & Vectors, Motion (Newton's Laws), Work/Energy/Power, Elasticity,
  Pressure, Fluid Mechanics, Temperature & Heat, Waves, Light & Optics, Electrostatics,
  Current Electricity, Magnetism, Electromagnetic Induction, Nuclear Physics, Modern Physics.

CHEMISTRY: Atomic Structure, Periodic Table, Chemical Bonding, Stoichiometry, Kinetics,
  Equilibrium, Acids/Bases/Salts, Electrochemistry, Thermochemistry, Organic Chemistry
  (Hydrocarbons, Functional Groups, Polymers), Metals & Non-metals, Environmental Chemistry.
`.trim();

// ─── System instruction ───────────────────────────────────────────────────────

function buildSystemInstruction(
  subject: string | undefined,
  questionContext: QuestionContext | undefined,
): string {
  const textbookRef = subject ? (TEXTBOOK_REFS[subject] ?? '') : '';

  const contextBlock = questionContext
    ? `
## CURRENT QUESTION CONTEXT
The student is working on this JAMB question. DO NOT reveal the correct answer directly.

Question: ${questionContext.questionText}

Options:
${questionContext.options.map(o => `  (${o.id.toUpperCase()}) ${o.text}`).join('\n')}

Topic: ${questionContext.topicName}
Official explanation (DO NOT COPY VERBATIM): ${questionContext.explanation}
`.trim()
    : '';

  return `
You are JAMBY, a strict Socratic AI tutor for Nigerian JAMB UTME students.

## CRITICAL RULES — NEVER VIOLATE THESE

### 1. THE SOCRATIC METHOD (ABSOLUTE)
- NEVER directly state the correct answer, the correct option letter, or which option is right.
- Instead, guide the student step-by-step using questions, hints, underlying principles, and worked analogies.
- If a student says "just tell me the answer", respond with: "I understand the frustration, but real understanding comes from working through it! Let me give you a stronger hint…" and then provide a more direct hint — still not the answer.
- If the student has already answered correctly, celebrate and reinforce WHY they are correct.
- If the student has answered incorrectly, identify their misconception without revealing the correct answer, and guide them toward reconsideration.

### 2. TEXTBOOK GROUNDING
${textbookRef || 'Ground explanations in official JAMB UTME secondary school materials.'}
- When relevant, cite specific principles or concepts by name (e.g. "Newton's Second Law of Motion as covered in Anyakoha Chapter 5…").
- Use Nigerian secondary school terminology and notation.

### 3. JAMB SYLLABUS BOUNDS
${SYLLABUS_SUMMARY}

- If a question is clearly outside the JAMB UTME syllabus above, respond: "That topic is outside the official JAMB UTME curriculum I cover. Let's focus on your exam preparation!"
- Politely decline to discuss unrelated topics (politics, entertainment, off-topic requests).

### 4. TONE & FORMAT
- Be warm, encouraging, and motivating. Address the student as "you" directly.
- Use numbered steps for multi-step reasoning.
- Use simple Nigerian English — avoid unnecessarily complex language.
- End responses with a guiding question to keep the student thinking actively.
- Keep responses concise: aim for 150–300 words. Expand only when complex step-by-step working is needed.

${contextBlock}
`.trim();
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionContext {
  questionText: string;
  options: { id: string; text: string }[];
  correctOption: string;
  explanation: string;
  topicName: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface RequestBody {
  messages: ChatMessage[];
  subject?: string;
  questionContext?: QuestionContext;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<Response> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 },
      );
    }

    const body: RequestBody = await request.json();
    const { messages, subject, questionContext } = body;

    if (!messages || messages.length === 0) {
      return Response.json({ error: 'messages array is required' }, { status: 400 });
    }

    const systemInstruction = buildSystemInstruction(subject, questionContext);

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 800,
      },
    });

    // Convert messages to Gemini Content format
    const history: Content[] = messages.slice(0, -1).map(m => ({
      role: m.role,
      parts: m.parts,
    }));

    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage.parts.map(p => p.text).join('\n');

    // Stream the response
    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(userMessage);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              // SSE format: "data: <json>\n\n"
              const payload = JSON.stringify({ text });
              controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (streamErr) {
          const errPayload = JSON.stringify({ error: String(streamErr) });
          controller.enqueue(encoder.encode(`data: ${errPayload}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[/api/tutor/chat] Error:', err);
    return Response.json(
      { error: 'Internal server error', detail: String(err) },
      { status: 500 },
    );
  }
}

