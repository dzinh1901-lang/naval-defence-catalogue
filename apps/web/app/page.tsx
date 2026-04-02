import Link from 'next/link';
import { ApiClientError, listProjects } from '@/lib/api';
import { ProjectCard } from '@/components/projects/project-card';
import { NavalLogo } from '@/components/ui/naval-logo';
import type { Project } from '@naval/domain';

export const dynamic = 'force-dynamic';

/**
 * Home page — lists all projects from the live API.
 * Falls back to an empty list with an error banner if the API is unreachable.
 */
export default async function HomePage() {
  let projects: Project[] = [];
  let apiError: 'none' | 'unavailable' | 'unauthorized' | 'expired' = 'none';

  try {
    projects = await listProjects();
  } catch (error) {
    if (error instanceof ApiClientError && error.isUnauthorized) {
      apiError = error.isExpiredToken ? 'expired' : 'unauthorized';
    } else {
      apiError = 'unavailable';
    }
  }

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      {/* Top bar */}
      <header className="h-12 flex items-center gap-4 px-6 border-b border-border-subtle bg-surface-1 shrink-0">
        <NavalLogo />
        <span className="text-text-muted text-xs tracking-widest uppercase font-mono">
          Digital Twin Platform
        </span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-text-muted text-xs">v0.5.0-m5</span>
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

      {/* Error banner */}
      {apiError !== 'none' && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-naval-red/10 border border-naval-red/30 text-naval-red text-xs font-mono">
          {apiError === 'unavailable' ? (
            <>
              API unavailable — ensure the backend is running at{' '}
              <code className="font-bold">
                {process.env['API_URL'] ?? process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'}
              </code>
              . Start it with <code className="font-bold">pnpm dev:api</code>.
            </>
          ) : apiError === 'expired' ? (
            <>Configured API credentials have expired. Renew the server-side token or bootstrap settings.</>
          ) : (
            <>Configured API credentials were rejected. Check API_AUTH_TOKEN or AUTH_BOOTSTRAP_SECRET + API_SERVICE_*.</>
          )}
        </div>
      )}

      {/* Project grid */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          {apiError === 'none' && projects.length === 0 ? (
            <div className="text-center py-16 text-text-muted text-sm">
              No projects found. Run <code className="font-mono bg-surface-2 px-1 rounded">pnpm db:seed</code> to populate sample data.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
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
          )}
        </div>
      </main>

      <footer className="h-8 flex items-center px-6 border-t border-border-subtle text-2xs text-text-muted font-mono">
        Naval Systems Command · Naval Digital Twin Platform · Milestone 5
      </footer>
    </div>
  );
}
