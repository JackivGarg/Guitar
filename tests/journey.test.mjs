import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const cache = {};
async function moduleUrl(name) {
  if (cache[name]) return cache[name];
  let code = ts.transpile(
    await readFile(new URL(`../src/${name}.ts`, import.meta.url), "utf8"),
    { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  );
  for (const match of [...code.matchAll(/from ["']\.\/([^"']+)["']/g)])
    code = code.replace(
      match[0],
      "from " + JSON.stringify(await moduleUrl(match[1])),
    );
  return (cache[name] =
    "data:text/javascript;base64," + Buffer.from(code).toString("base64"));
}
const {
  journeyChapters,
  openStringStudy,
  chapterAtProgress,
  progressAtScroll,
} = await import(await moduleUrl("journey/journeySpec"));
const { deskUnits } = await import(await moduleUrl("deskCurriculum"));
const { coachRoute } = await import(await moduleUrl("coachRoute"));
test("Native scroll maps actual unequal section offsets to the six camera endpoints and clamps out-of-range input", () => {
  const points = [0, 900, 1900, 2800, 4100, 5100];
  points.forEach((point, index) =>
    assert.equal(progressAtScroll(point, points), index),
  );
  assert.equal(progressAtScroll(450, points), 0.5);
  assert.equal(progressAtScroll(3450, points), 3.5);
  assert.equal(progressAtScroll(-100, points), 0);
  assert.equal(progressAtScroll(10000, points), 5);
  assert.equal(progressAtScroll(Number.NaN, points), 0);
  assert.equal(progressAtScroll(30, []), 0);
  assert.equal(chapterAtProgress(-3), 0);
  assert.equal(chapterAtProgress(12), 5);
  assert.equal(chapterAtProgress(3.49), 3);
  assert.equal(chapterAtProgress(3.5), 4);
  assert.equal(chapterAtProgress(Number.NaN), 0);
});
test("Journey teaches all six standard open-string pitches in the correct thick-to-thin and string-number order", () => {
  assert.deepEqual(
    openStringStudy.map((s) => s.number),
    [6, 5, 4, 3, 2, 1],
  );
  assert.deepEqual(
    openStringStudy.map((s) => s.midi),
    [40, 45, 50, 55, 59, 64],
  );
  assert.deepEqual(
    openStringStudy.map((s) => s.pitch),
    ["E2", "A2", "D3", "G3", "B3", "E4"],
  );
  assert.equal(
    openStringStudy[5].midi - openStringStudy[0].midi,
    24,
    "Outside E strings are two octaves apart",
  );
});
test("Each journey chapter links directly to a real physical exercise; practice routes require no journey completion", () => {
  assert.deepEqual(
    journeyChapters.map((c) => c.id),
    ["instrument", "strings", "clear-note", "anchors", "pulse", "music"],
  );
  assert.equal(new Set(journeyChapters.map((c) => c.id)).size, 6);
  for (const chapter of journeyChapters) {
    assert.ok(
      deskUnits.some((unit) => unit.id === chapter.unit),
      chapter.id + " opens an existing exercise",
    );
    assert.deepEqual(
      coachRoute("#/desk?change=" + encodeURIComponent(chapter.unit)),
      { page: "desk", change: chapter.unit },
    );
  }
  assert.deepEqual(
    coachRoute("#/journey?chapter=anchors"),
    { page: "journey" },
    "Chapter depth does not leave the journey workspace",
  );
  assert.equal(coachRoute("#/foundations").page, "foundations");
  assert.equal(coachRoute("#/reference").page, "reference");
});
