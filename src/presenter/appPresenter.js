import { createAppState } from '../model/appState.js';
import {
  SMOKING_LABEL,
  STATUS_IDLE,
  STATUS_SMOKING,
  DEBOUNCE_MS,
  MAX_SELECTED_SOUNDS,
  AUDIO_FILES,
} from '../config/constants.js';

export class AppPresenter {
  constructor(view, visionService, audioService) {
    this.view   = view;
    this.vision = visionService;
    this.audio  = audioService;
    this.state  = createAppState();

    // Debounce tracking
    this.pendingState = null;
    this.pendingStart = null;
  }

  // ── Bootstrap ──

  init() {
    this.view.renderSoundList(AUDIO_FILES);
    this.view.onStart(() => this.handleStart());
    this.view.onThresholdChange(val => this.handleThresholdChange(val));
    this.view.onSoundToggle((id, checked) => this.handleSoundToggle(id, checked));
    this.view.onVolumeChange((id, value) => this.handleVolumeChange(id, value));
  }

  async handleStart() {
    this.view.setStartLoading(true);
    try {
      await this.audio.init();
      await this.audio.loadAllSounds();
      await this.vision.loadModel();
      await this.vision.startCamera(this.view.video);

      this.vision.onPrediction = (predictions) => this.handlePrediction(predictions);
      this.vision.startPredictionLoop(this.view.video);

      this.state.isRunning = true;
      this.view.showMainContent();
    } catch (err) {
      console.error('[Presenter] Initialization failed:', err);
      this.view.showToast('Init failed: ' + err.message, 5000);
      this.view.setStartLoading(false);
    }
  }

  // ── Prediction handling ──

  handlePrediction(predictions) {
    // Find highest-confidence class
    let best = predictions[0];
    for (const p of predictions) {
      if (p.probability > best.probability) best = p;
    }

    this.state.latestPrediction = best;
    this.view.updatePrediction(best.className, best.probability);

    const isSmokingRaw =
      best.className === SMOKING_LABEL &&
      best.probability >= this.state.threshold;

    this.updateDebounce(isSmokingRaw);
  }

  // ── Debounce state machine ──

  updateDebounce(isSmokingRaw) {
    const rawState = isSmokingRaw ? STATUS_SMOKING : STATUS_IDLE;

    // Raw matches confirmed → nothing pending
    if (rawState === this.state.status) {
      this.pendingState = null;
      this.pendingStart = null;
      return;
    }

    // First frame of potential change
    if (rawState !== this.pendingState) {
      this.pendingState = rawState;
      this.pendingStart = Date.now();
      return;
    }

    // Held long enough → commit transition
    if (Date.now() - this.pendingStart >= DEBOUNCE_MS) {
      this.transitionTo(rawState);
      this.pendingState = null;
      this.pendingStart = null;
    }
  }

  // ── State transitions ──

  transitionTo(newStatus) {
    this.state.status = newStatus;
    this.view.updateStatus(newStatus);

    if (newStatus === STATUS_SMOKING) {
      this.audio.resumeContext();
      for (const id of this.state.selectedSounds) {
        this.audio.play(id);
      }
    } else {
      this.audio.stopAll();
    }
  }

  // ── User interactions ──

  handleThresholdChange(value) {
    this.state.threshold = value;
  }

  handleSoundToggle(id, checked) {
    if (checked) {
      // Enforce max selection
      if (this.state.selectedSounds.length >= MAX_SELECTED_SOUNDS) {
        this.view.setSoundChecked(id, false);
        this.view.showToast(`Max ${MAX_SELECTED_SOUNDS} sounds allowed at once`);
        return;
      }
      this.state.selectedSounds.push(id);
      // Live-add if currently smoking
      if (this.state.status === STATUS_SMOKING) {
        this.audio.play(id);
      }
    } else {
      this.state.selectedSounds = this.state.selectedSounds.filter(s => s !== id);
      // Smooth fade-out for deselected sound
      this.audio.stop(id);
    }
  }

  handleVolumeChange(id, value) {
    this.audio.setVolume(id, value);
  }
}
