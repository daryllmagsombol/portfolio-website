import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getScenePointer, setSceneAccent } from "./sceneState";

const COUNT = 250;
const positions = new Float32Array(COUNT * 3);
for (let i = 0; i < COUNT; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 20;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
}

export function HeroScene() {

  const ref = useRef<THREE.Points>(null!);
  const matRef = useRef<THREE.PointsMaterial>(null!);
  const accent = useRef(new THREE.Color());

  useFrame(({ clock }) => {
    setSceneAccent(accent.current);
    // L1: the canvas wrapper has pointer-events-none, so R3F's pointer never
    // updates — drive parallax from the window-tracked pointer instead.
    const p = getScenePointer();
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.02 + p.x * 0.04;
      ref.current.rotation.x = p.y * 0.03;
    }
    if (matRef.current) {
      matRef.current.color.copy(accent.current);
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={0.05}
        color="#00ff9d"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}
