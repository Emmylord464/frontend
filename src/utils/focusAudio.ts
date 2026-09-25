/**
 * Sensory Focus Audio Synthesizer (Web Audio API)
 * Zero external audio assets required - generates pure acoustic frequencies directly in browser.
 */

export type FocusToneMode = 'gamma40' | 'alpha10' | 'examHall';

class FocusAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private activeNodes: Array<AudioNode> = [];
  private currentMode: FocusToneMode = 'gamma40';
  private volume = 0.35;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      mode: this.currentMode,
      volume: this.volume,
    };
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public setMode(mode: FocusToneMode) {
    this.currentMode = mode;
    if (this.isPlaying) {
      this.stop();
      this.start(mode);
    }
  }

  public start(mode: FocusToneMode = this.currentMode) {
    try {
      this.initContext();
      if (!this.ctx) return;

      this.stop();
      this.currentMode = mode;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      if (mode === 'gamma40') {
        // 40Hz Gamma Focus Binaural Beats: 200Hz Left, 240Hz Right -> 40Hz differential
        this.startBinaural(200, 240);
      } else if (mode === 'alpha10') {
        // 10Hz Alpha Exam Calm: 160Hz Left, 170Hz Right -> 10Hz relaxation beat
        this.startBinaural(160, 170);
      } else if (mode === 'examHall') {
        // Filtered Brown Noise / CBT Hall Haze to eliminate sudden room noises
        this.startBrownNoise();
      }

      this.isPlaying = true;
    } catch (err) {
      console.warn('Focus audio start failed:', err);
    }
  }

  private startBinaural(freqLeft: number, freqRight: number) {
    if (!this.ctx || !this.masterGain) return;

    // Left Channel
    const merger = this.ctx.createChannelMerger(2);

    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.value = freqLeft;

    const gainLeft = this.ctx.createGain();
    gainLeft.gain.value = 0.5;
    oscLeft.connect(gainLeft);
    gainLeft.connect(merger, 0, 0);

    // Right Channel
    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.value = freqRight;

    const gainRight = this.ctx.createGain();
    gainRight.gain.value = 0.5;
    oscRight.connect(gainRight);
    gainRight.connect(merger, 0, 1);

    merger.connect(this.masterGain);

    oscLeft.start();
    oscRight.start();

    this.activeNodes.push(oscLeft, oscRight, gainLeft, gainRight, merger);
  }

  private startBrownNoise() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain compensation
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Low pass filter for gentle soothing air
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 450;

    whiteNoise.connect(filter);
    filter.connect(this.masterGain);
    whiteNoise.start();

    this.activeNodes.push(whiteNoise, filter);
  }

  public stop() {
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // Cleanup ignore
      }
    });
    this.activeNodes = [];
    this.isPlaying = false;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }
}

export const focusAudio = new FocusAudioSynthesizer();
