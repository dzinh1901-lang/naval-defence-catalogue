import { redirect } from 'next/navigation';
import { getProject, listRequirements, listReviews } from '@/lib/api';
import { ProjectWorkspace } from '@/components/projects/project-workspace';

interface Props {
  params: Promise<{ projectId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { projectId } = await params;
  try {
    const project = await getProject(projectId);
    return { title: project?.name ?? 'Project' };
  } catch {
    return { title: 'Project' };
  }
}

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;

  let project = null;
  let requirements: Awaited<ReturnType<typeof listRequirements>> = [];
  let reviews: Awaited<ReturnType<typeof listReviews>> = [];

  try {
    project = await getProject(projectId);
    if (project) {
      [requirements, reviews] = await Promise.all([
        listRequirements(projectId),
        listReviews(projectId),
      ]);
    }
  } catch {
    // API unavailable — redirect to home with error
    redirect('/');
  }

  if (!project) redirect('/');

  return <ProjectWorkspace project={project} requirements={requirements} reviews={reviews} />;
}
