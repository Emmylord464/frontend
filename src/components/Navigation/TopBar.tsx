'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ChevronUp, ChevronDown } from 'lucide-react';
import { StudyTimer } from './StudyTimer';
import { playTapSound } from '../../utils/audio';

interface TopBarProps {
  streakDays?: number;
  activeScreen?: string;
  isMobileFrame?: boolean;
  isDarkMode?: boolean;
  sessionSeconds?: number;
  onSessionTick?: (seconds: number) => void;
  onToggleFrame?: () => void;
  onToggleTheme?: () => void;
  onOpenStreakModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  sessionSeconds,
  onSessionTick,
}) => {
  // Focus Mode State: when collapsed, it slides out to maximize 100% screen space
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleFocus = () => {
    playTapSound();
    setIsCollapsed((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-40 w-full pointer-events-none flex flex-col items-center justify-center pt-2 pb-1">
      {/* Sliding Minimalist Timer Capsule */}
      <motion.div
        initial={{ y: 0, opacity: 1 }}
        animate={isCollapsed ? { y: -38, opacity: 0.3 } : { y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
        className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#181a1c]/90 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 shadow-sm cursor-pointer select-none group hover:opacity-100 transition-opacity"
        onClick={toggleFocus}
        title={isCollapsed ? 'Click to show Timer' : 'Click to hide for Focus Mode'}
      >
        <StudyTimer initialSeconds={sessionSeconds} onTick={onSessionTick} />
        <span className="text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition-colors">
          {isCollapsed ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </span>
      </motion.div>
    </header>
  );
};
