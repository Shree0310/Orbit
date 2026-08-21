// lib/buildGraph.ts
import { TraceEvent, GraphNode, GraphEdge } from '@/types/trace';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ~137.5°

export function buildGraph(events: TraceEvent[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  let callIndex = 0; // increments per call_start, drives spiral placement
  let previousId: string | null = null; // tracks the last call_start seen, for sequence edges

  for (const e of events) {
    if (e.type === 'call_start') {
      const i = callIndex++;
      const radius = 2.0 * Math.sqrt(i + 1); // increased from 0.6 to 2.0 for more spacing
      const angle = i * GOLDEN_ANGLE;
      const y = i * 0.8; // increased from 0.15 to 0.8 for more vertical separation

      nodes.set(e.id, {
        id: e.id,
        parentId: e.parentId,
        toolName: e.toolName,
        status: 'pending',
        position: [radius * Math.cos(angle), y, radius * Math.sin(angle)],
      });

      if (e.parentId) {
        // Real hierarchical relationship (parent/child)
        edges.push({
          id: `${e.parentId}->${e.id}`,
          from: e.parentId,
          to: e.id,
          kind: 'hierarchy'
        });
      } else if (previousId) {
        // No formal parent - connect to previous call so the sequence reads visually
        edges.push({
          id: `${previousId}->${e.id}`,
          from: previousId,
          to: e.id,
          kind: 'sequence'
        });
      }

      previousId = e.id;
    }

    if (e.type === 'call_end') {
      const node = nodes.get(e.id);
      if (node) node.status = e.status;
    }
  }

  return { nodes: Array.from(nodes.values()), edges };
}
