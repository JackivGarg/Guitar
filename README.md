# Six Strings

A local guitar-learning app for a daily practice habit. React, TypeScript, Three.js, GSAP and Remotion connect a visual introduction to physical exercises, reference diagrams and musical practice. Fonts, guitar geometry and demonstrations are bundled locally.

## Run locally

Requires Node.js 20.19+, 22.13+ or 24+.

```sh
npm ci
npm run build
npm start
```

Open http://127.0.0.1:17842. For development use `npm run dev`. For editable animated demonstrations use `npm run studio`.

## Learning material and privacy

Lessons 2–9 have user-supplied transcripts, imported locally. Lessons 1 and 10 contain original supplementary guidance because their source transcripts were not supplied. Notes and exercises are separately authored; transcripts are preserved as reference and can contain recognition errors.

Personal transcript files and audio are excluded from Git. To import them on another computer, use the Source tab within a lesson. Learning progress is stored in your browser on this computer; use the app's backup controls to move it.

Course source: [Acoustic Pahadi's beginner guitar playlist](https://www.youtube.com/playlist?list=PLovStLXqoeZ1ncXap2csJ-FKgLuCyPQzY). Reference: [Fender chord lessons](https://www.fender.com/articles/chords/learn-how-to-play-fmaj7-guitar-chord). Animation: [Remotion Player](https://www.remotion.dev/docs/player).

Diagrams use the standard right-handed front view: low E on the left, high e on the right. Audio examples are synthesized reference tones. Chord-change counts and completion checks are self-assessed, not automatic performance grading.

## Practice first; use the sources when needed

The app opens on **Explore**: one procedural Yamaha FS80C Black teaching model, with a concert cutaway and six native-scroll camera compositions. Hear the open strings, locate a clean note, inspect C ↔ Am anchors and count four beats. Start or continue practice immediately; scrolling is optional. Motion can be paused, reduced-motion preferences are respected, and rendered guitar posters support WebGL failure. The model follows [Yamaha's published FS80C references](https://yamahamusicstore.in/musical-instruments/yamaha-fs80c-black-acoustic-guitar-made-in-india.html); it is an original illustrative model rather than a manufacturer CAD asset.

**Foundations** gives a suggested sequence: comfortable support, strings, tuning, diagram reading, a clear note, all seven open chords, exact changes, pulse and strumming, then a first progression. Further changes, muting, barre work and fills stay available. Every task has a physical check and a direct exercise link. Explicit checks and confidence ratings control completion; dated self-assessments provide review reminders. No video-completion requirement or automatic playing score is used.

Explore also supports **practice on the same 3D guitar page**. Choose any string and fret 0–4, hear its exact pitch, or inspect numbered positions for C, Am, Em, E, D, A and G. A selected study view stays held until **Resume scroll view**. Start/pause actual practice time, count your own clean repetitions, optionally assess comfort, and save before leaving the page. Saves acknowledge one complete batch only after browser storage succeeds. The pulse supports 40–80 BPM and optional looping.

The **Changes** tab restores immediate access to the original **11 exercise groups**, with every group’s individual variations and all **15 exact source routes**. Static complete images appear first. Optional clips take three seconds per direction or six for a round trip, with speed and individual movement-step controls. Forward and return instructions, stationary anchors, pressure-released guide slides, group order and mistakes remain fully available.

The **Practice desk** is a three-column teaching workspace. Pick a skill/exercise on the left, see the full movement or chord in the centre, and keep exact hand instructions on the right. Work through **Learn → Repeat → Connect** without a source lesson page. Setup exercises use their own string, fingertip and diagram references, then lead to the next foundation. Chord changes retain complete stationary references and three-second optional demonstrations. A fixed practice bar provides timing, a pulse, clean-repetition counting and saving. Self-ratings (Needs work / Getting there / Comfortable), exercise notes and position are local; saved practice uses actual elapsed time.

The **Play along** workspace has a four-beat count-in, musical timeline, current and upcoming chord, every chord diagram, one/two/four bars per chord, downstrokes or folk rhythm, and a selectable starting measure. Use C–Am–Em–E, G–D–Em–C or any of the 15 change pairs. Sound scheduling follows the WebAudio clock; stopping, leaving, hiding the page or opening tools stops the transport. Count-in time is excluded from the draft. Save actual practice after assessing how it went.

The **Visual reference** workspace keeps all fifteen complete start → movement → finish images beside a selected-change inspector. Selecting a card updates its details without removing the others. Inspect stationary anchors, light-contact slides, exact finger routes and return groups; enlarge/save one image or all fifteen. Chord-shape and note/theory modes live in the same workspace. Three-second animations remain optional in the Practice desk, with static movement images shown first.

The top navigation connects Explore, Foundations, Practice, Changes, Play along and Reference. Tuning, metronome, chord shapes and fretboard open in a tools dialog while the workspace keeps its position. **Source library** is a separate supporting area with full original lesson chapters, transcripts, videos and Lesson 7 audio. Original video playback needs internet; bundled diagrams and practice tools run locally. Existing progress, notes, transcripts and the source-checked finger-route data are preserved. Older lesson and app URLs redirect to the appropriate workspace or source guide.

The supplied material is expanded into 9 chapters for Lesson 2, 11 for Lesson 3, 25 for Lesson 4, 10 for Lesson 5, 9 for Lesson 6, 10 for Lesson 8 and 15 for Lesson 9. Lessons 1 and 10 remain clearly labeled supplementary guides. A guide is an authored teaching aid, not a word-for-word translation.

Lesson 7 has a dedicated 11-block workshop, 15 separately selectable quick forward/return chord-change clips, exact finger maps, fixed anchors versus light-contact guide slides, guided movement steps, common mistakes, per-block practice timers and checks, plus the full supplied audio with speed and range looping. The small four-string F, Fmaj7 and full F barre are distinct. Source diagrams and difficult finger routes were checked against the original video.

Lessons 5, 6 and 9 include an interactive E/A-family major/minor barre explorer: it separates the root/barre fret from the higher-finger frets, supports sharp/flat naming, and plays reference notes. Lesson 4 separates the basic seven-stroke and folk patterns. Lesson 8 separately demonstrates picking-hand chuck, bridge damping, and fretting-pressure release with contact retained.

The desktop shortcut is installed by `install-desktop.ps1`. It launches the loopback-only server with `launch.ps1`. Direct lesson URLs use `/#/lesson/7`; chapter position saves automatically. Use **Practice history → Export backup** to preserve lesson checks, notes and practice history. The microphone tuner needs your browser permission; live microphone accuracy depends on your instrument and input environment.

## Validation

`npm test` verifies quick movement timing, count-in and progression boundaries, guided routine timing, SVG reference coverage and pressure instructions, chord pitch classes, all E/A major/minor movable positions at frets 1–12, chapter ordering and key technique coverage, and the Lesson 7 anchors and slides. Run `$env:SIX_STRINGS_INTEGRATION='1'; npm test` in PowerShell with the local server running to include asset serving, audio byte ranges and request boundary checks. `npm run build` checks TypeScript and creates the installed app bundle.

The new tests also cover native-scroll chapter interpolation, standard string pitches, foundation targets, explicit completion/uncheck behavior, dated reviews and the complete sequence through a first progression. Whole-app visual and interaction testing is currently unverified because the connected browser fails before navigation or capture; model still renders and automated tests do not substitute for that evidence. See `docs/QA.md` for the checked scope and remaining captures.

The approved version is preserved by annotated tag **`liked-resonance-v1`**, pointing to `e10d4d7`; see `docs/RESTORE-POINTS.md`. It remains available if Jackiv asks to return to the version he liked.
