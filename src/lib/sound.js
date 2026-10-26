import { isMuted } from "./progress.js";

let context;

function audioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!context) context = new Ctx();
  if (context.state === "suspended") context.resume();
  return context;
}

function beep(steps) {
  if (isMuted()) return;
  const ctx = audioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  steps.forEach((step, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(step.freq, now + step.at);
    gain.gain.setValueAtTime(0.0001, now + step.at);
    gain.gain.exponentialRampToValueAtTime(step.volume, now + step.at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + step.at + step.len);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + step.at);
    osc.stop(now + step.at + step.len + 0.02);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    void index;
  });
}

export function playCorrect() {
  beep([
    { freq: 523, at: 0, len: 0.12, volume: 0.05 },
    { freq: 659, at: 0.1, len: 0.12, volume: 0.05 },
    { freq: 784, at: 0.2, len: 0.18, volume: 0.06 },
  ]);
}

export function playWrong() {
  beep([
    { freq: 247, at: 0, len: 0.14, volume: 0.035 },
    { freq: 196, at: 0.12, len: 0.16, volume: 0.03 },
  ]);
}

export function playReveal() {
  beep([
    { freq: 392, at: 0, len: 0.1, volume: 0.04 },
    { freq: 523, at: 0.09, len: 0.16, volume: 0.05 },
  ]);
}

export function speak(text) {
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "hi-IN";
  utter.rate = 0.92;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}
