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
  for (const m of [...code.matchAll(/from ["']\.\/([^"']+)["']/g)])
    code = code.replace(m[0], "from " + JSON.stringify(await moduleUrl(m[1])));
  return (cache[name] =
    "data:text/javascript;base64," + Buffer.from(code).toString("base64"));
}
const {
  foundationsPlan,
  foundationChecks,
  foundationPracticeUnits,
  foundationCheckpointKey,
  foundationReviewKey,
  foundationReviews,
  recommendFoundation,
} = await import(await moduleUrl("foundations/foundationsPlan"));
const { deskUnits } = await import(await moduleUrl("deskCurriculum"));
const { lessons } = await import(await moduleUrl("learningPath"));
const { changes } = await import(await moduleUrl("lesson7"));
test("The foundations path has real valid practice targets, preparation and exact source links", () => {
  const ids = new Set();
  for (const check of foundationChecks) {
    assert.ok(!ids.has(check.id), check.id + " unique");
    for (const preparation of check.preparation)
      assert.ok(
        ids.has(preparation),
        check.id + " preparation appears earlier",
      );
    ids.add(check.id);
    if (check.target.kind === "practice")
      assert.ok(
        deskUnits.some((u) => u.id === check.target.unit),
        check.id + " practice exists",
      );
    if (check.guide?.focus)
      assert.ok(
        lessons
          .find((l) => l.id === check.guide.lesson)
          ?.steps.some((s) => s.title === check.guide.focus),
        check.id + " guide title exists",
      );
  }
  assert.equal(foundationsPlan[0].checks[0].id, "setup-posture");
  assert.deepEqual(
    foundationsPlan.find((c) => c.id === "open").checks.map((c) => c.id),
    [
      "clear-Em",
      "clear-Am",
      "clear-C",
      "clear-G",
      "clear-D",
      "clear-A",
      "clear-E",
    ],
  );
  assert.ok(
    foundationsPlan.findIndex((c) => c.id === "music") <
      foundationsPlan.findIndex((c) => c.id === "colour"),
    "A first progression comes before later techniques",
  );
  for (const u of foundationPracticeUnits) {
    assert.ok(u.steps.length >= 4);
    assert.ok(u.task.length > 35);
    assert.ok(u.check.length > 35);
    if (u.focus)
      assert.ok(
        lessons
          .find((l) => l.id === u.lesson)
          ?.steps.some((s) => s.title === u.focus),
        u.id + " unit source link",
      );
  }
  for (const c of changes) {
    const u = deskUnits.find((u) => u.id === c.id);
    assert.deepEqual(u.steps, c.steps);
    assert.equal(u.check, c.check);
    assert.equal(u.trap, c.trap);
    assert.ok(
      foundationChecks.some(
        (check) =>
          check.target.kind === "practice" && check.target.unit === c.id,
      ),
      "All fifteen shifts remain in the learning path",
    );
  }
});
test("Recommendations use explicit checks; review reminders use reported dates and ratings", () => {
  const empty = { checks: { "desk-rating-C-Am-needs": true }, notes: {} };
  assert.equal(
    recommendFoundation(empty, "2026-11-01").check.id,
    "setup-posture",
    "Do not diagnose one weakness from an unrelated source route",
  );
  const marked = {
    checks: { [foundationCheckpointKey("setup-posture")]: true },
    notes: { [foundationReviewKey("setup-posture")]: "2026-11-01" },
  };
  assert.equal(
    recommendFoundation(marked, "2026-11-01").check.id,
    "setup-strings",
  );
  assert.equal(foundationReviews(marked, "2026-11-02").length, 0);
  assert.equal(foundationReviews(marked, "2026-11-03")[0].id, "setup-posture");
  const comfortable = {
    checks: { "desk-rating-setup-posture-comfortable": true },
    notes: { [foundationReviewKey("setup-posture")]: "2026-11-01" },
  };
  assert.equal(
    recommendFoundation(comfortable, "2026-11-01").check.id,
    "setup-strings",
  );
  assert.equal(foundationReviews(comfortable, "2026-11-07").length, 0);
  assert.equal(
    foundationReviews(comfortable, "2026-11-08")[0].id,
    "setup-posture",
  );
  assert.equal(
    foundationReviews({ checks: {}, notes: {} }, "2026-11-01").length,
    0,
    "No invented past reviews",
  );
});
