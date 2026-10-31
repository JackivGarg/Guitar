import { deskUnits } from "./deskCurriculum";
export type DeskStage = "learn" | "repeat" | "connect";
export type PendingPractice = { date: string; unit: string; seconds: number };
export type DeskDraft = {
  date: string;
  unit: string;
  stage: DeskStage;
  seconds: number;
  logged: number;
  unitSeconds: number;
  reps: number;
  pending?: PendingPractice[];
};
export const pendingPractice = (d: DeskDraft): PendingPractice[] =>
  d.pending ??
  (d.seconds > d.logged
    ? [{ date: d.date, unit: d.unit, seconds: d.seconds - d.logged }]
    : []);
export const makeDeskDraft = (date: string): DeskDraft => ({
  date,
  unit: "C-Am",
  stage: "learn",
  seconds: 0,
  logged: 0,
  unitSeconds: 0,
  reps: 0,
  pending: [],
});
export function validDeskDraft(x: unknown): x is DeskDraft {
  if (!x || typeof x !== "object") return false;
  const d = x as DeskDraft;
  return (
    typeof d.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(d.date) &&
    deskUnits.some((u) => u.id === d.unit) &&
    ["learn", "repeat", "connect"].includes(d.stage) &&
    [d.seconds, d.logged, d.unitSeconds, d.reps].every(
      (n) => Number.isInteger(n) && n >= 0 && n <= 86400,
    ) &&
    d.logged <= d.seconds &&
    (d.pending === undefined ||
      (Array.isArray(d.pending) &&
        d.pending.every(
          (s) =>
            typeof s.date === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(s.date) &&
            deskUnits.some((u) => u.id === s.unit) &&
            Number.isInteger(s.seconds) &&
            s.seconds > 0 &&
            s.seconds <= 86400,
        ) &&
        d.pending.reduce((n, s) => n + s.seconds, 0) === d.seconds - d.logged))
  );
}
export const rollDeskDay = (d: DeskDraft, date: string): DeskDraft =>
  d.date === date
    ? d
    : { ...d, date, unitSeconds: 0, reps: 0, pending: pendingPractice(d) };
export function addDeskSeconds(
  d: DeskDraft,
  seconds: number,
  date: string,
): DeskDraft {
  const amount = Math.min(Math.max(0, Math.floor(seconds)), 86400 - d.seconds);
  if (!amount) return d;
  const segments = pendingPractice(d),
    last = segments.at(-1);
  const pending =
    last && last.date === date && last.unit === d.unit
      ? [...segments.slice(0, -1), { ...last, seconds: last.seconds + amount }]
      : [...segments, { date, unit: d.unit, seconds: amount }];
  return {
    ...d,
    seconds: d.seconds + amount,
    unitSeconds: Math.min(86400, d.unitSeconds + amount),
    pending,
  };
}
export const clearDeskBatch = (d: DeskDraft): DeskDraft => ({
  ...d,
  seconds: 0,
  logged: 0,
  pending: [],
});
