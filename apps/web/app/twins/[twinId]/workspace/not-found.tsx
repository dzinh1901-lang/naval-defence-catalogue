import Link from 'next/link';

export default function TwinWorkspaceNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#02070f_0%,#07111d_50%,#02070f_100%)] p-6 text-white">
      <div className="max-w-lg rounded-[28px] border border-white/10 bg-slate-950/70 p-8 text-center shadow-[0_30px_90px_rgba(2,12,21,0.45)]">
        <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/70">Twin Not Found</p>
        <h1 className="mt-4 text-2xl font-semibold">The requested workspace is unavailable.</h1>
        <p className="mt-4 text-sm leading-6 text-slate-300/80">
          The twin may not exist in your current organization scope, or the seed data has not been loaded yet.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          Back to Projects
        </Link>
      </div>
    </div>
  );
}
