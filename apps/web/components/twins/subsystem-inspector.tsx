import type { Subsystem, Requirement } from '@naval/domain';
import type { ReactNode } from 'react';
import { cn, statusDotColor, statusColor } from '@/lib/utils';

interface SubsystemInspectorProps {
  subsystem: Subsystem | null;
  requirements: Requirement[];
}

export function SubsystemInspector({ subsystem, requirements }: SubsystemInspectorProps) {
  if (!subsystem) {
    return (
      <div className="p-4 text-xs text-text-muted text-center mt-8">
        <p className="mb-1 text-text-secondary font-medium">No selection</p>
        <p>Select a subsystem from the tree to inspect its properties.</p>
      </div>
    );
  }

  const subsysReqs = requirements.filter((r) => r.subsystemId === subsystem.id);
  const childCount = subsystem.children?.length ?? 0;
  const ifaceCount = subsystem.interfaces?.length ?? 0;

  return (
    <div className="text-xs divide-y divide-border-subtle">
      {/* Identity */}
      <div className="p-3 space-y-2">
        <div className="text-2xs font-semibold text-text-muted uppercase tracking-wider mb-1">Identity</div>
        <InspectorRow label="Name" value={subsystem.name} />
        <InspectorRow label="Identifier" value={
          <span className="font-mono text-naval-cyan">{subsystem.identifier}</span>
        } />
        <InspectorRow label="Status" value={
          <span className={cn('flex items-center gap-1', statusColor(subsystem.status))}>
            <span className={cn('h-1.5 w-1.5 rounded-full', statusDotColor(subsystem.status))} />
            {subsystem.status}
          </span>
        } />
        <InspectorRow label="Depth" value={subsystem.depth.toString()} />
      </div>

      {/* Description */}
      {subsystem.description && (
        <div className="p-3">
          <div className="text-2xs font-semibold text-text-muted uppercase tracking-wider mb-1">Description</div>
          <p className="text-text-secondary leading-relaxed">{subsystem.description}</p>
        </div>
      )}

      {/* Hierarchy */}
      <div className="p-3 space-y-1">
        <div className="text-2xs font-semibold text-text-muted uppercase tracking-wider mb-1">Hierarchy</div>
        <InspectorRow label="Children" value={childCount.toString()} />
        <InspectorRow label="Interfaces" value={ifaceCount.toString()} />
      </div>

      {/* Requirements */}
      <div className="p-3">
        <div className="text-2xs font-semibold text-text-muted uppercase tracking-wider mb-2">
          Requirements ({subsysReqs.length})
        </div>
        {subsysReqs.length === 0 ? (
          <p className="text-text-dim italic">None allocated</p>
        ) : (
          <div className="space-y-2">
            {subsysReqs.map((req) => (
              <div key={req.id} className="rounded bg-surface-2 border border-border-subtle p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-mono text-text-muted">{req.identifier}</span>
                  <span className={cn(
                    req.priority === 'MUST' ? 'text-naval-red' :
                    req.priority === 'SHOULD' ? 'text-naval-amber' :
                    'text-text-muted'
                  )}>{req.priority}</span>
                </div>
                <p className="text-2xs text-text-secondary leading-relaxed line-clamp-3">{req.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InspectorRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-text-dim w-20 shrink-0">{label}</span>
      <span className="text-text-secondary flex-1">{value}</span>
    </div>
  );
}
