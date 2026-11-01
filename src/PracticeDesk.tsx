import { useEffect, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { BasicsVisual } from "./BasicsVisual";
import { recordFoundationRating } from "./foundations/foundationsPlan";
import { ChangeDemo } from "./ChangeDemo";
import { LessonDemo } from "./TechniqueDemo";
import { buildChangeImage } from "./changeAtlasSvg";
import { CHANGE_FPS, changeDurationFrames } from "./changeTiming";
import { changes, chordLabel, getChange, workshopChord } from "./lesson7";
import { getChord, patterns, openMidi, type Chord } from "./course";
import { barreChord } from "./barre";
import { ChordDiagram } from "./visuals";
import { click, getAudio, tone } from "./sound";
import { dayKey, type Progress, useStored } from "./state";
import {
  deskSkills,
  deskUnit,
  deskUnits,
  type DeskSkill,
  type DeskUnit,
} from "./deskCurriculum";
import {
  makeDeskDraft,
  validDeskDraft,
  pendingPractice,
  rollDeskDay,
  addDeskSeconds,
  clearDeskBatch,
  type DeskDraft,
} from "./deskPractice";
import "./practice-desk.css";

export type PracticeDeskProps = {
  progress: Progress;
  setProgress: (value: Progress | ((p: Progress) => Progress)) => void;
  onReference: () => void;
  onGuide: (lesson: number, focus?: string) => void;
  onTool: (tool: "tuning" | "rhythm" | "fretboard" | "chords") => void;
  onJam: () => void;
  initialChange?: string;
  suspended?: boolean;
};
type Stage = "learn" | "repeat" | "connect";
type Rating = "needs" | "growing" | "comfortable";
const freshDraft = () => makeDeskDraft(dayKey());
const ratingKey = (unit: string, rating: Rating) =>
  `desk-rating-${unit}-${rating}`;
const ratings: { id: Rating; label: string }[] = [
  { id: "needs", label: "Needs work" },
  { id: "growing", label: "Getting there" },
  { id: "comfortable", label: "Comfortable" },
];
const ratingOf = (p: Progress, id: string) =>
  ratings.find((r) => p.checks[ratingKey(id, r.id)])?.id;
const clock = (n: number) =>
  `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}`;
const hear = (chord: Chord) => {
  const a = getAudio();
  chord.frets.forEach((f, i) => {
    if (f >= 0) tone(openMidi[i] + f, a.currentTime + i * 0.022, 1.3, 0.06);
  });
};
function unitChord(unit: DeskUnit, name: string): Chord {
  if (unit.id === "prepare-E")
    return { ...getChord("E"), fingers: [0, 3, 4, 2, 0, 0] };
  if (unit.id === "A-family") return barreChord("A", "major", 3);
  return workshopChord(name);
}

export function PracticeDesk({
  progress,
  setProgress,
  onReference,
  onGuide,
  onTool,
  onJam,
  initialChange,
  suspended = false,
}: PracticeDeskProps) {
  const [saved, setSaved] = useStored<DeskDraft>(
    "six-strings-desk-v1",
    freshDraft(),
    validDeskDraft,
  );
  const draft = rollDeskDay(saved, dayKey());
  const unit = deskUnit(draft.unit),
    skill = unit.skill,
    stage = draft.stage;
  const [running, setRunning] = useState(false),
    [animated, setAnimated] = useState(false),
    [direction, setDirection] = useState<"forward" | "back">("forward"),
    [tempo, setTempo] = useState(50),
    [pulse, setPulse] = useState(false),
    [savedMessage, setSavedMessage] = useState("");
  const player = useRef<PlayerRef>(null),
    saveLock = useRef(false),
    panel = useRef<HTMLDivElement>(null),
    instructions = useRef<HTMLElement>(null);
  const currentChange = unit.change ? getChange(unit.change) : null;
  const selectedRating = ratingOf(progress, unit.id);
  const available = deskUnits.filter((u) => u.skill === skill);
  const currentIndex = available.findIndex((u) => u.id === unit.id);
  const nextSetup = available[currentIndex + 1]?.id ?? "clear-Em";
  const pending = Math.max(0, draft.seconds - draft.logged);
  useEffect(() => {
    if (saved.date !== dayKey()) {
      setRunning(false);
      setSaved((d) => rollDeskDay(d, dayKey()));
    }
  }, [saved.date, setSaved]);
  useEffect(() => {
    if (!initialChange || !deskUnits.some((u) => u.id === initialChange))
      return;
    setRunning(false);
    setAnimated(false);
    setDirection("forward");
    setSavedMessage("");
    setSaved((d) =>
      d.unit === initialChange
        ? d
        : {
            ...d,
            unit: initialChange,
            stage: "learn",
            reps: 0,
            unitSeconds: 0,
          },
    );
  }, [initialChange, setSaved]);
  useEffect(() => {
    if (suspended) {
      setRunning(false);
      player.current?.pause();
    }
  }, [suspended]);
  useEffect(() => {
    if (!running || suspended) return;
    let last = performance.now();
    const startedDay = dayKey();
    const timer = setInterval(() => {
      if (startedDay !== dayKey()) {
        setRunning(false);
        setSaved((d) => rollDeskDay(d, dayKey()));
        return;
      }
      const now = performance.now(),
        seconds = Math.floor((now - last) / 1000);
      if (seconds > 0) {
        last += seconds * 1000;
        setSaved((d) => addDeskSeconds(d, seconds, dayKey()));
      }
    }, 200);
    const pause = () => {
      if (document.hidden) {
        setRunning(false);
        player.current?.pause();
      }
    };
    document.addEventListener("visibilitychange", pause);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", pause);
    };
  }, [running, suspended, setSaved]);
  useEffect(() => {
    if (!running || !pulse || suspended) return;
    const a = getAudio();
    let time = a.currentTime + 0.06,
      n = 0;
    const scheduler = () => {
      while (time < a.currentTime + 0.1) {
        click(time, n % 4 === 0);
        time += 60 / tempo;
        n++;
      }
    };
    scheduler();
    const id = setInterval(scheduler, 25);
    return () => clearInterval(id);
  }, [running, pulse, tempo, suspended]);
  useEffect(() => {
    saveLock.current = false;
  }, [draft.seconds]);
  const pause = () => {
    setRunning(false);
    player.current?.pause();
  };
  const choose = (id: string) => {
    pause();
    setAnimated(false);
    setDirection("forward");
    setSavedMessage("");
    setSaved((d) => ({
      ...d,
      unit: id,
      stage: "learn",
      unitSeconds: 0,
      reps: 0,
    }));
    const url = new URL(window.location.href);
    url.hash = `/desk?change=${encodeURIComponent(id)}`;
    history.replaceState(null, "", url);
    panel.current?.scrollTo({ top: 0 });
    instructions.current?.scrollTo({ top: 0 });
  };
  const chooseSkill = (id: DeskSkill) => {
    const units = deskUnits.filter((u) => u.skill === id);
    const next =
      units.find((u) => ratingOf(progress, u.id) === "needs") ??
      units.find((u) => ratingOf(progress, u.id) !== "comfortable") ??
      units[0];
    choose(next.id);
  };
  const setStage = (next: Stage) => {
    pause();
    setAnimated(false);
    setSaved((d) => ({ ...d, stage: next }));
    panel.current?.scrollTo({ top: 0 });
  };
  const rate = (rating: Rating) =>
    setProgress((p) => recordFoundationRating(p, unit.id, rating, dayKey()));
  const saveSession = () => {
    if (pending < 1 || saveLock.current) return;
    saveLock.current = true;
    pause();
    const seconds = Math.floor(pending);
    const segments = pendingPractice(draft);
    setProgress((p) => ({
      ...p,
      sessions: [
        ...p.sessions,
        ...segments.map((s) => {
          const task = deskUnit(s.unit);
          return {
            id: crypto.randomUUID(),
            date: s.date,
            seconds: s.seconds,
            lesson: task.lesson,
            feeling: `Practice desk · ${task.title}`,
          };
        }),
      ],
    }));
    setSaved(clearDeskBatch);
    setSavedMessage(`${clock(seconds)} saved to your practice history.`);
  };
  const imageChange =
    currentChange && direction === "back"
      ? {
          ...currentChange,
          from: currentChange.to,
          to: currentChange.from,
          groups: currentChange.reverseGroups ?? currentChange.groups,
          reverseGroups: currentChange.groups,
        }
      : currentChange;
  const staticImage = imageChange
    ? "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(
        buildChangeImage(
          imageChange,
          changes.findIndex((c) => c.id === imageChange.id),
          false,
        ),
      )
    : null;
  const displaySteps = currentChange
    ? direction === "forward"
      ? currentChange.steps
      : currentChange.back
    : unit.steps;
  const directionLabel = currentChange
    ? `${chordLabel(direction === "forward" ? currentChange.from : currentChange.to)} → ${chordLabel(direction === "forward" ? currentChange.to : currentChange.from)}`
    : unit.title;
  return (
    <section className="desk-workspace" aria-label="Guitar practice workspace">
      <aside className="desk-library">
        <div className="desk-library-title">
          <b>Your practice desk</b>
          <span>Choose one physical skill.</span>
        </div>
        <div className="desk-skill-switcher" aria-label="Practice skills">
          {deskSkills.map((s) => (
            <button
              key={s.id}
              className={skill === s.id ? "active" : ""}
              aria-pressed={skill === s.id}
              onClick={() => chooseSkill(s.id)}
            >
              {s.title}
              <span>{deskUnits.filter((u) => u.skill === s.id).length}</span>
            </button>
          ))}
        </div>
        <div
          className="desk-unit-list"
          aria-label={`${deskSkills.find((s) => s.id === skill)?.title} exercises`}
        >
          {available.map((u, i) => (
            <button
              key={u.id}
              className={unit.id === u.id ? "active" : ""}
              aria-current={unit.id === u.id ? "true" : undefined}
              onClick={() => choose(u.id)}
            >
              <span
                className={`desk-rating-dot ${ratingOf(progress, u.id) ?? ""}`}
              />
              <div>
                <b>{u.title}</b>
                <small>
                  {ratingOf(progress, u.id)
                    ? ratings.find((r) => r.id === ratingOf(progress, u.id))
                        ?.label
                    : `Exercise ${i + 1}`}
                </small>
              </div>
              {unit.id === u.id ? <ArrowRight size={13} /> : null}
            </button>
          ))}
        </div>
        <button
          className="desk-library-reference"
          onClick={() => {
            pause();
            onReference();
          }}
        >
          All changes in one view
          <ArrowRight size={15} />
        </button>
      </aside>
      <div className="desk-main" ref={panel}>
        <header className="desk-task-heading">
          <div>
            <span>
              {deskSkills.find((s) => s.id === skill)?.title} ·{" "}
              {currentIndex + 1} of {available.length}
            </span>
            <h1>{unit.title}</h1>
          </div>
          <button
            className="desk-subtle"
            onClick={() => {
              pause();
              onTool("tuning");
            }}
          >
            Check tuning <ExternalLink size={13} />
          </button>
        </header>
        <div className="desk-stages" role="tablist" aria-label="Practice stage">
          {(
            [
              { id: "learn", label: "Learn", hint: "See the whole movement" },
              { id: "repeat", label: "Repeat", hint: "Build a reliable habit" },
              { id: "connect", label: "Connect", hint: "Use it in music" },
            ] as const
          ).map((s, i) => (
            <button
              id={`desk-stage-${s.id}`}
              key={s.id}
              role="tab"
              aria-selected={stage === s.id}
              aria-controls="desk-task"
              tabIndex={stage === s.id ? 0 : -1}
              onClick={() => setStage(s.id)}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                  e.preventDefault();
                  const values: Stage[] = ["learn", "repeat", "connect"],
                    next = values[(i + (e.key === "ArrowRight" ? 1 : 2)) % 3];
                  setStage(next);
                  document.getElementById(`desk-stage-${next}`)?.focus();
                }
              }}
            >
              <span>{i + 1}</span>
              <div>
                <b>{s.label}</b>
                <small>{s.hint}</small>
              </div>
            </button>
          ))}
        </div>
        <div
          className="desk-task"
          id="desk-task"
          role="tabpanel"
          aria-labelledby={`desk-stage-${stage}`}
        >
          <div className="desk-task-cue">
            <span>
              {stage === "learn"
                ? "ONE PHYSICAL TASK"
                : stage === "repeat"
                  ? "YOUR HANDS DO THE LEARNING"
                  : "KEEP THE MUSIC MOVING"}
            </span>
            <p>
              {stage === "learn"
                ? unit.task
                : stage === "repeat"
                  ? currentChange
                    ? "Move to the target, check the sound, then return. Count one change only after checking the destination."
                    : unit.skill === "setup"
                      ? "Repeat the physical task, check it against the instructions, then relax. Notice whether you can do it again without looking."
                      : "Repeat the task, check the result, then relax. Count a repetition only when you have listened to it."
                  : currentChange
                    ? `Give ${chordLabel(currentChange.from)} four downstrokes, change to ${chordLabel(currentChange.to)} for four more. Keep counting; slow down if the change creates a gap.`
                    : unit.skill === "setup"
                      ? "Carry this skill into the next foundation. Keep your comfortable hold and check each new sound before adding more fingers."
                      : "Keep a steady count and use this skill in a short musical phrase. Make the next beat 1 your destination."}
            </p>
          </div>
          {stage === "connect" && unit.skill === "setup" ? (
            <div className="desk-connect">
              <BasicsVisual key={unit.id} unitId={unit.id} onTool={onTool} />
              <h2>Take this into your next exercise.</h2>
              <p>{unit.check}</p>
              <button
                className="desk-main-button"
                onClick={() => choose(nextSetup)}
              >
                Continue to {deskUnit(nextSetup).title.toLowerCase()}{" "}
                <ArrowRight size={16} />
              </button>
            </div>
          ) : stage === "connect" ? (
            <div className="desk-connect">
              <div className="desk-connect-route">
                {(currentChange
                  ? [currentChange.from, currentChange.to]
                  : unit.chords
                ).map((c, i) => (
                  <div key={c + i}>
                    <b>{chordLabel(c)}</b>
                    <ChordDiagram chord={unitChord(unit, c)} />
                    <span>1 · 2 · 3 · 4</span>
                  </div>
                ))}
              </div>
              <h2>One steady round is enough.</h2>
              <p>
                Begin with plain downstrokes. Give yourself two bars per chord
                if you need more preparation time. Add a busier strum only after
                the changes stop interrupting the pulse.
              </p>
              <button
                className="desk-main-button"
                onClick={() => {
                  pause();
                  onJam();
                }}
              >
                <Play size={16} />
                Open the play-along room
              </button>
              <p className="desk-micro">
                Your exact finger routes remain in the reference view while you
                build fluency.
              </p>
            </div>
          ) : (
            <>
              <div className="desk-visual">
                {unit.skill === "setup" ? (
                  <BasicsVisual
                    key={unit.id}
                    unitId={unit.id}
                    onTool={onTool}
                  />
                ) : animated ? (
                  currentChange ? (
                    <Player
                      ref={player}
                      key={`${unit.id}-${direction}`}
                      component={ChangeDemo}
                      inputProps={{ changeId: unit.id, direction }}
                      durationInFrames={changeDurationFrames(direction)}
                      fps={CHANGE_FPS}
                      compositionWidth={1200}
                      compositionHeight={850}
                      controls
                      autoPlay={!suspended}
                      loop={false}
                      style={{ width: "100%", maxHeight: "100%" }}
                      showVolumeControls={false}
                    />
                  ) : (
                    <Player
                      ref={player}
                      key={unit.id}
                      component={LessonDemo}
                      inputProps={{
                        mode: unit.demo ?? "chord",
                        chordName: unit.chords[0],
                        pattern: unit.pattern ?? 1,
                      }}
                      durationInFrames={360}
                      fps={CHANGE_FPS}
                      compositionWidth={1200}
                      compositionHeight={760}
                      controls
                      autoPlay={!suspended}
                      loop={false}
                      style={{ width: "100%", maxHeight: "100%" }}
                      showVolumeControls={false}
                    />
                  )
                ) : staticImage ? (
                  <img
                    src={staticImage}
                    alt={`${directionLabel}: start shape, finger movements, and complete target shape. Green fingers stay fixed; blue fingers guide with light contact.`}
                  />
                ) : unit.skill === "rhythm" && unit.pattern !== undefined ? (
                  <div className="desk-rhythm-visual">
                    <div className="desk-single-chord">
                      <ChordDiagram chord={unitChord(unit, unit.chords[0])} />
                      <b>{unit.chords[0]}</b>
                    </div>
                    <div className="desk-eight-count">
                      {patterns[unit.pattern].slots.map((s, i) => (
                        <div key={i}>
                          <small>
                            {["1", "&", "2", "&", "3", "&", "4", "&"][i]}
                          </small>
                          <b>
                            {s === "D"
                              ? "↓"
                              : s === "U"
                                ? "↑"
                                : s === "M"
                                  ? "×"
                                  : "·"}
                          </b>
                        </div>
                      ))}
                    </div>
                    <p>
                      Hand keeps moving through every slot. A dot means a silent
                      motion.
                    </p>
                  </div>
                ) : unit.id === "small-fill" ? (
                  <div className="desk-fill-visual">
                    <div className="desk-fill-notes">
                      {[
                        { note: "E", fret: 0, finger: "Open" },
                        { note: "F", fret: 1, finger: "Index 1" },
                        { note: "G", fret: 3, finger: "Ring 3" },
                      ].map((n) => (
                        <button
                          key={n.note}
                          onClick={() => tone(openMidi[5] + n.fret)}
                        >
                          <b>{n.note}</b>
                          <span>
                            High e · {n.fret === 0 ? "open" : `fret ${n.fret}`}
                          </span>
                          <small>{n.finger}</small>
                        </button>
                      ))}
                    </div>
                    <p>Play on 3 · & of 3 · 4. Return to C on the next 1.</p>
                  </div>
                ) : (
                  <div className="desk-shape-visual">
                    {unit.chords.map((c) => (
                      <div key={c}>
                        <b>{unit.id === "A-family" ? "C · A shape" : c}</b>
                        <ChordDiagram chord={unitChord(unit, c)} interactive />
                        <span>{unitChord(unit, c).tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="desk-visual-toolbar">
                <div>
                  {currentChange ? (
                    <>
                      <button
                        className={direction === "forward" ? "active" : ""}
                        onClick={() => {
                          setAnimated(false);
                          setDirection("forward");
                        }}
                      >
                        {chordLabel(currentChange.from)} →{" "}
                        {chordLabel(currentChange.to)}
                      </button>
                      <button
                        className={direction === "back" ? "active" : ""}
                        onClick={() => {
                          setAnimated(false);
                          setDirection("back");
                        }}
                      >
                        {chordLabel(currentChange.to)} →{" "}
                        {chordLabel(currentChange.from)}
                      </button>
                    </>
                  ) : (
                    <span>Low E on the left · high e on the right</span>
                  )}
                </div>
                <div>
                  {unit.skill !== "setup" && (
                    <button onClick={() => setAnimated((v) => !v)}>
                      <Play size={13} />
                      {animated
                        ? "Show complete image"
                        : currentChange
                          ? "Watch 3-second movement"
                          : "Watch technique"}
                    </button>
                  )}
                  {unit.chords.map((c) => (
                    <button
                      key={c}
                      aria-label={`Hear ${chordLabel(c)}`}
                      onClick={() => hear(unitChord(unit, c))}
                    >
                      <Volume2 size={13} />
                      {chordLabel(c)}
                    </button>
                  ))}
                </div>
              </div>
              {stage === "repeat" ? (
                <div className="desk-repetition">
                  <div>
                    <span>Clean changes / repetitions</span>
                    <b>{draft.reps}</b>
                    <small>{clock(draft.unitSeconds)} on this exercise</small>
                  </div>
                  <button
                    className="desk-count-button"
                    onClick={() =>
                      setSaved((d) => ({ ...d, reps: d.reps + 1 }))
                    }
                  >
                    <Plus size={18} />
                    Count one clean repetition
                  </button>
                  <button
                    className="desk-reset-count"
                    title="Reset this exercise counter"
                    aria-label="Reset repetition counter"
                    onClick={() =>
                      setSaved((d) => ({ ...d, reps: 0, unitSeconds: 0 }))
                    }
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              ) : null}
              <div className="desk-physical-check">
                <Check size={16} />
                <div>
                  <b>Listen for this</b>
                  <p>{unit.check}</p>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="desk-self-rating">
          <div>
            <b>How does it feel on your guitar?</b>
            <small>
              Your judgement guides the next practice. No automatic grading.
            </small>
          </div>
          <div>
            {ratings.map((r) => (
              <button
                key={r.id}
                className={selectedRating === r.id ? "active " + r.id : r.id}
                aria-pressed={selectedRating === r.id}
                onClick={() => rate(r.id)}
              >
                {selectedRating === r.id ? <Check size={13} /> : null}
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <aside className="desk-instructions" ref={instructions}>
        <div className="desk-instructions-heading">
          <b>Your hand instructions</b>
          <span>{directionLabel}</span>
        </div>
        {currentChange ? (
          <>
            <section className="desk-anchor-rule">
              <h3>Keep / use as a guide</h3>
              <p>{currentChange.stay}</p>
            </section>
            <section className="desk-release-rule">
              <h3>
                {direction === "forward"
                  ? "Pressure comes off"
                  : "Return route"}
              </h3>
              <p>
                {direction === "forward"
                  ? currentChange.release
                  : "Use the return instructions below. Release moving fingers before travelling; keep any guide contact light."}
              </p>
            </section>
          </>
        ) : null}
        <section className="desk-hand-steps">
          <h3>
            {currentChange
              ? direction === "forward"
                ? "Forward movement"
                : "Return movement"
              : "Do this with your hands"}
          </h3>
          <ol>
            {displaySteps.map((text, i) => (
              <li key={text}>
                <span>{i + 1}</span>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>
        <details className="desk-avoid">
          <summary>
            One mistake to watch for
            <ChevronDown size={13} />
          </summary>
          <p>{unit.trap}</p>
        </details>
        {currentChange ? (
          <details className="desk-full-route">
            <summary>
              Keep both complete routes
              <ChevronDown size={13} />
            </summary>
            <h4>
              {chordLabel(currentChange.from)} → {chordLabel(currentChange.to)}
            </h4>
            <ol>
              {currentChange.steps.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ol>
            <h4>
              {chordLabel(currentChange.to)} → {chordLabel(currentChange.from)}
            </h4>
            <ol>
              {currentChange.back.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ol>
          </details>
        ) : null}
        <div className="desk-scratchpad">
          <label htmlFor="desk-note">Remember for next time</label>
          <textarea
            id="desk-note"
            value={progress.notes[`desk-${unit.id}`] ?? ""}
            placeholder="Which finger or string needs another try?"
            onChange={(e) => {
              const text = e.target.value;
              setProgress((p) => ({
                ...p,
                notes: { ...p.notes, [`desk-${unit.id}`]: text },
              }));
            }}
          />
        </div>
        <button
          className="desk-guide-link"
          onClick={() => {
            pause();
            onGuide(unit.lesson, unit.change ?? unit.focus);
          }}
        >
          Full explanation & source
          <ExternalLink size={13} />
        </button>
      </aside>
      <footer className="desk-controls">
        <div className="desk-session-controls">
          <button
            className="desk-main-button"
            disabled={suspended}
            onClick={() => {
              if (pulse) getAudio();
              setRunning((v) => !v);
              setSavedMessage("");
            }}
          >
            {running ? <Pause size={15} /> : <Play size={15} />}{" "}
            {running ? "Pause practice" : "Practise now"}
          </button>
          <div className="desk-session-time">
            <b>{clock(pending)}</b>
            <small>unsaved practice</small>
          </div>
          <button
            className="desk-save-button"
            disabled={pending < 1}
            onClick={saveSession}
          >
            {savedMessage ? "Saved" : "Save practice"}
          </button>
        </div>
        <div className="desk-pulse-controls">
          <label>
            <input
              type="checkbox"
              checked={pulse}
              onChange={(e) => {
                if (e.target.checked) getAudio();
                setPulse(e.target.checked);
              }}
            />
            Pulse
          </label>
          <select
            aria-label="Practice desk tempo"
            value={tempo}
            onChange={(e) => setTempo(+e.target.value)}
          >
            {[35, 40, 45, 50, 55, 60, 70, 80].map((n) => (
              <option key={n} value={n}>
                {n} BPM
              </option>
            ))}
          </select>
        </div>
        <div className="desk-progress-controls">
          <button
            className="desk-subtle"
            disabled={currentIndex === 0}
            onClick={() => choose(available[currentIndex - 1].id)}
            aria-label="Previous exercise"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            className="desk-next-button"
            onClick={() =>
              stage === "learn"
                ? setStage("repeat")
                : stage === "repeat"
                  ? setStage("connect")
                  : currentIndex < available.length - 1
                    ? choose(available[currentIndex + 1].id)
                    : unit.skill === "setup"
                      ? choose("clear-Em")
                      : onJam()
            }
          >
            {stage === "learn"
              ? "Try it yourself"
              : stage === "repeat"
                ? unit.skill === "setup"
                  ? "Carry it forward"
                  : "Use it in music"
                : currentIndex < available.length - 1
                  ? "Next exercise"
                  : unit.skill === "setup"
                    ? "Make your first chord"
                    : "Play a progression"}
            <ArrowRight size={15} />
          </button>
        </div>
        <span className="desk-live-message" role="status">
          {savedMessage ||
            "Practice time runs only while this workspace is visible."}
        </span>
      </footer>
    </section>
  );
}
