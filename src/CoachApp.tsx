import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  Clock,
  Guitar,
  Headphones,
  History,
  Music2,
  SlidersHorizontal,
  X,
} from "lucide-react";
const PracticeDesk = lazy(() =>
  import("./PracticeDesk").then((m) => ({ default: m.PracticeDesk })),
);
const ReferenceRoom = lazy(() =>
  import("./ReferenceRoom").then((m) => ({ default: m.ReferenceRoom })),
);
const JamRoom = lazy(() =>
  import("./JamRoom").then((m) => ({ default: m.JamRoom })),
);
const GuitarJourney = lazy(() =>
  import("./journey/GuitarJourney").then((m) => ({ default: m.GuitarJourney })),
);
const FoundationsPath = lazy(() =>
  import("./foundations/FoundationsPath").then((m) => ({
    default: m.FoundationsPath,
  })),
);
import type { Sources } from "./LegacyLibrary";
const ChordLibrary = lazy(() =>
  import("./LegacyLibrary").then((m) => ({ default: m.ChordLibrary })),
);
const LessonView = lazy(() =>
  import("./LegacyLibrary").then((m) => ({ default: m.LessonView })),
);
const ProgressPage = lazy(() =>
  import("./LegacyLibrary").then((m) => ({ default: m.ProgressPage })),
);
import { Fretboard, Metronome, Tuning } from "./Tools";
import { lessons } from "./learningPath";
import {
  blank,
  dayKey,
  type Progress,
  type Session,
  useStored,
  validProgress,
} from "./state";
import { coachRoute, type CoachPage, type CoachRoute } from "./coachRoute";
import "./coach-app.css";
import "./resonance.css";
type Tool = "tuning" | "rhythm" | "fretboard" | "chords";
export default function CoachApp() {
  const [progress, setProgress, storageError] = useStored<Progress>(
    "six-strings-progress-v1",
    blank,
    validProgress,
  );
  const [route, setRoute] = useState<CoachRoute>(() =>
    coachRoute(location.hash),
  );
  const [sources, setSources] = useState<Sources>({});
  const [imported, setImported, importError] = useStored<
    Record<string, string>
  >("six-strings-sources-v1", {});
  const [tool, setTool] = useState<Tool | null>(null),
    [toast, setToast] = useState("");
  const toolsDialog = useRef<HTMLDialogElement>(null);
  const today = progress.sessions
    .filter((s) => s.date === dayKey())
    .reduce((n, s) => n + s.seconds, 0);
  useEffect(() => {
    const sync = () => setRoute(coachRoute(location.hash));
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    if (route.page !== "library" && route.page !== "guide") return;
    fetch("/transcripts.json")
      .then((r) => (r.ok ? r.json() : {}))
      .then(setSources)
      .catch(() => setSources({}));
  }, [route.page]);
  useEffect(() => {
    if (tool && !toolsDialog.current?.open) toolsDialog.current?.showModal();
    else if (!tool && toolsDialog.current?.open) toolsDialog.current.close();
  }, [tool]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  const go = (page: CoachPage) => {
    location.hash = `/${page === "guide" ? "library" : page}`;
    setRoute({ page: page === "guide" ? "library" : page });
    speechSynthesis.cancel();
    window.scrollTo({ top: 0 });
  };
  const study = (id: string) => {
    location.hash = `/desk?change=${encodeURIComponent(id)}`;
    setRoute({ page: "desk", change: id });
    window.scrollTo({ top: 0 });
  };
  const guide = (lesson: number, focus?: string) => {
    location.hash = `/lesson/${lesson}${focus ? `?focus=${encodeURIComponent(focus)}` : ""}`;
    setRoute({ page: "guide", lesson, focus });
    setProgress((p) => ({ ...p, lastLesson: lesson }));
    window.scrollTo({ top: 0 });
  };
  const save = (session: Session) => {
    setProgress((p) => ({
      ...p,
      sessions: p.sessions.some((s) => s.id === session.id)
        ? p.sessions
        : [...p.sessions, session],
    }));
    setToast("Practice saved. Your next visit starts from here.");
  };
  const lesson = lessons.find((l) => l.id === route.lesson);
  const mainPage = [
    "journey",
    "foundations",
    "desk",
    "jam",
    "reference",
  ].includes(route.page)
    ? route.page
    : null;
  return (
    <div
      className={`coach-app resonance-app ${route.page === "journey" ? "resonance-journey" : ""}`}
    >
      <header className="coach-header">
        <a
          className="coach-brand"
          href="#/journey"
          onClick={(e) => {
            e.preventDefault();
            go("journey");
          }}
        >
          <span>
            <Guitar size={23} />
          </span>
          <b>six strings</b>
        </a>
        <nav aria-label="Main workspace">
          {(
            [
              { id: "journey", label: "Explore", icon: Guitar },
              { id: "foundations", label: "Foundations", icon: BookOpen },
              { id: "desk", label: "Practice", icon: Guitar },
              { id: "jam", label: "Play along", icon: Music2 },
              { id: "reference", label: "Reference", icon: BookOpen },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              aria-current={mainPage === item.id ? "page" : undefined}
              className={mainPage === item.id ? "current" : ""}
              onClick={() => go(item.id)}
            >
              <item.icon size={17} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="coach-header-actions">
          <span className="coach-today">
            <Clock size={14} />
            {Math.floor(today / 60)}m today
          </span>
          <button className="coach-tune" onClick={() => setTool("tuning")}>
            <SlidersHorizontal size={16} />
            Tune & tools
          </button>
          <button
            className="coach-history"
            aria-label="Practice history and backup"
            onClick={() => go("progress")}
          >
            <History size={19} />
          </button>
        </div>
      </header>
      {route.page !== "journey" && (
        <div className="coach-context">
          <span>
            {route.page === "desk"
              ? "LEARN A MOVEMENT → REPEAT IT → USE IT IN MUSIC"
              : route.page === "jam"
                ? "FOLLOW THE PULSE. PREPARE THE NEXT CHORD."
                : route.page === "reference"
                  ? "KEEP EVERY CHANGE WITHIN REACH."
                  : "YOUR SUPPORTING MATERIAL"}
          </span>
          <button onClick={() => go("library")}>
            <Headphones size={13} />
            Source library
            <ArrowUpRight size={12} />
          </button>
        </div>
      )}
      <main className={`coach-main coach-page-${route.page}`}>
        <Suspense
          fallback={
            <div className="resonance-loading" role="status">
              <Guitar size={32} />
              <h1>A little practice. A stronger foundation.</h1>
              <p>Opening your guitar workspace…</p>
            </div>
          }
        >
          {route.page === "journey" && (
            <GuitarJourney
              progress={progress}
              onPractice={(id) =>
                id
                  ? study(id)
                  : progress.sessions.length || progress.completed.length
                    ? go("desk")
                    : study("setup-posture")
              }
              onFoundations={() => go("foundations")}
              onReference={() => go("reference")}
            />
          )}
          {route.page === "foundations" && (
            <FoundationsPath
              progress={progress}
              setProgress={setProgress}
              onPractice={study}
              onJam={() => go("jam")}
              onTool={setTool}
              onGuide={guide}
            />
          )}
          {route.page === "desk" && (
            <PracticeDesk
              progress={progress}
              setProgress={setProgress}
              initialChange={route.change}
              onReference={() => go("reference")}
              onGuide={guide}
              onTool={setTool}
              onJam={() => go("jam")}
              suspended={tool !== null}
            />
          )}
          {route.page === "jam" && (
            <JamRoom
              progress={progress}
              onSaveSession={save}
              onReference={() => go("reference")}
              onChange={study}
              suspended={tool !== null}
            />
          )}
          {route.page === "reference" && (
            <ReferenceRoom onStudy={study} onGuide={guide} onTool={setTool} />
          )}
          {route.page === "library" && (
            <section className="coach-library">
              <div className="coach-library-heading">
                <h1>The source library.</h1>
                <p>
                  Your full lessons and transcripts are here whenever an
                  explanation needs more context. Choose what you need and
                  return to practice.
                </p>
              </div>
              <div className="coach-library-grid">
                {lessons.map((l) => (
                  <button
                    className="coach-source-card"
                    key={l.id}
                    onClick={() => guide(l.id)}
                  >
                    <span>ORIGINAL LESSON {String(l.id).padStart(2, "0")}</span>
                    <h2>{l.title}</h2>
                    <p>{l.description}</p>
                    <small>
                      {l.id === 7
                        ? "15 exact finger routes + full audio"
                        : `${l.steps.length} supporting explanations`}{" "}
                      ·{" "}
                      {sources[l.id] || imported[l.id]
                        ? "source included"
                        : "supplementary guide"}
                    </small>
                    <ArrowUpRight size={18} />
                  </button>
                ))}
              </div>
            </section>
          )}
          {route.page === "guide" && lesson && (
            <section className="coach-guide">
              <LessonView
                key={lesson.id}
                lesson={lesson}
                focus={route.focus}
                onChanges={() => go("reference")}
                progress={progress}
                setProgress={setProgress}
                source={sources[lesson.id]}
                imported={imported[lesson.id]}
                onImport={(text) => {
                  setImported((p) => ({ ...p, [lesson.id]: text }));
                  setToast("Transcript saved locally.");
                }}
                onBack={() => go("library")}
                onNext={() => guide(Math.min(10, lesson.id + 1))}
                onPractice={() => go("desk")}
                onChord={() => setTool("chords")}
                toast={setToast}
              />
            </section>
          )}
          {route.page === "progress" && (
            <section className="coach-progress">
              <button className="text-button" onClick={() => go("desk")}>
                <ArrowLeft size={15} />
                Back to my guitar
              </button>
              <ProgressPage
                progress={progress}
                setProgress={setProgress}
                openLesson={guide}
                toast={setToast}
              />
            </section>
          )}
        </Suspense>
      </main>
      <dialog
        ref={toolsDialog}
        className="coach-tools-dialog"
        onCancel={() => setTool(null)}
        onClose={() => setTool(null)}
      >
        <header>
          <div>
            <span>YOUR PRACTICE TOOLS</span>
            <h2>
              {tool === "tuning"
                ? "Tune up."
                : tool === "rhythm"
                  ? "Find your pulse."
                  : tool === "fretboard"
                    ? "Explore the neck."
                    : "Find a shape."}
            </h2>
          </div>
          <button
            aria-label="Close practice tools"
            onClick={() => setTool(null)}
          >
            <X size={22} />
          </button>
        </header>
        <nav aria-label="Practice tools">
          {(["tuning", "rhythm", "fretboard", "chords"] as const).map((t) => (
            <button
              key={t}
              aria-pressed={tool === t}
              onClick={() => setTool(t)}
            >
              {
                {
                  tuning: "Tuner",
                  rhythm: "Metronome",
                  fretboard: "Notes",
                  chords: "Chord shapes",
                }[t]
              }
            </button>
          ))}
        </nav>
        <div className="coach-tools-body" key={tool}>
          {tool === "tuning" ? (
            <Tuning />
          ) : tool === "rhythm" ? (
            <Metronome />
          ) : tool === "fretboard" ? (
            <Fretboard />
          ) : tool === "chords" ? (
            <ChordLibrary />
          ) : null}
        </div>
      </dialog>
      {toast && (
        <div className="coach-toast" role="status">
          <Check size={16} />
          {toast}
          <button aria-label="Dismiss message" onClick={() => setToast("")}>
            <X size={15} />
          </button>
        </div>
      )}
      {(storageError || importError) && (
        <div className="coach-storage-error" role="alert">
          Your browser could not save this change. Export a backup from Practice
          history before closing.
        </div>
      )}
    </div>
  );
}
