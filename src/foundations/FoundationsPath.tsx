import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import type { Progress } from "../state";
import { dayKey } from "../state";
import { deskUnit } from "../deskCurriculum";
import {
  foundationChecked,
  foundationCheckpointKey,
  foundationChecks,
  foundationRating,
  foundationReviewKey,
  foundationReviews,
  foundationsPlan,
  markFoundationCheckpoint,
  markFoundationReview,
  recommendFoundation,
  type FoundationCheck,
} from "./foundationsPlan";
import "./foundations.css";

export type FoundationsPathProps = {
  progress: Progress;
  setProgress: (value: Progress | ((p: Progress) => Progress)) => void;
  onPractice: (unit: string) => void;
  onJam: () => void;
  onTool: (tool: "tuning" | "rhythm" | "fretboard" | "chords") => void;
  onGuide: (id: number, focus?: string) => void;
};
const ratingNames = {
  needs: "Needs work",
  growing: "Getting there",
  comfortable: "Comfortable",
};
export function FoundationsPath({
  progress,
  setProgress,
  onPractice,
  onJam,
  onTool,
  onGuide,
}: FoundationsPathProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(["ready"]),
  );
  const today = dayKey(),
    recommendation = recommendFoundation(progress, today),
    review = foundationReviews(progress, today);
  const launch = (check: FoundationCheck) =>
    check.target.kind === "jam" ? onJam() : onPractice(check.target.unit);
  const openChapter = (id: string) => {
    setExpanded((current) => new Set([...current, id]));
    requestAnimationFrame(() =>
      document
        .getElementById(`foundation-${id}`)
        ?.scrollIntoView({ block: "start", behavior: "smooth" }),
    );
  };
  const mark = (check: FoundationCheck, checked: boolean) =>
    setProgress((p) =>
      markFoundationCheckpoint(p, check.id, checked, dayKey()),
    );
  const reviewed = (check: FoundationCheck) =>
    setProgress((p) => markFoundationReview(p, check.id, dayKey()));
  const guide = (check: FoundationCheck) => {
    if (check.guide) return onGuide(check.guide.lesson, check.guide.focus);
    if (check.target.kind === "jam") return onGuide(7);
    const unit = deskUnit(check.target.unit);
    onGuide(unit.lesson, unit.focus);
  };
  return (
    <div className="foundation-folio">
      <header className="foundation-opening">
        <h1>Build a base you can play from.</h1>
        <div>
          <p>
            Get comfortable with the instrument, make clear notes, connect
            chords, then carry a rhythm into music. Work across the basics at
            your own pace.
          </p>
          <p className="foundation-open-note">
            This is a suggested sequence. Every exercise stays open, and your
            own checks decide what you revisit.
          </p>
        </div>
      </header>
      <section
        className="foundation-next"
        aria-label="Suggested next foundation"
      >
        <div className="foundation-next-caption">
          Next useful check
          <ArrowRight size={18} />
        </div>
        <div>
          <h2>{recommendation.check.title}</h2>
          <p>{recommendation.check.criterion}</p>
          <small>{recommendation.reason}</small>
        </div>
        <button
          className="foundation-primary"
          onClick={() => launch(recommendation.check)}
        >
          {recommendation.check.target.kind === "jam"
            ? "Play the progression"
            : "Practise this check"}
          <ArrowRight size={17} />
        </button>
      </section>
      <div className="foundation-study-layout">
        <aside
          className="foundation-contents"
          aria-label="Learning path contents"
        >
          <h2>Your study path</h2>
          <ol>
            {foundationsPlan.map((chapter, i) => (
              <li key={chapter.id}>
                <button onClick={() => openChapter(chapter.id)}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    {chapter.title}
                    {chapter.later ? <small>Explore when ready</small> : null}
                  </div>
                </button>
              </li>
            ))}
          </ol>
          <div className="foundation-return">
            <RefreshCw size={17} />
            <h3>Return, then move on.</h3>
            <p>
              Begin a session with one familiar check, work on one new action,
              then use them together.
            </p>
            <button onClick={onJam}>
              Finish with music
              <ArrowRight size={14} />
            </button>
          </div>
        </aside>
        <div
          className="foundation-pages"
          aria-label="Guitar foundation checkpoints"
        >
          {foundationsPlan.map((chapter, i) => {
            const checked = chapter.checks.filter((check) =>
              foundationChecked(progress, check.id),
            ).length;
            return (
              <section
                key={chapter.id}
                className={`foundation-chapter ${expanded.has(chapter.id) ? "open" : ""}`}
                id={`foundation-${chapter.id}`}
              >
                <button
                  className="foundation-chapter-title"
                  aria-expanded={expanded.has(chapter.id)}
                  aria-controls={`foundation-body-${chapter.id}`}
                  onClick={() =>
                    setExpanded((current) => {
                      const next = new Set(current);
                      if (next.has(chapter.id)) next.delete(chapter.id);
                      else next.add(chapter.id);
                      return next;
                    })
                  }
                >
                  <span className="foundation-chapter-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2>{chapter.title}</h2>
                    <p>{chapter.description}</p>
                  </div>
                  <span className="foundation-chapter-status">
                    {checked}/{chapter.checks.length}
                    <ChevronDown size={18} />
                  </span>
                </button>
                <div
                  id={`foundation-body-${chapter.id}`}
                  hidden={!expanded.has(chapter.id)}
                >
                  <p className="foundation-practice-note">{chapter.practice}</p>
                  <ol className="foundation-check-list">
                    {chapter.checks.map((check) => {
                      const rating = foundationRating(progress, check.id),
                        isChecked = foundationChecked(progress, check.id),
                        last = progress.notes[foundationReviewKey(check.id)];
                      return (
                        <li
                          key={check.id}
                          className={
                            foundationChecked(progress, check.id)
                              ? "checked"
                              : ""
                          }
                        >
                          <div className="foundation-check-content">
                            <button
                              className="foundation-task-title"
                              onClick={() => launch(check)}
                            >
                              {check.title}
                              <ArrowRight size={15} />
                            </button>
                            <p>{check.criterion}</p>
                            <div className="foundation-check-meta">
                              {rating ? (
                                <span>Your rating: {ratingNames[rating]}</span>
                              ) : (
                                <span>
                                  Try it, listen, and decide for yourself.
                                </span>
                              )}
                              {last === today ? (
                                <span className="foundation-today">
                                  <Check size={12} />
                                  Reviewed today
                                </span>
                              ) : null}
                            </div>
                            {check.preparation.length ? (
                              <details className="foundation-preparation">
                                <summary>Useful preparation</summary>
                                <p>
                                  {check.preparation.map((id, j) => {
                                    const prep = foundationChecks.find(
                                      (c) => c.id === id,
                                    );
                                    return prep ? (
                                      <span key={id}>
                                        {j > 0 ? " · " : ""}
                                        <button onClick={() => launch(prep)}>
                                          {prep.title}
                                        </button>
                                      </span>
                                    ) : null;
                                  })}
                                  . You can open this exercise at any point.
                                </p>
                              </details>
                            ) : null}
                          </div>
                          <div className="foundation-check-actions">
                            <button
                              className="foundation-open-task"
                              onClick={() => launch(check)}
                            >
                              {check.target.kind === "jam"
                                ? "Play"
                                : "Practise"}
                              <ArrowRight size={14} />
                            </button>
                            <label>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                title={
                                  isChecked
                                    ? "Uncheck to revisit this foundation"
                                    : "Mark this foundation checked"
                                }
                                onChange={(event) =>
                                  mark(check, event.target.checked)
                                }
                              />
                              <span>I checked this</span>
                            </label>
                            <button
                              className="foundation-guide"
                              onClick={() => guide(check)}
                            >
                              See explanation
                              <ExternalLink size={11} />
                            </button>
                            {check.id === "setup-tuning" ? (
                              <button
                                className="foundation-guide"
                                onClick={() => onTool("tuning")}
                              >
                                Open tuner
                                <ExternalLink size={11} />
                              </button>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </section>
            );
          })}
          <section
            className="foundation-review"
            aria-label="Foundation review reminders"
          >
            <div className="foundation-review-heading">
              <RefreshCw size={23} />
              <div>
                <h2>A little review keeps the path connected.</h2>
                <p>
                  These reminders use the last day you marked a check, alongside
                  your own desk rating. They do not assess your playing.
                </p>
              </div>
            </div>
            {review.length ? (
              <>
                {review.length > 5 ? (
                  <p className="foundation-review-count">
                    5 of {review.length} due reminders shown. Reviewing one
                    brings the next into view.
                  </p>
                ) : null}
                <ul>
                  {review.slice(0, 5).map((check) => (
                    <li key={check.id}>
                      <div>
                        <b>{check.title}</b>
                        <span>
                          Last checked{" "}
                          {progress.notes[foundationReviewKey(check.id)]}
                        </span>
                      </div>
                      <button onClick={() => launch(check)}>
                        Practise again
                        <ArrowRight size={14} />
                      </button>
                      <button onClick={() => reviewed(check)}>
                        I reviewed it today
                        <Check size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="foundation-empty-review">
                No review reminder is due from your marked checks yet. After you
                try an exercise, mark the check to give yourself a return point.
              </p>
            )}
            <details className="foundation-review-rule">
              <summary>How review reminders work</summary>
              <p>
                Needs work returns after 1 day; Getting there after 3;
                Comfortable after 7. A checked exercise without a desk rating
                returns after 2 days. These are practice reminders you can use
                or ignore.
              </p>
            </details>
          </section>
          <footer className="foundation-source-note">
            <p>
              The foundations are authored practice instructions based on your
              supplied lessons. All fifteen shifting routes retain the
              instructor-checked finger assignments, fixed anchors,
              light-contact slides, group order and return directions. Source
              audio and video remain optional references.
            </p>
            <p>
              Lesson 1 and Lesson 10 transcripts were not supplied; their app
              guides are labelled supplementary. Checkpoints are your own report
              of a physical check, not automatic grading.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
