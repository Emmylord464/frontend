import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { playTapSound } from '../../utils/audio';

interface StudyTimerProps {
  initialSeconds?: number;
  onTick?: (seconds: number) => void;
}

export const StudyTimer: React.FC<StudyTimerProps> = ({ initialSeconds = 0, onTick }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const secondsRef = React.useRef(seconds);
  secondsRef.current = seconds;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        const next = secondsRef.current + 1;
        setSeconds(next);
        if (onTick) {
          onTick(next);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, onTick]);

  const formatClock = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

    if (hrs > 0) {
      return `${hrs}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const handleToggleTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActive(!isActive);
    playTapSound();
  };

  const handleResetTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSeconds(0);
    secondsRef.current = 0;
    if (onTick) onTick(0);
    playTapSound();
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsPopoverOpen(!isPopoverOpen);
          playTapSound();
        }}
        aria-label={`Study session timer: ${formatClock(seconds)}`}
        className={`group flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono transition-all active:scale-95 ${
          isActive
            ? 'border-[#e5e5e3] bg-white text-[#1a1c1c] paper-shadow hover:border-[#1a1c1c]'
            : 'border-[#e5e5e3] bg-[#f3f4f3] text-[#747878]'
        }`}
        title="Session duration (tap for controls)"
      >
        <span className="relative flex h-2 w-2">
          {isActive ? (
            <>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c2410c] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c2410c]" />
            </>
          ) : (
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#747878]" />
          )}
        </span>

        <span className="font-medium tracking-tight tabular-nums text-[11px] sm:text-xs text-[#1a1c1c]">
          {formatClock(seconds)}
        </span>

        <Clock className="h-3 w-3 text-[#747878] group-hover:text-[#1a1c1c] transition-colors" />
      </button>

      {/* Mini Controls Popover */}
      {isPopoverOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsPopoverOpen(false)}
          />
          <div className="absolute right-0 top-full z-40 mt-1.5 w-44 rounded-xl border border-[#e5e5e3] bg-white p-2.5 paper-shadow-lifted animate-fadeIn text-left">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#f3f4f3]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#747878] font-ui">
                Active Study Session
              </span>
              <span className="text-[10px] font-medium text-[#c2410c] font-ui">
                {isActive ? 'Tracking' : 'Paused'}
              </span>
            </div>

            <div className="py-2 text-center">
              <span className="font-mono text-xl font-semibold text-[#1a1c1c] tabular-nums tracking-tight">
                {formatClock(seconds)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={handleToggleTimer}
                className="flex items-center justify-center gap-1 rounded-lg border border-[#e5e5e3] bg-[#f9f9f8] py-1 text-[11px] font-medium text-[#1a1c1c] hover:bg-[#eeeeed] transition-colors font-ui"
              >
                {isActive ? (
                  <>
                    <Pause className="h-3 w-3" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 text-[#059669]" />
                    <span>Resume</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetTimer}
                className="flex items-center justify-center gap-1 rounded-lg border border-[#e5e5e3] bg-[#f9f9f8] py-1 text-[11px] font-medium text-[#747878] hover:text-[#1a1c1c] hover:bg-[#eeeeed] transition-colors font-ui"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
