interface WindowWithWebkit extends Window {
  webkitAudioContext?: typeof AudioContext;
}

const AudioCtx = (window as WindowWithWebkit).AudioContext || (window as WindowWithWebkit).webkitAudioContext;
const ctx = new AudioCtx!();

function playTone(
  freq: number,
  type: OscillatorType,
  duration: number,
  vol = 0.3,
  freqEnd?: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);
  }
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function playJump() {
  playTone(300, 'sine', 0.15, 0.25, 700);
  setTimeout(() => playTone(500, 'sine', 0.1, 0.15, 900), 80);
}

export function playDeath() {
  playTone(400, 'sawtooth', 0.08, 0.3, 200);
  setTimeout(() => playTone(200, 'sawtooth', 0.12, 0.35, 80), 100);
  setTimeout(() => playTone(100, 'square', 0.2, 0.4, 50), 250);
  setTimeout(() => playTone(50, 'sawtooth', 0.25, 0.3, 30), 450);
}

export function playVictory() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((n, i) => {
    setTimeout(() => playTone(n, 'sine', 0.25, 0.3), i * 120);
  });
  setTimeout(() => {
    playTone(1047, 'sine', 0.5, 0.35, 1200);
  }, 520);
}

export function playClick() {
  playTone(600, 'square', 0.06, 0.15, 400);
}

export function playSelect() {
  playTone(800, 'sine', 0.08, 0.12, 1000);
}

export function resumeAudio() {
  if (ctx.state === 'suspended') ctx.resume();
}
