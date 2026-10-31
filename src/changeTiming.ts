/** Canonical 30 fps timing shared by the player controls and the animation. */
export const CHANGE_FPS = 30;
export const CHANGE_HALF_FRAMES = 90;
export type ChangeDirection = "forward" | "back" | "both";
export const CHANGE_RELEASE_START = 10;
export const CHANGE_RELEASE_END = 17;
export const CHANGE_MOVE_START = 18;
export const CHANGE_MOVE_END = 63;
export const CHANGE_SETTLED = 66;

export function changeDurationFrames(
  direction: ChangeDirection = "both",
  fps = CHANGE_FPS,
) {
  return Math.round((direction === "both" ? 6 : 3) * fps);
}

export function changePhase(
  frame: number,
  direction: ChangeDirection = "both",
  fps = CHANGE_FPS,
) {
  const canonical = (Math.max(0, frame) * CHANGE_FPS) / fps;
  const back =
    direction === "back" ||
    (direction === "both" && canonical >= CHANGE_HALF_FRAMES);
  return {
    back,
    local: canonical - (direction === "both" && back ? CHANGE_HALF_FRAMES : 0),
  };
}

export function changeMoveWindow(groupIndex: number, groupCount: number) {
  const count = Math.max(1, groupCount);
  const width = (CHANGE_MOVE_END - CHANGE_MOVE_START) / count;
  const start =
    CHANGE_MOVE_START + Math.max(0, Math.min(count - 1, groupIndex)) * width;
  return { start, end: start + width - 2 };
}

export function changeCueFrames(
  groupCount: number,
  direction: ChangeDirection = "both",
  fps = CHANGE_FPS,
) {
  const scale = (frame: number) => Math.round((frame * fps) / CHANGE_FPS);
  const movements = Array.from({ length: Math.max(1, groupCount) }, (_, i) => {
    const { start, end } = changeMoveWindow(i, groupCount);
    return scale((start + end) / 2);
  });
  return {
    start: 0,
    release: scale((CHANGE_RELEASE_START + CHANGE_RELEASE_END) / 2),
    first: movements[0],
    next: movements[1] ?? movements[0],
    target: scale(72),
    // A one-way player changes its direction prop to show the return instead.
    return: direction === "both" ? scale(CHANGE_HALF_FRAMES) : 0,
    movements,
  };
}
