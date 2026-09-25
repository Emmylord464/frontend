import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { playTapSound } from '../../utils/audio';

export interface ScreenGuideContent {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  description: string | string[];
  tips?: string[];
}

interface ScreenGuideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  guide: ScreenGuideContent | null;
}

export const InfoTrigger: React.FC<{
  onClick: () => void;
  label?: string;
  className?: string;
}> = ({ onClick, label = 'Section information', className = '' }) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        playTapSound();
        onClick();
      }}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-full text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100/80 dark:hover:bg-stone-800/80 active:scale-[0.98] transition-all duration-150 cursor-pointer shrink-0 ${className}`}
    >
      <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
    </button>
  );
};

export const ScreenGuideSheet: React.FC<ScreenGuideSheetProps> = ({
  isOpen,
  onClose,
  guide,
}) => {
  if (!guide) return null;
  const GuideIcon = guide.icon || Info;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Frosted Glass Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          />

          {/* Tactile Screen Guide Inset Sheet with Heavy Spring Physics */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: 'spring', damping: 32, stiffness: 360, mass: 0.92 }}
            className="relative z-10 w-full sm:max-w-md max-h-[85vh] overflow-y-auto no-scrollbar rounded-t-3xl sm:rounded-3xl border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#1a1c1e] p-6 sm:p-7 paper-shadow-lifted ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-5"
          >
            {/* Mobile Drag Indicator Bar */}
            <div className="w-10 h-1 rounded-full bg-stone-300/80 dark:bg-stone-700 mx-auto -mt-2 mb-2 sm:hidden" />

            {/* Dismiss Ghost Button */}
            <button
              onClick={() => {
                playTapSound();
                onClose();
              }}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/60 active:scale-[0.98] duration-150 transition-all cursor-pointer"
              aria-label="Dismiss guide"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>

            {/* Oversized Fine-Line Icon & Inset Header */}
            <div className="flex items-start gap-4 pr-6">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200/70 dark:border-stone-700/60 ring-1 ring-inset ring-black/5 dark:ring-white/10 shrink-0">
                <GuideIcon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.25} />
              </div>
              <div className="space-y-0.5">
                {guide.badge && (
                  <span className="text-[10px] uppercase tracking-widest text-stone-400 font-ui font-medium block">
                    {guide.badge}
                  </span>
                )}
                <h3 className="font-editorial text-xl sm:text-2xl font-normal text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
                  {guide.title}
                </h3>
                {guide.subtitle && (
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-ui block">
                    {guide.subtitle}
                  </span>
                )}
              </div>
            </div>

            {/* Leading-Relaxed Editorial Body Copy */}
            <div className="space-y-3 pt-1 border-t border-stone-100 dark:border-stone-800/70">
              {Array.isArray(guide.description) ? (
                guide.description.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-ui leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-ui leading-relaxed">
                  {guide.description}
                </p>
              )}
            </div>

            {/* Optional Key Points / Tips Box */}
            {guide.tips && guide.tips.length > 0 && (
              <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 p-4 ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block font-medium">
                  Examination Briefing
                </span>
                <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300 font-ui">
                  {guide.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-stone-400 dark:text-stone-500 shrink-0">·</span>
                      <span className="leading-snug">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Matte 'Got It' Action Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  playTapSound();
                  onClose();
                }}
                className="btn-matte w-full rounded-xl py-3 text-xs font-semibold font-ui shadow-xs cursor-pointer active:scale-[0.98] duration-150 transition-all text-center"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
