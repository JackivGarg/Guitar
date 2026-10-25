export type Chord = {
  name: string;
  frets: number[];
  fingers: number[];
  barre?: [number, number, number];
  tip: string;
};
// Strings are always ordered low E → high e. -1 = don't play, 0 = open.
export const chords: Chord[] = [
  {
    name: "Em",
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
    tip: "Middle finger on A2, ring finger on D2. Play all six strings.",
  },
  {
    name: "Am",
    frets: [-1, 0, 2, 2, 1, 0],
    fingers: [0, 0, 2, 3, 1, 0],
    tip: "Index B1, middle D2, ring G2. Start your strum on the A string.",
  },
  {
    name: "C",
    frets: [-1, 3, 2, 0, 1, 0],
    fingers: [0, 3, 2, 0, 1, 0],
    tip: "Index B1, middle D2, ring A3. Leave G and high e open; skip low E.",
  },
  {
    name: "G",
    frets: [3, 2, 0, 0, 0, 3],
    fingers: [2, 1, 0, 0, 0, 3],
    tip: "Middle low E3, index A2, ring high e3. Let the middle strings ring.",
  },
  {
    name: "D",
    frets: [-1, -1, 0, 2, 3, 2],
    fingers: [0, 0, 0, 1, 3, 2],
    tip: "Index G2, ring B3, middle high e2. Strum only D, G, B and e.",
  },
  {
    name: "A",
    frets: [-1, 0, 2, 2, 2, 0],
    fingers: [0, 0, 1, 2, 3, 0],
    tip: "Index D2, middle G2, ring B2. Five strings, starting from open A.",
  },
  {
    name: "E",
    frets: [0, 2, 2, 1, 0, 0],
    fingers: [0, 2, 3, 1, 0, 0],
    tip: "Index G1, middle A2, ring D2. All six strings should sound.",
  },
  {
    name: "Dm",
    frets: [-1, -1, 0, 2, 3, 1],
    fingers: [0, 0, 0, 2, 3, 1],
    tip: "Index high e1, middle G2, ring B3. Start on the D string.",
  },
  {
    name: "Fmaj7",
    frets: [-1, -1, 3, 2, 1, 0],
    fingers: [0, 0, 3, 2, 1, 0],
    tip: "Ring D3, middle G2, index B1, open high e. Play the top four strings. This is F major seven, a different chord from F.",
  },
  {
    name: "F",
    frets: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    barre: [1, 0, 5],
    tip: "Index across fret 1; ring A3, pinky D3, middle G2. Roll your index slightly toward its bony edge.",
  },
  {
    name: "Bm",
    frets: [-1, 2, 4, 4, 3, 2],
    fingers: [0, 1, 3, 4, 2, 1],
    barre: [2, 1, 5],
    tip: "Index across A–e at fret 2; ring D4, pinky G4, middle B3. Skip low E.",
  },
  {
    name: "B",
    frets: [-1, 2, 4, 4, 4, 2],
    fingers: [0, 1, 2, 3, 4, 1],
    barre: [2, 1, 5],
    tip: "Index bars A–e at fret 2; middle D4, ring G4, pinky B4. Use short relaxed attempts.",
  },
  {
    name: "Fm",
    frets: [1, 3, 3, 1, 1, 1],
    fingers: [1, 3, 4, 1, 1, 1],
    barre: [1, 0, 5],
    tip: "F barre shape with the middle finger lifted. Check G, B and e against the index barre.",
  },
  {
    name: "Cm",
    frets: [-1, 3, 5, 5, 4, 3],
    fingers: [0, 1, 3, 4, 2, 1],
    barre: [3, 1, 5],
    tip: "Move the Bm shape up one fret. Barre fret 3; skip low E.",
  },
  {
    name: "Gm",
    frets: [3, 5, 5, 3, 3, 3],
    fingers: [1, 3, 4, 1, 1, 1],
    barre: [3, 0, 5],
    tip: "Move the Fm shape up two frets, to fret 3.",
  },
];
export const getChord = (name: string) =>
  chords.find((c) => c.name === name) || chords[0];
export const stringNames = ["E", "A", "D", "G", "B", "e"];
export const openMidi = [40, 45, 50, 55, 59, 64];
export type Lesson = {
  id: number;
  title: string;
  short: string;
  category: string;
  minutes: number;
  mode: string;
  description: string;
  hindi: string;
  chords: string[];
  steps: { title: string; text: string; action: string }[];
  check: string[];
  quiz: { q: string; options: string[]; answer: number; why: string };
  drill: string;
};
export const lessons: Lesson[] = [
  {
    id: 1,
    title: "Meet your guitar",
    short: "A comfortable beginning",
    category: "Foundations",
    minutes: 8,
    mode: "anatomy",
    description:
      "Get comfortable with your instrument before you play your first note.",
    hindi: "आराम से बैठें। गिटार को अपने शरीर के पास रखें और कंधे ढीले छोड़ें।",
    chords: [],
    steps: [
      {
        title: "Find the important parts",
        text: "The headstock holds the tuning machines. The nut guides the strings into the neck. Metal frets divide the fingerboard. The bridge anchors the strings on the body.",
        action:
          "Point to the headstock, nut, frets, soundhole and bridge on your own guitar.",
      },
      {
        title: "Find a relaxed position",
        text: "Sit on a stable chair. For a right-handed setup, rest the guitar waist on your right thigh, or use a supported classical position. Keep the neck slightly raised and your shoulders relaxed.",
        action:
          "Hold the guitar for 30 seconds without gripping the neck to support its weight.",
      },
      {
        title: "Learn your finger numbers",
        text: "Your fretting hand uses 1 = index, 2 = middle, 3 = ring, 4 = little finger. The thumb supports the neck from behind; avoid squeezing hard.",
        action: "Touch each finger to your thumb while saying its number.",
      },
      {
        title: "Make a clear first note",
        text: "Place one fingertip just behind a metal fret, not on the metal or in the middle of the gap. Use only enough pressure to sound the note. Keep your wrist comfortable.",
        action:
          "Press the high e string at fret 1. Pluck gently with your picking-hand thumb or a pick, release, and repeat five times.",
      },
    ],
    check: [
      "I can name the main parts",
      "I can sit comfortably",
      "I can make one clear fretted note",
    ],
    quiz: {
      q: "Where should your fingertip press?",
      options: [
        "Directly on the metal fret",
        "Just behind the fret",
        "As far from the fret as possible",
      ],
      answer: 1,
      why: "Press just behind the fret with the lightest pressure that gives a clear note.",
    },
    drill:
      "1 minute: press and release high e at fret 1. Keep shoulders loose.",
  },
  {
    id: 2,
    title: "Strings & tuning",
    short: "Know your six strings",
    category: "Foundations",
    minutes: 12,
    mode: "strings",
    description:
      "Learn string names, string numbers and the sound of standard tuning.",
    hindi: "मोटी से पतली तार: E A D G B e। सबसे पतली तार नंबर 1 है।",
    chords: [],
    steps: [
      {
        title: "Read the strings in the right direction",
        text: "In standard tuning, thickest to thinnest is E2 A2 D3 G3 B3 E4. The thick low E is string 6; the thin high e is string 1. Both outside strings are E, two octaves apart.",
        action:
          "Pluck each open string slowly and say 6-E, 5-A, 4-D, 3-G, 2-B, 1-e.",
      },
      {
        title: "Use a memory phrase",
        text: "A mnemonic such as “Eddie Ate Dynamite, Good Bye Eddie” follows thick to thin. The actual notes matter more than the phrase.",
        action: "Close your eyes and name the six strings in both directions.",
      },
      {
        title: "Tune one string at a time",
        text: "Use the tuning tools to hear a reference tone or turn on the microphone tuner. Pluck just one string. Flat means its pitch is too low; sharp means too high. Make small adjustments and check again.",
        action:
          "Tune slowly. Follow the string to its own tuning peg before turning it.",
      },
      {
        title: "Check before every practice",
        text: "Tuning changes with temperature and playing. Listen to the six strings before every session. If a string is far from pitch and you are unsure which octave it should be, use a dedicated tuner rather than tightening blindly.",
        action:
          "Play each string twice and check that it sustains without a rattle.",
      },
    ],
    check: [
      "I know E A D G B e",
      "I know string 1 versus string 6",
      "I checked tuning before practice",
    ],
    quiz: {
      q: "Which is string number 1?",
      options: ["The thick low E", "The A string", "The thin high e"],
      answer: 2,
      why: "String numbering begins at the thinnest string. High e is 1; low E is 6.",
    },
    drill:
      "2 minutes: name and pluck random strings without looking at the labels.",
  },
  {
    id: 3,
    title: "Your first chords",
    short: "Small shapes, big sounds",
    category: "Chords",
    minutes: 18,
    mode: "chord",
    description: "Read a chord diagram and build clear E, A, C and D shapes.",
    hindi: "डायग्राम के गोले उंगली बताते हैं। O = खुली तार, × = तार मत बजाओ।",
    chords: ["E", "A", "C", "D"],
    steps: [
      {
        title: "Read a diagram",
        text: "Look at the diagram as though the guitar is standing in front of you: low E is on the left, high e on the right. Vertical lines are strings; horizontal lines are frets. Numbers inside dots are finger numbers. O means open and × means do not play.",
        action:
          "Find the low E string, the nut and finger 1 on the E chord diagram.",
      },
      {
        title: "Build E major first",
        text: "Put index on G1, middle on A2 and ring on D2. Curve your fingertips so they do not touch neighboring strings. Keep the thumb comfortable behind the neck.",
        action:
          "Pluck all six strings separately. Adjust only the finger causing a dull note.",
      },
      {
        title: "Try A, C and D",
        text: "Follow each diagram one finger at a time. C and A start from string 5. D starts from string 4. A good chord has clear notes on the strings you intend to play.",
        action: "Spend a minute on each shape. Do not rush the change yet.",
      },
      {
        title: "Find the smallest useful pressure",
        text: "If a note buzzes, move your finger closer to the fret before pressing harder. If a note is muted, check whether another finger is touching the string.",
        action:
          "Press, pluck, relax. Repeat each chord five times without tensing your shoulder.",
      },
    ],
    check: [
      "I can read O and ×",
      "I can fret E, A, C and D",
      "I checked each string individually",
    ],
    quiz: {
      q: "An × above a string means…",
      options: [
        "Play it open",
        "Do not play that string",
        "Press as hard as you can",
      ],
      answer: 1,
      why: "× marks a string to omit or mute; O marks an open string.",
    },
    drill:
      "4 minutes: E → A → C → D. Build slowly, then check individual strings.",
  },
  {
    id: 4,
    title: "Chords & strumming",
    short: "Give your chords a pulse",
    category: "Rhythm",
    minutes: 20,
    mode: "strum",
    description:
      "Add major and minor shapes, then learn a steady eighth-note strum.",
    hindi: "हाथ लगातार नीचे–ऊपर चले। खाली स्ट्रोक में हाथ रुके नहीं।",
    chords: ["G", "Am", "Em", "Dm", "F", "B"],
    steps: [
      {
        title: "Add G and the minor shapes",
        text: "Try G, Am, Em and Dm in the chord library. Minor is a chord quality, not a volume instruction. F and B are harder barre shapes; use short attempts and revisit them in Lesson 9.",
        action:
          "Make G, Am, Em and Dm, and check that the intended strings ring.",
      },
      {
        title: "Count before you strum",
        text: 'Hold a pick lightly between thumb and index with a small tip showing, or brush with a relaxed finger. A downstroke goes from thick strings toward thin; an upstroke returns toward the thick strings and may brush just the thinner strings. Keep the wrist loose. At 60 BPM, count 1 and 2 and 3 and 4 and, down on numbers and up on each "and". Start with sounding only the downstrokes.',
        action:
          "Count aloud for four bars while moving your strumming hand lightly.",
      },
      {
        title: "Learn D D U U D U",
        text: "On the eight slots 1 & 2 & 3 & 4 &: play down, miss, down, up, miss, up, down, up. Your hand keeps moving on the missed slots. This is one common pattern, not the only rhythm.",
        action:
          "Select the folk pattern in Practice. Use one easy chord for four bars.",
      },
      {
        title: "Bring changes into the rhythm",
        text: "Change chords on beat 1 after four beats. Slow down until the pulse survives the change. A clean simple downstroke is more useful than a fast broken pattern.",
        action: "Alternate Em and Am, one bar each, for two minutes.",
      },
    ],
    check: [
      "I can count 1 & 2 & 3 & 4 &",
      "My hand continues on silent slots",
      "I can change chords without losing beat 1",
    ],
    quiz: {
      q: "In the folk pattern, what happens on beat 3?",
      options: [
        "A downstroke sounds",
        "The downstroke motion misses the strings",
        "The hand stops completely",
      ],
      answer: 1,
      why: "Keep the down-up movement. The down motion on 3 is silent, and the upstroke on its “and” sounds.",
    },
    drill:
      "3 minutes: Em / Am at 60 BPM. Start with downstrokes, then try the folk pattern.",
  },
  {
    id: 5,
    title: "Understand the fretboard",
    short: "The logic behind the notes",
    category: "Theory",
    minutes: 16,
    mode: "notes",
    description:
      "Use note names and fret distances to understand how shapes move.",
    hindi: "हर फ्रेट एक half step है। B–C और E–F के बीच भी एक ही half step है।",
    chords: ["E", "F", "G"],
    steps: [
      {
        title: "Learn the natural notes",
        text: "The natural note names are A B C D E F G, then the pattern repeats. These are note names; a chord contains multiple notes. Keep the distinction clear even when a transcript uses the words loosely.",
        action: "Say the seven natural notes forward and backward.",
      },
      {
        title: "One fret equals a semitone",
        text: "Moving one fret toward the body raises the pitch by one semitone, or half step. Two frets make one whole step. B to C and E to F are each one semitone; the other adjacent natural-letter pairs are a whole step apart.",
        action: "On low E, play open E, fret 1 F, fret 3 G, fret 5 A.",
      },
      {
        title: "Explore, do not just memorize",
        text: "Use the interactive fretboard to tap notes. Its row labels are open strings. Every string follows the same chromatic sequence from its own starting note.",
        action: "Find C on the A string at fret 3, then D at fret 5.",
      },
      {
        title: "A movable shape needs a movable nut",
        text: "A barre replaces the nut so a fretted shape can move. Sliding an open shape without addressing its open strings does not simply transpose the entire chord.",
        action:
          "Compare E major with F major. Notice how the index barre replaces the open strings.",
      },
    ],
    check: [
      "I know the seven natural notes",
      "I know half versus whole step",
      "I can find E, F and G on low E",
    ],
    quiz: {
      q: "How many frets from E to F?",
      options: ["One", "Two", "Three"],
      answer: 0,
      why: "E–F and B–C are each a half step: one fret.",
    },
    drill: "3 minutes: find natural notes on low E, then on the A string.",
  },
  {
    id: 6,
    title: "Sharps & flats",
    short: "Meet the notes in between",
    category: "Theory",
    minutes: 16,
    mode: "notes",
    description: "Connect ♯ and ♭ to real fretboard movement.",
    hindi:
      "Sharp = एक half step ऊपर। Flat = एक half step नीचे। C♯ और D♭ एक ही पिच हैं।",
    chords: [],
    steps: [
      {
        title: "Walk through all twelve notes",
        text: "C C♯ D D♯ E F F♯ G G♯ A A♯ B, then C again. In standard equal temperament, the pitch classes repeat every twelve frets.",
        action: "Tap low E frets 0 to 12 in the fretboard explorer and listen.",
      },
      {
        title: "Use sharp and flat correctly",
        text: "Sharp raises a written note by a half step; flat lowers it by a half step. C♯ and D♭ name the same pitch in this tuning system. The choice of spelling depends on musical context.",
        action:
          "Find G at low E fret 3, G♯ at fret 4 and A♭ at the same fret 4.",
      },
      {
        title: "Remember the close natural neighbors",
        text: "There is no fret between B and C or between E and F. The spellings B♯ and C♭ do exist in music theory; for this beginner exercise, use the familiar chromatic note names.",
        action: "Find B–C on the A string at frets 2–3.",
      },
      {
        title: "Practice moving a complete shape",
        text: "Moving a fully fretted shape up one fret transposes it one semitone. Keep every finger and the barre together. Open strings left behind do not move with the shape.",
        action:
          "If comfortable, slide the F barre shape from fret 1 to fret 2: F becomes F♯.",
      },
    ],
    check: [
      "I can explain ♯ and ♭",
      "I know C♯ = D♭ in equal temperament",
      "I can locate half-step neighbors",
    ],
    quiz: {
      q: "C♯ and D♭ are…",
      options: [
        "Two octaves apart",
        "The same pitch in equal temperament",
        "Always two frets apart",
      ],
      answer: 1,
      why: "These are enharmonic spellings of the same pitch in equal temperament.",
    },
    drill:
      "3 minutes: choose a string and name frets 0–5 using sharp names, then flat names.",
  },
  {
    id: 7,
    title: "Smooth chord changes",
    short: "Move less. Play more.",
    category: "Technique",
    minutes: 20,
    mode: "shift",
    description:
      "Build reliable changes with anchor fingers and slow, deliberate movement.",
    hindi:
      "पहले साफ आवाज़, फिर रफ़्तार। जहाँ संभव हो उंगली को anchor बनाए रखें।",
    chords: ["C", "Am", "Em", "Fmaj7", "G", "D"],
    steps: [
      {
        title: "Find a useful anchor",
        text: "For C → Am, keep index on B1 and middle on D2. Move ring from A3 to G2. The C → Am animation shows only that moving finger; the two shared fingers stay put.",
        action:
          "Change C to Am ten times without strumming. Watch the ring finger.",
      },
      {
        title: "Use small movements",
        text: "Release pressure without throwing your fingers away from the strings. Think of the next shape before moving. An anchor is helpful only if it does not force an uncomfortable hand position.",
        action:
          "Try Am → Em and back. Choose a comfortable fingering and keep fingers close.",
      },
      {
        title: "Count clean changes",
        text: "Pick two chords. Each time you arrive at a chord and strum it clearly, count one change. The practice counter is manual so you judge the sound honestly; the app is not listening to score your chords.",
        action:
          "Run the one-minute change timer. Record a starting score for C ↔ Am.",
      },
      {
        title: "Add rhythm after accuracy",
        text: "Put one chord on each bar at 50–60 BPM. Increase speed only when the chord sounds clear and the beat stays steady. Fmaj7 is a separate chord, useful as an easier exercise shape, not an exact replacement for F in every song.",
        action: "Practice C → Am → Fmaj7 → G, four downstrokes per chord.",
      },
    ],
    check: [
      "I can anchor C → Am",
      "I recorded a clean-change score",
      "I can keep a slow four-beat pulse",
    ],
    quiz: {
      q: "For the shown C → Am fingering, which finger moves?",
      options: ["Index", "Middle", "Ring"],
      answer: 2,
      why: "Index stays at B1, middle at D2; ring moves from A3 to G2.",
    },
    drill: "1 minute per pair: C/Am, Am/Em, C/G. Rest briefly between rounds.",
  },
  {
    id: 8,
    title: "Palm muting & the chuck",
    short: "Give your rhythm texture",
    category: "Rhythm",
    minutes: 15,
    mode: "mute",
    description:
      "Learn the difference between a muted strum and sustained palm muting.",
    hindi:
      "हथेली हल्के से रखें। Chucked strum और bridge palm mute अलग तकनीक हैं।",
    chords: ["Em", "Am"],
    steps: [
      {
        title: "Hear two different techniques",
        text: "The supplied lesson mainly describes a percussive muted strum or “chuck”: contact stops the strings and produces a short rhythmic sound. Sustained palm muting rests the side of the picking hand near the bridge while picking. Practice them separately.",
        action:
          "Strum Em once, then gently touch the strings to stop the sound.",
      },
      {
        title: "Make a gentle chuck",
        text: "Keep a relaxed strumming motion. On the mute slot, make light string contact with the side of the hand as you strum, producing a short percussive sound. You do not need to hit the instrument hard.",
        action:
          "Alternate one clear downstroke and one muted downstroke slowly.",
      },
      {
        title: "Put the chuck in a pattern",
        text: "Use the eight slots: D · M U · U M U. Count 1 & 2 & 3 & 4 &. M replaces the downstrokes on 2 and 4; the hand still moves on the silent slots.",
        action:
          "Select the muted folk pattern in Practice. Repeat on Em at 50 BPM.",
      },
      {
        title: "Explore the bridge palm mute",
        text: "Rest the outer edge of your picking palm very lightly just in front of the bridge saddle. Pick low E. Moving a little toward the neck damps more; moving back toward the bridge damps less.",
        action:
          "Alternate an open low E and a softly damped low E. Aim for controlled, short notes.",
      },
    ],
    check: [
      "I can stop the strings gently",
      "I can chuck on beats 2 and 4",
      "I understand bridge palm muting",
    ],
    quiz: {
      q: "Where does the picking-hand edge rest for sustained palm muting?",
      options: [
        "Near the bridge saddle",
        "On the headstock",
        "Halfway along the neck",
      ],
      answer: 0,
      why: "Light contact near the bridge shortens sustain while keeping the note audible.",
    },
    drill:
      "2 minutes: clear strum → gentle chuck; then one minute of low-string bridge muting.",
  },
  {
    id: 9,
    title: "Your first barre chords",
    short: "A small step over the big hurdle",
    category: "Technique",
    minutes: 18,
    mode: "barre",
    description: "Build a comfortable barre and use it to move a chord shape.",
    hindi:
      "ज़ोर से दबाने से पहले पोज़िशन ठीक करें। छोटी कोशिश करें, फिर हाथ को आराम दें।",
    chords: ["F", "Fm", "Bm", "B"],
    steps: [
      {
        title: "Start with a short barre",
        text: "Begin by holding just B and high e at fret 1 with the index. Place the finger just behind the fret and roll it slightly onto its firmer side. Keep the wrist comfortable and the thumb supportive.",
        action: "Pluck the two strings, release fully, then repeat five times.",
      },
      {
        title: "Build F one layer at a time",
        text: "The full F shape is 1 3 3 2 1 1 from low E to high e. Add middle G2, ring A3 and pinky D3. Check each string rather than squeezing harder across all six.",
        action:
          "Watch the barre animation, then check the six notes individually.",
      },
      {
        title: "Move the complete shape",
        text: "The E-shape major barre takes its root from string 6. F at fret 1 becomes F♯ at fret 2 and G at fret 3. A Bm shape has its root on string 5, not string 6.",
        action:
          "Find F and G using the same shape. Then locate the Bm root at A-string fret 2.",
      },
      {
        title: "Use short attempts",
        text: "Barres improve with coordination, not constant maximum pressure. Take frequent breaks. Stop and adjust if your wrist hurts; persistent pain is a reason to seek in-person guidance.",
        action: "Try 15 seconds on, 15 seconds fully relaxed, for four rounds.",
      },
    ],
    check: [
      "I can make a two-string barre",
      "I checked F string by string",
      "I know the root string of each shape",
    ],
    quiz: {
      q: "The E-shape major barre gets its root from…",
      options: ["String 1", "String 3", "String 6"],
      answer: 2,
      why: "The thick low E string carries the root of this movable major shape.",
    },
    drill: "4 relaxed rounds: 15 seconds of barre notes, 15 seconds of rest.",
  },
  {
    id: 10,
    title: "Your first guitar fills",
    short: "A little melody between chords",
    category: "Musicality",
    minutes: 15,
    mode: "fill",
    description:
      "Create a small musical fill without losing your place in the bar.",
    hindi:
      "पहले ताल स्थिर रखें। Fill को छोटा रखें और अगले bar के पहले beat पर लौटें।",
    chords: ["C", "Am"],
    steps: [
      {
        title: "Make space for a fill",
        text: "A fill is a short musical phrase between or around the main rhythm. First play two bars of C with simple downstrokes. The pulse must remain steady before adding notes.",
        action: "Count two bars of 4/4 out loud at 60 BPM.",
      },
      {
        title: "Learn an original three-note phrase",
        text: "On the high e string play open e, fret 1 F, then fret 3 G. Use index for fret 1 and ring for fret 3. These notes fit a beginner C-major exercise.",
        action: "Play 0–1–3 on the thin e, slowly and clearly.",
      },
      {
        title: "Put it in the last two beats",
        text: "Strum C on beats 1 and 2. On beat 3 play open e, on “and” of 3 play F at fret 1, and on beat 4 play G at fret 3. Let it ring through “and” of 4. Return to C on the next beat 1.",
        action:
          "Follow the animated counting guide and repeat the two-bar exercise.",
      },
      {
        title: "Keep the phrase short",
        text: "A fill should lead you back into the next chord. If the next beat 1 is late, use fewer notes or lower the tempo. This is an original app exercise; the Lesson 10 transcript was not supplied.",
        action:
          "Repeat four times, then try inventing a two-note answer with E and G.",
      },
    ],
    check: [
      "I can play high-e 0–1–3",
      "My fill stays inside the bar",
      "I return to C on beat 1",
    ],
    quiz: {
      q: "What matters most when adding a fill?",
      options: [
        "Playing as many notes as possible",
        "Arriving at the next beat 1 on time",
        "Playing louder than the chord",
      ],
      answer: 1,
      why: "A short phrase that keeps the pulse is more useful than a longer phrase that breaks it.",
    },
    drill:
      "3 minutes: one bar C, then one bar with C on 1 & 2 and the E–F–G fill on 3 & 4.",
  },
];
export const patterns = [
  {
    name: "Steady downstrokes",
    slots: ["D", "·", "D", "·", "D", "·", "D", "·"],
  },
  {
    name: "Folk · D D U U D U",
    slots: ["D", "·", "D", "U", "·", "U", "D", "U"],
  },
  { name: "Muted folk", slots: ["D", "·", "M", "U", "·", "U", "M", "U"] },
];
