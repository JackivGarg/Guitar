import { useEffect, useRef, useState } from "react";
import { Player } from "@remotion/player";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Download,
  Guitar,
  NotebookPen,
  Search,
  Upload,
  Volume2,
} from "lucide-react";
import { chords, getChord, Lesson } from "./course";
import { lessons, videoIds } from "./learningPath";
import { SourceVideo } from "./SourceVideo";
import { BarreExplorer } from "./BarreExplorer";
import { LessonDemo } from "./TechniqueDemo";
import { LessonSeven } from "./LessonSeven";
import { ChordDiagram } from "./visuals";
import { playChord } from "./sound";
import { Fretboard } from "./Tools";
import {
  dayKey,
  Progress,
  streak,
  useStored,
  validProgress,
} from "./state";
export type Sources = Record<
  string,
  {
    filename: string;
    download: string;
    segments: { start: number; text: string }[];
    language: string;
  }
>;
const time = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
function download(name: string, data: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function PageTitle({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </div>
  );
}
export function LessonView({
  lesson: l,
  focus,
  onChanges,
  progress,
  setProgress,
  source,
  imported,
  onImport,
  onBack,
  onNext,
  onPractice,
  onChord,
  toast,
}: {
  lesson: Lesson;
  focus?: string;
  onChanges: () => void;
  progress: Progress;
  setProgress: (p: Progress | ((p: Progress) => Progress)) => void;
  source: Sources[string];
  imported?: string;
  onImport: (text: string) => void;
  onBack: () => void;
  onNext: () => void;
  onPractice: (tab?: string) => void;
  onChord: () => void;
  toast: (s: string) => void;
}) {
  const [demoMode, setDemoMode] = useState(l.steps[0].demo ?? l.mode),
    [demoChord, setDemoChord] = useState(
      l.steps[0].chord ?? l.chords[0] ?? "C",
    );
  const [tab, setTab] = useState("Learn"),
    [answer, setAnswer] = useState<number | null>(null),
    [query, setQuery] = useState(""),
    [rate, setRate] = useState(1),
    [speaking, setSpeaking] = useState(false);
  const [step, setStep] = useStored<number>(
    `six-strings-chapter-${l.id}`,
    0,
    (value) =>
      Number.isInteger(value) &&
      Number(value) >= 0 &&
      Number(value) < l.steps.length,
  );
  useEffect(() => {
    if (!focus || l.id === 7) return;
    const target = l.steps.findIndex((s) => s.title === focus);
    if (target >= 0) setStep(target);
  }, [focus, l.id]);
  const chapter = l.steps[step];
  useEffect(() => {
    setDemoMode(chapter.demo ?? l.mode);
    setDemoChord(chapter.chord ?? l.chords[0] ?? "C");
    speechSynthesis.cancel();
    setSpeaking(false);
  }, [step, l.id]);
  const chooseChapter = (i: number) => {
    history.replaceState(
      null,
      "",
      `#/lesson/${l.id}?focus=${encodeURIComponent(l.steps[i].title)}`,
    );
    setStep(i);
    speechSynthesis.cancel();
    setSpeaking(false);
    requestAnimationFrame(() =>
      document
        .getElementById("chapter-select")
        ?.scrollIntoView({ block: "start", behavior: "smooth" }),
    );
  };
  const chapterKey = (i: number) => `${l.id}-chapter-${l.steps[i].title}`;
  const chaptersDone = l.steps.every((_, i) => progress.checks[chapterKey(i)]);
  const input = useRef<HTMLInputElement>(null),
    audio = useRef<HTMLAudioElement>(null);
  const checks = l.check.every((_, i) => progress.checks[`${l.id}-${i}`]);
  const passed = answer === l.quiz.answer || progress.checks[`quiz-${l.id}`];
  const done = progress.completed.includes(l.id);
  useEffect(() => () => speechSynthesis.cancel(), []);
  const speak = () => {
    speechSynthesis.cancel();
    if (speaking) {
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(
      `${l.steps[step].title}. ${l.steps[step].text}. Try it now. ${l.steps[step].action}`,
    );
    utterance.lang = "en-IN";
    utterance.rate = 0.88;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    speechSynthesis.speak(utterance);
  };
  const filtered = (
    imported
      ? imported
          .split("\n")
          .filter(Boolean)
          .map((text, i) => ({ start: i, text }))
      : (source?.segments ?? [])
  ).filter((s) =>
    s.text.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  if (l.id === 7)
    return (
      <LessonSeven
        initialChange={focus}
        onReference={onChanges}
        progress={progress}
        setProgress={setProgress}
        source={source}
        imported={imported}
        onImport={onImport}
        onBack={onBack}
        onNext={onNext}
        onPractice={onPractice}
        toast={toast}
      />
    );
  return (
    <>
      <button className="text-button back-button" onClick={onBack}>
        <ArrowLeft size={15} /> Reference library
      </button>
      <div className="lesson-heading">
        <div>
          <div className="eyebrow">
            LESSON {String(l.id).padStart(2, "0")} / {l.category.toUpperCase()}
          </div>
          <h1>{l.title}.</h1>
          <p>{l.description}</p>
        </div>
        <span className="tag">
          <Clock size={14} />
          {l.minutes} MIN
        </span>
      </div>
      <SourceVideo lesson={l.id} start={chapter.sourceStart} />
      {!source && !imported && (
        <p className="supplementary-note">
          The original video is available above. These English chapters are
          supplementary exercises because a transcript for this lesson was not
          supplied.
        </p>
      )}
      <div className="lesson-layout">
        <div className="lesson-main">
          <div className="tabs lesson-tabs">
            {["Learn", "Try & check", "Source transcript"].map((t) => (
              <button
                className={tab === t ? "selected" : ""}
                onClick={() => setTab(t)}
                key={t}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "Learn" && (
            <section className="card lesson-step">
              <div className="chapter-selector">
                <label htmlFor="chapter-select">
                  GUIDE {step + 1} OF {l.steps.length} · PRACTISE AT YOUR OWN
                  PACE
                </label>
                <select
                  id="chapter-select"
                  value={step}
                  onChange={(e) => chooseChapter(Number(e.target.value))}
                >
                  {l.steps.map((s, i) => (
                    <option key={s.title} value={i}>
                      {i + 1}. {s.title}
                    </option>
                  ))}
                </select>
              </div>
              <h2>{l.steps[step].title}</h2>
              <p className="teaching-text">{l.steps[step].text}</p>
              <div className="demo-wrapper">
                <Player
                  key={`${l.id}-${step}-${demoMode}-${demoChord}`}
                  component={LessonDemo}
                  inputProps={{
                    mode: demoMode,
                    chordName: demoChord,
                    pattern: chapter.pattern ?? 1,
                  }}
                  durationInFrames={demoMode === "fingerexercise" ? 720 : 360}
                  fps={30}
                  compositionWidth={1200}
                  compositionHeight={760}
                  style={{ width: "100%" }}
                  controls
                  loop
                  playbackRate={rate}
                  showVolumeControls={false}
                />
                <div className="demo-options">
                  <span>{chapter.title}</span>
                </div>
                <div className="demo-caption">
                  <span>
                    <span className="status-dot" /> Schematic demonstration ·
                    pause & replay
                  </span>
                  <label>
                    Speed
                    <select
                      aria-label="Demonstration speed"
                      value={rate}
                      onChange={(e) => setRate(+e.target.value)}
                    >
                      <option value="0.5">0.5×</option>
                      <option value="0.75">0.75×</option>
                      <option value="1">1×</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="try-box">
                <span className="try-icon">
                  <Guitar size={22} />
                </span>
                <div>
                  <b>Pick up your guitar. Try this.</b>
                  <p>{l.steps[step].action}</p>
                </div>
              </div>
              <label className="chapter-practiced">
                <input
                  type="checkbox"
                  checked={!!progress.checks[chapterKey(step)]}
                  onChange={(e) =>
                    setProgress((p) => ({
                      ...p,
                      checks: {
                        ...p.checks,
                        [chapterKey(step)]: e.target.checked,
                      },
                    }))
                  }
                />
                <span>
                  I tried this exercise on my guitar and checked the result.
                </span>
              </label>
              <div className="step-controls">
                <button
                  className="text-button"
                  disabled={step === 0}
                  onClick={() => {
                    chooseChapter(step - 1);
                    speechSynthesis.cancel();
                    setSpeaking(false);
                  }}
                >
                  <ArrowLeft size={15} /> Previous
                </button>
                <button className="text-button" onClick={speak}>
                  <Volume2 size={16} />
                  {speaking ? "Stop reading" : "Read this step"}
                </button>
                <button
                  className="primary"
                  onClick={() => {
                    speechSynthesis.cancel();
                    setSpeaking(false);
                    if (step < l.steps.length - 1) chooseChapter(step + 1);
                    else setTab("Try & check");
                  }}
                >
                  {step < l.steps.length - 1 ? "Next step" : "Try & check"}
                  <ArrowRight size={16} />
                </button>
              </div>
              {l.id === 2 && (
                <button
                  className="secondary"
                  onClick={() => onPractice("Tuning")}
                >
                  Open tuning tools
                </button>
              )}
              {[5, 6, 9].includes(l.id) && <BarreExplorer />}
              {[5, 6].includes(l.id) && (
                <details className="inline-fretboard">
                  <summary>Open the note explorer</summary>
                  <Fretboard />
                </details>
              )}
            </section>
          )}
          {tab === "Try & check" && (
            <section className="card lesson-step">
              <div className="section-label">
                PUT YOUR LEARNING INTO PRACTICE
              </div>
              <h2>Slow is a good place to start.</h2>
              <div className="soft-box">
                <b>Your exercise</b>
                <p>{l.drill}</p>
                <button
                  className="text-button"
                  onClick={() =>
                    onPractice(
                      l.id === 2
                        ? "Tuning"
                        : l.id === 7
                          ? "Chord changes"
                          : l.id === 5 || l.id === 6
                            ? "Fretboard"
                            : "Session",
                    )
                  }
                >
                  Open practice tools <ArrowUpRight size={16} />
                </button>
              </div>
              <p className="chapter-summary">
                {
                  l.steps.filter((_, i) => progress.checks[chapterKey(i)])
                    .length
                }{" "}
                of {l.steps.length} chapter exercises practised. Use the chapter
                list to revisit any unfinished exercise.
              </p>
              <h3>Can you do these comfortably?</h3>
              <p className="small muted">
                Try each one on your guitar before ticking it. You assess the
                sound; the app does not grade your playing.
              </p>
              <div className="readiness">
                {l.check.map((c, i) => (
                  <label key={c}>
                    <input
                      type="checkbox"
                      checked={!!progress.checks[`${l.id}-${i}`]}
                      onChange={(e) =>
                        setProgress((p) => ({
                          ...p,
                          checks: {
                            ...p.checks,
                            [`${l.id}-${i}`]: e.target.checked,
                          },
                        }))
                      }
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
              <div className="quiz">
                <div className="section-label">A QUICK UNDERSTANDING CHECK</div>
                <h3>{l.quiz.q}</h3>
                {l.quiz.options.map((o, i) => (
                  <button
                    className={
                      (answer === i ? "chosen " : "") +
                      (answer === i && i === l.quiz.answer ? "correct" : "")
                    }
                    key={o}
                    onClick={() => {
                      setAnswer(i);
                      setProgress((p) => ({
                        ...p,
                        checks: {
                          ...p.checks,
                          [`quiz-${l.id}`]: i === l.quiz.answer,
                        },
                      }));
                    }}
                  >
                    <span>{String.fromCharCode(65 + i)}</span>
                    {o}
                    {answer === i && i === l.quiz.answer && <Check size={18} />}
                  </button>
                ))}
                {answer !== null && (
                  <p
                    className={
                      answer === l.quiz.answer ? "feedback good" : "feedback"
                    }
                  >
                    {answer === l.quiz.answer
                      ? "Exactly. "
                      : "Have another look. "}
                    {l.quiz.why}
                  </p>
                )}
                {answer === null && passed && (
                  <p className="feedback good">
                    Previously answered correctly. You can try it again.
                  </p>
                )}
              </div>
              <div className="completion-box">
                <p>
                  {done
                    ? "You have completed this lesson. Revisit it any time."
                    : chaptersDone && checks && passed
                      ? "Ready for the next small step."
                      : "Practise and check each chapter, complete the playing checks, and answer the question to finish."}
                </p>
                <button
                  className="primary"
                  disabled={!done && (!chaptersDone || !checks || !passed)}
                  onClick={() => {
                    if (!done) {
                      setProgress((p) => ({
                        ...p,
                        completed: [...new Set([...p.completed, l.id])],
                      }));
                      toast(`Lesson ${l.id} completed. Well played.`);
                    } else if (l.id < 10) onNext();
                    else onPractice();
                  }}
                >
                  {done
                    ? l.id === 10
                      ? "Keep practicing"
                      : "Next lesson"
                    : "Complete lesson"}
                  {done ? <ArrowRight size={16} /> : <Check size={16} />}
                </button>
              </div>
            </section>
          )}
          {tab === "Source transcript" && (
            <section className="card lesson-step">
              <div className="section-label">YOUR REFERENCE MATERIAL</div>
              <h2>The original words.</h2>
              <p className="small muted">
                {source || imported
                  ? "This is the supplied transcript. Automatic exports can include repeated lines and incorrect chord names. Use the separately authored lesson notes for the practice instructions."
                  : "No transcript was supplied for this lesson. The lesson above is an original supplementary guide, not a transcript of the video."}
              </p>
              {l.id === 7 && (
                <div className="source-audio">
                  <b>Supplied Lesson 7 audio</b>
                  <audio
                    controls
                    preload="none"
                    ref={audio}
                    src="/lesson-07.mp3"
                  />
                </div>
              )}
              <div className="source-controls">
                <label className="search-box">
                  <Search size={16} />
                  <input
                    aria-label="Search transcript"
                    value={query}
                    placeholder="Search this transcript…"
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <button
                  className="secondary"
                  onClick={() => input.current?.click()}
                >
                  <Upload size={15} /> Import .txt
                </button>
                {(source || imported) && (
                  <button
                    className="secondary"
                    onClick={() =>
                      download(
                        `lesson-${l.id}-transcript.txt`,
                        imported ??
                          source.segments
                            .map((s) => `[${time(s.start)}] ${s.text}`)
                            .join("\n"),
                        "text/plain",
                      )
                    }
                  >
                    <Download size={15} /> Save text
                  </button>
                )}
              </div>
              <input
                type="file"
                accept=".txt,text/plain"
                ref={input}
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 2_000_000) {
                    toast("Choose a text file smaller than 2 MB.");
                    return;
                  }
                  onImport(await f.text());
                  e.target.value = "";
                }}
              />
              <div className="transcript">
                {filtered.length ? (
                  filtered.map((s, i) => (
                    <div key={i}>
                      {!imported && (
                        <a
                          className="timestamp"
                          title="Watch this moment in the original video"
                          href={`https://www.youtube.com/watch?v=${videoIds[l.id - 1]}&t=${Math.floor(s.start)}s`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {time(s.start)} ↗
                        </a>
                      )}
                      <p>{s.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="muted">
                    {query
                      ? "No matching words."
                      : "Import a transcript to keep it with this lesson."}
                  </p>
                )}
              </div>
              <a
                className="text-link"
                href={`https://www.youtube.com/watch?v=${["wAfbTvEeMmw", "UIhlHxxFNQM", "ODLFoDeUMqw", "bXcYT5lePX4", "6sw25rlOle8", "3NqcJZlw6GY", "m_2NdqHltho", "1c0ZNt2JS-c", "rHggr-5Q95I", "Pkfm42vrY2E"][l.id - 1]}`}
                target="_blank"
                rel="noreferrer"
              >
                Watch Acoustic Pahadi’s source lesson online{" "}
                <ArrowUpRight size={14} />
              </a>
            </section>
          )}
        </div>
        <aside className="lesson-side">
          <section className="card chapter-outline">
            <div className="section-label">SUPPORTING EXPLANATIONS</div>
            <h3>Find the detail you need</h3>
            <p>Your chapter position and exercise checks save automatically.</p>
            <ol>
              {l.steps.map((s, i) => (
                <li key={s.title}>
                  <button
                    className={step === i ? "current" : ""}
                    aria-current={step === i ? "step" : undefined}
                    onClick={() => {
                      setTab("Learn");
                      chooseChapter(i);
                    }}
                  >
                    <span>
                      {progress.checks[chapterKey(i)] ? (
                        <Check size={13} />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <div>
                      {s.title}
                      <small>
                        {s.sourceStart !== undefined
                          ? `Source ≈ ${time(s.sourceStart)}`
                          : "Supplementary exercise"}
                      </small>
                    </div>
                  </button>
                </li>
              ))}
            </ol>
          </section>
          <section className="card">
            <div className="section-label">YOUR ROADMAP</div>
            <h3>Learn by doing.</h3>
            <ol className="roadmap">
              <li>
                <span>1</span>
                <div>
                  <b>Watch the movement</b>
                  <small>Pause. Replay. Notice the details.</small>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <b>Learn one small step</b>
                  <small>Keep your guitar in your hands.</small>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <b>Try it, then check</b>
                  <small>A clear sound before speed.</small>
                </div>
              </li>
            </ol>
            <button className="primary wide" onClick={() => onPractice()}>
              Practice this lesson
              <ArrowRight size={16} />
            </button>
          </section>
          {l.chords.length > 0 && (
            <section className="card">
              <div className="section-label">IN THIS LESSON</div>
              <h3>Your chord shapes</h3>
              <div className="chord-pills">
                {l.chords.map((c) => (
                  <button
                    key={c}
                    onClick={() => playChord(c)}
                    title={`Hear ${c}`}
                  >
                    {c}
                    <Volume2 size={12} />
                  </button>
                ))}
              </div>
              <p className="micro">Tap to hear a synthesized reference.</p>
              <button className="text-button" onClick={onChord}>
                Open chord diagrams <ArrowUpRight size={15} />
              </button>
            </section>
          )}
          <section className="note-card">
            <NotebookPen size={20} />
            <h3>A note to yourself</h3>
            <textarea
              aria-label="Lesson notes"
              placeholder="What clicked? What needs another try?"
              value={progress.notes[l.id] ?? ""}
              onChange={(e) =>
                setProgress((p) => ({
                  ...p,
                  notes: { ...p.notes, [l.id]: e.target.value },
                }))
              }
            />
            <span className="micro">Saved automatically on this computer.</span>
          </section>
        </aside>
      </div>
    </>
  );
}

export function ChordLibrary() {
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All shapes"),
    [selected, setSelected] = useState("C");
  const chord = getChord(selected);
  return (
    <>
      <PageTitle
        eyebrow="YOUR FINGERTIP REFERENCE"
        title="A shape for every sound."
        text="Clear diagrams, finger-by-finger guidance, and a sound to aim for."
      />
      <div className="chord-library-layout">
        <section>
          <div className="library-controls">
            <label className="search-box">
              <Search size={17} />
              <input
                aria-label="Search chords"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a chord…"
              />
            </label>
            <select
              aria-label="Chord category"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>All shapes</option>
              <option>Open chords</option>
              <option>Barre chords</option>
            </select>
          </div>
          <div className="chord-grid">
            {chords
              .filter(
                (c) =>
                  c.name.toLowerCase().includes(query.toLowerCase()) &&
                  (filter === "All shapes" ||
                    (filter === "Barre chords") === !!c.barre),
              )
              .map((c) => (
                <button
                  className={
                    "chord-tile " + (selected === c.name ? "selected" : "")
                  }
                  key={c.name}
                  onClick={() => setSelected(c.name)}
                >
                  <div>
                    <h3>{c.name}</h3>
                    <span>{c.barre ? "Barre" : "Open"}</span>
                  </div>
                  <ChordDiagram chord={c} />
                </button>
              ))}
          </div>
        </section>
        <aside className="card chord-detail">
          <span className="section-label">LET’S BUILD IT</span>
          <h2>{chord.name}</h2>
          <ChordDiagram chord={chord} active interactive />
          <p>{chord.tip}</p>
          <button
            className="primary wide"
            onClick={() => playChord(chord.name)}
          >
            <Volume2 size={17} /> Hear this chord
          </button>
          <div className="diagram-key">
            <span>
              <b>O</b> Open string
            </span>
            <span>
              <b>×</b> Don’t play
            </span>
            <span>
              <b>1–4</b> Finger number
            </span>
          </div>
          <p className="micro">
            Front view, right-handed diagrams. Thick low E on the left; thin
            high e on the right. Tap an individual diagram string to hear its
            note.
          </p>
        </aside>
      </div>
    </>
  );
}

export function ProgressPage({
  progress,
  setProgress,
  openLesson,
  toast,
}: {
  progress: Progress;
  setProgress: (p: Progress | ((p: Progress) => Progress)) => void;
  openLesson: (id: number) => void;
  toast: (s: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const total = progress.sessions.reduce((s, x) => s + x.seconds, 0);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = dayKey(d);
    return {
      key,
      label: d.toLocaleDateString("en-IN", { weekday: "short" }),
      minutes:
        progress.sessions
          .filter((s) => s.date === key)
          .reduce((a, s) => a + s.seconds, 0) / 60,
    };
  });
  return (
    <>
      <PageTitle
        eyebrow="LOOK HOW FAR YOU’VE COME"
        title="Little wins add up."
        text="Your practice, your notes, your pace. Everything stays on this computer."
      />
      <div className="progress-head">
        <div className="card">
          <span className="section-label">TIME WELL SPENT</span>
          <strong>
            {Math.floor(total / 60)}
            <small> minutes</small>
          </strong>
          <p>
            {progress.sessions.length} saved sessions ·{" "}
            {streak(progress.sessions)} day streak
          </p>
        </div>
        <div className="card">
          <span className="section-label">YOUR DAILY INTENTION</span>
          <label className="goal-setting">
            <input
              type="number"
              aria-label="Daily practice goal"
              min="5"
              max="60"
              value={progress.goal}
              onChange={(e) => {
                const goal = +e.target.value;
                if (goal >= 5 && goal <= 60)
                  setProgress((p) => ({ ...p, goal }));
              }}
            />
            <span>minutes a day</span>
          </label>
          <p>Aim for consistency. Five good minutes count too.</p>
        </div>
      </div>
      <div className="progress-grid">
        <section className="card">
          <div className="card-heading">
            <h3>Your last seven days</h3>
            <span className="tag">MINUTES</span>
          </div>
          <div className="week-chart">
            {week.map((d) => (
              <div key={d.key}>
                <span>{Math.floor(d.minutes)}</span>
                <div>
                  <i
                    style={{
                      height: `${Math.min(100, (d.minutes / Math.max(progress.goal, ...week.map((x) => x.minutes))) * 100)}%`,
                    }}
                  />
                </div>
                <small>{d.label}</small>
              </div>
            ))}
          </div>
          <p className="micro">Time from finished, saved sessions.</p>
        </section>
        <section className="card">
          <h3>Your learning milestones</h3>
          <div className="milestones">
            {lessons.map((l) => (
              <button
                key={l.id}
                className={progress.completed.includes(l.id) ? "complete" : ""}
                onClick={() => openLesson(l.id)}
              >
                <span>
                  {progress.completed.includes(l.id) ? (
                    <Check size={15} />
                  ) : (
                    l.id
                  )}
                </span>
                {l.title}
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
        </section>
      </div>
      <div className="section-title">
        <h2>Notes from your journey</h2>
        <span className="tag">SAVED AUTOMATICALLY</span>
      </div>
      <div className="notes-grid">
        {lessons.filter((l) => progress.notes[l.id]).length ? (
          lessons
            .filter((l) => progress.notes[l.id])
            .map((l) => (
              <button
                className="note-card"
                key={l.id}
                onClick={() => openLesson(l.id)}
              >
                <span className="section-label">LESSON {l.id}</span>
                <h3>{l.title}</h3>
                <p>{progress.notes[l.id]}</p>
                <span className="text-button">
                  Return to lesson <ArrowRight size={14} />
                </span>
              </button>
            ))
        ) : (
          <div className="empty-note">
            <NotebookPen size={24} />
            <p>
              Your lesson notes will appear here. Write down one thing you learn
              today.
            </p>
            <button
              className="text-button"
              onClick={() => openLesson(progress.lastLesson)}
            >
              Open your lesson <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
      <section className="card history-card">
        <h3>Recent practice</h3>
        {progress.sessions.length ? (
          progress.sessions
            .slice(-10)
            .reverse()
            .map((s) => (
              <div className="history-row" key={s.id}>
                <span>{s.date}</span>
                <b>Lesson {s.lesson}</b>
                <span>{time(s.seconds)} practiced</span>
                <span>{s.feeling}</span>
              </div>
            ))
        ) : (
          <p className="muted">
            No sessions yet. Your first small practice is a good place to start.
          </p>
        )}
      </section>
      <section className="backup-row">
        <div>
          <h3>Keep your progress with you.</h3>
          <p>
            Export a backup before clearing browser data or changing computers.
          </p>
        </div>
        <div className="button-row">
          <button
            className="secondary"
            onClick={() =>
              download(
                `six-strings-progress-${dayKey()}.json`,
                JSON.stringify(progress, null, 2),
              )
            }
          >
            <Download size={16} /> Export backup
          </button>
          <button className="secondary" onClick={() => input.current?.click()}>
            <Upload size={16} /> Restore backup
          </button>
          <input
            hidden
            ref={input}
            type="file"
            accept="application/json,.json"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                if (f.size > 5_000_000) throw new Error();
                const data = JSON.parse(await f.text());
                if (!validProgress(data)) throw new Error();
                setProgress((p) => ({
                  ...data,
                  completed: [...new Set([...p.completed, ...data.completed])],
                  notes: { ...p.notes, ...data.notes },
                  checks: { ...p.checks, ...data.checks },
                  sessions: [
                    ...new Map(
                      [...p.sessions, ...data.sessions].map((s) => [s.id, s]),
                    ).values(),
                  ],
                  scores: [
                    ...new Map(
                      [...p.scores, ...data.scores].map((s) => [
                        JSON.stringify(s),
                        s,
                      ]),
                    ).values(),
                  ],
                }));
                toast("Backup restored. Existing progress was kept.");
              } catch {
                toast(
                  "That is not a valid Six Strings backup. Nothing was changed.",
                );
              }
              e.target.value = "";
            }}
          />
        </div>
      </section>
    </>
  );
}
