/**
 * All music and sound is generated in code with WebAudio (no audio files exist yet).
 * Music tracks are small generative pieces scheduled a little ahead of time; sound effects are
 * short synthesised one-shots. Real audio files can replace this later (plan.md, Audio).
 */
import { bus } from './EventBus';
import { settings } from './Settings';
import type { MusicId, SfxId } from '../data/media';

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

interface Track {
  bpm: number;
  /** Called once per beat to schedule notes starting at `t`. */
  beat(a: AudioSynth, t: number, beat: number, out: AudioNode): void;
  /** Continuous layers (wind, drones) started with the track; returns a stop function. */
  layers?(a: AudioSynth, out: AudioNode): () => void;
}

// Chord tones as MIDI notes.
const GLACIA_CHORDS = [[50, 57, 62, 64, 65], [46, 53, 57, 62, 65], [45, 53, 57, 60, 64], [48, 55, 60, 62, 67]];
const DM_PENTA = [62, 65, 67, 69, 72, 74, 77, 79, 81];
const WP_CHORDS = [[52, 59, 64, 66, 71], [48, 55, 60, 64, 71], [50, 57, 62, 66, 69], [47, 54, 59, 62, 66]];
const E_PENTA = [64, 66, 69, 71, 74, 76, 78, 81, 83];
const BATTLE_CHORDS = [[38, 50, 57, 62, 65], [34, 46, 53, 58, 62], [36, 48, 55, 60, 64], [33, 45, 52, 57, 61]];
const REST_CHORDS = [[41, 53, 57, 60, 64], [46, 53, 58, 62, 65], [43, 50, 55, 58, 62], [48, 52, 55, 60, 67]];

const TRACKS: Record<Exclude<MusicId, 'none'>, Track> = {
  title: {
    bpm: 54,
    beat(a, t, b, out) {
      const chord = GLACIA_CHORDS[Math.floor(b / 8) % 4]!;
      if (b % 8 === 0) a.pad(chord.slice(0, 4), t, (60 / 54) * 8, out, 0.05);
      if (b % 2 === 0 || Math.random() < 0.3) a.bell(DM_PENTA[(b * 3 + Math.floor(b / 8)) % DM_PENTA.length]! + 12 * (Math.random() < 0.3 ? 1 : 0), t, out, 0.045);
    },
    layers: (a, out) => a.wind(out, 0.018),
  },
  glacia: {
    bpm: 60,
    beat(a, t, b, out) {
      const chord = GLACIA_CHORDS[Math.floor(b / 8) % 4]!;
      if (b % 8 === 0) a.pad(chord, t, 8, out, 0.045);
      if (b % 8 === 0) a.bass(chord[0]! - 12, t, 7.5, out, 0.05);
      if (Math.random() < 0.35) a.bell(DM_PENTA[Math.floor(Math.random() * DM_PENTA.length)]!, t + (Math.random() < 0.5 ? 0 : 0.5), out, 0.035);
    },
    layers: (a, out) => a.wind(out, 0.03),
  },
  winter_path: {
    bpm: 66,
    beat(a, t, b, out) {
      const chord = WP_CHORDS[Math.floor(b / 8) % 4]!;
      if (b % 8 === 0) a.pad(chord, t, (60 / 66) * 8, out, 0.04);
      const arp = [0, 2, 4, 3, 1, 3, 4, 2];
      a.bell(chord[arp[b % 8]!]! + 12, t, out, 0.03, 1.6);
      if (Math.random() < 0.2) a.bell(E_PENTA[Math.floor(Math.random() * E_PENTA.length)]! + 12, t + 0.45, out, 0.022);
    },
    layers: (a, out) => a.wind(out, 0.02),
  },
  battle: {
    bpm: 132,
    beat(a, t, b, out) {
      const chord = BATTLE_CHORDS[Math.floor(b / 4) % 4]!;
      const e = 60 / 132 / 2;
      if (b % 4 === 0) a.pad(chord.slice(1), t, (60 / 132) * 4, out, 0.028, 1800);
      for (let i = 0; i < 2; i++) a.pluck(chord[0]! + (i === 1 && b % 2 ? 12 : 0), t + i * e, out, 0.09, 'sawtooth', 500);
      const arp = [1, 2, 3, 4, 3, 2];
      a.pluck(chord[arp[(b * 2) % 6]!]! + 12, t, out, 0.03, 'square', 2200);
      a.pluck(chord[arp[(b * 2 + 1) % 6]!]! + 12, t + e, out, 0.025, 'square', 2200);
      if (b % 2 === 0) a.kick(t, out, 0.35);
      else a.snare(t, out, 0.12);
      a.hat(t + e, out, 0.04);
    },
  },
  tense: {
    bpm: 72,
    beat(a, t, b, out) {
      if (b % 8 === 0) a.pad([38, 45, 51], t, (60 / 72) * 8, out, 0.05, 700);
      if (b % 2 === 0) { a.kick(t, out, 0.22); a.kick(t + 0.22, out, 0.14); }
      if (b % 8 === 6) a.bell(75, t, out, 0.02, 3);
    },
    layers: (a, out) => a.wind(out, 0.025),
  },
  rest: {
    bpm: 58,
    beat(a, t, b, out) {
      const chord = REST_CHORDS[Math.floor(b / 8) % 4]!;
      if (b % 8 === 0) a.pad(chord, t, (60 / 58) * 8, out, 0.04, 1600);
      if (b % 2 === 0) a.bell(chord[(b / 2) % 5]! + 24, t, out, 0.03, 2.5);
    },
  },
};

export class AudioSynth {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private sfxBus!: GainNode;
  private reverb!: ConvolverNode;
  private noise!: AudioBuffer;
  private current: MusicId = 'none';
  private trackGain: GainNode | null = null;
  private stopLayers: (() => void) | null = null;
  private timer: number | null = null;
  private nextBeatTime = 0;
  private beatIndex = 0;

  /** Creates or resumes the AudioContext. Must follow a user gesture (browser autoplay rules). */
  unlock(): void {
    try {
      if (!this.ctx) this.init();
      if (this.ctx?.state === 'suspended') void this.ctx.resume();
    } catch { /* audio unavailable: the game stays silent */ }
  }

  private init() {
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 3;
    this.master.connect(comp).connect(ctx.destination);
    this.musicBus = ctx.createGain();
    this.sfxBus = ctx.createGain();
    this.musicBus.connect(this.master);
    this.sfxBus.connect(this.master);
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.impulse(3.2, 2.4);
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    this.reverb.connect(wet).connect(this.master);
    this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.applyVolumes();
    bus.on('settings', ({ key }) => { if (key.endsWith('Volume')) this.applyVolumes(); });
    const pending = this.current;
    this.current = 'none';
    if (pending !== 'none') this.music(pending);
  }

  private impulse(seconds: number, decay: number): AudioBuffer {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = buf.getChannelData(c);
      for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  applyVolumes() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(settings.get('masterVolume'), t, 0.05);
    this.musicBus.gain.setTargetAtTime(settings.get('musicVolume'), t, 0.05);
    this.sfxBus.gain.setTargetAtTime(settings.get('sfxVolume'), t, 0.05);
  }

  // ---------------------------------------------------------------- music
  music(id: MusicId): void {
    if (id === this.current) return;
    this.current = id;
    if (!this.ctx) return; // starts on unlock
    const ctx = this.ctx;
    if (this.trackGain) {
      const g = this.trackGain;
      g.gain.setTargetAtTime(0, ctx.currentTime, 0.6);
      setTimeout(() => g.disconnect(), 3000);
    }
    this.stopLayers?.();
    this.stopLayers = null;
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
    if (id === 'none') { this.trackGain = null; return; }
    const track = TRACKS[id];
    const g = ctx.createGain();
    g.gain.value = 0;
    g.gain.setTargetAtTime(1, ctx.currentTime, 0.8);
    g.connect(this.musicBus);
    const send = ctx.createGain();
    send.gain.value = 0.6;
    g.connect(send).connect(this.reverb);
    this.trackGain = g;
    this.stopLayers = track.layers?.(this, g) ?? null;
    this.nextBeatTime = ctx.currentTime + 0.1;
    this.beatIndex = 0;
    const spb = 60 / track.bpm;
    this.timer = window.setInterval(() => {
      if (!this.ctx) return;
      while (this.nextBeatTime < this.ctx.currentTime + 0.35) {
        track.beat(this, this.nextBeatTime, this.beatIndex++, g);
        this.nextBeatTime += spb;
      }
    }, 60);
  }

  // ---------------------------------------------------------------- instruments
  private env(g: GainNode, t: number, a: number, peak: number, hold: number, r: number) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setValueAtTime(peak, t + a + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + r);
  }

  pad(notes: number[], t: number, dur: number, out: AudioNode, vol: number, cutoff = 1200) {
    const ctx = this.ctx!;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = cutoff;
    f.Q.value = 0.4;
    const g = ctx.createGain();
    f.connect(g).connect(out);
    this.env(g, t, Math.min(2, dur * 0.3), vol, dur * 0.5, Math.max(1.5, dur * 0.4));
    for (const n of notes) {
      for (const det of [-7, 6]) {
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = midi(n);
        o.detune.value = det;
        o.connect(f);
        o.start(t);
        o.stop(t + dur * 1.4 + 2);
      }
    }
  }

  bass(n: number, t: number, dur: number, out: AudioNode, vol: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = midi(n);
    const g = ctx.createGain();
    this.env(g, t, 0.8, vol, dur * 0.6, dur * 0.4);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 1);
  }

  bell(n: number, t: number, out: AudioNode, vol: number, decay = 2.2) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    this.env(g, t, 0.005, vol, 0, decay);
    g.connect(out);
    [1, 2.01, 3.98].forEach((mult, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = midi(n) * mult;
      const pg = ctx.createGain();
      pg.gain.value = [1, 0.35, 0.12][i]!;
      o.connect(pg).connect(g);
      o.start(t);
      o.stop(t + decay + 0.1);
    });
  }

  pluck(n: number, t: number, out: AudioNode, vol: number, type: OscillatorType, cutoff: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = midi(n);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(cutoff, t);
    f.frequency.exponentialRampToValueAtTime(cutoff * 0.25, t + 0.2);
    const g = ctx.createGain();
    this.env(g, t, 0.004, vol, 0.02, 0.18);
    o.connect(f).connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.3);
  }

  kick(t: number, out: AudioNode, vol: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.15);
    const g = ctx.createGain();
    this.env(g, t, 0.002, vol, 0.02, 0.22);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.3);
  }

  private noiseHit(t: number, out: AudioNode, vol: number, type: BiquadFilterType, freq: number, dur: number, q = 0.8) {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource();
    s.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    this.env(g, t, 0.002, vol, 0.01, dur);
    s.connect(f).connect(g).connect(out);
    s.start(t, Math.random());
    s.stop(t + dur + 0.05);
    return f;
  }

  snare(t: number, out: AudioNode, vol: number) { this.noiseHit(t, out, vol, 'bandpass', 1800, 0.14); }
  hat(t: number, out: AudioNode, vol: number) { this.noiseHit(t, out, vol, 'highpass', 7000, 0.05); }

  wind(out: AudioNode, vol: number): () => void {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource();
    s.buffer = this.noise;
    s.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 500;
    f.Q.value = 0.7;
    const g = ctx.createGain();
    g.gain.value = vol;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lg = ctx.createGain();
    lg.gain.value = 260;
    lfo.connect(lg).connect(f.frequency);
    const lfo2 = ctx.createOscillator();
    lfo2.frequency.value = 0.11;
    const lg2 = ctx.createGain();
    lg2.gain.value = vol * 0.6;
    lfo2.connect(lg2).connect(g.gain);
    s.connect(f).connect(g).connect(out);
    s.start();
    lfo.start();
    lfo2.start();
    return () => { try { s.stop(); lfo.stop(); lfo2.stop(); } catch { /* already stopped */ } };
  }

  // ---------------------------------------------------------------- sound effects
  sfx(id: SfxId, pitch = 1): void {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const ctx = this.ctx;
    const t = ctx.currentTime + 0.005;
    const out = this.sfxBus;
    const tone = (f0: number, f1: number, dur: number, vol: number, type: OscillatorType = 'sine', delay = 0) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(f0 * pitch, t + delay);
      o.frequency.exponentialRampToValueAtTime(Math.max(20, f1 * pitch), t + delay + dur);
      const g = ctx.createGain();
      this.env(g, t + delay, 0.004, vol, dur * 0.2, dur * 0.8);
      o.connect(g).connect(out);
      o.start(t + delay);
      o.stop(t + delay + dur + 0.05);
      return g;
    };
    const verb = (node: AudioNode) => { const s = ctx.createGain(); s.gain.value = 0.5; node.connect(s).connect(this.reverb); };
    switch (id) {
      case 'ui_move': tone(900, 1100, 0.05, 0.05, 'triangle'); break;
      case 'ui_ok': tone(700, 1400, 0.09, 0.07, 'triangle'); tone(1400, 1400, 0.12, 0.04, 'sine', 0.05); break;
      case 'ui_back': tone(700, 380, 0.1, 0.06, 'triangle'); break;
      case 'blip': tone(520 + Math.random() * 60, 520, 0.03, 0.018, 'triangle'); break;
      case 'jump': tone(300, 520, 0.12, 0.05, 'triangle'); this.noiseHit(t, out, 0.04, 'highpass', 3000, 0.08); break;
      case 'land': this.noiseHit(t, out, 0.07, 'lowpass', 600, 0.1); break;
      case 'dash': this.noiseHit(t, out, 0.12, 'bandpass', 1400, 0.22, 0.5).frequency.exponentialRampToValueAtTime(400, t + 0.2); break;
      case 'pickup': case 'shard': [0, 0.06, 0.12].forEach((d, i) => verb(tone(880 * [1, 1.25, 1.5][i]!, 880 * [1, 1.25, 1.5][i]!, 0.3, 0.05, 'sine', d))); break;
      case 'ability': [0, 0.1, 0.2, 0.3].forEach((d, i) => verb(tone(523 * [1, 1.25, 1.5, 2][i]!, 523 * [1, 1.25, 1.5, 2][i]!, 0.8, 0.06, 'triangle', d))); break;
      case 'save': [0, 0.15, 0.3].forEach((d, i) => verb(tone(659 * [1, 1.5, 2][i]!, 659 * [1, 1.5, 2][i]!, 1.2, 0.05, 'sine', d))); break;
      case 'hurt': tone(220, 90, 0.25, 0.12, 'sawtooth'); this.noiseHit(t, out, 0.12, 'lowpass', 900, 0.2); break;
      case 'hit': this.noiseHit(t, out, 0.2, 'lowpass', 1600, 0.12); tone(160, 60, 0.12, 0.15); break;
      case 'slash': this.noiseHit(t, out, 0.16, 'bandpass', 3000, 0.16, 1.5).frequency.exponentialRampToValueAtTime(900, t + 0.15); break;
      case 'slap': this.noiseHit(t, out, 0.3, 'highpass', 1200, 0.08); break;
      case 'guard': tone(400, 400, 0.2, 0.06, 'square'); tone(600, 600, 0.2, 0.04, 'square'); break;
      case 'heal': [0, 0.08, 0.16].forEach((d, i) => verb(tone(784 * [1, 1.26, 1.5][i]!, 784 * [1, 1.26, 1.5][i]! * 1.02, 0.6, 0.05, 'sine', d))); break;
      case 'doom': verb(tone(110, 55, 1.4, 0.18, 'sawtooth')); verb(tone(116, 58, 1.4, 0.12, 'sawtooth')); break;
      case 'absorb': verb(tone(80, 900, 0.9, 0.12, 'sawtooth')); this.noiseHit(t, out, 0.1, 'bandpass', 700, 0.8, 2); break;
      case 'light': [0, 0.03, 0.06].forEach((d, i) => verb(tone(1760 * (1 + i * 0.5), 2640 * (1 + i * 0.5), 0.5, 0.05, 'sine', d))); break;
      case 'shatter': this.noiseHit(t, out, 0.3, 'highpass', 2500, 0.4); [0, 0.04, 0.09].forEach((d) => tone(2000 + Math.random() * 2000, 1500, 0.2, 0.05, 'triangle', d)); break;
      case 'gun': this.noiseHit(t, out, 0.5, 'lowpass', 3000, 0.25); tone(120, 40, 0.2, 0.3); break;
      case 'fire': this.noiseHit(t, out, 0.25, 'lowpass', 1200, 0.5, 0.3); tone(90, 60, 0.4, 0.08, 'sawtooth'); break;
      case 'laser': verb(tone(300, 1200, 0.6, 0.12, 'sawtooth')); this.noiseHit(t, out, 0.2, 'bandpass', 2000, 0.6); break;
      case 'tick': verb(tone(2400, 2400, 0.06, 0.12, 'square')); break;
      case 'rewind': verb(tone(2400, 2400, 0.06, 0.15, 'square')); verb(tone(1200, 150, 0.7, 0.1, 'sawtooth', 0.08)); break;
      case 'dread': verb(tone(70, 60, 1.2, 0.14, 'sawtooth')); verb(tone(74, 63, 1.2, 0.1, 'sawtooth')); break;
      case 'meld': verb(tone(400, 80, 0.6, 0.1, 'sine')); break;
      case 'ink': this.noiseHit(t, out, 0.2, 'lowpass', 500, 0.35); tone(200, 70, 0.3, 0.1); break;
      case 'reform': verb(tone(70, 200, 0.6, 0.12, 'sawtooth')); break;
      case 'destroy': verb(tone(600, 60, 0.9, 0.12, 'triangle')); this.noiseHit(t, out, 0.2, 'bandpass', 900, 0.8); break;
    }
  }
}

export const audio = new AudioSynth();
