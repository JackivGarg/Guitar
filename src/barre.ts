import type { Chord } from "./course";
export type Family = "E" | "A";
export type Quality = "major" | "minor";
export const sharpNotes = [
  "C",
  "C♯",
  "D",
  "D♯",
  "E",
  "F",
  "F♯",
  "G",
  "G♯",
  "A",
  "A♯",
  "B",
];
export const flatNotes = [
  "C",
  "D♭",
  "D",
  "E♭",
  "E",
  "F",
  "G♭",
  "G",
  "A♭",
  "A",
  "B♭",
  "B",
];
export function barreChord(
  family: Family,
  quality: Quality,
  fret: number,
  flats = false,
): Chord {
  if (!Number.isInteger(fret) || fret < 1 || fret > 12)
    throw new RangeError("Barre fret must be 1–12");
  const minor = quality === "minor",
    r = fret,
    root = ((family === "E" ? 4 : 9) + r) % 12;
  return {
    name: (flats ? flatNotes : sharpNotes)[root] + (minor ? "m" : ""),
    frets:
      family === "E"
        ? [r, r + 2, r + 2, minor ? r : r + 1, r, r]
        : [-1, r, r + 2, r + 2, minor ? r + 1 : r + 2, r],
    fingers:
      family === "E"
        ? [1, 3, 4, minor ? 1 : 2, 1, 1]
        : [0, 1, minor ? 3 : 2, minor ? 4 : 3, minor ? 2 : 4, 1],
    barre: [r, family === "E" ? 0 : 1, 5],
    tip: `${family}-shape ${quality}. Root on ${family === "E" ? "low E" : "A"} at fret ${r}. ${family === "A" ? "Skip low E." : "Sound all six strings."}`,
  };
}
