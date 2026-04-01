'use client';

import Link from 'next/link';
import type { Project, Requirement, Review } from '@naval/domain';
import { cn, statusDotColor, formatDate } from '@/lib/utils';
import { Cpu, FileText, PlayCircle, ArrowRight, Home, ClipboardList, AlertCircle } from 'lucide-react';
import { ReviewsPanel } from '@/components/reviews/reviews-panel';

interface ProjectWorkspaceProps {
  project: Project;
  requirements?: Requirement[];
  reviews?: Review[];
}

export function ProjectWorkspace({ project, requirements = [], reviews = [] }: ProjectWorkspaceProps) {
  const twinCount = project.twins?.length ?? 0;
  const reqCount = requirements.length;
  const reviewCount = reviews.length;
  const openReviews = reviews.filter((r) => r.status === 'OPEN' || r.status === 'IN_REVIEW');

  return (
    <div className="h-full flex flex-col overflow-auto bg-surface-0">
      {/* Page header */}
      <div className="bg-surface-1 border-b border-border-subtle px-6 py-4 shrink-0">
        <div className="flex items-center gap-2 text-2xs text-text-muted mb-2">
          <Link href="/" className="hover:text-text-secondary flex items-center gap-1">
            <Home size={11} />
            Projects
          </Link>
          <span>/</span>
          <span className="text-text-secondary">{project.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-text-primary">{project.name}</h1>
          <span className="flex items-center gap-1 text-2xs">
            <span className={cn('h-1.5 w-1.5 rounded-full', statusDotColor(project.status))} />
            <span className="text-text-muted">{project.status}</span>
          </span>
        </div>
        {project.description && (
          <p className="text-xs text-text-secondary mt-1">{project.description}</p>
        )}
      </div>

      {/* Dashboard grid */}
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Digital Twins', value: twinCount, icon: <Cpu size={16} />, color: 'text-naval-cyan' },
              { label: 'Requirements', value: reqCount, icon: <FileText size={16} />, color: 'text-naval-indigo' },
              { label: 'Open Reviews', value: openReviews.length, icon: <ClipboardList size={16} />, color: 'text-naval-amber' },
              { label: 'Total Reviews', value: reviewCount, icon: <PlayCircle size={16} />, color: 'text-naval-teal' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-surface-1 border border-border-subtle p-3">
                <div className={cn('mb-1', stat.color)}>{stat.icon}</div>
                <div className="text-xl font-bold text-text-primary font-engineering">{stat.value}</div>
                <div className="text-2xs text-text-muted mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Open reviews alert */}
          {openReviews.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-naval-amber/10 border border-naval-amber/30 px-4 py-2.5 text-xs text-naval-amber">
              <AlertCircle size={14} />
              <span>
                {openReviews.length} review{openReviews.length !== 1 ? 's' : ''} require attention
              </span>
            </div>
          )}

          {/* Digital Twins section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Digital Twins
              </h2>
            </div>

            {twinCount > 0 ? (
              <div className="space-y-2">
                {project.twins?.map((twin) => (
                  <Link
                    key={twin.id}
                    href={`/projects/${project.id}/twins/${twin.id}`}
                    className="flex items-center gap-3 rounded-lg bg-surface-1 border border-border-subtle hover:border-accent/40 hover:bg-surface-2/60 p-3 transition-all group"
                  >
                    <div className="h-8 w-8 rounded bg-naval-cyan/10 border border-naval-cyan/20 flex items-center justify-center shrink-0">
                      <Cpu size={14} className="text-naval-cyan" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary group-hover:text-white">{twin.name}</div>
                      <div className="text-2xs text-text-muted mt-0.5">v{twin.version} · {twin.subsystems?.length ?? 0} subsystems</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('h-1.5 w-1.5 rounded-full', statusDotColor(twin.status))} />
                      <span className="text-2xs text-text-muted">{twin.status}</span>
                      <ArrowRight size={13} className="text-text-dim group-hover:text-accent transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-border text-text-muted text-sm">
                No digital twins yet
              </div>
            )}
          </section>

          {/* Requirements section */}
          {requirements.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Requirements ({requirements.length})
                </h2>
              </div>
              <div className="rounded-lg border border-border-subtle bg-surface-1 divide-y divide-border-subtle">
                {requirements.slice(0, 5).map((req) => (
                  <div key={req.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="font-mono text-2xs text-naval-cyan w-28 shrink-0">{req.identifier}</span>
                    <span className="text-xs text-text-secondary flex-1 truncate">{req.text}</span>
                    <span className={cn(
                      'text-2xs shrink-0',
                      req.priority === 'MUST' ? 'text-naval-red' : req.priority === 'SHOULD' ? 'text-naval-amber' : 'text-text-muted',
                    )}>{req.priority}</span>
                  </div>
                ))}
                {requirements.length > 5 && (
                  <div className="px-4 py-2 text-2xs text-text-dim">
                    +{requirements.length - 5} more requirements
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Reviews section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList size={13} className="text-text-muted" />
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Reviews ({reviews.length})
              </h2>
            </div>
            <ReviewsPanel reviews={reviews} />
          </section>
        </div>
      </div>
    </div>
  );
}
