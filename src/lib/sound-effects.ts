'use client';

import { Howl } from 'howler';

/**
 * Sound triggers for micro-drills & game feel:
 * - pop.mp3: Option clicked / tile selection
 * - success.mp3: Correct answer celebration
 * - error.mp3: Incorrect answer shake
 * - think.mp3: Jamby Socratic hint request
 */

type SoundName = 'pop' | 'success' | 'error' | 'think';

class SoundEffectsManager {
  private sounds: Partial<Record<SoundName, Howl>> = {};
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initSounds();
    }
  }

  private initSounds() {
    const soundFiles: Record<SoundName, string> = {
      pop: '/sounds/pop.mp3',
      success: '/sounds/success.mp3',
      error: '/sounds/error.mp3',
      think: '/sounds/think.mp3',
    };

    for (const [name, src] of Object.entries(soundFiles) as [SoundName, string][]) {
      try {
        this.sounds[name] = new Howl({
          src: [src],
          html5: false,
          volume: name === 'pop' ? 0.35 : 0.6,
          onloaderror: () => {
            // If the audio file is not present on disk, we silently fallback to Web Audio synthesis
          },
        });
      } catch {
        // Safe fallback in SSR or restricted browser contexts
      }
    }
  }

  /**
   * Web Audio API synthesized fallback:
   * Generates pleasing game tones instantly without needing external audio files.
   */
  private playSynthesizedTone(type: SoundName) {
    if (typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }

      const ctx = this.audioContext;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (type === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'success') {
        // Bright major chord chime (C6 -> E6 -> G6)
        [1046.5, 1318.5, 1567.98].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.07);
          gain.gain.setValueAtTime(0.18, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.35);
        });
      } else if (type === 'error') {
        // Low double buzz (dampened)
        [220, 180].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(0.14, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.12);
        });
      } else if (type === 'think') {
        // Mysterious gentle shimmer
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(740, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch {
      // Audio context may be restricted by autoplay policy
    }
  }

  public play(name: SoundName) {
    if (this.isMuted || typeof window === 'undefined') return;

    const howl = this.sounds[name];
    if (howl && howl.state() === 'loaded') {
      howl.play();
    } else {
      // Immediate tactile feedback via Web Audio API
      this.playSynthesizedTone(name);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

export const soundManager = new SoundEffectsManager();

export function playPopSound() {
  soundManager.play('pop');
}

export function playSuccessSound() {
  soundManager.play('success');
}

export function playErrorSound() {
  soundManager.play('error');
}

export function playThinkSound() {
  soundManager.play('think');
}

