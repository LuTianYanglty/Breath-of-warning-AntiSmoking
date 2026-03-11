// ── Paths ──
export const MODEL_URL = './model/model.json';
export const METADATA_URL = './model/metadata.json';
export const AUDIO_DIR = './audio/';

// ── Audio file registry ──
export const AUDIO_FILES = [
  { id: 'negative1', file: 'negative1.wav', label: 'Negative 1' },
  { id: 'negative2', file: 'negative2.wav', label: 'Negative 2' },
  { id: 'negative3', file: 'negative3.wav', label: 'Negative 3' },
  { id: 'lowfreq1', file: 'LowFreq1.wav', label: 'Low Freq 1' },
  { id: 'lowfreq2', file: 'LowFreq2.wav', label: 'Low Freq 2' },
  { id: 'lowfreq3', file: 'LowFreq3.wav', label: 'Low Freq 3' },
];

// ── Detection ──
export const DEFAULT_THRESHOLD = 0.80;
export const MIN_THRESHOLD = 0.50;
export const MAX_THRESHOLD = 0.99;
export const THRESHOLD_STEP = 0.01;
export const DEBOUNCE_MS = 300;
export const SMOKING_LABEL = 'Smoking';

// ── Audio ──
export const FADE_DURATION = 0.4;          // seconds
export const MAX_SELECTED_SOUNDS = 2;
export const DEFAULT_VOLUME = 0.8;         // 0–1
export const VOLUME_RAMP_TIME = 0.05;      // seconds, for smooth knob turns

// ── State enums ──
export const STATUS_IDLE = 'idle';
export const STATUS_SMOKING = 'smoking';
