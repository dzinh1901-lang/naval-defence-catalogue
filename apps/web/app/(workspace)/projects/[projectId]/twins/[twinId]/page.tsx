import { redirect } from 'next/navigation';
import { getWorkspaceSummary } from '@/lib/api';

interface Props {
  params: Promise<{ projectId: string; twinId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { twinId } = await params;
  try {
    const summary = await getWorkspaceSummary(twinId);
    return { title: summary?.twin.name ?? 'Twin Workspace' };
  } catch {
    return { title: 'Twin Workspace' };
  }
}

export default async function TwinPage({ params }: Props) {
  const { twinId } = await params;
  redirect(`/twins/${twinId}/dashboard`);
}
