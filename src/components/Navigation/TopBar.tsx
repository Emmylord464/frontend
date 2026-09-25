'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { StudyTimer } from './StudyTimer';
import { playTapSound, toggleSoundMuted, getSoundMuted } from '../../utils/audio';

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
  const [isAudioMuted, setIsAudioMuted] = useState(getSoundMuted());

  const toggleFocus = () => {
    playTapSound();
    setIsCollapsed((prev) => !prev);
  };

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = toggleSoundMuted();
    setIsAudioMuted(muted);
    if (!muted) playTapSound();
  };

  return (
    <header className="sticky top-0 z-40 w-full pointer-events-none flex flex-col items-center justify-center pt-2 pb-1">
      {/* Sliding Minimalist Timer Capsule with Audio Toggle */}
      <motion.div
        initial={{ y: 0, opacity: 1 }}
        animate={isCollapsed ? { y: -38, opacity: 0.3 } : { y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
        className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#181a1c]/95 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 shadow-2xs select-none group hover:opacity-100 transition-opacity"
      >
        <div onClick={toggleFocus} className="flex items-center gap-1.5 cursor-pointer" title="Click to toggle Focus Mode">
          <StudyTimer initialSeconds={sessionSeconds} onTick={onSessionTick} />
          <span className="text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition-colors">
            {isCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </span>
        </div>

        <div className="h-3 w-[1px] bg-stone-200 dark:bg-stone-800 mx-0.5" />

        {/* Sweet Audio Mute/Unmute toggle */}
        <button
          onClick={handleToggleSound}
          className="p-0.5 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 transition-colors cursor-pointer"
          title={isAudioMuted ? 'Unmute sweet audio effects' : 'Mute audio effects'}
        >
          {isAudioMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-stone-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          )}
        </button>
      </motion.div>
    </header>
  );
};
