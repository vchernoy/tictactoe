type OscillatorType = OscillatorNode['type'];

let audioContext: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') {
    void audioContext.resume();
  }
  return audioContext;
}

function playTone(
  frequency: number,
  duration: number,
  options: {
    type?: OscillatorType;
    gain?: number;
    attack?: number;
    release?: number;
    detune?: number;
  } = {},
): void {
  const ctx = getContext();
  const now = ctx.currentTime;
  const {
    type = 'sine',
    gain = 0.08,
    attack = 0.01,
    release = 0.06,
    detune = 0,
  } = options;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  if (detune) osc.detune.setValueAtTime(detune, now);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(gain, now + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration + release);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + release + 0.05);
}

function playChord(
  frequencies: number[],
  duration: number,
  gain = 0.05,
): void {
  frequencies.forEach((freq, i) => {
    playTone(freq, duration, {
      gain: gain / frequencies.length,
      attack: 0.02,
      release: 0.12,
      detune: i * 3,
    });
  });
}

/** Short subtle tap when a mark is placed */
export function playPlaceSound(): void {
  playTone(520, 0.04, { type: 'triangle', gain: 0.06, attack: 0.005, release: 0.03 });
  playTone(780, 0.03, { type: 'sine', gain: 0.03, attack: 0.005, release: 0.02 });
}

/** Pleasant short fanfare when someone wins */
export function playWinSound(misere = false): void {
  if (misere) {
    playChord([392, 494, 587], 0.18, 0.045);
    playTone(740, 0.12, { gain: 0.04, attack: 0.02, release: 0.1 });
    return;
  }
  playChord([523.25, 659.25, 783.99], 0.22, 0.055);
  playTone(1046.5, 0.14, { gain: 0.035, attack: 0.02, release: 0.12 });
}

/** Softer neutral tone on draw */
export function playDrawSound(): void {
  playTone(440, 0.2, { type: 'sine', gain: 0.05, attack: 0.03, release: 0.15 });
  playTone(370, 0.18, { type: 'sine', gain: 0.035, attack: 0.05, release: 0.12 });
}

/** Soft whoosh/fade when oldest mark expires (Limited mode) */
export function playExpireSound(): void {
  const ctx = getContext();
  const now = ctx.currentTime;
  const duration = 0.28;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(280, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + duration);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.045, now + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.08);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.1);
}
