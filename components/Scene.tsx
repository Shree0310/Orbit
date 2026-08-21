// components/Scene.tsx
'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, QuadraticBezierLine, Text, Billboard, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useTraceStore } from '@/store/traceStore';
import { useReplayTrace } from '@/hooks/useReplayTrace';
import { GraphNode } from '@/types/trace';
import CameraRig from './CameraRig';
import * as THREE from 'three';
import { colorForTool } from '@/lib/nodeColor';

interface NodeLabelProps {
  position: [number, number, number];
  text: string;
  isActive: boolean;
}

function NodeLabel({ position, text, isActive }: NodeLabelProps) {
  const { camera } = useThree();
  const [opacity, setOpacity] = useState(1);

  useFrame(() => {
    const dist = camera.position.distanceTo(new THREE.Vector3(...position));
    const fade = isActive ? 1 : Math.max(0.15, 1 - dist / 20);
    setOpacity(fade);
  });

  return (
    <Billboard position={[position[0], position[1] + 0.7, position[2]]}>
      <Text
        fontSize={isActive ? 0.32 : 0.22}
        color="white"
        fillOpacity={opacity}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {text}
      </Text>
    </Billboard>
  );
}

interface AnimatedNodeProps {
  node: GraphNode;
  isActive: boolean;
}

function AnimatedNode({ node, isActive }: AnimatedNodeProps) {
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

  const nodeColor = colorForTool(node.toolName);
  // Status shown via emissive intensity instead of hue
  const emissiveIntensity = node.status === 'error' ? 2.5 : node.status === 'pending' ? 0.4 : 1.2;

  return (
    <group ref={groupRef} position={node.position}>
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={emissiveIntensity}
          toneMapped={false}
        />
      </mesh>
      <NodeLabel position={node.position} text={node.toolName} isActive={isActive} />
    </group>
  );
}

interface SceneProps {
  source?: import('@/hooks/useReplayTrace').TraceSource;
  shouldStart?: boolean;
  onComplete?: () => void;
}

export default function Scene({ source = 'achievr-sample', shouldStart = true, onComplete }: SceneProps = {}) {
  const { isComplete } = useReplayTrace({ source, shouldStart });
  const nodes = useTraceStore((s) => s.nodes);
  const edges = useTraceStore((s) => s.edges);
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const isUserControlling = useRef(false);

  // Track most recently added node for label prominence
  const mostRecentNodeId = nodes.length > 0 ? nodes[nodes.length - 1].id : null;

  // Show replay button when complete
  const showReplay = isComplete && onComplete;

  return (
    <>
      <Canvas camera={{ position: [15, 12, 24], fov: 60 }}>
        <color attach="background" args={['#05060a']} />
        <fog attach="fog" args={['#05060a', 15, 40]} />
        <Stars radius={80} depth={40} count={2000} factor={2} fade speed={0.5} />

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

          // Bow the curve outward from the origin slightly, so lines arc rather than cross straight
          const mid: [number, number, number] = [
            (from[0] + to[0]) / 2,
            (from[1] + to[1]) / 2 + 0.4,
            (from[2] + to[2]) / 2,
          ];

          // Hierarchy edges (parent/child) are brighter, sequence edges (temporal) are dimmer
          const color = edge.kind === 'hierarchy' ? '#8892b0' : '#3a4152';

          return (
            <QuadraticBezierLine
              key={edge.id}
              start={from}
              end={to}
              mid={mid}
              color={color}
              lineWidth={1.2}
              transparent
              opacity={0.7}
            />
          );
        })}

        {nodes.map((node) => (
          <AnimatedNode key={node.id} node={node} isActive={node.id === mostRecentNodeId} />
        ))}

        <EffectComposer>
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      {showReplay && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={onComplete}
            className="px-6 py-3 border border-white/30 rounded-full text-sm text-white/80 bg-black/60 backdrop-blur-sm hover:bg-white/10 hover:border-white/50 transition-all duration-200"
          >
            Replay
          </button>
        </div>
      )}
    </>
  );
}
