export type JamPattern = "down" | "folk";
export const jamPatterns: Record<JamPattern, readonly string[]> = {
  down: ["D", "·", "D", "·", "D", "·", "D", "·"],
  folk: ["D", "·", "D", "U", "·", "U", "D", "U"],
};
export function jamSlot(
  slot: number,
  chordCount: number,
  bars: number,
  pattern: JamPattern = "down",
) {
  const position = Math.max(0, Math.floor(slot));
  if (position < 8)
    return {
      countIn: true,
      count: Math.floor(position / 2) + 1,
      half: position % 2,
      beat: Math.floor(position / 2),
      chordIndex: 0,
      bar: 0,
      round: 0,
      strum: "·",
    };
  const music = position - 8,
    slotsPerChord = Math.max(1, bars) * 8,
    roundSlots = Math.max(1, chordCount) * slotsPerChord;
  return {
    countIn: false,
    count: 0,
    half: music % 2,
    beat: Math.floor(music / 2) % 4,
    chordIndex: Math.floor(music / slotsPerChord) % Math.max(1, chordCount),
    bar: Math.floor(music / 8) % Math.max(1, bars),
    round: Math.floor(music / roundSlots) + 1,
    strum: jamPatterns[pattern][music % 8],
  };
}
export function jamClock(
  elapsedSeconds: number,
  bpm: number,
  chordCount: number,
  bars: number,
  pattern: JamPattern = "down",
) {
  const beatSeconds = 60 / bpm;
  return {
    ...jamSlot(
      Math.floor(Math.max(0, elapsedSeconds) / (beatSeconds / 2)),
      chordCount,
      bars,
      pattern,
    ),
    playedSeconds: Math.max(0, Math.floor(elapsedSeconds - 4 * beatSeconds)),
  };
}
export function rotateLoop<T>(items: readonly T[], start: number): T[] {
  if (!items.length) return [];
  const index =
    ((Math.floor(start) % items.length) + items.length) % items.length;
  return [...items.slice(index), ...items.slice(0, index)];
}
