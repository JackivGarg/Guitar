import { Chord, getChord } from "./course";
export const smallF: Chord = {
  name: "F · small shape",
  frets: [-1, -1, 3, 2, 1, 1],
  fingers: [0, 0, 3, 2, 1, 1],
  barre: [1, 4, 5],
  tip: "Index lightly bars B1 and high e1. Middle on G2, ring on D3. Play D, G, B and e only. This is the open-position F shown in Lesson 7, not the six-string F barre from Lesson 9.",
};
export const workshopChord = (name: string) =>
  name === "F-small" ? smallF : getChord(name);
export const chordLabel = (name: string) =>
  name === "F-small" ? "F (small)" : name;
export type Change = {
  id: string;
  from: string;
  to: string;
  start: number;
  end: number;
  focus: string;
  stay: string;
  release: string;
  steps: string[];
  back: string[];
  groups: number[][];
  reverseGroups?: number[][];
  slide?: number[];
  trap: string;
  check: string;
};
// Pitch shapes and finger numbers checked against the original Lesson 7 on-screen diagrams.
// Narration is explained in English; supplied source words/audio remain available separately.
export const changes: Change[] = [
  {
    id: "C-Am",
    from: "C",
    to: "Am",
    start: 63,
    end: 148,
    focus: "Two fingers stay down; only the ring finger changes its string.",
    stay: "Keep index (1) on B1 and middle (2) on D2. They are real anchors: same strings, same frets.",
    release:
      "Release ring (3) from A3. Lift it enough to clear the strings; do not drag it across D.",
    steps: [
      "Form C: index B1, middle D2, ring A3. Strum from the A string and check the notes.",
      "Leave index and middle down. Relax pressure on the ring finger, then lift just that finger.",
      "Place ring on G2 beside the middle finger. That is Am. The A string is now open.",
      "Strum from open A. Check that the ring finger does not touch B or high e.",
    ],
    back: [
      "Keep index B1 and middle D2 in place.",
      "Lift ring from G2 and return it to A3.",
      "Strum C from A. Repeat slowly, moving only the ring finger.",
    ],
    groups: [[3]],
    trap: "Lifting all three fingers throws away the two anchors. Dragging the ring finger across strings can catch or mute them.",
    check:
      "Index and middle stayed in place in both directions, and C and Am both sounded clear.",
  },
  {
    id: "Am-Em",
    from: "Am",
    to: "Em",
    start: 148,
    end: 236,
    focus:
      "Middle and ring travel together, one string toward the thicker strings.",
    stay: "No fingertip stays pressed in the same position. Keep the spacing and shape of fingers 2 and 3 as a group.",
    release:
      "Lift index off B1. Release the middle and ring pressure before transferring them across strings.",
    steps: [
      "Start Am: index B1, middle D2, ring G2.",
      "Release and lift index. Keep middle and ring close together in their fret-2 shape.",
      "Move middle from D2 to A2 and ring from G2 to D2: one string thicker for both.",
      "Press the group down together. Let low E, G, B and high e ring open to make Em.",
    ],
    back: [
      "Release middle and ring together; move A2 → D2 and D2 → G2.",
      "Return index to B1 to complete Am.",
      "Check open A and high e. Keep the two moving fingers close to the strings.",
    ],
    groups: [[2, 3], [1]],
    reverseGroups: [[2, 3], [1]],
    trap: "“Move up” here means one string toward the thick low E, not up one fret. The two fingers remain on fret 2.",
    check:
      "Middle and ring move as one group; I lift the index for Em and replace it for Am.",
  },
  {
    id: "Em-E",
    from: "Em",
    to: "E",
    start: 236,
    end: 296,
    focus: "Keep the Em shape down and add one fingertip.",
    stay: "Keep middle (2) on A2 and ring (3) on D2 throughout.",
    release:
      "Nothing needs to lift when going from Em to E. Index lifts only on the return to Em.",
    steps: [
      "Form Em with middle A2 and ring D2.",
      "Keep those two fingers pressed and curved.",
      "Add index (1) to G1, just behind fret 1. This changes the open G to G♯.",
      "Strum all six strings. Listen to the difference between E major and E minor.",
    ],
    back: [
      "Keep middle A2 and ring D2 down.",
      "Lift only index from G1 so G rings open again.",
      "Alternate Em and E without lifting the shared two-finger shape.",
    ],
    groups: [[1]],
    trap: "Do not move the Em fingers when the only change needed is adding or removing index.",
    check: "I can hear major versus minor, and only index lifts on the return.",
  },
  {
    id: "C-Fmaj7",
    from: "C",
    to: "Fmaj7",
    start: 296,
    end: 438,
    focus:
      "Index is the anchor; middle and ring move as one shape toward thinner strings.",
    stay: "Keep index (1) on B1.",
    release:
      "Release middle D2 and ring A3, but keep their relative shape. Lift across strings; do not slide along a fret.",
    steps: [
      "Build C and keep index on B1 as your reference.",
      "Move middle D2 → G2 and ring A3 → D3 as a group, one string thinner for each.",
      "Leave high e open. Play only D, G, B and e for this Fmaj7 voicing.",
      "Connect the full exercise: Am → C → Fmaj7. The lesson recommends starting from Am because the path through C is easier.",
    ],
    back: [
      "Keep index B1 in place.",
      "Move middle G2 → D2 and ring D3 → A3 together to return to C.",
      "Move ring A3 → G2, keeping index and middle down, to return to Am.",
    ],
    groups: [[2, 3]],
    trap: "Fmaj7 and F are different chords. The lesson uses Fmaj7 as an easier practice shape; it is not an exact harmonic substitute for F in every song.",
    check:
      "Index stays on B1, middle/ring move together, and the open high e rings.",
  },
  {
    id: "A-D",
    from: "A",
    to: "D",
    start: 438,
    end: 637,
    focus:
      "Ring finger keeps light contact on B while it slides from fret 2 to fret 3.",
    stay: "Keep ring (3) touching the B string as a guide. It moves along that string; it does not stay on the same fret.",
    release:
      "Lift index and middle. Reduce ring pressure before sliding; press firmly enough to sound the chord only after arriving.",
    steps: [
      "Use the fingering shown in the lesson: index D2, middle G2, ring B2. Other A fingerings need a different route.",
      "Lift index and middle while ring lightly contacts B2. Do not squeeze and scrape the string.",
      "Slide ring along the B string from fret 2 to fret 3. It is a light guide, not a pressed musical slide.",
      "Place index on G2 and middle on high e2 as a group, around the guided ring at B3. Strum from D.",
    ],
    back: [
      "Release index and middle; let ring keep light B-string contact.",
      "Slide ring B3 → B2 with pressure relaxed.",
      "Put index back on D2 and middle on G2 together. Strum A from open A.",
    ],
    groups: [[3], [1, 2]],
    reverseGroups: [[3], [1, 2]],
    slide: [3],
    trap: "The instructor explicitly says not to move with the ring squeezed down. Heavy pressure produces the slide sound he is trying to avoid.",
    check:
      "My ring stays in light contact on B, changes frets, and I reapply pressure only at the destination.",
  },
  {
    id: "Fmaj7-G",
    from: "Fmaj7",
    to: "G",
    start: 637,
    end: 833,
    focus:
      "Place index at the new reference first; bring middle and ring as a wide group.",
    stay: "No finger remains pressed at the same place. Index becomes the first new reference at A2.",
    release:
      "Release all Fmaj7 contacts before relocating them. Keep fingers close instead of throwing the hand away.",
    steps: [
      "Start with Fmaj7: index B1, middle G2, ring D3. The instructor offers this before the small F version.",
      "Place index on A2 first. This gives the moving hand a definite destination.",
      "Bring middle to low E3 and ring to high e3. Think of those two outer-string fingers as one wide group.",
      "Strum G across all six strings. Repeat slowly until the guide-plus-group route is familiar.",
    ],
    back: [
      "Return index to B1 as the reference.",
      "Bring middle back to G2 and ring back to D3 as a group.",
      "Strum only the top four strings for Fmaj7. Join this change back to Fmaj7 → C → Am → Em → E.",
    ],
    groups: [[1], [2, 3]],
    reverseGroups: [[1], [2, 3]],
    trap: "Going from four-string Fmaj7 to six-string G changes both the hand shape and the starting string for your strum.",
    check:
      "I place the reference finger deliberately and move the other two as a group, in both directions.",
  },
  {
    id: "F-G",
    from: "F-small",
    to: "G",
    start: 637,
    end: 833,
    focus:
      "The same reference-plus-group idea, now using the small F chord shown in the video.",
    stay: "No stationary anchor. Index leads from the small F mini-barre to A2.",
    release:
      "Release the index mini-barre on B1/e1. Do not attempt this as a full six-string F barre exercise.",
    steps: [
      "Make the small F: index holds B1 and e1, middle G2, ring D3. Play D–e.",
      "Release the mini-barre and move index to A2 as the new reference.",
      "Place middle on low E3 and ring on high e3 together.",
      "Strum G, then rehearse the exact reverse route slowly.",
    ],
    back: [
      "Return index to B1, flattening it lightly enough to include high e1.",
      "Return middle G2 and ring D3 together.",
      "Check each of the four F notes individually.",
    ],
    groups: [[1], [2, 3]],
    reverseGroups: [[1], [2, 3]],
    trap: "This is the small open-position F from Lesson 7. A full F barre uses different fingering and therefore a different change route.",
    check:
      "I can form the two-string mini-barre without squeezing and release it cleanly to reach G.",
  },
  {
    id: "A-Am",
    from: "A",
    to: "Am",
    start: 833,
    end: 946,
    focus:
      "Lead with the index, then transfer the middle/ring group toward the thicker strings.",
    stay: "There is no same-position anchor in this fingering. Use the new B1 index position as a reference.",
    release:
      "Release the three A fingertips enough to move. Do not leave ring pressing B2 while trying to sound the new B1 note.",
    steps: [
      "Start A using index D2, middle G2 and ring B2.",
      "Move index to B1 first as a new reference. The other fingers release their previous pressure.",
      "Move middle G2 → D2 and ring B2 → G2 as a group, one string thicker.",
      "Press the whole Am shape and strum from open A. The slow ordering is a learning tool; later it becomes one smooth change.",
    ],
    back: [
      "Move middle D2 → G2 and ring G2 → B2 together.",
      "Bring index from B1 back to D2 to complete A.",
      "Repeat without lifting fingers far away from the fretboard.",
    ],
    groups: [[1], [2, 3]],
    reverseGroups: [[2, 3], [1]],
    trap: "The instructor separates the movements so you can understand them. You do not need a permanent audible pause between the fingers.",
    check:
      "I can show index-first going to Am and group-first coming back to A.",
  },
  {
    id: "Fmaj7-Dm",
    from: "Fmaj7",
    to: "Dm",
    start: 946,
    end: 1050,
    focus:
      "Middle stays pressed at G2 while index and ring change strings together.",
    stay: "Keep middle (2) on G2. This is a true stationary anchor.",
    release:
      "Lift index from B1 and ring from D3. Do not lift the anchored middle with them.",
    steps: [
      "Start Fmaj7: index B1, middle G2, ring D3, open high e.",
      "Keep middle on G2. Lift index and ring together.",
      "Move index B1 → high e1 and ring D3 → B3. They keep their fret numbers but change strings.",
      "Press those two fingers as a group. Strum D, G, B and e to hear Dm.",
    ],
    back: [
      "Keep middle G2 down again.",
      "Lift index and ring together. Return index e1 → B1 and ring B3 → D3.",
      "Leave high e open to sound Fmaj7, then connect back through C.",
    ],
    groups: [[1, 3]],
    trap: "The anchor is middle on G2. The other two fingers lift across strings; this is not a slide.",
    check:
      "Middle never leaves G2, and index/ring travel together in both directions.",
  },
  {
    id: "C-Dm",
    from: "C",
    to: "Dm",
    start: 1050,
    end: 1113,
    focus: "Index finds high e1 first; middle and ring come together.",
    stay: "No finger has the same position in C and Dm. Index supplies a new reference at high e1.",
    release:
      "Release the C shape before moving across strings. Keep the hand close to the neck.",
    steps: [
      "Start C: index B1, middle D2, ring A3.",
      "Move index from B1 to high e1 first. It remains at fret 1 but changes strings, so lift rather than drag it.",
      "Bring middle D2 → G2 and ring A3 → B3 together as the remaining group.",
      "Strum D–e only. If this feels difficult, rehearse C → Fmaj7 → Dm first, then remove the middle chord.",
    ],
    back: [
      "Return index to B1 as a reference.",
      "Bring middle back to D2 and ring back to A3 as a group.",
      "Strum C from the A string.",
    ],
    groups: [[1], [2, 3]],
    reverseGroups: [[1], [2, 3]],
    trap: "Do not claim a fixed anchor here: every finger changes its position. The route through Fmaj7 helps you learn the destination shape.",
    check: "I can distinguish a new reference finger from a stationary anchor.",
  },
  {
    id: "G-D",
    from: "G",
    to: "D",
    start: 1113,
    end: 1207,
    focus:
      "Use ring as a reference, not a finger glued to its original string.",
    stay: "Ring (3) starts at high e3 and ends at B3. The instructor clarifies that “steady” does not mean it never moves.",
    release:
      "Release pressure on fingers that move. Ring must lift to cross from high e to B; do not drag a pressed fingertip sideways.",
    steps: [
      "Use the displayed G: middle low E3, index A2, ring high e3.",
      "Form the two-finger part of D: index G2 and middle high e2. Learn those as a group.",
      "Move ring high e3 → B3 to complete D. It stays near fret 3 but changes its string.",
      "Strum only D–e. Keep the ring movement small and use it to orient the hand.",
    ],
    back: [
      "Bring index back to A2 and middle back to low E3 as a group.",
      "Move ring B3 → high e3.",
      "Strum G from low E and check the open D, G and B strings.",
    ],
    groups: [[1, 2], [3]],
    reverseGroups: [[1, 2], [3]],
    trap: "“Keep it steady” here means use a reference. Holding ring on high e3 would prevent this D fingering.",
    check:
      "I move ring to the neighboring string rather than treating it as a fixed anchor.",
  },
  {
    id: "D-Em",
    from: "D",
    to: "Em",
    start: 1207,
    end: 1296,
    focus: "Middle and ring become the two-finger Em group.",
    stay: "No stationary anchor. Keep a mental reference for the two destination notes: A2 and D2.",
    release:
      "Release index from G2. Lift middle and ring before bringing them across several strings.",
    steps: [
      "Start D: index G2, middle high e2, ring B3.",
      "Lift index out of the shape.",
      "Move middle high e2 → A2 and ring B3 → D2 as a two-finger group.",
      "Press together and strum all six strings for Em. Connect G → D → Em once this is comfortable.",
    ],
    back: [
      "Release the Em group. Bring middle back to high e2 and ring back to B3 together.",
      "Return index to G2 to complete D.",
      "Strum from D and avoid the two bass strings.",
    ],
    groups: [[2, 3], [1]],
    reverseGroups: [[2, 3], [1]],
    trap: "Do not keep the old D strum range for Em: Em uses all six strings, D uses the top four.",
    check:
      "The two fingers land together on A2/D2 and I change the strum range correctly.",
  },
  {
    id: "F-D",
    from: "F-small",
    to: "D",
    start: 1296,
    end: 1385,
    focus:
      "Move middle to its new reference first, then bring index and ring as a group.",
    stay: "Middle is a guide to a new location, G2 → high e2. It does not stay on the same string.",
    release:
      "Release the index mini-barre and lift moving fingers before crossing strings.",
    steps: [
      "Start the small F, not the full barre: index B1/e1, middle G2, ring D3.",
      "Bring middle from G2 to high e2 first. It remains at fret 2 but changes strings.",
      "Place index G2 and ring B3 together around that new middle-finger reference.",
      "Strum D–e. Reverse the order slowly to return to the small F.",
    ],
    back: [
      "Return middle from high e2 to G2 as the reference.",
      "Bring index to the B1/e1 mini-barre and ring to D3 together.",
      "Check the mini-barre strings separately before repeating.",
    ],
    groups: [[2], [1, 3]],
    reverseGroups: [[2], [1, 3]],
    trap: "“Same fret” is not “same place”. Middle changes strings, so release and lift it; do not hold it pressed down.",
    check:
      "I can lead with middle and rebuild the other two-finger group both ways.",
  },
  {
    id: "D-Am",
    from: "D",
    to: "Am",
    start: 1385,
    end: 1441,
    focus:
      "Middle establishes the new reference; index and ring follow as a group.",
    stay: "No stationary anchor. Middle travels from high e2 to D2.",
    release:
      "All fingers need to release their D positions. Keep the fingertips low over the strings during the jump.",
    steps: [
      "Form D and look at the Am target before moving.",
      "Bring middle high e2 → D2 first, at the same fret on a different string.",
      "Place index B1 and ring G2 together as the remaining group.",
      "Strum from open A. Slowly rebuild D using middle as the reference again.",
    ],
    back: [
      "Bring middle from D2 back to high e2.",
      "Return index to G2 and ring to B3 together.",
      "Strum D–e and listen for a clear high e.",
    ],
    groups: [[2], [1, 3]],
    reverseGroups: [[2], [1, 3]],
    trap: "The jump crosses strings. Do not interpret the teacher’s reference-finger advice as keeping middle pressed on the old string.",
    check:
      "I know the destination before moving, lead with middle, and place the remaining pair together.",
  },
  {
    id: "D-E",
    from: "D",
    to: "E",
    start: 1441,
    end: 1513,
    focus:
      "Index keeps light G-string contact and slides one fret toward the nut.",
    stay: "Index (1) stays in contact with G while moving G2 → G1. It is a guide, not a fixed anchor.",
    release:
      "Relax index pressure before the slide. Lift middle and ring and bring them to their E positions as a group.",
    steps: [
      "Start D: index G2, middle high e2, ring B3.",
      "Release middle and ring. Let index lightly touch the G string.",
      "Slide index from G2 to G1 toward the nut, without squeezing the string.",
      "Place middle A2 and ring D2 together. Reapply pressure and strum all six strings for E.",
    ],
    back: [
      "Release middle and ring. Relax index pressure and slide G1 → G2.",
      "Place middle high e2 and ring B3 together to rebuild D.",
      "Strum from D. Repeat the guide-slide-plus-group route.",
    ],
    groups: [[1], [2, 3]],
    reverseGroups: [[1], [2, 3]],
    slide: [1],
    trap: "A guide slide uses very light contact. Pressing firmly produces an unwanted slide sound and makes the motion harder.",
    check:
      "Index stays on the G string, pressure relaxes during the slide, and the other two fingers move as a group.",
  },
];
export const getChange = (id: string) =>
  changes.find((c) => c.id === id) ?? changes[0];
export type DrillBlock = {
  id: number;
  title: string;
  subtitle: string;
  sequence: string[];
  pairs: string[];
  start: number;
  end: number;
  instructions: string;
  returnRoute: string;
};
export const drillBlocks: DrillBlock[] = [
  {
    id: 1,
    title: "C → Am → Em → E",
    subtitle: "The first connected progression",
    sequence: ["C", "Am", "Em", "E"],
    pairs: ["C-Am", "Am-Em", "Em-E"],
    start: 63,
    end: 296,
    instructions:
      "Learn each of the three changes separately first. Then play four downstrokes per chord: count 1, 2, 3, 4 and change on the next 1. The instructor starts with plain downstrokes so that the fretting hand gets your attention.",
    returnRoute:
      "Go back through the same shapes: E → Em → Am → C. Repeat forward and back without throwing the hand away from the neck.",
  },
  {
    id: 2,
    title: "Am → C → Fmaj7",
    subtitle: "Index stays; the two-finger shape transfers",
    sequence: ["Am", "C", "Fmaj7"],
    pairs: ["C-Am", "C-Fmaj7"],
    start: 296,
    end: 438,
    instructions:
      "The instructor first introduces C/Am/F, then deliberately changes the starting order to Am → C → Fmaj7 because going through C is easier. Preserve that route rather than forcing a direct Am → F change.",
    returnRoute:
      "Fmaj7 → C → Am. Keep the B1 index anchor throughout the C/Fmaj7 change.",
  },
  {
    id: 3,
    title: "A ↔ D",
    subtitle: "The light-contact ring-finger slide",
    sequence: ["A", "D"],
    pairs: ["A-D"],
    start: 438,
    end: 637,
    instructions:
      "Use the 1–2–3 A fingering shown in the diagram. Practice lifting the free fingers, sliding ring lightly along B, then forming the target group. The instructor explicitly warns against sliding with pressure.",
    returnRoute:
      "D → A uses the same light B-string contact, sliding ring from fret 3 back to fret 2.",
  },
  {
    id: 4,
    title: "Fmaj7 / small F ↔ G",
    subtitle: "Reference first, then the outer-string group",
    sequence: ["Fmaj7", "G", "F-small", "G"],
    pairs: ["Fmaj7-G", "F-G"],
    start: 637,
    end: 833,
    instructions:
      "Start with Fmaj7 if small F is not comfortable yet. Then learn the small F version shown in the video. This is not a full six-string F barre drill. Index goes to A2 first; middle and ring form G as a group.",
    returnRoute:
      "Return to Fmaj7 or small F using the same reference-plus-group approach. Connect it back through C → Am → Em → E.",
  },
  {
    id: 5,
    title: "A ↔ Am",
    subtitle: "Index first going out; group first coming back",
    sequence: ["A", "Am"],
    pairs: ["A-Am"],
    start: 833,
    end: 946,
    instructions:
      "Break the change into the exact learning stages: new index reference, then the two-finger group. The instructor explains that these separate movements later merge into one quick, smooth change.",
    returnRoute:
      "Bring the middle/ring group back to the A positions first, then return index to D2.",
  },
  {
    id: 6,
    title: "C → Fmaj7 → Dm",
    subtitle: "An anchored route, then the direct C–Dm change",
    sequence: ["C", "Fmaj7", "Dm"],
    pairs: ["C-Fmaj7", "Fmaj7-Dm", "C-Dm"],
    start: 946,
    end: 1113,
    instructions:
      "First keep middle anchored at G2 for Fmaj7 ↔ Dm. Then use the C → Fmaj7 → Dm route to understand how to reach Dm directly from C. Both the intermediate route and direct change have their own clips.",
    returnRoute:
      "Dm → Fmaj7 → C, then practice Dm → C directly. Do not invent a stationary C–Dm anchor: all three fingers move.",
  },
  {
    id: 7,
    title: "G → D → Em",
    subtitle: "A movable reference, followed by a two-finger jump",
    sequence: ["G", "D", "Em"],
    pairs: ["G-D", "D-Em"],
    start: 1113,
    end: 1296,
    instructions:
      "Treat the ring as a reference in G ↔ D, not a finger glued to high e3. It moves to B3. Then bring the middle/ring pair across to Em. Learn each change separately before connecting the progression.",
    returnRoute:
      "Em → D → G. Change your strum range with the chord: six strings for Em/G, four for D.",
  },
  {
    id: 8,
    title: "Small F ↔ D",
    subtitle: "Middle finger leads to a new string",
    sequence: ["F-small", "D"],
    pairs: ["F-D"],
    start: 1296,
    end: 1385,
    instructions:
      "Use the small F form actually shown in this lesson. Middle leads toward the D position; index and ring follow as a pair. Same fret does not mean the finger remains pressed in place.",
    returnRoute:
      "D → small F: middle returns to G2, then index/ring rebuild the mini-barre shape.",
  },
  {
    id: 9,
    title: "D ↔ Am",
    subtitle: "The middle-led jump",
    sequence: ["D", "Am"],
    pairs: ["D-Am"],
    start: 1385,
    end: 1441,
    instructions:
      "Look at the next shape first. Middle finds D2, then the remaining two fingers come together. Learn the path slowly; do not move all fingers high into the air at once.",
    returnRoute:
      "Am → D: middle returns to high e2; index and ring return together.",
  },
  {
    id: 10,
    title: "D ↔ E",
    subtitle: "Index slides lightly on the G string",
    sequence: ["D", "E"],
    pairs: ["D-E"],
    start: 1441,
    end: 1513,
    instructions:
      "Keep index in light G-string contact, release pressure, and slide G2 → G1. Middle and ring form the E group. The light-contact detail is part of the exercise, not an optional shortcut.",
    returnRoute:
      "E → D reverses the index slide and returns the middle/ring group to high e2/B3.",
  },
  {
    id: 11,
    title: "Connect it all & add strumming",
    subtitle: "Return through the links, then keep a continuous pulse",
    sequence: ["C", "Am", "Em", "E", "Em", "Am", "C", "Fmaj7", "G", "D", "Em"],
    pairs: [
      "C-Am",
      "Am-Em",
      "Em-E",
      "C-Fmaj7",
      "Fmaj7-G",
      "G-D",
      "D-Em",
      "A-D",
      "A-Am",
      "Fmaj7-Dm",
      "C-Dm",
      "F-D",
      "D-Am",
      "D-E",
    ],
    start: 1513,
    end: 1843,
    instructions:
      "The closing teaching is to use these connected routes regularly so your hand remembers the path. Start with four plain downstrokes per chord. Once the movement is familiar, use one complete strumming pattern per chord and change without a gap. Keep the original closing explanation available, including the practice and repetition advice.",
    returnRoute:
      "Practice every pair in both directions. Use the sequence above as an app-built connection drill, then revisit A/D, D/Am, D/E and F/D separately. It is a practice arrangement, not a claimed verbatim sequence from the video.",
  },
];
export function fingerPosition(chord: Chord, finger: number) {
  const string = chord.fingers.findIndex(
    (f, i) => f === finger && chord.frets[i] > 0,
  );
  return string < 0 ? null : { string, fret: chord.frets[string] };
}
export const positionText = (p: ReturnType<typeof fingerPosition>) =>
  p
    ? `${["low E", "A", "D", "G", "B", "high e"][p.string]} string · fret ${p.fret}`
    : "Off the strings";
export const workshopQuiz = [
  {
    q: "In C → Am, which fingers stay pressed in place?",
    options: ["Index B1 and middle D2", "All three fingers", "Ring only"],
    answer: 0,
    why: "Index B1 and middle D2 are stationary anchors. Ring alone changes A3 → G2.",
  },
  {
    q: "For A → D, how does ring travel along B?",
    options: [
      "With full fretting pressure",
      "With light contact and relaxed pressure",
      "By changing to the G string",
    ],
    answer: 1,
    why: "Ring guides along B2 → B3. The instructor warns not to press hard while moving.",
  },
  {
    q: "In Fmaj7 → Dm, which finger stays down?",
    options: ["Index", "Middle at G2", "Ring at D3"],
    answer: 1,
    why: "Middle remains at G2 while index and ring change strings as a group.",
  },
  {
    q: "In G → D, “keep the ring steady” means…",
    options: [
      "Leave it pressed on high e3",
      "Use it as a reference, moving high e3 → B3",
      "Do not use it",
    ],
    answer: 1,
    why: "The instructor explicitly clarifies that the reference finger still moves. It is not a fixed anchor.",
  },
  {
    q: "For D → E, which finger slides on the same string?",
    options: [
      "Index along G2 → G1",
      "Middle along high e2 → e1",
      "Ring along B3 → B2",
    ],
    answer: 0,
    why: "Index guides on G with pressure released; middle and ring form the E group.",
  },
  {
    q: "When adding strumming after learning the shifts, aim for…",
    options: [
      "The highest possible speed",
      "A pause every time the chord changes",
      "One steady pattern per chord with no added gap",
    ],
    answer: 2,
    why: "Build the movement slowly first. Then keep the pulse continuous as the chords change.",
  },
];
