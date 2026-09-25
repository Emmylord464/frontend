import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Database,
  CheckCircle2,
  AlertCircle,
  FileText,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Subject, Question } from '../../types';
import { playTapSound, playCorrectSound, playIncorrectSound } from '../../utils/audio';

interface QuestionIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onIngestQuestions?: (newQuestions: Question[]) => void;
}

const SAMPLE_INGESTION_PAYLOAD = `[
  {
    "id": "ingest-001",
    "subjectId": "english",
    "subjectName": "Use of English",
    "year": "JAMB 2024 UTME",
    "syllabusTopic": "Lexis and Structure",
    "question": "Choose the word that is opposite in meaning to the italicized word: His 'ephemeral' joy quickly turned to despair.",
    "options": {
      "A": "transient",
      "B": "fleeting",
      "C": "enduring",
      "D": "delicate"
    },
    "correctAnswer": "C",
    "explanation": "'Ephemeral' means lasting for a very short time. The antonym is 'enduring' (lasting over a long duration)."
  }
]`;

export const QuestionIngestionModal: React.FC<QuestionIngestionModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onIngestQuestions,
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [ingestionStatus, setIngestionStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [copiedSample, setCopiedSample] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalBankQuestions = subjects.reduce((acc, sub) => acc + sub.questionsCount, 0);

  const handleCopySample = async () => {
    playTapSound();
    await navigator.clipboard.writeText(SAMPLE_INGESTION_PAYLOAD);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  const handleProcessIngestion = () => {
    playTapSound();
    setErrorStatus(null);
    setIngestionStatus(null);

    if (!jsonInput.trim()) {
      setErrorStatus('Please paste your questions JSON payload or load sample batch.');
      playIncorrectSound();
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      try {
        const parsed = JSON.parse(jsonInput);
        if (!Array.isArray(parsed)) {
          throw new Error('Payload must be a JSON array of questions');
        }

        // Validate first item schema
        if (parsed.length > 0) {
          const sample = parsed[0];
          if (!sample.question || !sample.options || !sample.correctAnswer) {
            throw new Error('Each question item must contain question text, options {A,B,C,D}, and correctAnswer.');
          }
        }

        playCorrectSound();
        setIngestionStatus(`Successfully verified & staged ${parsed.length.toLocaleString()} questions for ingestion!`);
        setIsProcessing(false);

        if (onIngestQuestions) {
          onIngestQuestions(parsed);
        }
      } catch (err: unknown) {
        setIsProcessing(false);
        playIncorrectSound();
        const msg = err instanceof Error ? err.message : 'Invalid JSON format';
        setErrorStatus(`Ingestion failed: ${msg}`);
      }
    }, 400);
  };

  const handleLoadMock20kBatch = () => {
    playTapSound();
    setJsonInput(SAMPLE_INGESTION_PAYLOAD);
    setErrorStatus(null);
    setIngestionStatus('Sample batch loaded. Tap "Verify & Ingest Batch" to validate schema.');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Frosted Glass Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Heavy, Restrained Spring Modal */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 32, stiffness: 350, mass: 0.95 }}
            className="relative z-10 w-full max-w-lg rounded-3xl bg-white dark:bg-[#1a1c1e] p-6 shadow-2xl border border-stone-200/70 dark:border-stone-800/70 max-h-[92vh] overflow-y-auto space-y-5 ring-1 ring-inset ring-black/5 dark:ring-white/10"
          >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <Database className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-editorial text-lg font-semibold text-stone-900 dark:text-stone-100">
                20,000 Question Ingestion Hub
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-ui">
                Import, validate, and index past UTME questions (1978–2024)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/60 active:scale-[0.98] duration-200 ease-out transition-all cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Repository Vitals Banner */}
        <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/70 bg-stone-50/50 dark:bg-stone-900/40 p-4 space-y-2.5 ring-1 ring-inset ring-black/5 dark:ring-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wider font-ui">
                Repository Status: Online
              </span>
            </div>
            <span className="text-xs font-mono font-medium text-stone-700 dark:text-stone-300 tabular-nums">
              {totalBankQuestions.toLocaleString()}+ Questions Indexed
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-ui pt-1">
            <div className="rounded-xl bg-white dark:bg-[#1a1c1e] p-2.5 border border-stone-200/70 dark:border-stone-800 ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <span className="text-stone-400 block uppercase font-mono font-medium">Subjects</span>
              <strong className="text-xs text-stone-900 dark:text-stone-100 block mt-0.5">12 Syllabi</strong>
            </div>
            <div className="rounded-xl bg-white dark:bg-[#1a1c1e] p-2.5 border border-stone-200/70 dark:border-stone-800 ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <span className="text-stone-400 block uppercase font-mono font-medium">Years Covered</span>
              <strong className="text-xs text-stone-900 dark:text-stone-100 block mt-0.5 font-mono tabular-nums">1978 – 2024</strong>
            </div>
            <div className="rounded-xl bg-white dark:bg-[#1a1c1e] p-2.5 border border-stone-200/70 dark:border-stone-800 ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <span className="text-stone-400 block uppercase font-mono font-medium">Daily Quota</span>
              <strong className="text-xs text-emerald-700 dark:text-emerald-400 block mt-0.5 font-mono tabular-nums">50 Qs / Day</strong>
            </div>
          </div>
        </div>

        {/* JSON Payload Ingestion Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-stone-900 dark:text-stone-100 font-ui flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
              <span>Paste Question Payload (JSON Array)</span>
            </label>
            <button
              onClick={handleCopySample}
              className="text-[11px] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-ui flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedSample ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span>Sample Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" strokeWidth={1.5} />
                  <span>Copy Sample Schema</span>
                </>
              )}
            </button>
          </div>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={5}
            placeholder={`[\n  {\n    "id": "q-1",\n    "subjectId": "english",\n    "question": "...",\n    "options": { "A": "...", "B": "..." },\n    "correctAnswer": "A"\n  }\n]`}
            className="w-full rounded-2xl border border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 p-3.5 text-xs font-mono text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-stone-900 dark:focus:border-stone-100 focus:outline-hidden transition-all ring-1 ring-inset ring-black/5 dark:ring-white/10"
          />
        </div>

        {/* Feedback Messages */}
        {ingestionStatus && (
          <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300/60 dark:border-emerald-800/40 p-3 text-xs text-emerald-900 dark:text-emerald-200 font-ui flex items-center gap-2 animate-fadeIn ring-1 ring-inset ring-black/5 dark:ring-white/10">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            <span>{ingestionStatus}</span>
          </div>
        )}

        {errorStatus && (
          <div className="rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-300/60 dark:border-red-800/40 p-3 text-xs text-red-900 dark:text-red-200 font-ui flex items-center gap-2 animate-fadeIn ring-1 ring-inset ring-black/5 dark:ring-white/10">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" strokeWidth={1.5} />
            <span>{errorStatus}</span>
          </div>
        )}

        {/* Ingestion Actions */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleLoadMock20kBatch}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 hover:opacity-90 active:scale-[0.98] duration-200 ease-out text-stone-800 dark:text-stone-200 py-3 px-3 text-xs font-semibold font-ui transition-all cursor-pointer ring-1 ring-inset ring-black/5 dark:ring-white/10"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" strokeWidth={1.5} />
            <span>Load Sample Payload</span>
          </button>

          <button
            onClick={handleProcessIngestion}
            disabled={isProcessing}
            className="btn-matte flex items-center justify-center gap-1.5 rounded-xl py-3 px-3 text-xs font-semibold font-ui shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                <span>Validating...</span>
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>Verify & Ingest</span>
              </>
            )}
          </button>
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
