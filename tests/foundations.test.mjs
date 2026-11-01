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
  foundationChecked,
  recordFoundationRating,
  foundationPracticeUnits,
  foundationCheckpointKey,
  foundationReviewKey,
  foundationReviews,
  recommendFoundation,
  markFoundationCheckpoint,
  markFoundationReview,
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

test("A learner can move through the physical foundation checks without video completion or invented practice time", () => {
  let progress = {
    version: 1,
    checks: {},
    notes: {},
    completed: [],
    sessions: [
      {
        id: "existing",
        date: "2026-10-31",
        seconds: 30,
        lesson: 7,
        feeling: "Earlier practice",
      },
    ],
  };
  const core = foundationsPlan.filter((c) => !c.later).flatMap((c) => c.checks);
  for (const check of core) {
    assert.equal(
      recommendFoundation(progress, "2026-11-01").check.id,
      check.id,
    );
    if (check.target.kind === "practice")
      assert.equal(
        deskUnits.find((u) => u.id === check.target.unit)?.id,
        check.target.unit,
        "Every recommended action opens a real physical task",
      );
    progress = markFoundationCheckpoint(progress, check.id, true, "2026-11-01");
    assert.equal(progress.checks[foundationCheckpointKey(check.id)], true);
    assert.equal(progress.notes[foundationReviewKey(check.id)], "2026-11-01");
  }
  assert.deepEqual(
    progress.completed,
    [],
    "Self-checks never complete source videos",
  );
  assert.equal(progress.sessions.length, 1);
  assert.equal(
    progress.sessions[0].seconds,
    30,
    "Self-checks never add timed practice",
  );
  assert.equal(
    recommendFoundation(progress, "2026-11-01").check.id,
    "C-Fmaj7",
    "Later routes are suggestions after the first musical progression",
  );
  const afterReview = markFoundationReview(
    progress,
    "setup-posture",
    "2026-11-04",
  );
  assert.ok(
    !foundationReviews(afterReview, "2026-11-04").some(
      (c) => c.id === "setup-posture",
    ),
  );
  assert.deepEqual(
    afterReview.checks,
    progress.checks,
    "A review date does not silently change a confidence rating",
  );
  const unchecked = markFoundationCheckpoint(
    afterReview,
    "setup-strings",
    false,
    "2026-11-04",
  );
  assert.equal(
    recommendFoundation(unchecked, "2026-11-04").check.id,
    "setup-strings",
    "Unchecking a physical check restores it as a preparation point",
  );
  assert.equal(
    foundationReviews(
      {
        checks: {},
        notes: { [foundationReviewKey("setup-posture")]: "2026-02-30" },
      },
      "2026-11-01",
    ).length,
    0,
    "Invalid imported calendar dates do not create invented review reminders",
  );
});

test("Comfortable ratings, explicit unchecks and new ratings use one coherent checkpoint state", () => {
  const old = {
    checks: { "desk-rating-setup-posture-comfortable": true },
    notes: {},
  };
  assert.equal(
    foundationChecked(old, "setup-posture"),
    true,
    "Historical Comfortable ratings remain recognized without a checkpoint key",
  );
  assert.equal(
    recommendFoundation(old, "2026-11-01").check.id,
    "setup-strings",
  );
  assert.equal(
    foundationReviews(old, "2026-11-08").length,
    0,
    "Do not invent a review date for a historical rating",
  );
  const unmarked = markFoundationCheckpoint(
    old,
    "setup-posture",
    false,
    "2026-11-01",
  );
  assert.equal(
    foundationChecked(unmarked, "setup-posture"),
    false,
    "An explicit unchecked state overrides Comfortable",
  );
  assert.equal(
    recommendFoundation(unmarked, "2026-11-01").check.id,
    "setup-posture",
    "Unchecking returns the exercise to the suggested path",
  );
  const rerated = recordFoundationRating(
    unmarked,
    "setup-posture",
    "comfortable",
    "2026-11-02",
  );
  assert.equal(
    Object.hasOwn(rerated.checks, foundationCheckpointKey("setup-posture")),
    false,
    "A fresh rating clears an explicit checkpoint override",
  );
  assert.equal(foundationChecked(rerated, "setup-posture"), true);
  assert.equal(
    recommendFoundation(rerated, "2026-11-02").check.id,
    "setup-strings",
  );
  assert.equal(
    rerated.notes[foundationReviewKey("setup-posture")],
    "2026-11-02",
    "A rating records its real review date",
  );
  assert.equal(foundationReviews(rerated, "2026-11-08").length, 0);
  assert.equal(foundationReviews(rerated, "2026-11-09")[0].id, "setup-posture");
  const needs = recordFoundationRating(
    rerated,
    "setup-posture",
    "needs",
    "2026-11-03",
  );
  assert.equal(foundationChecked(needs, "setup-posture"), false);
  assert.equal(
    needs.checks["desk-rating-setup-posture-comfortable"],
    false,
    "Ratings remain mutually exclusive",
  );
  assert.equal(foundationReviews(needs, "2026-11-04")[0].id, "setup-posture");
  const checked = markFoundationCheckpoint(
    needs,
    "setup-posture",
    true,
    "2026-11-04",
  );
  assert.equal(
    foundationChecked(checked, "setup-posture"),
    true,
    "Explicit physical checks remain possible regardless of confidence rating",
  );
  const reassessed = recordFoundationRating(
    checked,
    "setup-posture",
    "growing",
    "2026-11-05",
  );
  assert.equal(
    foundationChecked(reassessed, "setup-posture"),
    false,
    "A new self-assessment clears a stale explicit checked state too",
  );
  assert.equal(foundationReviews(reassessed, "2026-11-07").length, 0);
  assert.equal(
    foundationReviews(reassessed, "2026-11-08")[0].id,
    "setup-posture",
  );
});
