import { redirect } from 'next/navigation';
import { getProject, getTwin, listRequirements } from '@/lib/api';
import { TwinWorkspace } from '@/components/twins/twin-workspace';

interface Props {
  params: Promise<{ projectId: string; twinId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { twinId } = await params;
  try {
    const twin = await getTwin(twinId);
    return { title: twin?.name ?? 'Twin Workspace' };
  } catch {
    return { title: 'Twin Workspace' };
  }
}

export default async function TwinPage({ params }: Props) {
  const { projectId, twinId } = await params;

  let project: Awaited<ReturnType<typeof getProject>> = null;
  let twin: Awaited<ReturnType<typeof getTwin>> = null;
  let requirements: Awaited<ReturnType<typeof listRequirements>> = [];

  try {
    [project, twin] = await Promise.all([
      getProject(projectId),
      getTwin(twinId),
    ]);

    if (project && twin) {
      requirements = await listRequirements(project.id);
    }
  } catch {
    redirect('/');
  }

  if (!project) redirect('/');
  if (!twin) redirect(`/projects/${projectId}`);

  return <TwinWorkspace project={project} twin={twin} requirements={requirements} />;
}
