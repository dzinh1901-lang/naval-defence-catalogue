'use client';

import React, { useState } from 'react';
import { TopBar } from './top-bar';
import { LeftExplorer } from './left-explorer';
import { BottomPanel } from './bottom-panel';
import { MOCK_PROJECTS } from '@/lib/mock-data';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
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
          <LeftExplorer projects={MOCK_PROJECTS} />
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
