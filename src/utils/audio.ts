/**
 * Studio-Grade Web Audio Synthesizer & Tactile Sound Engine
 * Generates warm, organic, acoustic micro-tones (Marimba, Celesta, Soft Droplet)
 * with zero clipping, smooth exponential envelopes, and low-pass warmth.
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundMuted(muted: boolean) {
  isMuted = muted;
}

export function getSoundMuted(): boolean {
  return isMuted;
}

export function toggleSoundMuted(): boolean {
  isMuted = !isMuted;
  return isMuted;
}

// ─── Haptic Feedback for Mobile Devices ─────────────────────────────────────
export function triggerHapticFailure() {
  if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate([60, 40, 80]);
    } catch {}
  }
}

export function triggerHapticSuccess() {
  if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(35);
    } catch {}
  }
}

// ─── 1. Sweet Organic Micro-Tap (Soft Droplet / Wooden Pebble) ───────────────
export function playTapSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Gentle low-pass filter for warmth
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(560, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.04);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  } catch {}
}

// ─── 2. Sweet Celesta & Marimba Correct Chime (E5 -> G#5 -> B5 -> E6) ────────
export function playCorrectSound() {
  triggerHapticSuccess();
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Sweet shimmering chord: E5, G#5, B5, E6
    const chordNotes = [
      { freq: 659.25, delay: 0.0, gainVal: 0.07, duration: 0.45 },
      { freq: 830.61, delay: 0.04, gainVal: 0.065, duration: 0.5 },
      { freq: 987.77, delay: 0.08, gainVal: 0.06, duration: 0.55 },
      { freq: 1318.51, delay: 0.12, gainVal: 0.045, duration: 0.6 },
    ];

    chordNotes.forEach(({ freq, delay, gainVal, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now + delay);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      // Smooth attack and natural ring
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.linearRampToValueAtTime(gainVal, now + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.01);
    });
  } catch {}
}

// ─── 3. Warm Velvet Muffled Thud (Gentle, Non-Jarring Incorrect Tone) ─────────
export function playIncorrectSound() {
  triggerHapticFailure();
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Soft two-tone downward ripple (D3 -> Bb2) through a deep lowpass filter
    const notes = [
      { freq: 155.56, delay: 0.0, gainVal: 0.08, duration: 0.18 },
      { freq: 116.54, delay: 0.09, gainVal: 0.07, duration: 0.22 },
    ];

    notes.forEach(({ freq, delay, gainVal, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now + delay);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, now + delay + duration);

      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.linearRampToValueAtTime(gainVal, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.01);
    });
  } catch {}
}

// ─── 4. Sweet Crystal Success Chime (High-Grade Affirmation) ─────────────────
export function playSuccessChime() {
  triggerHapticSuccess();
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [880, 1108.73, 1318.51]; // A5 -> C#6 -> E6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3600, now + idx * 0.07);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.05, now + idx * 0.07 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.46);
    });
  } catch {}
}

// ─── 5. Majestic Sweet Harp Victory Arpeggio (Full Completion) ───────────────
export function playCompleteSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4000, now + i * 0.065);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.065);

      gain.gain.setValueAtTime(0.0001, now + i * 0.065);
      gain.gain.linearRampToValueAtTime(0.045, now + i * 0.065 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.065 + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.065);
      osc.stop(now + i * 0.065 + 0.51);
    });
  } catch {}
}
