import { redirect } from 'next/navigation';
import { MOCK_PROJECTS } from '@/lib/mock-data';
import { ProjectWorkspace } from '@/components/projects/project-workspace';

interface Props {
  params: Promise<{ projectId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { projectId } = await params;
  const project = MOCK_PROJECTS.find((p) => p.id === projectId);
  return { title: project?.name ?? 'Project' };
}

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;
  const project = MOCK_PROJECTS.find((p) => p.id === projectId);
  if (!project) redirect('/');

  return <ProjectWorkspace project={project} />;
}
