import type { Progress, Session } from "../state";

export const JOURNEY_PROGRESS_KEY = "six-strings-progress-v1";

/** A whole practice batch is acknowledged only after its durable write succeeds. */
export function persistJourneySessions(
  progress: Progress,
  sessions: Session[],
  storage: Pick<Storage, "setItem">,
): { ok: true; progress: Progress } | { ok: false } {
  const known = new Set(progress.sessions.map((s) => s.id));
  const additions = sessions.filter((session) => {
    if (known.has(session.id)) return false;
    known.add(session.id);
    return true;
  });
  if (!additions.length) return { ok: true, progress };
  const next = { ...progress, sessions: [...progress.sessions, ...additions] };
  try {
    storage.setItem(JOURNEY_PROGRESS_KEY, JSON.stringify(next));
    return { ok: true, progress: next };
  } catch {
    return { ok: false };
  }
}
