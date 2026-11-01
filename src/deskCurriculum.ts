import { changes, chordLabel } from "./lesson7";
import { foundationPracticeUnits } from "./foundations/foundationsPlan";
export type DeskSkill =
  | "setup"
  | "changes"
  | "notes"
  | "rhythm"
  | "barre"
  | "fills";
export type DeskUnit = {
  id: string;
  skill: DeskSkill;
  title: string;
  subtitle: string;
  chords: string[];
  lesson: number;
  focus?: string;
  task: string;
  steps: string[];
  check: string;
  trap: string;
  demo?: string;
  pattern?: number;
  change?: string;
};
export const deskSkills: { id: DeskSkill; title: string; hint: string }[] = [
  {
    id: "setup",
    title: "Get ready to play",
    hint: "Position, strings and your first note",
  },
  {
    id: "changes",
    title: "Chord changes",
    hint: "Keep the right fingers down",
  },
  { id: "notes", title: "Clear notes", hint: "Make each string ring" },
  { id: "rhythm", title: "Rhythm", hint: "Keep your hand and pulse moving" },
  { id: "barre", title: "Barre shapes", hint: "Build the grip gently" },
  { id: "fills", title: "Small fills", hint: "Add a little melody" },
];
export const deskUnits: DeskUnit[] = [
  ...changes.map((c) => ({
    id: c.id,
    skill: "changes" as const,
    title: `${chordLabel(c.from)} ↔ ${chordLabel(c.to)}`,
    subtitle: c.focus,
    chords: [c.from, c.to],
    lesson: 7,
    task: `Make ${chordLabel(c.from)}, follow the finger route, then check ${chordLabel(c.to)}. Return the same way.`,
    steps: c.steps,
    check: c.check,
    trap: c.trap,
    change: c.id,
  })),
  {
    id: "clear-Em",
    skill: "notes",
    title: "A clear Em",
    subtitle: "Two fingers. Six clear strings.",
    chords: ["Em"],
    lesson: 4,
    focus: "Build Em, then check every string",
    task: "Build Em, pick all six strings separately, fix one unclear note, then relax.",
    steps: [
      "Place middle (2) on A2 and ring (3) on D2. Curve both fingertips.",
      "Pick low E, A, D, G, B and high e individually. Low E, G, B and high e stay open.",
      "If a note is dull, check that another fingertip is not touching its string. Move a fretting fingertip close behind the fret wire.",
      "Strum all six strings once, then release your hand. Repeat five relaxed placements.",
    ],
    check: "All six notes ring, and I can release the hand without strain.",
    trap: "A full strum can hide one dead string. Check individual notes before increasing pressure.",
  },
  {
    id: "clear-C",
    skill: "notes",
    title: "A clear C",
    subtitle: "Keep open G and high e free.",
    chords: ["C"],
    lesson: 3,
    focus: "Build C, then check every string",
    task: "Build C and check every intended string once. Skip low E.",
    steps: [
      "Index (1) B1, middle (2) D2, ring (3) A3.",
      "Pick A, D, G, B and high e one at a time. G and high e must ring open.",
      "If G or high e is muted, curve the adjacent fingertips and try again.",
      "Strum from A, release, and rebuild the shape five times.",
    ],
    check: "Open G and high e both ring, and I skip low E.",
    trap: "Flattening index can mute high e; flattening middle can mute open G.",
  },
  {
    id: "clear-D",
    skill: "notes",
    title: "A clear D",
    subtitle: "A small triangle; four sounded strings.",
    chords: ["D"],
    lesson: 3,
    focus: "Build D, then check every string",
    task: "Make the D triangle and check only D, G, B and high e.",
    steps: [
      "Index (1) G2, middle (2) high e2, ring (3) B3. Leave D open.",
      "Pick D, G, B, high e separately. Do not sound A or low E.",
      "If high e is dull, check that the ring fingertip is not leaning into it.",
      "Strum four strings and release. Repeat five clean placements.",
    ],
    check: "All four intended notes sound, with no low E or A in the strum.",
    trap: "Strumming from low E changes the bass and hides whether the small shape is clean.",
  },
  {
    id: "pulse-four",
    skill: "rhythm",
    title: "Four steady downstrokes",
    subtitle: "One easy chord. One even pulse.",
    chords: ["Em"],
    lesson: 4,
    focus: "Keep four steady beats before adding a pattern",
    task: "Count 1, 2, 3, 4. Brush down on every number and keep the spaces even.",
    steps: [
      "Hold one comfortable Em. Set the rhythm tool to 50 BPM or slower if needed.",
      "Say 1, 2, 3, 4 aloud. Downstroke on each number.",
      "Keep the wrist relaxed. An imperfect brush should not stop the counting.",
      "Play four bars on one chord before adding a change.",
    ],
    check: "I can count and play four even bars without stopping.",
    trap: "Rushing the gap between beats makes a simple pattern harder to use.",
    demo: "strum",
    pattern: 0,
  },
  {
    id: "folk",
    skill: "rhythm",
    title: "D D U U D U",
    subtitle: "Eight slots; keep the two silences.",
    chords: ["Em"],
    lesson: 4,
    focus: "Learn D D U U D U in eight slots",
    task: "Count 1 & 2 & 3 & 4 &. Sound D · D U · U D U.",
    steps: [
      "Down on numbers, up on “and”. The hand keeps moving through all eight slots.",
      "Sound down on 1, down-up on 2-&, up on & of 3, down-up on 4-&.",
      "The downstroke on 3 is a silent hand movement. Do not pause there.",
      "Use Em alone for four bars. Only add a chord change after the hand feels steady.",
    ],
    check: "The silent slots keep their spacing and the hand never stops.",
    trap: "Six stroke letters are not six evenly spaced counts. Preserve the eight-slot rhythm.",
    demo: "strum",
    pattern: 1,
  },
  {
    id: "chuck",
    skill: "rhythm",
    title: "A gentle muted strum",
    subtitle: "Chuck on 2 and 4; keep the next upstroke.",
    chords: ["Em"],
    lesson: 8,
    focus: "Replace the downstrokes on 2 and 4",
    task: "Use D · M U · U M U. M replaces the downstroke on beats 2 and 4.",
    steps: [
      "Start with the unmuted folk pattern on one chord.",
      "Let light picking-hand contact and the muted downstroke arrive together on 2 and 4.",
      "Release the damping enough for the upstroke after each chuck to sound.",
      "Use small gentle movements. Isolate D–M–U, then join the whole pattern.",
    ],
    check:
      "The chuck is short, and its following upstroke still sounds in time.",
    trap: "Leaving the palm clamped on the strings can mute the next upstroke too.",
    demo: "mute",
    pattern: 2,
  },
  {
    id: "release-mute",
    skill: "rhythm",
    title: "Release pressure, keep contact",
    subtitle: "The finger stays touching the same place.",
    chords: ["D"],
    lesson: 8,
    focus: "Fretting-hand mute: sound the note, then release pressure",
    task: "Pick high e2, then relax its fretting pressure while keeping the fingertip touching the string.",
    steps: [
      "Fret high e at 2 with one fingertip and pick the note.",
      "After the attack, relax pressure. Keep light contact in the same place.",
      "Listen to the short note stop without an open-string ring or pull-off.",
      "Apply the idea to D’s three fretted notes G2, B3 and high e2. An open D needs its own damping contact.",
    ],
    check:
      "The note stops after its attack, while the fingertip remains in contact.",
    trap: "Lifting the finger completely can produce an open note or unwanted pull-off.",
    demo: "release-mute",
  },
  {
    id: "prepare-E",
    skill: "barre",
    title: "Free the index for a barre",
    subtitle: "Open E using fingers 2, 3 and 4.",
    chords: ["E"],
    lesson: 9,
    focus: "Free the index before moving E",
    task: "Make the same open E pitches with middle, ring and little finger. Keep index free.",
    steps: [
      "Middle (2) G1, ring (3) A2, little (4) D2. Index does not fret anything.",
      "Pluck all six strings. These are the same pitches as open E with a different finger assignment.",
      "Release and rebuild this fingering gently five times.",
      "Only after it is comfortable, move the three-finger shape one fret and add index at fret 1 for F.",
    ],
    check: "E sounds clean using 2–3–4, with index free.",
    trap: "Using the original 1–2–3 open E fingering leaves no free index for the barre.",
    demo: "Eprep",
  },
  {
    id: "full-F",
    skill: "barre",
    title: "Build a full F gently",
    subtitle: "Short attempts; check the index notes.",
    chords: ["F"],
    lesson: 9,
    focus: "Check the barre one string at a time",
    task: "Build full F, check each string, then release completely.",
    steps: [
      "Index (1) across fret 1. Ring (3) A3, little (4) D3, middle (2) G2.",
      "Place index close behind the fret wire. Try a small comfortable roll toward its firmer edge.",
      "Check low E1, B1 and high e1 against index, then the other three notes.",
      "Release after each short attempt. If first-position reach is difficult, practise the shape at a comfortable higher fret first.",
    ],
    check:
      "I know which string needs an adjustment and can release a relaxed grip.",
    trap: "Maximum squeezing and forced pain do not make a better barre. Change placement and rest.",
    demo: "barre",
  },
  {
    id: "A-family",
    skill: "barre",
    title: "Find C with an A shape",
    subtitle: "Root/barre fret 3; upper fingers at 5.",
    chords: ["C"],
    lesson: 9,
    focus: "Read barre fret versus higher finger fret",
    task: "Read the root/barre fret separately from the higher three-finger row.",
    steps: [
      "For A-shape C, index/root is on A3. The D, G and B notes are at fret 5.",
      "Keep the low E silent. Index also supplies high e3 if you play that note.",
      "Prepare open A with middle on D2, ring G2 and little B2, leaving index free.",
      "Move that whole group up three frets and add index at fret 3. Check one string at a time.",
    ],
    check:
      "I can name the root at A3 rather than calling the chord from the upper fret-5 row.",
    trap: "“The fifth fret” can describe another finger. Name this shape from its A-string root.",
    demo: "Aprep",
  },
  {
    id: "small-fill",
    skill: "fills",
    title: "Three notes between chords",
    subtitle: "High e: open → fret 1 → fret 3.",
    chords: ["C"],
    lesson: 10,
    task: "Play a short E–F–G phrase and return to C on the next beat 1.",
    steps: [
      "On high e, play open e, index at fret 1 (F), ring at fret 3 (G).",
      "First play the three notes slowly and clearly, without a rhythm.",
      "Strum C on beats 1 and 2. Play open e on 3, F on & of 3, G on 4; let G ring through & of 4.",
      "Return to C on the next beat 1. Use fewer notes if the return becomes late.",
    ],
    check: "The fill fits inside the bar and I return to C on beat 1.",
    trap: "Adding notes is useful only while the pulse continues. Keep the phrase short.",
    demo: "fill",
  },
  ...foundationPracticeUnits,
];
export const deskUnit = (id: string) =>
  deskUnits.find((u) => u.id === id) ?? deskUnits[0];
