import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Download,
  Expand,
  Guitar,
  Music2,
  Play,
  SlidersHorizontal,
  Volume2,
  X,
} from "lucide-react";
import {
  changes,
  chordLabel,
  fingerPosition,
  workshopChord,
  smallF,
} from "./lesson7";
import {
  anchorSummary,
  buildChangeImage,
  buildChangeSheet,
  fingerRoute,
  movementOrder,
} from "./changeAtlasSvg";
import { chords, openMidi, type Chord } from "./course";
import { ChordDiagram } from "./visuals";
import { Fretboard } from "./Tools";
import { getAudio, tone } from "./sound";
import "./reference-room.css";

type ReferenceTool = "tuning" | "rhythm" | "fretboard" | "chords";
type Props = {
  onStudy: (changeId: string) => void;
  onGuide: (lesson: number, focus?: string) => void;
  onTool: (tool: ReferenceTool) => void;
};
const referenceChords = chords.flatMap((chord) =>
  chord.name === "F" ? [smallF, chord] : [chord],
);
function hearShape(chord: Chord) {
  const audio = getAudio();
  chord.frets.forEach((f, i) => {
    if (f >= 0)
      tone(openMidi[i] + f, audio.currentTime + i * 0.025, 1.4, 0.065);
  });
}
const thumbnails = changes.map((c, i) => ({
  change: c,
  src:
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(buildChangeImage(c, i, false)),
}));
const download = (svg: string, name: string) => {
  const url = URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const fingerNames = ["", "Index", "Middle", "Ring", "Little"];
export function ReferenceRoom({ onStudy, onGuide, onTool }: Props) {
  const [mode, setMode] = useState<"changes" | "shapes" | "notes">("changes"),
    [selectedId, setSelectedId] = useState("C-Am"),
    [selectedChord, setSelectedChord] = useState("C"),
    [enlarged, setEnlarged] = useState(false);
  const selected =
      thumbnails.find((t) => t.change.id === selectedId) ?? thumbnails[0],
    c = selected.change,
    shape =
      referenceChords.find((s) => s.name === selectedChord) ??
      referenceChords[0];
  const source = workshopChord(c.from),
    target = workshopChord(c.to),
    dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (enlarged && !dialog.current?.open) dialog.current?.showModal();
    else if (!enlarged && dialog.current?.open) dialog.current.close();
  }, [enlarged]);
  return (
    <section className="room-reference" aria-label="Guitar reference room">
      <div className="room-reference-toolbar">
        <div
          className="room-reference-modes"
          role="group"
          aria-label="Reference type"
        >
          {(
            [
              { id: "changes", label: "Chord changes" },
              { id: "shapes", label: "Chord shapes" },
              { id: "notes", label: "Notes & theory" },
            ] as const
          ).map((t) => (
            <button
              aria-pressed={mode === t.id}
              className={mode === t.id ? "is-active" : ""}
              key={t.id}
              onClick={() => setMode(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="room-reference-tools">
          <button onClick={() => onTool("tuning")}>
            <Guitar size={14} />
            Tune
          </button>
          <button onClick={() => onTool("rhythm")}>
            <Music2 size={14} />
            Rhythm
          </button>
        </div>
      </div>
      {mode === "changes" && (
        <div className="room-reference-layout">
          <div className="room-reference-board">
            <div className="room-board-heading">
              <div>
                <h2>Every change, right here.</h2>
                <p>Select an image. The whole board stays beside you.</p>
              </div>
              <button
                className="room-download-sheet"
                onClick={() =>
                  download(buildChangeSheet(), "Six-Strings-All-15-Changes.svg")
                }
              >
                <Download size={14} />
                Save all 15
              </button>
            </div>
            <div
              className="room-change-board"
              aria-label="All 15 chord changes"
            >
              {thumbnails.map(({ change, src }, i) => (
                <button
                  key={change.id}
                  className={
                    "room-change-tile " +
                    (change.id === c.id ? "is-selected" : "")
                  }
                  onClick={() => setSelectedId(change.id)}
                  aria-pressed={change.id === c.id}
                  aria-label={`Refer to ${chordLabel(change.from)} to ${chordLabel(change.to)} finger change`}
                >
                  <span>
                    <small>{String(i + 1).padStart(2, "0")}</small>
                    <b>
                      {chordLabel(change.from)} ↔ {chordLabel(change.to)}
                    </b>
                    {change.id === c.id && <Check size={11} />}
                  </span>
                  <img
                    src={src}
                    alt={`${chordLabel(change.from)} to ${chordLabel(change.to)} complete start, finger-movement and finish diagram`}
                  />
                </button>
              ))}
            </div>
            <div className="room-reference-legend">
              <span>
                <i className="room-dot-anchor" />
                Keep down
              </span>
              <span>
                <i className="room-dot-slide" />
                Light-contact slide
              </span>
              <span>
                <i className="room-dot-move" />
                Lift, then move
              </span>
            </div>
            <div className="room-reference-key">
              <b>Read the diagram</b>
              <span>Thick low E on the left · thin high e on the right</span>
              <span>1 index · 2 middle · 3 ring · ○ open · × skip</span>
            </div>
            <div className="room-board-practice">
              <div>
                <b>Know the shapes? Connect them.</b>
                <p>
                  Keep a steady count. Play four downstrokes per chord, then
                  change on the next 1.
                </p>
              </div>
              <button onClick={() => onTool("rhythm")}>
                Practise with a beat <ArrowRight size={15} />
              </button>
            </div>
            <p className="room-small-f-note">
              F (small) uses the B1/e1 mini-barre. Fmaj7 leaves high e open. The
              reference keeps their finger routes separate.
            </p>
          </div>
          <aside
            className="room-change-inspector"
            aria-label="Selected change details"
          >
            <div className="room-inspector-heading">
              <div>
                <span>YOUR SELECTED CHANGE</span>
                <h2>
                  {chordLabel(c.from)} <span>→</span> {chordLabel(c.to)}
                </h2>
              </div>
              <button
                aria-label="Enlarge selected change image"
                className="room-icon-button"
                onClick={() => setEnlarged(true)}
              >
                <Expand size={18} />
              </button>
            </div>
            <button
              className="room-inspector-image"
              onClick={() => setEnlarged(true)}
              aria-label={`Enlarge ${chordLabel(c.from)} to ${chordLabel(c.to)} image`}
            >
              <img
                src={selected.src}
                alt={`${chordLabel(c.from)} to ${chordLabel(c.to)} finger movement at a larger size`}
              />
            </button>
            <p className="room-selected-focus">{c.focus}</p>
            <div
              className={
                "room-contact-rule " + (c.slide?.length ? "is-slide" : "")
              }
            >
              <b>{anchorSummary(c)}</b>
              <p>{c.stay}</p>
            </div>
            <div className="room-pressure-rule">
              <b>Release pressure before moving</b>
              <p>{c.release}</p>
            </div>
            <div className="room-finger-routes">
              {[1, 2, 3, 4]
                .filter(
                  (f) => fingerPosition(source, f) || fingerPosition(target, f),
                )
                .map((f) => (
                  <div key={f}>
                    <span>
                      {f} · {fingerNames[f]}
                    </span>
                    <b>{fingerRoute(c, f).replace(/^\d: /, "")}</b>
                  </div>
                ))}
            </div>
            <div className="room-move-order">
              <span>
                Forward <b>{movementOrder(c)}</b>
              </span>
              <span>
                Return <b>{movementOrder(c, true)}</b>
              </span>
            </div>
            <button className="room-watch-change" onClick={() => onStudy(c.id)}>
              <Play size={15} fill="currentColor" />
              See the movement & practise <ArrowRight size={16} />
            </button>
            <div className="room-inspector-secondary">
              <button
                onClick={() =>
                  download(buildChangeImage(c), `Six-Strings-${c.id}.svg`)
                }
              >
                <Download size={13} />
                Save image
              </button>
              <button onClick={() => onGuide(7, c.id)}>
                <BookOpen size={13} />
                Full finger guide
              </button>
            </div>
          </aside>
        </div>
      )}
      {mode === "shapes" && (
        <div className="room-reference-layout">
          <div className="room-reference-board">
            <div className="room-board-heading">
              <div>
                <h2>Find a chord shape.</h2>
                <p>
                  Choose a shape to see its finger placement and starting
                  string.
                </p>
              </div>
              <button
                className="room-download-sheet"
                onClick={() => onTool("chords")}
              >
                Open chord tools <ArrowRight size={14} />
              </button>
            </div>
            <div className="room-shape-board">
              {referenceChords.map((chord) => (
                <button
                  className={selectedChord === chord.name ? "is-selected" : ""}
                  key={chord.name}
                  aria-pressed={selectedChord === chord.name}
                  onClick={() => setSelectedChord(chord.name)}
                >
                  <b>{chord.name}</b>
                  <ChordDiagram chord={chord} />
                </button>
              ))}
            </div>
          </div>
          <aside className="room-change-inspector room-shape-inspector">
            <div className="room-inspector-heading">
              <div>
                <span>FINGER PLACEMENT</span>
                <h2>{shape.name}</h2>
              </div>
              <button
                className="room-icon-button"
                aria-label={`Hear ${shape.name} reference tone`}
                onClick={() => hearShape(shape)}
              >
                <Volume2 size={19} />
              </button>
            </div>
            <div className="room-big-shape">
              <ChordDiagram chord={shape} interactive />
            </div>
            <p className="room-selected-focus">{shape.tip}</p>
            <div className="room-pressure-rule">
              <b>Check the strings individually</b>
              <p>
                Pluck each intended string once before strumming. Fix the dull
                note, then use the lightest pressure that gives a clear sound.
              </p>
            </div>
            <button
              className="room-watch-change"
              onClick={() => hearShape(shape)}
            >
              <Volume2 size={16} />
              Hear the reference chord
            </button>
            <button
              className="room-guide-link"
              onClick={() =>
                onGuide(shape.name === smallF.name ? 4 : shape.barre ? 9 : 3)
              }
            >
              <BookOpen size={14} />
              Help me build this shape <ArrowRight size={14} />
            </button>
          </aside>
        </div>
      )}
      {mode === "notes" && (
        <div className="room-notes-workspace">
          <div className="room-note-explorer">
            <Fretboard />
          </div>
          <aside className="room-theory-prompts">
            <h2>Make the neck make sense.</h2>
            <p>
              Find a note first. Use these explanations when you need the reason
              behind the shape.
            </p>
            {[
              {
                title: "Why one fret changes the note",
                detail: "Half steps, whole steps and the natural letters.",
                lesson: 5,
              },
              {
                title: "What sharp and flat mean",
                detail: "Two names can point to the same fret.",
                lesson: 6,
              },
              {
                title: "How a whole chord moves",
                detail: "Root strings and movable barre families.",
                lesson: 9,
              },
            ].map((item) => (
              <button key={item.lesson} onClick={() => onGuide(item.lesson)}>
                <span>
                  <b>{item.title}</b>
                  <small>{item.detail}</small>
                </span>
                <ArrowRight size={16} />
              </button>
            ))}
            <button
              className="room-notes-tool"
              onClick={() => onTool("fretboard")}
            >
              <SlidersHorizontal size={15} />
              Open fretboard tools
            </button>
          </aside>
        </div>
      )}
      <dialog
        ref={dialog}
        className="room-image-dialog"
        onCancel={() => setEnlarged(false)}
        onClose={() => setEnlarged(false)}
      >
        <div className="room-dialog-toolbar">
          <b>
            {chordLabel(c.from)} → {chordLabel(c.to)} · complete reference
          </b>
          <button
            className="room-icon-button"
            aria-label="Close enlarged image"
            onClick={() => setEnlarged(false)}
          >
            <X size={21} />
          </button>
        </div>
        <img
          src={
            "data:image/svg+xml;charset=utf-8," +
            encodeURIComponent(buildChangeImage(c))
          }
          alt={`${chordLabel(c.from)} to ${chordLabel(c.to)} complete diagram and pressure instructions`}
        />
        <button
          className="room-download-sheet"
          onClick={() =>
            download(buildChangeImage(c), `Six-Strings-${c.id}.svg`)
          }
        >
          <Download size={14} />
          Save this complete image
        </button>
      </dialog>
    </section>
  );
}
