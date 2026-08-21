// hooks/useReplayTrace.ts
import { useEffect } from 'react';
import { mockTrace } from '@/lib/mockTrace';
import { useTraceStore } from '@/store/traceStore';

const SPEED = 10; // 1 trace-ms = 10 real ms, so a 110ms trace plays over ~1.1s

export function useReplayTrace() {
  const pushEvent = useTraceStore((s) => s.pushEvent);
  const reset = useTraceStore((s) => s.reset);

  useEffect(() => {
    reset();
    const timers = mockTrace.map((event) =>
      setTimeout(() => pushEvent(event), event.timestamp * SPEED)
    );
    return () => timers.forEach(clearTimeout);
  }, [pushEvent, reset]);
}
