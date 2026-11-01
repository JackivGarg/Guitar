export type CoachPage =
  | "journey"
  | "foundations"
  | "desk"
  | "changes"
  | "jam"
  | "reference"
  | "library"
  | "guide"
  | "progress";
export type CoachRoute = {
  page: CoachPage;
  lesson?: number;
  focus?: string;
  change?: string;
  group?: number;
};
export function coachRoute(hash: string): CoachRoute {
  const [path, query] = hash.replace(/^#/, "").split("?"),
    params = new URLSearchParams(query);
  const match = path.match(/^\/lesson\/(10|[1-9])$/);
  if (match)
    return {
      page: "guide",
      lesson: Number(match[1]),
      focus: params.get("focus") ?? undefined,
    };
  if (["", "/", "/journey"].includes(path)) return { page: "journey" };
  if (["/foundations", "/learn"].includes(path)) return { page: "foundations" };
  if (path === "/jam") return { page: "jam" };
  if (["/changes", "/shifts", "/transitions"].includes(path)) {
    const group = Number(params.get("group"));
    return {
      page: "changes",
      group:
        Number.isInteger(group) && group >= 1 && group <= 11
          ? group
          : undefined,
      change: params.get("change") ?? undefined,
    };
  }
  if (["/reference", "/chords"].includes(path)) return { page: "reference" };
  if (["/library", "/sources"].includes(path)) return { page: "library" };
  if (["/progress", "/journal"].includes(path)) return { page: "progress" };
  return { page: "desk", change: params.get("change") ?? undefined };
}
