import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const code = ts.transpile(
  await readFile(new URL("../src/coachRoute.ts", import.meta.url), "utf8"),
  { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
);
const { coachRoute } = await import(
  "data:text/javascript;base64," + Buffer.from(code).toString("base64")
);
test("Desktop and older links open the new workspaces while preserving source guide links", () => {
  for (const hash of ["", "#/today", "#/learn", "#/desk", "#/practice"])
    assert.equal(coachRoute(hash).page, "desk");
  for (const hash of ["#/changes", "#/reference", "#/chords"])
    assert.equal(coachRoute(hash).page, "reference");
  assert.equal(coachRoute("#/jam").page, "jam");
  assert.equal(coachRoute("#/sources").page, "library");
  assert.equal(coachRoute("#/journal").page, "progress");
  assert.deepEqual(coachRoute("#/lesson/7?focus=A-D"), {
    page: "guide",
    lesson: 7,
    focus: "A-D",
  });
  assert.deepEqual(
    coachRoute(
      "#/lesson/4?focus=Build%20Em%2C%20then%20check%20every%20string",
    ),
    { page: "guide", lesson: 4, focus: "Build Em, then check every string" },
  );
  assert.equal(coachRoute("#/lesson/999").page, "desk");
  assert.deepEqual(coachRoute("#/desk?change=C-Am"), {
    page: "desk",
    change: "C-Am",
  });
});
