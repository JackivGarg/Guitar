import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { posix } from "node:path";
import ts from "typescript";
const cache = {};
async function moduleUrl(name) {
  if (cache[name]) return cache[name];
  let code = ts.transpile(
    await readFile(new URL(`../src/${name}.ts`, import.meta.url), "utf8"),
    { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  );
  for (const m of [...code.matchAll(/from ["'](\.{1,2}\/[^"']+)["']/g)])
    code = code.replace(
      m[0],
      "from " +
        JSON.stringify(
          await moduleUrl(
            posix.normalize(posix.join(posix.dirname(name), m[1])),
          ),
        ),
    );
  return (cache[name] =
    "data:text/javascript;base64," + Buffer.from(code).toString("base64"));
}
const { changes, drillBlocks, workshopChord, fingerPosition } = await import(
  await moduleUrl("lesson7")
);
const { changeDurationFrames, changeMoveWindow, CHANGE_HALF_FRAMES } =
  await import(await moduleUrl("changeTiming"));
const {
  changeWorkshopGroups,
  groupDirection,
  workshopSelection,
  changeInDirection,
  workshopMovementGroups,
  workshopMotionCues,
} = await import(await moduleUrl("changes/changeWorkshop"));
test("The quick workshop exposes all eleven exact groups and all fifteen source routes", () => {
  assert.equal(changeWorkshopGroups.length, 11);
  assert.deepEqual(changeWorkshopGroups, drillBlocks);
  assert.deepEqual(
    changeWorkshopGroups.map((b) => b.id),
    Array.from({ length: 11 }, (_, i) => i + 1),
  );
  assert.deepEqual(
    new Set(changeWorkshopGroups.flatMap((b) => b.pairs)),
    new Set(changes.map((c) => c.id)),
  );
  for (const group of drillBlocks) {
    const selected = workshopSelection(group.id);
    assert.equal(selected.block, group);
    assert.ok(group.pairs.includes(selected.change.id));
    for (const id of group.pairs) {
      const s = workshopSelection(group.id, id),
        source = changes.find((c) => c.id === id);
      assert.equal(s.change, source);
      assert.equal(s.block.instructions, group.instructions);
      assert.equal(s.block.returnRoute, group.returnRoute);
      assert.equal(s.change.stay, source.stay);
      assert.equal(s.change.release, source.release);
      assert.deepEqual(s.change.steps, source.steps);
      assert.deepEqual(s.change.back, source.back);
      assert.equal(s.change.trap, source.trap);
      assert.equal(s.change.check, source.check);
    }
  }
});
test("Variants follow the exercise orientation while preserving small F and all canonical source data", () => {
  const before = JSON.stringify({ changes, drillBlocks });
  const amC = workshopSelection(2, "C-Am");
  assert.equal(amC.direction, "back");
  const reverse = changeInDirection(amC.change, amC.direction);
  assert.equal(reverse.from, "Am");
  assert.equal(reverse.to, "C");
  assert.deepEqual(reverse.steps, amC.change.back);
  assert.deepEqual(
    reverse.groups,
    amC.change.reverseGroups ?? amC.change.groups,
  );
  assert.equal(
    groupDirection(
      drillBlocks[0],
      changes.find((c) => c.id === "C-Am"),
    ),
    "forward",
  );
  const f7 = workshopSelection(4, "Fmaj7-G"),
    small = workshopSelection(4, "F-G");
  assert.equal(f7.change.from, "Fmaj7");
  assert.equal(small.change.from, "F-small");
  assert.equal(f7.direction, "forward");
  assert.equal(small.direction, "forward");
  assert.notDeepEqual(
    workshopChord(f7.change.from).frets,
    workshopChord(small.change.from).frets,
  );
  assert.deepEqual(
    workshopChord(small.change.from).frets,
    [-1, -1, 3, 2, 1, 1],
  );
  assert.equal(workshopSelection(6, "C-Dm").direction, "forward");
  assert.equal(workshopSelection(undefined, "D-E").block.id, 10);
  assert.equal(workshopSelection(999, "missing").block.id, 1);
  assert.equal(
    workshopSelection(2, "D-E").change.id,
    "C-Am",
    "A valid group keeps its own variants",
  );
  for (const c of changes) {
    changeInDirection(c, "forward");
    changeInDirection(c, "back");
  }
  assert.equal(
    JSON.stringify({ changes, drillBlocks }),
    before,
    "Reading/reversing routes must not mutate the checked source",
  );
});
test("Step inspection uses the real three-second motion windows and reverse-first round trips", () => {
  for (const c of changes)
    for (const direction of ["forward", "back", "both"])
      for (const first of ["forward", "back"]) {
        const duration = changeDurationFrames(direction);
        assert.equal(duration, direction === "both" ? 180 : 90);
        const cues = workshopMotionCues(c, direction, first);
        assert.ok(cues.every((cue) => cue.frame >= 0 && cue.frame < duration));
        const current = direction === "both" ? first : direction,
          groups = workshopMovementGroups(c, current);
        const target = workshopChord(current === "forward" ? c.to : c.from);
        assert.ok(
          groups.every((g) => g.every((f) => fingerPosition(target, f))),
        );
        const moves = cues.filter((cue) => cue.id.startsWith("move-"));
        assert.equal(moves.length, groups.length);
        moves.forEach((cue, i) => {
          const window = changeMoveWindow(i, groups.length);
          assert.ok(cue.frame >= window.start && cue.frame <= window.end);
        });
        if (direction === "both") {
          assert.equal(
            cues.find((cue) => cue.id === "return").frame,
            CHANGE_HALF_FRAMES,
          );
          assert.ok(
            cues
              .filter((cue) => cue.id.startsWith("return-move-"))
              .every((cue) => cue.frame > CHANGE_HALF_FRAMES),
          );
        }
      }
  const emE = changes.find((c) => c.id === "Em-E");
  assert.equal(
    workshopMotionCues(emE, "forward")[1].label,
    "Keep anchors; prepare",
    "Adding index must not instruct releasing the Em anchors",
  );
  const amC = workshopSelection(2, "C-Am");
  assert.ok(
    workshopMotionCues(amC.change, "both", amC.direction).some(
      (cue) => cue.id === "return-target" && cue.frame === 162,
    ),
  );
});
