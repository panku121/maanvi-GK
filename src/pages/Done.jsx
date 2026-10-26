import { Link, useNavigate, useParams } from "react-router-dom";
import { useSyncExternalStore } from "react";
import Icon from "../components/Icon.jsx";
import Mascot from "../components/Mascot.jsx";
import { getSet } from "../data/index.js";
import { getProgress, resetSet, scoreOf, starsFor, subscribe } from "../lib/progress.js";

export default function Done() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const set = getSet(setId);
  const progress = useSyncExternalStore(subscribe, getProgress);
  const saved = set ? progress.sets[set.id] : null;

  if (!set || !saved?.done) {
    return (
      <div className="shell narrow">
        <p className="empty">यह नतीजा अभी तैयार नहीं है।</p>
        <Link className="primary" to={set ? `/play/${set.id}` : "/"}>
          {set ? "सेट खेलो" : "घर चलें"}
        </Link>
      </div>
    );
  }

  const score = scoreOf(saved);
  const stars = starsFor(score);
  const missed = set.questions
    .map((question, index) => ({ question, answer: saved.answers[index] }))
    .filter((item) => !item.answer?.correct);

  const headline =
    stars === 3
      ? "क्या बात है, मानवी!"
      : stars === 2
        ? "बहुत अच्छा खेला!"
        : "कोशिश कमाल की!";
  const note =
    stars === 3
      ? "ज्ञानू नाच रहा है। ये बातें अब तुम्हारे साथ हैं।"
      : stars === 2
        ? "थोड़ी और याद करोगी तो अगली बार तीन स्टार पक्के हैं।"
        : "गलत वाली बातें नीचे पढ़ लो। अगली बार और चमकेंगी।";

  function replay() {
    resetSet(set.id);
    navigate(`/play/${set.id}`);
  }

  return (
    <div className="shell narrow done-shell">
      {stars >= 2 && <Confetti />}
      <Mascot mood={stars === 1 ? "happy" : "cheer"} />
      <p className="eyebrow">
        <Icon value={set.emoji} /> {set.title}
      </p>
      <h1>{headline}</h1>
      <p className="lead">{note}</p>
      <div className="score-badge" aria-label={`${score} में से 20 सही`}>
        <strong>{score}</strong>
        <span>/ 20 सही</span>
      </div>
      <p className="stars" aria-label={`${stars} स्टार`}>
        {Array.from({ length: 3 }, (_, index) => (
          <span key={index} className={index < stars ? "on" : ""}>
            ★
          </span>
        ))}
      </p>
      <section className="missed">
        <h2>{missed.length ? "याद करने वाली बातें" : "सब याद हो गया!"}</h2>
        {missed.length === 0 && <p>इस सेट का एक भी सवाल खाली नहीं रहा।</p>}
        <ul>
          {missed.map((item) => (
            <li key={item.question.q}>
              <strong>{item.question.q}</strong>
              <span>सही: {item.question.answer}</span>
              <em>{item.question.tip}</em>
            </li>
          ))}
        </ul>
      </section>
      <div className="done-actions">
        <button type="button" className="primary" onClick={replay}>
          दोबारा खेलो
        </button>
        <Link className="ghost" to="/">
          सभी सेट देखो
        </Link>
      </div>
    </div>
  );
}

function Confetti() {
  const colors = ["#FF8A3D", "#FFC83D", "#F2547D", "#1FA971", "#1AA7E0", "#7C6BF2"];
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 18 }, (_, index) => (
        <i
          key={index}
          style={{
            "--x": `${(index * 53) % 100}%`,
            "--d": `${index * 0.08}s`,
            "--c": colors[index % colors.length],
            "--r": `${(index % 5) * 18}deg`,
          }}
        />
      ))}
    </div>
  );
}
