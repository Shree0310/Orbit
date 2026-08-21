'use client';

import { useState } from 'react';
import Scene from '@/components/Scene';
import IntroOverlay from '@/components/IntroOverlay';
import { TraceSource } from '@/hooks/useReplayTrace';

const presets = [
  { id: 'achievr-sample' as TraceSource, label: 'Achievr – task planning' },
  { id: 'mock' as TraceSource, label: 'Branching example' },
  { id: 'mock-error' as TraceSource, label: 'With failed calls' },
];

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentPreset, setCurrentPreset] = useState<TraceSource>('achievr-sample');
  const [replayKey, setReplayKey] = useState(0);

  const handleStart = () => {
    setHasStarted(true);
  };

  const handlePresetChange = (preset: TraceSource) => {
    setCurrentPreset(preset);
    setReplayKey(k => k + 1); // Force reload
  };

  const handleReplay = () => {
    setReplayKey(k => k + 1); // Force reload
  };

  return (
    <main className="relative h-screen w-screen bg-black">
      {!hasStarted && <IntroOverlay onStart={handleStart} />}

      <Scene
        key={replayKey}
        source={currentPreset}
        shouldStart={hasStarted}
        onComplete={handleReplay}
      />

      {hasStarted && (
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetChange(preset.id)}
              className={`px-4 py-2 rounded-full text-xs transition-all ${
                currentPreset === preset.id
                  ? 'bg-white/20 text-white border border-white/40'
                  : 'bg-black/40 text-white/60 border border-white/20 hover:bg-white/10'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
