import { useMemo, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import Mascot from "../components/Mascot.jsx";
import { CATEGORIES, sets } from "../data/index.js";
import { LEVELS } from "../data/q.js";
import {
  answeredCount,
  getProgress,
  isMuted,
  localDay,
  resetAll,
  scoreOf,
  setMuted,
  starsFor,
  subscribe,
} from "../lib/progress.js";

const FILTERS = [
  { id: "all", label: "सभी", emoji: "✨" },
  ...Object.values(CATEGORIES).map((category) => ({
    id: category.id,
    label: category.label,
    emoji: category.emoji,
  })),
];

export default function Home() {
  const progress = useSyncExternalStore(subscribe, getProgress);
  const [filter, setFilter] = useState("all");
  const [muted, setMutedState] = useState(() => isMuted());
  const groups = useMemo(() => {
    return Object.values(CATEGORIES)
      .filter((category) => filter === "all" || filter === category.id)
      .map((category) => ({
        ...category,
        items: sets.filter((set) => set.category === category.id),
      }));
  }, [filter]);

  const cards = sets.map((set) => ({
    set,
    saved: progress.sets[set.id],
  }));
  const done = cards.filter((card) => card.saved?.done).length;
  const partial = cards.filter((card) => {
    const count = card.saved ? answeredCount(card.saved) : 0;
    return count > 0 && !card.saved?.done;
  }).length;
  const fresh = sets.length - done - partial;
  const seen = cards.reduce((sum, card) => sum + (card.saved ? answeredCount(card.saved) : 0), 0);
  const resume = cards
    .filter((card) => card.saved && !card.saved.done && answeredCount(card.saved) > 0)
    .sort((a, b) => b.saved.updatedAt - a.saved.updatedAt)[0];
  const recall = recallCard(progress);
  const streakOn = progress.streak.lastDay === localDay();

  function toggleSound() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  }

  function wipe() {
    const ok = window.confirm("सारी प्रगति मिटा दें? सेट फिर से नए जैसे हो जाएँगे।");
    if (ok) resetAll();
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-badge">🦉</span>
          <div>
            <strong>मानवी GK</strong>
            <small>कक्षा 1 से 4</small>
          </div>
        </div>
        <button className="icon-btn" type="button" onClick={toggleSound} aria-pressed={muted}>
          {muted ? "🔇 आवाज़ बंद" : "🔊 आवाज़ चालू"}
        </button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">खेलो · सीखो · याद रखो</p>
          <h1>नमस्ते मानवी!</h1>
          <p>
            25 सेट, हर सेट में 20 सवाल। भारत, उत्तर प्रदेश, बिहार और रोज़ की जान-पहचान।
            गलत चुना तो घबराना नहीं — सही जवाब खुद चमक उठेगा।
          </p>
        </div>
        <Mascot mood={done > 0 ? "cheer" : "happy"} />
      </section>

      <section className="stat-row" aria-label="प्रगति">
        <Stat value={sets.length} label="सवाल सेट" tint="#FF8A3D" />
        <Stat value={done} label="पूरे हो गए" tint="#1FA971" />
        <Stat value={partial} label="बीच में छोड़े" tint="#F2547D" />
        <Stat value={fresh} label="अभी बाकी" tint="#1AA7E0" />
      </section>

      <section className="overall">
        <div>
          <strong>{seen}</strong>
          <span> / 500 सवाल खेले</span>
        </div>
        <div className="meter big">
          <span style={{ width: `${(seen / 500) * 100}%` }} />
        </div>
        <p>
          {streakOn
            ? `🔥 ${progress.streak.count} दिन की लकीर जारी है`
            : "आज एक सेट छू लोगे तो लकीर शुरू हो जाएगी"}
        </p>
      </section>

      {resume && (
        <Link className="resume" to={`/play/${resume.set.id}`}>
          <span>
            <small>बीच में छूटा हुआ</small>
            <strong>
              <Icon value={resume.set.emoji} /> {resume.set.title}
            </strong>
            <em>
              {answeredCount(resume.saved)}/20 हो चुके · {20 - answeredCount(resume.saved)} बचे
            </em>
          </span>
          <b>आगे बढ़ो</b>
        </Link>
      )}

      {recall && (
        <aside className="recall">
          <p>आज फिर याद करो</p>
          <strong>{recall.q}</strong>
          <span>{recall.tip}</span>
        </aside>
      )}

      <div className="filters" role="tablist" aria-label="विषय">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={filter === item.id ? "chip on" : "chip"}
            onClick={() => setFilter(item.id)}
          >
            <Icon value={item.emoji} /> {item.label}
          </button>
        ))}
      </div>

      {groups.map((group) => (
        <section key={group.id} className="group">
          <header className="group-head">
            <h2>
              <Icon value={group.emoji} /> {group.title}
            </h2>
            <p>{group.note}</p>
          </header>
          <div className="grid">
            {group.items.map((set) => (
              <SetCard key={set.id} set={set} saved={progress.sets[set.id]} tint={group.tint} soft={group.soft} />
            ))}
          </div>
        </section>
      ))}

      <footer className="foot">
        <p>नेताओं और पदों के नाम अक्टूबर 2026 तक के हैं। पद बदलें तो घर पर बता देना।</p>
        <button type="button" onClick={wipe}>
          सारी प्रगति मिटाएँ
        </button>
      </footer>
    </div>
  );
}

function Stat({ value, label, tint }) {
  return (
    <article className="stat" style={{ "--tint": tint }}>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function SetCard({ set, saved, tint, soft }) {
  const count = saved ? answeredCount(saved) : 0;
  const done = Boolean(saved?.done);
  const score = saved ? scoreOf(saved) : 0;
  const stars = done ? starsFor(score) : 0;
  const left = 20 - count;
  const level = LEVELS[set.level];
  const href = done ? `/done/${set.id}` : `/play/${set.id}`;
  let status = "शुरू करें";
  if (done) status = "फिर देखो";
  else if (count === 20) status = "नतीजा देखो";
  else if (count > 0) status = "आगे बढ़ो";

  return (
    <Link className={`card ${done ? "done" : ""} ${count > 0 && !done ? "midway" : ""}`} to={href} style={{ "--tint": tint, "--soft": soft }}>
      <div className="card-top">
        <span className="blob"><Icon value={set.emoji} /></span>
        <span className="num">सेट {String(set.number).padStart(2, "0")}</span>
      </div>
      <h3>{set.title}</h3>
      <p>{set.blurb}</p>
      <div className="meta">
        <span className={`pill ${set.level}`}>
          {level.emoji} {level.label}
        </span>
        <span className="time">करीब 10 मिनट</span>
      </div>
      <div className="meter">
        <span style={{ width: `${(count / 20) * 100}%` }} />
      </div>
      <div className="card-foot">
        {done ? (
          <em>
            {"★".repeat(stars)}
            {"☆".repeat(3 - stars)} {score}/20 सही
          </em>
        ) : count > 0 ? (
          <em>
            {count}/20 · {left} बचे
          </em>
        ) : (
          <em>अभी शुरू नहीं हुआ</em>
        )}
        <b>{status}</b>
      </div>
    </Link>
  );
}

function recallCard(progress) {
  const missed = [];
  sets.forEach((set) => {
    const saved = progress.sets[set.id];
    if (!saved) return;
    saved.answers.forEach((answer, index) => {
      if (answer && !answer.correct) missed.push(set.questions[index]);
    });
  });
  if (!missed.length) return null;
  let seed = 0;
  for (const char of localDay()) seed = (seed * 33 + char.charCodeAt(0)) >>> 0;
  return missed[seed % missed.length];
}
