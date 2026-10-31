import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Guitar,
  Pause,
  Play,
  RotateCcw,
  Timer,
  Volume2,
} from "lucide-react";
import { getChord } from "./course";
import { ChordDiagram } from "./visuals";
import { click, getAudio, playChord } from "./sound";
import { dayKey, Progress, Session, useStored } from "./state";
import {
  practiceStages,
  progressionBeat,
  routinePosition,
  routineSeconds,
  stageStarts,
} from "./practice-flow";
import "./learning-home.css";

export type LearningHomeProps = {
  progress: Progress;
  onLesson: (id: number, chapterTitle?: string) => void;
  onPractice: (tab?: string) => void;
  onChanges: () => void;
  onSaveSession?: (session: Session) => void;
  variant?: "today" | "learn";
};
const clock = (n: number) =>
  `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}`;
const skills = [
  {
    title: "Get a clear sound",
    cue: "One chord, one string at a time.",
    lesson: 3,
    chapter: "Build E, then check every string",
    task: "Build E. Pick each intended string separately, fix the unclear note, then release. Repeat five relaxed placements.",
    target: "Three clear placements in a row.",
    action: "Learn chord placement",
  },
  {
    title: "Change chords smoothly",
    cue: "Keep anchors. Move small groups.",
    lesson: 7,
    chapter: "C-Am",
    task: "Start with C ↔ Am: keep index B1 and middle D2 down. Move ring A3 ↔ G2. Check both shapes before adding a rhythm.",
    target: "Five controlled changes both ways.",
    action: "Open the change workshop",
  },
  {
    title: "Keep a steady rhythm",
    cue: "A steady pulse before a busy pattern.",
    lesson: 4,
    chapter: "Keep four steady beats before adding a pattern",
    task: "Use Em at 50 BPM. Downstroke on 1, 2, 3, 4. Keep counting even if one brush is imperfect. Later add D · D U · U D U.",
    target: "Four steady bars without stopping.",
    action: "Learn the strumming motion",
  },
  {
    title: "Play a full progression",
    cue: "Connect the skills into music.",
    lesson: 7,
    chapter: "C-Am",
    task: "Use the play-along below: C → Am → Em → E. Start with two bars per chord. Look ahead to the next shape and land it on beat 1.",
    target: "One complete round at a comfortable tempo.",
    action: "Review the exact finger routes",
  },
  {
    title: "Add colour when ready",
    cue: "Muting, barre shapes and small fills.",
    lesson: 8,
    chapter: "Replace the downstrokes on 2 and 4",
    task: "Only add one new technique to an already steady rhythm. Try a gentle chuck on beats 2 and 4, keeping the following upstroke in place.",
    target: "A clear rhythm with the new technique.",
    action: "Learn the muted strum",
  },
];

export function LearningHome({
  progress,
  onLesson,
  onPractice,
  onChanges,
  onSaveSession,
  variant = "today",
}: LearningHomeProps) {
  const [skill, setSkill] = useState(0);
  const today = progress.sessions
    .filter((s) => s.date === dayKey())
    .reduce((n, s) => n + s.seconds, 0);
  const active = skills[skill];
  const skillPicker = (
    <section className="learning-skills" aria-label="Choose a guitar skill">
      <div className="learning-section-head">
        <div>
          <span className="section-label">CHOOSE WHAT YOU NEED</span>
          <h2>A skill you can use today.</h2>
        </div>
        <span>Explore freely. There are no locked levels.</span>
      </div>
      <div
        className="learning-skill-tabs"
        role="tablist"
        aria-label="Guitar skills"
        onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
            return;
          event.preventDefault();
          const next =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? skills.length - 1
                : (skill +
                    (event.key === "ArrowRight" ? 1 : -1) +
                    skills.length) %
                  skills.length;
          setSkill(next);
          requestAnimationFrame(() =>
            document.getElementById(`skill-tab-${next}`)?.focus(),
          );
        }}
      >
        {skills.map((s, i) => (
          <button
            key={s.title}
            role="tab"
            id={`skill-tab-${i}`}
            aria-selected={skill === i}
            aria-controls="skill-panel"
            tabIndex={skill === i ? 0 : -1}
            onClick={() => setSkill(i)}
          >
            <span>{i + 1}</span>
            {s.title}
          </button>
        ))}
      </div>
      <div
        className="learning-skill-panel"
        id="skill-panel"
        role="tabpanel"
        aria-labelledby={`skill-tab-${skill}`}
      >
        <div>
          <span className="section-label">YOUR NEXT SMALL EXERCISE</span>
          <h3>{active.cue}</h3>
          <p>{active.task}</p>
          <div className="learning-target">
            <Check size={16} />
            <span>Aim for: {active.target}</span>
          </div>
        </div>
        <div className="learning-skill-actions">
          <button
            className="primary"
            onClick={() => onLesson(active.lesson, active.chapter)}
          >
            {active.action}
            <ArrowRight size={16} />
          </button>
          {skill === 1 || skill === 3 ? (
            <button className="secondary" onClick={onChanges}>
              See all changes together
            </button>
          ) : (
            <button
              className="secondary"
              onClick={() => onPractice(skill === 0 ? "Tuning" : "Rhythm")}
            >
              {skill === 0 ? "Check tuning first" : "Open rhythm tools"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
  return (
    <div className="learning-home">
      <div className="learning-heading">
        <div>
          <span className="eyebrow">
            {variant === "today" ? "PICK UP. PLAY A LITTLE." : "LEARN BY DOING"}
          </span>
          <h1>
            {variant === "today"
              ? "Your guitar. Your next step."
              : "Build skills, then make music."}
          </h1>
          <p>
            {variant === "today"
              ? "Tune up, choose one small thing, and spend more time playing than watching."
              : "Start where your playing needs help. Learn the movement, practise it, then use it in a progression."}
          </p>
        </div>
        <div className="learning-today">
          <Timer size={17} />
          <b>{Math.floor(today / 60)} min</b>
          <span>played today</span>
        </div>
      </div>
      <div className="learning-quick-tools">
        <button onClick={() => onPractice("Tuning")}>
          Tune my guitar
          <ArrowRight size={14} />
        </button>
        <button onClick={onChanges}>
          All chord changes at a glance
          <ArrowRight size={14} />
        </button>
        <button onClick={() => onPractice("Rhythm")}>
          Rhythm & metronome
          <ArrowRight size={14} />
        </button>
      </div>
      {variant === "learn" ? skillPicker : null}
      <GuidedRoutine
        onLesson={onLesson}
        onChanges={onChanges}
        onPractice={onPractice}
        onSaveSession={onSaveSession}
      />
      <ProgressionTrainer onChanges={onChanges} />
      {variant === "today" ? skillPicker : null}
      <section className="learning-extra">
        <div>
          <span className="section-label">GO DEEPER WHEN YOU NEED TO</span>
          <h3>Your reference library is still here.</h3>
          <p>
            The detailed finger routes, full exercises and original source
            material support your practice. Open the explanation for the skill
            you are working on.
          </p>
        </div>
        <div>
          <button
            className="text-button"
            onClick={() => onLesson(9, "Free the index before moving E")}
          >
            Barre chord technique <ArrowRight size={14} />
          </button>
          <button
            className="text-button"
            onClick={() => onLesson(6, "Sharp raises a note by one half step")}
          >
            Understand notes & frets <ArrowRight size={14} />
          </button>
          <button className="text-button" onClick={() => onLesson(10)}>
            Try a small fill <ArrowRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
}

type RoutineDraft = {
  date: string;
  plan: number;
  played: number;
  saved: boolean;
};
function validDraft(x: unknown): x is RoutineDraft {
  if (!x || typeof x !== "object") return false;
  const d = x as RoutineDraft;
  return (
    typeof d.date === "string" &&
    Number.isFinite(d.plan) &&
    d.plan >= 0 &&
    d.plan <= routineSeconds &&
    Number.isFinite(d.played) &&
    d.played >= 0 &&
    d.played <= 86400 &&
    typeof d.saved === "boolean"
  );
}
function GuidedRoutine({
  onLesson,
  onChanges,
  onPractice,
  onSaveSession,
}: Omit<LearningHomeProps, "progress" | "variant">) {
  const fallback: RoutineDraft = {
    date: dayKey(),
    plan: 0,
    played: 0,
    saved: false,
  };
  const [stored, setStored] = useStored(
    "six-strings-practice-routine-v1",
    fallback,
    validDraft,
  );
  const draft = stored.date === dayKey() ? stored : fallback;
  const [running, setRunning] = useState(false),
    [feeling, setFeeling] = useState("A little clearer"),
    [savedNow, setSavedNow] = useState(false);
  const position = routinePosition(draft.plan),
    stage = practiceStages[position.stage];
  useEffect(() => {
    if (stored.date !== dayKey()) {
      setStored(fallback);
      setRunning(false);
    }
  }, [stored.date]);
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const routineDay = dayKey();
    const id = setInterval(() => {
      const now = performance.now(),
        delta = Math.floor((now - last) / 1000);
      if (dayKey() !== routineDay) {
        setRunning(false);
        setStored({ date: dayKey(), plan: 0, played: 0, saved: false });
        return;
      }
      if (delta < 1) return;
      last += delta * 1000;
      setStored((d) => {
        if (d.saved) return d;
        if (d.date !== dayKey())
          return { date: dayKey(), plan: 0, played: 0, saved: false };
        const step = Math.min(delta, routineSeconds - d.plan);
        return {
          ...d,
          plan: d.plan + step,
          played: d.played + step,
          saved: false,
        };
      });
    }, 200);
    const hide = () => {
      if (document.hidden) setRunning(false);
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [running, setStored]);
  useEffect(() => {
    if (position.complete) setRunning(false);
  }, [position.complete]);
  const next = () => {
    setRunning(false);
    setStored((d) => ({
      ...d,
      plan: Math.min(
        routineSeconds,
        stageStarts[position.stage] + stage.seconds,
      ),
    }));
  };
  const save = () => {
    if (!onSaveSession || draft.played < 1 || draft.saved) return;
    onSaveSession({
      id: crypto.randomUUID(),
      date: dayKey(),
      seconds: Math.floor(draft.played),
      lesson: 7,
      feeling: `Guided practice · ${feeling}`,
    });
    setStored((d) => ({ ...d, saved: true }));
    setSavedNow(true);
  };
  return (
    <section className="learning-routine card">
      <div className="learning-section-head">
        <div>
          <span className="section-label">A SIMPLE 10-MINUTE PRACTICE</span>
          <h2>
            {position.complete
              ? "You showed up. That counts."
              : "Know exactly what to play next."}
          </h2>
        </div>
        <button className="text-button" onClick={() => onPractice("Tuning")}>
          Tune first <ArrowRight size={14} />
        </button>
      </div>
      <ol className="learning-routine-stages">
        {practiceStages.map((s, i) => (
          <li
            className={
              position.stage === i
                ? "current"
                : draft.plan >= stageStarts[i] + s.seconds
                  ? "done"
                  : ""
            }
            key={s.title}
          >
            <span>
              {draft.plan >= stageStarts[i] + s.seconds ? (
                <Check size={14} />
              ) : (
                i + 1
              )}
            </span>
            <div>
              <b>{s.title}</b>
              <small>{s.seconds / 60} min</small>
            </div>
          </li>
        ))}
      </ol>
      <div className="learning-routine-body">
        <div className="learning-routine-clock">
          <b>{position.complete ? "✓" : clock(position.remaining)}</b>
          <span>
            {position.complete
              ? "routine finished"
              : `STEP ${position.stage + 1} · ${running ? "PLAYING" : "READY WHEN YOU ARE"}`}
          </span>
          <div className="learning-routine-meter">
            <span
              style={{ width: `${(draft.plan / routineSeconds) * 100}%` }}
            />
          </div>
          <small>{clock(draft.played)} of actual practice</small>
        </div>
        <div className="learning-routine-instruction">
          <h3>{stage.title}</h3>
          <p>{stage.instruction}</p>
          <div className="learning-mini-progression">
            {stage.chords.map((c) => (
              <div key={c}>
                <b>{c}</b>
                <ChordDiagram chord={getChord(c)} />
              </div>
            ))}
          </div>
          <p className="learning-target">
            <Check size={16} />
            {stage.success}
          </p>
          <button
            className="text-button"
            onClick={() => {
              setRunning(false);
              onLesson(stage.lesson, stage.chapter);
            }}
          >
            Show me the technique <ArrowRight size={14} />
          </button>
        </div>
      </div>
      <div className="learning-routine-controls">
        <button
          className="primary"
          disabled={position.complete || draft.saved}
          onClick={() => {
            setSavedNow(false);
            setRunning((v) => !v);
          }}
        >
          {running ? <Pause size={16} /> : <Play size={16} />}{" "}
          {running
            ? "Pause practice"
            : draft.plan > 0
              ? "Continue practice"
              : "Start 10-minute practice"}
        </button>
        {!position.complete && (
          <button className="secondary" onClick={next}>
            Move to next exercise <ArrowRight size={15} />
          </button>
        )}
        <button
          className="text-button"
          onClick={() => {
            setRunning(false);
            setStored({ date: dayKey(), plan: 0, played: 0, saved: false });
            setSavedNow(false);
          }}
        >
          <RotateCcw size={14} />
          Start a fresh routine
        </button>
      </div>
      <div className="learning-save-row">
        <span>
          {draft.saved || savedNow
            ? "Practice saved to My progress."
            : running
              ? "The timer counts while this page is visible. Pause whenever you need a break."
              : "Your routine saves here automatically. A finished timer is a practice reminder; you judge the sound."}
        </span>
        {onSaveSession && draft.played > 0 && !draft.saved ? (
          <div>
            <label>
              How did it feel?
              <select
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
              >
                <option>A little clearer</option>
                <option>Needs another slow try</option>
                <option>Comfortable and steady</option>
              </select>
            </label>
            <button
              className="secondary"
              onClick={() => {
                setRunning(false);
                save();
              }}
            >
              Save {clock(draft.played)} practice
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

const progressions = [
  {
    id: "first",
    name: "First smooth changes",
    chords: ["C", "Am", "Em", "E"],
    tip: "Keep index B1 and middle D2 for C → Am. Move middle/ring together for Am → Em. Add index G1 for Em → E.",
  },
  {
    id: "four",
    name: "Four open chords",
    chords: ["G", "D", "Em", "C"],
    tip: "Prepare the next chord before beat 1. For G → D the ring changes string (high e3 → B3); it is not a fixed anchor.",
  },
  {
    id: "pair",
    name: "Just C ↔ Am",
    chords: ["C", "Am"],
    tip: "Keep index B1 and middle D2 down. Ring moves A3 ↔ G2; lift across strings rather than dragging.",
  },
];
function ProgressionTrainer({ onChanges }: { onChanges: () => void }) {
  const [sequence, setSequence] = useState("first"),
    [bpm, setBpm] = useState(50),
    [bars, setBars] = useState(2),
    [running, setRunning] = useState(false),
    [quarter, setQuarter] = useState(-1),
    [guide, setGuide] = useState(true),
    [clickOn, setClickOn] = useState(true);
  const sound = useRef({ guide: true, click: true });
  sound.current = { guide, click: clickOn };
  const selected =
    progressions.find((p) => p.id === sequence) ?? progressions[0];
  const position = progressionBeat(
      Math.max(0, quarter),
      selected.chords.length,
      bars,
    ),
    current = selected.chords[position.chord],
    next = selected.chords[position.next];
  useEffect(() => {
    if (!running) return;
    const audio = getAudio();
    let nextTime = audio.currentTime + 0.09,
      beat = 0,
      live = true;
    const scheduled: ReturnType<typeof setTimeout>[] = [];
    const schedule = () => {
      while (nextTime < audio.currentTime + 0.12) {
        const t = nextTime,
          n = beat,
          p = progressionBeat(n, selected.chords.length, bars);
        if (sound.current.click) click(t, p.beat === 1);
        if (!p.countIn && sound.current.guide && p.beat === 1)
          playChord(selected.chords[p.chord], false, t);
        const timeout = setTimeout(
          () => {
            if (live) setQuarter(n);
          },
          Math.max(0, (t - audio.currentTime) * 1000),
        );
        scheduled.push(timeout);
        if (scheduled.length > 20) scheduled.shift();
        nextTime += 60 / bpm;
        beat++;
      }
    };
    schedule();
    const id = setInterval(schedule, 25);
    const hide = () => {
      if (document.hidden) setRunning(false);
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      live = false;
      clearInterval(id);
      scheduled.forEach(clearTimeout);
      document.removeEventListener("visibilitychange", hide);
      setQuarter(-1);
    };
  }, [running, bpm, bars, selected.id]);
  return (
    <section className="learning-playalong card">
      <div className="learning-section-head">
        <div>
          <span className="section-label">PUT IT INTO MUSIC</span>
          <h2>A play-along you can actually use.</h2>
        </div>
        <span>Original practice progression · 4/4</span>
      </div>
      <p>
        One downstroke on every number. Four count-in beats, then follow the
        highlighted chord. Start with two bars per chord and stay slow enough to
        keep counting.
      </p>
      <div className="learning-play-controls">
        <label>
          What to play
          <select
            aria-label="Practice progression"
            value={sequence}
            disabled={running}
            onChange={(e) => setSequence(e.target.value)}
          >
            {progressions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tempo
          <select
            aria-label="Progression tempo"
            value={bpm}
            disabled={running}
            onChange={(e) => setBpm(+e.target.value)}
          >
            {[35, 40, 45, 50, 55, 60, 70, 80].map((n) => (
              <option key={n} value={n}>
                {n} BPM
              </option>
            ))}
          </select>
        </label>
        <label>
          Time to change
          <select
            aria-label="Bars per chord"
            value={bars}
            disabled={running}
            onChange={(e) => setBars(+e.target.value)}
          >
            <option value="2">2 bars per chord</option>
            <option value="1">1 bar per chord</option>
          </select>
        </label>
      </div>
      <div className="learning-play-status" aria-live="off">
        <span>
          {!running
            ? "Set your first chord"
            : position.countIn
              ? "Count in — get ready"
              : `Round ${position.round} · bar ${(Math.floor((Math.max(4, quarter) - 4) / 4) % bars) + 1}/${bars}`}
        </span>
        <strong>
          {!running
            ? selected.chords[0]
            : position.countIn
              ? position.beat
              : current}
        </strong>
        <span>
          {!running
            ? "Press Start when your fingers are ready."
            : position.countIn
              ? `First chord: ${selected.chords[0]}`
              : `Next chord: ${next}`}
        </span>
        <div className="learning-beats">
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className={running && n === position.beat ? "current" : ""}
            >
              {n}
              <small>↓</small>
            </span>
          ))}
        </div>
      </div>
      <div className="learning-chord-line">
        {selected.chords.map((c, i) => (
          <div
            key={`${c}-${i}`}
            className={
              running && !position.countIn && position.chord === i
                ? "current"
                : ""
            }
          >
            <div>
              <b>{c}</b>
              <button
                aria-label={`Hear ${c} chord`}
                onClick={() => playChord(c)}
              >
                <Volume2 size={14} />
              </button>
            </div>
            <ChordDiagram chord={getChord(c)} />
            <small>
              {bars * 4} beats · {bars} {bars === 1 ? "bar" : "bars"}
            </small>
          </div>
        ))}
      </div>
      <p className="learning-play-tip">{selected.tip}</p>
      <div className="learning-play-footer">
        <button
          className="primary"
          onClick={() => {
            getAudio();
            setRunning((v) => !v);
          }}
        >
          {running ? <Pause size={16} /> : <Play size={16} />}{" "}
          {running ? "Stop play-along" : "Start play-along"}
        </button>
        <label>
          <input
            type="checkbox"
            checked={guide}
            onChange={(e) => setGuide(e.target.checked)}
          />
          Reference chord on beat 1
        </label>
        <label>
          <input
            type="checkbox"
            checked={clickOn}
            onChange={(e) => setClickOn(e.target.checked)}
          />
          Metronome click
        </label>
      </div>
      <div className="learning-play-help">
        <p>
          If the change breaks the pulse, stop the loop and isolate that pair.
          Return at a lower tempo or with two bars per chord. Synthesized tones
          are a pitch reference; your ear checks your guitar.
        </p>
        <button
          className="text-button"
          onClick={() => {
            setRunning(false);
            onChanges();
          }}
        >
          Keep the change reference beside me <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}
