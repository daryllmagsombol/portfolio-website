import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type ShapeSpec = { geo: THREE.IcosahedronGeometry; pos: THREE.Vector3; speed: number; rotSpeed: number };

const meshes: ShapeSpec[] = [];
for (let i = 0; i < 4; i++) {
  const geo = new THREE.IcosahedronGeometry(0.3 + Math.random() * 0.4, 1);
  const pos = new THREE.Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 5, -2 - Math.random() * 2);
  const speed = 0.1 + Math.random() * 0.2;
  meshes.push({ geo, pos, speed, rotSpeed: (Math.random() - 0.5) * 0.3 });
}

export function WarmShapesScene() {
  const refs = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    refs.current.forEach((mesh, i) => {
      if (mesh) {
        mesh.rotation.x += meshes[i].rotSpeed * 0.01;
        mesh.rotation.y += meshes[i].rotSpeed * 0.01;
        mesh.position.y = meshes[i].pos.y + Math.sin(clock.getElapsedTime() * meshes[i].speed) * 0.3;
      }
    });
  });

  return (
    <group>
      {meshes.map((m, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) refs.current[i] = el; }}
          geometry={m.geo}
          position={m.pos}
        >
          <meshBasicMaterial color="#d97757" transparent opacity={0.06} wireframe />
        </mesh>
      ))}
    </group>
  );
}
