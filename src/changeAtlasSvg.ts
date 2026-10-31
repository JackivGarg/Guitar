import {
  changes,
  chordLabel,
  fingerPosition,
  workshopChord,
  type Change,
} from "./lesson7";
import type { Chord } from "./course";
const esc = (v: string | number) =>
  String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const strings = ["E", "A", "D", "G", "B", "e"];
const colours = {
  anchor: "#4c775f",
  slide: "#3f7695",
  move: "#a56847",
  ink: "#49324d",
};
const pos = (p: { string: number; fret: number }) => ({
  x: 35 + p.string * 35,
  y: 117 + (p.fret - 0.5) * 43,
});
function wrap(value: string, width: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of value.split(/\s+/)) {
    if (line.length + word.length + 1 > width && line) {
      lines.push(line);
      line = word;
    } else line += (line ? " " : "") + word;
  }
  if (line) lines.push(line);
  return lines;
}
function textLines(
  value: string,
  x: number,
  y: number,
  width: number,
  size = 16,
  colour = "#6f5d74",
  limit = 10,
) {
  return wrap(value, width)
    .slice(0, limit)
    .map(
      (l, i) =>
        `<text x="${x}" y="${y + i * (size + 7)}" font-size="${size}" fill="${colour}">${esc(l)}</text>`,
    )
    .join("");
}
function frame(chord: Chord, x: number, label: string) {
  const first = Math.min(...chord.frets.filter((f) => f > 0)),
    base = first > 3 ? first : 1;
  let svg = `<g transform="translate(${x} 0)"><text x="122" y="76" text-anchor="middle" font-size="19" font-weight="600" fill="#705478">${esc(label)}</text>`;
  for (let s = 0; s < 6; s++)
    svg += `<line x1="${35 + s * 35}" x2="${35 + s * 35}" y1="117" y2="289" stroke="#bcafbf" stroke-width="${2.4 - s * 0.2}"/><text x="${35 + s * 35}" y="105" text-anchor="middle" font-size="20" fill="#705e77">${chord.frets[s] < 0 ? "×" : chord.frets[s] === 0 ? "○" : ""}</text><text x="${35 + s * 35}" y="315" text-anchor="middle" font-size="17" fill="#796480">${strings[s]}</text>`;
  for (let f = 0; f < 5; f++)
    svg += `<line x1="35" x2="210" y1="${117 + f * 43}" y2="${117 + f * 43}" stroke="${f === 0 && base === 1 ? "#60476a" : "#cfc1d2"}" stroke-width="${f === 0 && base === 1 ? 5 : 1.5}"/>`;
  return svg;
}
function drawShape(
  chord: Chord,
  x: number,
  other: Chord,
  slides: number[] = [],
) {
  let svg = frame(
    chord,
    x,
    chordLabel(chord.name === "F · small shape" ? "F-small" : chord.name),
  );
  if (chord.barre) {
    const [f, s, e] = chord.barre;
    svg += `<rect x="${35 + s * 35 - 12}" y="${117 + (f - 0.5) * 43 - 12}" width="${(e - s) * 35 + 24}" height="24" rx="12" fill="#60476a"/><text x="${35 + s * 35}" y="${123 + (f - 0.5) * 43}" text-anchor="middle" fill="white" font-size="17" font-weight="600">1</text>`;
  }
  for (let i = 0; i < 6; i++) {
    const f = chord.frets[i],
      finger = chord.fingers[i];
    if (f <= 0 || finger <= 0 || (finger === 1 && chord.barre)) continue;
    const a = { string: i, fret: f },
      b = fingerPosition(other, finger),
      same = b && a.string === b.string && a.fret === b.fret;
    const p = pos(a),
      colour = same
        ? colours.anchor
        : slides.includes(finger)
          ? colours.slide
          : colours.ink;
    svg += `<circle cx="${p.x}" cy="${p.y}" r="13" fill="${colour}"/><text x="${p.x}" y="${p.y + 6}" text-anchor="middle" font-size="18" font-weight="600" fill="white">${finger}</text>`;
  }
  return svg + "</g>";
}
export function fingerRoute(c: Change, finger: number) {
  const a = fingerPosition(workshopChord(c.from), finger),
    b = fingerPosition(workshopChord(c.to), finger);
  const compact = (p: typeof a) =>
    p ? `${strings[p.string]}${p.fret}` : "off";
  return `${finger}: ${compact(a)} → ${compact(b)}`;
}
export function movementOrder(c: Change, reverse = false) {
  const source = workshopChord(reverse ? c.to : c.from),
    target = workshopChord(reverse ? c.from : c.to);
  const lifted = [1, 2, 3, 4].filter(
    (f) => fingerPosition(source, f) && !fingerPosition(target, f),
  );
  const moved = (reverse ? (c.reverseGroups ?? c.groups) : c.groups)
    .map((group) => group.filter((f) => fingerPosition(target, f)))
    .filter((group) => group.length)
    .map((group) => group.join(" + "))
    .join(" → ");
  return (
    (lifted.length ? "Lift " + lifted.join(" + ") + (moved ? " · " : "") : "") +
    moved
  );
}
export function anchorSummary(c: Change) {
  const a = workshopChord(c.from),
    b = workshopChord(c.to);
  const anchors = [1, 2, 3, 4].filter((f) => {
    const p = fingerPosition(a, f),
      q = fingerPosition(b, f);
    return p && q && p.string === q.string && p.fret === q.fret;
  });
  if (anchors.length)
    return (
      "Keep down: " +
      anchors
        .map((f) => {
          const p = fingerPosition(a, f)!;
          return `${f} at ${strings[p.string]}${p.fret}`;
        })
        .join(" · ")
    );
  if (c.slide?.length)
    return (
      "Light-contact slide: " +
      c.slide.map((f) => fingerRoute(c, f)).join(" · ") +
      ". Pressure off."
    );
  return "Release pressure; no fixed anchor.";
}
function movement(c: Change) {
  const a = workshopChord(c.from),
    b = workshopChord(c.to);
  let svg = frame(a, 325, "MOVEMENT · LIFT / SLIDE");
  const marker = `arrow-${esc(c.id)}`;
  svg += `<defs><marker id="${marker}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#a56847"/></marker><marker id="${marker}-slide" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#3f7695"/></marker></defs>`;
  for (const finger of [1, 2, 3, 4]) {
    const p = fingerPosition(a, finger),
      q = fingerPosition(b, finger);
    if (!p && !q) continue;
    if (p && q && p.string === q.string && p.fret === q.fret) {
      const at = pos(p);
      svg += `<circle cx="${at.x}" cy="${at.y}" r="15" fill="${colours.anchor}"/><text x="${at.x}" y="${at.y + 6}" text-anchor="middle" font-size="18" font-weight="600" fill="white">${finger}</text>`;
      continue;
    }
    const start = p ? pos(p) : { x: 230, y: 130 + finger * 35 },
      end = q ? pos(q) : { x: 230, y: 130 + finger * 35 };
    const slide = c.slide?.includes(finger),
      colour = slide ? colours.slide : colours.move;
    if (p)
      svg += `<circle cx="${start.x}" cy="${start.y}" r="13" fill="#fffaf6" stroke="${colour}" stroke-width="2.5" stroke-dasharray="4 3"/>`;
    const dx = end.x - start.x,
      dy = end.y - start.y,
      dist = Math.max(1, Math.hypot(dx, dy));
    if (dist > 1) {
      const ux = dx / dist,
        uy = dy / dist;
      svg += `<path d="M${start.x + ux * 15} ${start.y + uy * 15}L${end.x - ux * 16} ${end.y - uy * 16}" stroke="${colour}" fill="none" stroke-width="3" ${slide ? "" : 'stroke-dasharray="5 3"'} marker-end="url(#${marker}${slide ? "-slide" : ""})"/>`;
    }
    svg += `<circle cx="${end.x}" cy="${end.y}" r="13" fill="#fffaf6" stroke="${colour}" stroke-width="2.5"/><text x="${end.x}" y="${end.y + 6}" text-anchor="middle" font-size="18" font-weight="600" fill="${colour}">${finger}</text>`;
    if (!q)
      svg += `<text x="${end.x}" y="${end.y + 28}" text-anchor="middle" font-size="12" fill="${colour}">OFF</text>`;
  }
  return svg + "</g>";
}
function cardBody(c: Change, index: number, includeNotes: boolean) {
  const a = workshopChord(c.from),
    b = workshopChord(c.to);
  const routes = [1, 2, 3, 4]
    .filter((f) => fingerPosition(a, f) || fingerPosition(b, f))
    .map((f) => fingerRoute(c, f))
    .join("     ");
  let body = `<rect x="1" y="1" width="898" height="${includeNotes ? 588 : 388}" rx="20" fill="#fffdfa" stroke="#dfd2e2" stroke-width="2"/><text x="27" y="38" font-size="25" font-weight="600" fill="#49324d">${String(index + 1).padStart(2, "0")} · ${esc(chordLabel(c.from))} → ${esc(chordLabel(c.to))}</text><text x="874" y="37" text-anchor="end" font-size="16" fill="#8e7696">1 index · 2 middle · 3 ring</text>`;
  body +=
    drawShape(a, 25, b, c.slide) + movement(c) + drawShape(b, 625, a, c.slide);
  body += `<text x="450" y="349" text-anchor="middle" font-size="19" font-weight="600" fill="#6f507a">${esc(routes)}</text><text x="450" y="378" text-anchor="middle" font-size="17" fill="#7f6886">Move groups: ${esc(movementOrder(c))} · Reverse: ${esc(movementOrder(c, true))}</text>`;
  if (includeNotes) {
    body += `<text x="28" y="407" font-size="14" fill="#8b7492">Green = fixed anchor · Blue = light-contact slide · Outlined dot = pressure off</text>`;
    body += textLines(anchorSummary(c), 28, 425, 96, 18, "#4d725c");
    body += textLines(c.focus, 28, 460, 96, 18, "#49324d", 3);
    body += textLines(c.release, 28, 535, 105, 16, "#796180", 2);
  }
  return body;
}
export function buildChangeImage(
  c: Change,
  index = changes.findIndex((x) => x.id === c.id),
  includeNotes = true,
) {
  const height = includeNotes ? 590 : 390;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="${height}" viewBox="0 0 900 ${height}" role="img" aria-label="${esc(chordLabel(c.from) + " to " + chordLabel(c.to) + " complete finger-change reference")}" font-family="Segoe UI,Arial,sans-serif">${cardBody(c, index, includeNotes)}</svg>`;
}
export function buildChangeSheet() {
  const width = 1880,
    height = 5100;
  let body = `<rect width="${width}" height="${height}" fill="#f7f3f7"/><text x="42" y="62" font-family="Segoe UI,Arial,sans-serif" font-size="38" font-weight="600" fill="#49324d">Six Strings · All 15 chord changes</text><text x="42" y="105" font-family="Segoe UI,Arial,sans-serif" font-size="23" fill="#6a5573">Green = fixed anchor · Blue = light-contact slide · Outlined dots = pressure released · E = low E, e = high e</text><text x="42" y="145" font-family="Segoe UI,Arial,sans-serif" font-size="21" fill="#6a5573">Each image shows start → movement → finish. Numbers are fingers. Small F uses a two-string mini-barre, not full F.</text>`;
  changes.forEach((c, i) => {
    const x = 30 + (i % 2) * 930,
      y = 180 + Math.floor(i / 2) * 610;
    body += `<g transform="translate(${x} ${y})" font-family="Segoe UI,Arial,sans-serif">${cardBody(c, i, true)}</g>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
}
