import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Headphones,
  Sliders,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Zap,
  Clock,
  Keyboard,
  ChevronDown,
} from 'lucide-react';
import { focusAudio, FocusToneMode } from '../../utils/focusAudio';
import { playTapSound } from '../../utils/audio';

interface SensoryPacingHUDProps {
  currentQuestionTime: number; // seconds spent on current question
  targetTime?: number;         // target seconds (default 45)
  totalElapsedSeconds?: number;
  questionsAnsweredCount?: number;
  activeKeyHighlight?: string | null;
}

export const SensoryPacingHUD: React.FC<SensoryPacingHUDProps> = ({
  currentQuestionTime,
  targetTime = 45,
  totalElapsedSeconds = 120,
  questionsAnsweredCount = 4,
  activeKeyHighlight = null,
}) => {
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [soundMode, setSoundMode] = useState<FocusToneMode>('gamma40');
  const [isAudioDrawerOpen, setIsAudioDrawerOpen] = useState(false);
  const [volume, setVolume] = useState(0.4);

  // Velocity computation
  const avgSeconds = questionsAnsweredCount > 0
    ? Math.round(totalElapsedSeconds / questionsAnsweredCount)
    : currentQuestionTime;

  const paceDelta = targetTime - avgSeconds;
  const isAhead = paceDelta >= 0;

  const handleToggleSound = () => {
    playTapSound();
    const active = focusAudio.toggle();
    setIsPlayingSound(active);
  };

  const handleSelectMode = (mode: FocusToneMode) => {
    playTapSound();
    setSoundMode(mode);
    focusAudio.setMode(mode);
    if (!isPlayingSound) {
      focusAudio.start(mode);
      setIsPlayingSound(true);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    focusAudio.setVolume(newVol);
  };

  return (
    <div className="w-full space-y-2 select-none">
      {/* Primary Pacing & Sensory Bar */}
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-stone-900 dark:bg-[#15171a] text-white border border-stone-800 text-xs font-mono shadow-md">
        {/* Pacing Velocity Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span
              className={`h-2 w-2 rounded-full ${
                isAhead ? 'bg-[#ccff00] animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-[11px] text-stone-400">PACE:</span>
            <span className="font-bold text-white tabular-nums">
              {avgSeconds}s/q
            </span>
          </div>

          <div className="h-3 w-px bg-stone-700 hidden sm:block" />

          <span
            className={`hidden sm:inline text-[10px] px-2 py-0.5 rounded-md ${
              isAhead
                ? 'bg-[#ccff00]/15 text-[#ccff00]'
                : 'bg-amber-400/15 text-amber-400'
            }`}
          >
            {isAhead ? `+${paceDelta}s BUFFER` : `${Math.abs(paceDelta)}s OFF TARGET`}
          </span>
        </div>

        {/* Keyboard Shortcut Indicator Badges */}
        <div className="hidden md:flex items-center gap-1 text-[10px] text-stone-400">
          <Keyboard className="h-3 w-3 mr-0.5" />
          {['A', 'B', 'C', 'D', 'N', 'P'].map((k) => (
            <span
              key={k}
              className={`px-1.5 py-0.5 rounded border transition-all ${
                activeKeyHighlight === k
                  ? 'bg-[#ccff00] text-black font-bold border-[#ccff00] scale-110'
                  : 'bg-stone-800 border-stone-700 text-stone-400'
              }`}
            >
              {k}
            </span>
          ))}
        </div>

        {/* Sensory Sound Toggle & Control */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleSound}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
              isPlayingSound
                ? 'bg-[#ccff00] text-black font-bold shadow-xs'
                : 'bg-stone-800 text-stone-300 hover:text-white'
            }`}
          >
            <Headphones className="h-3.5 w-3.5" />
            <span className="text-[11px]">
              {isPlayingSound ? 'Focus 40Hz' : 'Focus Audio'}
            </span>
          </button>

          <button
            onClick={() => {
              playTapSound();
              setIsAudioDrawerOpen(!isAudioDrawerOpen);
            }}
            className="p-1 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Sensory Audio Settings"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${
                isAudioDrawerOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expandable Sensory Frequency Controller */}
      <AnimatePresence>
        {isAudioDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl bg-[#111317] border border-stone-800 p-3.5 space-y-3 text-xs font-mono text-stone-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-stone-400 text-[11px] uppercase tracking-wider">
                Binaural Focus Frequency Generator
              </span>
              <span className="text-[10px] text-[#ccff00]">Zero-Latency Synthesis</span>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'gamma40', name: '40Hz Gamma', desc: 'Peak Focus' },
                  { id: 'alpha10', name: '10Hz Alpha', desc: 'Exam Calm' },
                  { id: 'examHall', name: 'CBT Haze', desc: 'Brown Noise' },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectMode(preset.id)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    soundMode === preset.id
                      ? 'border-[#ccff00]/60 bg-[#ccff00]/10 text-white'
                      : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <span className="block font-bold text-xs text-white">
                    {preset.name}
                  </span>
                  <span className="text-[10px] text-stone-400">{preset.desc}</span>
                </button>
              ))}
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-2 pt-1 border-t border-stone-800/80">
              <Volume2 className="h-3.5 w-3.5 text-stone-400" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="flex-1 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[#ccff00]"
              />
              <span className="text-[10px] text-stone-400 w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
