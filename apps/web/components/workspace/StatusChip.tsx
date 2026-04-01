import { cn } from '@/lib/utils';

type StatusVariant = 'active' | 'warning' | 'error' | 'info' | 'syncing' | 'muted';

interface StatusChipProps {
  label: string;
  value?: string;
  variant?: StatusVariant;
  pulse?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<StatusVariant, string> = {
  active: 'border-naval-teal/30 bg-naval-teal/10 text-naval-teal',
  warning: 'border-naval-amber/30 bg-naval-amber/10 text-naval-amber',
  error: 'border-naval-red/30 bg-naval-red/10 text-naval-red',
  info: 'border-naval-cyan/30 bg-naval-cyan/10 text-naval-cyan',
  syncing: 'border-accent/30 bg-accent/10 text-accent',
  muted: 'border-border text-text-muted bg-surface-2',
};

const dotClasses: Record<StatusVariant, string> = {
  active: 'bg-naval-teal',
  warning: 'bg-naval-amber',
  error: 'bg-naval-red',
  info: 'bg-naval-cyan',
  syncing: 'bg-accent',
  muted: 'bg-text-dim',
};

export function StatusChip({
  label,
  value,
  variant = 'muted',
  pulse = false,
  icon,
  className,
}: StatusChipProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded border text-2xs font-medium tracking-wide',
        variantClasses[variant],
        className,
      )}
    >
      {icon ? (
        <span className="opacity-80">{icon}</span>
      ) : (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full shrink-0',
            dotClasses[variant],
            pulse && 'animate-pulse',
          )}
        />
      )}
      <span className="uppercase tracking-wider">{label}</span>
      {value && (
        <>
          <span className="opacity-40">:</span>
          <span className="font-semibold">{value}</span>
        </>
      )}
    </div>
  );
}
