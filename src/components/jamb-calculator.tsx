'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playPopSound } from '@/lib/sound-effects';

interface JambCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JambCalculator({ isOpen, onClose }: JambCalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForNext, setWaitingForNext] = useState(false);

  const handleDigit = (digit: string) => {
    playPopSound();
    if (waitingForNext) {
      setDisplay(digit);
      setWaitingForNext(false);
    } else {
      setDisplay((prev) => (prev === '0' ? digit : prev + digit));
    }
  };

  const handleDecimal = () => {
    playPopSound();
    if (waitingForNext) {
      setDisplay('0.');
      setWaitingForNext(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay((prev) => prev + '.');
    }
  };

  const handleClear = () => {
    playPopSound();
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForNext(false);
  };

  const handleClearEntry = () => {
    playPopSound();
    setDisplay('0');
  };

  const handleNegate = () => {
    playPopSound();
    const current = parseFloat(display);
    if (!isNaN(current)) {
      setDisplay(String(-current));
    }
  };

  const handleSquareRoot = () => {
    playPopSound();
    const current = parseFloat(display);
    if (current < 0) {
      setDisplay('ERROR');
      return;
    }
    const res = Math.sqrt(current);
    setDisplay(String(Number(res.toFixed(8))));
    setWaitingForNext(true);
  };

  const handlePercent = () => {
    playPopSound();
    const current = parseFloat(display);
    setDisplay(String(current / 100));
    setWaitingForNext(true);
  };

  const performCalculation = (op: string, a: number, b: number) => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
      case '*':
        return a * b;
      case '÷':
      case '/':
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  };

  const handleOperator = (nextOp: string) => {
    playPopSound();
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator && !waitingForNext) {
      const result = performCalculation(operator, prevValue, inputValue);
      if (isNaN(result)) {
        setDisplay('ERROR');
        setPrevValue(null);
        setOperator(null);
        setWaitingForNext(true);
        return;
      }
      const formatted = String(Number(result.toFixed(8)));
      setDisplay(formatted);
      setPrevValue(result);
    }

    setWaitingForNext(true);
    setOperator(nextOp);
  };

  const handleEquals = () => {
    playPopSound();
    const inputValue = parseFloat(display);

    if (operator && prevValue !== null) {
      const result = performCalculation(operator, prevValue, inputValue);
      if (isNaN(result)) {
        setDisplay('ERROR');
      } else {
        const formatted = String(Number(result.toFixed(8)));
        setDisplay(formatted);
        setPrevValue(null);
        setOperator(null);
        setWaitingForNext(true);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="fixed bottom-6 right-6 z-50 w-72 rounded-2xl border-2 border-slate-700 bg-slate-900 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.65)] select-none backdrop-blur-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-base" role="img" aria-label="Calculator">🧮</span>
              <span className="text-xs font-black tracking-wider uppercase text-emerald-400">
                JAMB CBT Calculator
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="size-6 rounded-lg bg-slate-800 text-xs font-black text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition"
              aria-label="Close calculator"
            >
              ✕
            </button>
          </div>

          {/* LCD Digital Display */}
          <div className="mt-3 rounded-xl border border-emerald-950 bg-[#c6d7b9] p-3 text-right shadow-inner">
            <div className="h-4 text-[10px] font-mono font-bold text-slate-600">
              {operator && prevValue !== null ? `${prevValue} ${operator}` : ''}
            </div>
            <div
              data-testid="calculator-display"
              className="truncate font-mono text-2xl font-black text-slate-900 tracking-wider"
            >
              {display}
            </div>
          </div>

          {/* Keypad Grid */}
          <div className="mt-3.5 grid grid-cols-4 gap-1.5">
            {/* Row 1 */}
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg bg-rose-900/60 border border-rose-700/50 py-2.5 text-xs font-black text-rose-200 hover:bg-rose-800/80 active:scale-95 transition"
            >
              C
            </button>
            <button
              type="button"
              onClick={handleClearEntry}
              className="rounded-lg bg-slate-800 py-2.5 text-xs font-black text-slate-300 hover:bg-slate-700 active:scale-95 transition"
            >
              CE
            </button>
            <button
              type="button"
              onClick={handleSquareRoot}
              className="rounded-lg bg-slate-800 py-2.5 text-xs font-black text-emerald-400 hover:bg-slate-700 active:scale-95 transition"
            >
              √
            </button>
            <button
              type="button"
              onClick={() => handleOperator('÷')}
              className="rounded-lg bg-emerald-900/40 border border-emerald-600/40 py-2.5 text-sm font-black text-emerald-300 hover:bg-emerald-800/60 active:scale-95 transition"
            >
              ÷
            </button>

            {/* Row 2 */}
            <button
              type="button"
              onClick={() => handleDigit('7')}
              className="rounded-lg bg-slate-800 py-2.5 text-sm font-black text-white hover:bg-slate-700 active:scale-95 transition"
            >
              7
            </button>
            <button
              type="button"
              onClick={() => handleDigit('8')}
              className="rounded-lg bg-slate-800 py-2.5 text-sm font-black text-white hover:bg-slate-700 active:scale-95 transition"
            >
              8
            </button>
            <button
              type="button"
              onClick={() => handleDigit('9')}
              className="rounded-lg bg-slate-800 py-2.5 text-sm font-black text-white hover:bg-slate-700 active:scale-95 transition"
            >
              9
            </button>
            <button
              type="button"
              onClick={() => handleOperator('×')}
              className="rounded-lg bg-emerald-900/40 border border-emerald-600/40 py-2.5 text-sm font-black text-emerald-300 hover:bg-emerald-800/60 active:scale-95 transition"
            >
              ×
            </button>

            {/* Row 3 */}
            <button
              type="button"
              onClick={() => handleDigit('4')}
              className="rounded-lg bg-slate-800 py-2.5 text-sm font-black text-white hover:bg-slate-700 active:scale-95 transition"
            >
              4
            </button>
            <button
              type="button"
              onClick={() => handleDigit('5')}
              className="rounded-lg bg-slate-800 py-2.5 text-sm font-black text-white hover:bg-slate-700 active:scale-95 transition"
            >
              5
            </button>
            <button
              type="button"
              onClick={() => handleDigit('6')}
              className="rounded-lg bg-slate-800 py-2.5 text-sm font-black text-white hover:bg-slate-700 active:scale-95 transition"
            >
              6
            </button>
            <button
              type="button"
              onClick={() => handleOperator('-')}
              className="rounded-lg bg-emerald-900/40 border border-emerald-600/40 py-2.5 text-sm font-black text-emerald-300 hover:bg-emerald-800/60 active:scale-95 transition"
            >
              -
            </button>

            {/* Row 4 */}
            <button
              type="button"
              onClick={() => handleDigit('1')}
              className="rounded-lg bg-slate-800 py-2.5 text-sm font-black text-white hover:bg-slate-700 active:scale-95 transition"
            >
              1
            </button>
            <button
              type="button"
              onClick={() => handleDigit('2')}
              className="rounded-lg bg-slate-800 py-2.5 text-sm font-black text-white hover:bg-slate-700 active:scale-95 transition"
            >
              2
            </button>
            <button
              type="button"
              onClick={() => handleDigit('3')}
              className="rounded-lg bg-slate-800 py-2.5 text-sm font-black text-white hover:bg-slate-700 active:scale-95 transition"
            >
              3
            </button>
            <button
              type="button"
              onClick={() => handleOperator('+')}
              className="rounded-lg bg-emerald-900/40 border border-emerald-600/40 py-2.5 text-sm font-black text-emerald-300 hover:bg-emerald-800/60 active:scale-95 transition"
            >
              +
            </button>

            {/* Row 5 */}
            <button
              type="button"
              onClick={handleNegate}
              className="rounded-lg bg-slate-800 py-2.5 text-xs font-black text-slate-300 hover:bg-slate-700 active:scale-95 transition"
            >
              ±
            </button>
            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="rounded-lg bg-slate-800 py-2.5 text-sm font-black text-white hover:bg-slate-700 active:scale-95 transition"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDecimal}
              className="rounded-lg bg-slate-800 py-2.5 text-sm font-black text-white hover:bg-slate-700 active:scale-95 transition"
            >
              .
            </button>
            <button
              type="button"
              onClick={handleEquals}
              className="rounded-lg bg-emerald-500 py-2.5 text-sm font-black text-slate-950 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95 transition"
            >
              =
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

