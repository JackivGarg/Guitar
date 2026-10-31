import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const code = ts.transpile(
  await readFile(new URL("../src/practice-flow.ts", import.meta.url), "utf8"),
  { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
);
const { routinePosition, routineSeconds, progressionBeat } = await import(
  "data:text/javascript;base64," + Buffer.from(code).toString("base64")
);
test("Guided practice advances at exercise boundaries and finishes after ten minutes", () => {
  assert.equal(routineSeconds, 600);
  assert.deepEqual(routinePosition(0), {
    stage: 0,
    remaining: 120,
    complete: false,
  });
  assert.deepEqual(routinePosition(120), {
    stage: 1,
    remaining: 120,
    complete: false,
  });
  assert.deepEqual(routinePosition(359), {
    stage: 2,
    remaining: 1,
    complete: false,
  });
  assert.deepEqual(routinePosition(360), {
    stage: 3,
    remaining: 240,
    complete: false,
  });
  assert.deepEqual(routinePosition(600), {
    stage: 3,
    remaining: 0,
    complete: true,
  });
  assert.deepEqual(routinePosition(999), routinePosition(600));
});
test("Play-along gives four count-in beats, full bars per chord and the correct next chord", () => {
  for (let n = 0; n < 4; n++)
    assert.deepEqual(progressionBeat(n, 4, 2), {
      countIn: true,
      beat: n + 1,
      chord: 0,
      next: 0,
      round: 0,
    });
  assert.deepEqual(progressionBeat(4, 4, 2), {
    countIn: false,
    beat: 1,
    chord: 0,
    next: 1,
    round: 1,
  });
  assert.equal(
    progressionBeat(11, 4, 2).chord,
    0,
    "Hold the first chord for all eight beats",
  );
  assert.deepEqual(progressionBeat(12, 4, 2), {
    countIn: false,
    beat: 1,
    chord: 1,
    next: 2,
    round: 1,
  });
  assert.deepEqual(progressionBeat(35, 4, 2), {
    countIn: false,
    beat: 4,
    chord: 3,
    next: 0,
    round: 1,
  });
  assert.deepEqual(progressionBeat(36, 4, 2), {
    countIn: false,
    beat: 1,
    chord: 0,
    next: 1,
    round: 2,
  });
  assert.deepEqual(progressionBeat(8, 2, 1), {
    countIn: false,
    beat: 1,
    chord: 1,
    next: 0,
    round: 1,
  });
});
