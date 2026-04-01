import { WorkspaceLayout } from '@/components/shell/workspace-layout';
import { listProjects } from '@/lib/api';
import type { Project } from '@naval/domain';

/**
 * Workspace root layout — server component.
 * Fetches the project list from the API and passes it to the client shell.
 * Gracefully falls back to an empty list if the API is unreachable.
 */
export default async function WorkspaceRootLayout({ children }: { children: React.ReactNode }) {
  let projects: Project[] = [];
  try {
    projects = await listProjects();
  } catch {
    // API unreachable — shell renders with empty explorer; pages show their own errors.
  }

  return <WorkspaceLayout projects={projects}>{children}</WorkspaceLayout>;
}
