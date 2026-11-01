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
function GuitarPoster() {
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
        progress={0}
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
    />
    <Composition
      id="GuitarMobilePoster"
      component={GuitarPoster}
      width={390}
      height={844}
      fps={30}
      durationInFrames={1}
    />
  </>
));
