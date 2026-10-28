import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const urls = {};
async function moduleUrl(name) {
  if (urls[name]) return urls[name];
  let code = ts.transpile(
    await readFile(new URL(`../src/${name}.ts`, import.meta.url), "utf8"),
    { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  );
  for (const match of [...code.matchAll(/from ["']\.\/([^"']+)["']/g)])
    code = code.replace(
      match[0],
      "from " + JSON.stringify(await moduleUrl(match[1])),
    );
  return (urls[name] =
    "data:text/javascript;base64," + Buffer.from(code).toString("base64"));
}
const { lessons, videoIds } = await import(await moduleUrl("learningPath"));
const { barreChord } = await import(await moduleUrl("barre"));
const { openMidi, patterns } = await import(await moduleUrl("course"));
test("Supplied lessons retain separate actionable chapters in source order", () => {
  assert.equal(videoIds.length, 10);
  assert.equal(new Set(videoIds).size, 10);
  for (const [id, minimum] of [
    [2, 9],
    [3, 11],
    [4, 25],
    [5, 10],
    [6, 9],
    [8, 10],
    [9, 15],
  ]) {
    const l = lessons.find((l) => l.id === id);
    assert.ok(l.steps.length >= minimum, `Lesson ${id} coverage`);
    assert.equal(
      new Set(l.steps.map((s) => s.title)).size,
      l.steps.length,
      "Stable unique chapter titles",
    );
    l.steps.forEach((s, i) => {
      assert.ok(s.text.length > 150);
      assert.ok(s.action.length > 30);
      assert.ok(s.demo);
      if (i)
        assert.ok(s.sourceStart >= l.steps[i - 1].sourceStart, "Source order");
    });
  }
  const l4 = lessons.find((l) => l.id === 4);
  assert.equal(
    l4.steps.find((s) => s.title === "Build the small open-position F").demo,
    "smallF",
  );
  assert.equal(
    l4.steps.find((s) => s.title.startsWith("Keep four steady beats")).pattern,
    3,
  );
  assert.deepEqual(patterns[3].slots, ["D", "U", "D", "U", "D", "U", "D", "·"]);
  const l8 = lessons.find((l) => l.id === 8);
  assert.ok(l8.steps.filter((s) => s.demo === "release-mute").length >= 3);
  assert.match(
    l8.steps.find((s) => s.title.startsWith("Keep contact")).text,
    /same place/,
  );
});
test("Every movable family yields the requested root and chord quality at frets 1–12", () => {
  for (const family of ["E", "A"])
    for (const quality of ["major", "minor"])
      for (let fret = 1; fret <= 12; fret++) {
        const c = barreChord(family, quality, fret),
          root = ((family === "E" ? 4 : 9) + fret) % 12;
        const expected = [0, quality === "minor" ? 3 : 4, 7]
          .map((i) => (root + i) % 12)
          .sort((a, b) => a - b);
        const actual = [
          ...new Set(
            c.frets
              .map((f, i) => (f < 0 ? -1 : (openMidi[i] + f) % 12))
              .filter((p) => p >= 0),
          ),
        ].sort((a, b) => a - b);
        assert.deepEqual(actual, expected, `${family} ${quality} fret ${fret}`);
        assert.equal(c.frets[family === "E" ? 0 : 1], fret);
        assert.equal(c.barre[0], fret);
        if (family === "A") assert.equal(c.frets[0], -1);
      }
  assert.equal(barreChord("A", "major", 3).name, "C");
  assert.deepEqual(barreChord("A", "major", 3).frets, [-1, 3, 5, 5, 5, 3]);
  assert.equal(barreChord("E", "minor", 2, true).name, "G♭m");
  assert.throws(() => barreChord("E", "major", 0), RangeError);
});
