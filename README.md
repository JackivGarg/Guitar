# Six Strings

A local guitar-learning app for a daily practice habit. Built with React, TypeScript and Remotion. Original diagrams and practice demonstrations are bundled with the app.

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

## Learn one video at a time

Each numbered lesson contains its matching original video, a source-ordered chapter list, English instructions, a diagram or Remotion demonstration, an exercise, and saved self-checks. Original videos load from YouTube on demand and need internet. Chapter links are approximate source positions; use the full source for context. All bundled teaching diagrams and practice tools run locally.

The supplied material is expanded into 9 chapters for Lesson 2, 11 for Lesson 3, 25 for Lesson 4, 10 for Lesson 5, 9 for Lesson 6, 10 for Lesson 8 and 15 for Lesson 9. Lessons 1 and 10 remain clearly labeled supplementary guides. A guide is an authored teaching aid, not a word-for-word translation.

Lesson 7 has a dedicated 11-block workshop, 15 separately selectable forward/return chord-change clips, exact finger maps, fixed anchors versus light-contact guide slides, guided movement steps, common mistakes, per-block practice timers and checks, plus the full supplied audio with speed and range looping. The small four-string F, Fmaj7 and full F barre are distinct. Source diagrams and difficult finger routes were checked against the original video.

Lessons 5, 6 and 9 include an interactive E/A-family major/minor barre explorer: it separates the root/barre fret from the higher-finger frets, supports sharp/flat naming, and plays reference notes. Lesson 4 separates the basic seven-stroke and folk patterns. Lesson 8 separately demonstrates picking-hand chuck, bridge damping, and fretting-pressure release with contact retained.

The desktop shortcut is installed by `install-desktop.ps1`. It launches the loopback-only server with `launch.ps1`. Direct lesson URLs use `/#/lesson/7`; chapter position saves automatically. Use **My progress → Export backup** to preserve lesson checks, notes and practice history. The microphone tuner needs your browser permission; live microphone accuracy depends on your instrument and input environment.

## Validation

`npm test` verifies chord pitch classes, all E/A major/minor movable positions at frets 1–12, chapter ordering and key technique coverage, and the Lesson 7 anchors and slides. Run `$env:SIX_STRINGS_INTEGRATION='1'; npm test` in PowerShell with the local server running to include asset serving, audio byte ranges and request boundary checks. `npm run build` checks TypeScript and creates the installed app bundle.
