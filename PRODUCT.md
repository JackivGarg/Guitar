# Product

<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
Jackiv, a beginner practising guitar locally on Windows. He is working hard on basics and wants a stronger base, without being assigned a single weakness or diagnosed as blocked. English teaching is preferred.

## Product Purpose
An inviting personal guitar-learning application that makes it clear what to learn, how to physically practise it, how to check it, and how to use it musically. Success is regular useful practice and stronger foundations; the application cannot infer actual playing quality from a timer.

## Operating Context
Local React/TypeScript/Vite app with synthesized reference sounds, Remotion demonstrations, tuner, rhythm tools, practice logging, source transcripts and original-video references. Git repository: JackivGarg/Guitar. Desktop shortcut launches a loopback-only server on port 17842. Progress and notes stay in browser localStorage.

## Capabilities and Constraints
Preserve the exact instructor-checked chord-shifting routes in src/lesson7.ts: stationary anchors, light-contact slides with pressure released, finger-group order, both directions, small F versus Fmaj7 versus full F. Preserve all fifteen changes, eleven detailed exercise groups, source material and existing saved progress. Original clips remain optional supporting sources. Learn by skill, not required YouTube order. No fabricated grading, testimonials, proficiency or time-to-mastery claims.

The user requested Three.js scroll-worlds, GSAP ScrollTrigger and Impeccable for a substantial visual redesign and gave creative freedom. Educational practice usability remains essential. Keep three-second demonstrations and all-changes image reference.

The instrument should resemble a Yamaha FS80C. Use its Black finish and published front/angle references to author an illustrative concert-cutaway model with correct learning landmarks.

## Evidence on Hand
User-supplied transcripts for lessons 2–9, full supplied Lesson 7 MP3, and original source-video references. Lesson 7 routes were checked against actual source diagrams. Lessons 1 and 10 have supplementary app guides; their transcripts have not been supplied. Personal transcript/audio files are excluded from Git. Source code and history from the previous workspace were restored into this formerly empty folder.

## Product Principles
- Teach a physical action, show its exact reference, practise it, then connect it to music.
- A cinematic entrance must lead into practical learning rather than delay it.
- Strong fundamentals across posture, strings, clean notes, chords, movement, rhythm and musical application.
- Self-assessment is explicit; timers count time rather than proficiency.
- The source-checked shifting method is a fixed factual constraint.

## Open Decisions
The user delegated visual direction and does not identify a particular basic skill as blocking progress. Target desktop is Windows; mobile/tablet web responsiveness and reduced-motion/fallback support are design requirements for this implementation, not confirmed device ownership.
