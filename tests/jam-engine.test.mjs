import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const code = ts.transpile(
  await readFile(new URL("../src/jamEngine.ts", import.meta.url), "utf8"),
  { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
);
const { jamSlot, jamClock, rotateLoop } = await import(
  "data:text/javascript;base64," + Buffer.from(code).toString("base64")
);
test("Jam count-in is four beats and is excluded from logged playing time", () => {
  assert.equal(jamSlot(0, 4, 2).count, 1);
  assert.equal(jamSlot(6, 4, 2).count, 4);
  assert.equal(jamSlot(7, 4, 2).countIn, true);
  assert.equal(jamSlot(8, 4, 2).countIn, false);
  assert.equal(jamClock(4, 60, 4, 2).playedSeconds, 0);
  assert.equal(jamClock(14, 60, 4, 2).playedSeconds, 10);
  assert.equal(jamClock(8, 30, 4, 2).playedSeconds, 0);
});
test("Bars, next chord and rounds follow the same uninterrupted musical clock", () => {
  assert.equal(jamSlot(8, 4, 2).chordIndex, 0);
  assert.equal(jamSlot(23, 4, 2).chordIndex, 0);
  assert.equal(jamSlot(24, 4, 2).chordIndex, 1);
  assert.equal(jamSlot(72, 4, 2).chordIndex, 0);
  assert.equal(jamSlot(72, 4, 2).round, 2);
  assert.equal(jamSlot(16, 4, 2).bar, 1);
  assert.deepEqual(
    Array.from({ length: 8 }, (_, i) => jamSlot(i + 8, 4, 1, "folk").strum),
    ["D", "·", "D", "U", "·", "U", "D", "U"],
  );
  assert.deepEqual(rotateLoop(["C", "Am", "Em", "E"], 2), [
    "Em",
    "E",
    "C",
    "Am",
  ]);
  assert.deepEqual(rotateLoop(["C", "Am"], -1), ["Am", "C"]);
});
