import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import { CATEGORIES, getSet } from "../data/index.js";
import {
  answerQuestion,
  coachSeen,
  finishSet,
  getProgress,
  markCoachSeen,
  moveCursor,
  subscribe,
} from "../lib/progress.js";
import { playCorrect, playReveal, playWrong, speak, stopSpeaking } from "../lib/sound.js";

const LETTERS = ["अ", "आ", "इ", "ई"];

export default function Quiz() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const set = getSet(setId);
  const progress = useSyncExternalStore(subscribe, getProgress);
  const saved = set ? progress.sets[set.id] : null;
  const cursor = saved?.cursor ?? 0;
  const answers = saved?.answers;
  const question = set?.questions[cursor];
  const current = answers?.[cursor] ?? null;
  const [phase, setPhase] = useState("idle");
  const [coach, setCoach] = useState(() => !coachSeen());
  const timer = useRef(0);
  const lock = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    if (saved?.done) navigate(`/done/${setId}`, { replace: true });
  }, [saved?.done, navigate, setId]);

  useEffect(() => {
    lock.current = Boolean(answersRef.current?.[cursor]);
    setPhase("idle");
    return () => clearTimeout(timer.current);
  }, [cursor, setId]);

  useEffect(() => () => stopSpeaking(), []);

  if (!set || !question) {
    return (
      <div className="shell narrow">
        <p className="empty">यह सेट नहीं मिला।</p>
        <Link className="primary" to="/">
          घर चलें
        </Link>
      </div>
    );
  }

  const category = CATEGORIES[set.category];
  const shown = !current ? "idle" : current.correct ? "right" : phase === "wrong" ? "wrong" : "revealed";
  const locked = shown !== "idle";
  const filled = cursor + (locked ? 1 : 0);

  function choose(option) {
    if (lock.current || shown !== "idle") return;
    lock.current = true;
    const correct = option === question.answer;
    answerQuestion(set.id, cursor, option, correct);
    if (coach) {
      markCoachSeen();
      setCoach(false);
    }
    if (correct) {
      setPhase("right");
      playCorrect();
      return;
    }
    setPhase("wrong");
    playWrong();
    timer.current = window.setTimeout(() => {
      setPhase("revealed");
      playReveal();
    }, 720);
  }

  function next() {
    if (!locked || shown === "wrong") return;
    stopSpeaking();
    clearTimeout(timer.current);
    lock.current = false;
    setPhase("idle");
    if (cursor >= set.questions.length - 1) {
      finishSet(set.id);
      navigate(`/done/${set.id}`);
      return;
    }
    moveCursor(set.id, cursor + 1);
  }

  function hear() {
    const lines = question.options.map((option, index) => `${LETTERS[index]}. ${option}`).join("। ");
    speak(`${question.q}। ${lines}`);
  }

  return (
    <div className="shell quiz-shell">
      <header className="quiz-top">
        <Link to="/" className="back">
          घर
        </Link>
        <div>
          <strong>
            <Icon value={set.emoji} /> {set.title}
          </strong>
          <small>
            सवाल {cursor + 1} / {set.questions.length}
          </small>
        </div>
        <span className="cat-pill" style={{ "--tint": category.tint, "--soft": category.soft }}>
          <Icon value={category.emoji} /> {category.label}
        </span>
      </header>

      <div className="meter quiz-meter" aria-hidden="true">
        <span style={{ width: `${(filled / set.questions.length) * 100}%`, background: category.tint }} />
      </div>

      {coach && (
        <p className="coach">गलत चुनोगी तो हल्का सा संकेत मिलेगा, और सही जवाब खुद चमक उठेगा।</p>
      )}

      <article className="question-card" style={{ "--tint": category.tint }}>
        <p className="q-kicker">सवाल {cursor + 1}</p>
        <h1>{question.q}</h1>
        <button type="button" className="speak" onClick={hear}>
          🔊 सुनो
        </button>
      </article>

      <div className="options" role="listbox" aria-label="उत्तर">
        {question.options.map((option, index) => {
          const picked = current?.choice === option;
          const isAnswer = option === question.answer;
          let state = "";
          if (shown === "wrong" && picked) state = "is-wrong";
          if ((shown === "revealed" || shown === "right") && isAnswer) state = "is-right";
          if (shown === "revealed" && picked && !isAnswer) state = "was-wrong";
          if (locked && !picked && !isAnswer) state = `${state} is-dim`.trim();
          return (
            <button
              key={option}
              type="button"
              className={`option ${state}`}
              onClick={() => choose(option)}
              disabled={locked}
            >
              <i>{LETTERS[index]}</i>
              <span>{option}</span>
              {state.includes("wrong") && <em>यह नहीं</em>}
              {state === "is-right" && <em>{shown === "right" ? "सही" : "यही सही"}</em>}
            </button>
          );
        })}
      </div>

      <div className="feedback" role="status" aria-live="polite">
        {shown === "wrong" && <p className="msg oops">ओहो, यह वाला नहीं 🙂</p>}
        {shown === "revealed" && (
          <p className="msg learn">
            सही जवाब चमक उठा ✨
            <span>{question.tip}</span>
          </p>
        )}
        {shown === "right" && (
          <p className="msg yay">
            शाबाश! यह सही है 🌟
            <span>{question.tip}</span>
          </p>
        )}
      </div>

      <button type="button" className="primary next" onClick={next} disabled={!locked || shown === "wrong"}>
        {cursor === set.questions.length - 1 ? "नतीजा देखो" : "अगला सवाल"}
      </button>
    </div>
  );
}
