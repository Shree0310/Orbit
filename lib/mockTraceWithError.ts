// lib/mockTraceWithError.ts
import { TraceEvent } from '@/types/trace';

// Mock trace with an error to demonstrate error-state visuals
export const mockTraceWithError: TraceEvent[] = [
  { type: 'trace_start', traceId: 't2', label: 'Deploy application', timestamp: 0 },
  { type: 'call_start', id: 'a', parentId: null, toolName: 'validateConfig', args: {}, timestamp: 10 },
  { type: 'call_start', id: 'b', parentId: 'a', toolName: 'buildAssets', args: {}, timestamp: 20 },
  { type: 'call_start', id: 'c', parentId: 'a', toolName: 'runTests', args: {}, timestamp: 25 },
  { type: 'call_token', id: 'b', tokenCount: 15, timestamp: 30 },
  { type: 'call_end', id: 'b', status: 'success', timestamp: 60 },
  { type: 'call_token', id: 'c', tokenCount: 10, timestamp: 50 },
  { type: 'call_end', id: 'c', status: 'error', timestamp: 70 }, // Test failure
  { type: 'call_end', id: 'a', status: 'error', timestamp: 75 }, // Parent fails due to child error
  { type: 'trace_end', traceId: 't2', timestamp: 80 },
];
