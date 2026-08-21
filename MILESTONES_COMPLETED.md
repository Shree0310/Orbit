# Orbit - Milestones Completed

## Overview
Orbit is a standalone 3D trace visualization tool for AI agent tool-calling pipelines. This document tracks completed milestones.

---

## ✅ M1: Static 3D Graph (COMPLETE)

**Goal**: Render a hardcoded mock trace as a static 3D graph with correct parent/child hierarchy.

**Deliverables**:
- [types/trace.ts](types/trace.ts) - TraceEvent schema matching OpenTelemetry/LangSmith pattern
- [lib/mockTrace.ts](lib/mockTrace.ts) - 4-node branching trace (a→b/c→d)
- [lib/buildGraph.ts](lib/buildGraph.ts) - Graph builder with layout algorithm
- [components/Scene.tsx](components/Scene.tsx) - React Three Fiber scene
- [app/page.tsx](app/page.tsx) - Main page component

**Result**: Mock trace renders with correct hierarchy, edges connecting nodes, status colors (green/gray/red).

---

## ✅ M2: Live Streaming (COMPLETE)

**Goal**: Replace static rendering with live event stream - nodes appear over time, not all at once.

**Deliverables**:
- [store/traceStore.ts](store/traceStore.ts) - Zustand store for incremental state
- [hooks/useReplayTrace.ts](hooks/useReplayTrace.ts) - Replay driver with configurable sources
- Updated Scene.tsx with `AnimatedNode` component (scale-in animation)
- Added `call_token` events to mock trace

**Result**: Graph builds itself over ~1.1 seconds, nodes scale in smoothly (300ms ease), token events flowing through state.

---

## ✅ M2.6: Per-Node Labels (COMPLETE)

**Goal**: Each node displays its toolName as floating text above the sphere.

**Deliverables**:
- Added `<Text>` components from drei
- Wrapped in `<Billboard>` for camera-facing readability
- Black outline for visibility against all colors

**Result**: Tool names visible above each node (planProject, generateTasks, etc.), readable from any rotation angle.

---

## ✅ M3: Camera + Polish (COMPLETE)

**Goal**: Camera auto-follow, polished entrance/exit animations, and distinct error visuals.

**Deliverables**:
- [components/CameraRig.tsx](components/CameraRig.tsx) - Auto-follow latest node with manual override
- Upgraded entrance animation to cubic ease-out with resolve pulse (30% overshoot)
- Error nodes have continuous breathing pulse (sine wave)
- OrbitControls integration with 2s resume delay

**Result**: Camera smoothly tracks newest nodes, nodes ease in with satisfying "pop" on completion, error nodes unmistakable with pulsing animation.

---

## ✅ M4: Real Data Source - Achievr (COMPLETE)

**Goal**: Replace mock trace with real Achievr AI Project Planner tool calls.

**Deliverables**:
- [lib/achievrAdapter.ts](lib/achievrAdapter.ts) - Converts Achievr responses to TraceEvents
- [app/api/traces/achievr-sample/route.ts](app/api/traces/achievr-sample/route.ts) - Sample endpoint with 8 real tool calls
- [app/api/traces/latest/route.ts](app/api/traces/latest/route.ts) - Storage endpoint for real traces
- [ACHIEVR_INTEGRATION.md](ACHIEVR_INTEGRATION.md) - Complete integration guide
- Dynamic trace loading with timestamp normalization

**Achievr Tools Supported**:
1. `explain_approach` - Planning context + bullets
2. `list_features` - MVP feature enumeration
3. `create_task_card` - Individual task creation (5x in sample)
4. `send_text` - Plain text responses
5. `suggest_actions` - Interactive button choices

**Result**: Orbit successfully renders real Achievr planner traces with 8 nodes, proving it works on real AI SDK tool-calling data beyond the handcrafted mock.

---

## ✅ Layout Fix: Spiral for Flat Traces (COMPLETE)

**Problem**: M1's depth-based grid layout collapsed flat Achievr traces into a vertical column (all nodes at X=0).

**Solution**: Golden-angle spiral layout based on call order, not tree depth.

**Deliverables**:
- Updated buildGraph.ts with spiral algorithm:
  - Radius: `2.0 × √(i+1)` for even radial spacing
  - Angle: `i × GOLDEN_ANGLE` (~137.5°)
  - Y: `i × 0.8` for chronological timeline read
- Adjusted camera to `[15, 12, 24]` with 60° FOV
- Billboard labels for readability at all angles

**Result**:
- 8-node Achievr trace spreads into legible expanding spiral (radius 2.0 → 5.7)
- Vertical separation (Y: 0 → 6.4) maintains chronological ordering
- No overlap, nodes clearly separated for exploration
- Works for both flat (Achievr) and branching (mock) traces

---

## Current State

**Running on**: http://localhost:3001

**Active Trace Source**: `achievr-sample` (8 real Achievr tool calls)

**Features Working**:
- ✅ 3D spiral layout with golden-angle distribution
- ✅ Live streaming trace replay (1.1s for sample)
- ✅ Camera auto-follow with manual override
- ✅ Cubic ease-in entrance animations
- ✅ Resolve pulse on status change (pending→success/error)
- ✅ Error breathing pulse for failed nodes
- ✅ Billboard labels facing camera
- ✅ OrbitControls for rotation/zoom
- ✅ Dynamic trace loading from API endpoints
- ✅ Real Achievr tool call visualization

**Trace Sources Available**:
```typescript
// In components/Scene.tsx
useReplayTrace({ source: 'mock' });           // Original 4-node hierarchical
useReplayTrace({ source: 'achievr-sample' }); // 8-node Achievr planner (current)
useReplayTrace({ source: 'latest' });         // Most recent stored trace
```

---

## Future Milestones (Not Yet Started)

### M5: Preset Trace Switching / Replay UI
- UI controls to switch between trace sources
- Replay controls (play/pause/speed)
- Trace metadata display

### M6: Live Cross-App Streaming (Option B)
- Server-Sent Events or WebSocket integration
- Real-time trace streaming from running Achievr sessions
- No page refresh required

### M7: Unfold Integration
- Similar adapter pattern for Unfold's tool calls
- Multi-source trace switching

### M8: Production Polish
- Loading states and error handling
- Performance optimization for large traces (50+ nodes)
- Trace persistence (database storage)
- Deployment configuration

---

## Technical Stack

**Core**:
- Next.js 16.3.1 (App Router)
- TypeScript (strict mode)
- React 19

**3D Rendering**:
- Three.js
- React Three Fiber
- drei (Text, Billboard, Line, OrbitControls)

**State Management**:
- Zustand 5.0.12

**Styling**:
- Tailwind CSS

**Data Source**:
- Achievr AI Project Planner (Anthropic SDK)
- Vercel AI SDK compatibility

---

## Key Files

| Path | Purpose |
|------|---------|
| `types/trace.ts` | TraceEvent schema (shared contract) |
| `lib/buildGraph.ts` | Spiral layout algorithm |
| `lib/mockTrace.ts` | 4-node hierarchical test trace |
| `lib/achievrAdapter.ts` | Achievr→TraceEvent adapter |
| `store/traceStore.ts` | Zustand incremental state |
| `hooks/useReplayTrace.ts` | Replay driver with API fetch |
| `components/Scene.tsx` | Main 3D canvas + nodes/edges |
| `components/CameraRig.tsx` | Auto-follow camera controller |
| `app/api/traces/achievr-sample/route.ts` | Sample Achievr trace endpoint |
| `app/api/traces/latest/route.ts` | Trace storage endpoint |

---

## Demo Script

**Quickest way to demo all features**:

1. Open http://localhost:3001
2. Watch the trace build itself:
   - 8 nodes appear sequentially in spiral pattern
   - Each scales in with cubic ease-out
   - Labels appear above nodes (billboarded text)
   - Camera follows latest node
3. Explore with OrbitControls:
   - Drag to rotate (pauses auto-follow)
   - Two-finger pinch/scroll to zoom
   - Auto-follow resumes after 2s
4. Note the error node (estimateTimeline):
   - Red color + continuous breathing pulse
   - Unmistakable error state

**This proves**: Orbit works on real AI tool-calling traces, not just handcrafted demos.

---

Last Updated: 2026-08-21
