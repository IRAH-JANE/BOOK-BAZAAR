function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[32px] border border-[#EEE7DC] bg-gradient-to-br from-[#FFF8F1] via-[#FFFDF9] to-[#F9F4EC] px-6 py-8 shadow-[0_12px_40px_rgba(31,31,31,0.06)] sm:px-8 sm:py-10">
          <SkeletonBox className="h-5 w-28 rounded-full" />
          <SkeletonBox className="mt-4 h-12 w-52" />
          <SkeletonBox className="mt-3 h-5 w-80 max-w-full" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-8">
          <div>
            <div className="mb-4 rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-4 shadow-[0_8px_24px_rgba(31,31,31,0.05)] sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <SkeletonBox className="h-5 w-5 rounded-md" />
                  <SkeletonBox className="h-4 w-24" />
                </div>

                <SkeletonBox className="h-10 w-full rounded-full sm:w-40" />
              </div>
            </div>

            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-4 shadow-[0_10px_28px_rgba(31,31,31,0.05)] sm:p-5"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-3 sm:gap-4">
                      <SkeletonBox className="mt-10 h-5 w-5 rounded-md" />
                      <SkeletonBox className="h-28 w-24 shrink-0 rounded-[22px]" />

                      <div className="min-w-0 flex-1">
                        <SkeletonBox className="h-6 w-2/3" />
                        <SkeletonBox className="mt-2 h-4 w-32" />
                        <SkeletonBox className="mt-4 h-5 w-24" />
                        <SkeletonBox className="mt-2 h-4 w-28" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-[#F0EAE2] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <SkeletonBox className="h-11 w-36 rounded-full" />
                        <SkeletonBox className="h-4 w-20" />
                      </div>

                      <SkeletonBox className="h-10 w-full rounded-full sm:w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_12px_30px_rgba(31,31,31,0.06)] sm:p-6">
              <SkeletonBox className="h-8 w-40" />

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <SkeletonBox className="h-4 w-28" />
                  <SkeletonBox className="h-4 w-8" />
                </div>
                <div className="flex items-center justify-between">
                  <SkeletonBox className="h-4 w-28" />
                  <SkeletonBox className="h-4 w-8" />
                </div>
                <div className="border-t border-[#E5E0D8] pt-4">
                  <div className="flex items-center justify-between">
                    <SkeletonBox className="h-5 w-14" />
                    <SkeletonBox className="h-8 w-28" />
                  </div>
                </div>
              </div>

              <SkeletonBox className="mt-6 h-12 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
