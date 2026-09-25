/**
 * src/lib/pyodide-worker.ts
 *
 * In-browser WebAssembly Python runner using Pyodide.
 * Runs Python code in a Web Worker so the main thread never blocks.
 *
 * Usage:
 *   const { runPython } = usePyodideWorker();
 *   const result = await runPython('print("Hello JAMB!")');
 */

'use client';

export interface PyodideResult {
  stdout: string;
  stderr: string;
  error: string | null;
}

// ── Inline worker source ─────────────────────────────────────────────────────
// Bundled as a string so it works without a separate .worker.js file in Next.js.

const WORKER_SRC = /* js */ `
importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js');

let pyodide = null;

async function initPyodide() {
  if (pyodide) return pyodide;
  pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
    stdout: (msg) => self.postMessage({ type: 'stdout', data: msg }),
    stderr: (msg) => self.postMessage({ type: 'stderr', data: msg }),
  });
  return pyodide;
}

self.onmessage = async (e) => {
  const { id, code } = e.data;
  try {
    const py = await initPyodide();
    // Capture stdout/stderr via io.StringIO
    py.runPython(\`
import sys
from io import StringIO
_stdout_capture = StringIO()
_stderr_capture = StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
\`);
    py.runPython(code);
    const stdout = py.runPython('_stdout_capture.getvalue()');
    const stderr = py.runPython('_stderr_capture.getvalue()');
    py.runPython('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');
    self.postMessage({ id, type: 'result', stdout, stderr, error: null });
  } catch (err) {
    self.postMessage({ id, type: 'result', stdout: '', stderr: '', error: String(err) });
  }
};
`;

// ── Worker singleton ──────────────────────────────────────────────────────────

let workerInstance: Worker | null = null;

function getWorker(): Worker {
  if (workerInstance) return workerInstance;
  const blob = new Blob([WORKER_SRC], { type: 'application/javascript' });
  const url  = URL.createObjectURL(blob);
  workerInstance = new Worker(url);
  return workerInstance;
}

// ── Pending callbacks map ──────────────────────────────────────────────────────

const pending = new Map<string, (result: PyodideResult) => void>();

function ensureListener() {
  const worker = getWorker();
  worker.onmessage = (e: MessageEvent) => {
    const { id, type, stdout, stderr, error } = e.data;
    if (type === 'result' && pending.has(id)) {
      pending.get(id)!({ stdout, stderr, error });
      pending.delete(id);
    }
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Run arbitrary Python code in a sandboxed Pyodide Web Worker.
 * Returns stdout, stderr, and any runtime error.
 *
 * @param code  Python source string to execute.
 * @param timeoutMs  Max wait before rejecting (default 30 s).
 */
export function runPython(code: string, timeoutMs = 30_000): Promise<PyodideResult> {
  if (typeof window === 'undefined') {
    return Promise.resolve({ stdout: '', stderr: '', error: 'SSR: Pyodide runs only in the browser' });
  }

  ensureListener();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      pending.delete(id);
      reject(new Error('Pyodide timeout'));
    }, timeoutMs);

    pending.set(id, (result) => {
      clearTimeout(timer);
      resolve(result);
    });

    getWorker().postMessage({ id, code });
  });
}

/**
 * Terminate the worker. Call this in component cleanup if needed.
 */
export function terminatePyodideWorker() {
  workerInstance?.terminate();
  workerInstance = null;
  pending.clear();
}

/**
 * React hook for convenient use in components.
 *
 * @example
 * const { run, isLoading, result } = usePyodideRunner();
 * await run('print(2 + 2)');
 */
export function usePyodideRunner() {
  // Lazy import to avoid SSR issues
  const { useState, useCallback } = require('react') as typeof import('react');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult]       = useState<PyodideResult | null>(null);

  const run = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const res = await runPython(code);
      setResult(res);
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { run, isLoading, result };
}

