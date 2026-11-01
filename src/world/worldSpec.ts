export type WorldVector = readonly [number, number, number];
export type WorldCamera = {
  position: WorldVector;
  target: WorldVector;
  fov: number;
};
export type WorldChapter = {
  id: string;
  camera: WorldCamera;
  mobile: WorldCamera;
  focus: "whole" | "strings" | "note" | "anchors" | "pulse";
  key: number;
  fill: number;
};
export const WORLD_COLORS = {
  cobalt: "#233db7",
  midnight: "#17213b",
  blackFinish: "#0a0c10",
  binding: "#16181b",
  steel: "#d8dfed",
  ink: "#202a44",
};
export const WORLD_QUALITY = {
  desktopDpr: 1.5,
  mobileDpr: 1.25,
  shadowSize: 1024,
  triangleBudget: 100000,
  drawCallBudget: 100,
};
export const worldChapters: readonly WorldChapter[] = [
  {
    id: "meet",
    camera: { position: [3.8, 1.05, 9.4], target: [0, 0.3, 0], fov: 37 },
    mobile: { position: [3.0, 0.9, 14.5], target: [0, 0.27, 0], fov: 42 },
    focus: "whole",
    key: 3.3,
    fill: 1.4,
  },
  {
    id: "strings",
    camera: {
      position: [1.18, 2.56, 3.0],
      target: [0.24, 2.27, 0.15],
      fov: 36,
    },
    mobile: { position: [0.65, 2.5, 4.6], target: [0.23, 2.2, 0.12], fov: 44 },
    focus: "strings",
    key: 3.0,
    fill: 1.8,
  },
  {
    id: "clear-note",
    camera: {
      position: [0.84, 1.66, 1.93],
      target: [0.2, 1.77, 0.27],
      fov: 34,
    },
    mobile: {
      position: [0.55, 1.79, 2.8],
      target: [0.18, 1.76, 0.27],
      fov: 43,
    },
    focus: "note",
    key: 3.1,
    fill: 1.7,
  },
  {
    id: "anchors",
    camera: {
      position: [0.65, 1.77, 1.86],
      target: [0.18, 1.77, 0.27],
      fov: 34,
    },
    mobile: {
      position: [0.53, 1.76, 2.8],
      target: [0.18, 1.76, 0.27],
      fov: 43,
    },
    focus: "anchors",
    key: 3.1,
    fill: 1.7,
  },
  {
    id: "pulse",
    camera: {
      position: [1.5, -0.55, 4.25],
      target: [-0.06, -0.57, 0.1],
      fov: 35,
    },
    mobile: {
      position: [0.85, -0.5, 6.2],
      target: [-0.05, -0.6, 0.1],
      fov: 43,
    },
    focus: "pulse",
    key: 3.7,
    fill: 1.45,
  },
  {
    id: "music",
    camera: { position: [-2.8, 0.82, 9.0], target: [0, 0.25, 0], fov: 38 },
    mobile: { position: [-2.2, 0.9, 14.5], target: [0, 0.25, 0], fov: 42 },
    focus: "whole",
    key: 3.5,
    fill: 1.5,
  },
];
export const clampWorldProgress = (value: number) =>
  Number.isFinite(value)
    ? Math.max(0, Math.min(worldChapters.length - 1, value))
    : 0;
export function worldSegment(value: number) {
  const progress = clampWorldProgress(value),
    index = Math.min(worldChapters.length - 2, Math.floor(progress));
  return {
    index,
    local: progress - index,
    a: worldChapters[index],
    b: worldChapters[index + 1],
  };
}

/** Yamaha's published product specification; geometry is an original illustrative teaching model. */
export const GUITAR_INSTRUMENT = {
  name: "Yamaha FS80C Black",
  body: "Concert cutaway",
  top: "Spruce",
  finish: "Black; gloss top, matte side/back and neck",
  backSidesNeck: "Tonewood",
  fingerboardBridge: "Rosewood",
  binding: "Black",
  soundholeInlay: "Black + White",
  bridgePins: "Black ABS",
  pickguard: "Black",
  tuners: "Covered chrome",
  scaleMm: 634,
  bodyLengthMm: 497,
  bodyWidthMm: 380,
  nutWidthMm: 43,
  specificationUrl:
    "https://yamahamusicstore.in/musical-instruments/yamaha-fs80c-black-acoustic-guitar-made-in-india.html",
  representation:
    "Original procedural teaching model; proportions are illustrative, not a manufacturer CAD asset.",
} as const;
