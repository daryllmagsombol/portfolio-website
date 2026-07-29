import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function GoldParticlesScene() {
  const count = 60;
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      spd[i] = 0.1 + Math.random() * 0.3;
    }
    return [pos, spd];
  }, []);

  const ref = useRef<THREE.Points>(null!);

  useFrame(() => {
    if (ref.current) {
      const pos = ref.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
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
      <pointsMaterial color="#f59e0b" size={0.04} transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}
