/**
 * src/lib/sound.ts
 *
 * Canonical export path for the Howler.js / Web Audio sound manager.
 * Copilot spec uses `@/lib/sound` — this re-exports from `sound-effects`
 * so both import paths work without changing existing files.
 */

export {
  soundManager,
  playPopSound,
  playSuccessSound,
  playErrorSound,
  playThinkSound,
} from './sound-effects';

