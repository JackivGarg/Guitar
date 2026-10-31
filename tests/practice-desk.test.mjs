import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const modules = {};
async function moduleUrl(name) {
  if (modules[name]) return modules[name];
  let code = ts.transpile(
    await readFile(new URL(`../src/${name}.ts`, import.meta.url), "utf8"),
    { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  );
  for (const m of [...code.matchAll(/from ["']\.\/([^"']+)["']/g)])
    code = code.replace(m[0], "from " + JSON.stringify(await moduleUrl(m[1])));
  return (modules[name] =
    "data:text/javascript;base64," + Buffer.from(code).toString("base64"));
}
const { deskUnits, deskUnit } = await import(await moduleUrl("deskCurriculum"));
const { changes } = await import(await moduleUrl("lesson7"));
const { lessons } = await import(await moduleUrl("learningPath"));
const {
  makeDeskDraft,
  validDeskDraft,
  addDeskSeconds,
  rollDeskDay,
  pendingPractice,
  clearDeskBatch,
} = await import(await moduleUrl("deskPractice"));
test("The practice desk preserves every complete source chord-change route", () => {
  const units = deskUnits.filter((u) => u.skill === "changes");
  assert.equal(units.length, 15);
  assert.deepEqual(
    units.map((u) => u.change),
    changes.map((c) => c.id),
  );
  for (const c of changes) {
    const u = deskUnit(c.id);
    assert.deepEqual(u.steps, c.steps);
    assert.equal(u.trap, c.trap);
    assert.equal(u.check, c.check);
    assert.deepEqual(u.chords, [c.from, c.to]);
  }
  assert.equal(deskUnit("missing").id, "C-Am");
  assert.equal(new Set(deskUnits.map((u) => u.id)).size, deskUnits.length);
  for (const u of deskUnits) {
    assert.ok(u.task.length > 30);
    if (u.focus)
      assert.ok(
        lessons
          .find((l) => l.id === u.lesson)
          .steps.some((s) => s.title === u.focus),
        u.id + " exact reference chapter",
      );
  }
});
test("Practice records actual time per unit, preserves unsaved time overnight and cannot resave a cleared batch", () => {
  const initial = makeDeskDraft("2026-11-01");
  assert.ok(validDeskDraft(initial));
  const a = addDeskSeconds(initial, 8, "2026-11-01");
  const b = addDeskSeconds({ ...a, unit: "clear-Em" }, 12, "2026-11-01");
  assert.equal(b.seconds, 20);
  assert.deepEqual(pendingPractice(b), [
    { date: "2026-11-01", unit: "C-Am", seconds: 8 },
    { date: "2026-11-01", unit: "clear-Em", seconds: 12 },
  ]);
  const tomorrow = rollDeskDay(b, "2026-11-02");
  assert.equal(tomorrow.seconds, 20);
  assert.equal(tomorrow.unitSeconds, 0);
  assert.equal(pendingPractice(tomorrow)[0].date, "2026-11-01");
  const c = addDeskSeconds(tomorrow, 3, "2026-11-02");
  assert.equal(c.seconds, 23);
  assert.equal(pendingPractice(c).at(-1).date, "2026-11-02");
  const saved = clearDeskBatch(c);
  assert.equal(saved.seconds, 0);
  assert.deepEqual(pendingPractice(saved), []);
  assert.ok(validDeskDraft(saved));
  const fresh = addDeskSeconds(saved, 2, "2026-11-02");
  assert.equal(fresh.seconds, 2);
  assert.equal(
    pendingPractice(fresh).reduce((n, s) => n + s.seconds, 0),
    2,
  );
  assert.equal(validDeskDraft({ ...initial, unit: "missing" }), false);
  assert.equal(
    validDeskDraft({ ...a, pending: [] }),
    false,
    "A corrupt pending sum must not silently lose time",
  );
});
