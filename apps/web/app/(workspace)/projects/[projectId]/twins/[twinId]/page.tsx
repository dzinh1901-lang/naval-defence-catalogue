import { redirect } from 'next/navigation';
import { MOCK_PROJECTS } from '@/lib/mock-data';
import { TwinWorkspace } from '@/components/twins/twin-workspace';

interface Props {
  params: Promise<{ projectId: string; twinId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { twinId } = await params;
  const twin = findTwin(twinId);
  return { title: twin?.name ?? 'Twin Workspace' };
}

export default async function TwinPage({ params }: Props) {
  const { projectId, twinId } = await params;
  const project = MOCK_PROJECTS.find((p) => p.id === projectId);
  if (!project) redirect('/');

  const twin = project.twins?.find((t) => t.id === twinId);
  if (!twin) redirect(`/projects/${projectId}`);

  return <TwinWorkspace project={project} twin={twin} />;
}

function findTwin(twinId: string) {
  for (const p of MOCK_PROJECTS) {
    const t = p.twins?.find((tw) => tw.id === twinId);
    if (t) return t;
  }
  return null;
}
