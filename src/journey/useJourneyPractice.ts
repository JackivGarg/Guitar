import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "../state";
import { journeyChapters } from "./journeySpec";
import { deskUnit } from "../deskCurriculum";
export type JourneyChapterId = (typeof journeyChapters)[number]["id"];
export type JourneyAssessment = "unrated" | "comfortable" | "needs-work";
export type JourneyPracticeEntry = {
  id: string;
  date: string;
  chapter: JourneyChapterId;
  elapsedMs: number;
  reps: number;
  assessment: JourneyAssessment;
};
export type JourneyPracticeDraft = {
  token: string;
  serial: number;
  entries: JourneyPracticeEntry[];
  active: { chapter: JourneyChapterId; at: number } | null;
};
export const MAX_JOURNEY_GAP_MS = 2500;
const chapterLessons = Object.fromEntries(
  journeyChapters.map((chapter) => [chapter.id, deskUnit(chapter.unit).lesson]),
) as Record<JourneyChapterId, number>;
const dateKey = (at: number) => {
  const d = new Date(at);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const makeJourneyPractice = (
  token = "practice",
): JourneyPracticeDraft => ({ token, serial: 0, entries: [], active: null });
function entryFor(
  draft: JourneyPracticeDraft,
  chapter: JourneyChapterId,
  at: number,
) {
  const date = dateKey(at),
    index = draft.entries.findIndex(
      (entry) => entry.date === date && entry.chapter === chapter,
    );
  if (index >= 0) return { draft, index };
  const entry: JourneyPracticeEntry = {
    id: `journey-${draft.token}-${draft.serial}`,
    date,
    chapter,
    elapsedMs: 0,
    reps: 0,
    assessment: "unrated",
  };
  return {
    draft: {
      ...draft,
      serial: draft.serial + 1,
      entries: [...draft.entries, entry],
    },
    index: draft.entries.length,
  };
}
function updateEntry(
  draft: JourneyPracticeDraft,
  chapter: JourneyChapterId,
  at: number,
  update: (entry: JourneyPracticeEntry) => JourneyPracticeEntry,
) {
  const prepared = entryFor(draft, chapter, at),
    entries = [...prepared.draft.entries];
  entries[prepared.index] = update(entries[prepared.index]);
  return { ...prepared.draft, entries };
}
/** Only observed, eligible foreground time is counted; a suspended event loop pauses the attempt. */
export function tickJourneyPractice(
  draft: JourneyPracticeDraft,
  now: number,
): JourneyPracticeDraft {
  const active = draft.active;
  if (!active || !Number.isFinite(now)) return draft;
  const gap = now - active.at;
  if (gap < 0 || gap > MAX_JOURNEY_GAP_MS) return { ...draft, active: null };
  let next = draft,
    cursor = active.at;
  while (cursor < now) {
    const date = new Date(cursor),
      midnight = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1,
      ).getTime(),
      end = Math.min(midnight, now),
      amount = end - cursor;
    next = updateEntry(next, active.chapter, cursor, (entry) => ({
      ...entry,
      elapsedMs: entry.elapsedMs + amount,
    }));
    cursor = end;
  }
  return { ...next, active: { ...active, at: now } };
}
export function pauseJourneyPractice(draft: JourneyPracticeDraft, now: number) {
  return { ...tickJourneyPractice(draft, now), active: null };
}
export function startJourneyPractice(
  draft: JourneyPracticeDraft,
  chapter: JourneyChapterId,
  now: number,
) {
  if (!Number.isFinite(now)) return draft;
  const paused = pauseJourneyPractice(draft, now),
    prepared = entryFor(paused, chapter, now);
  return { ...prepared.draft, active: { chapter, at: now } };
}
export function reportJourneyRep(
  draft: JourneyPracticeDraft,
  chapter: JourneyChapterId,
  now: number,
) {
  return updateEntry(
    tickJourneyPractice(draft, now),
    chapter,
    now,
    (entry) => ({ ...entry, reps: Math.min(9999, entry.reps + 1) }),
  );
}
export function assessJourneyPractice(
  draft: JourneyPracticeDraft,
  chapter: JourneyChapterId,
  assessment: JourneyAssessment,
  now: number,
) {
  return updateEntry(
    tickJourneyPractice(draft, now),
    chapter,
    now,
    (entry) => ({ ...entry, assessment }),
  );
}
export function journeyPracticeBatch(draft: JourneyPracticeDraft, now: number) {
  const paused = pauseJourneyPractice(draft, now),
    eligible = paused.entries.filter((entry) => entry.elapsedMs >= 1000);
  const sessions: Session[] = eligible.map((entry) => ({
    id: entry.id,
    date: entry.date,
    seconds: Math.floor(entry.elapsedMs / 1000),
    lesson: chapterLessons[entry.chapter],
    feeling: `Journey: ${journeyChapters.find((chapter) => chapter.id === entry.chapter)!.title}; ${entry.reps} self-reported clean repetitions; ${entry.assessment === "unrated" ? "not rated" : entry.assessment === "comfortable" ? "felt comfortable" : "needs more practice"}.`,
  }));
  return {
    sessions,
    draft: {
      ...paused,
      entries: paused.entries.filter((entry) => entry.elapsedMs < 1000),
    },
  };
}
type Options = {
  chapter: JourneyChapterId;
  suspended?: boolean;
  onSaveSessions: (sessions: Session[]) => boolean;
};
export function useJourneyPractice({
  chapter,
  suspended = false,
  onSaveSessions,
}: Options) {
  const [draft, setDraft] = useState(() =>
      makeJourneyPractice(
        crypto.randomUUID(),
      ),
    ),
    [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const current = useRef(draft),
    environment = useRef({ chapter, suspended, onSaveSessions });
  environment.current = { chapter, suspended, onSaveSessions };
  const commit = useCallback((next: JourneyPracticeDraft) => {
    current.current = next;
    setDraft(next);
  }, []);
  const pause = useCallback(
    () => commit(pauseJourneyPractice(current.current, Date.now())),
    [commit],
  );
  useEffect(() => {
    const active = current.current.active;
    if (suspended || (active && active.chapter !== chapter)) pause();
  }, [chapter, suspended, pause]);
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) pause();
    };
    document.addEventListener("visibilitychange", hidden);
    const interval = setInterval(() => {
      const active = current.current.active;
      if (!active) return;
      if (
        document.hidden ||
        environment.current.suspended ||
        active.chapter !== environment.current.chapter
      ) {
        pause();
        return;
      }
      commit(tickJourneyPractice(current.current, Date.now()));
    }, 250);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", hidden);
      current.current = pauseJourneyPractice(current.current, Date.now());
    };
  }, [commit, pause]);
  const start = () => {
    if (document.hidden || environment.current.suspended) return;
    setSaveStatus("idle");
    commit(startJourneyPractice(current.current, chapter, Date.now()));
  };
  const addRep = () => {
    setSaveStatus("idle");
    commit(reportJourneyRep(current.current, chapter, Date.now()));
  };
  const setAssessment = (assessment: JourneyAssessment) => {
    setSaveStatus("idle");
    commit(
      assessJourneyPractice(current.current, chapter, assessment, Date.now()),
    );
  };
  const save = () => {
    const batch = journeyPracticeBatch(current.current, Date.now());
    commit(pauseJourneyPractice(current.current, Date.now()));
    if (!batch.sessions.length) return false;
    try {
      if (!environment.current.onSaveSessions(batch.sessions)) {
        setSaveStatus("error");
        return false;
      }
      commit(batch.draft);
      setSaveStatus("saved");
      return true;
    } catch {
      setSaveStatus("error");
      return false;
    }
  };
  const chapterEntries = draft.entries.filter(
      (entry) => entry.chapter === chapter,
    ),
    latest = chapterEntries.at(-1),
    pendingSeconds = draft.entries.reduce(
      (sum, entry) => sum + Math.floor(entry.elapsedMs / 1000),
      0,
    );
  return {
    running: draft.active?.chapter === chapter && !suspended,
    seconds: Math.floor(
      chapterEntries.reduce((sum, entry) => sum + entry.elapsedMs, 0) / 1000,
    ),
    reps: chapterEntries.reduce((sum, entry) => sum + entry.reps, 0),
    assessment: latest?.assessment ?? ("unrated" as JourneyAssessment),
    start,
    pause,
    addRep,
    setAssessment,
    save,
    canSave: pendingSeconds > 0,
    pendingSeconds,
    pendingCount: draft.entries.filter((entry) => entry.elapsedMs >= 1000)
      .length,
    saved: saveStatus === "saved",
    saveStatus,
  };
}
