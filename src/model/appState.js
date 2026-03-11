import { DEFAULT_THRESHOLD, STATUS_IDLE } from '../config/constants.js';

export function createAppState() {
  return {
    status: STATUS_IDLE,
    selectedSounds: [],
    threshold: DEFAULT_THRESHOLD,
    latestPrediction: null,   // { className, probability }
    isRunning: false,
  };
}
