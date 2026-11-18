import { test } from "node:test";
import assert from "node:assert/strict";
import { alignLists, recipeChanges, wordDiff } from "./changes.js";

const eq = (a, b) => a === b;
const statuses = (aligned) => aligned.after.map((x) => x.status);

test("equal text has no diff", () => {
  assert.equal(wordDiff("Boil water", "Boil water", "en"), null);
  assert.equal(wordDiff(null, "", "en"), null);
});

test("a changed word is marked, the rest kept", () => {
  const { parts, rewritten } = wordDiff("Fry for 5 minutes", "Fry for 8 minutes", "en");
  assert.equal(rewritten, false);
  assert.deepEqual(parts.filter((p) => p.removed).map((p) => p.value.trim()), ["5"]);
  assert.deepEqual(parts.filter((p) => p.added).map((p) => p.value.trim()), ["8"]);
});

test("Japanese splits into words, not whole sentences", () => {
  const { parts, rewritten } = wordDiff("鶏肉を一口大に切る", "豚肉を一口大に切る", "ja");
  assert.equal(rewritten, false);
  assert.ok(parts.some((p) => !p.added && !p.removed && p.value.includes("一口")));
});

test("a rewritten text is flagged", () => {
  assert.equal(wordDiff("Boil the pasta", "Serve with grated cheese on top", "en").rewritten, true);
});

test("an inserted item leaves later ones the same", () => {
  const aligned = alignLists(["a", "b", "c"], ["a", "x", "b", "c"], eq);
  assert.deepEqual(statuses(aligned), ["same", "added", "same", "same"]);
  assert.deepEqual(aligned.removed, []);
});

test("a replaced item is one change, a dropped one is placed where it was", () => {
  const aligned = alignLists(["a", "b", "c", "d"], ["a", "B", "d"], eq);
  assert.deepEqual(statuses(aligned), ["same", "changed", "same"]);
  assert.equal(aligned.after[1].before, "b");
  assert.deepEqual(aligned.removed, [{ item: "c", index: 2, at: 2 }]);
});

test("an item moved unchanged is a move, not a removal and an addition", () => {
  const aligned = alignLists(["a", "b", "c", "d"], ["b", "c", "a", "d"], eq);
  assert.deepEqual(statuses(aligned), ["same", "same", "moved", "same"]);
  assert.equal(aligned.after[2].beforeIndex, 0);
  assert.deepEqual(aligned.removed, []);
});

test("a moved item never pairs with an edited one", () => {
  const aligned = alignLists(["a", "b", "c"], ["c", "B", "a"], eq);
  assert.deepEqual(statuses(aligned), ["same", "added", "moved"]);
  assert.deepEqual(aligned.removed.map((r) => r.item), ["b"]);
});

test("related items pair first", () => {
  const before = [{ id: "salt", q: 1 }, { id: "egg", q: 2 }];
  const after = [{ id: "egg", q: 3 }];
  const aligned = alignLists(before, after, (a, b) => a.id === b.id && a.q === b.q, (a, b) => a.id === b.id);
  assert.deepEqual(statuses(aligned), ["changed"]);
  assert.equal(aligned.after[0].before.id, "egg");
  assert.deepEqual(aligned.removed.map((r) => [r.item.id, r.at]), [["salt", 0]]);
});

test("recipe changes count every field, line and step", () => {
  const line = (ingredient_id, quantity) => ({ ingredient_id, quantity, unit_id: "g", note: null });
  const before = {
    language: "en", title: "Soup", description: "", notes: "", prep_minutes: 5, yield_quantity: 2, yield_unit_id: null,
    ingredients: [line("onion", 100), line("salt", 2)], steps: [{ text: "Chop" }, { text: "Boil for 5 minutes" }],
  };
  const after = {
    ...before, title: "Onion soup", prep_minutes: 10,
    ingredients: [line("onion", 150)], steps: [{ text: "Chop" }, { text: "Boil for 8 minutes" }, { text: "Serve" }],
  };
  const changes = recipeChanges(before, after);
  assert.deepEqual(Object.keys(changes.text), ["title"]);
  assert.deepEqual(changes.numbers, ["prep_minutes"]);
  assert.deepEqual(statuses(changes.steps), ["same", "changed", "added"]);
  assert.equal(changes.steps.after[1].diff.rewritten, false);
  assert.deepEqual(statuses(changes.ingredients), ["changed"]);
  assert.equal(changes.count, 6);
});
