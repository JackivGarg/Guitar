import * as THREE from "three";
import { fingerPosition, workshopChord } from "../lesson7";
import { WORLD_COLORS } from "./worldSpec";
export const GUITAR_NUT_Y = 2.12,
  GUITAR_BRIDGE_Y = -1.08,
  GUITAR_STRING_Z = 0.294;
export const fretY = (fret: number) =>
  GUITAR_NUT_Y - (GUITAR_NUT_Y - GUITAR_BRIDGE_Y) * (1 - 2 ** (-fret / 12));
export function stringX(index: number, y: number) {
  const blend = THREE.MathUtils.clamp(
    (GUITAR_NUT_Y - y) / (GUITAR_NUT_Y - GUITAR_BRIDGE_Y),
    0,
    1,
  );
  return (index - 2.5) * THREE.MathUtils.lerp(0.035, 0.05, blend);
}
function bodyShape(hole = true) {
  const s = new THREE.Shape();
  s.moveTo(0, 0.27);
  s.bezierCurveTo(-0.35, 0.28, -0.76, 0.2, -0.79, -0.14);
  s.bezierCurveTo(-0.83, -0.49, -0.48, -0.64, -0.53, -0.86);
  s.bezierCurveTo(-0.55, -1.04, -1.04, -1.12, -1.02, -1.58);
  s.bezierCurveTo(-1.01, -2.04, -0.57, -2.25, 0, -2.25);
  s.bezierCurveTo(0.57, -2.25, 1.01, -2.04, 1.02, -1.58);
  s.bezierCurveTo(1.04, -1.12, 0.55, -1.04, 0.53, -0.86);
  s.bezierCurveTo(0.48, -0.64, 0.83, -0.49, 0.79, -0.14);
  // FS80C's Venetian cutaway is on the treble (right) shoulder in front view.
  s.bezierCurveTo(0.76, 0.1, 0.62, 0.16, 0.54, 0.07);
  s.bezierCurveTo(0.45, -0.07, 0.19, -0.11, 0.18, 0.09);
  s.lineTo(0.18, 0.27);
  s.lineTo(0, 0.27);
  // 1 unit = 200 mm: take the lower bout from 408 to the specified 380 mm.
  for (const curve of s.curves)
    for (const point of Object.values(curve)) {
      if (point instanceof THREE.Vector2) point.x *= 380 / 408;
    }
  if (hole) {
    const opening = new THREE.Path();
    opening.absarc(0, -0.43, 0.25, 0, Math.PI * 2, true);
    s.holes.push(opening);
  }
  return s;
}
function mesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material | THREE.Material[],
  name: string,
  group: THREE.Group,
) {
  const m = new THREE.Mesh(geometry, material);
  m.name = name;
  m.castShadow = true;
  m.receiveShadow = true;
  group.add(m);
  return m;
}
function box(
  w: number,
  h: number,
  d: number,
  material: THREE.Material,
  name: string,
  group: THREE.Group,
  x = 0,
  y = 0,
  z = 0,
) {
  const m = mesh(new THREE.BoxGeometry(w, h, d), material, name, group);
  m.position.set(x, y, z);
  return m;
}
function instances(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  matrices: THREE.Matrix4[],
  name: string,
  group: THREE.Group,
) {
  const m = new THREE.InstancedMesh(geometry, material, matrices.length);
  m.name = name;
  matrices.forEach((v, i) => m.setMatrixAt(i, v));
  m.castShadow = true;
  m.receiveShadow = true;
  group.add(m);
  return m;
}
const matrix = (
  x: number,
  y: number,
  z: number,
  sx = 1,
  sy = 1,
  sz = 1,
  rotation?: THREE.Quaternion,
) =>
  new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    rotation ?? new THREE.Quaternion(),
    new THREE.Vector3(sx, sy, sz),
  );
const facingFront = new THREE.Quaternion().setFromAxisAngle(
  new THREE.Vector3(1, 0, 0),
  Math.PI / 2,
);
export type GuitarModel = {
  root: THREE.Group;
  strings: THREE.Mesh[];
  note: THREE.Group;
  anchors: THREE.Group;
  pulse: THREE.Mesh;
  updatePluck: (index: number, time: number, reduced: boolean) => void;
  resetPluck: () => void;
  dispose: () => void;
};
export function createGuitarModel(): GuitarModel {
  const root = new THREE.Group();
  root.name = "guitarRoot";
  root.userData.instrument = "Yamaha FS80C Black";
  root.userData.geometry =
    "Original procedural teaching model; illustrative proportions.";
  root.rotation.z = -0.105;
  root.position.y = -0.024;
  // Black is an opaque finish over the spruce, not exposed blond wood grain.
  const top = new THREE.MeshPhysicalMaterial({
      color: "#0a0c10",
      roughness: 0.19,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
    }),
    side = new THREE.MeshStandardMaterial({
      color: "#0c0e12",
      roughness: 0.5,
      metalness: 0,
    }),
    darkWood = new THREE.MeshStandardMaterial({
      color: "#29190f",
      roughness: 0.65,
      metalness: 0,
    }),
    binding = new THREE.MeshStandardMaterial({
      color: WORLD_COLORS.binding,
      roughness: 0.48,
      metalness: 0,
    }),
    rosewood = new THREE.MeshStandardMaterial({
      color: "#302117",
      roughness: 0.64,
      metalness: 0,
    }),
    steel = new THREE.MeshStandardMaterial({
      color: "#c5d5ec",
      roughness: 0.29,
      metalness: 0.9,
    }),
    tunerButton = new THREE.MeshStandardMaterial({
      color: "#c2ccda",
      roughness: 0.24,
      metalness: 0.95,
    }),
    rosetteWhite = new THREE.MeshStandardMaterial({
      color: "#ebe4d7",
      roughness: 0.5,
    }),
    headVeneer = new THREE.MeshPhysicalMaterial({
      color: "#0a0c10",
      roughness: 0.22,
      metalness: 0,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
    }),
    ivory = new THREE.MeshStandardMaterial({
      color: "#e9ddc2",
      roughness: 0.42,
    }),
    pinMaterial = new THREE.MeshStandardMaterial({
      color: "#17191a",
      roughness: 0.4,
    });
  const shell = mesh(
    new THREE.ExtrudeGeometry(bodyShape(), {
      depth: 0.5,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.018,
      bevelThickness: 0.015,
      curveSegments: 26,
    }),
    [top, side],
    "acoustic-body-with-soundhole",
    root,
  );
  shell.position.z = -0.31;
  const back = mesh(
    new THREE.ExtrudeGeometry(bodyShape(false), {
      depth: 0.012,
      bevelEnabled: true,
      bevelSize: 0.012,
      bevelThickness: 0.008,
      bevelSegments: 2,
      curveSegments: 24,
    }),
    side,
    "tonewood-back",
    root,
  );
  back.position.z = -0.325;
  const contour = bodyShape(false).getPoints(160);
  for (const z of [0.204, -0.326]) {
    const curve = new THREE.CatmullRomCurve3(
      contour.map((p) => new THREE.Vector3(p.x, p.y, z)),
      true,
      "centripetal",
    );
    mesh(
      new THREE.TubeGeometry(curve, 160, 0.009, 5, true),
      binding,
      `body-binding-${z}`,
      root,
    );
  }
  for (const [radius, width, material] of [
    [0.262, 0.004, binding],
    [0.273, 0.005, rosetteWhite],
    [0.288, 0.004, binding],
    [0.301, 0.004, rosetteWhite],
    [0.313, 0.004, binding],
  ] as const) {
    const ring = mesh(
      new THREE.TorusGeometry(radius, width, 6, 80),
      material,
      `rosette-${radius}`,
      root,
    );
    ring.position.set(0, -0.43, 0.21);
  }
  const cavity = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.5, 64, 1, true),
    new THREE.MeshStandardMaterial({
      color: "#201b17",
      roughness: 0.9,
      side: THREE.BackSide,
    }),
  );
  cavity.rotation.x = Math.PI / 2;
  cavity.position.set(0, -0.43, -0.06);
  cavity.name = "soundhole-inner-wall";
  root.add(cavity);
  const neckShape = new THREE.Shape();
  neckShape.moveTo(-0.1475, -0.07);
  neckShape.lineTo(-0.1075, 2.15);
  neckShape.lineTo(0.1075, 2.15);
  neckShape.lineTo(0.1475, -0.07);
  neckShape.closePath();
  const neck = mesh(
    new THREE.ExtrudeGeometry(neckShape, {
      depth: 0.17,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.035,
      bevelThickness: 0.03,
      curveSegments: 6,
    }),
    side,
    "neck-with-rounded-edges",
    root,
  );
  neck.position.z = -0.025;
  const board = mesh(
    new THREE.ExtrudeGeometry(neckShape, {
      depth: 0.055,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.009,
      bevelThickness: 0.006,
    }),
    rosewood,
    "fingerboard",
    root,
  );
  board.position.z = 0.185;
  const frets: THREE.Matrix4[] = [];
  for (let i = 1; i <= 19; i++) {
    const y = fretY(i),
      width = THREE.MathUtils.lerp(0.215, 0.295, (GUITAR_NUT_Y - y) / 2.2);
    frets.push(matrix(0, y, 0.252, width, 0.01, 0.015));
  }
  instances(
    new THREE.BoxGeometry(1, 1, 1),
    steel,
    frets,
    "nineteen-metal-fret-wires",
    root,
  );
  box(0.218, 0.045, 0.095, ivory, "nut", root, 0, GUITAR_NUT_Y, 0.22);
  const dots: THREE.Matrix4[] = [];
  for (const fret of [3, 5, 7, 9, 12, 15, 17]) {
    const y = (fretY(fret - 1) + fretY(fret)) / 2;
    for (const x of fret === 12 ? [-0.05, 0.05] : [0])
      dots.push(matrix(x, y, 0.249, 1, 1, 1, facingFront));
  }
  instances(
    new THREE.CylinderGeometry(0.016, 0.016, 0.002, 12),
    ivory,
    dots,
    "position-marker-inlays",
    root,
  );
  box(0.23, 0.28, 0.18, side, "neck-heel", root, 0, 0.08, 0.035);
  const headShape = new THREE.Shape();
  headShape.moveTo(-0.108, 2.12);
  headShape.lineTo(-0.114, 2.24);
  headShape.quadraticCurveTo(-0.215, 2.34, -0.221, 2.46);
  headShape.lineTo(-0.251, 3.0);
  headShape.quadraticCurveTo(-0.252, 3.045, -0.22, 3.035);
  headShape.lineTo(0.22, 3.035);
  headShape.quadraticCurveTo(0.252, 3.045, 0.251, 3.0);
  headShape.lineTo(0.221, 2.46);
  headShape.quadraticCurveTo(0.215, 2.34, 0.114, 2.24);
  headShape.lineTo(0.108, 2.12);
  headShape.closePath();
  const head = mesh(
    new THREE.ExtrudeGeometry(headShape, {
      depth: 0.115,
      bevelEnabled: true,
      bevelSize: 0.018,
      bevelThickness: 0.012,
      bevelSegments: 3,
      curveSegments: 12,
    }),
    side,
    "headstock",
    root,
  );
  head.position.z = 0.035;
  const face = mesh(
    new THREE.ShapeGeometry(headShape, 20),
    headVeneer,
    "headstock-face-veneer",
    root,
  );
  face.position.z = 0.164;
  const posts: THREE.Matrix4[] = [],
    buttons: THREE.Matrix4[] = [],
    shafts: THREE.Matrix4[] = [],
    covers: THREE.Matrix4[] = [];
  for (const sign of [-1, 1])
    for (let row = 0; row < 3; row++) {
      const y = 2.33 + row * 0.235,
        x = sign * (0.169 + row * 0.014);
      posts.push(matrix(x, y, 0.185, 1, 1, 1, facingFront));
      covers.push(matrix(x, y, 0.025, 0.095, 0.13, 0.06));
      shafts.push(matrix(sign * 0.235, y, 0.095, 0.16, 0.035, 0.035));
      buttons.push(matrix(sign * 0.324, y, 0.095, 0.095, 0.105, 0.042));
    }
  instances(
    new THREE.CylinderGeometry(0.03, 0.03, 0.065, 12),
    steel,
    posts,
    "six-tuning-posts",
    root,
  );
  instances(
    new THREE.BoxGeometry(1, 1, 1),
    steel,
    shafts,
    "tuner-shafts",
    root,
  );
  instances(
    new THREE.SphereGeometry(1, 8, 6),
    tunerButton,
    buttons,
    "tuning-machine-buttons",
    root,
  );
  instances(
    new THREE.BoxGeometry(1, 1, 1),
    steel,
    covers,
    "covered-chrome-tuning-machines",
    root,
  );
  // No invented Yamaha wordmark or decorative substitute emblem.
  const bridgeShape = new THREE.Shape();
  bridgeShape.moveTo(-0.35, -1.06);
  bridgeShape.quadraticCurveTo(-0.4, -1.24, -0.27, -1.3);
  bridgeShape.quadraticCurveTo(0, -1.24, 0.27, -1.3);
  bridgeShape.quadraticCurveTo(0.4, -1.24, 0.35, -1.06);
  bridgeShape.closePath();
  const bridge = mesh(
    new THREE.ExtrudeGeometry(bridgeShape, {
      depth: 0.055,
      bevelEnabled: true,
      bevelSize: 0.018,
      bevelThickness: 0.008,
      bevelSegments: 2,
      curveSegments: 10,
    }),
    darkWood,
    "carved-bridge",
    root,
  );
  bridge.position.z = 0.213;
  const saddle = box(
    0.4,
    0.022,
    0.025,
    ivory,
    "compensated-saddle",
    root,
    0,
    GUITAR_BRIDGE_Y,
    0.283,
  );
  saddle.rotation.z = -0.03;
  const pins = Array.from({ length: 6 }, (_, i) =>
    matrix((i - 2.5) * 0.05, -1.19, 0.282, 1, 1, 1, facingFront),
  );
  instances(
    new THREE.CylinderGeometry(0.017, 0.012, 0.03, 12),
    pinMaterial,
    pins,
    "six-bridge-pins",
    root,
  );
  const pickShape = new THREE.Shape();
  pickShape.moveTo(0.25, -0.14);
  pickShape.bezierCurveTo(0.48, -0.2, 0.65, -0.64, 0.62, -0.88);
  pickShape.bezierCurveTo(0.6, -1.05, 0.29, -1.03, 0.26, -0.88);
  pickShape.bezierCurveTo(0.23, -0.65, 0.31, -0.41, 0.25, -0.14);
  const pickguard = mesh(
    new THREE.ShapeGeometry(pickShape, 24),
    new THREE.MeshStandardMaterial({ color: "#101316", roughness: 0.31 }),
    "black-pickguard",
    root,
  );
  pickguard.position.z = 0.211;
  const strings: THREE.Mesh[] = [],
    bases: Float32Array[] = [];
  for (let i = 0; i < 6; i++) {
    const a = new THREE.Vector3((i - 2.5) * 0.05, GUITAR_BRIDGE_Y, 0.294),
      b = new THREE.Vector3((i - 2.5) * 0.035, GUITAR_NUT_Y, 0.274),
      row = i < 3 ? i : 5 - i,
      c = new THREE.Vector3(
        (i < 3 ? -1 : 1) * (0.169 + row * 0.014),
        2.33 + row * 0.235,
        0.225,
      ),
      curve = new THREE.CurvePath<THREE.Vector3>();
    curve.add(new THREE.LineCurve3(a, b));
    curve.add(new THREE.LineCurve3(b, c));
    const geometry = new THREE.TubeGeometry(
        curve,
        64,
        0.0038 - i * 0.00043,
        5,
        false,
      ),
      string = mesh(
        geometry,
        steel,
        `string-${6 - i}-${["low-E", "A", "D", "G", "B", "high-e"][i]}`,
        root,
      );
    string.castShadow = false;
    string.userData.stringIndex = i;
    strings.push(string);
    bases.push(new Float32Array(geometry.attributes.position.array));
  }
  const highlight = new THREE.MeshStandardMaterial({
      color: "#f0deaf",
      roughness: 0.65,
      metalness: 0,
    }),
    note = new THREE.Group();
  note.name = "clear-note-high-e-fret-1";
  root.add(note);
  const noteRing = mesh(
    new THREE.TorusGeometry(0.034, 0.006, 6, 28),
    highlight,
    "fret-one-reference",
    note,
  );
  noteRing.position.set(stringX(5, fretY(1) + 0.04), fretY(1) + 0.04, 0.315);
  const anchors = new THREE.Group();
  anchors.name = "verified-C-Am-stationary-anchors";
  root.add(anchors);
  for (const finger of [1, 2]) {
    const p = fingerPosition(workshopChord("C"), finger)!,
      y = fretY(p.fret) + 0.035,
      ring = mesh(
        new THREE.TorusGeometry(0.028, 0.005, 6, 24),
        highlight,
        `stationary-finger-${finger}`,
        anchors,
      );
    ring.position.set(stringX(p.string, y), y, 0.313);
  }
  const pulse = mesh(
    new THREE.TorusGeometry(0.395, 0.0035, 5, 80),
    highlight,
    "picking-zone-reference",
    root,
  );
  pulse.position.set(0, -0.43, 0.212);
  const resetPluck = () =>
    strings.forEach((string, i) => {
      const attr = string.geometry.attributes.position as THREE.BufferAttribute;
      (attr.array as Float32Array).set(bases[i]);
      attr.needsUpdate = true;
    });
  const updatePluck = (index: number, time: number, reduced: boolean) => {
    if (index < 0 || index > 5) return;
    const attr = strings[index].geometry.attributes
        .position as THREE.BufferAttribute,
      base = bases[index],
      amplitude = reduced
        ? 0
        : 0.01 * Math.exp(-time * 6) * Math.sin(time * 65);
    for (let v = 0; v < attr.count; v++) {
      const y = base[v * 3 + 1],
        along = (y - GUITAR_BRIDGE_Y) / (GUITAR_NUT_Y - GUITAR_BRIDGE_Y);
      attr.setX(
        v,
        base[v * 3] +
          (along >= 0 && along <= 1
            ? Math.sin(along * Math.PI) * amplitude
            : 0),
      );
    }
    attr.needsUpdate = true;
  };
  const dispose = () => {
    const geometries = new Set<THREE.BufferGeometry>(),
      materials = new Set<THREE.Material>(),
      textures = new Set<THREE.Texture>();
    root.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        geometries.add(o.geometry);
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          materials.add(m);
      }
    });
    materials.forEach((m) => {
      for (const value of Object.values(m))
        if (value instanceof THREE.Texture) textures.add(value);
      m.dispose();
    });
    geometries.forEach((g) => g.dispose());
    textures.forEach((t) => t.dispose());
    root.clear();
  };
  return {
    root,
    strings,
    note,
    anchors,
    pulse,
    updatePluck,
    resetPluck,
    dispose,
  };
}
