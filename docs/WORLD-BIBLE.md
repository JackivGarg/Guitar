# Six Strings — Resonance Room

## World and interaction contract
Travel around one acoustic guitar: see its whole silhouette, follow its open strings to the headstock, move close to a clean fretted note, inspect a chord change, and return to the soundhole to carry a rhythm into music. Native scroll controls the camera and focus; buttons let the learner hear, inspect and begin a real exercise. Practice is always one direct action away.

## Direction selection
The seven grounded directions, ordered before the seed: rehearsal-room floor plan; record-sleeve listening notes; music-school study folio; chord atlas; sound engineer's session log; resonance room (one instrument studied through light and proximity); personal practice journal. The seed assigned the sixth. Explicit user instructions pin real Three.js, GSAP and practical foundations, and delegate final aesthetic choice. Use a code-led build for this interactive app, no stored build-path preference. No further aesthetic choice round is requested after the user reiterated creative freedom.

Challengers weighed: nixie counter declined (overweights numbers), arcade declined (implies achievement/gameplay), raku declined (obscures precise technique), weather-sun hall competitive for spatial focus but loses instrument clarity, emergency broadcast declined (wrong urgency), treasure map competitive for sequential navigation but lower precision. Keep their discipline: decisive state changes, strong focused light, navigable chapter landmarks, not their motifs.

## Visual grammar
Physical scene: a learner sits with an acoustic guitar in an evening practice room; a rich cobalt study stage gives the black Yamaha FS80C instrument a clear silhouette, while light porcelain practice surfaces remain readable beside the real guitar. The journey is Experience/Read; the desk is Operate. Cobalt #233db7, deep ink #17213b, readable porcelain #f1f3fa, graphite #202a44, black finish #101216. Active cobalt is limited to real selection/actions in practice. No cream/terracotta or neon-glow aesthetic. Bricolage Grotesque display, Rethink Sans UI, both self-hosted. No decorative eyebrows above headings. True stage numbers denote learning order only.

## Geometry / scene graph
1 unit = 20 cm. One renderer, one scene, persistent guitarRoot. Environment holds seamless blue floor and backdrop; guitarRoot holds bevelled acoustic body with genuine soundhole, binding, rosette, bridge, neck, fretboard, fret wires, six strings, nut, headstock, tuners and interaction proxies. Six strings follow low-E to high-e correctly. Geometry is an original teaching model, not the source instructor's hands. Finger routes stay in verified diagrams and exact source data.

## Chapter / camera / light ledger
|Beat|Landmark / action|Desktop camera composition|Mobile adaptation|Focus|
|---|---|---|---|---|
|Meet your instrument|Whole guitar, direct practise action|3/4 full silhouette, generous left copy region|Full guitar in upper half, copy below|Whole body/neck|
|Hear six strings|Follow strings to headstock|Camera approaches head/nut, open-string notes audible on request|Wider FOV, shorter copy, DOM string buttons|Six named strings|
|Make one clear note|Fret/string endpoint|Front close-up at low frets, slow local note highlight|Pull back for visible fret labels|Finger position behind fret|
|Keep what stays|C ↔ Am teaching route|Front fretboard, static anchors highlighted, no invented finger route|Diagram and DOM action stay readable|Verified C-Am reference|
|Keep time|Soundhole / picking zone|Camera travels down to soundhole, pulse feedback only on activation|Body fills top area with stable text|Steady four-beat action|
|Make music|Whole guitar in new composition|Pull back with visible full instrument and next learning action|Complete DOM path and practice link|Next foundations session|

## Materials / texture / lighting
The black-finish spruce top and tonewood sides are dielectric, with a glossier top and matte sides/back. Model proportions are illustrative; official FS80C Black specifications and photographs govern silhouette and hardware. Steel strings/fret wires metalness .85–1, roughness .22–.38. Dark fingerboard dielectric roughness .65. Subject-specific procedural wood textures may be original CanvasTexture; base color sRGB, rough/normal linear. No random decorative particles. One soft directional key, hemisphere fill, restrained rim; one shadow map maximum desktop, no shadows mobile if needed. No bloom, chromatic effects or expensive postprocessing. Guitar/floor contact must ground the object.

## Interaction matrix
Named six-string proxies may pluck reference tones with DOM equivalents. Hotspots are only available in relevant exact chapters; DOM controls provide keyboard-accessible equivalents. Scroll never changes chosen task or ratings. Short movements, reversible progress, no scroll hijack or snapping. Explicit Skip to practice / Pause motion controls. Reduced motion snaps to composed endpoints, no ambient motion. WebGL failure leaves a designed static instrument poster and the complete semantic story and actions.

## Loading / performance / lifecycle ledger
All model geometry and maps local/procedural, no external model download. Lazy-load Three/GSAP only on journey. Fonts local; avoid source-audio preload on journey. Target initial transfer under3MB, triangles under100k, draw calls under100; these are budgets, not measured claims. DPR cap1.5 desktop/1.25 mobile; dt≤1/30; lower DPR after sustained slow frames. Pause hidden/offscreen; dispose scene geometry/materials/textures, renderer, observers, GSAP context and RAF on unmount. Expose actual renderer stats via development telemetry.

## QA and deliverables
Capture actual desktop1440×900, tablet768×1024, mobile390×844; whole/end chapters and reverse scroll; verify WebGL fallback, reduced-motion, hidden-tab resume, keyboard and interactions. Record measured renderer stats and bundle sizes, with real-device battery/thermal testing marked untested. Build/DOM tests are never presented as visual evidence.
