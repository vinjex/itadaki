import { test } from "node:test";
import assert from "node:assert/strict";
import { groups, insertInGroup, move, renameGroup } from "./sections.js";

const items = [
  { id: 1, section: null },
  { id: 2, section: "Sauce" },
  { id: 3, section: "Sauce" },
  { id: 4, section: "Topping" },
];
const ids = (list) => list.map((i) => `${i.id}${i.section ? ":" + i.section : ""}`);

test("groups are runs of the same section", () => {
  assert.deepEqual(groups(items).map((g) => [g.section, g.start, g.end]), [
    [null, 0, 0], ["Sauce", 1, 2], ["Topping", 3, 3],
  ]);
});

test("moving inside a block swaps", () => {
  assert.deepEqual(ids(move(items, 1, 1)), ["1", "3:Sauce", "2:Sauce", "4:Topping"]);
});

test("moving past a block edge joins the neighbouring block", () => {
  assert.deepEqual(ids(move(items, 1, -1)), ["1", "2", "3:Sauce", "4:Topping"]);
  assert.deepEqual(ids(move(items, 3, -1)), ["1", "2:Sauce", "3:Sauce", "4:Sauce"]);
});

test("moving past the outer edges does nothing", () => {
  assert.equal(move(items, 0, -1), items);
  assert.equal(move(items, 3, 1), items);
});

test("renaming a block renames all its items; clearing ungroups them", () => {
  const sauce = groups(items)[1];
  assert.deepEqual(ids(renameGroup(items, sauce, "Dressing")), ["1", "2:Dressing", "3:Dressing", "4:Topping"]);
  assert.deepEqual(ids(renameGroup(items, sauce, " ")), ["1", "2", "3", "4:Topping"]);
});

test("adding to a block appends at its end with its section", () => {
  assert.deepEqual(ids(insertInGroup(items, groups(items)[1], { id: 5 })), ["1", "2:Sauce", "3:Sauce", "5:Sauce", "4:Topping"]);
});

test("dropping into another block takes its section; emptied blocks vanish", async () => {
  const { relocate } = await import("./sections.js");
  assert.deepEqual(ids(relocate(items, 0, 0, 1, 1)), ["2:Sauce", "1:Sauce", "3:Sauce", "4:Topping"]);
  assert.deepEqual(ids(relocate(items, 2, 0, 1, 0)), ["1", "4:Sauce", "2:Sauce", "3:Sauce"]);
  assert.deepEqual(ids(relocate(items, 1, 1, 1, 0)), ["1", "3:Sauce", "2:Sauce", "4:Topping"]);
});

test("a step can become the heading of the steps after it", async () => {
  const { promoteToHeading } = await import("./sections.js");
  const steps = [{ text: "Gather" }, { text: "For the sauce:" }, { text: "Mix" }, { text: "Stir" }, { text: "Serve", section: "End" }];
  assert.deepEqual(
    promoteToHeading(steps, 1).map((s) => `${s.text}${s.section ? ":" + s.section : ""}`),
    ["Gather", "Mix:For the sauce", "Stir:For the sauce", "Serve:End"],
  );
});

test("a heading turns back into a step, undoing promoteToHeading", async () => {
  const { promoteToHeading, demoteHeading } = await import("./sections.js");
  const original = [{ text: "Gather", section: "Prep" }, { text: "For the sauce", section: "Prep" }, { text: "Mix", section: "Prep" }];
  const promoted = promoteToHeading(original, 1);
  assert.deepEqual(demoteHeading(promoted, groups(promoted)[1]), original);
});
