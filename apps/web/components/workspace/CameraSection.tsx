'use client';

import { SectionCard } from './SectionCard';

interface CameraSectionProps {
  dof: number;
  fstop: number;
  onDofChange: (v: number) => void;
  onFstopChange: (v: number) => void;
}

export function CameraSection({ dof, fstop, onDofChange, onFstopChange }: CameraSectionProps) {
  return (
    <SectionCard title="Cinematic Camera">
      <div className="space-y-3">
        <SliderRow
          label="DoF"
          value={dof}
          displayValue={dof.toFixed(2)}
          min={0.1}
          max={32}
          step={0.01}
          onChange={onDofChange}
        />
        <SliderRow
          label="F-Stop"
          value={fstop}
          displayValue={String(Math.round(fstop))}
          min={1}
          max={128}
          step={1}
          onChange={onFstopChange}
        />
      </div>
    </SectionCard>
  );
}

interface SliderRowProps {
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, displayValue, min, max, step, onChange }: SliderRowProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-2xs text-text-secondary">{label}</span>
        <span className="text-2xs font-mono text-naval-cyan">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 appearance-none rounded-full bg-surface-3 cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-naval-cyan
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:h-3
          [&::-moz-range-thumb]:w-3
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-naval-cyan
          [&::-moz-range-thumb]:border-0"
        style={{
          background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((value - min) / (max - min)) * 100}%, #20243a ${((value - min) / (max - min)) * 100}%, #20243a 100%)`,
        }}
      />
    </div>
  );
}
