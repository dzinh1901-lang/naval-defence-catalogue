import * as React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-1 text-text-primary border-border-subtle',
  success: 'bg-emerald-900/30 text-emerald-400 border-emerald-700/40',
  warning: 'bg-amber-900/30 text-amber-400 border-amber-700/40',
  danger: 'bg-red-900/30 text-red-400 border-red-700/40',
  info: 'bg-sky-900/30 text-sky-400 border-sky-700/40',
  muted: 'bg-surface-0 text-text-muted border-border-subtle',
};

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium border',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
