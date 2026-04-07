'use client';

import { cn } from '@/lib/utils';
import type { CameraPreset, CameraState } from '@naval/domain';
import { SectionCard } from './section-card';

interface CameraSectionProps {
  presets: CameraPreset[];
  selectedPresetId: string | null;
  cameraState: CameraState;
  onSelectPreset: (presetId: string) => void;
  onCameraStateChange: (cameraState: CameraState) => void;
}

export function CameraSection({
  presets,
  selectedPresetId,
  cameraState,
  onSelectPreset,
  onCameraStateChange,
}: CameraSectionProps) {
  return (
    <SectionCard
      title="Camera Controls"
      eyebrow="Design Studio"
      description="Preset orbit anchors with live yaw, pitch, zoom, and field-of-view persistence."
    >
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          {presets.map((preset) => {
            const selected = preset.id === selectedPresetId;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className={cn(
                  'rounded-2xl border px-3 py-3 text-left transition-all',
                  selected
                    ? 'border-cyan-300/30 bg-cyan-400/10'
                    : 'border-white/8 bg-white/5 hover:bg-white/8',
                )}
              >
                <p className="text-sm font-medium text-white">{preset.name}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
                  {preset.focusLabel}
                </p>
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 pt-2 sm:grid-cols-2">
          <RangeField
            label="Yaw"
            value={cameraState.yaw}
            min={-30}
            max={30}
            step={1}
            onChange={(value) => onCameraStateChange({ ...cameraState, yaw: value })}
          />
          <RangeField
            label="Pitch"
            value={cameraState.pitch}
            min={-25}
            max={18}
            step={1}
            onChange={(value) => onCameraStateChange({ ...cameraState, pitch: value })}
          />
          <RangeField
            label="Zoom"
            value={cameraState.zoom}
            min={0.8}
            max={1.4}
            step={0.01}
            onChange={(value) => onCameraStateChange({ ...cameraState, zoom: value })}
          />
          <RangeField
            label="Field of View"
            value={cameraState.fieldOfView ?? 34}
            min={24}
            max={48}
            step={1}
            onChange={(value) => onCameraStateChange({ ...cameraState, fieldOfView: value })}
          />
        </div>
      </div>
    </SectionCard>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</span>
        <span className="font-engineering text-sm text-white">{value.toFixed(step < 1 ? 2 : 0)}</span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-300"
      />
    </label>
  );
}
