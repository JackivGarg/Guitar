import { useState } from "react";
import { ArrowRight, Check, Volume2 } from "lucide-react";
import { getChord, openMidi } from "./course";
import { ChordDiagram } from "./visuals";
import { playNote } from "./sound";
type Props = {
  unitId: string;
  onTool: (tool: "tuning" | "rhythm" | "fretboard" | "chords") => void;
};
const strings = ["Low E", "A", "D", "G", "B", "High e"];
export function BasicsVisual({ unitId, onTool }: Props) {
  const [selected, setSelected] = useState(0);
  if (unitId === "setup-strings" || unitId === "setup-tuning")
    return (
      <div className="basics-strings">
        <h2>
          {unitId === "setup-tuning"
            ? "One string at a time."
            : "Six strings. Know each one."}
        </h2>
        <p>Thickest to thinnest · standard tuning</p>
        <div className="basics-string-list">
          {strings.map((name, i) => (
            <button
              key={name}
              className={selected === i ? "selected" : ""}
              aria-label={`Hear string ${6 - i}, ${name}`}
              onClick={() => {
                setSelected(i);
                playNote(openMidi[i]);
              }}
            >
              <span>{6 - i}</span>
              <b>{name}</b>
              <i style={{ height: Math.max(1, 4 - i * 0.55) }} />
              <Volume2 size={17} />
            </button>
          ))}
        </div>
        <p className="basics-caption">
          Listen, point to that string on your guitar, then pluck it. Reference
          sounds are synthesized.
        </p>
        {unitId === "setup-tuning" && (
          <button className="primary" onClick={() => onTool("tuning")}>
            Open the tuner
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    );
  if (unitId === "setup-fret")
    return (
      <div className="basics-fret">
        <h2>Just behind the metal fret.</h2>
        <svg
          viewBox="0 0 620 240"
          role="img"
          aria-label="High e string at fret 1, fingertip just behind the first metal fret wire"
        >
          <rect x="70" y="55" width="500" height="125" rx="8" fill="#dbe0ef" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <line
                x1={80 + i * 160}
                x2={80 + i * 160}
                y1="55"
                y2="180"
                stroke={i === 0 ? "#24365d" : "#8d9bb8"}
                strokeWidth={i === 0 ? 8 : 5}
              />
              {i > 0 && (
                <text
                  x={80 + i * 160}
                  y="213"
                  textAnchor="middle"
                  fill="#546381"
                  fontSize="16"
                >
                  Fret {i}
                </text>
              )}
            </g>
          ))}
          <line
            x1="70"
            x2="575"
            y1="119"
            y2="119"
            stroke="#7889a7"
            strokeWidth="2"
          />
          <circle cx="215" cy="119" r="22" fill="#233db7" />
          <text x="215" y="126" textAnchor="middle" fill="white" fontSize="19">
            1
          </text>
          <text x="35" y="125" textAnchor="middle" fill="#334365" fontSize="19">
            e
          </text>
        </svg>
        <p>
          Use your fingertip. Pick gently. Adjust the position before adding
          pressure.
        </p>
        <button className="secondary" onClick={() => playNote(openMidi[5] + 1)}>
          <Volume2 size={15} />
          Hear the target note · F
        </button>
      </div>
    );
  if (unitId === "setup-fingers")
    return (
      <div className="basics-fingers">
        <h2>Give each finger a name.</h2>
        <p>These numbers name your fretting fingers—not the fret.</p>
        <div>
          {["Index", "Middle", "Ring", "Little"].map((name, i) => (
            <button
              aria-pressed={selected === i}
              className={selected === i ? "selected" : ""}
              key={name}
              onClick={() => setSelected(i)}
            >
              <b>{i + 1}</b>
              <span>{name}</span>
            </button>
          ))}
        </div>
        <p className="basics-caption">
          Touch each fingertip to your thumb as you say its number. Thumb
          supports the neck.
        </p>
        <figure className="basics-diagram-reading">
          <ChordDiagram chord={getChord("C")} />
          <figcaption>
            <h3>Read one C major shape.</h3>
            <p>
              1 is index on B, fret 1. 2 is middle on D, fret 2. 3 is ring on A,
              fret 3.
            </p>
            <p>
              Read left to right: low E, A, D, G, B, high e. The cross means
              leave low E out. The open circles mean let G and high e ring
              without pressing.
            </p>
            <p>
              Point to the dot marked 3, then find ring finger, string A and
              fret 3 on your guitar.
            </p>
          </figcaption>
        </figure>
      </div>
    );
  return (
    <div className="basics-posture">
      <h2>A comfortable beginning.</h2>
      <p>
        Set your guitar down on a stable support. Let your hands work without
        holding up its weight.
      </p>
      <ul>
        {[
          "Rest the guitar securely on your thigh.",
          "Keep the neck slightly raised and shoulders loose.",
          "Keep the wrist comfortable; use light thumb support.",
        ].map((s) => (
          <li key={s}>
            <Check size={18} />
            {s}
          </li>
        ))}
      </ul>
      <p className="basics-caption">
        Hold this position for 30 seconds. Reposition if it feels strained.
      </p>
    </div>
  );
}
