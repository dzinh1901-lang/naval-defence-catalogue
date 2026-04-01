import { notFound } from 'next/navigation';
import {
  getWorkspaceSummary,
  getWorkspaceHotspots,
  getWorkspaceAlerts,
  getWorkspaceHistory,
} from '@/lib/api';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';

interface Props {
  params: Promise<{ twinId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { twinId } = await params;
  try {
    const summary = await getWorkspaceSummary(twinId);
    return { title: summary?.twin?.name ?? 'Digital Twin Workspace' };
  } catch {
    return { title: 'Digital Twin Workspace' };
  }
}

export default async function WorkspacePage({ params }: Props) {
  const { twinId } = await params;

  let summary: Awaited<ReturnType<typeof getWorkspaceSummary>> = null;
  let hotspots: Awaited<ReturnType<typeof getWorkspaceHotspots>> = [];
  let alerts: Awaited<ReturnType<typeof getWorkspaceAlerts>> = [];
  let history: Awaited<ReturnType<typeof getWorkspaceHistory>> = [];

  try {
    summary = await getWorkspaceSummary(twinId);
    if (!summary) return notFound();

    [hotspots, alerts, history] = await Promise.all([
      getWorkspaceHotspots(twinId),
      getWorkspaceAlerts(twinId),
      getWorkspaceHistory(twinId),
    ]);
  } catch {
    if (!summary) return notFound();
    // Partial data — render shell with what we have.
  }

  if (!summary) return notFound();

  return (
    <WorkspaceShell
      twinId={twinId}
      summary={summary}
      hotspots={hotspots}
      alerts={alerts}
      history={history}
      initialViewConfig={summary.viewConfig}
    />
  );
}
