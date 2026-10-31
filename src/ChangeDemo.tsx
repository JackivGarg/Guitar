import {
  AbsoluteFill,
  Composition,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  getChange,
  workshopChord,
  fingerPosition,
  chordLabel,
} from "./lesson7";
import {
  CHANGE_FPS,
  CHANGE_RELEASE_START,
  CHANGE_RELEASE_END,
  CHANGE_MOVE_START,
  CHANGE_SETTLED,
  changeDurationFrames,
  changeMoveWindow,
  changePhase,
  type ChangeDirection,
} from "./changeTiming";
export type ChangeDemoProps = { changeId: string; direction?: ChangeDirection };
const point = (p: { string: number; fret: number }) => ({
  x: 75 + p.string * 57,
  y: 100 + (p.fret - 0.5) * 65,
});
const compact = (p: ReturnType<typeof fingerPosition>) =>
  p ? `${["E", "A", "D", "G", "B", "e"][p.string]}${p.fret}` : "lift";
export function ChangeDemo({ changeId, direction = "both" }: ChangeDemoProps) {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig(),
    c = getChange(changeId),
    { back, local } = changePhase(f, direction, fps);
  const source = workshopChord(back ? c.to : c.from),
    target = workshopChord(back ? c.from : c.to);
  const groups = (back ? (c.reverseGroups ?? c.groups) : c.groups)
    .map((group) =>
      group.filter((finger) => fingerPosition(target, finger) !== null),
    )
    .filter((group) => group.length > 0);
  const names = ["", "index (1)", "middle (2)", "ring (3)", "little (4)"];
  const anchors = [1, 2, 3, 4].filter((finger) => {
    const a = fingerPosition(source, finger),
      b = fingerPosition(target, finger);
    return a && b && a.string === b.string && a.fret === b.fret;
  });
  const guides = (c.slide ?? []).filter((finger) => {
    const a = fingerPosition(source, finger),
      b = fingerPosition(target, finger);
    return a && b && a.string === b.string;
  });
  const focusText = back
    ? `Return to ${chordLabel(c.from)}. Follow the moving fingers and keep the true anchors down.`
    : c.focus;
  const stayText = !back
    ? c.stay
    : anchors.length
      ? `Keep ${anchors.map((f) => `${names[f]} on ${compact(fingerPosition(source, f))}`).join(" and ")} in place.`
      : guides.length
        ? guides
            .map(
              (f) =>
                `${names[f]} keeps light contact on the ${["low E", "A", "D", "G", "B", "high e"][fingerPosition(source, f)!.string]} string, sliding from fret ${fingerPosition(source, f)!.fret} to ${fingerPosition(target, f)!.fret}. Relax its pressure first.`,
            )
            .join(" ")
        : "No stationary anchor. Release the moving fingertips and follow the groups in the order shown.";
  const releaseText = back
    ? (c.back.find((text) => /^(Lift|Release|Move|Return)/.test(text)) ??
      c.back[0])
    : c.release;
  const progress = (finger: number) => {
    const a = fingerPosition(source, finger),
      b = fingerPosition(target, finger);
    if (a && b && a.string === b.string && a.fret === b.fret) return 0;
    if (a && !b)
      return interpolate(
        local,
        [CHANGE_RELEASE_START, CHANGE_RELEASE_END],
        [0, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        },
      );
    const group = Math.max(
      0,
      groups.findIndex((g) => g.includes(finger)),
    );
    const { start, end } = changeMoveWindow(group, groups.length);
    return interpolate(local, [start, end], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };
  const settled = local >= CHANGE_SETTLED;
  const sounding = settled ? target : source;
  const activeGroup = groups.find((_, i) => {
    const { start, end } = changeMoveWindow(i, groups.length);
    return local >= start && local <= end;
  });
  const stage =
    local < CHANGE_RELEASE_START
      ? `Start: ${chordLabel(back ? c.to : c.from)}`
      : local < CHANGE_MOVE_START
        ? "Pressure off — keep the anchors"
        : settled
          ? `Ready: ${chordLabel(back ? c.from : c.to)}`
          : activeGroup
            ? `Move ${activeGroup.map((x) => ["", "index", "middle", "ring", "little"][x]).join(" + ")}`
            : "Place the moving fingers";
  return (
    <AbsoluteFill
      style={{
        background: "#f5eff3",
        fontFamily: "Segoe UI, sans-serif",
        color: "#49324d",
        padding: 45,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 16,
          letterSpacing: 2,
          color: "#9d879e",
        }}
      >
        <span>CHORD CHANGE · QUICK DEMO</span>
        <span>{back ? "RETURN DIRECTION" : "FORWARD DIRECTION"}</span>
      </div>
      <h1 style={{ fontSize: 45, letterSpacing: -1.5, margin: "20px 0 10px" }}>
        {chordLabel(back ? c.to : c.from)} → {chordLabel(back ? c.from : c.to)}
      </h1>
      <div style={{ fontSize: 23, color: "#a46d55", marginBottom: 10 }}>
        {stage}
      </div>
      <div
        style={{
          display: "flex",
          gap: 40,
          flex: 1,
          alignItems: "center",
          minHeight: 0,
        }}
      >
        <div style={{ width: 470, flexShrink: 0 }}>
          <svg
            viewBox="0 0 470 515"
            width="470"
            height="515"
            role="img"
            aria-label={`${source.name} to ${target.name} finger movement. ${focusText}`}
          >
            {Array.from({ length: 6 }, (_, i) => (
              <g key={i}>
                <line
                  x1={75 + i * 57}
                  x2={75 + i * 57}
                  y1="100"
                  y2="425"
                  stroke="#ac9ead"
                  strokeWidth={3 - i * 0.3}
                />
                <text
                  x={75 + i * 57}
                  y="458"
                  textAnchor="middle"
                  fontSize="20"
                  fill="#947b98"
                >
                  {["E", "A", "D", "G", "B", "e"][i]}
                </text>
                <text
                  x={75 + i * 57}
                  y="78"
                  textAnchor="middle"
                  fontSize="22"
                  fill="#947b98"
                >
                  {sounding.frets[i] < 0
                    ? "×"
                    : sounding.frets[i] === 0
                      ? "○"
                      : ""}
                </text>
              </g>
            ))}
            {Array.from({ length: 6 }, (_, i) => (
              <g key={i}>
                <line
                  x1="75"
                  x2="360"
                  y1={100 + i * 65}
                  y2={100 + i * 65}
                  stroke={i === 0 ? "#49324d" : "#c5b6c8"}
                  strokeWidth={i === 0 ? 7 : 2}
                />
                {i < 5 && (
                  <text x="46" y={140 + i * 65} fontSize="17" fill="#a68bac">
                    {i + 1}
                  </text>
                )}
              </g>
            ))}
            {[source, target].map((chord, i) =>
              chord.barre ? (
                <rect
                  key={i}
                  x={75 + chord.barre[1] * 57 - 14}
                  y={100 + (chord.barre[0] - 0.5) * 65 - 14}
                  width={(chord.barre[2] - chord.barre[1]) * 57 + 28}
                  height="28"
                  rx="14"
                  fill="#9c788e"
                  opacity={i === 0 ? 1 - progress(1) : progress(1)}
                />
              ) : null,
            )}
            {[1, 2, 3, 4].map((finger) => {
              const a = fingerPosition(source, finger),
                b = fingerPosition(target, finger);
              if (!a && !b) return null;
              const anchor =
                !!a && !!b && a.string === b.string && a.fret === b.fret;
              const p = progress(finger),
                pa = point(a ?? b!),
                pb = point(b ?? a!),
                moving = p > 0 && p < 1;
              const slide =
                c.slide?.includes(finger) && a && b && a.string === b.string;
              const color = anchor ? "#789064" : slide ? "#6d90a4" : "#b77955";
              const x = pa.x + (pb.x - pa.x) * p,
                y =
                  pa.y +
                  (pb.y - pa.y) * p -
                  (moving && !slide ? Math.sin(p * Math.PI) * 22 : 0);
              const opacity = !a ? p : !b ? 1 - p : 1;
              const released =
                !anchor &&
                local >= CHANGE_RELEASE_START &&
                local < CHANGE_SETTLED;
              return (
                <g key={finger} opacity={opacity}>
                  {!anchor && a && b && (
                    <path
                      d={`M${pa.x} ${pa.y} L${pb.x} ${pb.y}`}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      strokeDasharray="5 6"
                      opacity=".35"
                    />
                  )}
                  {anchor && (
                    <circle
                      cx={x}
                      cy={y}
                      r="26"
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      opacity=".3"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r="18"
                    fill={released ? "#f5eff3" : color}
                    stroke={color}
                    strokeWidth="3"
                  />
                  <text
                    x={x}
                    y={y + 7}
                    textAnchor="middle"
                    fontSize="21"
                    fontWeight="600"
                    fill={released ? color : "white"}
                  >
                    {finger}
                  </text>
                </g>
              );
            })}
            <text
              x="220"
              y="500"
              textAnchor="middle"
              fill="#9c839f"
              fontSize="16"
            >
              Front view · thick low E on the left
            </text>
          </svg>
        </div>
        <div style={{ flex: 1, paddingRight: 15 }}>
          <div
            style={{
              fontSize: 29,
              fontWeight: 600,
              lineHeight: 1.35,
              marginBottom: 24,
            }}
          >
            {focusText}
          </div>
          <div
            style={{
              fontSize: 15,
              letterSpacing: 1.5,
              color: "#789064",
              fontWeight: 600,
            }}
          >
            KEEP / REFERENCE
          </div>
          <p
            style={{
              fontSize: 21,
              lineHeight: 1.55,
              margin: "10px 0 22px",
              color: "#7f6e84",
            }}
          >
            {stayText}
          </p>
          <div
            style={{
              fontSize: 15,
              letterSpacing: 1.5,
              color: c.slide ? "#6d90a4" : "#b77955",
              fontWeight: 600,
            }}
          >
            {c.slide ? "CONTACT STAYS · PRESSURE OFF" : "RELEASE BEFORE MOVING"}
          </div>
          <p
            style={{
              fontSize: 21,
              lineHeight: 1.55,
              margin: "10px 0 20px",
              color: "#7f6e84",
            }}
          >
            {releaseText}
          </p>
          <div
            style={{
              borderTop: "1px solid #d9ccd9",
              paddingTop: 14,
              display: "flex",
              gap: 18,
            }}
          >
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ fontSize: 17, color: "#a082a6" }}>
                <b>{i}</b> · {compact(fingerPosition(source, i))} →{" "}
                {compact(fingerPosition(target, i))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        style={{
          fontSize: 18,
          color: "#a78eac",
          borderTop: "1px solid #ddcfdf",
          paddingTop: 16,
        }}
      >
        Solid green = stationary anchor · Blue = light-contact guide · Outlined
        moving dot = pressure released
      </div>
    </AbsoluteFill>
  );
}
export function ChangeCompositions() {
  return (
    <>
      <Composition
        id="Shift-C-Am"
        component={ChangeDemo}
        durationInFrames={changeDurationFrames()}
        fps={CHANGE_FPS}
        width={1200}
        height={850}
        defaultProps={{ changeId: "C-Am" }}
      />
      <Composition
        id="Shift-Am-Em"
        component={ChangeDemo}
        durationInFrames={changeDurationFrames()}
        fps={CHANGE_FPS}
        width={1200}
        height={850}
        defaultProps={{ changeId: "Am-Em" }}
      />
      <Composition
        id="Shift-Em-E"
        component={ChangeDemo}
        durationInFrames={changeDurationFrames()}
        fps={CHANGE_FPS}
        width={1200}
        height={850}
        defaultProps={{ changeId: "Em-E" }}
      />
      <Composition
        id="Shift-C-Fmaj7"
        component={ChangeDemo}
        durationInFrames={changeDurationFrames()}
        fps={CHANGE_FPS}
        width={1200}
        height={850}
        defaultProps={{ changeId: "C-Fmaj7" }}
      />
      <Composition
        id="Shift-A-D"
        component={ChangeDemo}
        durationInFrames={changeDurationFrames()}
        fps={CHANGE_FPS}
        width={1200}
        height={850}
        defaultProps={{ changeId: "A-D" }}
      />
      <Composition
        id="Shift-Fmaj7-G"
        component={ChangeDemo}
        durationInFrames={changeDurationFrames()}
        fps={CHANGE_FPS}
        width={1200}
        height={850}
        defaultProps={{ changeId: "Fmaj7-G" }}
      />
      <Composition
        id="Shift-F-G"
        component={ChangeDemo}
        durationInFrames={changeDurationFrames()}
        fps={CHANGE_FPS}
        width={1200}
        height={850}
        defaultProps={{ changeId: "F-G" }}
      />
      <Composition
        id="Shift-A-Am"
        component={ChangeDemo}
        durationInFrames={changeDurationFrames()}
        fps={CHANGE_FPS}
        width={1200}
        height={850}
        defaultProps={{ changeId: "A-Am" }}
      />
      <Composition
        id="Shift-Fmaj7-Dm"
        component={ChangeDemo}
        durationInFrames={changeDurationFrames()}
        fps={CHANGE_FPS}
        width={1200}
        height={850}
        defaultProps={{ changeId: "Fmaj7-Dm" }}
      />
      <Composition
        id="Shift-C-Dm"
        component={ChangeDemo}
        durationInFrames={changeDurationFrames()}
        fps={CHANGE_FPS}
        width={1200}
        height={850}
        defaultProps={{ changeId: "C-Dm" }}
      />
      <Composition
        id="Shift-G-D"
        component={ChangeDemo}
        durationInFrames={changeDurationFrames()}
        fps={CHANGE_FPS}
        width={1200}
        height={850}
        defaultProps={{ changeId: "G-D" }}
      />
      <Composition
        id="Shift-D-Em"
        component={ChangeDemo}
        durationInFrames={changeDurationFrames()}
        fps={CHANGE_FPS}
        width={1200}
        height={850}
        defaultProps={{ changeId: "D-Em" }}
      />
      <Composition
        id="Shift-F-D"
        component={ChangeDemo}
        durationInFrames={changeDurationFrames()}
        fps={CHANGE_FPS}
        width={1200}
        height={850}
        defaultProps={{ changeId: "F-D" }}
      />
      <Composition
        id="Shift-D-Am"
        component={ChangeDemo}
        durationInFrames={changeDurationFrames()}
        fps={CHANGE_FPS}
        width={1200}
        height={850}
        defaultProps={{ changeId: "D-Am" }}
      />
      <Composition
        id="Shift-D-E"
        component={ChangeDemo}
        durationInFrames={changeDurationFrames()}
        fps={CHANGE_FPS}
        width={1200}
        height={850}
        defaultProps={{ changeId: "D-E" }}
      />
    </>
  );
}
