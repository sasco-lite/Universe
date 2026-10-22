/**
 * Procedural Web Audio Synthesizer
 * Generates an organic, deep gravitational hum, accretion disk turbulence,
 * and pitch-shifted time dilation acoustics with zero external audio assets.
 */

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
  private baseFrequency = 52.0; // Hz (Sub-bass G#1/A1 range)

  public init(): boolean {
    if (this.ctx) return true;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Lowpass filter for deep gravitational rumble
      this.humFilter = this.ctx.createBiquadFilter();
      this.humFilter.type = 'lowpass';
      this.humFilter.frequency.setValueAtTime(110, this.ctx.currentTime);
      this.humFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);

      this.humGain = this.ctx.createGain();
      this.humGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.humGain.connect(this.humFilter);
      this.humFilter.connect(this.masterGain);

      // Dual detuned oscillators for authentic gravitational wave beating
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'sine';
      this.osc1.frequency.setValueAtTime(this.baseFrequency, this.ctx.currentTime);
      this.osc1.connect(this.humGain);

      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'triangle';
      this.osc2.frequency.setValueAtTime(this.baseFrequency * 1.015, this.ctx.currentTime); // 0.8 Hz beat frequency
      this.osc2.connect(this.humGain);

      this.subOsc = this.ctx.createOscillator();
      this.subOsc.type = 'sine';
      this.subOsc.frequency.setValueAtTime(this.baseFrequency * 0.5, this.ctx.currentTime); // Sub-harmonic 26 Hz
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

    // Generate 4 seconds of brownian/pink noise buffer
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02; // Brown noise integrator
      lastOut = data[i];
      data[i] *= 3.5;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.setValueAtTime(220, this.ctx.currentTime);
    this.noiseFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

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
      this.masterGain.gain.setTargetAtTime(0.5, this.ctx.currentTime, 0.5);
      this.isRunning = true;
    }
  }

  public pause() {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.4);
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

  /**
   * Modulate acoustic parameters based on distance from black hole (in r_s)
   * and gravitational time dilation factor (0 to 1).
   */
  public updatePhysics(distanceRs: number, timeDilationFactor: number, spin: number) {
    if (!this.ctx || !this.isRunning) return;

    const t = this.ctx.currentTime;
    const clampedDilation = Math.max(0.08, Math.min(1.0, timeDilationFactor));

    // Near horizon, frequency red-shifts dramatically downward (up to 2 octaves down)
    const currentBase = this.baseFrequency * Math.pow(clampedDilation, 0.65);

    if (this.osc1 && this.osc2 && this.subOsc) {
      this.osc1.frequency.setTargetAtTime(currentBase, t, 0.1);
      this.osc2.frequency.setTargetAtTime(currentBase * (1.015 + Math.abs(spin) * 0.02), t, 0.1);
      this.subOsc.frequency.setTargetAtTime(currentBase * 0.5, t, 0.1);
    }

    if (this.humFilter) {
      // Proximity opens higher frequency harmonics
      const filterFreq = Math.max(60, Math.min(380, 80 + (25 / Math.max(1.5, distanceRs)) * 200));
      this.humFilter.frequency.setTargetAtTime(filterFreq, t, 0.15);
    }

    if (this.noiseFilter && this.noiseGain) {
      const noiseFreq = Math.max(100, Math.min(650, 150 + (10 / Math.max(2.0, distanceRs)) * 250));
      this.noiseFilter.frequency.setTargetAtTime(noiseFreq, t, 0.2);
      // As disk speed increases near horizon, turbulence increases
      const noiseVol = Math.max(0.03, Math.min(0.25, 0.05 + 0.15 / Math.max(1.0, distanceRs)));
      this.noiseGain.gain.setTargetAtTime(noiseVol, t, 0.2);
    }
  }

  /**
   * Synthesize a subtle gravitational chirp tone when selecting a star or changing views
   */
  public playChirp(freq = 440) {
    if (!this.ctx || !this.isRunning) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.6, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + 0.12);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Ignore audio glitch
    }
  }
}

export const soundEngine = new BlackHoleAudioEngine();
