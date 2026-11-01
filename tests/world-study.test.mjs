import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
const modules = new Map();
async function moduleUrl(file) {
  file = resolve(file);
  if (modules.has(file)) return modules.get(file);
  let code = ts.transpile(await readFile(file, "utf8"), {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  });
  for (const match of [...code.matchAll(/from ["'](\.[^"']+)["']/g)])
    code = code.replace(
      match[0],
      "from " +
        JSON.stringify(
          await moduleUrl(resolve(dirname(file), match[1] + ".ts")),
        ),
    );
  const url =
    "data:text/javascript;base64," + Buffer.from(code).toString("base64");
  modules.set(file, url);
  return url;
}
const {
  resolveStudyNote,
  resolveStudyChord,
  studyStringCenter,
  studyStringEndpoints,
  GUITAR_STRING_LAYOUT,
} = await import(
  await moduleUrl(
    fileURLToPath(new URL("../src/world/fretStudy.ts", import.meta.url)),
  )
);
test("Study markers and physical strings share the nut, bridge and interpolated string centres", () => {
  for (let i = 0; i < 6; i++) {
    const endpoints = studyStringEndpoints(i);
    assert.equal(endpoints.nut.x, (i - 2.5) * 0.035);
    assert.equal(endpoints.bridge.x, (i - 2.5) * 0.05);
    assert.equal(endpoints.nut.y, 2.12);
    assert.equal(endpoints.bridge.y, -1.08);
    const midpoint = studyStringCenter(
      i,
      (GUITAR_STRING_LAYOUT.nutY + GUITAR_STRING_LAYOUT.bridgeY) / 2,
    );
    assert.ok(
      Math.abs(midpoint.x - (endpoints.nut.x + endpoints.bridge.x) / 2) < 1e-12,
    );
    assert.ok(
      Math.abs(midpoint.z - (endpoints.nut.z + endpoints.bridge.z) / 2) < 1e-12,
    );
  }
  assert.throws(() => studyStringCenter(6, 2), RangeError);
});
test("Six-string study pitches preserve standard tuning, octave and fret distance", () => {
  assert.deepEqual(
    Array.from(
      { length: 6 },
      (_, stringIndex) => resolveStudyNote({ stringIndex, fret: 0 }).midi,
    ),
    [40, 45, 50, 55, 59, 64],
  );
  assert.equal(resolveStudyNote({ stringIndex: 5, fret: 1 }).pitch, "F4");
  assert.equal(resolveStudyNote({ stringIndex: 4, fret: 1 }).pitch, "C4");
  assert.equal(resolveStudyNote({ stringIndex: 2, fret: 2 }).pitch, "E3");
  assert.equal(resolveStudyNote({ stringIndex: 3, fret: 2 }).pitch, "A3");
  assert.equal(resolveStudyNote({ stringIndex: 5, fret: 4 }).midi, 68);
  assert.equal(resolveStudyNote({ stringIndex: 0, fret: 0 }).open, true);
  assert.equal(resolveStudyNote({ stringIndex: 0, fret: 1 }).open, false);
});
test("Seven open-chord studies sound the requested major/minor triads", () => {
  const expected = {
    C: [0, 4, 7],
    Am: [0, 4, 9],
    Em: [4, 7, 11],
    E: [4, 8, 11],
    D: [2, 6, 9],
    A: [1, 4, 9],
    G: [2, 7, 11],
  };
  for (const [name, classes] of Object.entries(expected)) {
    const study = resolveStudyChord(name);
    assert.ok(study, name);
    assert.deepEqual(
      [...new Set(study.midis.map((m) => m % 12))].sort((a, b) => a - b),
      classes,
      name + " pitch classes",
    );
    assert.ok(
      study.fingers.every(
        (f) => f.fret > 0 && f.fret <= 3 && f.finger >= 1 && f.finger <= 4,
      ),
    );
  }
  assert.deepEqual(resolveStudyChord("C").fingers, [
    { finger: 1, stringIndex: 4, fret: 1 },
    { finger: 2, stringIndex: 2, fret: 2 },
    { finger: 3, stringIndex: 1, fret: 3 },
  ]);
  assert.deepEqual(resolveStudyChord("Am").fingers, [
    { finger: 1, stringIndex: 4, fret: 1 },
    { finger: 2, stringIndex: 2, fret: 2 },
    { finger: 3, stringIndex: 3, fret: 2 },
  ]);
  assert.deepEqual(resolveStudyChord("Em").fingers, [
    { finger: 2, stringIndex: 1, fret: 2 },
    { finger: 3, stringIndex: 2, fret: 2 },
  ]);
  assert.deepEqual(resolveStudyChord("A").fingers, [
    { finger: 1, stringIndex: 2, fret: 2 },
    { finger: 2, stringIndex: 3, fret: 2 },
    { finger: 3, stringIndex: 4, fret: 2 },
  ]);
  assert.deepEqual(resolveStudyChord("G").fingers, [
    { finger: 1, stringIndex: 1, fret: 2 },
    { finger: 2, stringIndex: 0, fret: 3 },
    { finger: 3, stringIndex: 5, fret: 3 },
  ]);
});
test("Study validation rejects impossible inputs and keeps the small F barre distinct", () => {
  for (const note of [
    { stringIndex: -1, fret: 0 },
    { stringIndex: 6, fret: 0 },
    { stringIndex: 2, fret: 5 },
    { stringIndex: 2.5, fret: 1 },
    { stringIndex: 1, fret: 1.5 },
    { stringIndex: NaN, fret: 1 },
  ])
    assert.equal(resolveStudyNote(note), null);
  assert.equal(resolveStudyChord("not a chord"), null);
  assert.equal(resolveStudyChord(""), null);
  assert.deepEqual(resolveStudyChord("F-small").barre, [1, 4, 5]);
  assert.deepEqual(resolveStudyChord("F-small").frets, [-1, -1, 3, 2, 1, 1]);
  assert.deepEqual(resolveStudyChord("F").barre, [1, 0, 5]);
});
