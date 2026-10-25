import { useEffect, useRef, useState } from "react";
import { Player } from "@remotion/player";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Flame,
  Guitar,
  Headphones,
  Home,
  Leaf,
  ListMusic,
  LockKeyhole,
  Menu,
  Music2,
  NotebookPen,
  Pause,
  Play,
  Search,
  Settings2,
  Sparkles,
  Target,
  Timer,
  Upload,
  Volume2,
  X,
} from "lucide-react";
import { lessons, chords, getChord, Lesson } from "./course";
import { Demo } from "./Demo";
import { ChordDiagram, GuitarArt } from "./visuals";
import { playChord } from "./sound";
import { Changes, Fretboard, Metronome, Tuning } from "./Tools";
import {
  blank,
  dayKey,
  Progress,
  Session,
  streak,
  useStored,
  validProgress,
} from "./state";
type Page = "today" | "learn" | "chords" | "practice" | "journal";
type Sources = Record<
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

export default function App() {
  const [progress, setProgress, storageError] = useStored<Progress>(
    "six-strings-progress-v1",
    blank,
    validProgress,
  );
  const [page, setPage] = useState<Page>("today"),
    [lessonId, setLessonId] = useState<number | null>(null),
    [mobile, setMobile] = useState(false),
    [toast, setToast] = useState(""),
    [practiceTab, setPracticeTab] = useState("Session");
  const [sources, setSources] = useState<Sources>({});
  const [imported, setImported, sourceError] = useStored<
    Record<string, string>
  >("six-strings-sources-v1", {});
  const next =
    lessons.find((l) => !progress.completed.includes(l.id)) ?? lessons[9];
  const todaySeconds = progress.sessions
    .filter((s) => s.date === dayKey())
    .reduce((n, s) => n + s.seconds, 0);
  const total = progress.sessions.reduce((n, s) => n + s.seconds, 0);
  useEffect(() => {
    fetch("/transcripts.json")
      .then((r) => (r.ok ? r.json() : {}))
      .then(setSources)
      .catch(() => setSources({}));
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(id);
  }, [toast]);
  const nav = (p: Page) => {
    setPage(p);
    setLessonId(null);
    setMobile(false);
    window.scrollTo({ top: 0 });
    speechSynthesis.cancel();
  };
  const openLesson = (id: number) => {
    setLessonId(id);
    setPage("learn");
    setMobile(false);
    setProgress((p) => ({ ...p, lastLesson: id }));
    window.scrollTo({ top: 0 });
  };
  const practice = (tab = "Session") => {
    setPracticeTab(tab);
    nav("practice");
  };
  const lesson = lessons.find((l) => l.id === lessonId);
  return (
    <div className="app-shell">
      <aside className={"sidebar " + (mobile ? "open" : "")}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            nav("today");
          }}
        >
          <img src="/icon.svg" alt="" />
          <div>
            six strings<span>A LITTLE, EVERY DAY.</span>
          </div>
        </a>
        <div className="side-label">YOUR SPACE</div>
        <nav>
          {(
            [
              { id: "today", text: "Today", icon: Home },
              { id: "learn", text: "Learning path", icon: BookOpen },
              { id: "chords", text: "Chord library", icon: Guitar },
              { id: "practice", text: "Practice studio", icon: ListMusic },
              { id: "journal", text: "My progress", icon: NotebookPen },
            ] as const
          ).map((n) => (
            <button
              className={page === n.id ? "active" : ""}
              key={n.id}
              onClick={() => nav(n.id)}
            >
              <n.icon size={19} />
              {n.text}
              {n.id === "learn" && <span className="nav-count">10</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="habit-card">
            <Leaf size={22} />
            <b>Small steps. Real music.</b>
            <p>
              Show up for a few minutes.
              <br />
              Your future self will hear it.
            </p>
            <div className="mini-progress">
              <span
                style={{
                  width: `${Math.min(100, (todaySeconds / (progress.goal * 60)) * 100)}%`,
                }}
              />
            </div>
            <small>
              {Math.floor(todaySeconds / 60)} / {progress.goal} min today
            </small>
          </div>
          <div className="local-note">
            <span className="status-dot" /> Saved on this computer
          </div>
        </div>
      </aside>
      {mobile && (
        <button
          className="mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <main>
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            aria-label="Open navigation"
            onClick={() => setMobile(true)}
          >
            <Menu size={21} />
          </button>
          <div className="breadcrumb">
            Your guitar journey <ChevronRight size={13} />{" "}
            <b>
              {lesson
                ? `Lesson ${lesson.id}`
                : {
                    today: "Today",
                    learn: "Learning path",
                    chords: "Chord library",
                    practice: "Practice studio",
                    journal: "My progress",
                  }[page]}
            </b>
          </div>
          <div className="top-meta">
            <span className="local-pill">
              <LockKeyhole size={13} /> Local & private
            </span>
            <span className="avatar">J</span>
          </div>
        </header>
        <div className="page-content" key={page + String(lessonId)}>
          {page === "today" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">MAKE ROOM FOR MUSIC</div>
                  <h1>Your daily rhythm.</h1>
                  <p>
                    A quieter moment. Six strings. A little better than
                    yesterday.
                  </p>
                </div>
                <div className="date-label">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </div>
              </div>
              <div className="dashboard-top">
                <section className="hero-card">
                  <div className="hero-copy">
                    <span className="small-pill">
                      <Sparkles size={13} /> YOUR NEXT CHAPTER
                    </span>
                    <h2>
                      A little practice.
                      <br />A lot of <em>progress.</em>
                    </h2>
                    <p>
                      {progress.completed.length === 0
                        ? "Start with the basics. Build a habit. Make music your own."
                        : `Keep going with Lesson ${next.id}: ${next.title.toLowerCase()}.`}
                    </p>
                    <button
                      className="primary"
                      onClick={() => openLesson(next.id)}
                    >
                      {progress.completed.length === 0
                        ? "Begin your journey"
                        : "Continue learning"}
                      <ArrowRight size={17} />
                    </button>
                    <span className="hero-foot">
                      At your pace. One clear note at a time.
                    </span>
                  </div>
                  <div className="hero-art">
                    <GuitarArt />
                  </div>
                </section>
                <section className="card daily-card">
                  <div className="card-heading">
                    <h3>Today’s practice</h3>
                    <span className="tag">{progress.goal} MIN</span>
                  </div>
                  <p className="muted small">
                    A simple plan. A little of everything.
                  </p>
                  <div className="daily-items">
                    {[
                      {
                        title: "Tune & settle in",
                        sub: "Start with six clear strings",
                        icon: Headphones,
                      },
                      {
                        title: next.title,
                        sub: `Lesson ${next.id} · learn, then try`,
                        icon: BookOpen,
                      },
                      {
                        title: "Find your rhythm",
                        sub: "Slow beats. Smooth changes.",
                        icon: Music2,
                      },
                    ].map((x, i) => (
                      <button
                        key={x.title}
                        onClick={() =>
                          i === 0
                            ? practice("Tuning")
                            : i === 1
                              ? openLesson(next.id)
                              : practice("Rhythm")
                        }
                      >
                        <span className={"task-icon task-" + i}>
                          <x.icon size={18} />
                        </span>
                        <div>
                          <b>{x.title}</b>
                          <span>{x.sub}</span>
                        </div>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  </div>
                  <button className="outline wide" onClick={() => practice()}>
                    Start guided practice <Play size={15} />
                  </button>
                </section>
              </div>
              <div className="stats-row">
                <div>
                  <span className="stat-icon peach">
                    <Flame size={21} />
                  </span>
                  <div>
                    <strong>
                      {streak(progress.sessions)}{" "}
                      <small>
                        day{streak(progress.sessions) === 1 ? "" : "s"}
                      </small>
                    </strong>
                    <span>Practice streak</span>
                  </div>
                </div>
                <div>
                  <span className="stat-icon lavender">
                    <BookOpen size={21} />
                  </span>
                  <div>
                    <strong>
                      {progress.completed.length}
                      <small> / 10</small>
                    </strong>
                    <span>Lessons completed</span>
                  </div>
                </div>
                <div>
                  <span className="stat-icon sage">
                    <Clock size={21} />
                  </span>
                  <div>
                    <strong>
                      {Math.floor(total / 60)} <small>min</small>
                    </strong>
                    <span>Time with your guitar</span>
                  </div>
                </div>
                <div className="stat-last">
                  <span className="stat-icon sand">
                    <Target size={21} />
                  </span>
                  <div>
                    <strong>
                      {progress.scores.length > 0
                        ? Math.max(...progress.scores.map((s) => s.count))
                        : 0}
                    </strong>
                    <span>Best changes / minute</span>
                  </div>
                </div>
              </div>
              <div className="section-title">
                <div>
                  <h2>
                    {progress.completed.length
                      ? "Keep the music going"
                      : "Your first steps"}
                  </h2>
                  <p>Learn it. See it. Put it under your fingers.</p>
                </div>
                <button className="text-button" onClick={() => nav("learn")}>
                  View learning path <ArrowUpRight size={17} />
                </button>
              </div>
              <div className="lesson-preview-grid">
                {lessons
                  .slice(Math.min(next.id - 1, 7), Math.min(next.id - 1, 7) + 3)
                  .map((l, i) => (
                    <LessonCard
                      key={l.id}
                      lesson={l}
                      done={progress.completed.includes(l.id)}
                      onClick={() => openLesson(l.id)}
                      index={i}
                    />
                  ))}
              </div>
              <div className="daily-tip">
                <span>✦</span>
                <div>
                  <b>Today’s gentle reminder</b>
                  <p>
                    Clean notes come before quick fingers. Slow down until it
                    sounds good, then build from there.
                  </p>
                </div>
                <button
                  className="text-button"
                  onClick={() => practice("Chord changes")}
                >
                  Try a slow change <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
          {page === "learn" && !lesson && (
            <>
              <PageTitle
                eyebrow="ONE STEP AT A TIME"
                title="Your learning path."
                text="Ten lessons. A clear way forward. Start at the beginning, revisit whenever you like."
              />
              <div className="path-banner">
                <div>
                  <span className="section-label">BEGINNER FOUNDATIONS</span>
                  <h3>From your first note to your first fill.</h3>
                  <p>
                    Watch a demonstration → learn one step → play it → check
                    your understanding.
                  </p>
                </div>
                <div className="path-percent">
                  <strong>{progress.completed.length * 10}%</strong>
                  <span>of your path complete</span>
                </div>
              </div>
              <div className="path-list">
                {lessons.map((l) => (
                  <button
                    className="path-row"
                    key={l.id}
                    onClick={() => openLesson(l.id)}
                  >
                    <span
                      className={
                        "lesson-number " +
                        (progress.completed.includes(l.id) ? "done" : "")
                      }
                    >
                      {progress.completed.includes(l.id) ? (
                        <Check size={21} />
                      ) : (
                        String(l.id).padStart(2, "0")
                      )}
                    </span>
                    <div>
                      <div className="section-label">{l.category}</div>
                      <h3>{l.title}</h3>
                      <p>{l.description}</p>
                    </div>
                    <span className="source-chip">
                      {sources[l.id] || imported[l.id]
                        ? "Transcript included"
                        : "Supplementary guide"}
                    </span>
                    <span className="duration">
                      <Clock size={14} />
                      {l.minutes} min
                    </span>
                    <ChevronRight size={18} />
                  </button>
                ))}
              </div>
            </>
          )}
          {page === "learn" && lesson && (
            <LessonView
              key={lesson.id}
              lesson={lesson}
              progress={progress}
              setProgress={setProgress}
              source={sources[lesson.id]}
              imported={imported[lesson.id]}
              onImport={(text) => {
                setImported((s) => ({ ...s, [lesson.id]: text }));
                setToast("Transcript saved on this computer.");
              }}
              onBack={() => nav("learn")}
              onNext={() => openLesson(Math.min(10, lesson.id + 1))}
              onPractice={practice}
              onChord={() => nav("chords")}
              toast={setToast}
            />
          )}
          {page === "chords" && <ChordLibrary />}
          {page === "practice" && (
            <>
              <PageTitle
                eyebrow="PUT IT UNDER YOUR FINGERS"
                title="Your practice studio."
                text="A few good minutes are enough. Tune up, take it slowly, and listen to every note."
              />
              <div className="tabs tool-tabs">
                {[
                  "Session",
                  "Rhythm",
                  "Chord changes",
                  "Tuning",
                  "Fretboard",
                ].map((t) => (
                  <button
                    className={practiceTab === t ? "selected" : ""}
                    key={t}
                    onClick={() => setPracticeTab(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <section className="card tool-card">
                {practiceTab === "Session" ? (
                  <PracticeSession
                    lesson={lessons[(progress.lastLesson || 1) - 1]}
                    progress={progress}
                    onSave={(session) => {
                      setProgress((p) => ({
                        ...p,
                        sessions: [...p.sessions, session],
                      }));
                      setToast("Practice saved. A little better than before.");
                    }}
                    onLearn={() => openLesson(progress.lastLesson)}
                    onTool={setPracticeTab}
                  />
                ) : practiceTab === "Rhythm" ? (
                  <Metronome />
                ) : practiceTab === "Chord changes" ? (
                  <Changes progress={progress} setProgress={setProgress} />
                ) : practiceTab === "Tuning" ? (
                  <Tuning />
                ) : (
                  <Fretboard />
                )}
              </section>
            </>
          )}
          {page === "journal" && (
            <ProgressPage
              progress={progress}
              setProgress={setProgress}
              openLesson={openLesson}
              toast={setToast}
            />
          )}
          <footer>
            <span>
              six strings <span className="footer-dot">·</span> Made for the way
              you learn.
            </span>
            <span>One small practice at a time.</span>
          </footer>
        </div>
      </main>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
          <button aria-label="Dismiss message" onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {(storageError || sourceError) && (
        <div className="storage-warning" role="alert">
          Your browser could not save changes. Export a backup from My progress
          before closing.
        </div>
      )}
    </div>
  );
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
function LessonCard({
  lesson: l,
  done,
  onClick,
  index,
}: {
  lesson: Lesson;
  done: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <button className="lesson-card" onClick={onClick}>
      <div className={"lesson-visual visual-" + index}>
        <span className="lesson-badge">
          LESSON {String(l.id).padStart(2, "0")}
        </span>
        {l.mode === "anatomy" ? (
          <div className="mini-guitar">
            <GuitarArt />
          </div>
        ) : l.mode === "strings" ? (
          <div className="string-art">
            {["E", "A", "D", "G", "B", "e"].map((s, i) => (
              <div key={i}>
                <span style={{ height: Math.max(1, 4 - i * 0.5) }} />
                <b>{s}</b>
              </div>
            ))}
          </div>
        ) : l.chords.length ? (
          <div className="mini-chord">
            <ChordDiagram chord={getChord(l.chords[0])} />
            <span>{l.chords[0]}</span>
          </div>
        ) : (
          <div className="note-art">
            ♪ <span>♯</span> ♫
          </div>
        )}
        <span className="play-round">
          <Play size={16} fill="currentColor" />
        </span>
      </div>
      <div className="lesson-card-copy">
        <span className="section-label">{l.category}</span>
        <h3>{l.title}</h3>
        <p>{l.short}</p>
        <div>
          <span>
            <Clock size={13} />
            {l.minutes} min
          </span>
          <span>
            {done ? (
              <>
                <Check size={14} /> Complete
              </>
            ) : (
              "Explore lesson"
            )}
            <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </button>
  );
}

function LessonView({
  lesson: l,
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
  const [demoMode, setDemoMode] = useState(l.mode),
    [demoChord, setDemoChord] = useState(l.chords[0] ?? "C");
  const [tab, setTab] = useState("Learn"),
    [step, setStep] = useState(0),
    [answer, setAnswer] = useState<number | null>(null),
    [query, setQuery] = useState(""),
    [rate, setRate] = useState(1),
    [speaking, setSpeaking] = useState(false);
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
  return (
    <>
      <button className="text-button back-button" onClick={onBack}>
        <ArrowLeft size={15} /> All lessons
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
      <div className="lesson-layout">
        <div className="lesson-main">
          <div className="demo-wrapper">
            <Player
              key={l.id}
              component={Demo}
              inputProps={{ mode: demoMode, chordName: demoChord }}
              durationInFrames={360}
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
              {l.id === 8 ? (
                <>
                  <button
                    className={demoMode === "mute" ? "selected" : ""}
                    onClick={() => setDemoMode("mute")}
                  >
                    Muted strum
                  </button>
                  <button
                    className={demoMode === "bridge" ? "selected" : ""}
                    onClick={() => setDemoMode("bridge")}
                  >
                    Bridge palm mute
                  </button>
                </>
              ) : l.mode === "chord" ? (
                l.chords.map((c) => (
                  <button
                    key={c}
                    className={demoChord === c ? "selected" : ""}
                    onClick={() => setDemoChord(c)}
                  >
                    {c}
                  </button>
                ))
              ) : null}
            </div>
            <div className="demo-caption">
              <span>
                <span className="status-dot" /> Visual demonstration · pause &
                replay
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
              <div className="step-track">
                {l.steps.map((s, i) => (
                  <button
                    key={s.title}
                    aria-label={`Step ${i + 1}: ${s.title}`}
                    className={
                      step === i ? "current" : step > i ? "visited" : ""
                    }
                    onClick={() => {
                      setStep(i);
                      speechSynthesis.cancel();
                      setSpeaking(false);
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <span>
                  STEP {step + 1} OF {l.steps.length}
                </span>
              </div>
              <h2>{l.steps[step].title}</h2>
              <p className="teaching-text">{l.steps[step].text}</p>
              <div className="try-box">
                <span className="try-icon">
                  <Guitar size={22} />
                </span>
                <div>
                  <b>Pick up your guitar. Try this.</b>
                  <p>{l.steps[step].action}</p>
                </div>
              </div>
              <div className="hindi-note">
                <span>हिंदी में याद रखें</span>
                <p>{l.hindi}</p>
              </div>
              <div className="step-controls">
                <button
                  className="text-button"
                  disabled={step === 0}
                  onClick={() => {
                    setStep((s) => s - 1);
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
                    if (step < 3) setStep((s) => s + 1);
                    else setTab("Try & check");
                  }}
                >
                  {step < 3 ? "Next step" : "Try & check"}
                  <ArrowRight size={16} />
                </button>
              </div>
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
                    : checks && passed
                      ? "Ready for the next small step."
                      : "Complete the three playing checks and answer the question correctly to finish."}
                </p>
                <button
                  className="primary"
                  disabled={!done && (!checks || !passed)}
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
                        <button
                          title={
                            l.id === 7
                              ? "Seek supplied audio"
                              : "Timestamp in the source video"
                          }
                          onClick={() => {
                            if (l.id === 7 && audio.current) {
                              audio.current.currentTime = s.start;
                              void audio.current.play().catch(() => {});
                            }
                          }}
                          className="timestamp"
                        >
                          {time(s.start)}
                        </button>
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

function ChordLibrary() {
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

function PracticeSession({
  lesson: l,
  progress,
  onSave,
  onLearn,
  onTool,
}: {
  lesson: Lesson;
  progress: Progress;
  onSave: (s: Session) => void;
  onLearn: () => void;
  onTool: (t: string) => void;
}) {
  const [draft, setDraft] = useStored("six-strings-session-v1", {
    duration: progress.goal,
    elapsed: 0,
    saved: false,
    feeling: "Steady",
    lesson: l.id,
  });
  const same = draft.lesson === l.id;
  const [duration, setDuration] = useState(
      same ? draft.duration : progress.goal,
    ),
    [elapsed, setElapsed] = useState(same ? draft.elapsed : 0),
    [running, setRunning] = useState(false),
    [saved, setSaved] = useState(same ? draft.saved : false),
    [feeling, setFeeling] = useState(same ? draft.feeling : "Steady");
  useEffect(
    () => setDraft({ duration, elapsed, saved, feeling, lesson: l.id }),
    [duration, elapsed, saved, feeling, l.id],
  );
  const started = useRef(0),
    base = useRef(0);
  const total = duration * 60;
  const phases = [
    {
      title: "Tune & get comfortable",
      share: 0.1,
      body: "Check E A D G B e, sit comfortably and relax your shoulders.",
      tool: "Tuning",
    },
    {
      title: `Learn: ${l.title}`,
      share: 0.25,
      body: l.steps[0].action,
      tool: "Learn",
    },
    {
      title: "Put it into your hands",
      share: 0.35,
      body: l.drill,
      tool:
        l.id === 5 || l.id === 6
          ? "Fretboard"
          : l.id === 7 || l.id === 9
            ? "Chord changes"
            : "Rhythm",
    },
    {
      title: "Play slowly, then reflect",
      share: 0.3,
      body: "Repeat the exercise slowly. Listen for clear notes, keep a steady pulse, then write down one thing that improved.",
      tool: "Rhythm",
    },
  ];
  let acc = 0;
  const current = phases.findIndex((p) => {
    acc += p.share * total;
    return elapsed < acc;
  });
  const phase = elapsed >= total ? phases[3] : phases[Math.max(0, current)];
  useEffect(() => {
    if (!running) return;
    started.current = Date.now();
    base.current = elapsed;
    const id = setInterval(() => {
      const next = Math.min(
        total,
        base.current + Math.floor((Date.now() - started.current) / 1000),
      );
      setElapsed(next);
      if (next >= total) setRunning(false);
    }, 200);
    return () => clearInterval(id);
  }, [running, total]);
  const save = () => {
    if (saved || elapsed < 10) return;
    onSave({
      id: crypto.randomUUID(),
      date: dayKey(),
      seconds: elapsed,
      lesson: l.id,
      feeling,
    });
    setSaved(true);
    setRunning(false);
  };
  return (
    <div className="session-layout">
      <div>
        <div className="section-label">YOUR DAILY RITUAL</div>
        <h2>Just you and your guitar.</h2>
        <p>
          Follow the four steps below. Your timer pauses when you open another
          tool. Return to Session to resume where you left off.
        </p>
        <div className="duration-options">
          {[10, 20, 30].map((n) => (
            <button
              disabled={elapsed > 0}
              className={duration === n ? "selected" : ""}
              key={n}
              onClick={() => setDuration(n)}
            >
              {n} minutes
            </button>
          ))}
        </div>
        <div className="session-clock">
          <svg viewBox="0 0 220 220">
            <circle
              cx="110"
              cy="110"
              r="96"
              fill="none"
              stroke="#e8dfe6"
              strokeWidth="5"
            />
            <circle
              cx="110"
              cy="110"
              r="96"
              fill="none"
              stroke="#8c6c91"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={604}
              strokeDashoffset={604 * (1 - elapsed / total)}
              transform="rotate(-90 110 110)"
            />
          </svg>
          <div>
            <strong>{time(Math.max(0, total - elapsed))}</strong>
            <span>
              {saved
                ? "PRACTICE SAVED"
                : running
                  ? "STAY WITH THE SOUND"
                  : "YOUR TIME TO PLAY"}
            </span>
          </div>
        </div>
        <div className="button-row centered">
          <button
            className="primary"
            disabled={saved || elapsed >= total}
            onClick={() => setRunning(!running)}
          >
            {running ? <Pause size={17} /> : <Play size={17} />}{" "}
            {running ? "Pause" : elapsed ? "Resume practice" : "Begin practice"}
          </button>
          <button
            className="secondary"
            onClick={() => {
              setRunning(false);
              setElapsed(0);
              setSaved(false);
            }}
          >
            Reset
          </button>
        </div>
        <div className="save-session">
          <label>
            How did it feel?
            <select
              aria-label="Practice feeling"
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
            >
              {[
                "Steady",
                "A little easier",
                "Challenging",
                "Great session",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <button
            className="outline"
            disabled={saved || elapsed < 10}
            onClick={save}
          >
            <Check size={16} />
            {saved
              ? "Saved to your progress"
              : `Finish & save${elapsed >= 60 ? ` ${Math.floor(elapsed / 60)} min` : ""}`}
          </button>
        </div>
        <p className="micro">
          Only actual elapsed time is saved. You can finish early after 10
          seconds.
        </p>
      </div>
      <div className="session-plan">
        <span className="section-label">FOLLOW THIS SIMPLE PLAN</span>
        <h3>Today, focus on Lesson {l.id}.</h3>
        {phases.map((p, i) => (
          <div
            className={"session-phase " + (phase === p ? "current" : "")}
            key={p.title}
          >
            <span>{i + 1}</span>
            <div>
              <small>{Math.round(p.share * duration)} MIN</small>
              <h4>{p.title}</h4>
              <p>{p.body}</p>
              <button
                className="text-button"
                onClick={() => {
                  setRunning(false);
                  p.tool === "Learn" ? onLearn() : onTool(p.tool);
                }}
              >
                Open {p.tool === "Learn" ? "lesson" : p.tool.toLowerCase()}{" "}
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        ))}
        <div className="soft-box">
          <b>Quality, then quantity.</b>
          <p>
            If a chord buzzes, slow down and check one string at a time. Rest
            your hand between attempts.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProgressPage({
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
