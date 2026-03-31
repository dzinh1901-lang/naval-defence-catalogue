import { WorkspaceLayout } from '@/components/shell/workspace-layout';

export default function WorkspaceRootLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
