function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[32px] border border-[#EEE7DC] bg-gradient-to-br from-[#FFF8F1] via-[#FFFDF9] to-[#F9F4EC] px-6 py-8 shadow-[0_12px_40px_rgba(31,31,31,0.06)] sm:px-8 sm:py-10">
          <SkeletonBox className="h-5 w-32 rounded-full" />
          <SkeletonBox className="mt-4 h-12 w-56" />
          <SkeletonBox className="mt-3 h-5 w-80 max-w-full" />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_10px_28px_rgba(31,31,31,0.05)]"
            >
              <SkeletonBox className="h-4 w-28" />
              <SkeletonBox className="mt-4 h-8 w-16" />
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_8px_24px_rgba(31,31,31,0.05)]">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <SkeletonBox className="h-12 w-full rounded-2xl" />
            <SkeletonBox className="h-12 w-full rounded-2xl" />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_10px_28px_rgba(31,31,31,0.05)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <SkeletonBox className="h-8 w-40" />
                  <SkeletonBox className="mt-3 h-4 w-32" />
                </div>
                <SkeletonBox className="h-9 w-28 rounded-full" />
              </div>

              <div className="mt-5 rounded-2xl border border-[#E5E0D8] bg-white p-4">
                <div className="flex gap-3">
                  <SkeletonBox className="h-20 w-16 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <SkeletonBox className="h-5 w-3/4" />
                    <SkeletonBox className="mt-2 h-4 w-40" />
                    <SkeletonBox className="mt-3 h-4 w-28" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
