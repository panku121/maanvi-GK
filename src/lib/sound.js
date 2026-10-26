import { isMuted } from "./progress.js";

let context;
let musicGain;
let effectGain;
let running = false;
let timer = 0;
let origin = 0;
let cursor = 0;
const musicNodes = new Set();

const LOOP = 8;
const TUNE = [
  { t: 0.0, f: 523.25, d: 0.34, v: 0.09 },
  { t: 0.45, f: 587.33, d: 0.22, v: 0.07 },
  { t: 0.9, f: 659.25, d: 0.32, v: 0.085 },
  { t: 1.4, f: 523.25, d: 0.26, v: 0.07 },
  { t: 1.9, f: 783.99, d: 0.42, v: 0.09 },
  { t: 2.5, f: 659.25, d: 0.24, v: 0.065 },
  { t: 2.95, f: 587.33, d: 0.36, v: 0.075 },
  { t: 3.55, f: 392.0, d: 0.42, v: 0.06, type: "triangle" },
  { t: 4.15, f: 440.0, d: 0.26, v: 0.07 },
  { t: 4.6, f: 523.25, d: 0.28, v: 0.08 },
  { t: 5.15, f: 659.25, d: 0.36, v: 0.085 },
  { t: 5.7, f: 587.33, d: 0.24, v: 0.065 },
  { t: 6.15, f: 783.99, d: 0.34, v: 0.09 },
  { t: 6.7, f: 659.25, d: 0.46, v: 0.075 },
  { t: 7.35, f: 523.25, d: 0.42, v: 0.06 },
  { t: 0.0, f: 130.81, d: 0.9, v: 0.045, type: "triangle" },
  { t: 2.0, f: 196.0, d: 0.7, v: 0.04, type: "triangle" },
  { t: 4.0, f: 164.81, d: 0.9, v: 0.045, type: "triangle" },
  { t: 6.0, f: 174.61, d: 0.8, v: 0.04, type: "triangle" },
];

function audioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!context) context = new Ctx();
  if (context.state === "suspended") context.resume();
  if (!musicGain) {
    musicGain = context.createGain();
    musicGain.gain.value = 0.85;
    musicGain.connect(context.destination);
    effectGain = context.createGain();
    effectGain.gain.value = 1;
    effectGain.connect(context.destination);
  }
  return context;
}

function tone(when, freq, dur, volume, type, bus, bucket) {
  const ctx = audioContext();
  if (!ctx || !bus) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0002), when + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(gain);
  gain.connect(bus);
  osc.start(when);
  osc.stop(when + dur + 0.03);
  if (bucket) bucket.add(osc);
  osc.onended = () => {
    bucket?.delete(osc);
    osc.disconnect();
    gain.disconnect();
  };
  return osc;
}

function effect(steps) {
  if (isMuted()) return;
  const ctx = audioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  steps.forEach((step) => {
    const osc = tone(now + step.at, step.freq, step.len, step.volume, step.type || "sine", effectGain);
    if (step.slide && osc) {
      osc.frequency.exponentialRampToValueAtTime(step.slide, now + step.at + step.len);
    }
  });
}

function tick() {
  if (!running) return;
  const ctx = audioContext();
  if (!ctx || isMuted()) {
    stopMusic();
    return;
  }
  const horizon = ctx.currentTime + 0.45;
  while (cursor < 4000) {
    const note = TUNE[cursor % TUNE.length];
    const cycle = Math.floor(cursor / TUNE.length);
    const when = origin + cycle * LOOP + note.t;
    if (when > horizon) break;
    if (when > ctx.currentTime - 0.03) {
      tone(when, note.f, note.d, note.v, note.type || "sine", musicGain, musicNodes);
    }
    cursor += 1;
  }
  timer = window.setTimeout(tick, 180);
}

export function startMusic() {
  if (isMuted() || running) return;
  const ctx = audioContext();
  if (!ctx) return;
  running = true;
  origin = ctx.currentTime + 0.06;
  cursor = 0;
  tick();
}

export function stopMusic() {
  running = false;
  window.clearTimeout(timer);
  musicNodes.forEach((osc) => {
    try {
      osc.stop();
    } catch {
      /* already stopped */
    }
  });
  musicNodes.clear();
}

export function duckMusic(amount) {
  const ctx = audioContext();
  if (!ctx || !musicGain) return;
  musicGain.gain.cancelScheduledValues(ctx.currentTime);
  musicGain.gain.linearRampToValueAtTime(amount, ctx.currentTime + 0.08);
}

export function playHover() {
  effect([{ freq: 988, at: 0, len: 0.05, volume: 0.03 }]);
}

export function playTap() {
  effect([
    { freq: 620, at: 0, len: 0.06, volume: 0.05 },
    { freq: 830, at: 0.04, len: 0.07, volume: 0.04 },
  ]);
}

export function playTing() {
  effect([
    { freq: 740, at: 0, len: 0.07, volume: 0.07, type: "triangle" },
    { freq: 1175, at: 0.03, len: 0.12, volume: 0.06 },
  ]);
}

export function playCorrect() {
  effect([
    { freq: 523, at: 0, len: 0.12, volume: 0.07 },
    { freq: 659, at: 0.09, len: 0.12, volume: 0.07 },
    { freq: 784, at: 0.18, len: 0.14, volume: 0.075 },
    { freq: 1047, at: 0.3, len: 0.22, volume: 0.07 },
  ]);
}

export function playWrong() {
  effect([
    { freq: 392, at: 0, len: 0.16, volume: 0.06, type: "triangle", slide: 240 },
    { freq: 262, at: 0.14, len: 0.2, volume: 0.05, type: "triangle" },
  ]);
}

export function playReveal() {
  effect([
    { freq: 880, at: 0, len: 0.08, volume: 0.05 },
    { freq: 1175, at: 0.07, len: 0.14, volume: 0.06 },
  ]);
}

export function playNext() {
  effect([{ freq: 494, at: 0, len: 0.1, volume: 0.05, type: "triangle", slide: 784 }]);
}

export function playCheer() {
  effect([
    { freq: 523, at: 0, len: 0.14, volume: 0.07 },
    { freq: 659, at: 0.12, len: 0.14, volume: 0.07 },
    { freq: 784, at: 0.24, len: 0.14, volume: 0.075 },
    { freq: 1047, at: 0.36, len: 0.28, volume: 0.08 },
  ]);
}

export function speak(text) {
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "hi-IN";
  utter.rate = 0.92;
  utter.onstart = () => duckMusic(0.2);
  utter.onend = () => duckMusic(0.85);
  utter.onerror = () => duckMusic(0.85);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
  duckMusic(0.85);
}

let hoverAt = 0;
let hoverEl = null;
let armed = false;

export function installSoundscape() {
  function arm() {
    armed = true;
    audioContext();
    if (!isMuted()) startMusic();
  }

  function onDown(event) {
    arm();
    const el = event.target.closest?.("[data-sound], button, a");
    if (!el || el.dataset.sound === "off") return;
    if (el.dataset.sound === "pick") {
      playTing();
      return;
    }
    if (el.dataset.sound === "next") {
      playNext();
      return;
    }
    if (el.matches("button, a")) playTap();
  }

  function onOver(event) {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = event.target.closest?.("button, a");
    if (!el || el === hoverEl || el.dataset.sound === "off") return;
    const now = performance.now();
    if (now - hoverAt < 80) return;
    hoverAt = now;
    hoverEl = el;
    if (!armed) return;
    playHover();
  }

  document.addEventListener("pointerdown", onDown, true);
  document.addEventListener("pointerover", onOver, true);
  return () => {
    document.removeEventListener("pointerdown", onDown, true);
    document.removeEventListener("pointerover", onOver, true);
    stopMusic();
  };
}
