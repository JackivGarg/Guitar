import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const compile = (code) =>
  ts.transpile(code, {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  });
const url = (code) =>
  "data:text/javascript;base64," + Buffer.from(code).toString("base64");
const timing = await import(
  url(
    compile(
      await readFile(
        new URL("../src/changeTiming.ts", import.meta.url),
        "utf8",
      ),
    ),
  )
);
const {
  changePhase,
  changeDurationFrames,
  changeMoveWindow,
  changeCueFrames,
  CHANGE_SETTLED,
  CHANGE_RELEASE_END,
} = timing;

test("Quick clips use 3 seconds each direction and six seconds for a complete return", () => {
  assert.equal(changeDurationFrames("forward"), 90);
  assert.equal(changeDurationFrames("back"), 90);
  assert.equal(changeDurationFrames("both"), 180);
  assert.equal(changeDurationFrames("both", 60), 360);
  assert.deepEqual(changePhase(89, "both"), { back: false, local: 89 });
  assert.deepEqual(changePhase(90, "both"), { back: true, local: 0 });
  assert.deepEqual(changePhase(0, "back"), { back: true, local: 0 });
  assert.deepEqual(changePhase(180, "both", 60), { back: true, local: 0 });
});

test("Every movement group finishes in order before the target hold, including three groups", () => {
  for (const count of [1, 2, 3, 4]) {
    let previousEnd = CHANGE_RELEASE_END;
    const cues = changeCueFrames(count);
    for (let i = 0; i < count; i++) {
      const window = changeMoveWindow(i, count);
      assert.ok(
        window.start > previousEnd,
        "Release and earlier movement finish first",
      );
      assert.ok(window.end > window.start, "Each group has real motion time");
      assert.ok(
        window.end < CHANGE_SETTLED,
        "Every group reaches its destination before target",
      );
      assert.ok(
        cues.movements[i] >= window.start && cues.movements[i] <= window.end,
        "Seek button lands in actual movement",
      );
      previousEnd = window.end;
    }
    assert.ok(cues.target > CHANGE_SETTLED && cues.target < 90);
    assert.equal(cues.return, 90);
    assert.equal(changeCueFrames(count, "forward").return, 0);
  }
});
