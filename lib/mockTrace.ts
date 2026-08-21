// lib/mockTrace.ts
import { TraceEvent } from '@/types/trace';

export const mockTrace: TraceEvent[] = [
  { type: 'trace_start', traceId: 't1', label: 'Generate project plan', timestamp: 0 },
  { type: 'call_start', id: 'a', parentId: null, toolName: 'planProject', args: {}, timestamp: 10 },
  { type: 'call_start', id: 'b', parentId: 'a', toolName: 'generateTasks', args: {}, timestamp: 20 },
  { type: 'call_start', id: 'c', parentId: 'a', toolName: 'estimateTimeline', args: {}, timestamp: 25 },
  { type: 'call_end', id: 'b', status: 'success', timestamp: 60 },
  { type: 'call_start', id: 'd', parentId: 'b', toolName: 'prioritizeTasks', args: {}, timestamp: 65 },
  { type: 'call_end', id: 'c', status: 'success', timestamp: 70 },
  { type: 'call_end', id: 'd', status: 'success', timestamp: 100 },
  { type: 'call_end', id: 'a', status: 'success', timestamp: 105 },
  { type: 'trace_end', traceId: 't1', timestamp: 110 },
];
