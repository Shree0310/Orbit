// hooks/useReplayTrace.ts
import { useEffect, useState } from 'react';
import { mockTrace } from '@/lib/mockTrace';
import { useTraceStore } from '@/store/traceStore';
import { TraceEvent } from '@/types/trace';

const SPEED = 10; // 1 trace-ms = 10 real ms

export type TraceSource = 'mock' | 'latest' | 'achievr-sample';

interface UseReplayTraceOptions {
  source?: TraceSource;
}

export function useReplayTrace(options: UseReplayTraceOptions = {}) {
  const { source = 'mock' } = options;
  const pushEvent = useTraceStore((s) => s.pushEvent);
  const reset = useTraceStore((s) => s.reset);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false; // guards against double-invocation and cleanup races
    let timers: NodeJS.Timeout[] = [];

    async function loadAndReplay() {
      if (cancelled) return;
      setIsLoading(true);
      reset();

      try {
        let events: TraceEvent[];

        if (source === 'mock') {
          // Use local mock trace
          events = mockTrace;
        } else {
          // Fetch from API
          const endpoint = source === 'achievr-sample'
            ? '/api/traces/achievr-sample'
            : '/api/traces/latest';

          const response = await fetch(endpoint);
          if (!response.ok) {
            throw new Error(`Failed to fetch trace: ${response.statusText}`);
          }
          events = await response.json();
        }

        // Normalize timestamps to start from 0
        const minTimestamp = Math.min(...events.map(e => e.timestamp));
        const normalizedEvents = events.map(e => ({
          ...e,
          timestamp: e.timestamp - minTimestamp
        }));

        // Schedule all events
        timers = normalizedEvents.map((event) =>
          setTimeout(() => {
            if (!cancelled) pushEvent(event);
          }, event.timestamp * SPEED)
        );

        if (!cancelled) setIsLoading(false);
      } catch (error) {
        console.error('Failed to load trace:', error);
        // Fallback to mock trace on error
        if (!cancelled) {
          timers = mockTrace.map((event) =>
            setTimeout(() => {
              if (!cancelled) pushEvent(event);
            }, event.timestamp * SPEED)
          );
          setIsLoading(false);
        }
      }
    }

    loadAndReplay();

    return () => {
      // Mark as cancelled to prevent any pending timers from firing
      cancelled = true;
      // Clear all scheduled timers
      timers.forEach(clearTimeout);
    };
  }, [pushEvent, reset, source]);

  return { isLoading };
}
