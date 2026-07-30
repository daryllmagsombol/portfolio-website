import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const points: THREE.Vector3[] = [];
for (let i = 0; i < 30; i++) {
  points.push(new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4));
}

const pairs: number[] = [];
const nodes: number[] = [];
for (let i = 0; i < points.length; i++) {
  nodes.push(points[i].x, points[i].y, points[i].z);
  for (let j = i + 1; j < points.length; j++) {
    const dist = points[i].distanceTo(points[j]);
    if (dist < 3) {
      pairs.push(points[i].x, points[i].y, points[i].z, points[j].x, points[j].y, points[j].z);
    }
  }
}
const linePositions = new Float32Array(pairs);
const nodePositions = new Float32Array(nodes);

export function NeuralScene() {
  const nodeRef = useRef<THREE.Points>(null!);

  useFrame(({ clock }) => {
    if (nodeRef.current) {
      // Pulse all node sizes uniformly via PointsMaterial.size
      const mat = nodeRef.current.material as THREE.PointsMaterial;
      mat.size = 0.06 + Math.sin(clock.getElapsedTime() * 0.5) * 0.02;
    }
  });

  return (
    <group>
      {linePositions.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#00ff9d" transparent opacity={0.08} />
        </lineSegments>
      )}
      <points ref={nodeRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#00ff9d" size={0.06} transparent opacity={0.3} sizeAttenuation />
      </points>
    </group>
  );
}
