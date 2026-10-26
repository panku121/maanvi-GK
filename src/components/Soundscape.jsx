import { useEffect, useState } from "react";
import { isMuted, setMuted } from "../lib/progress.js";
import { installSoundscape, startMusic, stopMusic } from "../lib/sound.js";

export default function Soundscape() {
  const [muted, setMutedState] = useState(() => isMuted());

  useEffect(() => installSoundscape(), []);

  function toggle() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (next) stopMusic();
    else startMusic();
  }

  return (
    <button
      className="music-fab"
      type="button"
      data-sound="off"
      onClick={toggle}
      aria-pressed={muted}
    >
      {muted ? "🔇 शांत" : "🎵 संगीत"}
    </button>
  );
}
