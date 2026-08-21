# Achievr Integration Guide

This document explains how Orbit connects to Achievr's AI Project Planner to visualize real tool-calling traces.

## Current Implementation (M4 - Option A)

Orbit currently uses **simulated Achievr data** to demonstrate the integration pattern. The real Achievr integration requires adding trace instrumentation to Achievr's codebase.

### What's Working Now

1. **Adapter** (`lib/achievrAdapter.ts`) - Converts Achievr tool call responses to Orbit TraceEvents
2. **Sample Endpoint** (`/api/traces/achievr-sample`) - Returns a realistic mock Achievr planner session
3. **Dynamic Trace Loading** (`hooks/useReplayTrace.ts`) - Fetches traces from API instead of hardcoded data
4. **Scene Configuration** - Currently set to `source: 'achievr-sample'` to demonstrate real tool names

### Trace Sources Available

Change the source in `components/Scene.tsx`:

```typescript
// Mock trace (original 4-node example)
useReplayTrace({ source: 'mock' });

// Achievr sample (8 tool calls: explain_approach, list_features, 5× create_task_card, suggest_actions)
useReplayTrace({ source: 'achievr-sample' });

// Latest stored trace (from POST /api/traces/latest)
useReplayTrace({ source: 'latest' });
```

---

## Adding Real Achievr Instrumentation

To connect to **real Achievr planner runs**, add this to Achievr's codebase:

### Step 1: Install Orbit's adapter in Achievr

Copy `lib/achievrAdapter.ts` into Achievr's project (or import if Orbit is a workspace package):

```bash
# If Achievr and Orbit are in the same monorepo:
cp orbit/lib/achievrAdapter.ts achievr/lib/orbitAdapter.ts
```

### Step 2: Instrument the planner API route

In Achievr's `/src/app/api/planner/route.ts`, after processing tool calls:

```typescript
// Add at top
import { achievrToTraceEvents } from '@/lib/orbitAdapter';

// After building the response (around line 440):
const response = {
  toolCalls,
  text: textContent,
  conversationHistory: newHistory,
  _meta: { mode: 'real', source: 'claude-ai' }
};

// NEW: Send trace to Orbit
const traceEvents = achievrToTraceEvents(response);
await fetch('http://localhost:3001/api/traces/latest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ events: traceEvents })
}).catch(err => console.warn('Failed to send trace to Orbit:', err));

return Response.json(response);
```

### Step 3: Update Orbit to use 'latest' source

In `components/Scene.tsx`:

```typescript
useReplayTrace({ source: 'latest' });
```

### Step 4: Test End-to-End

1. Start Orbit: `cd orbit && npm run dev` (runs on :3001)
2. Start Achievr: `cd achievr && npm run dev` (runs on :3000)
3. Open Achievr at http://localhost:3000/planner
4. Send a message to the AI planner (e.g., "Plan a mobile app")
5. Switch to Orbit at http://localhost:3001
6. Refresh to see the trace replay with real tool names:
   - `explain_approach`
   - `list_features`
   - `create_task_card` (multiple)
   - `suggest_actions`

---

## Tool Call Mapping

Achievr's 5 planner tools map to Orbit nodes:

| Achievr Tool | Description | Typical Count |
|--------------|-------------|---------------|
| `explain_approach` | Initial planning context + bullets | 1 per turn |
| `list_features` | MVP feature enumeration | 0-1 per turn |
| `create_task_card` | Individual task creation | 3-6 per turn |
| `send_text` | Plain text response | 0-1 per turn |
| `suggest_actions` | Interactive button choices | 1 per turn (mandatory) |

**Note**: Achievr's tool calls are **flat** (no parent/child hierarchy). All nodes appear as siblings in Orbit's graph.

---

## Future: Live Streaming (M4 - Option B)

To enable **real-time trace streaming** without page refresh:

### Server-Sent Events Approach

1. **Achievr**: Create `/api/planner/stream` that emits tool calls as SSE
2. **Orbit**: Replace `fetch()` with `EventSource` in `useReplayTrace`
3. **Benefit**: Watch traces build live as Achievr's planner runs

### WebSocket Approach

1. **Shared server**: Run a WebSocket server both apps connect to
2. **Achievr**: Emit trace events as they happen
3. **Orbit**: Subscribe to trace stream, push events immediately (no replay delay)
4. **Benefit**: Bi-directional, can support multiple concurrent traces

---

## Troubleshooting

**"Failed to fetch trace" error**:
- Check Orbit dev server is running on port 3001
- Verify API route exists: http://localhost:3001/api/traces/achievr-sample
- Check browser console for CORS or network errors

**Graph looks empty**:
- Verify trace has `call_start` events (not just `trace_start`/`trace_end`)
- Check trace timestamps are valid numbers
- Use browser dev tools Network tab to inspect `/api/traces/*` response

**Timestamps seem wrong**:
- Achievr uses `Date.now()` for real timestamps
- Orbit normalizes to start from 0 on replay
- Adjust `SPEED` constant in `useReplayTrace.ts` to slow/speed replay

---

## API Reference

### POST /api/traces/latest

Store a new trace for Orbit to display.

**Request**:
```json
{
  "events": [
    { "type": "trace_start", "traceId": "...", "label": "...", "timestamp": 0 },
    { "type": "call_start", "id": "...", "parentId": null, "toolName": "...", "args": {...}, "timestamp": 10 },
    { "type": "call_end", "id": "...", "status": "success", "timestamp": 100 }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "eventCount": 24
}
```

### GET /api/traces/latest

Retrieve the most recently stored trace.

**Response**: Array of `TraceEvent` objects

### GET /api/traces/achievr-sample

Get a pre-built realistic Achievr planner trace (8 tool calls).

**Response**: Array of `TraceEvent` objects

---

## Architecture Notes

- **Adapter pattern**: `achievrAdapter.ts` is the only file that knows about Achievr's response shape
- **Schema contract**: `types/trace.ts` is shared between Orbit and all data sources
- **No Orbit changes needed**: Switching from mock → real traces required zero changes to graph rendering, store, or UI
- **Flat vs hierarchical**: Mock trace was branching for M1 layout testing; real Achievr traces are flat (all siblings)

---

## Demo Script

Quickest way to show M4 working:

1. Open http://localhost:3001 with `source: 'achievr-sample'` active
2. Reload page
3. Watch 8 nodes appear sequentially with real Achievr tool names:
   - Gray pending spheres scale in with easing
   - Names appear above nodes: "explain_approach", "list_features", "create_task_card", etc.
   - All resolve to green (success)
   - Camera auto-follows as graph builds

This proves Orbit works on real tool-calling data, not just the handcrafted 4-node mock.
