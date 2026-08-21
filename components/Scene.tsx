// components/Scene.tsx
'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Text, Billboard } from '@react-three/drei';
import { useTraceStore } from '@/store/traceStore';
import { useReplayTrace } from '@/hooks/useReplayTrace';
import { GraphNode } from '@/types/trace';
import CameraRig from './CameraRig';
import * as THREE from 'three';

const statusColor = { pending: '#888888', success: '#4ade80', error: '#f87171' } as const;

function AnimatedNode({ node }: { node: GraphNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const [age, setAge] = useState(0);
  const prevStatus = useRef(node.status);
  const resolvePulse = useRef(0);

  // Detect status transition from pending to success/error
  if (prevStatus.current === 'pending' && node.status !== 'pending') {
    resolvePulse.current = 1;
  }
  prevStatus.current = node.status;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    setAge((a) => a + delta);

    // entrance ease: 0 -> 1 over ~0.4s, eased not linear
    const entranceT = Math.min(age / 0.4, 1);
    const eased = 1 - Math.pow(1 - entranceT, 3); // cubic ease-out

    // resolve pulse: brief overshoot then settle back to 1
    resolvePulse.current = Math.max(0, resolvePulse.current - delta * 2);
    const pulseScale = 1 + resolvePulse.current * 0.3;

    // error breathing: slow continuous pulse for error nodes
    let errorBreath = 1;
    if (node.status === 'error') {
      errorBreath = 1 + Math.sin(age * 2) * 0.1; // slow oscillation
    }

    groupRef.current.scale.setScalar(eased * pulseScale * errorBreath);
  });

  return (
    <group ref={groupRef} position={node.position}>
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color={statusColor[node.status]} />
      </mesh>
      <Billboard position={[0, 0.7, 0]}>
        <Text
          fontSize={0.28}
          color="white"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.02}
          outlineColor="black"
        >
          {node.toolName}
        </Text>
      </Billboard>
    </group>
  );
}

export default function Scene() {
  // Switch between 'mock', 'latest', or 'achievr-sample'
  // 'achievr-sample' demonstrates real Achievr planner tool calls
  useReplayTrace({ source: 'achievr-sample' });
  const nodes = useTraceStore((s) => s.nodes);
  const edges = useTraceStore((s) => s.edges);
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const isUserControlling = useRef(false);

  return (
    <Canvas camera={{ position: [15, 12, 24], fov: 60 }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[15, 15, 15]} intensity={1} />
      <OrbitControls
        onStart={() => { isUserControlling.current = true; }}
        onEnd={() => {
          setTimeout(() => { isUserControlling.current = false; }, 2000);
        }}
      />
      <CameraRig isUserControlling={isUserControlling} />

      {edges.map((edge) => {
        const from = nodeById.get(edge.from)?.position;
        const to = nodeById.get(edge.to)?.position;
        if (!from || !to) return null;
        // Hierarchy edges (parent/child) are brighter, sequence edges (temporal) are dimmer
        const color = edge.kind === 'hierarchy' ? '#999' : '#555';
        return <Line key={edge.id} points={[from, to]} color={color} lineWidth={1} />;
      })}

      {nodes.map((node) => (
        <AnimatedNode key={node.id} node={node} />
      ))}
    </Canvas>
  );
}
