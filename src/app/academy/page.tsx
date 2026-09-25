'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePyodideRunner } from '@/lib/pyodide-worker';

// ── Starter lessons ────────────────────────────────────────────────────────────

interface Lesson {
  id: string;
  title: string;
  description: string;
  icon: string;
  starter: string;
  hint: string;
}

const LESSONS: Lesson[] = [
  {
    id: 'hello',
    title: 'Hello, Python!',
    description: 'Print your first message to the screen.',
    icon: '👋',
    starter: '# Change the message below and click Run!\nprint("Hello, JAMB world!")',
    hint: 'Try changing the text inside the quotes.',
  },
  {
    id: 'variables',
    title: 'Variables & Maths',
    description: 'Store numbers and do calculations like JAMB questions.',
    icon: '🔢',
    starter: `# Variables store values\nscore = 285\nsubjects = 4\naverage = score / subjects\nprint(f"Average score per subject: {average}")`,
    hint: 'Change score to your target JAMB score!',
  },
  {
    id: 'loops',
    title: 'Loops',
    description: 'Repeat actions — like going through 250 exam questions.',
    icon: '🔁',
    starter: `subjects = ["English", "Maths", "Physics", "Chemistry"]\nfor subject in subjects:\n    print(f"Studying {subject}...")`,
    hint: 'Add more subjects to the list!',
  },
  {
    id: 'functions',
    title: 'Functions',
    description: 'Write reusable blocks of code — a core programming skill.',
    icon: '⚙️',
    starter: `def calculate_jamb_score(english, maths, physics, chemistry):\n    total = english + maths + physics + chemistry\n    percentage = (total / 400) * 100\n    return total, percentage\n\ntotal, pct = calculate_jamb_score(60, 70, 65, 55)\nprint(f"Total: {total}/400 ({pct:.1f}%)")`,
    hint: 'Change the four numbers to see different scores.',
  },
  {
    id: 'lists',
    title: 'Lists & Sorting',
    description: 'Work with collections — like ranking candidates by score.',
    icon: '📊',
    starter: `candidates = [285, 312, 198, 267, 330, 245]\ncandidates.sort(reverse=True)\nprint("Ranking by score:")\nfor rank, score in enumerate(candidates, 1):\n    print(f"  #{rank}: {score}")`,
    hint: 'Add your own score to the list!',
  },
  {
    id: 'conditions',
    title: 'If / Else',
    description: 'Make decisions in code — like checking if you passed.',
    icon: '🎯',
    starter: `my_score = 280\ncutoff = {"UNILAG": 300, "UI": 280, "UNIBEN": 250, "FUTA": 240}\n\nprint("University eligibility:")\nfor school, min_score in cutoff.items():\n    status = "✅ Eligible" if my_score >= min_score else "❌ Below cutoff"\n    print(f"  {school} ({min_score}): {status}")`,
    hint: 'Change my_score to test different scenarios.',
  },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function AcademyPage() {
  const [activeLesson, setActiveLesson] = useState<Lesson>(LESSONS[0]);
  const [code, setCode]                 = useState(LESSONS[0].starter);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [showHint, setShowHint]         = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { run, isLoading, result } = usePyodideRunner();

  // Pre-warm Pyodide on mount with a tiny script
  useEffect(() => {
    run('print("Pyodide ready")')
      .then(() => setPyodideReady(true))
      .catch(() => {});
  }, [run]);

  function selectLesson(lesson: Lesson) {
    setActiveLesson(lesson);
    setCode(lesson.starter);
    setShowHint(false);
  }

  function handleTabKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current!;
      const start = ta.selectionStart;
      const end   = ta.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
  }

  return (
    <main className="min-h-screen bg-[#0d1117] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-white/50 hover:text-white">← Dashboard</Link>
            <span className="text-white/20">/</span>
            <span className="text-sm font-bold text-[#58a6ff]">Python Academy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${pyodideReady ? 'bg-green-400' : 'animate-pulse bg-yellow-400'}`} />
            <span className="text-xs text-white/50">{pyodideReady ? 'Python ready' : 'Loading Python…'}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black">🐍 Python Tech Academy</h1>
          <p className="mt-1 text-sm text-white/50">Learn Python in your browser — no installation required. Powered by Pyodide WebAssembly.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Lesson list */}
          <aside className="space-y-2">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/30">Lessons</p>
            {LESSONS.map((lesson) => (
              <button
                key={lesson.id}
                type="button"
                onClick={() => selectLesson(lesson)}
                className={`w-full rounded-xl p-3 text-left transition-all ${
                  activeLesson.id === lesson.id
                    ? 'bg-[#58a6ff]/20 ring-1 ring-[#58a6ff]/50'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{lesson.icon}</span>
                  <div>
                    <p className="text-sm font-bold">{lesson.title}</p>
                    <p className="mt-0.5 text-xs text-white/40">{lesson.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </aside>

          {/* Editor + output */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#161b22] overflow-hidden">
              {/* Editor toolbar */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{activeLesson.icon}</span>
                  <span className="text-sm font-bold">{activeLesson.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="rounded-lg px-3 py-1.5 text-xs font-bold text-[#f3b28e] hover:bg-white/5"
                  >
                    💡 Hint
                  </button>
                  <button
                    type="button"
                    onClick={() => setCode(activeLesson.starter)}
                    className="rounded-lg px-3 py-1.5 text-xs font-bold text-white/40 hover:bg-white/5"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Hint banner */}
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b border-[#f3b28e]/20 bg-[#f3b28e]/10 px-4 py-2 text-sm text-[#f3b28e]"
                  >
                    💡 {activeLesson.hint}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Code textarea */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleTabKey}
                spellCheck={false}
                className="w-full resize-none bg-transparent p-4 font-mono text-sm text-[#e6edf3] outline-none"
                style={{ minHeight: '260px', tabSize: 4 }}
                aria-label="Python code editor"
              />

              {/* Run button */}
              <div className="border-t border-white/10 px-4 py-3">
                <button
                  type="button"
                  onClick={() => run(code)}
                  disabled={isLoading || !pyodideReady}
                  className="flex min-h-10 items-center gap-2 rounded-xl bg-[#238636] px-5 text-sm font-black text-white transition-all hover:bg-[#2ea043] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Running…
                    </>
                  ) : (
                    <>▶ Run Python</>
                  )}
                </button>
              </div>
            </div>

            {/* Output panel */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/10 bg-[#0d1117] overflow-hidden"
                >
                  <div className="border-b border-white/10 px-4 py-2">
                    <span className="text-xs font-black uppercase tracking-widest text-white/30">Output</span>
                  </div>
                  <pre className="overflow-x-auto px-4 py-4 font-mono text-sm leading-6">
                    {result.error ? (
                      <span className="text-red-400">{result.error}</span>
                    ) : result.stderr ? (
                      <span className="text-yellow-400">{result.stderr}</span>
                    ) : (
                      <span className="text-green-400">{result.stdout || '(no output)'}</span>
                    )}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}

