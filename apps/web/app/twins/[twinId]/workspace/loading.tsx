export default function TwinWorkspaceLoading() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#02070f_0%,#07111d_50%,#02070f_100%)] px-4 py-5 text-white md:px-5 xl:px-6">
      <div className="mx-auto max-w-[1880px] space-y-4">
        <div className="h-24 animate-pulse rounded-[28px] border border-white/10 bg-white/5" />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <div className="h-[520px] animate-pulse rounded-[30px] border border-white/10 bg-white/5" />
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="h-64 animate-pulse rounded-[24px] border border-white/10 bg-white/5" />
              <div className="h-64 animate-pulse rounded-[24px] border border-white/10 bg-white/5" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-48 animate-pulse rounded-[24px] border border-white/10 bg-white/5" />
            <div className="h-72 animate-pulse rounded-[24px] border border-white/10 bg-white/5" />
            <div className="h-72 animate-pulse rounded-[24px] border border-white/10 bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
