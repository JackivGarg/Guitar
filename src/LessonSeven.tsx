import { useEffect, useRef, useState } from "react";
import { Player, PlayerRef } from "@remotion/player";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Search,
  Download,
  Upload,
} from "lucide-react";
import { ChangeDemo } from "./ChangeDemo";
import {
  changes,
  drillBlocks,
  getChange,
  workshopChord,
  chordLabel,
  fingerPosition,
  positionText,
  workshopQuiz,
} from "./lesson7";
import { ChordDiagram } from "./visuals";
import { getAudio, tone, click } from "./sound";
import { openMidi } from "./course";
import { dayKey, Progress, useStored } from "./state";
type Source = { filename: string; segments: { start: number; text: string }[] };
type Props = {
  progress: Progress;
  setProgress: (p: Progress | ((p: Progress) => Progress)) => void;
  source?: Source;
  imported?: string;
  onImport: (text: string) => void;
  onBack: () => void;
  onNext: () => void;
  onPractice: (tab?: string) => void;
  toast: (s: string) => void;
};
const time = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const fingerNames = ["", "Index", "Middle", "Ring", "Little"];
function hear(name: string) {
  const c = workshopChord(name),
    a = getAudio();
  c.frets.forEach((f, i) => {
    if (f >= 0) tone(openMidi[i] + f, a.currentTime + i * 0.025, 1.5, 0.07);
  });
}
export function LessonSeven({
  progress,
  setProgress,
  source,
  imported,
  onImport,
  onBack,
  onNext,
  onPractice,
  toast,
}: Props) {
  const [location, setLocation] = useStored("six-strings-lesson7-location", {
    block: 1,
    pair: "C-Am",
  });
  const block =
    drillBlocks.find((b) => b.id === location.block) ?? drillBlocks[0];
  const current = getChange(
    block.pairs.includes(location.pair) ? location.pair : block.pairs[0],
  );
  const [view, setView] = useState<"workshop" | "source" | "check">("workshop"),
    [rate, setRate] = useState(0.75),
    [audioRate, setAudioRate] = useState(1),
    [loop, setLoop] = useState(false),
    [audioRange, setAudioRange] = useState([0, 1843]),
    [query, setQuery] = useState(""),
    [step, setStep] = useState(0);
  const player = useRef<PlayerRef>(null),
    audio = useRef<HTMLAudioElement>(null),
    importInput = useRef<HTMLInputElement>(null);
  const finished = drillBlocks.filter(
    (b) => progress.checks[`7-block-${b.id}`],
  ).length;
  const allDone =
    finished === drillBlocks.length &&
    workshopQuiz.every((_, i) => progress.checks[`7-understanding-${i}`]);
  const choose = (id: number) => {
    const b = drillBlocks.find((b) => b.id === id)!;
    setLocation({ block: id, pair: b.pairs[0] });
    setView("workshop");
    setStep(0);
    window.scrollTo({ top: 0 });
  };
  const choosePair = (id: string) => {
    setLocation((l) => ({ ...l, pair: id }));
    setStep(0);
  };
  const check = (key: string, value: boolean) =>
    setProgress((p) => ({ ...p, checks: { ...p.checks, [key]: value } }));
  const listen = (start: number, end: number) => {
    setAudioRange([start, end]);
    if (audio.current) {
      audio.current.currentTime = start;
      audio.current.playbackRate = audioRate;
      void audio.current
        .play()
        .catch(() => toast("Press play on the audio player to listen."));
    }
  };
  const seekDemo = (frame: number) => {
    player.current?.pause();
    player.current?.seekTo(frame);
  };
  const raw = imported
    ? imported
        .split("\n")
        .filter(Boolean)
        .map((text) => ({ start: 0, text }))
    : (source?.segments ?? []);
  const filtered = raw.filter((s) =>
    s.text.toLowerCase().includes(query.toLowerCase()),
  );
  useEffect(() => () => speechSynthesis.cancel(), []);
  const originalRows =
    source?.segments.filter(
      (s, i, all) =>
        s.start < current.end && (all[i + 1]?.start ?? 1843) > current.start,
    ) ?? [];
  const pairsDone = block.pairs.every((id) => progress.checks[`7-pair-${id}`]);
  const blockReady =
    pairsDone &&
    ["forward", "back", "sound"].every(
      (k) => progress.checks[`7-block-${block.id}-${k}`],
    );
  return (
    <>
      <button className="text-button back-button" onClick={onBack}>
        <ArrowLeft size={15} /> Learning path
      </button>
      <div className="workshop-heading">
        <div className="eyebrow">
          LESSON 07 · THE COMPLETE CHORD-CHANGE WORKSHOP
        </div>
        <h1>
          Learn the movement.
          <br />
          <em>Then make it effortless.</em>
        </h1>
        <p>
          Every exercise, every finger route, both directions. Work through the
          blocks across several sessions; there is no need to finish today.
        </p>
        <div className="workshop-metadata">
          <span>{drillBlocks.length} practice blocks</span>
          <span>{changes.length} separate change clips</span>
          <span>31-minute original audio</span>
          <span>
            {finished}/{drillBlocks.length} blocks complete
          </span>
        </div>
      </div>
      <section className="workshop-audio card">
        <div>
          <Headphones size={20} />
          <div>
            <b>The full original Lesson 7 audio</b>
            <p>
              Nothing is shortened. Exercise buttons jump to the relevant
              explanation.
            </p>
          </div>
        </div>
        <audio
          ref={audio}
          controls
          preload="metadata"
          src="/lesson-07.mp3"
          onTimeUpdate={() => {
            if (
              loop &&
              audio.current &&
              audio.current.currentTime >= audioRange[1]
            )
              audio.current.currentTime = audioRange[0];
          }}
        />
        <div className="audio-options">
          <label>
            Voice speed
            <select
              aria-label="Original audio speed"
              value={audioRate}
              onChange={(e) => {
                setAudioRate(+e.target.value);
                if (audio.current) audio.current.playbackRate = +e.target.value;
              }}
            >
              {[0.5, 0.75, 1, 1.25].map((r) => (
                <option key={r} value={r}>
                  {r}×
                </option>
              ))}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={loop}
              onChange={(e) => setLoop(e.target.checked)}
            />{" "}
            Loop selected explanation
          </label>
          <button
            className="text-button"
            onClick={() => {
              setLoop(false);
              listen(0, 1843);
            }}
          >
            Play from beginning
          </button>
        </div>
        {loop && (
          <span className="micro">
            Loop: {time(audioRange[0])}–{time(audioRange[1])}. Audio continues
            normally when looping is off.
          </span>
        )}
      </section>
      <div className="workshop-top-tabs tabs">
        {(
          [
            { id: "workshop", label: "Exercise workshop" },
            { id: "source", label: "Full supplied transcript" },
            { id: "check", label: "Finish & understanding check" },
          ] as const
        ).map((t) => (
          <button
            className={view === t.id ? "selected" : ""}
            onClick={() => setView(t.id)}
            key={t.id}
          >
            {t.label}
          </button>
        ))}
      </div>
      {view === "workshop" && (
        <div className="workshop-layout">
          <aside className="exercise-outline">
            <div className="section-label">FOLLOW THE WHOLE LESSON</div>
            <p>Move through every block. Return whenever you need to.</p>
            {drillBlocks.map((b) => (
              <button
                className={block.id === b.id ? "current" : ""}
                key={b.id}
                onClick={() => choose(b.id)}
              >
                <span>
                  {progress.checks[`7-block-${b.id}`] ? (
                    <Check size={14} />
                  ) : (
                    String(b.id).padStart(2, "0")
                  )}
                </span>
                <div>
                  <b>{b.title}</b>
                  <small>
                    {time(b.start)}–{time(b.end)}
                  </small>
                </div>
              </button>
            ))}
            <div className="outline-progress">
              <span
                style={{ width: `${(finished / drillBlocks.length) * 100}%` }}
              />
            </div>
            <button className="text-button" onClick={() => setView("check")}>
              View all readiness checks <ArrowRight size={14} />
            </button>
          </aside>
          <div className="exercise-main">
            <div className="exercise-title">
              <div className="section-label">
                EXERCISE BLOCK {String(block.id).padStart(2, "0")}
              </div>
              <h2>{block.title}</h2>
              <p>{block.subtitle}</p>
              <div className="progression-route">
                {block.sequence.map((name, i) => (
                  <span key={i}>
                    <button
                      onClick={() => {
                        audio.current?.pause();
                        hear(name);
                      }}
                    >
                      {chordLabel(name)}
                      <Volume2 size={12} />
                    </button>
                    {i < block.sequence.length - 1 && (
                      <ChevronRight size={15} />
                    )}
                  </span>
                ))}
              </div>
              <p className="exercise-explanation">{block.instructions}</p>
              <button
                className="secondary"
                onClick={() => listen(block.start, block.end)}
              >
                <Headphones size={15} /> Hear this complete explanation ·{" "}
                {time(block.start)}–{time(block.end)}
              </button>
            </div>
            <div className="separate-clips">
              <div className="section-label">
                A SEPARATE CLIP FOR EACH CHANGE
              </div>
              <div className="change-tabs">
                {block.pairs.map((id) => {
                  const c = getChange(id);
                  return (
                    <button
                      className={current.id === id ? "selected" : ""}
                      key={id}
                      onClick={() => choosePair(id)}
                    >
                      {progress.checks[`7-pair-${id}`] && <Check size={12} />}{" "}
                      {chordLabel(c.from)} ↔ {chordLabel(c.to)}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="demo-wrapper">
              <Player
                ref={player}
                key={current.id}
                component={ChangeDemo}
                inputProps={{ changeId: current.id }}
                durationInFrames={480}
                fps={30}
                compositionWidth={1200}
                compositionHeight={850}
                controls
                loop
                playbackRate={rate}
                showVolumeControls={false}
                style={{ width: "100%" }}
              />
              <div className="demo-caption">
                <span>Separate 16-second clip · forward, then return</span>
                <label>
                  Animation speed
                  <select
                    aria-label="Change animation speed"
                    value={rate}
                    onChange={(e) => setRate(+e.target.value)}
                  >
                    <option value="0.5">0.5×</option>
                    <option value="0.75">0.75×</option>
                    <option value="1">1×</option>
                  </select>
                </label>
              </div>
              <div className="demo-seek">
                <span>Look closely:</span>
                <button onClick={() => seekDemo(0)}>Start shape</button>
                <button onClick={() => seekDemo(90)}>First movement</button>
                <button onClick={() => seekDemo(132)}>Next movement</button>
                <button onClick={() => seekDemo(195)}>Target shape</button>
                <button onClick={() => seekDemo(360)}>Return</button>
              </div>
            </div>
            <section className="card movement-card">
              <div className="section-label">EXACTLY WHAT YOUR FINGERS DO</div>
              <h3>{current.focus}</h3>
              <div className="movement-rules">
                <div className="keep-rule">
                  <b>Keep / reference</b>
                  <p>{current.stay}</p>
                </div>
                <div className={current.slide ? "guide-rule" : "lift-rule"}>
                  <b>
                    {current.slide
                      ? "Contact stays. Pressure comes off."
                      : "Release before moving."}
                  </b>
                  <p>{current.release}</p>
                </div>
              </div>
              <div className="finger-table">
                <div className="finger-table-head">
                  <span>FINGER</span>
                  <span>FROM</span>
                  <span>TO</span>
                  <span>MOVEMENT</span>
                </div>
                {[1, 2, 3, 4].map((finger) => {
                  const a = fingerPosition(workshopChord(current.from), finger),
                    b = fingerPosition(workshopChord(current.to), finger);
                  if (!a && !b) return null;
                  const same =
                    a && b && a.string === b.string && a.fret === b.fret;
                  return (
                    <div key={finger}>
                      <b>
                        {finger} · {fingerNames[finger]}
                      </b>
                      <span>{positionText(a)}</span>
                      <span>{positionText(b)}</span>
                      <span
                        className={
                          same
                            ? "anchor-text"
                            : current.slide?.includes(finger)
                              ? "slide-text"
                              : "lift-text"
                        }
                      >
                        {same
                          ? "Keep pressed"
                          : !a
                            ? "Add finger"
                            : !b
                              ? "Lift off"
                              : current.slide?.includes(finger)
                                ? "Light-contact slide"
                                : "Release, lift & move"}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="movement-legend">
                <span>
                  <i className="anchor-dot" />
                  Stationary anchor: same string and fret
                </span>
                <span>
                  <i className="slide-dot" />
                  Guide slide: same string, pressure relaxed
                </span>
                <span>
                  <i className="lift-dot" />
                  String change: lift, then place
                </span>
              </div>
            </section>
            <section className="card guided-movement">
              <div className="section-label">
                GUITAR IN HAND · ONE STEP AT A TIME
              </div>
              <div className="step-track">
                {current.steps.map((_, i) => (
                  <button
                    className={step === i ? "current" : ""}
                    key={i}
                    onClick={() => setStep(i)}
                    aria-label={`Movement step ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <span>
                  STEP {step + 1} / {current.steps.length}
                </span>
              </div>
              <h3>{current.steps[step]}</h3>
              <div className="button-row">
                <button
                  className="secondary"
                  disabled={!step}
                  onClick={() => setStep((s) => s - 1)}
                >
                  <ArrowLeft size={15} /> Back
                </button>
                <button
                  className="primary"
                  onClick={() => setStep((s) => (s + 1) % current.steps.length)}
                >
                  {step === current.steps.length - 1
                    ? "Repeat the steps"
                    : "I’ve done that · next"}
                  <ArrowRight size={15} />
                </button>
                <button
                  className="text-button"
                  onClick={() => {
                    speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance(current.steps[step]);
                    u.lang = "en-IN";
                    u.rate = 0.8;
                    speechSynthesis.speak(u);
                  }}
                >
                  <Volume2 size={15} /> Read this instruction
                </button>
              </div>
              <div className="back-route">
                <b>
                  Now come back: {chordLabel(current.to)} →{" "}
                  {chordLabel(current.from)}
                </b>
                <ol>
                  {current.back.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </div>
              <div className="watch-out">
                <b>The detail to watch</b>
                <p>{current.trap}</p>
              </div>
              <details className="original-wording">
                <summary>
                  Original supplied wording for this change ·{" "}
                  {time(current.start)}–{time(current.end)}
                </summary>
                <p className="micro">
                  Preserved as supplied, including recognition errors. The
                  on-screen source diagrams were checked for the shapes used in
                  the English instructions. The original speech is available
                  above.
                </p>
                <button
                  className="text-button"
                  onClick={() => listen(current.start, current.end)}
                >
                  Hear this exact part <Headphones size={14} />
                </button>
                {originalRows.map((r, i) => (
                  <p key={i}>
                    <button
                      className="timestamp"
                      onClick={() =>
                        listen(Math.max(current.start, r.start), current.end)
                      }
                    >
                      {time(r.start)}
                    </button>
                    {r.text}
                  </p>
                ))}
              </details>
            </section>
            <div className="two-shapes">
              <section className="card">
                <div className="card-heading">
                  <h3>{chordLabel(current.from)}</h3>
                  <button
                    className="text-button"
                    onClick={() => {
                      audio.current?.pause();
                      hear(current.from);
                    }}
                  >
                    <Volume2 size={15} /> Hear
                  </button>
                </div>
                <ChordDiagram chord={workshopChord(current.from)} />
                <p>{workshopChord(current.from).tip}</p>
              </section>
              <section className="card">
                <div className="card-heading">
                  <h3>{chordLabel(current.to)}</h3>
                  <button
                    className="text-button"
                    onClick={() => {
                      audio.current?.pause();
                      hear(current.to);
                    }}
                  >
                    <Volume2 size={15} /> Hear
                  </button>
                </div>
                <ChordDiagram chord={workshopChord(current.to)} />
                <p>{workshopChord(current.to).tip}</p>
              </section>
            </div>
            <PracticeRound
              key={current.id}
              changeId={current.id}
              progress={progress}
              setProgress={setProgress}
            />
            <section className="card block-completion">
              <div className="section-label">
                FINISH THIS WHOLE EXERCISE, NOT JUST ONE PAIR
              </div>
              <h3>Put the pieces together.</h3>
              <p>{block.returnRoute}</p>
              <div className="readiness">
                {block.pairs.map((id) => {
                  const c = getChange(id);
                  return (
                    <label key={id}>
                      <input
                        type="checkbox"
                        checked={!!progress.checks[`7-pair-${id}`]}
                        onChange={(e) =>
                          check(`7-pair-${id}`, e.target.checked)
                        }
                      />
                      <span>
                        I practiced {chordLabel(c.from)} ↔ {chordLabel(c.to)} in
                        both directions.
                      </span>
                    </label>
                  );
                })}
                {[
                  {
                    key: "forward",
                    text: "I played the complete exercise forward with plain downstrokes.",
                  },
                  {
                    key: "back",
                    text: "I came back through the return route without throwing my hand away from the neck.",
                  },
                  {
                    key: "sound",
                    text: "I checked individual strings and kept the intended anchors / guides correctly.",
                  },
                ].map((c) => (
                  <label key={c.key}>
                    <input
                      type="checkbox"
                      checked={
                        !!progress.checks[`7-block-${block.id}-${c.key}`]
                      }
                      onChange={(e) =>
                        check(`7-block-${block.id}-${c.key}`, e.target.checked)
                      }
                    />
                    <span>{c.text}</span>
                  </label>
                ))}
              </div>
              <div className="button-row">
                <button
                  className="primary"
                  disabled={
                    !blockReady && !progress.checks[`7-block-${block.id}`]
                  }
                  onClick={() => {
                    check(`7-block-${block.id}`, true);
                    toast(`Exercise block ${block.id} saved.`);
                    if (block.id < 11) choose(block.id + 1);
                    else setView("check");
                  }}
                >
                  {progress.checks[`7-block-${block.id}`]
                    ? "Continue to next block"
                    : "Save block & continue"}
                  <ArrowRight size={16} />
                </button>
                <button
                  className="secondary"
                  onClick={() => onPractice("Rhythm")}
                >
                  Add a slow strumming pulse
                </button>
              </div>
              <p className="micro">
                Self-assessed playing checks. These are not microphone-based
                chord grades.
              </p>
              <textarea
                className="workshop-note"
                aria-label={`Exercise ${block.id} notes`}
                value={progress.notes[`7-ex-${block.id}`] ?? ""}
                placeholder="For this exercise: what moved well, what needs another try?"
                onChange={(e) =>
                  setProgress((p) => ({
                    ...p,
                    notes: { ...p.notes, [`7-ex-${block.id}`]: e.target.value },
                  }))
                }
              />
            </section>
          </div>
        </div>
      )}
      {view === "source" && (
        <section className="card full-workshop-source">
          <div className="section-label">
            THE FULL SUPPLIED SOURCE · NOT CONDENSED
          </div>
          <h2>Keep the original explanation close.</h2>
          <p>
            The English workshop is organized around the source exercise
            sequence. Your original transcript is preserved below without
            rewriting. It includes automatic recognition errors, so listen to
            the original audio for an uncertain phrase.
          </p>
          <div className="source-controls">
            <label className="search-box">
              <Search size={16} />
              <input
                aria-label="Search full Lesson 7 transcript"
                placeholder="Search the supplied wording…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <button
              className="secondary"
              onClick={() => importInput.current?.click()}
            >
              <Upload size={15} /> Import a replacement .txt
            </button>
            <button
              className="secondary"
              onClick={() => {
                const url = URL.createObjectURL(
                  new Blob(
                    [
                      imported ??
                        raw
                          .map((s) => `[${time(s.start)}] ${s.text}`)
                          .join("\n"),
                    ],
                    { type: "text/plain" },
                  ),
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = "lesson-7-full-source.txt";
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              }}
            >
              <Download size={15} /> Save full source
            </button>
          </div>
          <input
            type="file"
            accept=".txt,text/plain"
            hidden
            ref={importInput}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 2_000_000) {
                toast("Choose a text file under 2 MB.");
                return;
              }
              onImport(await f.text());
              e.target.value = "";
            }}
          />
          <div className="transcript">
            {filtered.map((r, i) => (
              <div key={i}>
                <button
                  className="timestamp"
                  onClick={() => {
                    setLoop(false);
                    listen(r.start, 1843);
                  }}
                >
                  {imported ? "Play" : time(r.start)}
                </button>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {view === "check" && (
        <section className="card workshop-finish">
          <div className="section-label">THE COMPLETE LESSON 7 CHECK</div>
          <h2>Make sure the details stayed with you.</h2>
          <p>
            {finished} of {drillBlocks.length} exercise blocks completed. Finish
            every block, then answer these six questions. Your earlier C–Am
            practice is only one part of this workshop.
          </p>
          <div className="coverage-list">
            {drillBlocks.map((b) => (
              <button
                key={b.id}
                className={progress.checks[`7-block-${b.id}`] ? "complete" : ""}
                onClick={() => choose(b.id)}
              >
                <span>
                  {progress.checks[`7-block-${b.id}`] ? (
                    <Check size={15} />
                  ) : (
                    b.id
                  )}
                </span>
                <b>{b.title}</b>
                <small>
                  {b.pairs.length} change clip{b.pairs.length > 1 ? "s" : ""}
                </small>
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
          {workshopQuiz.map((q, i) => (
            <div className="quiz" key={q.q}>
              <div className="section-label">
                CHECK {i + 1} / {workshopQuiz.length}
              </div>
              <h3>{q.q}</h3>
              {q.options.map((option, a) => (
                <button
                  className={
                    progress.checks[`7-understanding-${i}`] && a === q.answer
                      ? "correct"
                      : ""
                  }
                  key={option}
                  onClick={() => {
                    check(`7-understanding-${i}`, a === q.answer);
                    toast(a === q.answer ? q.why : "Try again. " + q.why);
                  }}
                >
                  <span>{String.fromCharCode(65 + a)}</span>
                  {option}
                  {progress.checks[`7-understanding-${i}`] &&
                    a === q.answer && <Check size={16} />}
                </button>
              ))}
            </div>
          ))}
          <div className="completion-box">
            <p>
              {allDone
                ? "Every block and understanding check is complete. Keep revisiting the movements in daily practice."
                : "Complete all 11 exercise blocks and all six understanding checks to finish the full workshop."}
            </p>
            <button
              className="primary"
              disabled={!allDone}
              onClick={() => {
                setProgress((p) => ({
                  ...p,
                  completed: [...new Set([...p.completed, 7])],
                }));
                toast("The full Lesson 7 workshop is complete.");
                onNext();
              }}
            >
              Complete the full lesson <CheckCircle2 size={17} />
            </button>
          </div>
        </section>
      )}
    </>
  );
}

function PracticeRound({
  changeId,
  progress,
  setProgress,
}: {
  changeId: string;
  progress: Progress;
  setProgress: Props["setProgress"];
}) {
  const c = getChange(changeId);
  const [duration, setDuration] = useState(60),
    [left, setLeft] = useState(60),
    [count, setCount] = useState(0),
    [running, setRunning] = useState(false),
    [saved, setSaved] = useState(false);
  const deadline = useRef(0);
  useEffect(() => {
    if (!running) return;
    deadline.current = Date.now() + left * 1000;
    const id = setInterval(() => {
      const n = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setLeft(n);
      if (n === 0) {
        setRunning(false);
        click(getAudio().currentTime, true);
      }
    }, 150);
    return () => clearInterval(id);
  }, [running]);
  const label = `${chordLabel(c.from)} ↔ ${chordLabel(c.to)}`;
  const scores = progress.scores.filter((s) => s.pair === label);
  return (
    <section className="card exercise-practice">
      <div className="section-label">PRACTICE THIS EXACT CHANGE</div>
      <h3>{label}</h3>
      <p>
        First move without strumming. Then use four plain downstrokes per chord.
        When the route is familiar, count each clear arrival. Speed is optional;
        the correct movement comes first.
      </p>
      <div className="duration-options">
        {[60, 120, 300, 600].map((n) => (
          <button
            key={n}
            disabled={running}
            className={duration === n ? "selected" : ""}
            onClick={() => {
              setDuration(n);
              setLeft(n);
              setCount(0);
              setSaved(false);
            }}
          >
            {n / 60} min
          </button>
        ))}
      </div>
      <div className="change-controls">
        <div className="clock">{time(left)}</div>
        <div className="counter">
          <strong>{count}</strong>
          <button
            className="primary"
            disabled={!running}
            onClick={() => setCount((n) => n + 1)}
          >
            + Clear change
          </button>
        </div>
      </div>
      <div className="button-row">
        <button
          className="primary"
          disabled={left === 0 || saved}
          onClick={() => setRunning(!running)}
        >
          {running ? <Pause size={15} /> : <Play size={15} />}{" "}
          {running
            ? "Pause"
            : left < duration
              ? "Resume"
              : "Start slow practice"}
        </button>
        <button
          className="secondary"
          onClick={() => {
            setRunning(false);
            setLeft(duration);
            setCount(0);
            setSaved(false);
          }}
        >
          <RotateCcw size={15} /> Reset
        </button>
        <button
          className="secondary"
          disabled={running || left !== 0 || saved}
          onClick={() => {
            setProgress((p) => ({
              ...p,
              scores: [
                ...p.scores,
                { date: dayKey(), pair: label, count, seconds: duration },
              ],
            }));
            setSaved(true);
          }}
        >
          <Check size={15} />
          {saved ? "Round saved" : "Save round"}
        </button>
      </div>
      <p className="micro">
        {c.check}{" "}
        {scores.length
          ? `Previous rounds: ${scores
              .slice(-4)
              .map(
                (s) =>
                  `${s.count} in ${Math.round((s.seconds ?? 60) / 60)} min`,
              )
              .join(", ")} clear changes.`
          : ""}
      </p>
    </section>
  );
}
