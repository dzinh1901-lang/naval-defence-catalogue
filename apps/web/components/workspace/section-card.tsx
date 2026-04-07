'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title: string;
  eyebrow?: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string | undefined;
}

export function SectionCard({
  title,
  eyebrow,
  description,
  aside,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        'rounded-[24px] border border-white/10 bg-slate-950/65 p-5 shadow-[0_24px_80px_rgba(2,12,21,0.36)] backdrop-blur-2xl',
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="space-y-1">
          {eyebrow ? (
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">{eyebrow}</p>
          ) : null}
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {description ? (
              <p className="mt-1 text-xs leading-5 text-slate-300/80">{description}</p>
            ) : null}
          </div>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}
