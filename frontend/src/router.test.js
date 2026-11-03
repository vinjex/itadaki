import { test } from "node:test";
import assert from "node:assert/strict";
import { pathFor, viewFor } from "./router.js";

test("every screen round-trips through its path", () => {
  for (const target of [{ view: "list" }, { view: "recipe", id: "a1" }, { view: "edit", id: "a1" }, { view: "draft", id: "d1" }, { view: "new" }, { view: "import" }, { view: "manage" }, { view: "languages" }, { view: "ai" }, { view: "catalog", id: "ingredients" }, { view: "catalog", id: "units" }, { view: "catalog", id: "recipe_tags" }, { view: "catalog", id: "ingredient_tags" }]) {
    assert.deepEqual(viewFor(pathFor(target)), target);
  }
});

test("unknown paths show the list", () => {
  assert.deepEqual(viewFor("/nonsense/x"), { view: "list" });
  assert.deepEqual(viewFor(undefined), { view: "list" });
});
