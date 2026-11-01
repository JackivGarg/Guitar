import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createGuitarModel } from "./guitarModel";
import type { StudyNote } from "./fretStudy";
import {
  clampWorldProgress,
  WORLD_COLORS,
  WORLD_QUALITY,
  worldChapters,
  worldSegment,
} from "./worldSpec";
export type WorldStats = {
  triangles: number;
  calls: number;
  geometries: number;
  textures: number;
  dpr: number;
  quality: "desktop" | "mobile";
  chapter: string;
  frameMs: number;
};
export type GuitarWorldProps = {
  progress?: number;
  reducedMotion?: boolean;
  paused?: boolean;
  className?: string;
  onReady?: (stats: WorldStats) => void;
  onFailure?: (reason?: string) => void;
  onPluck?: (stringIndex: number) => void;
  activeString?: number | null;
  pluckNonce?: number;
  studyNote?: StudyNote | null;
  studyChord?: string | null;
};
export function GuitarWorld({
  progress = 0,
  reducedMotion = false,
  paused = false,
  className = "",
  onReady,
  onFailure,
  onPluck,
  activeString = null,
  pluckNonce = 0,
  studyNote = null,
  studyChord = null,
}: GuitarWorldProps) {
  const host = useRef<HTMLDivElement>(null),
    latest = useRef({
      progress,
      reducedMotion,
      paused,
      onReady,
      onFailure,
      onPluck,
      activeString,
      pluckNonce,
      studyNote,
      studyChord,
    }),
    runtime = useRef<{
      invalidate: () => void;
      pluck: (index: number) => void;
      study: (note: StudyNote | null, chord: string | null) => void;
    } | null>(null);
  latest.current = {
    progress,
    reducedMotion,
    paused,
    onReady,
    onFailure,
    onPluck,
    activeString,
    pluckNonce,
    studyNote,
    studyChord,
  };
  const [failed, setFailed] = useState(false),
    [poster, setPoster] = useState(true);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let alive = true,
      renderer: THREE.WebGLRenderer | undefined,
      model: ReturnType<typeof createGuitarModel> | undefined,
      environmentTarget: THREE.WebGLCubeRenderTarget | undefined,
      observer: IntersectionObserver | undefined,
      resizeObserver: ResizeObserver | undefined,
      raf = 0,
      visible = true,
      contextLost = false,
      lastFrame = 0,
      smooth = clampWorldProgress(latest.current.progress),
      lastPluck = -1,
      pluckAt = 0,
      reported = false,
      width = 1,
      height = 1,
      mobile = false,
      dpr = 1,
      slowFrames = 0,
      warmFrames = 0;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(WORLD_COLORS.cobalt);
    const camera = new THREE.PerspectiveCamera(37, 1, 0.02, 80),
      target = new THREE.Vector3(),
      position = new THREE.Vector3(),
      aVector = new THREE.Vector3(),
      bVector = new THREE.Vector3();
    const ambient = new THREE.HemisphereLight(
        "#dce8ff",
        WORLD_COLORS.midnight,
        1.4,
      ),
      key = new THREE.DirectionalLight("#fff0d9", 3.3),
      rim = new THREE.DirectionalLight("#9fb9ff", 1.8);
    key.position.set(-3.5, 5, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(WORLD_QUALITY.shadowSize, WORLD_QUALITY.shadowSize);
    key.shadow.camera.left = -4;
    key.shadow.camera.right = 4;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 18;
    key.shadow.bias = -0.0003;
    key.shadow.normalBias = 0.012;
    key.shadow.radius = 3;
    rim.position.set(3, 1.6, -4);
    scene.add(ambient, key, key.target, rim);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({
        color: "#2036a7",
        roughness: 0.87,
        metalness: 0,
      }),
    );
    floor.name = "seamless-cobalt-floor";
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.27;
    floor.receiveShadow = true;
    scene.add(floor);
    const fail = () => {
      if (!alive) return;
      contextLost = true;
      cancelAnimationFrame(raf);
      raf = 0;
      setFailed(true);
      latest.current.onFailure?.(
        "The 3D view is unavailable; the complete practice path is still available.",
      );
      element.dataset.worldRenderer = "fallback";
    };
    const isStill = () => latest.current.paused || latest.current.reducedMotion;
    const takeStats = (frameMs: number): WorldStats => ({
      triangles: renderer!.info.render.triangles,
      calls: renderer!.info.render.calls,
      geometries: renderer!.info.memory.geometries,
      textures: renderer!.info.memory.textures,
      dpr,
      quality: mobile ? "mobile" : "desktop",
      chapter:
        worldChapters[Math.round(clampWorldProgress(latest.current.progress))]
          .id,
      frameMs,
    });
    const render = (now: number) => {
      raf = 0;
      if (
        !alive ||
        !renderer ||
        !model ||
        contextLost ||
        document.hidden ||
        !visible
      )
        return;
      const raw = lastFrame ? (now - lastFrame) / 1000 : 1 / 60,
        dt = Math.min(raw, 1 / 30);
      lastFrame = now;
      const exact = clampWorldProgress(latest.current.progress),
        still = isStill();
      smooth = still
        ? Math.round(exact)
        : THREE.MathUtils.lerp(smooth, exact, 1 - Math.exp(-7 * dt));
      if (Math.abs(smooth - exact) < 0.0002 && !still) smooth = exact;
      const { a, b, local } = worldSegment(smooth),
        t = local * local * (3 - 2 * local),
        camA = mobile ? a.mobile : a.camera,
        camB = mobile ? b.mobile : b.camera;
      position
        .copy(aVector.fromArray(camA.position))
        .lerp(bVector.fromArray(camB.position), t);
      target
        .copy(aVector.fromArray(camA.target))
        .lerp(bVector.fromArray(camB.target), t);
      camera.position.copy(position);
      camera.fov = THREE.MathUtils.lerp(camA.fov, camB.fov, t);
      camera.lookAt(target);
      camera.updateProjectionMatrix();
      key.intensity = THREE.MathUtils.lerp(a.key, b.key, t);
      ambient.intensity = THREE.MathUtils.lerp(a.fill, b.fill, t);
      const nearest = worldChapters[Math.round(smooth)];
      model.note.visible = nearest.focus === "note";
      model.anchors.visible = nearest.focus === "anchors";
      model.pulse.visible = nearest.focus === "pulse";
      const pluckAge = (now - pluckAt) / 1000,
        plucking = lastPluck >= 0 && pluckAge < 0.8 && !still;
      if (lastPluck >= 0) {
        if (plucking) model.updatePluck(lastPluck, pluckAge, false);
        else {
          model.resetPluck();
          lastPluck = -1;
        }
      }
      // Only an explicit pluck causes local motion; there is no ambient orbit or pulse.
      model.pulse.scale.setScalar(
        plucking
          ? 1 + Math.sin(Math.min(1, pluckAge / 0.8) * Math.PI) * 0.025
          : 1,
      );
      renderer.render(scene, camera);
      const stats = takeStats(raw * 1000);
      element.dataset.triangles = String(stats.triangles);
      element.dataset.drawCalls = String(stats.calls);
      element.dataset.dpr = String(dpr);
      element.dataset.worldChapter = stats.chapter;
      element.dataset.worldMotion = still ? "still" : "scroll";
      if (!reported) {
        reported = true;
        latest.current.onReady?.(stats);
      }
      warmFrames++;
      if (
        warmFrames > 20 &&
        raw > 0.032 &&
        raw < 0.2 &&
        Math.abs(smooth - exact) > 0.01
      )
        slowFrames++;
      else slowFrames = Math.max(0, slowFrames - 1);
      if (slowFrames > 100 && dpr > 1) {
        dpr = Math.max(1, dpr - 0.25);
        renderer.setPixelRatio(dpr);
        renderer.setSize(width, height, false);
        slowFrames = 0;
      }
      if (!still && (Math.abs(smooth - exact) > 0.0002 || plucking))
        raf = requestAnimationFrame(render);
    };
    const invalidate = () => {
      if (!raf && alive && !document.hidden && visible && !contextLost) {
        lastFrame = 0;
        raf = requestAnimationFrame(render);
      }
    };
    const pluck = (index: number) => {
      if (!model || index < 0 || index > 5) return;
      if (lastPluck >= 0) model.resetPluck();
      lastPluck = index;
      pluckAt = performance.now();
      invalidate();
    };
    const study = (note: StudyNote | null, chord: string | null) => {
      if (!model) return;
      const noteValid = model.updateStudyNote(note),
        chordValid = model.updateStudyChord(chord);
      element.dataset.studyNote = String(model.note.userData.studyNote);
      element.dataset.studyChord = String(model.anchors.userData.studyChord);
      element.dataset.studyValid = String(noteValid && chordValid);
      invalidate();
    };
    const resize = () => {
      if (!renderer || !alive) return;
      const rect = element.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      mobile = width < 850;
      dpr = Math.min(
        window.devicePixelRatio || 1,
        mobile ? WORLD_QUALITY.mobileDpr : WORLD_QUALITY.desktopDpr,
      );
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      renderer.shadowMap.enabled = !mobile;
      key.castShadow = !mobile;
      camera.aspect = width / height;
      camera.setViewOffset(
        width,
        height,
        mobile ? 0 : -width * 0.22,
        mobile ? height * 0.24 : 0,
        width,
        height,
      );
      camera.updateProjectionMatrix();
      invalidate();
    };
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
        lastFrame = 0;
      } else invalidate();
    };
    const contextLoss = (event: Event) => {
      event.preventDefault();
      fail();
    };
    const raycaster = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    const hitString = (event: PointerEvent) => {
      if (!renderer || !model) return null;
      const chapter = clampWorldProgress(latest.current.progress);
      if (
        !(chapter >= 0.65 && chapter <= 1.4) &&
        !(chapter >= 1.65 && chapter <= 3.4) &&
        !(chapter >= 3.7 && chapter <= 4.3)
      )
        return null;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(model.strings, false)[0]?.object
        .userData.stringIndex as number | undefined;
    };
    const clickString = (event: PointerEvent) => {
      const index = hitString(event);
      if (index !== undefined && index !== null) {
        pluck(index);
        latest.current.onPluck?.(index);
      }
    };
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.07;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      // Capture a small procedural studio once. The panels illuminate reflections
      // without becoming painted highlights or visible geometry in the guitar scene.
      const studio = new THREE.Scene();
      const roomGeometry = new THREE.BoxGeometry(24, 24, 24);
      const roomMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setRGB(0.025, 0.032, 0.048),
        side: THREE.BackSide,
        toneMapped: false,
      });
      studio.add(new THREE.Mesh(roomGeometry, roomMaterial));
      const panelGeometry = new THREE.PlaneGeometry(1, 1);
      const panelMaterials: THREE.MeshBasicMaterial[] = [];
      const panels = [
        { position: [-3.7, 0.6, 7.5], size: [1.8, 10], strength: 4.2 },
        { position: [5.0, 2.8, 4.2], size: [2.4, 7], strength: 1.7 },
        { position: [-1.2, 7.0, -3.5], size: [5.5, 3.5], strength: 1.1 },
      ];
      for (const definition of panels) {
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setRGB(
            definition.strength,
            definition.strength,
            definition.strength,
          ),
          side: THREE.DoubleSide,
          toneMapped: false,
        });
        panelMaterials.push(material);
        const panel = new THREE.Mesh(panelGeometry, material);
        panel.position.set(
          definition.position[0],
          definition.position[1],
          definition.position[2],
        );
        panel.scale.set(definition.size[0], definition.size[1], 1);
        panel.lookAt(0, 0, 0);
        studio.add(panel);
      }
      const pmrem = new THREE.PMREMGenerator(renderer);
      try {
        environmentTarget = pmrem.fromScene(studio, 0.065, 0.1, 40, {
          size: 256,
        });
        scene.environment = environmentTarget.texture;
        scene.environmentIntensity = 0.12;
      } finally {
        pmrem.dispose();
        roomGeometry.dispose();
        roomMaterial.dispose();
        panelGeometry.dispose();
        panelMaterials.forEach((material) => material.dispose());
        studio.clear();
      }

      renderer.domElement.style.cssText =
        "display:block;width:100%;height:100%;touch-action:pan-y;";
      renderer.domElement.setAttribute(
        "aria-label",
        "Three-dimensional acoustic guitar. String sounds and practice actions are also available in the page controls.",
      );
      renderer.domElement.setAttribute("role", "img");
      renderer.domElement.addEventListener("webglcontextlost", contextLoss);
      renderer.domElement.addEventListener("pointerdown", clickString);
      element.appendChild(renderer.domElement);
      model = createGuitarModel();
      scene.add(model.root);
      element.dataset.worldRenderer = "three";
      runtime.current = { invalidate, pluck, study };
      study(latest.current.studyNote, latest.current.studyChord);
      resize();
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(element);
      observer = new IntersectionObserver(
        (entries) => {
          visible = entries[0]?.isIntersecting ?? true;
          if (visible) invalidate();
          else {
            cancelAnimationFrame(raf);
            raf = 0;
            lastFrame = 0;
          }
        },
        { threshold: 0 },
      );
      observer.observe(element);
      document.addEventListener("visibilitychange", visibility);
      invalidate();
    } catch {
      fail();
    }
    return () => {
      alive = false;
      runtime.current = null;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      resizeObserver?.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      if (renderer) {
        renderer.domElement.removeEventListener(
          "webglcontextlost",
          contextLoss,
        );
        renderer.domElement.removeEventListener("pointerdown", clickString);
        renderer.domElement.remove();
      }
      model?.dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      key.shadow.map?.dispose();
      scene.environment = null;
      environmentTarget?.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
      scene.clear();
    };
  }, []);
  useEffect(() => {
    runtime.current?.invalidate();
  }, [progress, reducedMotion, paused]);
  useEffect(() => {
    if (activeString !== null) runtime.current?.pluck(activeString);
  }, [activeString, pluckNonce]);
  useEffect(() => {
    runtime.current?.study(studyNote, studyChord);
  }, [studyNote, studyChord]);
  return (
    <div
      ref={host}
      className={`guitar-world ${className}`}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: WORLD_COLORS.cobalt,
      }}
      data-world-state={failed ? "fallback" : "ready"}
    >
      {failed && (
        <div
          role="img"
          aria-label="Acoustic guitar reference. All teaching and practice controls remain available."
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "#f1f3fa",
          }}
        >
          {poster ? (
            <picture
              style={{ display: "block", width: "100%", height: "100%" }}
            >
              <source
                media="(max-width:800px)"
                srcSet="/world-guitar-poster-mobile.png"
              />
              <img
                src="/world-guitar-poster.png"
                alt="Yamaha FS80C Black teaching model with concert cutaway body, six strings and chrome tuning machines"
                onError={() => setPoster(false)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </picture>
          ) : (
            <p
              style={{
                maxWidth: 230,
                textAlign: "center",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              The 3D view is unavailable.
              <br />
              Your guitar guides and practice controls are ready below.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
export default GuitarWorld;
