export const practiceStages = [
  {
    title: "Make one chord clear",
    seconds: 120,
    chords: ["Em"],
    lesson: 4,
    chapter: "Build Em, then check every string",
    instruction:
      "Place middle on A2 and ring on D2. Pick all six strings separately. Adjust only the finger causing a dull note, strum once, then relax.",
    success: "All six notes ring; your hand can release without strain.",
  },
  {
    title: "Move only what needs to move",
    seconds: 120,
    chords: ["C", "Am"],
    lesson: 7,
    chapter: "C-Am",
    instruction:
      "Hold index on B1 and middle on D2. Move only ring A3 → G2, then return it to A3. Check each chord before the next change.",
    success: "Index and middle stayed down in both directions.",
  },
  {
    title: "Keep four steady beats",
    seconds: 120,
    chords: ["Em"],
    lesson: 4,
    chapter: "Keep four steady beats before adding a pattern",
    instruction:
      "Stay on Em. Count 1, 2, 3, 4 and brush down on each number. Keep your wrist loose. Use the play-along below for a steady pulse.",
    success: "You can count four even beats without rushing.",
  },
  {
    title: "Make a little music",
    seconds: 240,
    chords: ["C", "Am", "Em", "E"],
    lesson: 7,
    chapter: "C-Am",
    instruction:
      "Play C → Am → Em → E with four slow downstrokes on each chord. Use two bars per chord if the changes need more time. Keep counting through each change.",
    success: "Complete one whole round, even if it needs a slower tempo.",
  },
];
export const routineSeconds = practiceStages.reduce((n, s) => n + s.seconds, 0);
export const stageStarts = practiceStages.map((_, i) =>
  practiceStages.slice(0, i).reduce((n, s) => n + s.seconds, 0),
);
export function routinePosition(seconds: number) {
  const bounded = Math.max(0, Math.min(routineSeconds, seconds));
  const index = practiceStages.findIndex(
    (s, i) => bounded < stageStarts[i] + s.seconds,
  );
  const stage = index < 0 ? practiceStages.length - 1 : index;
  return {
    stage,
    remaining: Math.max(
      0,
      stageStarts[stage] + practiceStages[stage].seconds - bounded,
    ),
    complete: bounded >= routineSeconds,
  };
}
export function progressionBeat(
  quarter: number,
  chordCount: number,
  barsPerChord = 1,
) {
  if (quarter < 4)
    return { countIn: true, beat: quarter + 1, chord: 0, next: 0, round: 0 };
  const played = quarter - 4,
    perChord = barsPerChord * 4;
  return {
    countIn: false,
    beat: (played % 4) + 1,
    chord: Math.floor(played / perChord) % chordCount,
    next: (Math.floor(played / perChord) + 1) % chordCount,
    round: Math.floor(played / (perChord * chordCount)) + 1,
  };
}
