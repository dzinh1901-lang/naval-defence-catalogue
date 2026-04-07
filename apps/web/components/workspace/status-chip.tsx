'use client';

import { cn } from '@/lib/utils';

interface StatusChipProps {
  label: string;
  value?: string | number | null;
  tone?: 'neutral' | 'teal' | 'cyan' | 'amber' | 'red' | 'green';
  compact?: boolean;
}

const toneClasses: Record<NonNullable<StatusChipProps['tone']>, string> = {
  neutral: 'border-white/10 bg-white/5 text-slate-200',
  teal: 'border-teal-400/25 bg-teal-400/10 text-teal-100',
  cyan: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-100',
  amber: 'border-amber-400/25 bg-amber-400/10 text-amber-100',
  red: 'border-red-400/25 bg-red-400/10 text-red-100',
  green: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100',
};

export function StatusChip({
  label,
  value,
  tone = 'neutral',
  compact = false,
}: StatusChipProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 text-[11px] font-medium backdrop-blur-xl',
        compact ? 'h-8 py-0' : 'h-9 py-1',
        toneClasses[tone],
      )}
    >
      <span className="uppercase tracking-[0.24em] text-white/60">{label}</span>
      {value !== undefined && value !== null && (
        <span className="font-engineering text-white">{value}</span>
      )}
    </div>
  );
}
