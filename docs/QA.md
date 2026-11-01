# Verification record — 1 November 2026

## Verified by code and automated checks

- Production build and TypeScript checks pass.
- All 42 interactive-extension checks pass, with installed-server integration enabled for transcript access, audio seeking and request-boundary handling. The installed HTML and seven new script/style files match the current build over HTTP.
- Coverage includes all fifteen source chord shifts, both directions, fixed anchors versus pressure-released guide slides, small F versus Fmaj7/full F, quick clip timing, practice accounting, play-along boundaries, foundation targets, the path to a first progression, ratings/unchecking/review dates, and six native-scroll chapter offsets.
- `src/lesson7.ts` has no changes from the restored source-checked version.
- ESLint exits successfully with seven existing hook-dependency warnings in older source/routine/tool components. Native web media rules are scoped separately from Remotion timeline compositions.
- The initial redesign's mechanical pass returned no findings. Its independent reviewer found three material code issues: split completion/review state, a diagram-reading exercise without a diagram, and supporting-text contrast. All three were fixed and scored resolved. The interactive extension's single mechanical pass emitted design-system advisories about literal colors and type sizes, including inherited choices; these are not claimed as a rendered visual pass.

## Interactive extension

- All eleven original exercise groups are directly selectable, with all fifteen exact routes available through their subtypes. Selection tests cover reverse-first Am→C, separate Fmaj7/small F, real step frames, and three/six-second timing.
- Six strings and frets 0–4 map to their actual MIDI pitches. Seven open chord studies use the source-checked finger numbers. String tubes and annotations share a single nut/bridge coordinate contract. Repeated marker updates reuse pooled geometry/materials and their five label textures are disposed on teardown.
- On-page practice starts explicitly and pauses for hidden tabs, tools, chapter changes or suspended event-loop gaps. Tests cover real elapsed time, local midnight, self-reports, no duplicate batches and the actual source lesson for each practice unit.
- A fresh independent reviewer found one material issue: saving was acknowledged before browser persistence. It is fixed and scored **resolved**. The hook now submits one complete batch; synchronous storage success is required before clearing the paused draft or showing Saved. Tests cover quota/privacy failure, retry, ID deduplication and preservation of existing progress fields.
- The approved baseline remains tagged `liked-resonance-v1` at `e10d4d7` and is pushed to the repository.

## Instrument evidence

The original procedural instrument follows [Yamaha Music India's FS80C Black reference](https://yamahamusicstore.in/musical-instruments/yamaha-fs80c-black-acoustic-guitar-made-in-india.html). The geometry is an illustrative teaching model. The front-view cutaway, black finish, rosewood-colored fingerboard/bridge, trim and covered tuners follow product references; no manufacturer CAD or recorded guitar timbre is claimed.

The base instrument was checked at 24,234 generated triangles, six strings and no nonfinite vertex coordinates. The extension adds pooled annotation markers and numbered labels. Fret-position calculations and source finger-map inputs remain unchanged. These are geometry checks, not GPU draw-call or real-device frame-rate measurements.

The desktop and mobile fallback PNGs are normal Remotion still exports of the same Three.js world and opening cameras. Their origin is embedded in each PNG. They are asset renders, not screenshots of the application. The dark body silhouette, cutaway, strings, trim and framing are inspected in those files.

The independent reviewer scored the final black desktop/mobile instrument assets **ship** at that asset-only scope. One-time procedural softbox reflections reveal the black gloss; temporary capture resources are disposed immediately and the retained environment target is released on unmount.

`chord-study-model.png` and `note-study-model-mobile.png` in `.impeccable/review/` are additional normal Remotion exports. They were opened and inspected: C finger labels align with B1/D2/A3, and the high-e fret-one reference sits behind the first fret. Embedded origin metadata identifies them as model-only annotation renders. They do not demonstrate app layout, pointer interaction or responsiveness.

## Local installation

The new build is installed at the existing loopback address, preserving the browser origin used for saved progress. The already-running server's generated `dist` was updated from this workspace without replacing source files or restarting the process. Its previous index is retained in the local staging folder. The installed HTML, new scripts/styles and posters are compared with the current build over HTTP.

The existing Six Strings desktop shortcut now launches this workspace. Its command encodes the script path so Unicode folder names survive Windows shortcut serialization; the target, icon and working directory are checked to exist and the decoded script path is verified. A later server launch uses the new workspace directly.

## Visual verdict: recapture

The independent review did **not** clear whole-app visual finish. The connected browser fails before navigation, DOM inspection or screenshot capture with `Cannot read properties of undefined (reading 'constraints')`. Documented troubleshooting and a fresh connection after the subsequent user message did not recover it; the alternative Chrome connection was unavailable. No alternate automation was used to fabricate browser evidence.

Required captures remain missing: desktop 1440×900, tablet 768×1024 and mobile 390×844. They must show the actual app, including the opening and ending chapters, reverse scroll, Foundations, Practice, Reference, reduced motion and fallback. Actual text/canvas overlap, overflow, focus visibility and pointer/keyboard interaction remain unverified. Sound-device behavior and microphone tuning accuracy also require real interaction. Build checks and asset renders do not establish those outcomes.

## Performance and source limits

Three.js is lazy-loaded only for Explore; the source-library/Remotion module is deferred. Renderer DPR is capped at 1.5 desktop and 1.25 mobile; settled, hidden and offscreen rendering stops requesting frames. Frame-time, GPU draw calls, battery and thermal behavior have not been measured on the user's device.

Lessons 2–9 retain supplied transcripts and Lesson 7 audio locally. Lessons 1 and 10 remain explicitly supplementary app guidance. Timers and self-reports do not automatically assess playing accuracy or establish song readiness.
