import { MODEL_URL, METADATA_URL } from '../config/constants.js';

export class VisionService {
  constructor() {
    this.model = null;
    this.stream = null;
    this.animationId = null;
    this.onPrediction = null;
  }

  async loadModel() {
    const tmPose = window.tmPose;
    if (!tmPose) {
      throw new Error('Teachable Machine Pose library not loaded. Check CDN scripts.');
    }
    this.model = await tmPose.load(MODEL_URL, METADATA_URL);
    console.log('[Vision] Model loaded');
  }

  async startCamera(videoElement) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        throw new Error('Camera permission denied. Please allow camera access.');
      }
      throw new Error('Camera not available: ' + err.message);
    }

    videoElement.srcObject = this.stream;
    await videoElement.play();
    console.log('[Vision] Camera started');
  }

  startPredictionLoop(videoElement) {
    const predict = async () => {
      if (!this.model) return;
      try {
        const { pose, posenetOutput } = await this.model.estimatePose(videoElement);
        const predictions = await this.model.predict(posenetOutput);
        if (this.onPrediction) {
          this.onPrediction(predictions, pose);
        }
      } catch (err) {
        console.error('[Vision] Prediction error:', err);
      }
      this.animationId = requestAnimationFrame(predict);
    };
    this.animationId = requestAnimationFrame(predict);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }
}
