function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F7F5F1]">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Back button */}
        <div className="mb-4 sm:mb-5">
          <SkeletonBox className="h-10 w-24 rounded-full bg-white" />
        </div>

        {/* Main book details layout */}
        <div className="grid gap-5 sm:gap-6 lg:grid-cols-[340px_minmax(0,620px)] lg:items-start lg:justify-center lg:gap-8">
          {/* Book image card */}
          <div className="rounded-[20px] border border-[#E5E0D8] bg-white p-3 shadow-sm sm:rounded-[24px] sm:p-4">
            <SkeletonBox className="h-[420px] w-full rounded-[18px] sm:h-[520px]" />
          </div>

          {/* Book information card */}
          <div className="space-y-5">
            <div className="rounded-[20px] border border-[#E5E0D8] bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-6">
              <SkeletonBox className="h-4 w-44 rounded-full" />

              <SkeletonBox className="mt-4 h-10 w-4/5 sm:h-12" />
              <SkeletonBox className="mt-3 h-5 w-44" />

              {/* Rating / condition / category chips */}
              <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                <SkeletonBox className="h-9 w-36 rounded-full" />
                <SkeletonBox className="h-9 w-20 rounded-full" />
                <SkeletonBox className="h-9 w-28 rounded-full" />
                <SkeletonBox className="h-9 w-24 rounded-full" />
              </div>

              <SkeletonBox className="mt-5 h-9 w-36" />

              {/* Location box */}
              <div className="mt-5">
                <div className="rounded-2xl bg-[#F7F4EE] p-4">
                  <SkeletonBox className="h-3 w-24 rounded-full" />
                  <SkeletonBox className="mt-3 h-5 w-48" />
                </div>
              </div>

              {/* Specifications */}
              <div className="mt-5">
                <SkeletonBox className="h-7 w-48" />

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="rounded-2xl bg-[#F7F4EE] p-4">
                      <SkeletonBox className="h-3 w-24 rounded-full" />
                      <SkeletonBox className="mt-3 h-5 w-36" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <SkeletonBox className="h-7 w-32" />

                <div className="mt-4 rounded-2xl bg-[#F7F4EE] p-4 sm:p-5">
                  <SkeletonBox className="h-4 w-full" />
                  <SkeletonBox className="mt-3 h-4 w-11/12" />
                  <SkeletonBox className="mt-3 h-4 w-10/12" />
                  <SkeletonBox className="mt-4 h-5 w-28" />
                </div>
              </div>

              {/* Book actions */}
              <div className="mt-6 flex flex-wrap gap-3">
                <SkeletonBox className="h-12 w-36 rounded-full" />
                <SkeletonBox className="h-12 w-32 rounded-full" />
                <SkeletonBox className="h-12 w-28 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <section className="mt-10 sm:mt-14">
          <div className="mb-6">
            <SkeletonBox className="h-4 w-40 rounded-full" />
            <SkeletonBox className="mt-3 h-9 w-64" />
            <SkeletonBox className="mt-3 h-5 w-80 max-w-full" />
          </div>

          <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
            {/* Review summary / form card */}
            <div className="rounded-[20px] border border-[#E5E0D8] bg-white p-5 shadow-sm sm:rounded-[24px]">
              <SkeletonBox className="h-10 w-20" />
              <SkeletonBox className="mt-3 h-4 w-36" />
              <SkeletonBox className="mt-5 h-4 w-28" />

              <div className="mt-6 border-t border-[#E5E0D8] pt-5">
                <SkeletonBox className="h-5 w-28" />
                <SkeletonBox className="mt-4 h-5 w-36" />
                <SkeletonBox className="mt-4 h-28 w-full rounded-2xl" />
                <SkeletonBox className="mt-4 h-11 w-32 rounded-full" />
              </div>
            </div>

            {/* Review list */}
            <div className="space-y-4">
              {[...Array(2)].map((_, index) => (
                <div
                  key={index}
                  className="rounded-[20px] border border-[#E5E0D8] bg-white p-5 shadow-sm sm:rounded-[24px]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <SkeletonBox className="h-5 w-44" />
                      <SkeletonBox className="mt-2 h-4 w-24" />
                    </div>

                    <SkeletonBox className="h-5 w-28" />
                  </div>

                  <SkeletonBox className="mt-5 h-4 w-full" />
                  <SkeletonBox className="mt-3 h-4 w-9/12" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related books */}
        <section className="mt-10 sm:mt-14">
          <div className="mb-6">
            <SkeletonBox className="h-4 w-40 rounded-full" />
            <SkeletonBox className="mt-3 h-9 w-52" />
            <SkeletonBox className="mt-3 h-5 w-80 max-w-full" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="rounded-[20px] border border-[#E5E0D8] bg-white p-4 shadow-sm sm:rounded-[24px]"
              >
                <SkeletonBox className="h-52 w-full rounded-2xl sm:h-64" />

                <div className="pt-4">
                  <SkeletonBox className="h-5 w-4/5" />
                  <SkeletonBox className="mt-3 h-5 w-3/5" />
                  <SkeletonBox className="mt-4 h-6 w-24" />
                  <SkeletonBox className="mt-3 h-4 w-32" />
                  <SkeletonBox className="mt-3 h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
