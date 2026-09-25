import React, { useEffect, useRef } from 'react';
import { Flame, Sparkles, Award } from 'lucide-react';
import { playCompleteSound } from '../../utils/audio';

interface CelebratoryConfettiProps {
  streakDays: number;
  onClose?: () => void;
  durationMs?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRotation: number;
  width: number;
  height: number;
  color: string;
  wobble: number;
  wobbleSpeed: number;
  opacity: number;
  shape: 'rect' | 'circle' | 'strip';
}

const SCHOLAR_CONFETTI_COLORS = [
  '#047857', // Emerald dark
  '#10b981', // Emerald bright
  '#34d399', // Mint
  '#f59e0b', // Amber gold
  '#fbbf24', // Warm gold
  '#ea580c', // Terracotta orange
  '#ffffff', // Crisp white
];

export const CelebratoryConfetti: React.FC<CelebratoryConfettiProps> = ({
  streakDays,
  onClose,
  durationMs = 4000,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Play celebratory sound
    try {
      playCompleteSound();
    } catch {
      // Audio autoplay policy
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const particleCount = Math.min(120, Math.floor(width / 7));

    // Spawn dual bursts from bottom left and bottom right corners
    for (let i = 0; i < particleCount; i++) {
      const isLeft = i % 2 === 0;
      const originX = isLeft ? width * 0.15 : width * 0.85;
      const originY = height * 0.75;

      const angle = isLeft
        ? -Math.PI / 3 + (Math.random() * 0.5 - 0.25) // Spray right-upwards
        : -Math.PI * 0.65 + (Math.random() * 0.5 - 0.25); // Spray left-upwards

      const speed = 12 + Math.random() * 16;
      const shapes: ('rect' | 'circle' | 'strip')[] = ['rect', 'strip', 'circle'];

      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed + (Math.random() * 4 - 2),
        vy: Math.sin(angle) * speed - (8 + Math.random() * 6),
        rotation: Math.random() * 360,
        vRotation: (Math.random() * 8 - 4) * 0.05,
        width: 6 + Math.random() * 6,
        height: 10 + Math.random() * 8,
        color: SCHOLAR_CONFETTI_COLORS[Math.floor(Math.random() * SCHOLAR_CONFETTI_COLORS.length)],
        wobble: Math.random() * Math.PI,
        wobbleSpeed: 0.08 + Math.random() * 0.12,
        opacity: 1,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    let animationFrameId: number;
    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      const fadeProgress = Math.max(0, (elapsed - (durationMs - 1200)) / 1200);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Physics
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28; // Gravity
        p.vx *= 0.985; // Air drag
        p.vy *= 0.985;
        p.wobble += p.wobbleSpeed;
        p.rotation += p.vRotation;

        p.opacity = Math.max(0, 1 - fadeProgress);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        const wobbleScale = Math.sin(p.wobble);

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.width * 0.5 * Math.abs(wobbleScale), 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'strip') {
          ctx.fillRect(-p.width * 0.3, -p.height * 0.5, p.width * 0.6 * wobbleScale, p.height);
        } else {
          ctx.fillRect(-p.width * 0.5, -p.height * 0.5, p.width * wobbleScale, p.height);
        }

        ctx.restore();
      }

      if (elapsed < durationMs) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        if (onClose) onClose();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    const autoCloseTimer = setTimeout(() => {
      if (onClose) onClose();
    }, durationMs);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(autoCloseTimer);
    };
  }, [durationMs, onClose]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-start pt-16 sm:pt-24 px-4 overflow-hidden">
      {/* 60fps Fullscreen Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Floating Celebratory Achievement Banner */}
      <div className="relative z-10 max-w-sm w-full rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-[#064e3b]/95 via-[#047857]/95 to-[#022c22]/95 text-white p-4 shadow-2xl backdrop-blur-md animate-fadeIn paper-shadow-lifted pointer-events-auto">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 text-[#78350f] shadow-md animate-bounce-subtle">
            <Flame className="h-6 w-6 fill-[#b45309]" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-300/20 text-emerald-200 font-ui border border-emerald-300/30">
                Daily Goal Hit
              </span>
              <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300 animate-pulse" />
            </div>

            <h3 className="font-editorial text-base sm:text-lg font-semibold text-white leading-tight">
              {streakDays} Day Streak Secured!
            </h3>

            <p className="text-xs text-emerald-100/90 font-ui leading-relaxed">
              Your consistency multiplier is compounding. 1 question answered daily beats a weekend cram session.
            </p>
          </div>
        </div>

        {/* Motivational Progress Bar */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-ui text-emerald-200/90">
          <div className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-amber-300" />
            <span>Consistency Rating: <strong>Top 3%</strong></span>
          </div>
          <span className="text-emerald-300 font-medium">Keep it going tomorrow!</span>
        </div>
      </div>
    </div>
  );
};
