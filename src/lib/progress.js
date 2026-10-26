const KEY = "maanvi-gk-v1";
const listeners = new Set();

export const EMPTY_PROGRESS = {
  sets: {},
  streak: { count: 0, lastDay: "" },
};

let cache = EMPTY_PROGRESS;
let raw = "";

function blankAnswers() {
  return Array.from({ length: 20 }, () => null);
}

export function blankSetProgress() {
  return {
    answers: blankAnswers(),
    cursor: 0,
    done: false,
    updatedAt: 0,
  };
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readStorage() {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function getProgress() {
  const next = readStorage();
  if (next === raw) return cache;
  raw = next;
  if (!next) {
    cache = EMPTY_PROGRESS;
    return cache;
  }
  try {
    const parsed = JSON.parse(next);
    cache = {
      sets: parsed.sets && typeof parsed.sets === "object" ? parsed.sets : {},
      streak: {
        count: parsed.streak?.count ?? 0,
        lastDay: parsed.streak?.lastDay ?? "",
      },
    };
  } catch {
    cache = EMPTY_PROGRESS;
  }
  return cache;
}

function write(next) {
  cache = next;
  raw = JSON.stringify(next);
  try {
    localStorage.setItem(KEY, raw);
  } catch {
    /* private mode */
  }
  emit();
}

function clone(data) {
  return {
    streak: { ...data.streak },
    sets: Object.fromEntries(
      Object.entries(data.sets).map(([id, value]) => [
        id,
        { ...value, answers: [...value.answers] },
      ]),
    ),
  };
}

export function localDay(date = new Date()) {
  const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return copy.toISOString().slice(0, 10);
}

function previousDay(day) {
  const [year, month, date] = day.split("-").map(Number);
  const value = new Date(year, month - 1, date);
  value.setDate(value.getDate() - 1);
  return localDay(value);
}

function touchStreak(data) {
  const today = localDay();
  if (data.streak.lastDay === today) return;
  const count = data.streak.lastDay === previousDay(today) ? data.streak.count + 1 : 1;
  data.streak = { count, lastDay: today };
}

export function getSetProgress(setId) {
  return getProgress().sets[setId] ?? blankSetProgress();
}

export function answeredCount(progress) {
  return progress.answers.filter(Boolean).length;
}

export function scoreOf(progress) {
  return progress.answers.filter((item) => item?.correct).length;
}

export function starsFor(score) {
  if (score >= 17) return 3;
  if (score >= 12) return 2;
  return 1;
}

export function answerQuestion(setId, index, choice, correct) {
  const data = clone(getProgress());
  const current = data.sets[setId]
    ? { ...data.sets[setId], answers: [...data.sets[setId].answers] }
    : blankSetProgress();
  if (!current.answers[index]) {
    current.answers[index] = { choice, correct };
  }
  current.updatedAt = Date.now();
  data.sets[setId] = current;
  touchStreak(data);
  write(data);
}

export function moveCursor(setId, cursor) {
  const data = clone(getProgress());
  const current = data.sets[setId]
    ? { ...data.sets[setId], answers: [...data.sets[setId].answers] }
    : blankSetProgress();
  current.cursor = cursor;
  current.updatedAt = Date.now();
  data.sets[setId] = current;
  write(data);
}

export function finishSet(setId) {
  const data = clone(getProgress());
  const current = data.sets[setId]
    ? { ...data.sets[setId], answers: [...data.sets[setId].answers] }
    : blankSetProgress();
  current.done = true;
  current.cursor = 20;
  current.updatedAt = Date.now();
  data.sets[setId] = current;
  touchStreak(data);
  write(data);
}

export function resetSet(setId) {
  const data = clone(getProgress());
  delete data.sets[setId];
  write(data);
}

export function resetAll() {
  write({
    sets: {},
    streak: { count: 0, lastDay: "" },
  });
}

export function isMuted() {
  try {
    return localStorage.getItem("maanvi-gk-muted") === "1";
  } catch {
    return false;
  }
}

export function setMuted(value) {
  try {
    localStorage.setItem("maanvi-gk-muted", value ? "1" : "0");
  } catch {
    /* ignore */
  }
  emit();
}

export function coachSeen() {
  try {
    return localStorage.getItem("maanvi-gk-coach") === "1";
  } catch {
    return false;
  }
}

export function markCoachSeen() {
  try {
    localStorage.setItem("maanvi-gk-coach", "1");
  } catch {
    /* ignore */
  }
}
