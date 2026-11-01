import { chords, openMidi } from "../course";
import { fingerPosition, workshopChord } from "../lesson7";
export type StudyNote = { stringIndex: number; fret: number };
export type StudyFinger = { finger: number; stringIndex: number; fret: number };
export type StudyChord = {
  name: string;
  fingers: StudyFinger[];
  frets: number[];
  barre: readonly [number, number, number] | null;
  midis: number[];
};
const pitchNames = [
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
export function resolveStudyNote(note: StudyNote | null | undefined) {
  if (
    !note ||
    !Number.isInteger(note.stringIndex) ||
    note.stringIndex < 0 ||
    note.stringIndex > 5 ||
    !Number.isInteger(note.fret) ||
    note.fret < 0 ||
    note.fret > 4
  )
    return null;
  const midi = openMidi[note.stringIndex] + note.fret;
  return {
    ...note,
    midi,
    pitch: `${pitchNames[midi % 12]}${Math.floor(midi / 12) - 1}`,
    open: note.fret === 0,
  };
}
export function resolveStudyChord(
  name: string | null | undefined,
): StudyChord | null {
  if (
    !name ||
    (name !== "F-small" && !chords.some((chord) => chord.name === name))
  )
    return null;
  const chord = workshopChord(name),
    fingers: StudyFinger[] = [];
  for (let finger = 1; finger <= 4; finger++) {
    const position = fingerPosition(chord, finger);
    if (position)
      fingers.push({
        finger,
        stringIndex: position.string,
        fret: position.fret,
      });
  }
  return {
    name,
    fingers,
    frets: [...chord.frets],
    barre: chord.barre ? ([...chord.barre] as [number, number, number]) : null,
    midis: chord.frets.flatMap((fret, index) =>
      fret < 0 ? [] : [openMidi[index] + fret],
    ),
  };
}

/** One coordinate contract for the physical string tubes and their study markers. */
export const GUITAR_STRING_LAYOUT = {
  nutY: 2.12,
  bridgeY: -1.08,
  nutSpacing: 0.035,
  bridgeSpacing: 0.05,
  nutZ: 0.274,
  bridgeZ: 0.294,
} as const;
export function studyStringCenter(stringIndex: number, y: number) {
  if (
    !Number.isInteger(stringIndex) ||
    stringIndex < 0 ||
    stringIndex > 5 ||
    !Number.isFinite(y)
  )
    throw new RangeError("A string point needs index 0–5 and a finite height");
  const layout = GUITAR_STRING_LAYOUT,
    blend = Math.max(
      0,
      Math.min(1, (layout.nutY - y) / (layout.nutY - layout.bridgeY)),
    );
  return {
    x:
      (stringIndex - 2.5) *
      (layout.nutSpacing + (layout.bridgeSpacing - layout.nutSpacing) * blend),
    y,
    z: layout.nutZ + (layout.bridgeZ - layout.nutZ) * blend,
  };
}
export function studyStringEndpoints(stringIndex: number) {
  return {
    nut: studyStringCenter(stringIndex, GUITAR_STRING_LAYOUT.nutY),
    bridge: studyStringCenter(stringIndex, GUITAR_STRING_LAYOUT.bridgeY),
  };
}
