// types/trace.ts
export type TraceEvent =
  | { type: 'trace_start'; traceId: string; label: string; timestamp: number }
  | { type: 'call_start'; id: string; parentId: string | null; toolName: string; args: unknown; timestamp: number }
  | { type: 'call_token'; id: string; tokenCount: number; timestamp: number } // drives edge pulse in M2+
  | { type: 'call_end'; id: string; status: 'success' | 'error'; result?: unknown; timestamp: number }
  | { type: 'trace_end'; traceId: string; timestamp: number };

export interface GraphNode {
  id: string;
  parentId: string | null;
  toolName: string;
  status: 'pending' | 'success' | 'error';
  position: [number, number, number];
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
}
