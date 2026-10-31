import { test } from "node:test";
import assert from "node:assert/strict";
import { exactMatch, newId, search } from "./search.js";

const salt = { id: "salt", localized: { en: { name: "salt", aliases: ["sea salt"] }, ja: { name: "塩", aliases: ["しお"] } } };
const soy = { id: "soy_sauce", localized: { en: { name: "soy sauce" }, ja: { name: "醤油" } } };
const sesame = { id: "sesame", localized: { en: { name: "sesame seeds" } } };
const all = [soy, sesame, salt];

test("search matches any language and alias, best first", () => {
  assert.deepEqual(search(all, "salt").map((e) => e.id), ["salt"]);
  assert.deepEqual(search(all, "塩").map((e) => e.id), ["salt"]);
  assert.deepEqual(search(all, "s").map((e) => e.id), ["soy_sauce", "sesame", "salt"]);
  assert.deepEqual(search(all, "sauce").map((e) => e.id), ["soy_sauce"]);
});

test("exact match decides whether to offer creating a new ingredient", () => {
  assert.equal(exactMatch(all, " Sea Salt ")?.id, "salt");
  assert.equal(exactMatch(all, "pepper"), undefined);
});

test("new ids are readable and unique", () => {
  assert.equal(newId("Kosher Salt", new Set(["salt"])), "kosher_salt");
  assert.equal(newId("salt", new Set(["salt"])), "salt_2");
  assert.equal(newId("胡椒", new Set()), "ingredient");
});
