import { awarenessSets } from "./awareness.js";
import { bharatSets } from "./bharat.js";
import { biharSets } from "./bihar.js";
import { CATEGORIES } from "./q.js";
import { mixSets } from "./mix.js";
import { upSets } from "./up.js";

export const sets = [
  ...bharatSets,
  ...upSets,
  ...biharSets,
  ...awarenessSets,
  ...mixSets,
].map((set, index) => ({ ...set, number: index + 1 }));

export function getSet(id) {
  return sets.find((set) => set.id === id) ?? null;
}

export { CATEGORIES };

export const TOTAL_QUESTIONS = sets.reduce((sum, set) => sum + set.questions.length, 0);
