import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getSceneAccent } from "./sceneState";

// Cycle palette derived from the current --section-accent: the accent plus
// three hue rotations (90deg apart) so the orb keeps cycling through a
// harmonious palette that follows the section morph.
let palette: THREE.Color[] | null = null;
let paletteAccent = "";

function getPalette(accent: string): THREE.Color[] {
  if (!palette || paletteAccent !== accent) {
    paletteAccent = accent;
    palette = [0, 0.25, 0.5, 0.75].map((h) => new THREE.Color(accent).offsetHSL(h, 0, 0));
  }
  return palette;
}

export function ColorBlendScene() {
  const orbRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);
  const tmp = useRef(new THREE.Color());

  useFrame(({ clock }) => {
    if (matRef.current) {
      const colors = getPalette(getSceneAccent());
      const t = clock.getElapsedTime() * 0.1;
      const idx = Math.floor(t) % colors.length;
      const next = (idx + 1) % colors.length;
      const mix = t - Math.floor(t);
      matRef.current.color.copy(tmp.current.copy(colors[idx]).lerp(colors[next], mix));
    }
    if (orbRef.current) {
      orbRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={orbRef} position={[0, 0, -3]}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshBasicMaterial ref={matRef} color="#00ff9d" transparent opacity={0.06} wireframe />
    </mesh>
  );
}
