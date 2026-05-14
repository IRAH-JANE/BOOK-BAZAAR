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
          <SkeletonBox className="h-10 w-28 rounded-full" />
          <SkeletonBox className="mt-6 h-4 w-28 rounded-full" />
          <SkeletonBox className="mt-2 h-10 w-40" />
          <SkeletonBox className="mt-2 h-5 w-96 max-w-full" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-8">
          <div className="space-y-6">
            {[...Array(3)].map((_, sectionIndex) => (
              <div
                key={sectionIndex}
                className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <SkeletonBox className="mt-1 h-5 w-5 rounded-full" />
                  <div className="flex-1">
                    <SkeletonBox className="h-8 w-52" />
                    <SkeletonBox className="mt-2 h-4 w-80 max-w-full" />
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {[...Array(sectionIndex === 0 ? 1 : 3)].map((_, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] px-4 py-4 sm:items-center sm:gap-4"
                    >
                      <SkeletonBox className="mt-1 h-4 w-4 rounded-full sm:mt-0" />
                      <SkeletonBox className="h-5 w-5 rounded-full" />
                      <div className="min-w-0 flex-1">
                        <SkeletonBox className="h-5 w-40" />
                        <SkeletonBox className="mt-2 h-4 w-64 max-w-full" />
                      </div>
                    </div>
                  ))}
                </div>

                {sectionIndex === 1 && (
                  <div className="mt-5">
                    <SkeletonBox className="mb-2 h-4 w-40" />
                    <SkeletonBox className="h-28 w-full rounded-2xl" />
                  </div>
                )}

                {sectionIndex === 2 && (
                  <>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <SkeletonBox className="h-12 w-full rounded-2xl" />
                      <SkeletonBox className="h-12 w-full rounded-2xl" />
                      <SkeletonBox className="h-12 w-full rounded-2xl md:col-span-2" />
                    </div>

                    <div className="mt-5 rounded-2xl bg-[#F7F4EE] p-4">
                      <div className="flex items-start gap-3">
                        <SkeletonBox className="mt-1 h-5 w-5 rounded-full" />
                        <div className="flex-1">
                          <SkeletonBox className="h-4 w-full" />
                          <SkeletonBox className="mt-2 h-4 w-5/6" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

            <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <SkeletonBox className="h-8 w-40" />

              <div className="mt-4 space-y-4">
                {[...Array(2)].map((_, index) => (
                  <div
                    key={index}
                    className="flex gap-3 rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] p-4 sm:gap-4"
                  >
                    <SkeletonBox className="h-20 w-16 shrink-0 rounded-xl sm:h-24 sm:w-20" />
                    <div className="min-w-0 flex-1">
                      <SkeletonBox className="h-6 w-3/4" />
                      <SkeletonBox className="mt-2 h-4 w-40" />
                      <SkeletonBox className="mt-2 h-4 w-24" />
                      <SkeletonBox className="mt-2 h-5 w-28" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="h-fit rounded-2xl border border-[#E5E0D8] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
              <SkeletonBox className="h-8 w-44" />

              <div className="mt-6 space-y-3">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4"
                  >
                    <SkeletonBox className="h-4 w-28" />
                    <SkeletonBox className="h-4 w-16" />
                  </div>
                ))}

                <div className="border-t border-[#E5E0D8] pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <SkeletonBox className="h-6 w-28" />
                    <SkeletonBox className="h-8 w-24" />
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
