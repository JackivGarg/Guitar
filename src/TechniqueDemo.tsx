import {
  AbsoluteFill,
  Composition,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { Demo, DemoProps } from "./Demo";
import { ChordDiagram } from "./visuals";
import { getChord } from "./course";
import { smallF } from "./lesson7";
export function LessonDemo(props: DemoProps) {
  const frame = useCurrentFrame(),
    { fps } = useVideoConfig(),
    t = frame / fps;
  if (
    ![
      "handstrum",
      "fingerexercise",
      "release-mute",
      "smallF",
      "Eprep",
      "Aprep",
    ].includes(props.mode)
  )
    return <Demo {...props} />;
  let title = "",
    sub = "",
    visual;
  if (["smallF", "Eprep", "Aprep"].includes(props.mode)) {
    const c =
      props.mode === "smallF"
        ? smallF
        : props.mode === "Eprep"
          ? { ...getChord("E"), fingers: [0, 3, 4, 2, 0, 0] }
          : { ...getChord("A"), fingers: [0, 0, 2, 3, 4, 0] };
    title =
      props.mode === "smallF"
        ? "The small, four-string F."
        : "Free the index before adding a barre.";
    sub =
      props.mode === "smallF"
        ? "Index covers B1 and high e1 only. Middle G2, ring D3. Strum from D."
        : "Same chord, different fingers: use middle, ring and little finger so index is free.";
    visual = (
      <div style={{ display: "flex", gap: 80, alignItems: "center" }}>
        <div style={{ width: 310 }}>
          <ChordDiagram chord={c} />
        </div>
        <div style={{ fontSize: 28, lineHeight: 1.7, maxWidth: 470 }}>
          <b style={{ fontSize: 70 }}>
            {props.mode === "smallF" ? "F" : c.name}
          </b>
          <p>
            {props.mode === "smallF"
              ? "Two-string mini-barre.\nFour strings sounded.\nHigh e is fretted, not open."
              : "2 = middle\n3 = ring\n4 = little finger\n1 = index stays free"}
          </p>
        </div>
      </div>
    );
  } else if (props.mode === "fingerexercise") {
    const n = Math.floor(t / 0.5) % 48,
      q = n < 24 ? n : 47 - n,
      s = Math.floor(q / 4),
      fret = (q % 4) + 1;
    title = "One finger per fret. One note at a time.";
    sub =
      "Index 1 · middle 2 · ring 3 · little 4. Cross the strings slowly, then reverse. Start in a comfortable position.";
    visual = (
      <div>
        <svg width="950" height="360" viewBox="0 0 950 360">
          <rect
            x="150"
            y="40"
            width="680"
            height="275"
            rx="10"
            fill="#eadce8"
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <line
                x1={150 + i * 170}
                x2={150 + i * 170}
                y1="40"
                y2="315"
                stroke="#b9a4bf"
                strokeWidth={i === 0 ? 6 : 2}
              />
              {i > 0 && (
                <text
                  x={65 + i * 170}
                  y="345"
                  fill="#68516e"
                  fontSize="21"
                  textAnchor="middle"
                >
                  Fret {i}
                </text>
              )}
            </g>
          ))}
          {["E", "A", "D", "G", "B", "e"].map((name, i) => (
            <g key={i}>
              <text x="85" y={72 + i * 43} fill="#68516e" fontSize="23">
                {6 - i} · {name}
              </text>
              <line
                x1="145"
                x2="835"
                y1={65 + i * 43}
                y2={65 + i * 43}
                stroke="#ad97b5"
                strokeWidth={4 - i * 0.45}
              />
            </g>
          ))}
          <circle cx={65 + fret * 170} cy={65 + s * 43} r="24" fill="#b77955" />
          <text
            x={65 + fret * 170}
            y={73 + s * 43}
            textAnchor="middle"
            fill="white"
            fontSize="24"
          >
            {fret}
          </text>
        </svg>
        <div
          style={{
            textAlign: "center",
            fontSize: 27,
            color: "#806288",
            marginTop: 25,
          }}
        >
          {n < 24 ? "Forward: 1 → 2 → 3 → 4" : "Return: 4 → 3 → 2 → 1"} · String{" "}
          {6 - s}
        </div>
      </div>
    );
  } else if (props.mode === "release-mute") {
    const phase = t % 5,
      released = phase >= 1.7,
      amplitude = phase < 0.6 ? 0 : released ? 1 : 10;
    title =
      phase < 0.6
        ? "Fret the note."
        : released
          ? "Pressure off. Contact stays."
          : "Pick first. Let the note sound.";
    sub =
      "Relax the fretting pressure after the attack. Keep the fingertip touching the string in the same place; do not pull it away.";
    visual = (
      <div style={{ width: 930 }}>
        <svg width="930" height="250" viewBox="0 0 930 250">
          <rect
            x="100"
            y="65"
            width="730"
            height="110"
            rx="15"
            fill="#e8dce8"
          />
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={100 + i * 220}
              x2={100 + i * 220}
              y1="65"
              y2="175"
              stroke="#b49abb"
              strokeWidth="3"
            />
          ))}
          <path
            d={`M95 120 Q480 ${120 + Math.sin(frame * 0.6) * amplitude} 835 120`}
            fill="none"
            stroke="#82678c"
            strokeWidth="3"
          />
          <circle
            cx="430"
            cy="120"
            r="26"
            stroke="#9d7958"
            strokeWidth="4"
            fill={released ? "#f5eff3" : "#b77955"}
          />
          <text
            x="430"
            y="129"
            textAnchor="middle"
            fill={released ? "#9d7958" : "white"}
            fontSize="25"
          >
            1
          </text>
          <text
            x="430"
            y="221"
            textAnchor="middle"
            fontSize="23"
            fill="#73587d"
          >
            High e · fret 2 · fingertip stays here
          </text>
        </svg>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 25,
            marginTop: 25,
            fontSize: 26,
          }}
        >
          <span style={{ color: released ? "#b0a0b6" : "#785582" }}>
            1. Fret & pick
          </span>
          <span>→</span>
          <span style={{ color: released ? "#785582" : "#b0a0b6" }}>
            2. Relax pressure
          </span>
        </div>
      </div>
    );
  } else {
    const phase = t % 2,
      down = phase < 1,
      y = interpolate(
        phase,
        down ? [0, 1] : [1, 2],
        down ? [80, 290] : [290, 80],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );
    title = "Let the pick glide, not catch.";
    sub =
      "Down: thick strings toward thin. Up: return toward thick. Keep the wrist and grip relaxed, with a small pick tip exposed.";
    visual = (
      <svg width="960" height="350" viewBox="0 0 960 350">
        <rect x="390" y="20" width="510" height="310" rx="90" fill="#dfb486" />
        <ellipse cx="670" cy="173" rx="80" ry="106" fill="#57434c" />
        {["low E", "A", "D", "G", "B", "high e"].map((name, i) => (
          <g key={i}>
            <line
              x1="360"
              x2="885"
              y1={75 + i * 39}
              y2={75 + i * 39}
              stroke="#f8e4c1"
              strokeWidth={5 - i * 0.6}
            />
            <text x="250" y={82 + i * 39} fill="#79617f" fontSize="21">
              {name}
            </text>
          </g>
        ))}
        <g style={{ translate: `0px ${y - 75}px` }}>
          <path d="M485 55Q508 47 531 55L510 93Z" fill="#9a799f" />
          <path
            d="M550 47L550 100m-9-12 9 12 9-12"
            stroke="#7b596f"
            strokeWidth="3"
            fill="none"
            style={{
              rotate: down ? "0deg" : "180deg",
              transformOrigin: "550px 75px",
            }}
          />
        </g>
        <text x="52" y="120" fontSize="42" fill="#6f4c79">
          {down ? "DOWN ↓" : "UP ↑"}
        </text>
        <text x="52" y="166" fontSize="21" fill="#8b7293">
          Gentle brush
        </text>
        <text x="52" y="202" fontSize="21" fill="#8b7293">
          Loose wrist
        </text>
        <text x="52" y="238" fontSize="21" fill="#8b7293">
          Small motion
        </text>
      </svg>
    );
  }
  return (
    <AbsoluteFill
      style={{
        background: "#f5eff3",
        fontFamily: "Segoe UI,sans-serif",
        padding: 50,
        color: "#49324d",
      }}
    >
      <div style={{ fontSize: 16, letterSpacing: 2, color: "#927699" }}>
        SIX STRINGS · TECHNIQUE CLOSE-UP
      </div>
      <h1 style={{ fontSize: 43, letterSpacing: -1, marginTop: 27 }}>
        {title}
      </h1>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "pre-line",
        }}
      >
        {visual}
      </div>
      <p
        style={{
          fontSize: 24,
          lineHeight: 1.5,
          borderTop: "1px solid #d9ccd9",
          paddingTop: 17,
          marginBottom: 0,
          color: "#796080",
        }}
      >
        {sub}
      </p>
    </AbsoluteFill>
  );
}
export const TechniqueCompositions = () => (
  <>
    <Composition
      id="Pick-And-Strum"
      component={LessonDemo}
      durationInFrames={360}
      fps={30}
      width={1200}
      height={760}
      defaultProps={{ mode: "handstrum" }}
    />
    <Composition
      id="Four-Finger-Exercise"
      component={LessonDemo}
      durationInFrames={720}
      fps={30}
      width={1200}
      height={760}
      defaultProps={{ mode: "fingerexercise" }}
    />
    <Composition
      id="Pressure-Release-Mute"
      component={LessonDemo}
      durationInFrames={360}
      fps={30}
      width={1200}
      height={760}
      defaultProps={{ mode: "release-mute" }}
    />
    <Composition
      id="Small-F"
      component={LessonDemo}
      durationInFrames={360}
      fps={30}
      width={1200}
      height={760}
      defaultProps={{ mode: "smallF" }}
    />
    <Composition
      id="Prepare-E-Barre"
      component={LessonDemo}
      durationInFrames={360}
      fps={30}
      width={1200}
      height={760}
      defaultProps={{ mode: "Eprep" }}
    />
    <Composition
      id="Prepare-A-Barre"
      component={LessonDemo}
      durationInFrames={360}
      fps={30}
      width={1200}
      height={760}
      defaultProps={{ mode: "Aprep" }}
    />
  </>
);
