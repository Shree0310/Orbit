// components/Scene.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { buildGraph } from '@/lib/buildGraph';
import { mockTrace } from '@/lib/mockTrace';

const statusColor = { pending: '#888888', success: '#4ade80', error: '#f87171' } as const;

export default function Scene() {
  const { nodes, edges } = buildGraph(mockTrace);
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  return (
    <Canvas camera={{ position: [6, 4, 10], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <OrbitControls />

      {edges.map((edge) => {
        const from = nodeById.get(edge.from)?.position;
        const to = nodeById.get(edge.to)?.position;
        if (!from || !to) return null;
        return <Line key={edge.id} points={[from, to]} color="#555" lineWidth={1} />;
      })}

      {nodes.map((node) => (
        <mesh key={node.id} position={node.position}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color={statusColor[node.status]} />
        </mesh>
      ))}
    </Canvas>
  );
}
