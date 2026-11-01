import {
  changes,
  drillBlocks,
  fingerPosition,
  workshopChord,
  type Change,
  type DrillBlock,
} from "../lesson7";
import {
  CHANGE_HALF_FRAMES,
  changeCueFrames,
  type ChangeDirection,
} from "../changeTiming";
export type WorkshopDirection = "forward" | "back";
export const changeWorkshopGroups = drillBlocks;
export function groupDirection(
  block: DrillBlock,
  change: Change,
): WorkshopDirection {
  let hasReturn = false;
  for (let i = 0; i < block.sequence.length - 1; i++) {
    if (
      block.sequence[i] === change.from &&
      block.sequence[i + 1] === change.to
    )
      return "forward";
    if (
      block.sequence[i] === change.to &&
      block.sequence[i + 1] === change.from
    )
      hasReturn = true;
  }
  if (hasReturn) return "back";
  const from = block.sequence.indexOf(change.from),
    to = block.sequence.indexOf(change.to);
  return from >= 0 && to >= 0 && to < from ? "back" : "forward";
}
export function workshopSelection(
  initialGroup?: number,
  initialChange?: string,
) {
  const block =
    drillBlocks.find((b) => b.id === initialGroup) ??
    drillBlocks.find((b) => b.pairs.includes(initialChange ?? "")) ??
    drillBlocks[0];
  const change =
    changes.find((c) => c.id === initialChange && block.pairs.includes(c.id)) ??
    changes.find((c) => c.id === block.pairs[0])!;
  return { block, change, direction: groupDirection(block, change) };
}
export function changeInDirection(
  change: Change,
  direction: WorkshopDirection,
): Change {
  return direction === "forward"
    ? change
    : {
        ...change,
        from: change.to,
        to: change.from,
        steps: change.back,
        back: change.steps,
        groups: change.reverseGroups ?? change.groups,
        reverseGroups: change.groups,
      };
}
export function workshopMovementGroups(
  change: Change,
  direction: WorkshopDirection,
) {
  const target = workshopChord(
    direction === "forward" ? change.to : change.from,
  );
  return (
    direction === "forward"
      ? change.groups
      : (change.reverseGroups ?? change.groups)
  )
    .map((group) =>
      group.filter((finger) => fingerPosition(target, finger) !== null),
    )
    .filter((group) => group.length > 0);
}
export function workshopMotionCues(
  change: Change,
  direction: ChangeDirection,
  firstDirection: WorkshopDirection = "forward",
) {
  const first = direction === "both" ? firstDirection : direction;
  const count = workshopMovementGroups(change, first).length;
  const timing = changeCueFrames(count, first);
  const a = workshopChord(first === "forward" ? change.from : change.to),
    b = workshopChord(first === "forward" ? change.to : change.from);
  const releasesExistingFinger = [1, 2, 3, 4].some((f) => {
    const source = fingerPosition(a, f),
      target = fingerPosition(b, f);
    return (
      source &&
      (!target ||
        source.string !== target.string ||
        source.fret !== target.fret)
    );
  });
  const cues = [
    { id: "shape", label: "Set shape", frame: timing.start },
    {
      id: "release",
      label: releasesExistingFinger
        ? "Release moving fingers"
        : "Keep anchors; prepare",
      frame: timing.release,
    },
    ...timing.movements.slice(0, count).map((frame, i) => ({
      id: `move-${i}`,
      label: `Move group ${i + 1}`,
      frame,
    })),
    { id: "target", label: "Check target", frame: timing.target },
  ];
  if (direction === "both") {
    const second = first === "forward" ? "back" : "forward";
    const returnCount = workshopMovementGroups(change, second).length;
    const returning = changeCueFrames(returnCount, second);
    cues.push({
      id: "return",
      label: "Return shape",
      frame: CHANGE_HALF_FRAMES,
    });
    const returningSource = workshopChord(
        second === "forward" ? change.from : change.to,
      ),
      returningTarget = workshopChord(
        second === "forward" ? change.to : change.from,
      );
    const returnReleases = [1, 2, 3, 4].some((f) => {
      const a = fingerPosition(returningSource, f),
        b = fingerPosition(returningTarget, f);
      return a && (!b || a.string !== b.string || a.fret !== b.fret);
    });
    cues.push({
      id: "return-release",
      label: returnReleases
        ? "Return: release moving fingers"
        : "Return: keep anchors",
      frame: CHANGE_HALF_FRAMES + returning.release,
    });
    returning.movements.slice(0, returnCount).forEach((frame, i) =>
      cues.push({
        id: `return-move-${i}`,
        label: `Return group ${i + 1}`,
        frame: CHANGE_HALF_FRAMES + frame,
      }),
    );
    cues.push({
      id: "return-target",
      label: "Check return",
      frame: CHANGE_HALF_FRAMES + returning.target,
    });
  }
  return cues;
}
