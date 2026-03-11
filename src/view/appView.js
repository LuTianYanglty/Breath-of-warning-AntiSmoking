import { AUDIO_FILES, DEFAULT_THRESHOLD } from '../config/constants.js';

export class AppView {
  constructor() {
    this.startBtn       = document.getElementById('start-btn');
    this.startScreen    = document.getElementById('start-screen');
    this.mainContent    = document.getElementById('main-content');
    this.cameraWrapper  = document.getElementById('camera-wrapper');
    this.video          = document.getElementById('camera');
    this.statusValue    = document.getElementById('status-value');
    this.detClass       = document.getElementById('det-class');
    this.detConfidence  = document.getElementById('det-confidence');
    this.thresholdSlider = document.getElementById('threshold-slider');
    this.thresholdDisplay = document.getElementById('threshold-value');
    this.soundList      = document.getElementById('sound-list');
    this.toast          = document.getElementById('toast');
    this._toastTimer    = null;
  }

  // ── Event bindings ──

  onStart(callback) {
    this.startBtn.addEventListener('click', callback);
  }

  onThresholdChange(callback) {
    this.thresholdSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.thresholdDisplay.textContent = val.toFixed(2);
      callback(val);
    });
  }

  onSoundToggle(callback) {
    this.soundList.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        callback(e.target.dataset.id, e.target.checked);
      }
    });
  }

  // ── Rendering ──

  showMainContent() {
    this.startScreen.hidden = true;
    this.mainContent.hidden = false;
  }

  renderSoundList(files) {
    this.soundList.innerHTML = files.map(({ id, label }) => `
      <label class="sound-item">
        <input type="checkbox" data-id="${id}">
        <span class="sound-checkbox"></span>
        <span class="sound-label">${label}</span>
      </label>
    `).join('');
  }

  updateStatus(status) {
    const isSmoking = status === 'smoking';
    this.statusValue.textContent = isSmoking ? 'Smoking' : 'Idle';
    this.statusValue.className = isSmoking ? 'status-smoking' : 'status-idle';
    this.cameraWrapper.classList.toggle('smoking', isSmoking);
  }

  updatePrediction(className, confidence) {
    this.detClass.textContent = className ?? '\u2014';
    this.detConfidence.textContent =
      confidence != null ? (confidence * 100).toFixed(1) + '%' : '\u2014';
  }

  setSoundChecked(id, checked) {
    const el = this.soundList.querySelector(`input[data-id="${id}"]`);
    if (el) el.checked = checked;
  }

  showToast(message, duration = 2500) {
    this.toast.textContent = message;
    this.toast.classList.remove('hidden');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.toast.classList.add('hidden');
    }, duration);
  }

  setStartLoading(loading) {
    this.startBtn.disabled = loading;
    this.startBtn.textContent = loading ? 'INITIALIZING\u2026' : 'START';
  }
}
