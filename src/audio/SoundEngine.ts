import { MusicMood } from '../types/game';

interface ChordBar {
  bass: number;
  pad: number[];
  arp: number[];
  melody: Array<{ step: number; freq: number; dur: number }>;
}

interface TrackDefinition {
  bpm: number;
  stepsPerBar: number;
  padCutoff: number;
  arpTone: 'harp' | 'kalimba' | 'felt';
  bars: ChordBar[];
}

// MIDI-to-Hz helper for clean harmonic tuning
function mtof(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const TRACKS: Record<Exclude<MusicMood, 'off'>, TrackDefinition> = {
  // 1. Orman Huzuru — Ruhu Dinlendirici (D Dorian / Fmaj9, 68 BPM)
  calm: {
    bpm: 68,
    stepsPerBar: 8,
    padCutoff: 620,
    arpTone: 'harp',
    bars: [
      {
        // Dm9
        bass: mtof(38),
        pad: [mtof(50), mtof(57), mtof(60), mtof(64)],
        arp: [mtof(62), mtof(65), mtof(69), mtof(72), mtof(76), mtof(72), mtof(69), mtof(65)],
        melody: [
          { step: 0, freq: mtof(81), dur: 1.8 },
          { step: 5, freq: mtof(79), dur: 1.2 },
        ],
      },
      {
        // Bbmaj7
        bass: mtof(34),
        pad: [mtof(46), mtof(53), mtof(57), mtof(62)],
        arp: [mtof(58), mtof(62), mtof(65), mtof(69), mtof(74), mtof(69), mtof(65), mtof(62)],
        melody: [
          { step: 2, freq: mtof(77), dur: 1.6 },
          { step: 6, freq: mtof(74), dur: 1.4 },
        ],
      },
      {
        // Fmaj7
        bass: mtof(41),
        pad: [mtof(53), mtof(57), mtof(60), mtof(64)],
        arp: [mtof(60), mtof(65), mtof(69), mtof(72), mtof(76), mtof(72), mtof(69), mtof(64)],
        melody: [
          { step: 0, freq: mtof(76), dur: 1.8 },
          { step: 4, freq: mtof(77), dur: 1.5 },
        ],
      },
      {
        // Csus2 -> Am7
        bass: mtof(36),
        pad: [mtof(48), mtof(55), mtof(60), mtof(62)],
        arp: [mtof(60), mtof(62), mtof(67), mtof(72), mtof(74), mtof(72), mtof(67), mtof(64)],
        melody: [
          { step: 1, freq: mtof(79), dur: 1.5 },
          { step: 5, freq: mtof(76), dur: 1.8 },
        ],
      },
    ],
  },

  // 2. Kristal Işığı — Motive Edici & İlham Verici (F Lydian / Cmaj9, 88 BPM)
  motivating: {
    bpm: 88,
    stepsPerBar: 8,
    padCutoff: 880,
    arpTone: 'kalimba',
    bars: [
      {
        // Fmaj7(#11)
        bass: mtof(41),
        pad: [mtof(53), mtof(57), mtof(60), mtof(64)],
        arp: [mtof(65), mtof(69), mtof(72), mtof(76), mtof(79), mtof(76), mtof(72), mtof(69)],
        melody: [
          { step: 0, freq: mtof(77), dur: 1.1 },
          { step: 3, freq: mtof(81), dur: 0.9 },
          { step: 6, freq: mtof(84), dur: 1.2 },
        ],
      },
      {
        // G6
        bass: mtof(43),
        pad: [mtof(55), mtof(59), mtof(62), mtof(64)],
        arp: [mtof(67), mtof(71), mtof(74), mtof(76), mtof(79), mtof(76), mtof(74), mtof(71)],
        melody: [
          { step: 0, freq: mtof(83), dur: 1.0 },
          { step: 4, freq: mtof(81), dur: 0.9 },
          { step: 6, freq: mtof(79), dur: 1.1 },
        ],
      },
      {
        // Am9
        bass: mtof(45),
        pad: [mtof(57), mtof(60), mtof(64), mtof(67)],
        arp: [mtof(69), mtof(72), mtof(76), mtof(79), mtof(83), mtof(79), mtof(76), mtof(72)],
        melody: [
          { step: 0, freq: mtof(84), dur: 1.2 },
          { step: 3, freq: mtof(83), dur: 0.8 },
          { step: 5, freq: mtof(81), dur: 1.1 },
        ],
      },
      {
        // Cmaj9
        bass: mtof(36),
        pad: [mtof(48), mtof(55), mtof(60), mtof(62)],
        arp: [mtof(64), mtof(67), mtof(72), mtof(74), mtof(79), mtof(76), mtof(74), mtof(72)],
        melody: [
          { step: 0, freq: mtof(79), dur: 1.1 },
          { step: 2, freq: mtof(81), dur: 0.9 },
          { step: 4, freq: mtof(86), dur: 1.5 },
        ],
      },
    ],
  },

  // 3. Gece Yıldızı — Derin Odak & Keçe Piyano (A Minor9 / Fmaj7, 74 BPM)
  focus: {
    bpm: 74,
    stepsPerBar: 8,
    padCutoff: 540,
    arpTone: 'felt',
    bars: [
      {
        // Am9
        bass: mtof(45),
        pad: [mtof(52), mtof(57), mtof(60), mtof(64)],
        arp: [mtof(64), mtof(69), mtof(72), mtof(71), mtof(69), mtof(64), mtof(72), mtof(76)],
        melody: [
          { step: 1, freq: mtof(76), dur: 1.5 },
          { step: 5, freq: mtof(79), dur: 1.4 },
        ],
      },
      {
        // Dm9
        bass: mtof(38),
        pad: [mtof(50), mtof(57), mtof(60), mtof(64)],
        arp: [mtof(62), mtof(65), mtof(69), mtof(72), mtof(69), mtof(65), mtof(64), mtof(69)],
        melody: [
          { step: 0, freq: mtof(77), dur: 1.6 },
          { step: 4, freq: mtof(76), dur: 1.4 },
        ],
      },
      {
        // Fmaj7
        bass: mtof(41),
        pad: [mtof(53), mtof(57), mtof(60), mtof(64)],
        arp: [mtof(65), mtof(69), mtof(72), mtof(76), mtof(72), mtof(69), mtof(65), mtof(64)],
        melody: [
          { step: 2, freq: mtof(81), dur: 1.7 },
          { step: 6, freq: mtof(79), dur: 1.2 },
        ],
      },
      {
        // Em7
        bass: mtof(40),
        pad: [mtof(52), mtof(55), mtof(59), mtof(62)],
        arp: [mtof(64), mtof(67), mtof(71), mtof(74), mtof(71), mtof(67), mtof(64), mtof(62)],
        melody: [
          { step: 0, freq: mtof(74), dur: 1.6 },
          { step: 4, freq: mtof(76), dur: 1.6 },
        ],
      },
    ],
  },
};

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private rainGain: GainNode | null = null;

  // Music buses
  private musicGain: GainNode | null = null;
  private reverbBus: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private padFilter: BiquadFilterNode | null = null;

  private muted: boolean = false;
  private musicMood: MusicMood = 'calm';
  private initialized: boolean = false;

  private targetWind: number = 0.25;
  private targetRain: number = 0;

  // Music sequencer state
  private schedulerId: number | null = null;
  private nextStepTime: number = 0;
  private currentStep: number = 0;
  private currentBar: number = 0;

  constructor(initialMuted = false, initialMood: MusicMood = 'calm') {
    this.muted = initialMuted;
    this.musicMood = initialMood;
  }

  public unlock(): void {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.setupGraph();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().then(() => {
        if (this.ctx && this.nextStepTime < this.ctx.currentTime) {
          this.nextStepTime = this.ctx.currentTime + 0.08;
        }
      });
    }
  }

  private createNoiseBuffer(ctx: AudioContext, pink = false, seconds = 3): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    if (!pink) {
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      return buffer;
    }

    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.153852;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private createReverbImpulse(ctx: AudioContext, duration = 2.4, decay = 2.6): AudioBuffer {
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const channel = impulse.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < length; i++) {
        const env = Math.pow(1 - i / length, decay);
        // Gentle low-pass smoothing for warm acoustic tail
        const white = Math.random() * 2 - 1;
        lp = lp * 0.72 + white * 0.28;
        channel[i] = lp * env;
      }
    }
    return impulse;
  }

  private setupGraph(): void {
    if (!this.ctx || this.initialized) return;
    const ctx = this.ctx;
    this.initialized = true;

    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -16;
    this.compressor.knee.value = 18;
    this.compressor.ratio.value = 3;
    this.compressor.attack.value = 0.01;
    this.compressor.release.value = 0.25;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : 0.76;

    this.compressor.connect(this.masterGain);
    this.masterGain.connect(ctx.destination);

    // --- 1. Lush Spatial Music Bus (Dry + Reverb + Warm Echo Delay) ---
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = this.musicMood === 'off' ? 0 : 0.65;
    this.musicGain.connect(this.compressor);

    const convolver = ctx.createConvolver();
    convolver.buffer = this.createReverbImpulse(ctx, 2.5, 2.8);

    this.reverbBus = ctx.createGain();
    this.reverbBus.gain.value = 0.42;

    this.delayNode = ctx.createDelay(1.0);
    this.delayNode.delayTime.value = 0.375;
    const delayFeedback = ctx.createGain();
    delayFeedback.gain.value = 0.26;
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.value = 1450;

    this.delayNode.connect(delayFilter);
    delayFilter.connect(delayFeedback);
    delayFeedback.connect(this.delayNode);
    delayFilter.connect(this.reverbBus);

    this.reverbBus.connect(convolver);
    convolver.connect(this.musicGain);

    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.frequency.value = 640;
    this.padFilter.Q.value = 0.7;
    this.padFilter.connect(this.musicGain);
    this.padFilter.connect(this.reverbBus);

    // Subtle sub-harmonic warmth bed (low-level breathing drone)
    const subBed = ctx.createOscillator();
    const subGain = ctx.createGain();
    subBed.type = 'sine';
    subBed.frequency.value = 73.42;
    subGain.gain.value = 0.045;
    subBed.connect(subGain);
    subGain.connect(this.padFilter);
    subBed.start();

    // --- 2. Dynamic Wind Loop ---
    const pinkBuffer = this.createNoiseBuffer(ctx, true, 4);
    const windSrc = ctx.createBufferSource();
    windSrc.buffer = pinkBuffer;
    windSrc.loop = true;

    this.windFilter = ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.value = 340;
    this.windFilter.Q.value = 1.8;

    const windLfo = ctx.createOscillator();
    const windLfoGain = ctx.createGain();
    windLfo.frequency.value = 0.16;
    windLfoGain.gain.value = 90;
    windLfo.connect(windLfoGain);
    windLfoGain.connect(this.windFilter.frequency);
    windLfo.start();

    this.windGain = ctx.createGain();
    this.windGain.gain.value = 0.035;

    windSrc.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.compressor);
    windSrc.start();

    // --- 3. Dynamic Rain Loop ---
    const whiteBuffer = this.createNoiseBuffer(ctx, false, 3);
    const rainSrc = ctx.createBufferSource();
    rainSrc.buffer = whiteBuffer;
    rainSrc.loop = true;

    const rainHp = ctx.createBiquadFilter();
    rainHp.type = 'highpass';
    rainHp.frequency.value = 950;

    const rainLp = ctx.createBiquadFilter();
    rainLp.type = 'lowpass';
    rainLp.frequency.value = 4600;

    this.rainGain = ctx.createGain();
    this.rainGain.gain.value = 0;

    rainSrc.connect(rainHp);
    rainHp.connect(rainLp);
    rainLp.connect(this.rainGain);
    this.rainGain.connect(this.compressor);
    rainSrc.start();

    this.applyAtmosphere();
    this.startMusicScheduler();
  }

  private startMusicScheduler(): void {
    if (this.schedulerId !== null || !this.ctx) return;
    this.nextStepTime = this.ctx.currentTime + 0.1;

    this.schedulerId = window.setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running') return;
      if (this.muted || this.musicMood === 'off') {
        this.nextStepTime = this.ctx.currentTime + 0.12;
        return;
      }
      if (typeof document !== 'undefined' && document.hidden) {
        this.nextStepTime = this.ctx.currentTime + 0.25;
        return;
      }

      const track = TRACKS[this.musicMood];
      const stepDuration = 60 / track.bpm / 2; // eighth-note steps
      const lookahead = 0.28;

      // Guard against drift after tab sleep
      if (this.nextStepTime < this.ctx.currentTime - 0.5) {
        this.nextStepTime = this.ctx.currentTime + 0.05;
      }

      while (this.nextStepTime < this.ctx.currentTime + lookahead) {
        this.scheduleMusicStep(track, this.currentBar, this.currentStep, this.nextStepTime, stepDuration);
        this.nextStepTime += stepDuration;
        this.currentStep += 1;
        if (this.currentStep >= track.stepsPerBar) {
          this.currentStep = 0;
          this.currentBar = (this.currentBar + 1) % track.bars.length;
        }
      }
    }, 120);
  }

  private scheduleMusicStep(
    track: TrackDefinition,
    barIdx: number,
    stepIdx: number,
    time: number,
    stepDuration: number,
  ): void {
    if (!this.ctx || !this.musicGain || !this.reverbBus || !this.padFilter || !this.delayNode) return;
    const bar = track.bars[barIdx % track.bars.length];
    const barDuration = stepDuration * track.stepsPerBar;

    // 1. On bar downbeat: warm evolving string/choir pad + warm bass
    if (stepIdx === 0) {
      this.padFilter.frequency.setTargetAtTime(track.padCutoff, time, 0.35);

      // Warm sub-bass note
      this.triggerBassNote(bar.bass, time, barDuration * 0.95);

      // Lush chord pad voices
      bar.pad.forEach((freq, i) => {
        this.triggerPadVoice(freq, time, barDuration * 1.08, i);
      });
    }

    // In motivating mode, add a gentle second bass pulse on beat 3 (step 4)
    if (this.musicMood === 'motivating' && stepIdx === 4) {
      this.triggerBassNote(bar.bass * 1.5, time, stepDuration * 3.2, 0.065);
    }

    // 2. Arpeggio / Pluck pulse (Harp, Kalimba, or Felt Piano)
    const arpFreq = bar.arp[stepIdx % bar.arp.length];
    if (track.arpTone === 'kalimba') {
      // Rhythmic motivating kalimba groove
      if (stepIdx % 2 === 0 || stepIdx === 3 || stepIdx === 7) {
        const vel = stepIdx % 2 === 0 ? 0.075 : 0.045;
        this.triggerPluckNote(arpFreq, time, 0.75, vel, 'kalimba');
      }
    } else if (track.arpTone === 'harp') {
      // Flowing soothing forest harp
      if (stepIdx !== 7) {
        const vel = stepIdx === 0 ? 0.068 : 0.046;
        this.triggerPluckNote(arpFreq, time, 1.35, vel, 'harp');
      }
    } else {
      // Meditative felt-piano pattern
      if (stepIdx === 0 || stepIdx === 2 || stepIdx === 4 || stepIdx === 6) {
        this.triggerPluckNote(arpFreq, time, 1.4, 0.055, 'felt');
      }
    }

    // 3. Lyrical upper-register melody notes
    for (const note of bar.melody) {
      if (note.step === stepIdx) {
        this.triggerMelodyVoice(note.freq, time, note.dur);
      }
    }
  }

  private triggerBassNote(freq: number, time: number, dur: number, level = 0.095): void {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(level, time + 0.08);
    gain.gain.setValueAtTime(level * 0.85, time + dur * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  private triggerPadVoice(freq: number, time: number, dur: number, idx: number): void {
    if (!this.ctx || !this.padFilter) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.detune.setValueAtTime((idx - 1.5) * 5.5, time);

    const peak = 0.042;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + Math.min(1.1, dur * 0.32));
    gain.gain.setValueAtTime(peak * 0.85, time + dur * 0.65);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(gain);
    gain.connect(this.padFilter);
    osc.start(time);
    osc.stop(time + dur + 0.08);
  }

  private triggerPluckNote(
    freq: number,
    time: number,
    dur: number,
    level: number,
    tone: 'harp' | 'kalimba' | 'felt',
  ): void {
    if (!this.ctx || !this.musicGain || !this.delayNode || !this.reverbBus) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const harmonic = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const harmGain = ctx.createGain();

    osc.type = tone === 'kalimba' ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(freq * 2, time);
    harmGain.gain.setValueAtTime(tone === 'felt' ? 0.14 : 0.24, time);

    filter.type = 'lowpass';
    const startCut = tone === 'kalimba' ? 2100 : tone === 'harp' ? 1850 : 1200;
    filter.frequency.setValueAtTime(startCut, time);
    filter.frequency.exponentialRampToValueAtTime(420, time + dur * 0.85);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(level, time + (tone === 'felt' ? 0.025 : 0.01));
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter);
    harmonic.connect(harmGain);
    harmGain.connect(filter);
    filter.connect(gain);

    gain.connect(this.musicGain);
    gain.connect(this.delayNode);
    gain.connect(this.reverbBus);

    osc.start(time);
    harmonic.start(time);
    osc.stop(time + dur + 0.05);
    harmonic.stop(time + dur + 0.05);
  }

  private triggerMelodyVoice(freq: number, time: number, dur: number): void {
    if (!this.ctx || !this.musicGain || !this.reverbBus || !this.delayNode) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const overGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2, time);
    overGain.gain.value = 0.12;

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1900, time);
    filter.frequency.exponentialRampToValueAtTime(750, time + dur);

    const peak = this.musicMood === 'motivating' ? 0.058 : 0.048;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.09);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter);
    overtone.connect(overGain);
    overGain.connect(filter);
    filter.connect(gain);

    gain.connect(this.musicGain);
    gain.connect(this.reverbBus);
    gain.connect(this.delayNode);

    osc.start(time);
    overtone.start(time);
    osc.stop(time + dur + 0.06);
    overtone.stop(time + dur + 0.06);
  }

  public setMusicMood(mood: MusicMood): void {
    this.musicMood = mood;
    this.currentStep = 0;
    this.currentBar = 0;
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(mood === 'off' ? 0 : 0.65, now + 0.35);
    this.nextStepTime = now + 0.08;
  }

  public getMusicMood(): MusicMood {
    return this.musicMood;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.76, now + 0.2);
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setAtmosphere(windStrength: number, rainStrength: number): void {
    this.targetWind = Math.max(0, Math.min(1, windStrength));
    this.targetRain = Math.max(0, Math.min(1, rainStrength));
    this.applyAtmosphere();
  }

  private applyAtmosphere(): void {
    if (!this.ctx || !this.windGain || !this.windFilter || !this.rainGain) return;
    const now = this.ctx.currentTime;
    this.windGain.gain.setTargetAtTime(0.02 + this.targetWind * 0.095, now, 0.5);
    this.windFilter.frequency.setTargetAtTime(260 + this.targetWind * 420, now, 0.5);
    this.rainGain.gain.setTargetAtTime(this.targetRain * 0.11, now, 0.4);
  }

  public playThunder(intensity = 0.85): void {
    if (this.muted || !this.ctx || !this.compressor) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const crackBuf = this.createNoiseBuffer(ctx, false, 0.35);
    const crackSrc = ctx.createBufferSource();
    crackSrc.buffer = crackBuf;
    const crackFilter = ctx.createBiquadFilter();
    crackFilter.type = 'bandpass';
    crackFilter.frequency.setValueAtTime(1900, now);
    crackFilter.frequency.exponentialRampToValueAtTime(420, now + 0.25);

    const crackGain = ctx.createGain();
    crackGain.gain.setValueAtTime(0.001, now);
    crackGain.gain.linearRampToValueAtTime(0.22 * intensity, now + 0.015);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    crackSrc.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(this.compressor);
    crackSrc.start(now);

    const rumbleBuf = this.createNoiseBuffer(ctx, true, 3.2);
    const rumbleSrc = ctx.createBufferSource();
    rumbleSrc.buffer = rumbleBuf;

    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(220, now + 0.08);
    rumbleFilter.frequency.exponentialRampToValueAtTime(55, now + 2.8);

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.001, now);
    rumbleGain.gain.linearRampToValueAtTime(0.42 * intensity, now + 0.18);
    rumbleGain.gain.exponentialRampToValueAtTime(0.08 * intensity, now + 1.2);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

    rumbleSrc.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(this.compressor);
    rumbleSrc.start(now + 0.05);
  }

  public playWordPlace(): void {
    this.unlock();
    if (this.muted || !this.ctx || !this.compressor) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.06);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playWordRemove(): void {
    this.unlock();
    if (this.muted || !this.ctx || !this.compressor) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.08);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playSuccess(): void {
    this.unlock();
    if (this.muted || !this.ctx || !this.compressor) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const notes = [587.33, 739.99, 880.0, 1174.66];

    notes.forEach((freq, i) => {
      const t = now + i * 0.075;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

      osc.connect(gain);
      gain.connect(this.compressor!);
      if (this.reverbBus) gain.connect(this.reverbBus);
      osc.start(t);
      osc.stop(t + 0.58);
    });
  }

  public playCrack(): void {
    this.unlock();
    if (this.muted || !this.ctx || !this.compressor) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const buf = this.createNoiseBuffer(ctx, false, 0.22);
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const hp = ctx.createBiquadFilter();
    hp.type = 'bandpass';
    hp.frequency.setValueAtTime(3200, now);
    hp.Q.value = 2.0;

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.24, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

    src.connect(hp);
    hp.connect(nGain);
    nGain.connect(this.compressor);
    src.start(now);

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(165, now);
    osc.frequency.exponentialRampToValueAtTime(72, now + 0.35);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 380;

    oscGain.gain.setValueAtTime(0.18, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(lp);
    lp.connect(oscGain);
    oscGain.connect(this.compressor);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playLevelComplete(): void {
    this.unlock();
    if (this.muted || !this.ctx || !this.compressor) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const chord = [293.66, 440.0, 587.33, 659.25, 880.0, 1174.66];

    chord.forEach((freq, i) => {
      const t = now + i * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i < 2 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.14, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);

      osc.connect(gain);
      gain.connect(this.compressor!);
      if (this.reverbBus) gain.connect(this.reverbBus);
      osc.start(t);
      osc.stop(t + 1.15);
    });
  }

  public playGameOver(): void {
    this.unlock();
    if (this.muted || !this.ctx || !this.compressor) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const notes = [293.66, 261.63, 220.0, 146.83];

    notes.forEach((freq, i) => {
      const t = now + i * 0.22;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

      osc.connect(gain);
      gain.connect(this.compressor!);
      osc.start(t);
      osc.stop(t + 0.8);
    });
  }

  public dispose(): void {
    if (this.schedulerId !== null) {
      window.clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
    this.initialized = false;
  }
}
