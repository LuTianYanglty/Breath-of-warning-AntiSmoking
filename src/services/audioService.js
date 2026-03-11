import { AUDIO_DIR, AUDIO_FILES, FADE_DURATION } from '../config/constants.js';

export class AudioService {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.buffers = {};    // id → AudioBuffer
    this.playing = {};    // id → { source, gain }
  }

  async init() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    console.log('[Audio] AudioContext created');
  }

  async loadAllSounds() {
    const results = await Promise.allSettled(
      AUDIO_FILES.map(({ id, file }) => this.loadSound(id, AUDIO_DIR + file))
    );
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        console.error(`[Audio] Failed to load "${AUDIO_FILES[i].file}":`, result.reason.message);
      }
    });
    const loaded = results.filter(r => r.status === 'fulfilled').length;
    console.log(`[Audio] ${loaded}/${AUDIO_FILES.length} sounds loaded`);
  }

  async loadSound(id, url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Audio file not found: ${url} (HTTP ${response.status})`);
    }
    const arrayBuffer = await response.arrayBuffer();
    this.buffers[id] = await this.audioContext.decodeAudioData(arrayBuffer);
  }

  isLoaded(id) {
    return !!this.buffers[id];
  }

  isPlaying(id) {
    return !!this.playing[id];
  }

  play(id) {
    if (!this.buffers[id] || this.playing[id]) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = this.buffers[id];
    source.loop = true;

    const gain = this.audioContext.createGain();
    const now = this.audioContext.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1, now + FADE_DURATION);

    source.connect(gain);
    gain.connect(this.masterGain);
    source.start(0);

    this.playing[id] = { source, gain };
  }

  stop(id) {
    const entry = this.playing[id];
    if (!entry) return;
    delete this.playing[id];

    const { source, gain } = entry;
    const now = this.audioContext.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + FADE_DURATION);

    // Clean up after fade completes
    const cleanupDelay = FADE_DURATION * 1000 + 100;
    setTimeout(() => {
      try { source.stop(); } catch (_) { /* already stopped */ }
      source.disconnect();
      gain.disconnect();
    }, cleanupDelay);
  }

  stopAll() {
    for (const id of Object.keys(this.playing)) {
      this.stop(id);
    }
  }

  resumeContext() {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}
