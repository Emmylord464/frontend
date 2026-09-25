import React, { useEffect, useState } from 'react';
import { playCompleteSound, playTapSound } from '../../utils/audio';

interface ScholarIntroScreenProps {
  onFinish: () => void;
}

export const ScholarIntroScreen: React.FC<ScholarIntroScreenProps> = ({ onFinish }) => {
  const [phase, setPhase] = useState<'initial' | 'boom' | 'reveal' | 'fadeout'>('initial');

  useEffect(() => {
    // Play signature acoustic audio cue
    const audioTimer = setTimeout(() => {
      try {
        playCompleteSound();
      } catch {
        // audio play fails if unmuted by browser policy
      }
    }, 120);

    // Sequence timeline
    const t1 = setTimeout(() => setPhase('boom'), 150);
    const t2 = setTimeout(() => setPhase('reveal'), 1100);
    const t3 = setTimeout(() => setPhase('fadeout'), 2650);
    const t4 = setTimeout(() => onFinish(), 3100);

    return () => {
      clearTimeout(audioTimer);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  const handleSkip = () => {
    playTapSound();
    onFinish();
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07120e] text-white cursor-pointer select-none overflow-hidden transition-opacity duration-500 ${
        phase === 'fadeout' ? 'opacity-0 scale-105' : 'opacity-100'
      }`}
    >
      {/* Cinematic Center Radial Backlight (Emerald & Deep Ink) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#054d37_0%,#03261b_40%,#02120d_75%,#000000_100%)] pointer-events-none" />

      {/* Cinematic Film Vignette Edge */}
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.85)] pointer-events-none" />

      {/* Netflix-style Vertical Prism Light Ribbons */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="relative w-72 h-96 flex items-center justify-center">
          {/* Ribbon 1 - Deep Emerald */}
          <div
            className={`absolute w-3.5 h-full bg-gradient-to-b from-transparent via-[#10b981] to-transparent rounded-full blur-[1px] transform -translate-x-12 ${
              phase !== 'initial' ? 'animate-ribbon' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.05s' }}
          />

          {/* Ribbon 2 - Mint Radiant Center */}
          <div
            className={`absolute w-4 h-full bg-gradient-to-b from-transparent via-[#34d399] to-transparent rounded-full blur-[1px] transform -translate-x-4 ${
              phase !== 'initial' ? 'animate-ribbon' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.15s' }}
          />

          {/* Ribbon 3 - Bright Champagne Gold Accent */}
          <div
            className={`absolute w-2.5 h-full bg-gradient-to-b from-transparent via-[#fef08a] to-transparent rounded-full blur-[1px] transform translate-x-4 ${
              phase !== 'initial' ? 'animate-ribbon' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.25s' }}
          />

          {/* Ribbon 4 - Deep Emerald Right */}
          <div
            className={`absolute w-4 h-full bg-gradient-to-b from-transparent via-[#059669] to-transparent rounded-full blur-[1px] transform translate-x-12 ${
              phase !== 'initial' ? 'animate-ribbon' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.35s' }}
          />

          {/* Horizontal Flare Lens Sweep */}
          <div
            className={`absolute h-1 w-[260px] bg-gradient-to-r from-transparent via-white to-transparent rounded-full blur-[2px] ${
              phase !== 'initial' ? 'animate-lens-flare' : 'opacity-0'
            }`}
          />
        </div>
      </div>

      {/* Center Cinematic Wordmark */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        {/* Monogram / Emblem Glow */}
        <div className="mb-4 relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#047857] via-[#10b981] to-[#34d399] p-0.5 shadow-2xl flex items-center justify-center">
            <div className="h-full w-full rounded-[14px] bg-[#021811] flex items-center justify-center">
              <span className="font-editorial text-3xl font-bold italic text-white drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]">
                S
              </span>
            </div>
          </div>
        </div>

        {/* Cinematic "SCHOLAR" Main Title */}
        <div className="overflow-visible py-2">
          <h1 className="font-editorial text-5xl sm:text-7xl font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase text-white drop-shadow-[0_4px_30px_rgba(16,185,129,0.7)] animate-cinematic-intro">
            SCHOLAR
          </h1>
        </div>

        {/* Minimalist Cinematic Sub-Tagline */}
        <div
          className={`mt-4 flex flex-col items-center transition-all duration-700 ${
            phase === 'reveal' || phase === 'fadeout'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-emerald-400 to-transparent mb-2.5" />
          <p className="font-ui text-[11px] sm:text-xs uppercase tracking-[0.3em] text-emerald-200/90 font-medium">
            An Academic Original · UTME 2025
          </p>
        </div>
      </div>

      {/* Subtle Bottom Skip Indicator */}
      <div className="absolute bottom-8 z-20 flex items-center justify-center">
        <span className="text-[11px] font-ui tracking-widest text-emerald-200/50 uppercase hover:text-white transition-colors">
          Tap anywhere to start
        </span>
      </div>
    </div>
  );
};
