function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <SkeletonBox className="h-4 w-24 rounded-full" />
          <SkeletonBox className="mt-3 h-10 w-56" />
          <SkeletonBox className="mt-2 h-5 w-80 max-w-full" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:gap-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5"
              >
                <div className="flex gap-4">
                  <SkeletonBox className="h-24 w-20 shrink-0 rounded-2xl sm:h-28 sm:w-24" />

                  <div className="min-w-0 flex-1">
                    <SkeletonBox className="h-6 w-2/3" />
                    <SkeletonBox className="mt-2 h-4 w-40" />
                    <SkeletonBox className="mt-3 h-4 w-24" />
                    <SkeletonBox className="mt-2 h-4 w-32" />
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <SkeletonBox className="h-10 w-28 rounded-full" />
                  <SkeletonBox className="h-10 w-32 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[#E5E0D8] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
            <SkeletonBox className="h-8 w-40" />

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <SkeletonBox className="h-4 w-24" />
                <SkeletonBox className="h-4 w-16" />
              </div>
              <div className="flex items-center justify-between">
                <SkeletonBox className="h-4 w-24" />
                <SkeletonBox className="h-4 w-12" />
              </div>
              <div className="flex items-center justify-between">
                <SkeletonBox className="h-4 w-28" />
                <SkeletonBox className="h-4 w-20" />
              </div>

              <div className="border-t border-[#E5E0D8] pt-4">
                <div className="flex items-center justify-between">
                  <SkeletonBox className="h-5 w-20" />
                  <SkeletonBox className="h-8 w-28" />
                </div>
              </div>
            </div>

            <SkeletonBox className="mt-6 h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
