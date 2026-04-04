import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Naval Digital Twin Platform',
    template: '%s — Naval DTP',
  },
  description:
    'Digital twin workspace for naval engineering teams: system definition, requirements traceability, evidence-backed reviews, and simulation coordination.',
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
