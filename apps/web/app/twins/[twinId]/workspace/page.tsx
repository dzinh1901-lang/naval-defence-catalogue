import { notFound } from 'next/navigation';
import {
  getWorkspaceAlerts,
  getWorkspaceHistory,
  getWorkspaceHotspots,
  getWorkspacePerformance,
  getWorkspaceRules,
  getWorkspaceSummary,
  getWorkspaceTeam,
  getWorkspaceViewConfig,
} from '@/lib/api';
import { WorkspaceShell } from '@/components/workspace/workspace-shell';
import type { WorkspaceRouteData } from '@/components/workspace/workspace-types';

interface Props {
  params: Promise<{ twinId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { twinId } = await params;

  try {
    const summary = await getWorkspaceSummary(twinId);
    return {
      title: summary ? `${summary.twin.name} Workspace` : 'Twin Workspace',
    };
  } catch {
    return { title: 'Twin Workspace' };
  }
}

export default async function TwinWorkspacePage({ params }: Props) {
  const { twinId } = await params;

  const summary = await getWorkspaceSummary(twinId);
  if (!summary) {
    notFound();
  }

  const [alerts, history, hotspots, viewConfig, performance, rules, team] = await Promise.all([
    getWorkspaceAlerts(twinId),
    getWorkspaceHistory(twinId),
    getWorkspaceHotspots(twinId),
    getWorkspaceViewConfig(twinId),
    getWorkspacePerformance(twinId),
    getWorkspaceRules(twinId),
    getWorkspaceTeam(twinId),
  ]);

  const data: WorkspaceRouteData = {
    summary,
    alerts,
    history,
    hotspots,
    viewConfig,
    performance,
    rules,
    team,
  };

  return <WorkspaceShell data={data} />;
}
