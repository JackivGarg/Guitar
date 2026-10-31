import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const cache = {};
async function moduleUrl(name) {
  if (cache[name]) return cache[name];
  let text = ts.transpile(
    await readFile(new URL(`../src/${name}.ts`, import.meta.url), "utf8"),
    { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  );
  for (const match of [...text.matchAll(/from ["']\.\/([^"']+)["']/g)])
    text = text.replace(
      match[0],
      "from " + JSON.stringify(await moduleUrl(match[1])),
    );
  return (cache[name] =
    "data:text/javascript;base64," + Buffer.from(text).toString("base64"));
}
const { changes, getChange, workshopChord } = await import(
  await moduleUrl("lesson7")
);
const {
  anchorSummary,
  buildChangeImage,
  buildChangeSheet,
  fingerRoute,
  movementOrder,
} = await import(await moduleUrl("changeAtlasSvg"));
const unescape = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
const words = (svg) =>
  [...svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)]
    .map((m) => unescape(m[1]))
    .join(" ")
    .replace(/\s+/g, " ");
test("All 15 complete reference images contain forward routes, return groups and full pressure instructions", () => {
  const sheet = buildChangeSheet();
  assert.equal(changes.length, 15);
  for (const [i, c] of changes.entries()) {
    const image = buildChangeImage(c),
      copy = words(image);
    assert.match(image, /viewBox="0 0 900 590"/);
    assert.ok(!image.includes("undefined") && !image.includes("NaN"));
    assert.ok(copy.includes(c.focus), `${c.id}: full focus`);
    assert.ok(
      copy.includes(c.release),
      `${c.id}: full release/pressure instruction`,
    );
    assert.ok(copy.includes(anchorSummary(c)));
    assert.ok(
      copy.includes(
        "Move groups: " +
          movementOrder(c) +
          " · Reverse: " +
          movementOrder(c, true),
      ),
    );
    assert.ok(words(sheet).includes(`${String(i + 1).padStart(2, "0")} · `));
    assert.ok(
      words(sheet).includes(c.release),
      `${c.id}: standalone sheet preserves complete release`,
    );
  }
  assert.match(sheet, /width="1880" height="5100"/);
});
test("Reference routes distinguish fixed anchors, light-contact slides and lifted moving fingers", () => {
  assert.equal(
    anchorSummary(getChange("C-Am")),
    "Keep down: 1 at B1 · 2 at D2",
  );
  assert.equal(anchorSummary(getChange("Fmaj7-Dm")), "Keep down: 2 at G2");
  assert.match(anchorSummary(getChange("A-D")), /3: B2 → B3.*Pressure off/);
  assert.match(anchorSummary(getChange("D-E")), /1: G2 → G1.*Pressure off/);
  assert.equal(
    anchorSummary(getChange("G-D")),
    "Release pressure; no fixed anchor.",
  );
  assert.equal(fingerRoute(getChange("G-D"), 3), "3: e3 → B3");
  assert.match(
    buildChangeImage(getChange("A-D")),
    /marker-end="url\(#arrow-A-D-slide\)"/,
  );
  assert.equal(movementOrder(getChange("A-Am")), "1 → 2 + 3");
  assert.equal(movementOrder(getChange("A-Am"), true), "2 + 3 → 1");
  assert.equal(movementOrder(getChange("Em-E"), true), "Lift 1");
  assert.equal(movementOrder(getChange("Am-Em")), "Lift 1 · 2 + 3");
});
test("Small F reference keeps the mini-barre distinct from Fmaj7 and safely escapes SVG labels", () => {
  const small = workshopChord("F-small"),
    major7 = workshopChord("Fmaj7");
  assert.deepEqual(small.frets, [-1, -1, 3, 2, 1, 1]);
  assert.deepEqual(major7.frets, [-1, -1, 3, 2, 1, 0]);
  assert.match(buildChangeImage(getChange("F-G")), /F \(small\)/);
  const custom = {
    ...getChange("C-Am"),
    focus: 'Keep <contact> & "pressure" correct.',
  };
  const svg = buildChangeImage(custom);
  assert.ok(svg.includes("&lt;contact&gt; &amp; &quot;pressure&quot;"));
  assert.ok(!svg.includes("<contact>"));
});
