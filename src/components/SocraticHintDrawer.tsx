'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, X, Lightbulb } from 'lucide-react';

interface SocraticHintDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  hint: string;
  textbookRef: string;
  topicTitle?: string;
}

export const SocraticHintDrawer: React.FC<SocraticHintDrawerProps> = ({
  isOpen,
  onClose,
  hint,
  textbookRef,
  topicTitle,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
          />

          {/* Bottom Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md rounded-t-3xl border-t border-[#e5e5e3] dark:border-[#282b2e] bg-[#f9f9f8] dark:bg-[#181a1c] p-6 shadow-2xl"
          >
            {/* Grab Bar */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#d5d5d3] dark:bg-[#333638]" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c2410c]/10 text-[#c2410c] dark:bg-[#c2410c]/20">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-editorial text-base font-semibold text-[#1a1c1c] dark:text-white">
                    Socratic Hint
                  </h3>
                  {topicTitle && (
                    <p className="text-[11px] text-[#747878] dark:text-[#9ca3af] font-ui">
                      {topicTitle}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-[#747878] hover:bg-[#e5e5e3] dark:text-[#9ca3af] dark:hover:bg-[#282b2e] transition-colors"
                aria-label="Close Hint"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Socratic Hint Text */}
            <div className="rounded-xl bg-white dark:bg-[#121314] p-4 border border-[#e5e5e3] dark:border-[#282b2e] mb-4 shadow-xs">
              <p className="text-sm text-[#1a1c1c] dark:text-[#e5e7eb] leading-relaxed font-ui">
                {hint}
              </p>
            </div>

            {/* Official Textbook Grounding Citation */}
            <div className="flex items-start gap-2.5 rounded-lg bg-[#f3f4f3] dark:bg-[#202326] p-3 text-xs text-[#444748] dark:text-[#9ca3af]">
              <BookOpen className="h-4 w-4 shrink-0 text-[#c2410c] mt-0.5" />
              <div>
                <span className="font-semibold text-[#1a1c1c] dark:text-white block font-ui">
                  Official Recommended Text:
                </span>
                <span className="italic font-editorial text-[13px] text-[#1a1c1c] dark:text-[#d1d5db]">
                  {textbookRef}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-xl bg-[#1a1c1c] py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-[#121314] font-ui"
            >
              Got it, back to question
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
