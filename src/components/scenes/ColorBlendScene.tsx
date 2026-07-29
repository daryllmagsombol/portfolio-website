import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COLORS = [0x00ff9d, 0xd97757, 0xa78bfa, 0xf59e0b];

export function ColorBlendScene() {
  const orbRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (orbRef.current) {
      const t = clock.getElapsedTime() * 0.1;
      const idx = Math.floor(t) % COLORS.length;
      const next = (idx + 1) % COLORS.length;
      const mix = t - Math.floor(t);
      const color = new THREE.Color(COLORS[idx]).lerp(new THREE.Color(COLORS[next]), mix);
      (orbRef.current.material as THREE.MeshBasicMaterial).color.copy(color);
      orbRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={orbRef} position={[0, 0, -3]}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshBasicMaterial color="#00ff9d" transparent opacity={0.06} wireframe />
    </mesh>
  );
}
