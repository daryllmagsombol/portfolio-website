import { useEffect, useLayoutEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { HeroScene } from "./scenes/HeroScene";
import { NeuralScene } from "./scenes/NeuralScene";
import { WarmShapesScene } from "./scenes/WarmShapesScene";
import { BlobScene } from "./scenes/BlobScene";
import { GoldParticlesScene } from "./scenes/GoldParticlesScene";
import { ColorBlendScene } from "./scenes/ColorBlendScene";
import { useSection } from "../context/useSection";
import { startSceneInputs, stopSceneInputs } from "./scenes/sceneState";
import { usePerfMode } from "../hooks/usePerformanceMode";

/** Scene crossfade duration (brief: 150-400ms). */
const FADE_MS = 300;

const scenes: ComponentType[] = [
  HeroScene,
  NeuralScene,
  WarmShapesScene,
  BlobScene,
  GoldParticlesScene,
  ColorBlendScene,
];

function collectMaterials(group: THREE.Group): THREE.Material[] {
  const materials: THREE.Material[] = [];
  group.traverse((obj) => {
    const material = (obj as THREE.Mesh).material;
    if (material) {
      if (Array.isArray(material)) materials.push(...material);
      else materials.push(material);
    }
  });
  return materials;
}

/**
 * Wraps one scene and crossfades its materials' opacity in/out (150-400ms)
 * instead of mounting/unmounting abruptly. Mounted by SceneManager for the
 * active + adjacent scenes (±1 lazy mount); when a scene leaves that range the
 * parent keeps it mounted (fadingOut list) until the fade-out completes, then
 * unmounts via onFadedOut.
 */
function FadeGroup({
  visible,
  onFadedOut,
  children,
}: {
  visible: boolean;
  onFadedOut: () => void;
  children: ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const baseOpacityRef = useRef<Map<THREE.Material, number>>(new Map());
  const firstRunRef = useRef(true);
  const onFadedOutRef = useRef(onFadedOut);

  // Keep the latest onFadedOut callback without re-running the layout effect.
  useEffect(() => {
    onFadedOutRef.current = onFadedOut;
  });

  useLayoutEffect(() => {
    const group = groupRef.current;
    const materials = collectMaterials(group);
    if (materials.length === 0) return;

    // Remember each material's authored base opacity (0.06..0.6 per scene).
    materials.forEach((material) => {
      if (!baseOpacityRef.current.has(material)) {
        baseOpacityRef.current.set(material, material.opacity);
      }
    });
    const baseOpacity = baseOpacityRef.current;

    gsap.killTweensOf(materials);

    if (visible) {
      // First mount: start hidden, then fade in to each material's base opacity.
      if (firstRunRef.current) {
        firstRunRef.current = false;
        materials.forEach((material) => { material.opacity = 0; });
      }
      gsap.to(materials, {
        opacity: (i: number) => baseOpacity.get(materials[i]) ?? materials[i].opacity,
        duration: FADE_MS / 1000,
        ease: "power1.out",
        overwrite: true,
      });
    } else {
      gsap.to(materials, {
        opacity: 0,
        duration: FADE_MS / 1000,
        ease: "power1.in",
        overwrite: true,
        onComplete: () => onFadedOutRef.current(),
      });
    }
  }, [visible]);

  // Kill any in-flight tween if the group unmounts (whole-canvas unmount).
  useEffect(() => {
    const group = groupRef.current;
    return () => {
      if (group) gsap.killTweensOf(collectMaterials(group));
    };
  }, []);

  return <group ref={groupRef}>{children}</group>;
}

function SceneManager() {
  const activeSection = useSection();
  const { scene } = useThree();
  const [fadingOut, setFadingOut] = useState<number[]>([]);
  const prevMountedRef = useRef<Set<number>>(new Set());

  // Control rendering via Page Visibility API
  useEffect(() => {
    const handleVisibility = () => {
      scene.visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [scene]);

  // Track DOM-driven scene inputs (accent morph + window mouse parallax).
  useEffect(() => {
    startSceneInputs();
    return () => stopSceneInputs();
  }, []);

  // When the active section moves, scenes that left the ±1 window start a
  // fade-out (they stay mounted until FadeGroup reports completion).
  useEffect(() => {
    const next = new Set(
      [activeSection - 1, activeSection, activeSection + 1].filter(
        (i) => i >= 0 && i < scenes.length
      )
    );
    const leaving = [...prevMountedRef.current].filter((i) => !next.has(i));
    prevMountedRef.current = next;
    if (leaving.length > 0) {
      setFadingOut((prev) => Array.from(new Set([...prev, ...leaving])));
    }
  }, [activeSection]);

  const handleFadedOut = (index: number) => {
    setFadingOut((prev) => prev.filter((i) => i !== index));
  };

  return (
    <>
      {scenes.map((Scene, i) => {
        const visible = Math.abs(i - activeSection) <= 1;
        if (!visible && !fadingOut.includes(i)) return null;
        return (
          <FadeGroup key={i} visible={visible} onFadedOut={() => handleFadedOut(i)}>
            <Scene />
          </FadeGroup>
        );
      })}
    </>
  );
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export function WorldBackground() {
  const isReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const perfMode = usePerfMode();

  // Skip the WebGL canvas entirely when:
  //   - the user prefers reduced motion (accessibility)
  //   - the adaptive perf monitor flagged low-power mode (low-end devices,
  //     throttled devices, or sustained frame drops)
  // We deliberately do NOT gate on viewport width: high-end phones handle
  // the canvas fine, and the perf monitor catches thermal throttling after
  // ~2s. A flat mobile-skip would hide the world effects from every mobile
  // visitor regardless of capability.
  if (isReduced) return null;
  if (perfMode === "low") return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[0.5, 1.5]}
        gl={{ antialias: false, alpha: true }}
      >
        <SceneManager />
      </Canvas>
    </div>
  );
}
