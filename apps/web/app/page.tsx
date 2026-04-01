import Link from 'next/link';
import { MOCK_PROJECTS } from '@/lib/mock-data';
import { ProjectCard } from '@/components/projects/project-card';
import { NavalLogo } from '@/components/ui/naval-logo';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      {/* Top bar */}
      <header className="h-12 flex items-center gap-4 px-6 border-b border-border-subtle bg-surface-1 shrink-0">
        <NavalLogo />
        <span className="text-text-muted text-xs tracking-widest uppercase font-mono">
          Digital Twin Platform
        </span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-text-muted text-xs">v0.1.0-m1</span>
          <div className="h-6 w-px bg-border-subtle" />
          <div className="h-7 w-7 rounded-full bg-accent-muted border border-accent/30 flex items-center justify-center text-xs font-medium text-accent">
            SL
          </div>
        </div>
      </header>

      {/* Hero / intro band */}
      <div className="bg-surface-1 border-b border-border-subtle px-8 py-6">
        <h1 className="text-lg font-semibold text-text-primary">Projects</h1>
        <p className="text-text-secondary text-sm mt-1">
          Select a project to open its engineering workspace.
        </p>
      </div>

      {/* Project grid */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_PROJECTS.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}

            {/* New project placeholder */}
            <Link
              href="#"
              className="group flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-text-muted hover:border-accent/50 hover:text-text-secondary transition-colors min-h-[160px]"
            >
              <span className="text-2xl">+</span>
              <span className="text-sm">New Project</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="h-8 flex items-center px-6 border-t border-border-subtle text-2xs text-text-muted font-mono">
        Naval Systems Command · Naval Digital Twin Platform · Milestone 1
      </footer>
    </div>
  );
}
