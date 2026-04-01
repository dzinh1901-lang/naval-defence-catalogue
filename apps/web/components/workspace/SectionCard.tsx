import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerRight?: React.ReactNode;
}

export function SectionCard({
  title,
  children,
  defaultOpen = true,
  className,
  headerRight,
}: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn('border-b border-border-subtle last:border-b-0', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left group"
      >
        <span className="text-2xs font-semibold tracking-widest uppercase text-text-muted group-hover:text-text-secondary transition-colors">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {headerRight}
          <ChevronDown
            size={12}
            className={cn(
              'text-text-dim transition-transform',
              open ? 'rotate-0' : '-rotate-90',
            )}
          />
        </div>
      </button>
      {open && <div className="pb-3 px-3">{children}</div>}
    </div>
  );
}
