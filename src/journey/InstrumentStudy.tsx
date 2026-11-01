import { Pause, Play, Plus, Save, Volume2 } from "lucide-react";
import { getChord } from "../course";
import { ChordDiagram } from "../visuals";
import {
  resolveStudyChord,
  resolveStudyNote,
  type StudyNote,
} from "../world/fretStudy";
import { openStringStudy } from "./journeySpec";
import type { useJourneyPractice } from "./useJourneyPractice";
import "./instrument-study.css";

export function NoteStudy({
  note,
  onChange,
  onHear,
}: {
  note: StudyNote;
  onChange: (note: StudyNote) => void;
  onHear: () => void;
}) {
  const resolved = resolveStudyNote(note)!;
  return (
    <div className="instrument-study note-study">
      <h3>Find a note on the same guitar.</h3>
      <p>
        Choose a string and fret. The marker on the 3D neck follows your
        selection. This holds the fretboard view; use Resume scroll view when
        you want the camera journey back.
      </p>
      <div
        className="study-string-choices"
        role="group"
        aria-label="String for note study"
      >
        {openStringStudy.map((s, i) => (
          <button
            key={s.number}
            aria-pressed={note.stringIndex === i}
            onClick={() => onChange({ ...note, stringIndex: i })}
          >
            <small>{s.number}</small>
            <b>{s.name}</b>
          </button>
        ))}
      </div>
      <div
        className="study-fret-choices"
        role="group"
        aria-label="Fret for note study"
      >
        {[0, 1, 2, 3, 4].map((fret) => (
          <button
            key={fret}
            aria-pressed={note.fret === fret}
            onClick={() => onChange({ ...note, fret })}
          >
            {fret === 0 ? "Open" : `Fret ${fret}`}
          </button>
        ))}
      </div>
      <div className="study-note-result">
        <strong>{resolved.pitch}</strong>
        <span>
          {openStringStudy[note.stringIndex].name} ·{" "}
          {resolved.open ? "open string" : `fret ${note.fret}`}
        </span>
        <button onClick={onHear}>
          <Volume2 size={15} /> Hear note
        </button>
      </div>
      <p className="study-physical-cue">
        {resolved.open
          ? "Leave this string unpressed and pluck it. Compare it with fret 1 on the same string."
          : "Place a fingertip just behind the selected fret wire. Pluck, listen, relax, and build the same note again."}
      </p>
    </div>
  );
}

export function ChordStudy({
  name,
  onChange,
  onHear,
}: {
  name: string;
  onChange: (name: string) => void;
  onHear: () => void;
}) {
  const chord = getChord(name),
    resolved = resolveStudyChord(name)!;
  return (
    <div className="instrument-study chord-study">
      <h3>Build a shape on the 3D neck.</h3>
      <div
        className="study-chord-choices"
        role="group"
        aria-label="Open chord to study"
      >
        {["C", "Am", "Em", "E", "D", "A", "G"].map((chordName) => (
          <button
            key={chordName}
            aria-pressed={name === chordName}
            onClick={() => onChange(chordName)}
          >
            {chordName}
          </button>
        ))}
      </div>
      <div className="study-chord-detail">
        <ChordDiagram chord={chord} />
        <div>
          <h4>{name} · finger positions</h4>
          <ul>
            {resolved.fingers.map((f) => (
              <li key={f.finger}>
                <b>{f.finger}</b>{" "}
                {["", "Index", "Middle", "Ring", "Little"][f.finger]} ·{" "}
                {openStringStudy[f.stringIndex].name}, fret {f.fret}
              </li>
            ))}
          </ul>
          <button onClick={onHear}>
            <Volume2 size={15} /> Hear {name}
          </button>
        </div>
      </div>
      <p className="study-physical-cue">{chord.tip}</p>
      <p className="study-physical-cue">
        {name === "C" || name === "Am"
          ? "Compare C and Am: keep index on B1 and middle on D2; ring alone travels A3 ↔ G2."
          : "Place the whole shape, then check each played string separately. Leave strings marked with a cross out of your strum."}
      </p>
    </div>
  );
}

export function JourneyPracticeBar({
  practice,
  active,
  suspended,
  onFocus,
}: {
  practice: ReturnType<typeof useJourneyPractice>;
  active: boolean;
  suspended: boolean;
  onFocus: () => void;
}) {
  if (!active)
    return (
      <div className="journey-practice-entry">
        <button onClick={onFocus}>
          <Play size={15} /> Practise with this guitar view
        </button>
      </div>
    );
  return (
    <div
      className="journey-inline-practice"
      aria-label="Practice in this guitar view"
    >
      <div className="journey-practice-main">
        <button
          disabled={suspended}
          onClick={() => {
            if (practice.running) practice.pause();
            else {
              onFocus();
              practice.start();
            }
          }}
        >
          {practice.running ? <Pause size={15} /> : <Play size={15} />}{" "}
          {practice.running ? "Pause" : "Start practice"}
        </button>
        <strong>
          {Math.floor(practice.seconds / 60)}:
          {String(practice.seconds % 60).padStart(2, "0")}
        </strong>
        <button
          disabled={!practice.running || suspended}
          onClick={practice.addRep}
        >
          <Plus size={14} /> Clean rep · {practice.reps}
        </button>
      </div>
      <label>
        How did it feel?
        <select
          value={practice.assessment}
          onChange={(e) =>
            practice.setAssessment(e.target.value as typeof practice.assessment)
          }
        >
          <option value="unrated">Choose when ready</option>
          <option value="needs-work">Needs another try</option>
          <option value="comfortable">Felt comfortable</option>
        </select>
      </label>
      <div className="journey-practice-save">
        <button disabled={!practice.canSave} onClick={practice.save}>
          <Save size={14} />{" "}
          {practice.saved
            ? "Saved"
            : `Save ${practice.pendingSeconds}s practice`}
        </button>
        <span>
          {practice.canSave
            ? "Save before leaving Explore."
            : "Time counts only after you press Start."}
        </span>
      </div>
      {practice.saveStatus === "error" && (
        <p role="alert">
          Practice could not be saved. Your timed draft is still here; try Save
          again.
        </p>
      )}
      <p>Clean repetitions and comfort are your own assessment.</p>
    </div>
  );
}
