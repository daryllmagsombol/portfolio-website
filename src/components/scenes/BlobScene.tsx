import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function BlobScene() {
  const blob1Ref = useRef<THREE.Mesh>(null!);
  const blob2Ref = useRef<THREE.Mesh>(null!);
  const basePositions = useRef<Float32Array[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.3;
    [blob1Ref, blob2Ref].forEach((ref, bi) => {
      if (ref.current) {
        const geo = ref.current.geometry as THREE.SphereGeometry;
        const pos = geo.attributes.position;
        if (!basePositions.current[bi]) {
          basePositions.current[bi] = new Float32Array(pos.array);
        }
        const base = basePositions.current[bi];
        for (let i = 0; i < pos.count; i++) {
          const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2];
          const distort = 0.15 * Math.sin(x * 2 + t) * Math.cos(z * 2 + t * 0.7);
          pos.setXYZ(i, x, y + distort, z);
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
      }
    });
  });

  return (
    <group>
      <mesh ref={blob1Ref} position={[-1.2, 0, -2]}>
        <sphereGeometry args={[0.8, 24, 24]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.08} wireframe />
      </mesh>
      <mesh ref={blob2Ref} position={[1.2, 0, -2]} scale={[-1, 1, 1]}>
        <sphereGeometry args={[0.8, 24, 24]} />
        <meshBasicMaterial color="#4b8bf5" transparent opacity={0.08} wireframe />
      </mesh>
    </group>
  );
}
