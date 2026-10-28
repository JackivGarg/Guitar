import { useState } from "react";
import { Volume2 } from "lucide-react";
import { barreChord, Family, Quality } from "./barre";
import { ChordDiagram } from "./visuals";
import { getAudio, tone } from "./sound";
import { openMidi } from "./course";
export function BarreExplorer() {
  const [family, setFamily] = useState<Family>("E"),
    [quality, setQuality] = useState<Quality>("major"),
    [fret, setFret] = useState(1),
    [flats, setFlats] = useState(false);
  const c = barreChord(family, quality, fret, flats);
  const hear = () => {
    const a = getAudio();
    c.frets.forEach((f, i) => {
      if (f >= 0) tone(openMidi[i] + f, a.currentTime + i * 0.025, 1.5, 0.065);
    });
  };
  return (
    <details className="barre-explorer" open>
      <summary>Try the movable-shape explorer</summary>
      <p>
        Choose a family, quality and root fret. Move the entire shape by the
        same fret distance.
      </p>
      <div className="barre-controls">
        <label>
          Root family
          <select
            aria-label="Root family"
            value={family}
            onChange={(e) => setFamily(e.target.value as Family)}
          >
            <option value="E">E shape · low E root</option>
            <option value="A">A shape · A root</option>
          </select>
        </label>
        <label>
          Quality
          <select
            aria-label="Quality"
            value={quality}
            onChange={(e) => setQuality(e.target.value as Quality)}
          >
            <option>major</option>
            <option>minor</option>
          </select>
        </label>
        <label>
          Root / barre fret
          <select
            aria-label="Root / barre fret"
            value={fret}
            onChange={(e) => setFret(+e.target.value)}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
        <label>
          Names
          <select
            aria-label="Note naming"
            value={flats ? "flats" : "sharps"}
            onChange={(e) => setFlats(e.target.value === "flats")}
          >
            <option value="sharps">Sharps ♯</option>
            <option value="flats">Flats ♭</option>
          </select>
        </label>
      </div>
      <div className="barre-result">
        <div className="barre-diagram">
          <ChordDiagram chord={c} interactive />
        </div>
        <div>
          <h3>
            {c.name} · {family}-shape {quality}
          </h3>
          <p>{c.tip}</p>
          <p>
            <b>Root / index barre: fret {fret}.</b>
            <br />
            Other fingers can sit at frets {fret + 1} and {fret + 2}; those
            numbers do not name the root.
          </p>
          <p className="micro">
            Read left to right: low E A D G B e. Tap a diagram string to hear
            its synthesized pitch.
          </p>
          <button className="secondary" onClick={hear}>
            <Volume2 size={15} />
            Hear {c.name}
          </button>
        </div>
      </div>
    </details>
  );
}
