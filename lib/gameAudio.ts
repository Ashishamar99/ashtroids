/**
 * Procedural game audio using Web Audio API.
 * No audio files — all sounds generated from oscillators and noise.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

function whiteNoise(ac: AudioContext, duration: number): AudioBufferSourceNode {
  const bufferSize = ac.sampleRate * duration;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ac.createBufferSource();
  source.buffer = buffer;
  return source;
}

export function playShoot() {
  const ac = getCtx();
  const now = ac.currentTime;

  const noise = whiteNoise(ac, 0.08);
  const filter = ac.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(3000, now);
  filter.frequency.exponentialRampToValueAtTime(8000, now + 0.05);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  noise.connect(filter).connect(gain).connect(ac.destination);
  noise.start(now);
  noise.stop(now + 0.08);
}

export function playHitNormal() {
  const ac = getCtx();
  const now = ac.currentTime;

  // Low rumble
  const osc = ac.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(80, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

  const oscGain = ac.createGain();
  oscGain.gain.setValueAtTime(0.2, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.connect(oscGain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.2);

  // Noise crumble
  const noise = whiteNoise(ac, 0.15);
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(400, now);
  filter.Q.setValueAtTime(2, now);

  const nGain = ac.createGain();
  nGain.gain.setValueAtTime(0.12, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  noise.connect(filter).connect(nGain).connect(ac.destination);
  noise.start(now);
  noise.stop(now + 0.15);
}

export function playHitBonus() {
  const ac = getCtx();
  const now = ac.currentTime;

  // High ping
  const osc = ac.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(2400, now + 0.1);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.3);

  // Shimmer overtone
  const osc2 = ac.createOscillator();
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(3600, now);
  osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.25);

  const gain2 = ac.createGain();
  gain2.gain.setValueAtTime(0.06, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc2.connect(gain2).connect(ac.destination);
  osc2.start(now);
  osc2.stop(now + 0.25);
}

let thrustOsc: OscillatorNode | null = null;
let thrustGain: GainNode | null = null;

export function startThrust() {
  if (thrustOsc) return;
  const ac = getCtx();

  thrustOsc = ac.createOscillator();
  thrustOsc.type = "sawtooth";
  thrustOsc.frequency.setValueAtTime(45, ac.currentTime);

  thrustGain = ac.createGain();
  thrustGain.gain.setValueAtTime(0.04, ac.currentTime);

  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(200, ac.currentTime);

  thrustOsc.connect(filter).connect(thrustGain).connect(ac.destination);
  thrustOsc.start();
}

export function stopThrust() {
  if (thrustOsc && thrustGain) {
    const ac = getCtx();
    thrustGain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.1);
    thrustOsc.stop(ac.currentTime + 0.1);
    thrustOsc = null;
    thrustGain = null;
  }
}
