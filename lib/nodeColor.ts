// lib/nodeColor.ts
const toolColors: Record<string, string> = {
  create_task_card: '#5b8def',   // blue
  suggest_actions: '#f2b84b',    // amber
  list_features: '#7c5cff',      // violet
  explain_approach: '#4ade80',   // green
  send_text: '#ec4899',          // pink
  validateConfig: '#06b6d4',     // cyan
  buildAssets: '#f97316',        // orange
  runTests: '#10b981',           // emerald
  // fallback for any tool not explicitly listed
};

export function colorForTool(toolName: string): string {
  return toolColors[toolName] ?? '#9ca3af'; // gray fallback
}
