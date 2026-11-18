import { totalMinutes } from "./recipes.js";

export const GROUPINGS = ["none", "tag", "language", "time"];

// Upper bounds in minutes; a recipe falls in the first it does not exceed.
export const TIME_BUCKETS = [15, 30, 60, Infinity];

// The recipe list split into labelled sections, in display order. A recipe with
// several tags shows under each; those with no tag, language or time come last.
// `label` names a group: label(by, key), where key is a tag id, a language code, a
// time bucket's bound, or null for the leftovers; a tag it cannot name is skipped.
export function groupRecipes(recipes, by, label) {
  if (by === "none") return [{ key: "all", label: "", recipes }];
  const keysOf = {
    tag: (r) => r.tags,
    language: (r) => [r.language],
    time: (r) => {
      const minutes = totalMinutes(r);
      return minutes ? [TIME_BUCKETS.find((b) => minutes <= b)] : [];
    },
  }[by];
  const groups = new Map();
  const leftovers = [];
  for (const recipe of recipes) {
    const keys = keysOf(recipe).filter((k) => label(by, k) !== undefined);
    if (!keys.length) leftovers.push(recipe);
    for (const key of keys) {
      if (!groups.has(key)) groups.set(key, { key, label: label(by, key), recipes: [] });
      groups.get(key).recipes.push(recipe);
    }
  }
  const sorted = [...groups.values()].sort(
    by === "time" ? (a, b) => a.key - b.key : (a, b) => a.label.localeCompare(b.label),
  );
  if (leftovers.length) sorted.push({ key: null, label: label(by, null), recipes: leftovers });
  return sorted;
}
