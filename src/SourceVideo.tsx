import { useState } from "react";
import { Play, ExternalLink } from "lucide-react";
import { videoIds } from "./learningPath";
export function SourceVideo({
  lesson,
  start = 0,
}: {
  lesson: number;
  start?: number;
}) {
  const [loaded, setLoaded] = useState(false),
    [from, setFrom] = useState(0),
    [playRequest, setPlayRequest] = useState(0);
  const url = `https://www.youtube-nocookie.com/embed/${videoIds[lesson - 1]}?start=${from}&rel=0`;
  return (
    <details
      className="source-video-panel"
      onToggle={(e) => {
        if (!e.currentTarget.open) setLoaded(false);
      }}
    >
      <summary>
        Original video · Lesson {lesson}{" "}
        <span>Watch the full lesson or jump near this chapter</span>
      </summary>
      <div className="card-heading">
        <div>
          <div className="section-label">ORIGINAL VIDEO · LESSON {lesson}</div>
          <h3>Follow the teacher’s full lesson.</h3>
        </div>
        <span className="tag">INTERNET REQUIRED</span>
      </div>
      <p>
        The original video stays with this lesson. Use the English chapters
        below to practice the same material at your own pace.
      </p>
      {loaded ? (
        <div className="original-video-frame">
          <iframe
            key={`${url}-${playRequest}`}
            src={url}
            title={`Original Acoustic Pahadi guitar lesson ${lesson}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : null}
      <div className="button-row">
        <button
          className="primary"
          onClick={() => {
            setFrom(0);
            setLoaded(true);
            setPlayRequest((n) => n + 1);
          }}
        >
          <Play size={15} />
          {loaded ? "Restart full lesson" : "Watch full original lesson"}
        </button>
        {start > 0 && (
          <button
            className="secondary"
            onClick={() => {
              setFrom(Math.floor(start));
              setLoaded(true);
              setPlayRequest((n) => n + 1);
            }}
          >
            Watch near this chapter · {Math.floor(start / 60)}:
            {String(Math.floor(start % 60)).padStart(2, "0")}
          </button>
        )}
        <a
          className="text-button"
          href={`https://www.youtube.com/watch?v=${videoIds[lesson - 1]}&t=${Math.floor(start)}s`}
          target="_blank"
          rel="noreferrer"
        >
          Open on YouTube <ExternalLink size={13} />
        </a>
      </div>
      <p className="micro">
        The original video loads from YouTube only when you press Watch. Local
        notes, diagrams and practice tools work without it.
      </p>
    </details>
  );
}
