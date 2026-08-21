// store/traceStore.ts
import { create } from 'zustand';
import { TraceEvent, GraphNode, GraphEdge } from '@/types/trace';
import { buildGraph } from '@/lib/buildGraph';

interface TraceState {
  events: TraceEvent[];       // events received so far
  nodes: GraphNode[];
  edges: GraphEdge[];
  pushEvent: (event: TraceEvent) => void;
  reset: () => void;
}

export const useTraceStore = create<TraceState>((set, get) => ({
  events: [],
  nodes: [],
  edges: [],

  pushEvent: (event) => {
    const events = [...get().events, event];
    const graph = deriveGraph(events);
    set({ events, ...graph });
  },

  reset: () => set({ events: [], nodes: [], edges: [] }),
}));

// Reuse the same layered-layout logic from lib/buildGraph.ts
function deriveGraph(events: TraceEvent[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  return buildGraph(events);
}
