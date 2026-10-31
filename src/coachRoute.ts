export type CoachPage =
  | "desk"
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
  if (path === "/jam") return { page: "jam" };
  if (["/reference", "/changes", "/chords"].includes(path))
    return { page: "reference" };
  if (["/library", "/sources"].includes(path)) return { page: "library" };
  if (["/progress", "/journal"].includes(path)) return { page: "progress" };
  return { page: "desk", change: params.get("change") ?? undefined };
}
