import { questionProblems } from "../src/data/q.js";
import { sets, TOTAL_QUESTIONS } from "../src/data/index.js";

const ids = new Set();
const problems = [...questionProblems];

if (sets.length < 20 || sets.length > 30) {
  problems.push(`Expected 20-30 sets, found ${sets.length}`);
}

for (const set of sets) {
  if (ids.has(set.id)) problems.push(`Duplicate id ${set.id}`);
  ids.add(set.id);
  if (set.questions.length !== 20) {
    problems.push(`${set.id} has ${set.questions.length} questions`);
  }
  set.questions.forEach((question, index) => {
    if (!question.options.includes(question.answer)) {
      problems.push(`${set.id} #${index + 1} answer missing`);
    }
  });
}

if (TOTAL_QUESTIONS !== sets.length * 20) {
  problems.push(`Total mismatch ${TOTAL_QUESTIONS}`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

console.log(`OK ${sets.length} sets, ${TOTAL_QUESTIONS} questions`);
