import { useEffect, useRef, useState } from "react";
import { ArrowRight, Download, Expand, Printer, X } from "lucide-react";
import { changes, chordLabel, type Change } from "./lesson7";
import {
  anchorSummary,
  buildChangeImage,
  buildChangeSheet,
  movementOrder,
} from "./changeAtlasSvg";
import "./change-atlas.css";
const imageUrl = (c: Change) =>
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    buildChangeImage(
      c,
      changes.findIndex((x) => x.id === c.id),
      false,
    ),
  );
function saveImage(svg: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function ChangeAtlas({
  onStudy,
}: {
  onStudy: (changeId: string) => void;
}) {
  const [density, setDensity] = useState<"comfortable" | "compact">(
      "comfortable",
    ),
    [zoom, setZoom] = useState<Change | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (zoom && !dialog.current?.open) dialog.current?.showModal();
    else if (!zoom && dialog.current?.open) dialog.current.close();
  }, [zoom]);
  return (
    <section
      className="change-atlas"
      aria-label="All chord changes visual reference"
    >
      <div className="atlas-heading">
        <div>
          <div className="eyebrow">KEEP BESIDE YOUR GUITAR</div>
          <h1>Your chord-change reference.</h1>
          <p>
            All 15 routes together. Open any image to check the fingers, then
            get back to playing.
          </p>
        </div>
        <div className="atlas-actions">
          <button
            className="secondary"
            onClick={() =>
              saveImage(buildChangeSheet(), "Six-Strings-All-15-Changes.svg")
            }
          >
            <Download size={16} />
            Save all 15 as one image
          </button>
          <button className="text-button" onClick={() => window.print()}>
            <Printer size={15} />
            Print reference
          </button>
        </div>
      </div>
      <div className="atlas-legend">
        <span>
          <i className="atlas-dot anchor" />
          Keep pressed in the same place
        </span>
        <span>
          <i className="atlas-dot slide" />
          Slide with light contact, pressure off
        </span>
        <span>
          <i className="atlas-dot lift" />
          Lift to cross strings
        </span>
      </div>
      <div className="atlas-overview">
        <div className="atlas-overview-top">
          <b>
            All 15 at a glance <small>· click to enlarge</small>
          </b>
          <label>
            Card size
            <select
              aria-label="Reference card size"
              value={density}
              onChange={(e) => setDensity(e.target.value as typeof density)}
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </label>
        </div>
        <nav aria-label="All 15 chord-change images">
          {changes.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setZoom(c)}
              aria-label={`Enlarge overview image ${chordLabel(c.from)} to ${chordLabel(c.to)}`}
            >
              <span className="atlas-tile-name">
                <small>{String(i + 1).padStart(2, "0")}</small>
                <b>
                  {chordLabel(c.from)} ↔ {chordLabel(c.to)}
                </b>
              </span>
              <img
                src={imageUrl(c)}
                alt={`${chordLabel(c.from)} to ${chordLabel(c.to)} start, movement and finish thumbnail`}
              />
            </button>
          ))}
        </nav>
      </div>
      <p className="atlas-reading">
        Front view: thick low <b>E</b> at left, thin high <b>e</b> at right.{" "}
        <b>1</b> index · <b>2</b> middle · <b>3</b> ring. Small F has a B1/e1
        mini-barre; Fmaj7 leaves high e open.
      </p>
      <div className={`atlas-grid ${density}`}>
        {changes.map((c, i) => (
          <article className="atlas-card" id={`atlas-${c.id}`} key={c.id}>
            <div className="atlas-card-title">
              <div>
                <small>CHANGE {String(i + 1).padStart(2, "0")}</small>
                <h2>
                  {chordLabel(c.from)} ↔ {chordLabel(c.to)}
                </h2>
              </div>
              <button
                className="icon-button"
                aria-label={`Enlarge ${chordLabel(c.from)} to ${chordLabel(c.to)} reference image`}
                onClick={() => setZoom(c)}
              >
                <Expand size={17} />
              </button>
            </div>
            <button
              className="atlas-image-button"
              onClick={() => setZoom(c)}
              aria-label={`View complete ${chordLabel(c.from)} to ${chordLabel(c.to)} image`}
            >
              <img
                src={imageUrl(c)}
                alt={`${chordLabel(c.from)} to ${chordLabel(c.to)}: start diagram, finger movement arrows and target diagram. ${c.focus}`}
                loading="lazy"
              />
            </button>
            <div
              className={`atlas-anchor ${c.slide?.length ? "has-slide" : ""}`}
            >
              {anchorSummary(c)}
            </div>
            <p className="atlas-focus">{c.focus}</p>
            <div className="atlas-order">
              <span>
                Forward groups <b>{movementOrder(c)}</b>
              </span>
              <span>
                Return groups <b>{movementOrder(c, true)}</b>
              </span>
            </div>
            <details className="atlas-reminder">
              <summary>Pressure & contact reminder</summary>
              <p>{c.stay}</p>
              <p>{c.release}</p>
              <p>
                <b>Avoid:</b> {c.trap}
              </p>
            </details>
            <button
              className="text-button atlas-study"
              onClick={() => onStudy(c.id)}
            >
              Learn / practise this change <ArrowRight size={15} />
            </button>
          </article>
        ))}
      </div>
      <p className="atlas-footnote">
        The diagrams preserve the original finger routes. A “reference” finger
        can move; only green stationary anchors stay pressed in one place. Learn
        both directions, then connect the changes with a steady beat.
      </p>
      <dialog
        className="atlas-zoom"
        ref={dialog}
        onCancel={() => setZoom(null)}
        onClose={() => setZoom(null)}
      >
        {zoom && (
          <>
            <div className="atlas-zoom-heading">
              <h2>
                {chordLabel(zoom.from)} ↔ {chordLabel(zoom.to)}
              </h2>
              <button
                className="icon-button"
                aria-label="Close enlarged reference"
                onClick={() => setZoom(null)}
              >
                <X size={22} />
              </button>
            </div>
            <img
              src={imageUrl(zoom)}
              alt={`Complete ${chordLabel(zoom.from)} to ${chordLabel(zoom.to)} finger-change image`}
            />
            <p className="atlas-anchor">{anchorSummary(zoom)}</p>
            <p>{zoom.focus}</p>
            <p>{zoom.release}</p>
            <div className="button-row">
              <button
                className="secondary"
                onClick={() =>
                  saveImage(
                    buildChangeImage(zoom),
                    `Six-Strings-${zoom.id}.svg`,
                  )
                }
              >
                <Download size={15} />
                Save this image
              </button>
              <button
                className="primary"
                onClick={() => {
                  setZoom(null);
                  onStudy(zoom.id);
                }}
              >
                Practise this change <ArrowRight size={15} />
              </button>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
