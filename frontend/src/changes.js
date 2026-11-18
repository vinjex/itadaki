import { diffArrays, diffWords } from "diff";

// Below this share of unchanged text, a word diff is mostly noise: the text is shown
// as it was instead.
const KEPT_ENOUGH = 0.4;

// `before` and `after` word by word, as [{value, added, removed}]; null when they are
// equal. `rewritten` is set when little of `before` is left. Japanese has no spaces,
// so words come from the browser's dictionary-based splitter for `language`.
export function wordDiff(before, after, language) {
  before ??= "";
  after ??= "";
  if (before === after) return null;
  const parts = diffWords(before, after, { intlSegmenter: new Intl.Segmenter(language, { granularity: "word" }) });
  const kept = parts.filter((p) => !p.added && !p.removed).reduce((n, p) => n + p.value.trim().length, 0);
  const longest = Math.max(before.trim().length, after.trim().length);
  return { parts, rewritten: kept / longest < KEPT_ENOUGH };
}

// Lines up two versions of a list. `same(a, b)` says an item is unchanged. An item
// gone from one place and back unchanged in another was moved. Between unchanged
// ones, the other removed and added items pair up as one changed item, those that
// are `related` first, else in order. Returns `after` (per item of `after`: status
// "same", "moved", "changed" or "added", with its `before` item and index if any)
// and `removed` (items of `before` left out, each with `at`: how many `after` items
// precede the place it was).
export function alignLists(before, after, same, related = () => true) {
  const runs = diffArrays(before, after, { comparator: same });
  // Each run with the indexes its items had, before and after.
  let b = 0;
  let a = 0;
  const indexed = runs.map((run) => ({
    run,
    from: run.added ? b : (b += run.value.length) - run.value.length,
    to: run.removed ? a : (a += run.value.length) - run.value.length,
  }));
  const gone = indexed.filter((x) => x.run.removed).flatMap((x) => x.run.value.map((item, k) => ({ item, index: x.from + k })));
  const movedFrom = new Map();
  for (const x of indexed.filter((x) => x.run.added)) {
    x.run.value.forEach((item, k) => {
      const match = gone.find((g) => !g.taken && same(g.item, item));
      if (match) [match.taken, match.moved] = [true, true];
      if (match) movedFrom.set(x.to + k, match);
    });
  }

  const result = { after: [], removed: [] };
  for (let i = 0; i < indexed.length; i++) {
    const { run, from, to } = indexed[i];
    if (!run.added && !run.removed) {
      run.value.forEach((_, k) => result.after.push({ status: "same", before: before[from + k], beforeIndex: from + k }));
      continue;
    }
    const left = run.removed ? gone.filter((g) => !g.moved && g.index >= from && g.index < from + run.value.length) : [];
    const next = run.removed && indexed[i + 1]?.run.added ? indexed[++i] : run.added ? indexed[i] : null;
    const startAt = result.after.length;
    const placed = (next?.run.value ?? []).map((item, k) => {
      const moved = movedFrom.get(next.to + k);
      if (moved) return { status: "moved", before: moved.item, beforeIndex: moved.index };
      const match = left.find((g) => !g.taken && related(g.item, item));
      if (match) match.taken = true;
      return match ? { status: "changed", before: match.item, beforeIndex: match.index } : { status: "added" };
    });
    result.after.push(...placed);
    // A dropped item goes after the changed ones that came before it.
    for (const g of left.filter((g) => !g.taken)) {
      const at = startAt + placed.filter((p) => p.status === "changed" && p.beforeIndex < g.index).length;
      result.removed.push({ item: g.item, index: g.index, at });
    }
  }
  return result;
}

const sameStep = (a, b) => a.text.trim() === b.text.trim();
const sameLine = (a, b) =>
  a.ingredient_id === b.ingredient_id && a.quantity === b.quantity && a.unit_id === b.unit_id && (a.note || null) === (b.note || null);
const sameIngredient = (a, b) => a.ingredient_id === b.ingredient_id;

export const TEXT_FIELDS = ["title", "description", "notes"];
export const NUMBER_FIELDS = ["prep_minutes", "cook_minutes", "total_minutes"];

// What a draft changes in the recipe it is compared with, both in one language.
// Sections, tags and the photo are left out.
export function recipeChanges(before, after) {
  const language = after.language;
  const text = Object.fromEntries(TEXT_FIELDS.map((f) => [f, wordDiff(before[f], after[f], language)]).filter(([, d]) => d));
  const numbers = NUMBER_FIELDS.filter((f) => (before[f] ?? null) !== (after[f] ?? null));
  if ((before.yield_quantity ?? null) !== (after.yield_quantity ?? null) || (before.yield_unit_id ?? null) !== (after.yield_unit_id ?? null)) {
    numbers.push("yield");
  }
  const steps = alignLists(before.steps, after.steps, sameStep);
  steps.after.forEach((s, i) => {
    if (s.status === "changed") s.diff = wordDiff(s.before.text, after.steps[i].text, language);
  });
  const ingredients = alignLists(before.ingredients, after.ingredients, sameLine, sameIngredient);
  const count =
    Object.keys(text).length +
    numbers.length +
    [steps, ingredients].reduce((n, list) => n + list.after.filter((x) => x.status !== "same").length + list.removed.length, 0);
  return { text, numbers, steps, ingredients, count };
}
