'use client';

import React, { useState } from 'react';
import type { Subsystem } from '@naval/domain';
import { cn, statusDotColor } from '@/lib/utils';
import { ChevronRight, ChevronDown, Cpu } from 'lucide-react';

interface SubsystemTreeProps {
  subsystems: Subsystem[];
  selectedId: string | null;
  onSelect: (subsystem: Subsystem) => void;
}

export function SubsystemTree({ subsystems, selectedId, onSelect }: SubsystemTreeProps) {
  // Only render root-level subsystems (depth === 0 or no parent)
  const roots = subsystems.filter((s) => !s.parentId);

  return (
    <div className="select-none">
      {roots.map((s) => (
        <SubsystemNode key={s.id} subsystem={s} selectedId={selectedId} onSelect={onSelect} depth={0} />
      ))}
    </div>
  );
}

interface NodeProps {
  subsystem: Subsystem;
  selectedId: string | null;
  onSelect: (s: Subsystem) => void;
  depth: number;
}

function SubsystemNode({ subsystem, selectedId, onSelect, depth }: NodeProps) {
  const hasChildren = (subsystem.children?.length ?? 0) > 0;
  const [expanded, setExpanded] = useState(depth < 1);
  const isSelected = subsystem.id === selectedId;

  return (
    <div>
      <div
        style={{ paddingLeft: `${8 + depth * 12}px` }}
        className={cn(
          'flex items-center gap-1 h-7 pr-2 cursor-pointer text-xs rounded mx-1 group',
          isSelected
            ? 'bg-accent-dim text-text-primary'
            : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary',
        )}
        onClick={() => {
          onSelect(subsystem);
          if (hasChildren) setExpanded((v) => !v);
        }}
      >
        {/* Expand/collapse */}
        <span className="shrink-0 w-3 flex justify-center">
          {hasChildren ? (
            expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />
          ) : null}
        </span>

        <Cpu size={11} className="shrink-0 text-naval-cyan/60" />

        <span className="flex-1 truncate leading-none">{subsystem.name}</span>

        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', statusDotColor(subsystem.status))} />
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="tree-line-v" style={{ marginLeft: `${12 + depth * 12}px` }}>
          {subsystem.children?.map((child) => (
            <SubsystemNode
              key={child.id}
              subsystem={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
