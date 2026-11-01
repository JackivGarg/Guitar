import { useEffect, useMemo, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { Sequence, useVideoConfig } from "remotion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Play,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { ChangeDemo } from "../ChangeDemo";
import {
  CHANGE_FPS,
  changeDurationFrames,
  type ChangeDirection,
} from "../changeTiming";
import { buildChangeImage } from "../changeAtlasSvg";
import { changes, chordLabel, workshopChord } from "../lesson7";
import { openMidi } from "../course";
import { getAudio, tone } from "../sound";
import {
  changeInDirection,
  changeWorkshopGroups,
  groupDirection,
  workshopMotionCues,
  workshopSelection,
  type WorkshopDirection,
} from "./changeWorkshop";
import "./changes-workshop.css";

export type ChangesWorkshopProps = {
  onPractice: (id: string) => void;
  onGuide: (id: number, focus?: string) => void;
  initialGroup?: number;
  initialChange?: string;
  suspended?: boolean;
};
type MotionRequest = { kind: "play" | "seek"; frame: number; serial: number };
function WorkshopMotion({
  changeId,
  direction,
  firstDirection,
}: {
  changeId: string;
  direction: ChangeDirection;
  firstDirection: WorkshopDirection;
}) {
  const { fps } = useVideoConfig();
  if (direction !== "both" || firstDirection === "forward")
    return <ChangeDemo changeId={changeId} direction={direction} />;
  return (
    <>
      <Sequence durationInFrames={3 * fps} premountFor={fps}>
        <ChangeDemo changeId={changeId} direction="back" />
      </Sequence>
      <Sequence from={3 * fps} durationInFrames={3 * fps} premountFor={fps}>
        <ChangeDemo changeId={changeId} direction="forward" />
      </Sequence>
    </>
  );
}
function hear(name: string) {
  const chord = workshopChord(name),
    a = getAudio();
  chord.frets.forEach((f, i) => {
    if (f >= 0) tone(openMidi[i] + f, a.currentTime + i * 0.022, 1.3, 0.06);
  });
}
const two = (n: number) => String(n).padStart(2, "0");
export function ChangesWorkshop({
  onPractice,
  onGuide,
  initialGroup,
  initialChange,
  suspended = false,
}: ChangesWorkshopProps) {
  const [selection, setSelection] = useState(() =>
    workshopSelection(initialGroup, initialChange),
  );
  const { block, change } = selection;
  const [direction, setDirection] = useState<ChangeDirection>(
      selection.direction,
    ),
    [speed, setSpeed] = useState(1),
    [motion, setMotion] = useState(false),
    [request, setRequest] = useState<MotionRequest>({
      kind: "seek",
      frame: 0,
      serial: 0,
    }),
    [activeCue, setActiveCue] = useState("shape");
  const player = useRef<PlayerRef>(null),
    focus = useRef<HTMLHeadingElement>(null);
  const firstDirection = groupDirection(block, change);
  const displayedDirection: WorkshopDirection =
    direction === "both" ? firstDirection : direction;
  const image = useMemo(
    () =>
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(
        buildChangeImage(
          changeInDirection(change, displayedDirection),
          changes.findIndex((c) => c.id === change.id),
          false,
        ),
      ),
    [change, displayedDirection],
  );
  const cues = workshopMotionCues(change, direction, firstDirection);
  const directionLabel = (d: WorkshopDirection) =>
    d === "forward"
      ? `${chordLabel(change.from)} → ${chordLabel(change.to)}`
      : `${chordLabel(change.to)} → ${chordLabel(change.from)}`;
  useEffect(() => {
    const next = workshopSelection(initialGroup, initialChange);
    setSelection(next);
    setDirection(next.direction);
    setMotion(false);
    setActiveCue("shape");
  }, [initialGroup, initialChange]);
  useEffect(() => {
    if (!motion || !player.current) return;
    if (request.kind === "seek") {
      player.current.pause();
      player.current.seekTo(request.frame);
    } else {
      player.current.seekTo(0);
      player.current.play();
    }
  }, [motion, request]);
  useEffect(() => {
    if (suspended) player.current?.pause();
  }, [suspended]);
  useEffect(() => {
    const pause = () => {
      if (document.hidden) player.current?.pause();
    };
    document.addEventListener("visibilitychange", pause);
    return () => {
      document.removeEventListener("visibilitychange", pause);
    };
  }, []);
  const choose = (group: number, id?: string) => {
    player.current?.pause();
    const next = workshopSelection(group, id);
    setSelection(next);
    setDirection(next.direction);
    setMotion(false);
    setActiveCue("shape");
    history.replaceState(
      null,
      "",
      `#/changes?group=${next.block.id}&change=${encodeURIComponent(next.change.id)}`,
    );
    if (next.block.id !== block.id)
      requestAnimationFrame(() => {
        focus.current?.scrollIntoView({
          block: "start",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
        });
        focus.current?.focus({ preventScroll: true });
      });
  };
  const chooseDirection = (d: ChangeDirection) => {
    player.current?.pause();
    setDirection(d);
    setMotion(false);
    setActiveCue("shape");
  };
  const play = () => {
    setRequest((r) => ({ kind: "play", frame: 0, serial: r.serial + 1 }));
    setMotion(true);
    setActiveCue("");
  };
  const seek = (id: string, frame: number) => {
    setRequest((r) => ({ kind: "seek", frame, serial: r.serial + 1 }));
    setMotion(true);
    setActiveCue(id);
  };
  const guide = () => {
    player.current?.pause();
    onGuide(7, change.id);
  };
  const practise = () => {
    player.current?.pause();
    onPractice(change.id);
  };
  return (
    <div className="changes-workshop">
      <header className="changes-heading">
        <div>
          <h1>Your chord-change workshop.</h1>
          <p>
            Eleven connected exercise groups. Open a group, choose its
            variation, and keep the exact finger route beside your guitar.
          </p>
        </div>
        <button className="changes-primary" onClick={practise}>
          Practise this change
          <ArrowRight size={16} />
        </button>
      </header>
      <div className="changes-layout">
        <aside
          className="changes-group-navigation"
          aria-label="Eleven chord-change exercise groups"
        >
          <h2>Jump to an exercise</h2>
          <ol>
            {changeWorkshopGroups.map((b) => (
              <li key={b.id}>
                <button
                  className={block.id === b.id ? "selected" : ""}
                  aria-current={block.id === b.id ? "true" : undefined}
                  onClick={() => choose(b.id)}
                >
                  <span>{two(b.id)}</span>
                  <div>
                    <b>{b.title}</b>
                    <small>
                      {b.pairs.length}{" "}
                      {b.pairs.length === 1 ? "variation" : "variations"}
                    </small>
                  </div>
                  {block.id === b.id ? <ArrowRight size={14} /> : null}
                </button>
              </li>
            ))}
          </ol>
          <p>
            Every group stays open. You can learn individual changes first and
            connect them when you want.
          </p>
          <button
            className="changes-source-navigation"
            onClick={() => onGuide(7)}
          >
            Full source workshop
            <ExternalLink size={13} />
          </button>
        </aside>
        <div className="changes-current-group">
          <section className="changes-group-introduction">
            <div className="changes-group-top">
              <span>Exercise {two(block.id)} of 11</span>
              <div>
                <button
                  disabled={block.id === 1}
                  aria-label="Previous exercise group"
                  onClick={() => choose(block.id - 1)}
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  disabled={block.id === 11}
                  aria-label="Next exercise group"
                  onClick={() => choose(block.id + 1)}
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
            <h2 ref={focus} tabIndex={-1}>
              {block.title}
            </h2>
            <p className="changes-group-subtitle">{block.subtitle}</p>
            <div
              className="changes-group-sequence"
              aria-label="Complete exercise chord sequence"
            >
              {block.sequence.map((name, i) => (
                <span key={name + i}>
                  <button
                    onClick={() => hear(name)}
                    aria-label={`Hear ${chordLabel(name)} at position ${i + 1}`}
                  >
                    {chordLabel(name)}
                    <Volume2 size={11} />
                  </button>
                  {i < block.sequence.length - 1 ? (
                    <ArrowRight size={12} />
                  ) : null}
                </span>
              ))}
            </div>
            <p className="changes-block-instructions">{block.instructions}</p>
            <div className="changes-block-return">
              <b>Bring the whole exercise back</b>
              <p>{block.returnRoute}</p>
            </div>
          </section>
          <section
            className="changes-variation-picker"
            aria-label="Variations in the selected exercise group"
          >
            <h3>Variations in this group</h3>
            <div role="group" aria-label="Choose a chord-change variation">
              {block.pairs.map((id) => {
                const pair = changes.find((c) => c.id === id)!;
                const order = changeInDirection(
                  pair,
                  groupDirection(block, pair),
                );
                return (
                  <button
                    key={id}
                    className={change.id === id ? "selected" : ""}
                    aria-pressed={change.id === id}
                    onClick={() => choose(block.id, id)}
                  >
                    {chordLabel(order.from)}
                    <span>↔</span>
                    {chordLabel(order.to)}
                  </button>
                );
              })}
            </div>
          </section>
          <section
            className="changes-demonstration"
            aria-label="Selected finger movement"
          >
            <div className="changes-demo-heading">
              <div>
                <h3>{directionLabel(displayedDirection)}</h3>
                <p>
                  {displayedDirection === "back"
                    ? change.back[0]
                    : change.focus}
                </p>
              </div>
              <button className="changes-plain" onClick={guide}>
                Original explanation
                <ExternalLink size={12} />
              </button>
            </div>
            <div
              className="changes-direction-controls"
              role="group"
              aria-label="Movement direction"
            >
              <button
                className={direction === "forward" ? "selected" : ""}
                aria-pressed={direction === "forward"}
                onClick={() => chooseDirection("forward")}
              >
                {directionLabel("forward")}
              </button>
              <button
                className={direction === "back" ? "selected" : ""}
                aria-pressed={direction === "back"}
                onClick={() => chooseDirection("back")}
              >
                {directionLabel("back")}
              </button>
              <button
                className={direction === "both" ? "selected" : ""}
                aria-pressed={direction === "both"}
                onClick={() => chooseDirection("both")}
              >
                Round trip · {directionLabel(firstDirection)}
              </button>
            </div>
            <div className="changes-visual-surface">
              {motion ? (
                <Player
                  ref={player}
                  key={`${change.id}-${direction}-${firstDirection}`}
                  component={WorkshopMotion}
                  inputProps={{
                    changeId: change.id,
                    direction,
                    firstDirection,
                  }}
                  durationInFrames={changeDurationFrames(direction)}
                  fps={CHANGE_FPS}
                  compositionWidth={1200}
                  compositionHeight={850}
                  controls
                  autoPlay={false}
                  loop={false}
                  playbackRate={speed}
                  style={{ width: "100%" }}
                  showVolumeControls={false}
                />
              ) : (
                <img
                  src={image}
                  alt={`${directionLabel(displayedDirection)} complete finger route: starting shape, movement arrows and finished shape. Numbers identify fingers.`}
                />
              )}
            </div>
            <div className="changes-play-controls">
              <button className="changes-primary" onClick={play}>
                <Play size={15} />
                {motion
                  ? "Replay movement"
                  : `Watch ${direction === "both" ? "6" : "3"}-second movement`}
              </button>
              <button
                className="changes-plain"
                onClick={() => {
                  player.current?.pause();
                  setMotion(false);
                  setActiveCue("shape");
                }}
              >
                <RotateCcw size={13} />
                Complete still image
              </button>
              <label>
                Speed
                <select
                  aria-label="Chord-change animation speed"
                  value={speed}
                  onChange={(e) => setSpeed(+e.target.value)}
                >
                  <option value=".5">0.5× · study slowly</option>
                  <option value=".75">0.75×</option>
                  <option value="1">1× · quick reference</option>
                  <option value="1.25">1.25×</option>
                  <option value="1.5">1.5×</option>
                </select>
              </label>
              <span>
                {((direction === "both" ? 6 : 3) / speed).toFixed(1)} seconds at
                this speed
              </span>
            </div>
            <div
              className="changes-cue-controls"
              role="group"
              aria-label="Inspect a movement step"
            >
              <span>Look closely</span>
              {cues.map((cue) => (
                <button
                  key={cue.id}
                  className={activeCue === cue.id ? "selected" : ""}
                  aria-pressed={activeCue === cue.id}
                  onClick={() => seek(cue.id, cue.frame)}
                >
                  {cue.label}
                </button>
              ))}
            </div>
            <p className="changes-visual-legend">
              Green: stays pressed in the same place. Blue: light-contact guide,
              pressure released. An outlined moving finger is not pressing.
            </p>
          </section>
          <section
            className="changes-method"
            aria-label="Exact instructions for the selected variation"
          >
            <div className="changes-method-heading">
              <h3>The exact finger method</h3>
              <span>
                {chordLabel(change.from)} ↔ {chordLabel(change.to)}
              </span>
            </div>
            <div className="changes-method-rules">
              <div>
                <h4>Keep / reference</h4>
                <p>{change.stay}</p>
              </div>
              <div>
                <h4>
                  Release before {chordLabel(change.from)} →{" "}
                  {chordLabel(change.to)}
                </h4>
                <p>{change.release}</p>
              </div>
            </div>
            <div className="changes-both-routes">
              <section
                className={displayedDirection === "forward" ? "active" : ""}
              >
                <h4>{directionLabel("forward")}</h4>
                <ol>
                  {change.steps.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ol>
              </section>
              <section
                className={displayedDirection === "back" ? "active" : ""}
              >
                <h4>{directionLabel("back")}</h4>
                <ol>
                  {change.back.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ol>
              </section>
            </div>
            <div className="changes-method-finish">
              <div>
                <h4>One mistake to avoid</h4>
                <p>{change.trap}</p>
              </div>
              <div>
                <h4>
                  <Check size={14} />
                  Check it on your guitar
                </h4>
                <p>{change.check}</p>
              </div>
            </div>
            <div className="changes-practice-action">
              <p>
                Make the change, listen to the destination chord, then return.
                Add a steady strum when both directions feel familiar.
              </p>
              <button className="changes-primary" onClick={practise}>
                Practise {chordLabel(change.from)} ↔ {chordLabel(change.to)}
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
