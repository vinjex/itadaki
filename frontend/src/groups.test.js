import { test } from "node:test";
import assert from "node:assert/strict";
import { groupRecipes } from "./groups.js";

const soup = { id: "soup", language: "ja", tags: ["soup", "quick"], total_minutes: 10 };
const stew = { id: "stew", language: "en", tags: ["soup"], prep_minutes: 20, cook_minutes: 90 };
const salad = { id: "salad", language: "en", tags: ["gone"] };
const names = { soup: "Soup", quick: "Quick" };
const label = (by, key) => (key === null ? "other" : by === "tag" ? names[key] : String(key));
const ids = (groups) => groups.map((g) => [g.label, g.recipes.map((r) => r.id)]);

test("no grouping keeps one section", () => {
  assert.deepEqual(ids(groupRecipes([soup, stew], "none", label)), [["", ["soup", "stew"]]]);
});

test("a recipe shows under each of its tags, unknown tags count as none", () => {
  assert.deepEqual(ids(groupRecipes([soup, stew, salad], "tag", label)), [
    ["Quick", ["soup"]],
    ["Soup", ["soup", "stew"]],
    ["other", ["salad"]],
  ]);
});

test("time buckets run shortest first, unknown time last", () => {
  assert.deepEqual(ids(groupRecipes([stew, salad, soup], "time", label)), [
    ["15", ["soup"]],
    ["Infinity", ["stew"]],
    ["other", ["salad"]],
  ]);
});

test("language groups by the shown version's language", () => {
  assert.deepEqual(ids(groupRecipes([soup, stew], "language", label)), [
    ["en", ["stew"]],
    ["ja", ["soup"]],
  ]);
});
