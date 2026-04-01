import type { Variant } from '@naval/domain';
import { cn, formatDate } from '@/lib/utils';
import { GitBranch, Star } from 'lucide-react';

interface VariantsPanelProps {
  variants: Variant[];
}

export function VariantsPanel({ variants }: VariantsPanelProps) {
  if (variants.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 rounded-lg border border-dashed border-border text-text-muted text-sm">
        No variants defined
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {variants.map((variant) => (
        <VariantCard key={variant.id} variant={variant} />
      ))}
    </div>
  );
}

function VariantCard({ variant }: { variant: Variant }) {
  const configKeys = Object.keys(variant.configuration ?? {});

  return (
    <div
      className={cn(
        'rounded-lg border p-4 bg-surface-1',
        variant.isBaseline
          ? 'border-naval-cyan/40 bg-naval-cyan/5'
          : 'border-border-subtle',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <GitBranch size={14} className={variant.isBaseline ? 'text-naval-cyan' : 'text-text-muted'} />
          <span className="text-sm font-medium text-text-primary">{variant.name}</span>
          {variant.isBaseline && (
            <span className="flex items-center gap-1 text-2xs text-naval-cyan bg-naval-cyan/10 border border-naval-cyan/20 px-1.5 py-0.5 rounded-full">
              <Star size={9} />
              Baseline
            </span>
          )}
        </div>
        <span className="text-2xs text-text-dim shrink-0">{formatDate(variant.createdAt)}</span>
      </div>

      {variant.description && (
        <p className="text-xs text-text-secondary mb-3 leading-relaxed">{variant.description}</p>
      )}

      {configKeys.length > 0 && (
        <div className="mt-2 rounded bg-surface-2 border border-border-subtle">
          <div className="px-3 py-1.5 border-b border-border-subtle">
            <span className="text-2xs font-semibold text-text-muted uppercase tracking-wider">
              Configuration ({configKeys.length} keys)
            </span>
          </div>
          <div className="divide-y divide-border-subtle">
            {configKeys.slice(0, 8).map((key) => (
              <div key={key} className="flex items-center gap-2 px-3 py-1.5">
                <span className="text-2xs font-mono text-naval-cyan w-32 shrink-0 truncate">{key}</span>
                <span className="text-2xs text-text-secondary font-mono truncate">
                  {JSON.stringify(variant.configuration[key])}
                </span>
              </div>
            ))}
            {configKeys.length > 8 && (
              <div className="px-3 py-1.5 text-2xs text-text-dim">
                +{configKeys.length - 8} more keys…
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
