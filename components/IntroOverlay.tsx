// components/IntroOverlay.tsx
'use client';

interface IntroOverlayProps {
  onStart: () => void;
}

export default function IntroOverlay({ onStart }: IntroOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm z-10 gap-4 text-center px-6">
      <h1 className="text-4xl text-white/90 font-light tracking-wide">Orbit</h1>
      <p className="text-base text-white/60 max-w-md leading-relaxed">
        A live trace of an AI agent's tool calls, rendered as a 3D execution graph.
      </p>
      <button
        onClick={onStart}
        className="mt-4 px-6 py-3 border border-white/30 rounded-full text-sm text-white/80 hover:bg-white/10 hover:border-white/50 transition-all duration-200"
      >
        Play trace
      </button>
    </div>
  );
}
