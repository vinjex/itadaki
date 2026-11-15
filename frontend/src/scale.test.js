import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanFactor } from "./scale.js";

test("scaling back and forth lands on exactly 1", () => {
  assert.equal(cleanFactor((300 / 200) * (200 / 300)), 1);
  assert.equal(cleanFactor(0.9995), 1);
  assert.equal(cleanFactor(1.5), 1.5);
  assert.equal(cleanFactor(2 / 3), 0.6667);
});
