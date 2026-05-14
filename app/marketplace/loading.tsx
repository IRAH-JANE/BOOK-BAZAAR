const hiddenScrollbarClass =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

export default function Loading() {
  return (
    <main className="bg-[#F7F5F1] lg:h-[calc(100vh-76px)] lg:overflow-hidden">
      <div className="mx-auto w-full max-w-[1200px] px-4 min-[480px]:px-6 min-[768px]:px-8 min-[1024px]:px-10 min-[1280px]:px-20 min-[1440px]:px-0 lg:h-full">
        <div className="grid gap-6 py-4 min-[480px]:gap-6 min-[480px]:py-5 min-[768px]:gap-8 min-[768px]:py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:h-full lg:py-0">
          {/* Desktop filter sidebar */}
          <aside className="hidden lg:block lg:h-full lg:overflow-hidden lg:border-r lg:border-[#E5E0D8] lg:pr-6 lg:pt-6">
            <div
              className={`h-full overflow-y-auto pr-2 pb-6 ${hiddenScrollbarClass}`}
            >
              <div className="space-y-8">
                {/* Search */}
                <div>
                  <SkeletonBox className="mb-3 h-4 w-16" />
                  <SkeletonBox className="h-10 w-full" />
                </div>

                {/* Categories */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <SkeletonBox className="h-4 w-24" />
                    <SkeletonBox className="h-4 w-4 rounded-full" />
                  </div>

                  <div className="space-y-2">
                    {[...Array(8)].map((_, index) => (
                      <SkeletonBox key={index} className="h-4 w-32" />
                    ))}
                  </div>
                </div>

                {/* Genre */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <SkeletonBox className="h-4 w-16" />
                    <SkeletonBox className="h-4 w-4 rounded-full" />
                  </div>

                  <div className="space-y-2">
                    {[...Array(8)].map((_, index) => (
                      <SkeletonBox key={index} className="h-4 w-28" />
                    ))}
                  </div>
                </div>

                {/* Types of Book */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <SkeletonBox className="h-4 w-28" />
                    <SkeletonBox className="h-4 w-4 rounded-full" />
                  </div>

                  <div className="space-y-2">
                    {[...Array(8)].map((_, index) => (
                      <SkeletonBox key={index} className="h-4 w-32" />
                    ))}
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <SkeletonBox className="mb-3 h-4 w-20" />

                  <div className="space-y-2 pb-6">
                    {[...Array(4)].map((_, index) => (
                      <SkeletonBox key={index} className="h-4 w-28" />
                    ))}
                  </div>
                </div>

                <SkeletonBox className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div
            className={`min-w-0 lg:h-full lg:overflow-y-auto lg:-mr-38 ${hiddenScrollbarClass}`}
          >
            <section className="min-w-0 lg:pr-10 lg:pt-6 lg:pb-6">
              {/* Header */}
              <div className="mb-6 flex flex-col gap-4 border-b border-[#E5E0D8] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <SkeletonBox className="h-8 w-48" />
                  <SkeletonBox className="mt-2 h-4 w-72 max-w-full" />
                  <SkeletonBox className="mt-2 h-4 w-40" />
                </div>

                <div className="hidden items-center gap-3 lg:flex">
                  <SkeletonBox className="h-4 w-14" />
                  <SkeletonBox className="h-10 w-40 rounded-xl" />
                </div>
              </div>

              {/* Mobile filter/sort shortcut bar */}
              <div className="fixed left-0 right-0 top-[120px] z-30 px-4 min-[480px]:px-6 lg:hidden">
                <div className="mx-auto w-full max-w-[1200px]">
                  <div className="rounded-2xl border border-white/20 bg-white/10 py-2 shadow-sm backdrop-blur-md">
                    <div className="flex gap-2">
                      <SkeletonBox className="h-11 flex-1 rounded-full bg-white" />
                      <SkeletonBox className="h-11 flex-1 rounded-full bg-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Book grid */}
              <div className="grid grid-cols-2 gap-3 pb-6 min-[480px]:gap-4 min-[768px]:grid-cols-3 min-[768px]:gap-5 min-[1024px]:grid-cols-4 min-[1024px]:gap-6">
                {[...Array(12)].map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[22px] border border-[#E5E0D8] bg-white p-3 shadow-sm min-[480px]:p-4"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-[#F7F4EE]">
                      <SkeletonBox className="h-40 w-full rounded-2xl min-[480px]:h-52 min-[768px]:h-60 min-[1024px]:h-64" />

                      {/* Condition pill */}
                      <SkeletonBox className="absolute left-3 top-3 h-7 w-20 rounded-full bg-white/90" />

                      {/* Wishlist button */}
                      <SkeletonBox className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/90" />

                      {/* Stock pill */}
                      <SkeletonBox className="absolute bottom-3 left-3 h-7 w-20 rounded-full bg-white/90" />
                    </div>

                    <div className="pt-4">
                      <SkeletonBox className="h-5 w-full" />
                      <SkeletonBox className="mt-2 h-5 w-4/5" />

                      <SkeletonBox className="mt-2 h-4 w-2/3" />

                      <div className="mt-3 flex items-end justify-between gap-2">
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

              {/* Pagination skeleton */}
              <div className="flex flex-row flex-wrap items-center justify-center gap-3 pb-8">
                <SkeletonBox className="h-10 w-28 rounded-full" />

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {[...Array(5)].map((_, index) => (
                    <SkeletonBox
                      key={index}
                      className="h-10 min-w-[40px] rounded-full"
                    />
                  ))}
                </div>

                <SkeletonBox className="h-10 w-24 rounded-full" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
