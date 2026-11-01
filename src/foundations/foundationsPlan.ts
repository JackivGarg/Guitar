import type { DeskUnit } from "../deskCurriculum";

export const foundationPracticeUnits: DeskUnit[] = [
  {
    id: "setup-posture",
    skill: "setup",
    title: "Hold the instrument comfortably",
    subtitle: "Let the support carry the guitar.",
    chords: [],
    lesson: 3,
    focus: "Set the instrument on a stable support",
    task: "Set the guitar on a stable support and keep both hands free enough to play.",
    steps: [
      "Sit on a stable chair. In a typical right-handed casual position, rest the guitar waist on the right thigh; a supported classical position is also valid.",
      "Bring the body close enough that you do not reach with a raised shoulder. Let the picking forearm rest comfortably on the body.",
      "Raise the neck slightly. Keep the guitar upright enough to play rather than laying the face flat to see every fret.",
      "Let the seat, leg and forearm support the instrument. Relax the fretting hand briefly: it should not have to grip the neck to keep the guitar from falling.",
      "Hold this position for 30 seconds, then place a fingertip on the neck without hunching the shoulder. Adjust the support if the instrument shifts.",
    ],
    check:
      "I can hold the guitar for 30 seconds with relaxed shoulders and without clamping the neck to support its weight.",
    trap: "Tilting the whole guitar flat to see the fingerboard can make the fretting wrist reach awkwardly. Adjust your view and support first.",
  },
  {
    id: "setup-strings",
    skill: "setup",
    title: "Find and name six strings",
    subtitle: "Thick to thin: E A D G B e.",
    chords: [],
    lesson: 2,
    focus: "Name and number all six strings",
    task: "Point to, name and gently pluck each open string in both directions.",
    steps: [
      "In a normal playing position, the thickest string nearest the ceiling is low E: string 6.",
      "Move toward the floor through string 5 A, string 4 D, string 3 G, string 2 B and string 1 high e.",
      "Pluck each once and say its number and name: 6-E, 5-A, 4-D, 3-G, 2-B, 1-e.",
      "Return from thin to thick: 1-e, 2-B, 3-G, 4-D, 5-A, 6-E. The outside strings share the letter E but sound in different octaves.",
      "Pick three strings in a different order and name them before looking at the app. Use the tuning tool reference buttons to hear the intended pitches.",
    ],
    check:
      "I can find strings 1 and 6 and name all six strings in either direction.",
    trap: "String numbers start at thin high e, while the thick-to-thin name list starts with low E. Keep the direction clear.",
  },
  {
    id: "setup-tuning",
    skill: "setup",
    title: "Tune one string at a time",
    subtitle: "Follow the string before turning its peg.",
    chords: [],
    lesson: 2,
    focus: "Read a tuning meter correctly",
    task: "Select the intended string in the tuner and compare one gently plucked open note with its target.",
    steps: [
      "Use standard targets E2 A2 D3 G3 B3 E4, from thick to thin. Choose the intended string before plucking it.",
      "Hear the reference first, then let it fade before checking your guitar. A playing reference can be picked up by the microphone and mistaken for the guitar note.",
      "Follow that actual string from the nut to its tuning post. Headstock layouts vary; do not choose a peg by position alone.",
      "Pluck only that open string. Wait for a steady reading: flat is below the target, sharp is above it.",
      "Make one small adjustment and pluck again. Tightening generally raises pitch and loosening lowers it; the turning direction depends on the winding.",
      "If a string is far out and its octave is uncertain, stop tightening and compare with a dedicated tuner or an experienced player. Check all six individually, then recheck the full set.",
    ],
    check:
      "I checked each selected string individually, used its correct peg and rechecked the full set.",
    trap: "A chord gives a single-note tuner several pitches at once. A correct letter alone also does not establish the correct octave.",
  },
  {
    id: "setup-fingers",
    skill: "setup",
    title: "Read fingers, frets and diagrams",
    subtitle: "A finger number is not a fret number.",
    chords: [],
    lesson: 3,
    focus: "Learn finger numbers before the diagrams",
    task: "Name your four fretting fingers, then decode one numbered dot in a chord diagram.",
    steps: [
      "On the fretting hand, 1 means index, 2 middle, 3 ring and 4 little finger. The thumb supports the neck from behind.",
      "Touch each fingertip to the thumb while saying 1, 2, 3, 4; then find the fingers in a different order.",
      "In the front-view diagram, vertical strings run low E on the left to high e on the right. Horizontal lines mark frets.",
      "A dot marked 3 at fret 2 means ring finger at fret 2. The number identifies the finger; its diagram space identifies the fret.",
      "O means sound the string open. A cross means omit it. Read one string at a time before placing the whole shape.",
    ],
    check:
      "I can identify fingers 1–4, read a finger/fret dot and explain open O versus omitted ×.",
    trap: "Placing each numbered dot at the matching fret number mixes two instructions. Read its position and finger label separately.",
  },
  {
    id: "setup-fret",
    skill: "setup",
    title: "Make one clear fretted note",
    subtitle: "Close behind the metal fret; light enough pressure.",
    chords: [],
    lesson: 3,
    focus: "Use the thumb as support, not a clamp",
    task: "Fret high e at fret 1, pick it once, listen, then release. Repeat five relaxed placements.",
    steps: [
      "Find thin high e and the first fret space next to the nut. Use index fingertip (1).",
      "Place the fingertip close behind the first metal fret, on the nut side inside the fret space. Avoid resting directly on the wire.",
      "Pluck high e gently with the picking thumb or a pick. Keep the fretting fingertip curved.",
      "If it buzzes, move a little closer behind the wire and use enough pressure for a clear sound. The string does not need to be crushed into the wood.",
      "Release completely after each note. Make five attempts with the lightest comfortable pressure that clears the note. Stop forced strain or sharp pain.",
    ],
    check:
      "I can place, sound and release high e1 five times without tensing the whole hand.",
    trap: "Squeezing harder before checking placement can add tension without fixing the note. This is an authored coordination exercise based on the source technique.",
  },
  {
    id: "clear-Am",
    skill: "notes",
    title: "A clear Am",
    subtitle: "Five strings, from open A.",
    chords: ["Am"],
    lesson: 4,
    focus: "Build Am, then check every string",
    task: "Place Am, check A through high e separately and keep the open strings clear.",
    steps: [
      "Index (1) B1, middle (2) D2 and ring (3) G2. Leave A and high e open.",
      "Pick A, D, G, B and high e individually. Omit low E from the strum.",
      "Keep index curved so its side does not mute high e. Middle and ring each fret their own string.",
      "Strum from open A, release and rebuild five times. Make the placement clear before attempting a fast change.",
    ],
    check:
      "All five intended notes sound, including open A and high e, with low E omitted.",
    trap: "Letting index flatten can mute open high e. Check that string separately.",
  },
  {
    id: "clear-G",
    skill: "notes",
    title: "A clear G",
    subtitle: "The three-finger shape used in the change method.",
    chords: ["G"],
    lesson: 4,
    focus: "Build G, then check every string",
    task: "Place the three-finger G shape and check all six strings before strumming.",
    steps: [
      "Middle (2) low E3, index (1) A2 and ring (3) high e3.",
      "Leave D, G and B open. Pick all six strings individually from low E to high e.",
      "Check that index does not lean into open D and that ring only frets high e.",
      "Strum all six, release fully and rebuild five times. Keep this fingering for the verified G-to-D change so its route remains consistent.",
    ],
    check: "All six notes ring using middle low E3, index A2 and ring high e3.",
    trap: "Several G fingerings exist. Changing finger assignments changes which finger can serve as the taught reference.",
  },
  {
    id: "clear-A",
    skill: "notes",
    title: "A clear A",
    subtitle: "Index, middle, ring across fret 2.",
    chords: ["A"],
    lesson: 3,
    focus: "Build A, then check every string",
    task: "Place the 1–2–3 A fingering and check all five intended strings.",
    steps: [
      "Index (1) D2, middle (2) G2 and ring (3) B2. Leave A and high e open; skip low E.",
      "Arrange the fingertips compactly in fret 2 without forcing a rigid line.",
      "Pick A, D, G, B and high e separately. If high e is muted, check the side of ring.",
      "Strum from open A, release and rebuild five times. Keep these finger assignments for the verified A-to-D guide slide.",
    ],
    check:
      "All five intended strings sound using fingers 1–2–3, with low E omitted.",
    trap: "Flattening ring can mute high e. Another A fingering can be valid, but it changes the exact A-to-D route taught here.",
  },
  {
    id: "clear-E",
    skill: "notes",
    title: "A clear E",
    subtitle: "Keep the Em pair; add index to G1.",
    chords: ["E"],
    lesson: 3,
    focus: "Build E, then check every string",
    task: "Build E major with index, middle and ring and check all six strings.",
    steps: [
      "Index (1) G1, middle (2) A2 and ring (3) D2. Leave low E, B and high e open.",
      "Pick all six separately. Keep the side of index clear of open B.",
      "Compare with Em: middle A2 and ring D2 are shared; index adds G1 for E major.",
      "Strum once, release and rebuild five times. Open-chord changes use this 1–2–3 fingering; later barre preparation uses 2–3–4.",
    ],
    check:
      "All six strings ring, and I can identify index G1 as the difference from Em.",
    trap: "Do not substitute the later 2–3–4 barre preparation in a route that assumes open E with index G1.",
  },
];

export type FoundationTarget =
  | { kind: "practice"; unit: string }
  | { kind: "jam" };
export type FoundationCheck = {
  id: string;
  title: string;
  target: FoundationTarget;
  criterion: string;
  preparation: string[];
  guide?: { lesson: number; focus?: string };
};
export type FoundationChapter = {
  id: string;
  title: string;
  description: string;
  practice: string;
  checks: FoundationCheck[];
  later?: boolean;
};
const task = (
  unit: string,
  title: string,
  criterion: string,
  preparation: string[] = [],
  guide?: FoundationCheck["guide"],
): FoundationCheck => ({
  id: unit,
  title,
  target: { kind: "practice", unit },
  criterion,
  preparation,
  guide,
});
export const foundationsPlan: FoundationChapter[] = [
  {
    id: "ready",
    title: "Get ready to play",
    description:
      "Find a comfortable position, know the strings, and make one note sound clearly.",
    practice:
      "Keep the guitar in your hands as you work through these checks. You can return to any one at the beginning of a session.",
    checks: [
      task(
        "setup-posture",
        "Let the guitar rest comfortably",
        "Hold it for 30 seconds with relaxed shoulders and a free fretting hand.",
        [],
        { lesson: 3, focus: "Set the instrument on a stable support" },
      ),
      task(
        "setup-strings",
        "Name the six strings",
        "Find 1 and 6, then name all six in either direction.",
        ["setup-posture"],
        { lesson: 2, focus: "Name and number all six strings" },
      ),
      task(
        "setup-tuning",
        "Check standard tuning",
        "Select, pluck and check each open string individually, then recheck.",
        ["setup-strings"],
        { lesson: 2, focus: "Read a tuning meter correctly" },
      ),
      task(
        "setup-fingers",
        "Read finger and fret numbers",
        "Identify fingers 1–4 and explain one dot, an O and a cross.",
        ["setup-strings"],
        { lesson: 3, focus: "Learn finger numbers before the diagrams" },
      ),
      task(
        "setup-fret",
        "Sound one fretted note",
        "Place, sound and release high e1 five relaxed times.",
        ["setup-posture", "setup-fingers"],
        { lesson: 3, focus: "Use the thumb as support, not a clamp" },
      ),
    ],
  },
  {
    id: "open",
    title: "Give each chord a clear voice",
    description:
      "Seven useful open shapes. Listen to the individual strings before judging the full strum.",
    practice:
      "Choose one shape per short practice block. Place it, pluck each intended string, strum once, then release. A clean placement matters more than a fast one.",
    checks: [
      task(
        "clear-Em",
        "Em · two fingers, six strings",
        "Middle A2 and ring D2; all six notes ring.",
        ["setup-fret"],
      ),
      task(
        "clear-Am",
        "Am · five strings",
        "Index B1, middle D2, ring G2; open A and high e stay clear.",
        ["setup-fret"],
      ),
      task(
        "clear-C",
        "C · keep the open strings free",
        "Index B1, middle D2, ring A3; open G and high e ring.",
        ["setup-fret"],
      ),
      task(
        "clear-G",
        "G · the three-finger reference shape",
        "Middle low E3, index A2, ring high e3; all six strings ring.",
        ["setup-fret"],
      ),
      task(
        "clear-D",
        "D · the small triangle",
        "Index G2, middle high e2, ring B3; strum from open D.",
        ["setup-fret"],
      ),
      task(
        "clear-A",
        "A · make room at fret 2",
        "Index D2, middle G2, ring B2; strum from open A.",
        ["setup-fret"],
      ),
      task(
        "clear-E",
        "E · add index to the Em pair",
        "Index G1, middle A2, ring D2; all six strings ring.",
        ["clear-Em"],
      ),
    ],
  },
  {
    id: "movement",
    title: "Keep what stays. Move what changes.",
    description:
      "Use the instructor-checked finger routes to connect the shapes you know.",
    practice:
      "Begin with these three connected changes. Both directions count: check the destination before returning. The complete set of fifteen stays available in the practice desk and image reference.",
    checks: [
      task(
        "C-Am",
        "C ↔ Am · two real anchors",
        "Index B1 and middle D2 stay pressed; only ring moves A3 ↔ G2.",
        ["clear-C", "clear-Am"],
      ),
      task(
        "Am-Em",
        "Am ↔ Em · move a pair",
        "Middle and ring move one string together; index lifts for Em and returns for Am.",
        ["clear-Am", "clear-Em"],
      ),
      task(
        "Em-E",
        "Em ↔ E · add one finger",
        "Middle A2 and ring D2 stay; add or lift index G1.",
        ["clear-Em", "clear-E"],
      ),
    ],
  },
  {
    id: "pulse",
    title: "Give the movement a pulse",
    description:
      "Let your picking hand carry time while the fretting hand prepares the next shape.",
    practice:
      "Stay on one chord first. Count aloud, keep the wrist loose, and preserve the silent hand movements when you add a pattern.",
    checks: [
      task(
        "pulse-four",
        "Four even downstrokes",
        "Count 1–2–3–4 through four steady bars without stopping.",
        ["clear-Em"],
      ),
      task(
        "folk",
        "The folk pattern in eight slots",
        "Play D · D U · U D U while the hand keeps moving through both silent slots.",
        ["pulse-four"],
      ),
    ],
  },
  {
    id: "music",
    title: "Turn the checks into music",
    description:
      "A first musical practice does not need every technique in this path.",
    practice:
      "Use C → Am → Em → E, starting with plain downstrokes and two bars per chord if you want more preparation time. Complete a slow round, then adjust the tempo to your hands.",
    checks: [
      {
        id: "first-progression",
        title: "Play one complete progression",
        target: { kind: "jam" },
        criterion:
          "Finish one complete round, keep counting through the changes, and return to the next beat 1.",
        preparation: ["C-Am", "Am-Em", "Em-E", "pulse-four"],
      },
    ],
  },
  {
    id: "routes",
    title: "Expand your movement vocabulary",
    description:
      "The other exact finger routes stay here when a progression calls for them.",
    practice:
      "Choose the pair you want to use. Keep the stated anchors, guide contact, group order and return route; the four-string small F stays distinct from Fmaj7 and full barre F.",
    later: true,
    checks: [
      task(
        "C-Fmaj7",
        "C ↔ Fmaj7",
        "Index B1 stays; middle and ring move together.",
        ["clear-C"],
      ),
      task(
        "A-D",
        "A ↔ D",
        "Ring slides lightly along B2 ↔ B3 with pressure off; the other fingers form the target group.",
        ["clear-A", "clear-D"],
      ),
      task(
        "Fmaj7-G",
        "Fmaj7 ↔ G",
        "Lead with index A2, then bring the other target fingers as a group.",
        ["clear-G"],
      ),
      task(
        "F-G",
        "Small F ↔ G",
        "Keep the small-F identity and follow the leading index route.",
        ["clear-G"],
      ),
      task(
        "A-Am",
        "A ↔ Am",
        "Follow index-first toward Am and the grouped return toward A.",
        ["clear-A", "clear-Am"],
      ),
      task(
        "Fmaj7-Dm",
        "Fmaj7 ↔ Dm",
        "Keep middle at G2 while index and ring move as a group.",
        [],
      ),
      task(
        "C-Dm",
        "C ↔ Dm",
        "Index finds high e1 first, then middle and ring move together.",
        ["clear-C"],
      ),
      task(
        "G-D",
        "G ↔ D",
        "Ring is a moving reference, not a stationary anchor; high e3 changes to B3.",
        ["clear-G", "clear-D"],
      ),
      task(
        "D-Em",
        "D ↔ Em",
        "Middle and ring form the Em pair together; index comes off.",
        ["clear-D", "clear-Em"],
      ),
      task(
        "F-D",
        "Small F ↔ D",
        "Follow the leading middle finger, then the index/ring group.",
        ["clear-D"],
      ),
      task(
        "D-Am",
        "D ↔ Am",
        "Middle leads high e2 → D2, then index and ring complete Am.",
        ["clear-D", "clear-Am"],
      ),
      task(
        "D-E",
        "D ↔ E",
        "Index guides lightly along G2 ↔ G1 while the other fingers form E.",
        ["clear-D", "clear-E"],
      ),
    ],
  },
  {
    id: "colour",
    title: "Add colour when you want it",
    description:
      "Muting, movable shapes and a short fill build on the same clear notes and steady pulse.",
    practice:
      "Add one technique at a time to something you can already play comfortably. You can begin a song before completing this section.",
    later: true,
    checks: [
      task(
        "chuck",
        "A gentle chuck on 2 and 4",
        "Play D · M U · U M U, allowing each following upstroke to sound.",
        ["folk"],
      ),
      task(
        "release-mute",
        "Release pressure; keep contact",
        "Sound the note first, then relax pressure while the fingertip keeps touching.",
        ["setup-fret"],
      ),
      task(
        "prepare-E",
        "Free the index for a barre",
        "Open E sounds clean using fingers 2–3–4, leaving index free.",
        ["clear-E"],
      ),
      task(
        "full-F",
        "Build the full F in short attempts",
        "Check the individual notes, then release the grip completely.",
        ["prepare-E"],
      ),
      task(
        "A-family",
        "Name the A-family root",
        "For C, identify root/barre A3 separately from the upper fret-5 row.",
        ["clear-A"],
      ),
      task(
        "small-fill",
        "Return from a short fill on time",
        "Play high-e 0–1–3 and return to C on the next beat 1.",
        ["clear-C", "pulse-four"],
      ),
    ],
  },
];
export const foundationChecks = foundationsPlan.flatMap((c) => c.checks);
export type FoundationProgress = {
  checks: Record<string, boolean>;
  notes: Record<string, string>;
};
export const foundationCheckpointKey = (id: string) =>
  `foundation-checkpoint-${id}`;
export const foundationReviewKey = (id: string) => `foundation-reviewed-${id}`;
export function foundationRating(progress: FoundationProgress, id: string) {
  return (["needs", "growing", "comfortable"] as const).find(
    (r) => progress.checks[`desk-rating-${id}-${r}`],
  );
}
export function foundationChecked(progress: FoundationProgress, id: string) {
  const key = foundationCheckpointKey(id);
  if (Object.prototype.hasOwnProperty.call(progress.checks, key))
    return progress.checks[key];
  return foundationRating(progress, id) === "comfortable";
}
export type FoundationRating = "needs" | "growing" | "comfortable";
export function recordFoundationRating<T extends FoundationProgress>(
  progress: T,
  id: string,
  rating: FoundationRating,
  today: string,
): T {
  const checks = { ...progress.checks };
  delete checks[foundationCheckpointKey(id)];
  for (const value of ["needs", "growing", "comfortable"] as const)
    checks[`desk-rating-${id}-${value}`] = value === rating;
  return {
    ...progress,
    checks,
    notes: { ...progress.notes, [foundationReviewKey(id)]: today },
  };
}
export function markFoundationCheckpoint<T extends FoundationProgress>(
  progress: T,
  id: string,
  checked: boolean,
  today: string,
): T {
  return {
    ...progress,
    checks: { ...progress.checks, [foundationCheckpointKey(id)]: checked },
    notes: checked
      ? { ...progress.notes, [foundationReviewKey(id)]: today }
      : progress.notes,
  };
}
export function markFoundationReview<T extends FoundationProgress>(
  progress: T,
  id: string,
  today: string,
): T {
  return {
    ...progress,
    notes: { ...progress.notes, [foundationReviewKey(id)]: today },
  };
}
const dayDistance = (from: string, to: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to))
    return NaN;
  const a = Date.parse(from + "T00:00:00Z"),
    b = Date.parse(to + "T00:00:00Z");
  if (
    !Number.isFinite(a) ||
    !Number.isFinite(b) ||
    new Date(a).toISOString().slice(0, 10) !== from ||
    new Date(b).toISOString().slice(0, 10) !== to
  )
    return NaN;
  return (b - a) / 86400000;
};
export function foundationReviews(progress: FoundationProgress, today: string) {
  return foundationChecks.filter((c) => {
    const last = progress.notes[foundationReviewKey(c.id)];
    if (!last) return false;
    const rating = foundationRating(progress, c.id),
      interval =
        rating === "comfortable"
          ? 7
          : rating === "growing"
            ? 3
            : rating === "needs"
              ? 1
              : 2;
    return dayDistance(last, today) >= interval;
  });
}
export function recommendFoundation(
  progress: FoundationProgress,
  today: string,
) {
  const core = foundationsPlan.filter((c) => !c.later).flatMap((c) => c.checks);
  const next = core.find((c) => !foundationChecked(progress, c.id));
  if (next)
    return {
      check: next,
      reason: "The next unchecked foundation in the suggested sequence.",
    };
  const review = foundationReviews(progress, today)[0];
  if (review)
    return {
      check: review,
      reason: "A review reminder based on your last marked check.",
    };
  const later = foundationsPlan
    .filter((c) => c.later)
    .flatMap((c) => c.checks)
    .find((c) => !foundationChecked(progress, c.id));
  return {
    check: later ?? core.at(-1)!,
    reason: later
      ? "An optional next technique; your foundations remain available to revisit."
      : "Return to a musical progression and choose your own tempo.",
  };
}
