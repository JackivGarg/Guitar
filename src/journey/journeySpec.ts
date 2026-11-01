export const journeyChapters = [
  { id: "instrument", title: "Your instrument", unit: "setup-posture" },
  { id: "strings", title: "Six open strings", unit: "setup-strings" },
  { id: "clear-note", title: "One clear note", unit: "setup-fret" },
  { id: "anchors", title: "Keep what stays", unit: "C-Am" },
  { id: "pulse", title: "A steady pulse", unit: "pulse-four" },
  { id: "music", title: "Make it musical", unit: "C-Am" },
] as const;
export const openStringStudy = [
  { name: "Low E", pitch: "E2", number: 6, midi: 40 },
  { name: "A", pitch: "A2", number: 5, midi: 45 },
  { name: "D", pitch: "D3", number: 4, midi: 50 },
  { name: "G", pitch: "G3", number: 3, midi: 55 },
  { name: "B", pitch: "B3", number: 2, midi: 59 },
  { name: "High e", pitch: "E4", number: 1, midi: 64 },
] as const;
export const chapterAtProgress = (progress: number) =>
  Math.max(
    0,
    Math.min(5, Math.round(Number.isFinite(progress) ? progress : 0)),
  );

/** Map native scroll between the measured section starts, including unequal mobile sections. */
export function progressAtScroll(local: number, landmarks: number[]) {
  if (landmarks.length < 2 || !Number.isFinite(local)) return 0;
  const last = landmarks.length - 1;
  if (local <= landmarks[0]) return 0;
  if (local >= landmarks[last]) return last;
  let index = 0;
  for (let i = 0; i < last; i++) {
    if (local >= landmarks[i]) index = i;
  }
  return (
    index +
    Math.max(
      0,
      Math.min(
        1,
        (local - landmarks[index]) /
          Math.max(1, landmarks[index + 1] - landmarks[index]),
      ),
    )
  );
}
