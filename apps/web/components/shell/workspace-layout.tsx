'use client';

import React, { useState } from 'react';
import { TopBar } from './top-bar';
import { LeftExplorer } from './left-explorer';
import { BottomPanel } from './bottom-panel';
import type { Project } from '@naval/domain';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  /** Projects to display in the left explorer — fetched server-side. */
  projects: Project[];
}

export function WorkspaceLayout({ children, projects }: WorkspaceLayoutProps) {
  const [explorerOpen, setExplorerOpen] = useState(true);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-surface-0">
      {/* Top bar */}
      <TopBar
        explorerOpen={explorerOpen}
        onToggleExplorer={() => setExplorerOpen((v) => !v)}
      />

      {/* Main workspace row */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left explorer */}
        {explorerOpen && (
          <LeftExplorer projects={projects} />
        )}

        {/* Center + bottom column */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Center content (page slot) */}
          <div className="flex-1 overflow-auto workspace-fade-in">
            {children}
          </div>

          {/* Bottom panel */}
          <BottomPanel />
        </div>
      </div>
    </div>
  );
}
