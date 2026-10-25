import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Mic,
  Square,
  Plus,
  Minus,
  Check,
  Timer,
} from "lucide-react";
import { getAudio, click, playChord, playNote } from "./sound";
import { chords, getChord, patterns, openMidi, stringNames } from "./course";
import { ChordDiagram } from "./visuals";
import { Progress, dayKey, useStored } from "./state";

export function Metronome() {
  const [bpm, setBpm] = useState(60),
    [running, setRunning] = useState(false),
    [beat, setBeat] = useState(-1),
    [pattern, setPattern] = useState(-1),
    [chord, setChord] = useState("Em");
  const scheduled = useRef<ReturnType<typeof setTimeout>[]>([]);
  const taps = useRef<number[]>([]);
  useEffect(() => {
    if (!running) return;
    const audio = getAudio();
    let next = audio.currentTime + 0.08,
      slot = 0;
    const live = { value: true };
    const schedule = () => {
      while (next < audio.currentTime + 0.12) {
        const n = slot % 8,
          t = next;
        if (n % 2 === 0) click(t, n === 0);
        if (pattern >= 0) {
          const s = patterns[pattern].slots[n];
          if (s !== "·") playChord(chord, s === "U", t, s === "M");
        }
        const timeout = setTimeout(
          () => {
            if (live.value) setBeat(n);
          },
          Math.max(0, (t - audio.currentTime) * 1000),
        );
        scheduled.current.push(timeout);
        if (scheduled.current.length > 30) scheduled.current.shift();
        next += 30 / bpm;
        slot++;
      }
    };
    schedule();
    const id = setInterval(schedule, 25);
    return () => {
      live.value = false;
      clearInterval(id);
      scheduled.current.forEach(clearTimeout);
      scheduled.current = [];
      setBeat(-1);
    };
  }, [running, bpm, pattern, chord]);
  const tap = () => {
    const now = performance.now();
    taps.current = [...taps.current.filter((t) => now - t < 5000), now].slice(
      -6,
    );
    if (taps.current.length > 1) {
      const a = taps.current;
      setBpm(
        Math.max(
          35,
          Math.min(
            180,
            Math.round((60000 * (a.length - 1)) / (a[a.length - 1] - a[0])),
          ),
        ),
      );
    }
  };
  return (
    <div className="metronome">
      <div className="section-label">KEEP A STEADY PULSE</div>
      <div className="bpm">
        <button
          className="icon-button"
          aria-label="Decrease tempo"
          onClick={() => setBpm((b) => Math.max(35, b - 5))}
        >
          <Minus size={18} />
        </button>
        <div>
          <strong>{bpm}</strong>
          <span>BPM</span>
        </div>
        <button
          className="icon-button"
          aria-label="Increase tempo"
          onClick={() => setBpm((b) => Math.min(180, b + 5))}
        >
          <Plus size={18} />
        </button>
      </div>
      <input
        aria-label="Tempo"
        type="range"
        min="35"
        max="180"
        value={bpm}
        onChange={(e) => setBpm(+e.target.value)}
      />
      <div className="beat-dots">
        {[0, 2, 4, 6].map((v, i) => (
          <div className={Math.floor(beat / 2) === i ? "lit" : ""} key={v}>
            {i + 1}
          </div>
        ))}
      </div>
      <div className="form-row">
        <label>
          Pattern
          <select
            aria-label="Strum pattern"
            value={pattern}
            onChange={(e) => setPattern(+e.target.value)}
          >
            <option value="-1">Click only</option>
            {patterns.map((p, i) => (
              <option value={i} key={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Chord
          <select
            aria-label="Metronome chord"
            value={chord}
            onChange={(e) => setChord(e.target.value)}
          >
            {chords.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="rhythm-strip">
        {(pattern >= 0
          ? patterns[pattern].slots
          : ["D", "·", "D", "·", "D", "·", "D", "·"]
        ).map((s, i) => (
          <div className={i === beat ? "current" : ""} key={i}>
            <small>{["1", "&", "2", "&", "3", "&", "4", "&"][i]}</small>
            <b>{s === "D" ? "↓" : s === "U" ? "↑" : s === "M" ? "×" : "·"}</b>
          </div>
        ))}
      </div>
      <div className="button-row">
        <button
          className="primary"
          onClick={() => {
            getAudio();
            setRunning(!running);
          }}
        >
          {running ? <Pause size={17} /> : <Play size={17} />}{" "}
          {running ? "Stop metronome" : "Start metronome"}
        </button>
        <button className="secondary" onClick={tap}>
          Tap tempo
        </button>
      </div>
      <p className="micro">
        Reference chord sounds are synthesized. Start slowly and count aloud.
      </p>
    </div>
  );
}

export function Changes({
  progress,
  setProgress,
}: {
  progress: Progress;
  setProgress: (p: Progress | ((p: Progress) => Progress)) => void;
}) {
  const [a, setA] = useState("C"),
    [b, setB] = useState("Am"),
    [left, setLeft] = useState(60),
    [running, setRunning] = useState(false),
    [count, setCount] = useState(0),
    [saved, setSaved] = useState(false);
  const deadline = useRef(0);
  useEffect(() => {
    if (!running) return;
    deadline.current = Date.now() + left * 1000;
    const id = setInterval(() => {
      const rem = Math.max(
        0,
        Math.ceil((deadline.current - Date.now()) / 1000),
      );
      setLeft(rem);
      if (rem === 0) {
        setRunning(false);
        click(getAudio().currentTime, true);
      }
    }, 150);
    return () => clearInterval(id);
  }, [running]);
  const reset = () => {
    setRunning(false);
    setLeft(60);
    setCount(0);
    setSaved(false);
  };
  const scores = progress.scores
    .filter((s) => s.pair === `${a} ↔ ${b}`)
    .slice(-5);
  return (
    <div>
      <div className="section-label">ONE-MINUTE CHANGES</div>
      <h2>Make every change count.</h2>
      <p>
        A change counts when you arrive at a chord and strum it clearly. Count
        each successful arrival yourself.
      </p>
      <div className="pair-select">
        <select
          aria-label="First chord"
          value={a}
          disabled={running}
          onChange={(e) => {
            setA(e.target.value);
            reset();
          }}
        >
          {chords.map((c) => (
            <option key={c.name}>{c.name}</option>
          ))}
        </select>
        <span>↔</span>
        <select
          aria-label="Second chord"
          value={b}
          disabled={running}
          onChange={(e) => {
            setB(e.target.value);
            reset();
          }}
        >
          {chords.map((c) => (
            <option key={c.name}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="pair-diagrams">
        <div>
          <ChordDiagram chord={getChord(a)} />
          <b>{a}</b>
        </div>
        <div>
          <ChordDiagram chord={getChord(b)} />
          <b>{b}</b>
        </div>
      </div>
      <div className="change-controls">
        <div className="clock">0:{String(left).padStart(2, "0")}</div>
        <div className="counter">
          <button
            className="secondary"
            aria-label="Remove one change"
            disabled={!count || saved}
            onClick={() => setCount((c) => Math.max(0, c - 1))}
          >
            <Minus size={18} />
          </button>
          <strong aria-live="polite">{count}</strong>
          <button
            className="primary"
            disabled={!running}
            onClick={() => setCount((c) => c + 1)}
          >
            <Plus size={18} /> Clean change
          </button>
        </div>
      </div>
      <div className="button-row">
        <button
          className="primary"
          disabled={left === 0}
          onClick={() => setRunning(!running)}
        >
          {running ? <Pause size={16} /> : <Play size={16} />}{" "}
          {running ? "Pause" : left < 60 ? "Resume" : "Start 60 seconds"}
        </button>
        <button className="secondary" onClick={reset}>
          <RotateCcw size={16} /> Reset
        </button>
        {left === 0 && (
          <button
            className="primary"
            disabled={saved}
            onClick={() => {
              setProgress((p) => ({
                ...p,
                scores: [
                  ...p.scores,
                  { date: dayKey(), pair: `${a} ↔ ${b}`, count },
                ],
              }));
              setSaved(true);
            }}
          >
            <Check size={16} />
            {saved ? "Saved" : "Save score"}
          </button>
        )}
      </div>
      {scores.length > 0 && (
        <div className="soft-box">
          <b>
            Recent {a} ↔ {b} rounds
          </b>
          <p>{scores.map((s) => `${s.date}: ${s.count}`).join(" · ")}</p>
        </div>
      )}
    </div>
  );
}

function detectPitch(buf: Float32Array, rate: number) {
  let energy = 0;
  for (const x of buf) energy += x * x;
  if (Math.sqrt(energy / buf.length) < 0.012) return null;
  const min = Math.floor(rate / 440),
    max = Math.floor(rate / 65),
    values: number[] = [];
  let highest = 0;
  for (let lag = min; lag <= max; lag++) {
    let sum = 0,
      aa = 0,
      bb = 0;
    for (let i = 0; i < buf.length - max; i++) {
      sum += buf[i] * buf[i + lag];
      aa += buf[i] ** 2;
      bb += buf[i + lag] ** 2;
    }
    const v = sum / Math.sqrt(aa * bb || 1);
    values[lag] = v;
    highest = Math.max(highest, v);
  }
  if (highest < 0.75) return null;
  let best = 0;
  for (let lag = min + 1; lag < max; lag++) {
    if (
      values[lag] > 0.9 * highest &&
      values[lag] > values[lag - 1] &&
      values[lag] >= values[lag + 1]
    ) {
      best = lag;
      break;
    }
  }
  if (!best) return null;
  const left = values[best - 1],
    right = values[best + 1],
    mid = values[best],
    offset = (right - left) / (2 * (2 * mid - left - right) || 1);
  return rate / (best + offset);
}
export function Tuning() {
  const [listening, setListening] = useState(false),
    [hz, setHz] = useState<number | null>(null),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false),
    [selected, setSelected] = useState(0);
  const stream = useRef<MediaStream | null>(null),
    interval = useRef<ReturnType<typeof setInterval> | undefined>(undefined),
    source = useRef<MediaStreamAudioSourceNode | null>(null),
    mounted = useRef(true);
  const stop = () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    source.current?.disconnect();
    clearInterval(interval.current);
    setListening(false);
    setHz(null);
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stream.current?.getTracks().forEach((t) => t.stop());
      source.current?.disconnect();
      clearInterval(interval.current);
    };
  }, []);
  const start = async () => {
    setError("");
    setPending(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      if (!mounted.current) {
        s.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = s;
      const a = getAudio(),
        analyser = a.createAnalyser();
      analyser.fftSize = 4096;
      source.current = a.createMediaStreamSource(s);
      source.current.connect(analyser);
      const data = new Float32Array(4096);
      interval.current = setInterval(() => {
        analyser.getFloatTimeDomainData(data);
        setHz(detectPitch(data, a.sampleRate));
      }, 180);
      setListening(true);
    } catch {
      setError(
        "Microphone access was unavailable. Allow it in your browser, or use the reference tones below.",
      );
    } finally {
      if (mounted.current) setPending(false);
    }
  };
  const target = 440 * 2 ** ((openMidi[selected] - 69) / 12),
    cents = hz ? 1200 * Math.log2(hz / target) : 0,
    close = !!hz && Math.abs(cents) < 5;
  return (
    <div>
      <div className="section-label">TUNE BEFORE YOU PLAY</div>
      <h2>Find your starting note.</h2>
      <p>
        Standard tuning, A4 = 440 Hz. Select a string, then pluck it by itself.
        Reference tones work without microphone access.
      </p>
      <div className="string-buttons">
        {stringNames.map((s, i) => (
          <button
            className={selected === i ? "selected" : ""}
            key={i}
            onClick={() => {
              setSelected(i);
              playNote(openMidi[i]);
            }}
          >
            <small>STRING {6 - i}</small>
            <b>{s}</b>
            <span>{(440 * 2 ** ((openMidi[i] - 69) / 12)).toFixed(2)} Hz</span>
          </button>
        ))}
      </div>
      <div className="tuner-display">
        <div className="section-label">
          {listening
            ? "LISTENING · ONE STRING AT A TIME"
            : "SELECT A STRING ABOVE TO HEAR IT"}
        </div>
        <strong>
          {stringNames[selected]}
          <small>{[2, 2, 3, 3, 3, 4][selected]}</small>
        </strong>
        <div className="tuner-track">
          <span
            style={{
              left: `${50 + Math.max(-50, Math.min(50, cents)) * 0.85}%`,
            }}
            className={close ? "in-tune" : ""}
          />
          <i />
        </div>
        <div className="tuner-labels">
          <span>♭ Flat</span>
          <span>
            {hz
              ? close
                ? "In tune"
                : `${Math.round(cents) > 0 ? "+" : ""}${Math.round(cents)} cents`
              : listening
                ? "Pluck the selected open string"
                : "Ready when you are"}
          </span>
          <span>Sharp ♯</span>
        </div>
        {hz && (
          <p>
            {hz.toFixed(1)} Hz detected · {target.toFixed(2)} Hz target
            {Math.abs(cents) > 100
              ? " · Check that you selected the correct string and octave."
              : ""}
          </p>
        )}
      </div>
      <div className="button-row">
        <button
          className="primary"
          disabled={pending}
          onClick={listening ? stop : start}
        >
          {listening ? <Square size={16} /> : <Mic size={16} />}{" "}
          {pending
            ? "Connecting microphone…"
            : listening
              ? "Stop listening"
              : "Listen with microphone"}
        </button>
        <button
          className="secondary"
          onClick={() => playNote(openMidi[selected])}
        >
          <Volume2 size={16} /> Play reference
        </button>
      </div>
      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}
      <p className="micro">
        Microphone audio stays in this browser. No recording or upload. Very
        low-quality microphones may need a dedicated tuner.
      </p>
    </div>
  );
}

export function Fretboard() {
  const [flats, setFlats] = useState(false),
    [selected, setSelected] = useState({ s: 0, f: 0 });
  const names = flats
    ? ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"]
    : ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  return (
    <div>
      <div className="section-label">FRETBOARD EXPLORER</div>
      <h2>Every note has a place.</h2>
      <p>
        Tap a note to hear it. The thin high e is the top row; the thick low E
        is the bottom row. One fret is one half step.
      </p>
      <div className="button-row">
        <button
          className={!flats ? "primary" : "secondary"}
          onClick={() => setFlats(false)}
        >
          Sharp names ♯
        </button>
        <button
          className={flats ? "primary" : "secondary"}
          onClick={() => setFlats(true)}
        >
          Flat names ♭
        </button>
      </div>
      <div className="fretboard-scroll">
        <div className="fretboard">
          <div className="fret-row fret-numbers">
            <b>STRING</b>
            {Array.from({ length: 13 }, (_, f) => (
              <span key={f}>{f === 0 ? "Open" : f}</span>
            ))}
          </div>
          {[5, 4, 3, 2, 1, 0].map((s) => (
            <div className="fret-row" key={s}>
              <b>
                {6 - s} · {stringNames[s]}
              </b>
              {Array.from({ length: 13 }, (_, f) => (
                <button
                  key={f}
                  aria-label={`String ${6 - s}, fret ${f}, ${names[(openMidi[s] + f) % 12]}`}
                  className={
                    (selected.s === s && selected.f === f ? "picked " : "") +
                    ([0, 2, 4, 5, 7, 9, 11].includes((openMidi[s] + f) % 12)
                      ? "natural"
                      : "")
                  }
                  onClick={() => {
                    setSelected({ s, f });
                    playNote(openMidi[s] + f);
                  }}
                >
                  {names[(openMidi[s] + f) % 12]}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="soft-box">
        <b>{names[(openMidi[selected.s] + selected.f) % 12]}</b> · String{" "}
        {6 - selected.s}, fret {selected.f} ·{" "}
        {(440 * 2 ** ((openMidi[selected.s] + selected.f - 69) / 12)).toFixed(
          2,
        )}{" "}
        Hz
        <p>
          B–C and E–F are one fret apart. Twelve frets return to the same note
          name, one octave higher.
        </p>
      </div>
    </div>
  );
}
