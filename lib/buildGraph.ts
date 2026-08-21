// lib/buildGraph.ts
import { TraceEvent, GraphNode, GraphEdge } from '@/types/trace';

export function buildGraph(events: TraceEvent[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const depthCounts = new Map<number, number>();
  const depthOf = new Map<string, number>();

  for (const e of events) {
    if (e.type === 'call_start') {
      const depth = e.parentId ? (depthOf.get(e.parentId) ?? 0) + 1 : 0;
      depthOf.set(e.id, depth);
      const siblingIndex = depthCounts.get(depth) ?? 0;
      depthCounts.set(depth, siblingIndex + 1);

      nodes.set(e.id, {
        id: e.id,
        parentId: e.parentId,
        toolName: e.toolName,
        status: 'pending',
        position: [depth * 3, siblingIndex * 2 - 2, 0],
      });

      if (e.parentId) {
        edges.push({ id: `${e.parentId}->${e.id}`, from: e.parentId, to: e.id });
      }
    }

    if (e.type === 'call_end') {
      const node = nodes.get(e.id);
      if (node) node.status = e.status;
    }
  }

  return { nodes: Array.from(nodes.values()), edges };
}
