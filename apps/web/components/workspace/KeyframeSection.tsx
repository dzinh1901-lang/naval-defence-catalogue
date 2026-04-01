'use client';

import { SkipBack, Play, SkipForward, List } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function KeyframeSection() {
  const [playing, setPlaying] = useState(false);
  const [frame, setFrame] = useState(41);
  const totalFrames = 120;

  return (
    <SectionCard title="Keyframe Director">
      {/* Playback controls */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setFrame(Math.max(0, frame - 10))}
          className="h-6 w-6 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
        >
          <SkipBack size={12} />
        </button>
        <button
          onClick={() => setPlaying((v) => !v)}
          className={cn(
            'h-6 w-6 flex items-center justify-center rounded transition-colors',
            playing
              ? 'bg-naval-cyan text-surface-0 hover:bg-naval-teal'
              : 'text-naval-cyan hover:bg-naval-cyan/10',
          )}
        >
          <Play size={12} />
        </button>
        <button
          onClick={() => setFrame(Math.min(totalFrames, frame + 10))}
          className="h-6 w-6 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
        >
          <SkipForward size={12} />
        </button>
        <span className="text-2xs font-mono text-text-muted ml-1">
          #{String(frame).padStart(3, '0')}
        </span>
        <button className="ml-auto h-6 w-6 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors">
          <List size={12} />
        </button>
      </div>

      {/* Timeline scrubber */}
      <div className="relative">
        <input
          type="range"
          min={0}
          max={totalFrames}
          step={1}
          value={frame}
          onChange={(e) => setFrame(parseInt(e.target.value))}
          className="w-full h-1 appearance-none rounded-full cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-naval-cyan
            [&::-moz-range-thumb]:h-3
            [&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-naval-cyan
            [&::-moz-range-thumb]:border-0"
          style={{
            background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(frame / totalFrames) * 100}%, #20243a ${(frame / totalFrames) * 100}%, #20243a 100%)`,
          }}
        />

        {/* Keyframe markers */}
        <div className="flex gap-1 mt-2">
          {[0, 20, 41, 65, 90, 120].map((kf) => (
            <button
              key={kf}
              onClick={() => setFrame(kf)}
              className={cn(
                'flex-1 h-1.5 rounded-sm transition-colors',
                frame === kf ? 'bg-naval-cyan' : 'bg-surface-3 hover:bg-surface-2',
              )}
            />
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
