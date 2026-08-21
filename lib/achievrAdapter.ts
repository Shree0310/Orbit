// lib/achievrAdapter.ts
import { TraceEvent } from '@/types/trace';

/**
 * Adapter for Achievr's AI Project Planner tool calls.
 * Achievr uses raw Anthropic SDK that returns tool calls as a flat array.
 * Since there's no natural parent/child hierarchy, all tool calls share a common trace root.
 */

export interface AchieverToolCall {
  tool: string;
  args: Record<string, unknown>;
}

export interface AchieverPlannerResponse {
  toolCalls: AchieverToolCall[];
  text?: string;
  conversationHistory?: unknown[];
  _meta?: {
    mode: 'real' | 'demo';
    source: string;
  };
}

/**
 * Convert Achievr planner response to Orbit TraceEvent sequence.
 * Creates a trace with a root node and all tool calls as direct children.
 */
export function achievrToTraceEvents(
  response: AchieverPlannerResponse,
  traceId: string = `achievr-${Date.now()}`,
  baseTimestamp: number = Date.now()
): TraceEvent[] {
  const events: TraceEvent[] = [];

  // Start the trace
  events.push({
    type: 'trace_start',
    traceId,
    label: 'Achievr Project Planner',
    timestamp: baseTimestamp,
  });

  // Since Achievr's tool calls are flat (no parent/child relationships),
  // all tools are children of the root trace
  const toolCalls = response.toolCalls || [];

  toolCalls.forEach((toolCall, index) => {
    const toolId = `${traceId}-tool-${index}`;
    const callStartTime = baseTimestamp + (index * 50); // Stagger by 50ms
    const callEndTime = callStartTime + 100; // Each call takes ~100ms

    // call_start event
    events.push({
      type: 'call_start',
      id: toolId,
      parentId: null, // Flat structure - no parent/child
      toolName: toolCall.tool,
      args: toolCall.args,
      timestamp: callStartTime,
    });

    // Add token event for visual interest (simulate token streaming)
    events.push({
      type: 'call_token',
      id: toolId,
      tokenCount: Math.floor(Math.random() * 20) + 10, // Random 10-30 tokens
      timestamp: callStartTime + 50,
    });

    // call_end event
    events.push({
      type: 'call_end',
      id: toolId,
      status: 'success', // Achievr doesn't expose error info in tool calls
      result: toolCall.args, // The args are effectively the result
      timestamp: callEndTime,
    });
  });

  // End the trace
  events.push({
    type: 'trace_end',
    traceId,
    timestamp: baseTimestamp + (toolCalls.length * 150) + 10,
  });

  return events;
}

/**
 * Example usage with a real Achievr response:
 *
 * const achievrResponse = await fetch('/api/planner', {
 *   method: 'POST',
 *   body: JSON.stringify({ message: 'Plan a mobile app', conversationHistory: [] })
 * }).then(r => r.json());
 *
 * const traceEvents = achievrToTraceEvents(achievrResponse);
 * // Now traceEvents can be fed to Orbit's buildGraph/store
 */
