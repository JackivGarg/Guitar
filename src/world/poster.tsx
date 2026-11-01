import { useCallback, useState } from "react";
import {
  AbsoluteFill,
  Composition,
  cancelRender,
  continueRender,
  delayRender,
  registerRoot,
} from "remotion";
import { GuitarWorld, type WorldStats } from "./GuitarWorld";
import type { StudyNote } from "./fretStudy";
type PosterProps = {
  progress: number;
  studyNote: StudyNote | null;
  studyChord: string | null;
};
function GuitarPoster({ progress, studyNote, studyChord }: PosterProps) {
  const [handle] = useState(() =>
    delayRender("Render the procedural acoustic guitar"),
  );
  const ready = useCallback(
    (stats: WorldStats) => {
      console.info("WORLD_METRICS " + JSON.stringify(stats));
      requestAnimationFrame(() =>
        requestAnimationFrame(() => continueRender(handle)),
      );
    },
    [handle],
  );
  return (
    <AbsoluteFill>
      <GuitarWorld
        progress={progress}
        studyNote={studyNote}
        studyChord={studyChord}
        reducedMotion
        onReady={ready}
        onFailure={() => cancelRender(new Error("Guitar renderer unavailable"))}
      />
    </AbsoluteFill>
  );
}
registerRoot(() => (
  <>
    <Composition
      id="GuitarPoster"
      component={GuitarPoster}
      width={1440}
      height={900}
      fps={30}
      durationInFrames={1}
      defaultProps={{ progress: 0, studyNote: null, studyChord: null }}
    />
    <Composition
      id="GuitarMobilePoster"
      component={GuitarPoster}
      width={390}
      height={844}
      fps={30}
      durationInFrames={1}
      defaultProps={{ progress: 0, studyNote: null, studyChord: null }}
    />
    <Composition
      id="GuitarChordStudy"
      component={GuitarPoster}
      width={1440}
      height={900}
      fps={30}
      durationInFrames={1}
      defaultProps={{ progress: 3, studyNote: null, studyChord: "C" }}
    />
    <Composition
      id="GuitarNoteStudy"
      component={GuitarPoster}
      width={390}
      height={844}
      fps={30}
      durationInFrames={1}
      defaultProps={{
        progress: 2,
        studyNote: { stringIndex: 5, fret: 1 },
        studyChord: null,
      }}
    />
  </>
));
