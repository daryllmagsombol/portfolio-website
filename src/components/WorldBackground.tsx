import { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { HeroScene } from "./scenes/HeroScene";
import { NeuralScene } from "./scenes/NeuralScene";
import { WarmShapesScene } from "./scenes/WarmShapesScene";
import { BlobScene } from "./scenes/BlobScene";
import { GoldParticlesScene } from "./scenes/GoldParticlesScene";
import { ColorBlendScene } from "./scenes/ColorBlendScene";
import { useActiveSection } from "../hooks/useActiveSection";

const scenes = [
  HeroScene,
  NeuralScene,
  WarmShapesScene,
  BlobScene,
  GoldParticlesScene,
  ColorBlendScene,
];

function SceneManager() {
  const activeSection = useActiveSection();
  const { scene } = useThree();

  // Control rendering via Page Visibility API
  useEffect(() => {
    const handleVisibility = () => {
      scene.visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [scene]);

  return (
    <>
      {scenes.map((Scene, i) => {
        const isActive = i === activeSection;
        const isAdjacent = Math.abs(i - activeSection) <= 1;
        return (isActive || isAdjacent) ? <Scene key={i} /> : null;
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
  const isMobile = useMediaQuery("(max-width: 700px)");

  if (isReduced) return null;
  if (isMobile) return null;

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
