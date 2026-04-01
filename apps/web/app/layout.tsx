import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Naval Digital Twin Platform',
    template: '%s — Naval DTP',
  },
  description:
    'Engineering workspace for naval defence digital twins: system definition, requirements traceability, and simulation orchestration.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full bg-surface-0 text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
