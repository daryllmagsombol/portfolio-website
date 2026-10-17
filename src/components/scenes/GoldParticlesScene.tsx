import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { setSceneAccent } from "./sceneState";

const COUNT = 60;
const positions = new Float32Array(COUNT * 3);
const speeds = new Float32Array(COUNT);
for (let i = 0; i < COUNT; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 8;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
  speeds[i] = 0.1 + Math.random() * 0.3;
}

export function GoldParticlesScene() {
  const ref = useRef<THREE.Points>(null!);
  const matRef = useRef<THREE.PointsMaterial>(null!);
  const accent = useRef(new THREE.Color());

  useFrame(() => {
    setSceneAccent(accent.current);
    if (matRef.current) {
      matRef.current.color.copy(accent.current);
    }
    if (ref.current) {
      const pos = ref.current.geometry.attributes.position;
      for (let i = 0; i < COUNT; i++) {
        const y = pos.array[i * 3 + 1] + speeds[i] * 0.005;
        pos.array[i * 3 + 1] = y > 3 ? -3 : y;
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial ref={matRef} color="#f59e0b" size={0.04} transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}
