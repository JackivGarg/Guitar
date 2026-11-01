# Verification record — 1 November 2026

## Verified by code and automated checks

- Production build and TypeScript checks pass.
- All 27 automated checks pass with server integration enabled against the installed build, including transcript access, audio seeking and request-boundary handling.
- Coverage includes all fifteen source chord shifts, both directions, fixed anchors versus pressure-released guide slides, small F versus Fmaj7/full F, quick clip timing, practice accounting, play-along boundaries, foundation targets, the path to a first progression, ratings/unchecking/review dates, and six native-scroll chapter offsets.
- `src/lesson7.ts` has no changes from the restored source-checked version.
- ESLint exits successfully with seven existing hook-dependency warnings in older source/routine/tool components. Native web media rules are scoped separately from Remotion timeline compositions.
- The one mechanical design-detector pass returned no findings. The independent reviewer found three material code issues: split completion/review state, a diagram-reading exercise without a diagram, and supporting-text contrast. All three were fixed and scored resolved by that reviewer. Declared supporting colors now exceed 4.5:1 on their intended backgrounds.

## Instrument evidence

The original procedural instrument follows [Yamaha Music India's FS80C Black reference](https://yamahamusicstore.in/musical-instruments/yamaha-fs80c-black-acoustic-guitar-made-in-india.html). The geometry is an illustrative teaching model. The front-view cutaway, black finish, rosewood-colored fingerboard/bridge, trim and covered tuners follow product references; no manufacturer CAD or recorded guitar timbre is claimed.

The model has 24,234 generated triangles, six strings and no nonfinite vertex coordinates. The fret-position calculation and source finger-map inputs remain unchanged. These are geometry checks, not GPU draw-call or real-device frame-rate measurements.

The desktop and mobile fallback PNGs are normal Remotion still exports of the same Three.js world and opening cameras. Their origin is embedded in each PNG. They are asset renders, not screenshots of the application. The dark body silhouette, cutaway, strings, trim and framing are inspected in those files.

The independent reviewer scored the final black desktop/mobile instrument assets **ship** at that asset-only scope. One-time procedural softbox reflections reveal the black gloss; temporary capture resources are disposed immediately and the retained environment target is released on unmount.

## Local installation

The new build is installed at the existing loopback address, preserving the browser origin used for saved progress. The already-running server's generated `dist` was updated from this workspace without replacing source files or restarting the process. Its previous index is retained in the local staging folder. The installed HTML, new scripts/styles and posters are compared with the current build over HTTP.

The existing Six Strings desktop shortcut now launches this workspace. Its command encodes the script path so Unicode folder names survive Windows shortcut serialization; the target, icon and working directory are checked to exist and the decoded script path is verified. A later server launch uses the new workspace directly.

## Visual verdict: recapture

The independent review did **not** clear whole-app visual finish. The connected browser fails before navigation, DOM inspection or screenshot capture with `Cannot read properties of undefined (reading 'constraints')`. Documented troubleshooting and a fresh connection after the subsequent user message did not recover it; the alternative Chrome connection was unavailable. No alternate automation was used to fabricate browser evidence.

Required captures remain missing: desktop 1440×900, tablet 768×1024 and mobile 390×844. They must show the actual app, including the opening and ending chapters, reverse scroll, Foundations, Practice, Reference, reduced motion and fallback. Actual text/canvas overlap, overflow, focus visibility and pointer/keyboard interaction remain unverified. Sound-device behavior and microphone tuning accuracy also require real interaction. Build checks and asset renders do not establish those outcomes.

## Performance and source limits

Three.js is lazy-loaded only for Explore; the source-library/Remotion module is deferred. Renderer DPR is capped at 1.5 desktop and 1.25 mobile; settled, hidden and offscreen rendering stops requesting frames. Frame-time, GPU draw calls, battery and thermal behavior have not been measured on the user's device.

Lessons 2–9 retain supplied transcripts and Lesson 7 audio locally. Lessons 1 and 10 remain explicitly supplementary app guidance. Timers and self-reports do not automatically assess playing accuracy or establish song readiness.
