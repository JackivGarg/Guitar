import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Pause,
  Play,
  Volume2,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getAudio, playChord, playNote, click } from "../sound";
import { getChord } from "../course";
import { ChordDiagram } from "../visuals";
import type { Progress } from "../state";
import {
  chapterAtProgress,
  progressAtScroll,
  journeyChapters,
  openStringStudy,
} from "./journeySpec";
import "./guitar-journey.css";
gsap.registerPlugin(ScrollTrigger);
const GuitarWorld = lazy(() =>
  import("../world/GuitarWorld").then((module) => ({
    default: module.GuitarWorld,
  })),
);
type Props = {
  onPractice: (unit?: string) => void;
  onFoundations: () => void;
  onReference: () => void;
  progress: Progress;
};
class InstrumentBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)"),
      update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}
function initialChapter() {
  if (typeof location === "undefined") return null;
  const id = new URLSearchParams(location.hash.split("?")[1] ?? "").get(
    "chapter",
  );
  return journeyChapters.find((c) => c.id === id)?.id ?? null;
}
export function GuitarJourney({
  onPractice,
  onFoundations,
  onReference,
  progress,
}: Props) {
  const root = useRef<HTMLElement>(null),
    reducedMotion = useReducedMotion();
  const [position, setPosition] = useState(0),
    [paused, setPaused] = useState(false),
    [worldReady, setWorldReady] = useState(false),
    [worldFailed, setWorldFailed] = useState(false),
    [posterAvailable, setPosterAvailable] = useState(true),
    [activeString, setActiveString] = useState<number | null>(null),
    [pluckNonce, setPluckNonce] = useState(0),
    [soundStatus, setSoundStatus] = useState(""),
    [pulse, setPulse] = useState<number | null>(null);
  const pulseTimer = useRef<ReturnType<typeof setInterval> | null>(null),
    chapter = chapterAtProgress(position),
    hasHistory = progress.sessions.length > 0 || progress.completed.length > 0;
  const onReady = useCallback(() => setWorldReady(true), []),
    onWorldFailure = useCallback(() => {
      setWorldFailed(true);
      setWorldReady(false);
    }, []);
  const stopPulse = useCallback(() => {
    if (pulseTimer.current) clearInterval(pulseTimer.current);
    pulseTimer.current = null;
    setPulse(null);
  }, []);
  const hearString = useCallback((index: number) => {
    const s = openStringStudy[index];
    if (!s) return;
    try {
      playNote(s.midi);
      setActiveString(index);
      setPluckNonce((n) => n + 1);
      setSoundStatus(
        `String ${s.number}: ${s.name}, ${s.pitch}. Synthesized reference tone.`,
      );
    } catch {
      setSoundStatus(
        "Sound could not start. Press a string button to try again.",
      );
    }
  }, []);
  const hearNote = () => {
    try {
      playNote(65);
      setSoundStatus("High e, fret 1: F4. Synthesized reference tone.");
    } catch {
      setSoundStatus(
        "Sound could not start. Press Hear the note to try again.",
      );
    }
  };
  const hearShape = (name: string) => {
    try {
      playChord(name);
      setSoundStatus(`${name} chord. Synthesized reference tone.`);
    } catch {
      setSoundStatus(
        "Sound could not start. Press a chord button to try again.",
      );
    }
  };
  const startPulse = () => {
    if (pulseTimer.current) {
      stopPulse();
      return;
    }
    try {
      const a = getAudio();
      let beat = 0;
      setPulse(0);
      click(a.currentTime + 0.025, true);
      pulseTimer.current = setInterval(() => {
        beat++;
        if (beat >= 4) {
          stopPulse();
          return;
        }
        setPulse(beat);
        click(getAudio().currentTime + 0.025, false);
      }, 1000);
      setSoundStatus("Four beats at 60 BPM. Count one, two, three, four.");
    } catch {
      stopPulse();
      setSoundStatus(
        "The beat could not start. Press Hear four beats to try again.",
      );
    }
  };
  useEffect(
    () => () => {
      if (pulseTimer.current) clearInterval(pulseTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (chapter !== 4) stopPulse();
  }, [chapter, stopPulse]);
  useEffect(() => {
    const update = () => {
      if (document.hidden) stopPulse();
    };
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, [stopPulse]);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    let disposed = false,
      allowUrlWrite = false,
      lastWritten = -1;
    const requested = initialChapter();
    const updateUrl = (index: number) => {
      if (
        !allowUrlWrite ||
        lastWritten === index ||
        !location.hash.startsWith("#/journey")
      )
        return;
      lastWritten = index;
      history.replaceState(
        history.state,
        "",
        `${location.pathname}${location.search}#/journey?chapter=${journeyChapters[index].id}`,
      );
    };
    let landmarks: number[] = [];
    const measure = () => {
      const top = element.getBoundingClientRect().top;
      landmarks = Array.from(
        element.querySelectorAll<HTMLElement>("[data-chapter-index]"),
      ).map((section) => section.getBoundingClientRect().top - top);
    };
    measure();
    const receiveProgress = (self: ScrollTrigger) => {
      const next = progressAtScroll(
        self.progress * (self.end - self.start),
        landmarks,
      );
      setPosition(next);
      updateUrl(chapterAtProgress(next));
    };
    const context = gsap.context(() => {
      ScrollTrigger.create({
        id: "six-strings-instrument-journey",
        trigger: element,
        start: "top top",
        end: () =>
          "+=" + Math.max(1, element.offsetHeight - window.innerHeight),
        invalidateOnRefresh: true,
        onUpdate: receiveProgress,
        onRefresh: (self) => {
          measure();
          receiveProgress(self);
        },
      });
    }, element);
    const restoreFrame = requestAnimationFrame(() => {
      if (disposed) return;
      if (requested)
        document
          .getElementById(`journey-${requested}`)
          ?.scrollIntoView({ behavior: "auto", block: "start" });
      ScrollTrigger.refresh();
      allowUrlWrite = true;
    });
    let resizeFrame = 0;
    const refresh = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        if (!disposed) ScrollTrigger.refresh();
      });
    };
    const observer = new ResizeObserver(refresh);
    observer.observe(element);
    window.addEventListener("pageshow", refresh);
    void document.fonts?.ready.then(() => {
      if (!disposed) refresh();
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(restoreFrame);
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
      window.removeEventListener("pageshow", refresh);
      context.revert();
    };
  }, []);
  const goTo = (i: number) =>
    document
      .getElementById(`journey-${journeyChapters[i].id}`)
      ?.scrollIntoView({
        behavior: reducedMotion || paused ? "auto" : "smooth",
        block: "start",
      });
  return (
    <article
      className="guitar-journey"
      ref={root}
      data-journey-chapter={journeyChapters[chapter].id}
      data-journey-progress={position.toFixed(3)}
      data-reduced-motion={reducedMotion}
    >
      <div className="journey-stage">
        <div
          className={"journey-world " + (worldReady ? "is-ready" : "")}
          role="img"
          aria-label="Yamaha FS80C Black, explored from body to strings and fretboard"
        >
          {!worldReady && (
            <div className="journey-world-fallback" aria-hidden="true">
              {posterAvailable && (
                <picture
                  style={{ display: "block", width: "100%", height: "100%" }}
                >
                  <source
                    media="(max-width:800px)"
                    srcSet="/world-guitar-poster-mobile.png"
                  />
                  <img
                    src="/world-guitar-poster.png"
                    alt=""
                    onError={() => setPosterAvailable(false)}
                  />
                </picture>
              )}
              <span>
                {worldFailed
                  ? "The instrument view is unavailable. Every exercise below still works."
                  : "The instrument view is preparing. You can start practising straight away."}
              </span>
            </div>
          )}
          <InstrumentBoundary onFailure={onWorldFailure}>
            <Suspense fallback={null}>
              <GuitarWorld
                progress={reducedMotion ? chapter : position}
                reducedMotion={reducedMotion}
                paused={paused}
                onReady={onReady}
                onFailure={onWorldFailure}
                onPluck={hearString}
                activeString={activeString}
                pluckNonce={pluckNonce}
              />
            </Suspense>
          </InstrumentBoundary>
        </div>
        <div className="journey-stage-shade" aria-hidden="true" />
        <div className="journey-persistent-controls">
          <button className="journey-skip" onClick={() => onPractice()}>
            Go to practice <ArrowRight size={15} />
          </button>
          <button
            className="journey-motion-control"
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
            <span>{paused ? "Resume motion" : "Pause motion"}</span>
          </button>
          {reducedMotion && (
            <span className="journey-motion-status">Reduced motion</span>
          )}
        </div>
        <nav
          className="journey-chapter-navigation"
          aria-label="Explore guitar foundations"
        >
          {journeyChapters.map((item, i) => (
            <button
              key={item.id}
              aria-label={`${i + 1}. ${item.title}`}
              aria-current={chapter === i ? "step" : undefined}
              className={chapter === i ? "is-current" : ""}
              onClick={() => goTo(i)}
            >
              <span>{i + 1}</span>
              <b>{item.title}</b>
            </button>
          ))}
        </nav>
      </div>
      <div className="journey-story">
        <section
          className="journey-chapter journey-opening"
          id="journey-instrument"
          data-chapter-index="0"
          aria-labelledby="journey-instrument-title"
        >
          <div className="journey-copy">
            <h1 id="journey-instrument-title">
              Your hands.
              <br />
              Your first sound.
            </h1>
            <p>
              Start with the instrument in your lap. Learn its strings, make a
              clear note, and carry a few careful movements into music.
            </p>
            <div className="journey-actions">
              <button className="journey-primary" onClick={() => onPractice()}>
                {hasHistory ? "Continue practice" : "Start practising"}{" "}
                <ArrowRight size={18} />
              </button>
              <button className="journey-text-action" onClick={onFoundations}>
                Build your foundations <BookOpen size={17} />
              </button>
            </div>
            <div className="journey-small-exercise">
              <b>Try it now</b>
              <p>
                Rest the guitar securely. Let your shoulders drop. The neck hand
                supports the fingers; it does not need to hold the guitar’s
                weight.
              </p>
              <button onClick={() => onPractice("setup-posture")}>
                Find a comfortable hold <ChevronRight size={15} />
              </button>
            </div>
            <button className="journey-scroll-prompt" onClick={() => goTo(1)}>
              <ArrowDown size={17} />
              Scroll to explore the same guitar
            </button>
          </div>
        </section>
        <section
          className="journey-chapter"
          id="journey-strings"
          data-chapter-index="1"
          aria-labelledby="journey-strings-title"
        >
          <div className="journey-copy">
            <h2 id="journey-strings-title">
              Six strings.
              <br />
              Six starting points.
            </h2>
            <p>
              From thick to thin: low E, A, D, G, B, high e. String numbers go
              the other way: the thin high e is string 1.
            </p>
            <div
              className="journey-string-controls"
              aria-label="Hear each open string"
            >
              {openStringStudy.map((s, i) => (
                <button
                  key={s.number}
                  onClick={() => hearString(i)}
                  aria-label={`Hear string ${s.number}, ${s.name}, ${s.pitch}`}
                  aria-pressed={activeString === i}
                >
                  <small>{s.number}</small>
                  <b>{s.name}</b>
                  <Volume2 size={14} />
                </button>
              ))}
            </div>
            <p className="journey-audio-caption">
              Synthesized reference tones. Sound starts only when you press a
              button or pluck the model.
            </p>
            <div className="journey-small-exercise">
              <b>Your turn</b>
              <p>
                Point to each string on your guitar. Name it before you pluck
                it. Then trace that same string to its tuning peg without
                turning the peg yet.
              </p>
            </div>
            <button
              className="journey-primary"
              onClick={() => onPractice("setup-strings")}
            >
              Practise strings & tuning <ArrowRight size={18} />
            </button>
          </div>
        </section>
        <section
          className="journey-chapter"
          id="journey-clear-note"
          data-chapter-index="2"
          aria-labelledby="journey-clear-note-title"
        >
          <div className="journey-copy">
            <h2 id="journey-clear-note-title">
              One fingertip.
              <br />
              One clear note.
            </h2>
            <p>
              Put your index on the thin high e string at fret 1, just behind
              the metal wire. Pluck gently. Listen before adding pressure.
            </p>
            <ol className="journey-physical-steps">
              <li>Curve the fingertip so its side clears the next string.</li>
              <li>
                Move close behind the fret. Use only enough pressure for a clean
                note.
              </li>
              <li>Release your hand and build the same note again.</li>
            </ol>
            <div className="journey-actions">
              <button
                className="journey-primary"
                onClick={() => onPractice("setup-fret")}
              >
                Make a clean note <ArrowRight size={18} />
              </button>
              <button className="journey-text-action" onClick={hearNote}>
                <Volume2 size={17} />
                Hear high e, fret 1
              </button>
            </div>
            <p className="journey-footnote">
              A dull note can come from position or a neighbouring fingertip.
              Check those before squeezing harder.
            </p>
          </div>
        </section>
        <section
          className="journey-chapter journey-anchor-chapter"
          id="journey-anchors"
          data-chapter-index="3"
          aria-labelledby="journey-anchors-title"
        >
          <div className="journey-copy">
            <h2 id="journey-anchors-title">
              Keep what stays.
              <br />
              Move what changes.
            </h2>
            <p>
              For C ↔ Am, keep index on B1 and middle on D2. Only the ring
              finger travels: A3 ↔ G2.
            </p>
            <figure className="journey-chord-study">
              <div>
                <button
                  onClick={() => hearShape("C")}
                  aria-label="Hear C major"
                >
                  <b>C</b>
                  <Volume2 size={14} />
                </button>
                <ChordDiagram chord={getChord("C")} />
              </div>
              <ArrowRight className="journey-chord-arrow" size={22} />
              <div>
                <button
                  onClick={() => hearShape("Am")}
                  aria-label="Hear A minor"
                >
                  <b>Am</b>
                  <Volume2 size={14} />
                </button>
                <ChordDiagram chord={getChord("Am")} />
              </div>
              <figcaption>
                1 index stays at B1 · 2 middle stays at D2
                <br />3 ring lifts across strings, then presses at its
                destination.
              </figcaption>
            </figure>
            <div className="journey-actions">
              <button
                className="journey-primary"
                onClick={() => onPractice("C-Am")}
              >
                Learn this exact change <ArrowRight size={18} />
              </button>
              <button className="journey-text-action" onClick={onReference}>
                All changes in one view
              </button>
            </div>
          </div>
        </section>
        <section
          className="journey-chapter"
          id="journey-pulse"
          data-chapter-index="4"
          aria-labelledby="journey-pulse-title"
        >
          <div className="journey-copy">
            <h2 id="journey-pulse-title">
              Let the space
              <br />
              between notes stay even.
            </h2>
            <p>
              Hold one comfortable chord. Count 1, 2, 3, 4 and brush down on
              each number. Keep counting through an imperfect stroke.
            </p>
            <div
              className="journey-four-beats"
              aria-label="Four steady beats at 60 BPM"
            >
              {[1, 2, 3, 4].map((beat, i) => (
                <span key={beat} className={pulse === i ? "is-sounding" : ""}>
                  {beat}
                </span>
              ))}
            </div>
            <div className="journey-actions">
              <button
                className="journey-primary"
                onClick={() => onPractice("pulse-four")}
              >
                Practise a steady pulse <ArrowRight size={18} />
              </button>
              <button
                className="journey-text-action"
                onClick={startPulse}
                aria-pressed={pulse !== null}
              >
                {pulse === null ? <Volume2 size={17} /> : <Pause size={17} />}{" "}
                {pulse === null ? "Hear four beats" : "Stop the beat"}
              </button>
            </div>
            <p className="journey-footnote">
              The example is 60 BPM. Choose a slower practice tempo whenever you
              need more time to prepare a movement.
            </p>
          </div>
        </section>
        <section
          className="journey-chapter journey-closing"
          id="journey-music"
          data-chapter-index="5"
          aria-labelledby="journey-music-title"
        >
          <div className="journey-copy">
            <h2 id="journey-music-title">
              Now give those
              <br />
              movements a little music.
            </h2>
            <p>
              Play four gentle downstrokes on C. Move only the ring finger for
              Am, then play four more. Return to C and keep the count going.
            </p>
            <div className="journey-connect-line">
              <span>C</span>
              <b>1 · 2 · 3 · 4</b>
              <ArrowRight size={19} />
              <span>Am</span>
              <b>1 · 2 · 3 · 4</b>
            </div>
            <p>
              Some sessions are for comfortable posture. Some are for clear
              notes, accurate changes, or time. A stronger foundation uses them
              all.
            </p>
            <div className="journey-actions">
              <button
                className="journey-primary"
                onClick={() => onPractice("C-Am")}
              >
                Take this into practice <ArrowRight size={18} />
              </button>
              <button className="journey-text-action" onClick={onFoundations}>
                Choose another foundation <BookOpen size={17} />
              </button>
            </div>
            <p className="journey-footnote">
              These are practice exercises, not a performance test. Listen,
              adjust one detail, and try again.
            </p>
          </div>
        </section>
      </div>
      <p className="journey-sound-status" role="status" aria-live="polite">
        {soundStatus}
      </p>
    </article>
  );
}
export default GuitarJourney;
