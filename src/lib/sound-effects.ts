'use client';

import {
  playTapSound,
  playCorrectSound,
  playIncorrectSound,
  playCompleteSound,
  setSoundMuted,
  getSoundMuted,
  toggleSoundMuted,
} from '../utils/audio';

/**
 * Sound triggers for micro-drills & tactile game feel
 */
class SoundEffectsManager {
  public play(name: 'pop' | 'success' | 'error' | 'think') {
    switch (name) {
      case 'pop':
        playTapSound();
        break;
      case 'success':
        playCorrectSound();
        break;
      case 'error':
        playIncorrectSound();
        break;
      case 'think':
        playTapSound();
        break;
      default:
        playTapSound();
    }
  }

  public setMuted(muted: boolean) {
    setSoundMuted(muted);
  }

  public toggleMute() {
    return toggleSoundMuted();
  }

  public isMuted() {
    return getSoundMuted();
  }
}

export const soundManager = new SoundEffectsManager();

export function playPopSound() {
  playTapSound();
}

export function playSuccessSound() {
  playCorrectSound();
}

export function playErrorSound() {
  playIncorrectSound();
}

export function playThinkSound() {
  playTapSound();
}
