import React from 'react';
import { Flame, Volume2, VolumeX, Smartphone, Monitor, Sun, Moon } from 'lucide-react';
import { getSoundMuted, setSoundMuted, playTapSound } from '../../utils/audio';
import { StudyTimer } from './StudyTimer';
import { CountUp } from '../Motion/CountUp';

interface TopBarProps {
  streakDays: number;
  activeScreen: string;
  isMobileFrame: boolean;
  isDarkMode?: boolean;
  sessionSeconds?: number;
  onSessionTick?: (seconds: number) => void;
  onToggleFrame: () => void;
  onToggleTheme?: () => void;
  onOpenStreakModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  streakDays,
  isMobileFrame,
  isDarkMode = false,
  sessionSeconds,
  onSessionTick,
  onToggleFrame,
  onToggleTheme,
  onOpenStreakModal,
}) => {
  const [muted, setMuted] = React.useState(getSoundMuted());

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
    if (!next) {
      playTapSound();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/60 dark:border-stone-800/60 bg-white/80 dark:bg-[#141517]/80 backdrop-blur-md px-4 py-3 transition-colors">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2">
        {/* Brand Zone: Clean Editorial Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 shadow-xs ring-1 ring-inset ring-black/5 dark:ring-white/10">
            <span className="font-editorial text-sm font-semibold italic">S</span>
          </div>
          <div className="flex flex-col">
            <span className="font-editorial text-lg font-medium tracking-tight text-stone-900 dark:text-stone-100 leading-none">
              Scholar
            </span>
            <span className="text-[9px] uppercase tracking-widest text-stone-500 dark:text-stone-400 font-medium font-ui mt-0.5">
              Precision Prep
            </span>
          </div>
        </div>

        {/* Persistent Study Timer (Minimalist Clock format) */}
        <div className="flex items-center">
          <StudyTimer initialSeconds={sessionSeconds} onTick={onSessionTick} />
        </div>

        {/* Actions Zone */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Night Scholar Theme Toggle */}
          <button
            onClick={() => {
              playTapSound();
              if (onToggleTheme) onToggleTheme();
            }}
            aria-label={isDarkMode ? 'Switch to Daylight mode' : 'Switch to Night Scholar mode'}
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-600 dark:text-stone-400 transition-all hover:opacity-90 hover:bg-stone-100 dark:hover:bg-stone-800/60 active:scale-[0.98] duration-200 ease-out cursor-pointer"
            title={isDarkMode ? 'Night Scholar Mode Active (Click for Daylight)' : 'Switch to Night Scholar Mode'}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>

          {/* Ghost Streak Badge with Elegant Dot Indicator */}
          <button
            onClick={() => {
              playTapSound();
              onOpenStreakModal();
            }}
            aria-label="View streak status"
            className="flex items-center gap-1.5 rounded-full bg-transparent border border-stone-200/70 dark:border-stone-700/60 px-2.5 py-1 text-xs font-medium text-stone-700 dark:text-stone-300 transition-all hover:opacity-90 hover:bg-stone-50 dark:hover:bg-stone-800/40 active:scale-[0.98] duration-200 ease-out cursor-pointer"
          >
            <Flame className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
            <CountUp value={streakDays} suffix="d" className="font-mono font-medium text-xs text-stone-700 dark:text-stone-300" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-600 dark:text-stone-400 transition-all hover:opacity-90 hover:bg-stone-100 dark:hover:bg-stone-800/60 active:scale-[0.98] duration-200 ease-out cursor-pointer"
            title={muted ? 'Sound Muted' : 'Sound Active'}
          >
            {muted ? (
              <VolumeX className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Volume2 className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>

          {/* Device Frame Toggle (visible on wide screens) */}
          <button
            onClick={() => {
              playTapSound();
              onToggleFrame();
            }}
            aria-label="Toggle mobile frame layout"
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full text-stone-600 dark:text-stone-400 transition-all hover:opacity-90 hover:bg-stone-100 dark:hover:bg-stone-800/60 active:scale-[0.98] duration-200 ease-out cursor-pointer"
            title={isMobileFrame ? 'Expand to fluid width' : 'Constrain to mobile frame'}
          >
            {isMobileFrame ? (
              <Monitor className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Smartphone className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
