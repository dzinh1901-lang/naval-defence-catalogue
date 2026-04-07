import { notFound } from 'next/navigation';
import { getWorkspaceDashboard } from '@/lib/api';
import { TwinOperationsDashboard } from '@/components/workspace/twin-operations-dashboard';

interface Props {
  params: Promise<{ twinId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { twinId } = await params;

  try {
    const payload = await getWorkspaceDashboard(twinId);
    return {
      title: `${payload.summary.twin.name} Dashboard`,
    };
  } catch {
    return { title: 'Twin Dashboard' };
  }
}

export default async function TwinDashboardPage({ params }: Props) {
  const { twinId } = await params;

  try {
    const data = await getWorkspaceDashboard(twinId);
    return <TwinOperationsDashboard twinId={twinId} data={data} />;
  } catch {
    notFound();
  }
}
