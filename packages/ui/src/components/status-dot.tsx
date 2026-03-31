import * as React from 'react';

type StatusVariant = 'active' | 'draft' | 'warning' | 'error' | 'muted';

const colorMap: Record<StatusVariant, string> = {
  active: 'bg-emerald-400',
  draft: 'bg-sky-400',
  warning: 'bg-amber-400',
  error: 'bg-red-500',
  muted: 'bg-zinc-500',
};

export interface StatusDotProps {
  variant?: StatusVariant;
  pulse?: boolean;
  className?: string;
}

export function StatusDot({ variant = 'muted', pulse = false, className = '' }: StatusDotProps) {
  return (
    <span className={['relative inline-flex h-2 w-2', className].join(' ')}>
      {pulse && (
        <span
          className={['absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping', colorMap[variant]].join(
            ' ',
          )}
        />
      )}
      <span className={['relative inline-flex rounded-full h-2 w-2', colorMap[variant]].join(' ')} />
    </span>
  );
}
