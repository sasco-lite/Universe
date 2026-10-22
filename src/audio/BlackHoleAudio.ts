/**
 * Procedural Web Audio Synthesizer with High Presence
 * Provides deep gravitational hum, accretion turbulence, interactive gravity well sound,
 * star slingshot whoosh, star hover chirps, and mobile haptic feedback.
 */

export function triggerHaptic(durationMs = 15) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(durationMs);
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  }
}

class BlackHoleAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private humGain: GainNode | null = null;
  private noiseGain: GainNode | null = null;

  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private humFilter: BiquadFilterNode | null = null;

  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;

  private isRunning = false;
  private baseFrequency = 54.0; // Hz

  public init(): boolean {
    if (this.ctx) return true;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output node - boosted level for high presence
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Deep resonant lowpass filter
      this.humFilter = this.ctx.createBiquadFilter();
      this.humFilter.type = 'lowpass';
      this.humFilter.frequency.setValueAtTime(140, this.ctx.currentTime);
      this.humFilter.Q.setValueAtTime(4.2, this.ctx.currentTime);

      this.humGain = this.ctx.createGain();
      this.humGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.humGain.connect(this.humFilter);
      this.humFilter.connect(this.masterGain);

      // Dual detuned oscillators
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'sine';
      this.osc1.frequency.setValueAtTime(this.baseFrequency, this.ctx.currentTime);
      this.osc1.connect(this.humGain);

      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'triangle';
      this.osc2.frequency.setValueAtTime(this.baseFrequency * 1.018, this.ctx.currentTime);
      this.osc2.connect(this.humGain);

      this.subOsc = this.ctx.createOscillator();
      this.subOsc.type = 'sine';
      this.subOsc.frequency.setValueAtTime(this.baseFrequency * 0.5, this.ctx.currentTime);
      this.subOsc.connect(this.humGain);

      // Accretion disk turbulent noise
      this.setupAccretionNoise();

      this.osc1.start();
      this.osc2.start();
      this.subOsc.start();

      return true;
    } catch {
      return false;
    }
  }

  private setupAccretionNoise() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 4.0;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.setValueAtTime(260, this.ctx.currentTime);
    this.noiseFilter.Q.setValueAtTime(2.2, this.ctx.currentTime);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    this.noiseNode.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);

    this.noiseNode.start();
  }

  public play() {
    if (!this.ctx) {
      const ok = this.init();
      if (!ok) return;
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      // Increased master sound volume
      this.masterGain.gain.setTargetAtTime(0.85, this.ctx.currentTime, 0.4);
      this.isRunning = true;
    }
  }

  public pause() {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.3);
      this.isRunning = false;
    }
  }

  public toggle(force?: boolean): boolean {
    const next = force !== undefined ? force : !this.isRunning;
    if (next) {
      this.play();
    } else {
      this.pause();
    }
    return this.isRunning;
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  public updatePhysics(distanceRs: number, timeDilationFactor: number, spin: number) {
    if (!this.ctx || !this.isRunning) return;

    const t = this.ctx.currentTime;
    const clampedDilation = Math.max(0.08, Math.min(1.0, timeDilationFactor));
    const currentBase = this.baseFrequency * Math.pow(clampedDilation, 0.65);

    if (this.osc1 && this.osc2 && this.subOsc) {
      this.osc1.frequency.setTargetAtTime(currentBase, t, 0.1);
      this.osc2.frequency.setTargetAtTime(currentBase * (1.018 + Math.abs(spin) * 0.02), t, 0.1);
      this.subOsc.frequency.setTargetAtTime(currentBase * 0.5, t, 0.1);
    }

    if (this.humFilter) {
      const filterFreq = Math.max(70, Math.min(480, 100 + (30 / Math.max(1.5, distanceRs)) * 260));
      this.humFilter.frequency.setTargetAtTime(filterFreq, t, 0.15);
    }

    if (this.noiseFilter && this.noiseGain) {
      const noiseFreq = Math.max(120, Math.min(800, 180 + (12 / Math.max(2.0, distanceRs)) * 320));
      this.noiseFilter.frequency.setTargetAtTime(noiseFreq, t, 0.2);
      const noiseVol = Math.max(0.06, Math.min(0.35, 0.08 + 0.2 / Math.max(1.0, distanceRs)));
      this.noiseGain.gain.setTargetAtTime(noiseVol, t, 0.2);
    }
  }

  /**
   * Sound effect when user holds/spawns a gravity well
   */
  public playGravityWellHum(intensity: number) {
    if (!this.ctx || !this.isRunning) return;
    try {
      const t = this.ctx.currentTime;
      if (this.humFilter) {
        this.humFilter.frequency.setTargetAtTime(140 + intensity * 350, t, 0.08);
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Sound effect when slingshot launching a star
   */
  public playStarLaunch() {
    if (!this.ctx || !this.isRunning) return;
    try {
      triggerHaptic(25);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Ignore
    }
  }

  /**
   * Soft hover chirp when mouse sweeps over a star
   */
  public playStarHover() {
    if (!this.ctx || !this.isRunning) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(650 + Math.random() * 200, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore
    }
  }

  public playChirp(freq = 440) {
    if (!this.ctx || !this.isRunning) return;
    try {
      triggerHaptic(12);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.7, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.35, now + 0.12);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Ignore
    }
  }
}

export const soundEngine = new BlackHoleAudioEngine();
