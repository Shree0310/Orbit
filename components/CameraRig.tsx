// components/CameraRig.tsx
'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useTraceStore } from '@/store/traceStore';

interface CameraRigProps {
  isUserControlling: React.MutableRefObject<boolean>;
}

export default function CameraRig({ isUserControlling }: CameraRigProps) {
  const nodes = useTraceStore((s) => s.nodes);
  const target = useRef(new Vector3());
  const { camera } = useThree();

  // track the most recently added node as the follow target
  const latest = nodes[nodes.length - 1];

  useFrame(() => {
    if (!latest || isUserControlling.current) return;
    target.current.lerp(
      new Vector3(...latest.position),
      0.03 // lower = slower/smoother drift, higher = snappier
    );
    camera.lookAt(target.current);
  });

  return null;
}
