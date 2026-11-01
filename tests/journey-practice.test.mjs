import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import path from "node:path";
const compile = (text) =>
  ts.transpile(text, {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  });
const url = (text) =>
  "data:text/javascript;base64," + Buffer.from(text).toString("base64");
const reactUrl = pathToFileURL(
  createRequire(import.meta.url).resolve("react"),
).href;
const modules = {};
async function moduleUrl(name) {
  if (modules[name]) return modules[name];
  let code = compile(
    await readFile(new URL(`../src/${name}.ts`, import.meta.url), "utf8"),
  );
  for (const match of [...code.matchAll(/from ["'](\.[^"']+)["']/g)])
    code = code.replace(
      match[0],
      "from " +
        JSON.stringify(
          await moduleUrl(
            path.posix.normalize(
              path.posix.join(path.posix.dirname(name), match[1]),
            ),
          ),
        ),
    );
  code = code.replace(
    /from ["']react["']/g,
    "from " + JSON.stringify(reactUrl),
  );
  return (modules[name] = url(code));
}
const { journeyChapters } = await import(
  await moduleUrl("journey/journeySpec")
);
const { deskUnit } = await import(await moduleUrl("deskCurriculum"));
const {
  makeJourneyPractice,
  startJourneyPractice,
  tickJourneyPractice,
  pauseJourneyPractice,
  reportJourneyRep,
  assessJourneyPractice,
  journeyPracticeBatch,
} = await import(await moduleUrl("journey/useJourneyPractice"));
const now = new Date(2026, 10, 1, 14, 0).getTime();
test("Journey practice counts explicit foreground attempts and pauses without silently resuming", () => {
  let d = makeJourneyPractice("test");
  assert.deepEqual(tickJourneyPractice(d, now + 1000), d);
  d = startJourneyPractice(d, "anchors", now);
  d = tickJourneyPractice(d, now + 1000);
  d = pauseJourneyPractice(d, now + 1500);
  assert.equal(d.active, null);
  assert.equal(d.entries[0].elapsedMs, 1500);
  d = tickJourneyPractice(d, now + 9000);
  assert.equal(d.entries[0].elapsedMs, 1500);
  d = startJourneyPractice(d, "anchors", now + 10000);
  d = pauseJourneyPractice(d, now + 11000);
  assert.equal(d.entries[0].elapsedMs, 2500);
  const stopped = tickJourneyPractice(
    startJourneyPractice(makeJourneyPractice("sleep"), "pulse", now),
    now + 30000,
  );
  assert.equal(stopped.active, null);
  assert.equal(
    stopped.entries[0].elapsedMs,
    0,
    "A suspended event loop does not claim thirty seconds of playing",
  );
});
test("Chapter changes keep elapsed time and manual clean repetitions attached to their original exercise", () => {
  let d = startJourneyPractice(makeJourneyPractice("chapters"), "anchors", now);
  d = reportJourneyRep(d, "anchors", now + 1000);
  d = assessJourneyPractice(d, "anchors", "needs-work", now + 1200);
  d = startJourneyPractice(d, "pulse", now + 1500);
  d = pauseJourneyPractice(d, now + 2500);
  const batch = journeyPracticeBatch(d, now + 2500);
  assert.deepEqual(
    batch.sessions.map((s) => [s.lesson, s.seconds]),
    [
      [7, 1],
      [4, 1],
    ],
  );
  assert.match(
    batch.sessions[0].feeling,
    /1 self-reported clean repetitions; needs more practice/,
  );
  assert.match(
    batch.sessions[1].feeling,
    /0 self-reported clean repetitions; not rated/,
  );
  assert.equal(batch.draft.entries.length, 0);
});
test("Practice splits at local midnight and preserves unsaved subsecond attempts", () => {
  const midnight = new Date(2026, 10, 1, 23, 59, 59, 500).getTime();
  let d = startJourneyPractice(
    makeJourneyPractice("midnight"),
    "strings",
    midnight,
  );
  d = tickJourneyPractice(d, midnight + 1000);
  d = pauseJourneyPractice(d, midnight + 2000);
  assert.deepEqual(
    d.entries.map((e) => [e.date, e.elapsedMs]),
    [
      ["2026-11-01", 500],
      ["2026-11-02", 1500],
    ],
  );
  const batch = journeyPracticeBatch(d, midnight + 2000);
  assert.deepEqual(
    batch.sessions.map((s) => [s.date, s.seconds]),
    [["2026-11-02", 1]],
  );
  assert.deepEqual(
    batch.draft.entries.map((e) => [e.date, e.elapsedMs]),
    [["2026-11-01", 500]],
  );
});
test("Saving cannot double-count a batch and self-reports never manufacture elapsed time or completion", () => {
  let d = reportJourneyRep(makeJourneyPractice("saving"), "clear-note", now);
  d = assessJourneyPractice(d, "clear-note", "comfortable", now);
  assert.equal(journeyPracticeBatch(d, now).sessions.length, 0);
  d = startJourneyPractice(d, "clear-note", now);
  d = tickJourneyPractice(d, now + 1000);
  const first = journeyPracticeBatch(d, now + 1000);
  assert.equal(first.sessions[0].seconds, 1);
  assert.equal(first.sessions[0].lesson, 3);
  assert.equal(
    journeyPracticeBatch(first.draft, now + 2000).sessions.length,
    0,
  );
  const next = journeyPracticeBatch(
    pauseJourneyPractice(
      startJourneyPractice(first.draft, "clear-note", now + 3000),
      now + 4000,
    ),
    now + 4000,
  );
  assert.notEqual(
    next.sessions[0].id,
    first.sessions[0].id,
    "Later practice has a new stable session ID",
  );
  assert.ok(
    !("completed" in first.draft),
    "Self-assessment does not mark an entire lesson mastered",
  );
});

test("Every chapter saves against the lesson belonging to its actual practice unit", () => {
  for (const chapter of journeyChapters) {
    const timed = pauseJourneyPractice(
      startJourneyPractice(makeJourneyPractice(chapter.id), chapter.id, now),
      now + 1000,
    );
    const { sessions } = journeyPracticeBatch(timed, now + 1000);
    assert.equal(
      sessions[0].lesson,
      deskUnit(chapter.unit).lesson,
      chapter.id + " curriculum lesson",
    );
  }
  const posture = journeyPracticeBatch(
    pauseJourneyPractice(
      startJourneyPractice(makeJourneyPractice("posture"), "instrument", now),
      now + 1000,
    ),
    now + 1000,
  );
  assert.equal(
    posture.sessions[0].lesson,
    3,
    "Posture setup belongs to the physical-basics lesson, not the missing Lesson 1 source",
  );
});
