'use client';

export default function TwinWorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#02070f_0%,#07111d_50%,#02070f_100%)] p-6 text-white">
      <div className="max-w-lg rounded-[28px] border border-red-400/20 bg-slate-950/70 p-8 text-center shadow-[0_30px_90px_rgba(2,12,21,0.45)]">
        <p className="text-[11px] uppercase tracking-[0.3em] text-red-200/70">Workspace Error</p>
        <h1 className="mt-4 text-2xl font-semibold">Unable to load the digital twin workspace.</h1>
        <p className="mt-4 text-sm leading-6 text-slate-300/80">
          {error.message || 'A workspace request failed before the page could render.'}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
