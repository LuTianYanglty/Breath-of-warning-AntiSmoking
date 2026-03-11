import { AUDIO_FILES, DEFAULT_VOLUME } from '../config/constants.js';

export class AppView {
  constructor() {
    this.startBtn        = document.getElementById('start-btn');
    this.startScreen     = document.getElementById('start-screen');
    this.mainContent     = document.getElementById('main-content');
    this.cameraWrapper   = document.getElementById('camera-wrapper');
    this.video           = document.getElementById('camera');
    this.statusValue     = document.getElementById('status-value');
    this.detClass        = document.getElementById('det-class');
    this.detConfidence   = document.getElementById('det-confidence');
    this.thresholdSlider = document.getElementById('threshold-slider');
    this.thresholdDisplay = document.getElementById('threshold-value');
    this.soundList       = document.getElementById('sound-list');
    this.toast           = document.getElementById('toast');
    this._toastTimer     = null;
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
      if (e.target.classList.contains('sound-cb')) {
        callback(e.target.dataset.id, e.target.checked);
      }
    });
  }

  onVolumeChange(callback) {
    this.soundList.addEventListener('input', (e) => {
      if (e.target.classList.contains('volume-slider')) {
        const val = parseInt(e.target.value, 10);
        e.target.closest('.sound-item')
          .querySelector('.volume-value').textContent = val + '%';
        callback(e.target.dataset.id, val / 100);
      }
    });
  }

  // ── Rendering ──

  showMainContent() {
    this.startScreen.hidden = true;
    this.mainContent.hidden = false;
  }

  renderSoundList(files) {
    const defaultPct = Math.round(DEFAULT_VOLUME * 100);
    this.soundList.innerHTML = files.map(({ id, label }) => `
      <div class="sound-item">
        <label class="sound-toggle">
          <input type="checkbox" class="sound-cb" data-id="${id}">
          <span class="sound-checkbox"></span>
          <span class="sound-label">${label}</span>
        </label>
        <div class="sound-volume">
          <input type="range" class="volume-slider" data-id="${id}"
                 min="0" max="100" value="${defaultPct}">
          <span class="volume-value">${defaultPct}%</span>
        </div>
      </div>
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
    const el = this.soundList.querySelector(`.sound-cb[data-id="${id}"]`);
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
