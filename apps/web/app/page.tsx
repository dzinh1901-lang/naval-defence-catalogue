import Link from 'next/link';
import { ArrowRight, ShieldCheck, Ship, Waypoints } from 'lucide-react';
import { ApiClientError, listProjects } from '@/lib/api';
import { NavalLogo } from '@/components/ui/naval-logo';
import type { Project } from '@naval/domain';

export const dynamic = 'force-dynamic';

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
      {children}
    </span>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-1/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-text-primary">{value}</p>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{hint}</p>
    </div>
  );
}

function CapabilityCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-1/70 p-6">
      <div className="mb-4 inline-flex rounded-xl border border-accent/25 bg-accent/10 p-3 text-accent">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-text-secondary">{description}</p>
    </div>
  );
}

function OnboardingStep({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-1/60 p-5">
      <div className="text-xs font-mono uppercase tracking-[0.22em] text-accent">{step}</div>
      <h3 className="mt-3 text-base font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
    </div>
  );
}

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

  const featuredProjects = projects.slice(0, 3);

  return (
    <div className="min-h-screen bg-surface-0 text-text-primary">
      <header className="sticky top-0 z-20 border-b border-border-subtle bg-surface-0/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <NavalLogo />
          <span className="text-xs uppercase tracking-[0.24em] text-text-muted">Naval Digital Twin Platform</span>
          <div className="ml-auto flex items-center gap-3">
            <StatusPill>Pilot-ready workspace</StatusPill>
            <Link
              href="#workspace-preview"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-text-secondary transition hover:border-accent/40 hover:text-text-primary"
            >
              View workspace
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-border-subtle">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-24">
            <div>
              <StatusPill>Systems engineering · traceability · simulation ops</StatusPill>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
                A digital twin workspace for naval engineering teams that need structure, traceability, and operational clarity.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg">
                Model projects, map subsystem hierarchies, track requirements, manage evidence reviews, and coordinate simulation workflows from one governed environment.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="#workspace-preview"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:brightness-110"
                >
                  Explore pilot workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#onboarding"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-text-secondary transition hover:border-accent/40 hover:text-text-primary"
                >
                  See onboarding flow
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <MetricCard
                  label="Workspace model"
                  value="Projects → Twins"
                  hint="Structured project, subsystem, and requirement relationships instead of disconnected documents."
                />
                <MetricCard
                  label="Review posture"
                  value="Evidence-aware"
                  hint="Track review records and supporting evidence in the same operating surface as the twin."
                />
                <MetricCard
                  label="Deployment focus"
                  value="Pilot MVP"
                  hint="Best suited for guided pilots, internal demos, and early design-partner onboarding."
                />
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-gradient-to-b from-surface-1 to-surface-2 p-6 shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Recommended release posture</p>
                  <h2 className="mt-2 text-xl font-semibold text-text-primary">Guided pilot, not generic self-serve</h2>
                </div>
                <ShieldCheck className="h-6 w-6 text-accent" />
              </div>
              <div className="mt-6 space-y-4 text-sm leading-7 text-text-secondary">
                <p>
                  This product is strongest when positioned as a <span className="text-text-primary">specialized B2B engineering workspace</span>, not a broad catalogue site.
                </p>
                <p>
                  Lead with a seeded demo project, controlled access, and a trust-first onboarding path for engineering, technical program, or analysis teams.
                </p>
                <p>
                  Before broad rollout, tighten production auth, document deployment assumptions clearly, and remove any ambiguity around bootstrap token flows.
                </p>
              </div>
              <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
                <strong className="font-semibold">MVP recommendation:</strong> ship a pilot experience around digital twin definition, subsystem structure, requirements traceability, and evidence-backed reviews.
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border-subtle">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.24em] text-accent">Core capabilities</p>
              <h2 className="mt-3 text-3xl font-semibold text-text-primary">What this platform should sell first</h2>
              <p className="mt-4 text-base leading-8 text-text-secondary">
                The strongest commercial story is a disciplined engineering workspace: a system of record for naval digital twins, subsystem structure, requirements, reviews, and simulation coordination.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              <CapabilityCard
                icon={<Ship className="h-6 w-6" />}
                title="Twin-centric engineering workspace"
                description="Organize projects, digital twins, subsystem trees, and technical context in a way that mirrors real engineering programs instead of scattered spreadsheets."
              />
              <CapabilityCard
                icon={<Waypoints className="h-6 w-6" />}
                title="Requirements and review traceability"
                description="Link requirements, reviews, and supporting evidence directly to the project and subsystem model so decisions stay inspectable."
              />
              <CapabilityCard
                icon={<ShieldCheck className="h-6 w-6" />}
                title="Governed pilot delivery"
                description="Position the first release as a guided pilot with seeded data, role-based access, and explicit operational safeguards before wider self-serve exposure."
              />
            </div>
          </div>
        </section>

        <section id="onboarding" className="border-b border-border-subtle">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.24em] text-accent">Onboarding</p>
              <h2 className="mt-3 text-3xl font-semibold text-text-primary">Suggested first-run flow</h2>
              <p className="mt-4 text-base leading-8 text-text-secondary">
                Do not drop users into a blank environment. Use a guided workspace with seeded project data so value is visible in minutes.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-4">
              <OnboardingStep
                step="Step 1"
                title="Access the pilot"
                description="Landing page drives users into a request-access or guided demo flow rather than an unbounded sign-up wall."
              />
              <OnboardingStep
                step="Step 2"
                title="Open a seeded project"
                description="Start with a sample program containing twins, subsystem structure, requirements, reviews, and simulation history."
              />
              <OnboardingStep
                step="Step 3"
                title="Complete one guided action"
                description="Prompt the user to inspect a subsystem, review a requirement trail, or trigger a simulation run so the workspace proves its value fast."
              />
              <OnboardingStep
                step="Step 4"
                title="Move into pilot operations"
                description="Once value is clear, invite the team into a controlled pilot workflow with project-specific access and deployment review."
              />
            </div>
          </div>
        </section>

        <section id="workspace-preview" className="border-b border-border-subtle">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.24em] text-accent">Workspace preview</p>
                <h2 className="mt-3 text-3xl font-semibold text-text-primary">Live project access still exists for internal use</h2>
                <p className="mt-4 text-base leading-8 text-text-secondary">
                  The platform can still render live project data from the API, but the homepage now frames that capability inside a stronger product story.
                </p>
              </div>
              <div className="rounded-full border border-border px-4 py-2 text-sm text-text-secondary">
                API status: {apiError === 'none' ? 'connected' : apiError}
              </div>
            </div>

            {apiError !== 'none' && (
              <div className="mt-8 rounded-2xl border border-naval-red/30 bg-naval-red/10 px-5 py-4 text-sm leading-6 text-naval-red">
                {apiError === 'unavailable' ? (
                  <>
                    API unavailable — ensure the backend is running at{' '}
                    <code className="font-semibold">
                      {process.env['API_URL'] ?? process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'}
                    </code>
                    . Start it with <code className="font-semibold">pnpm dev:api</code>.
                  </>
                ) : apiError === 'expired' ? (
                  <>Configured API credentials have expired. Renew the server-side token or bootstrap settings.</>
                ) : (
                  <>Configured API credentials were rejected. Check API_AUTH_TOKEN or AUTH_BOOTSTRAP_SECRET + API_SERVICE_*.</>
                )}
              </div>
            )}

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {featuredProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="rounded-2xl border border-border bg-surface-1/80 p-5 transition hover:border-accent/35 hover:bg-surface-1"
                >
                  <div className="text-xs uppercase tracking-[0.22em] text-text-muted">Project</div>
                  <h3 className="mt-3 text-lg font-semibold text-text-primary">{project.name}</h3>
                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-text-secondary">
                    {project.description?.trim() || 'Open this project workspace to inspect digital twin structure, requirements, and review context.'}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent">
                    Open workspace <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              ))}

              {featuredProjects.length === 0 && apiError === 'none' && (
                <div className="rounded-2xl border border-dashed border-border bg-surface-1/60 p-6 text-sm leading-6 text-text-secondary lg:col-span-3">
                  No seeded projects were returned. Run <code className="rounded bg-surface-2 px-1 py-0.5 font-mono">pnpm db:seed</code> to populate the pilot workspace with sample data.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <div>Naval Digital Twin Platform · Pilot release positioning update</div>
          <div>Recommended next step: tighten production auth and launch with a guided demo path.</div>
        </div>
      </footer>
    </div>
  );
}
