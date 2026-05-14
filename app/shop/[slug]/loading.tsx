function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F7F5F1]">
      {/* HEADER */}
      <section className="border-b border-[#E5E0D8] bg-[#FFF8F0]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="rounded-[26px] border border-[#E5E0D8] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <SkeletonBox className="h-16 w-16 shrink-0 rounded-2xl" />

                <div className="min-w-0 flex-1">
                  <SkeletonBox className="h-9 w-64 max-w-full" />

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <SkeletonBox className="h-4 w-24" />
                    <SkeletonBox className="h-4 w-32" />
                    <SkeletonBox className="h-4 w-40" />
                  </div>

                  <SkeletonBox className="mt-3 h-4 w-32" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <SkeletonBox className="h-12 w-24 rounded-xl" />
                <SkeletonBox className="h-12 w-28 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SORT / FILTER */}
      <section className="mx-auto max-w-7xl px-6 py-7">
        <div className="mb-7 rounded-[24px] border border-[#E5E0D8] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <SkeletonBox className="h-8 w-56" />
              <SkeletonBox className="mt-2 h-4 w-72 max-w-full" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="min-w-[180px]">
                <SkeletonBox className="h-4 w-16" />
                <SkeletonBox className="mt-2 h-12 w-full rounded-xl" />
              </div>

              <div className="min-w-[180px]">
                <SkeletonBox className="h-4 w-20" />
                <SkeletonBox className="mt-2 h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* BOOK GRID */}
        <div className="grid grid-cols-1 gap-6 pb-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(10)].map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[22px] border border-[#E5E0D8] bg-white p-4 shadow-sm"
            >
              <div className="relative overflow-hidden rounded-2xl bg-[#F7F4EE]">
                <SkeletonBox className="h-64 w-full rounded-2xl" />
                <SkeletonBox className="absolute left-3 top-3 h-7 w-20 rounded-full bg-white/90" />
                <SkeletonBox className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/90" />
              </div>

              <div className="pt-4">
                <SkeletonBox className="h-5 w-full" />
                <SkeletonBox className="mt-2 h-5 w-4/5" />
                <SkeletonBox className="mt-2 h-4 w-2/3" />

                <div className="mt-3 flex items-end justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <SkeletonBox className="h-4 w-24" />
                    <SkeletonBox className="mt-2 h-3 w-20" />
                  </div>

                  <SkeletonBox className="h-6 w-16" />
                </div>

                <SkeletonBox className="mt-4 h-10 w-full rounded-full md:hidden" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
