import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Pause,
  Play,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { ChordDiagram } from "./visuals";
import { changes, chordLabel, workshopChord } from "./lesson7";
import { openMidi } from "./course";
import { getAudio } from "./sound";
import { dayKey, Progress, Session, useStored } from "./state";
import {
  jamClock,
  jamPatterns,
  jamSlot,
  JamPattern,
  rotateLoop,
} from "./jamEngine";
import "./jam-room.css";

type Props = {
  progress: Progress;
  onSaveSession: (session: Session) => void;
  onReference: () => void;
  onChange: (changeId: string) => void;
  suspended?: boolean;
};
type Draft = { seconds: number; feeling: string };
type Engine = {
  audio: AudioContext;
  start: number;
  nextSlot: number;
  interval: ReturnType<typeof setInterval>;
  raf: number;
  gain: GainNode;
  voices: Set<OscillatorNode>;
  bpm: number;
  sequence: string[];
  bars: number;
  pattern: JamPattern;
};
const draftKey = "six-strings-jam-draft-v1";
const feelings = [
  "Stayed with the beat",
  "Changes need work",
  "Sound needs work",
  "Tempo was too fast",
];
const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
const pairFor = (from: string, to: string) =>
  changes.find((c) => c.from === from && c.to === to) ||
  changes.find((c) => c.from === to && c.to === from);

export function JamRoom({
  progress,
  onSaveSession,
  onReference,
  onChange,
  suspended = false,
}: Props) {
  const [loop, setLoop] = useState("foundations"),
    [pair, setPair] = useState("C-Am"),
    [bpm, setBpm] = useState(60),
    [bars, setBars] = useState(2),
    [pattern, setPattern] = useState<JamPattern>("down"),
    [startAt, setStartAt] = useState(0),
    [clickOn, setClickOn] = useState(true),
    [guideOn, setGuideOn] = useState(true);
  const [running, setRunning] = useState(false),
    [starting, setStarting] = useState(false),
    [slot, setSlot] = useState(0),
    [liveSeconds, setLiveSeconds] = useState(0),
    [notice, setNotice] = useState("");
  const [draft, setDraft, storageError] = useStored<Draft>(
    draftKey,
    { seconds: 0, feeling: feelings[0] },
    (value) =>
      !!value &&
      typeof value === "object" &&
      Number.isFinite((value as Draft).seconds) &&
      (value as Draft).seconds >= 0 &&
      (value as Draft).seconds <= 86400 &&
      typeof (value as Draft).feeling === "string",
  );
  const engine = useRef<Engine | null>(null),
    sound = useRef({ clickOn, guideOn }),
    draftRef = useRef(draft),
    startToken = useRef(0),
    stopRef = useRef<(update?: boolean) => void>(() => {});
  sound.current = { clickOn, guideOn };
  draftRef.current = draft;
  const chosenPair = changes.find((c) => c.id === pair) ?? changes[0];
  const base =
    loop === "foundations"
      ? ["C", "Am", "Em", "E"]
      : loop === "song"
        ? ["G", "D", "Em", "C"]
        : [chosenPair.from, chosenPair.to];
  const sequence = rotateLoop(base, startAt),
    position = jamSlot(slot, sequence.length, bars, pattern),
    currentIndex = running ? position.chordIndex : 0,
    current = sequence[currentIndex],
    next = sequence[(currentIndex + 1) % sequence.length];
  const targetPair = pairFor(current, next),
    totalSeconds = draft.seconds + liveSeconds;
  const today = progress.sessions
    .filter((s) => s.date === dayKey())
    .reduce((n, s) => n + s.seconds, 0);
  const remember = (value: Draft) => {
    draftRef.current = value;
    setDraft(value);
    try {
      localStorage.setItem(draftKey, JSON.stringify(value));
    } catch {
      /* The visible storage notice comes from useStored. */
    }
  };
  const stop = (update = true) => {
    startToken.current++;
    const active = engine.current;
    if (!active) {
      if (update) setStarting(false);
      return;
    }
    engine.current = null;
    clearInterval(active.interval);
    cancelAnimationFrame(active.raf);
    active.gain.gain.setValueAtTime(0, active.audio.currentTime);
    active.voices.forEach((voice) => {
      try {
        voice.stop();
      } catch {
        /* Already ended. */
      }
    });
    active.voices.clear();
    active.gain.disconnect();
    const seconds = jamClock(
      active.audio.currentTime - active.start,
      active.bpm,
      active.sequence.length,
      active.bars,
      active.pattern,
    ).playedSeconds;
    const value = {
      ...draftRef.current,
      seconds: Math.min(86400, draftRef.current.seconds + seconds),
    };
    draftRef.current = value;
    try {
      localStorage.setItem(draftKey, JSON.stringify(value));
    } catch {
      /* Preserved in memory while this workspace stays open. */
    }
    if (update) {
      setDraft(value);
      setRunning(false);
      setStarting(false);
      setLiveSeconds(0);
      setNotice(
        seconds
          ? "Take a breath. Assess this practice, then save it below."
          : "Stopped. The four-beat count-in is not logged as playing time.",
      );
    }
  };
  stopRef.current = stop;
  useEffect(() => {
    const hide = () => {
      if (document.hidden) stopRef.current();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      stopRef.current(false);
    };
  }, []);
  useEffect(() => {
    if (suspended) stopRef.current();
  }, [suspended]);
  const start = async () => {
    if (engine.current || starting || suspended) return;
    const token = ++startToken.current;
    setStarting(true);
    setNotice("");
    try {
      const audio = getAudio();
      await audio.resume();
      if (token !== startToken.current) return;
      const gain = audio.createGain();
      gain.gain.value = 0.8;
      gain.connect(audio.destination);
      const active: Engine = {
        audio,
        start: audio.currentTime + 0.12,
        nextSlot: 0,
        interval: 0 as unknown as ReturnType<typeof setInterval>,
        raf: 0,
        gain,
        voices: new Set(),
        bpm,
        sequence: [...sequence],
        bars,
        pattern,
      };
      engine.current = active;
      const note = (
        frequency: number,
        time: number,
        duration: number,
        volume: number,
        type: OscillatorType = "triangle",
      ) => {
        const oscillator = audio.createOscillator(),
          envelope = audio.createGain();
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        envelope.gain.setValueAtTime(0, time);
        envelope.gain.linearRampToValueAtTime(volume, time + 0.006);
        envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
        oscillator.connect(envelope);
        envelope.connect(gain);
        active.voices.add(oscillator);
        oscillator.onended = () => {
          active.voices.delete(oscillator);
          oscillator.disconnect();
          envelope.disconnect();
        };
        oscillator.start(time);
        oscillator.stop(time + duration + 0.01);
      };
      const schedule = () => {
        if (engine.current !== active) return;
        const halfBeat = 30 / active.bpm,
          now = audio.currentTime;
        // Never replay missed notes in a burst after the browser stalls.
        if (active.start + active.nextSlot * halfBeat < now - 0.1)
          active.nextSlot = Math.max(
            active.nextSlot,
            Math.ceil((now - active.start) / halfBeat),
          );
        while (active.start + active.nextSlot * halfBeat < now + 0.12) {
          const event = jamSlot(
              active.nextSlot,
              active.sequence.length,
              active.bars,
              active.pattern,
            ),
            time = active.start + active.nextSlot * halfBeat;
          if (event.half === 0 && sound.current.clickOn)
            note(event.beat === 0 ? 1050 : 740, time, 0.045, 0.12, "sine");
          if (!event.countIn && event.strum !== "·" && sound.current.guideOn) {
            const chord = workshopChord(active.sequence[event.chordIndex]);
            let notes = chord.frets.flatMap((f, i) =>
              f < 0 ? [] : [openMidi[i] + f],
            );
            if (event.strum === "U") notes = notes.reverse();
            notes.forEach((midi, i) =>
              note(440 * 2 ** ((midi - 69) / 12), time + i * 0.012, 0.8, 0.045),
            );
          }
          active.nextSlot++;
        }
      };
      schedule();
      active.interval = setInterval(schedule, 25);
      const paint = () => {
        if (engine.current !== active) return;
        const elapsed = Math.max(0, audio.currentTime - active.start);
        setSlot(Math.floor(elapsed / (30 / active.bpm)));
        setLiveSeconds(
          jamClock(
            elapsed,
            active.bpm,
            active.sequence.length,
            active.bars,
            active.pattern,
          ).playedSeconds,
        );
        active.raf = requestAnimationFrame(paint);
      };
      active.raf = requestAnimationFrame(paint);
      setSlot(0);
      setLiveSeconds(0);
      setRunning(true);
      setStarting(false);
    } catch {
      setStarting(false);
      setNotice(
        "Audio could not start. Check your browser sound settings and try again.",
      );
    }
  };
  const focus = (id: string) => {
    stop();
    onChange(id);
  };
  const chooseLoop = (value: string) => {
    setLoop(value);
    setStartAt(0);
    setSlot(0);
  };
  const save = () => {
    if (running || draft.seconds < 1) return;
    onSaveSession({
      id: crypto.randomUUID(),
      date: dayKey(),
      seconds: draft.seconds,
      lesson: 7,
      feeling: `Jam room · ${draft.feeling}`,
    });
    remember({ ...draft, seconds: 0 });
    setNotice("Practice saved. Your time is in My progress.");
  };
  return (
    <div className="jam-workspace">
      <header className="jam-heading">
        <div>
          <span className="jam-eyebrow">PRACTISE WITH A PULSE</span>
          <h1>
            Jam room<span>.</span>
          </h1>
        </div>
        <div className="jam-session-clock">
          <b>{clock(totalSeconds)}</b>
          <span>playing time · {Math.floor(today / 60)} min saved today</span>
        </div>
      </header>
      <section className="jam-controls" aria-label="Play-along settings">
        <label className="jam-loop-label">
          Loop
          <select
            aria-label="Jam loop"
            disabled={running || starting}
            value={loop}
            onChange={(e) => chooseLoop(e.target.value)}
          >
            <option value="foundations">C → Am → Em → E</option>
            <option value="song">G → D → Em → C</option>
            <option value="pair">Work on one change</option>
          </select>
        </label>
        {loop === "pair" && (
          <label>
            Change
            <select
              aria-label="Jam change"
              disabled={running || starting}
              value={pair}
              onChange={(e) => {
                setPair(e.target.value);
                setStartAt(0);
              }}
            >
              {changes.map((c) => (
                <option key={c.id} value={c.id}>
                  {chordLabel(c.from)} ↔ {chordLabel(c.to)}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Tempo
          <select
            aria-label="Jam tempo"
            disabled={running || starting}
            value={bpm}
            onChange={(e) => setBpm(+e.target.value)}
          >
            {[40, 45, 50, 55, 60, 65, 70, 75, 80, 90, 100, 110, 120].map(
              (n) => (
                <option key={n} value={n}>
                  {n} BPM
                </option>
              ),
            )}
          </select>
        </label>
        <label>
          Stay on each chord
          <select
            aria-label="Bars per chord"
            disabled={running || starting}
            value={bars}
            onChange={(e) => setBars(+e.target.value)}
          >
            {[1, 2, 4].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "bar" : "bars"}
              </option>
            ))}
          </select>
        </label>
        <label>
          Strum
          <select
            aria-label="Jam strum"
            disabled={running || starting}
            value={pattern}
            onChange={(e) => setPattern(e.target.value as JamPattern)}
          >
            <option value="down">Four downstrokes</option>
            <option value="folk">Folk · D D U U D U</option>
          </select>
        </label>
        <button
          className={"jam-start " + (running ? "is-playing" : "")}
          disabled={starting || suspended}
          onClick={() => (running ? stop() : void start())}
        >
          {running ? <Pause size={19} /> : <Play size={19} />}{" "}
          {starting ? "Preparing…" : running ? "Stop" : "Start with 4-count"}
        </button>
      </section>
      <div className="jam-audio">
        <label>
          <input
            type="checkbox"
            checked={clickOn}
            onChange={(e) => setClickOn(e.target.checked)}
          />{" "}
          Beat click
        </label>
        <label>
          <input
            type="checkbox"
            checked={guideOn}
            onChange={(e) => setGuideOn(e.target.checked)}
          />{" "}
          Chord reference sound
        </label>
        <span>
          <Volume2 size={13} />
          Synthesized reference · listen, then play along
        </span>
      </div>
      <section
        className={
          "jam-stage " + (running && position.countIn ? "jam-counting" : "")
        }
        aria-label="Current chord and rhythm"
      >
        <div className="jam-now">
          <span>
            {running && position.countIn
              ? "COUNT IN"
              : running
                ? "PLAY NOW"
                : "START WITH"}
          </span>
          <strong>
            {running && position.countIn ? position.count : chordLabel(current)}
          </strong>
          <p>
            {running && position.countIn
              ? "Get your first chord ready. Play after four."
              : running
                ? `Bar ${position.bar + 1} of ${bars} · round ${position.round}`
                : "Choose a comfortable tempo. Keep counting through the change."}
          </p>
        </div>
        <div className="jam-pulse">
          <div className="jam-beats">
            {[0, 1, 2, 3].map((i) => (
              <div
                className={running && position.beat === i ? "active" : ""}
                key={i}
              >
                <b>{i + 1}</b>
                <span>
                  {running && position.beat === i && position.half === 1
                    ? "&"
                    : "·"}
                </span>
              </div>
            ))}
          </div>
          <div
            className="jam-strokes"
            aria-label={
              pattern === "down"
                ? "Down on beats 1 2 3 4"
                : "Down silent down up silent up down up"
            }
          >
            {jamPatterns[pattern].map((stroke, i) => (
              <span
                className={
                  running &&
                  !position.countIn &&
                  position.beat * 2 + position.half === i
                    ? "active"
                    : ""
                }
                key={i}
              >
                {stroke === "D" ? "↓" : stroke === "U" ? "↑" : "·"}
              </span>
            ))}
          </div>
          <small>
            Count 1 & 2 & 3 & 4 &. Keep your hand moving through silent slots.
          </small>
        </div>
        <div className="jam-next">
          <span>
            {running && position.countIn ? "FIRST CHORD" : "GET READY FOR"}
          </span>
          <strong>
            {chordLabel(running && position.countIn ? current : next)}
          </strong>
          {targetPair ? (
            <button onClick={() => focus(targetPair.id)}>
              Work on {chordLabel(current)} ↔ {chordLabel(next)}{" "}
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => {
                stop();
                onReference();
              }}
            >
              Review these shapes <BookOpen size={14} />
            </button>
          )}
        </div>
      </section>
      <section className="jam-arrangement" aria-label="Your chord arrangement">
        <div className="jam-arrangement-head">
          <b>The whole loop, in front of you.</b>
          <span>
            {running
              ? "Look one chord ahead."
              : "Choose a starting chord, then press Start."}
          </span>
        </div>
        <div
          className={
            "jam-chord-cards " + (sequence.length === 2 ? "jam-pair-cards" : "")
          }
        >
          {sequence.map((name, i) => {
            const after = sequence[(i + 1) % sequence.length],
              problem = pairFor(name, after);
            return (
              <article
                className={i === currentIndex ? "current" : ""}
                key={`${name}-${i}`}
              >
                <button
                  className="jam-measure-select"
                  disabled={running || starting}
                  aria-label={`Start loop on ${chordLabel(name)}`}
                  onClick={() => {
                    setStartAt((startAt + i) % base.length);
                    setSlot(0);
                  }}
                >
                  <span>
                    {i === currentIndex ? "● " : ""}Bars {i * bars + 1}–
                    {(i + 1) * bars}
                  </span>
                  <b>{chordLabel(name)}</b>
                </button>
                <div className="jam-chord-picture">
                  <ChordDiagram
                    chord={workshopChord(name)}
                    active={i === currentIndex}
                  />
                </div>
                <p>{workshopChord(name).tip.split(".")[0]}.</p>
                {problem ? (
                  <button
                    className="jam-problem"
                    onClick={() => focus(problem.id)}
                  >
                    Fix {chordLabel(name)} → {chordLabel(after)}{" "}
                    <ArrowRight size={13} />
                  </button>
                ) : (
                  <span className="jam-no-pair">
                    Then return to {chordLabel(after)}
                  </span>
                )}
              </article>
            );
          })}
        </div>
      </section>
      <footer className="jam-save">
        <div>
          <h2>Count the time you actually played.</h2>
          <p>
            Stop when you need a reset. Start again with a fresh count-in; your
            playing time adds up. Judge the sound yourself.
          </p>
          {notice && (
            <p className="jam-notice" role="status">
              {notice}
            </p>
          )}
        </div>
        <div className="jam-assessment">
          <label>
            How did it feel?
            <select
              aria-label="Jam self assessment"
              disabled={running}
              value={draft.feeling}
              onChange={(e) => remember({ ...draft, feeling: e.target.value })}
            >
              {feelings.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
          <button onClick={save} disabled={running || draft.seconds < 1}>
            <Check size={16} />
            Save {clock(draft.seconds)} of practice
          </button>
          <button
            className="jam-clear"
            disabled={running || !draft.seconds}
            onClick={() => {
              remember({ ...draft, seconds: 0 });
              setNotice("Unlogged practice time reset.");
            }}
          >
            <RotateCcw size={12} />
            Reset unlogged time
          </button>
        </div>
      </footer>
      {storageError && (
        <p className="jam-notice" role="alert">
          This browser could not save your practice draft. Save the session
          before closing.
        </p>
      )}
    </div>
  );
}
