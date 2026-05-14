function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

function InfoStripSkeleton() {
  return (
    <section className="border-b border-[#EADFD2] bg-[#FBF7F1]">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-3 lg:px-8">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="rounded-[22px] border border-[#EFE4D7] bg-[#FFFDF9] p-5"
          >
            <div className="flex items-start gap-4 lg:block">
              <SkeletonBox className="h-10 w-10 shrink-0 rounded-2xl lg:mb-4" />

              <div className="min-w-0 flex-1">
                <SkeletonBox className="h-5 w-36" />
                <SkeletonBox className="mt-3 h-4 w-full" />
                <SkeletonBox className="mt-2 h-4 w-10/12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RailSectionSkeleton() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl bg-transparent px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4 bg-transparent">
        <div>
          <SkeletonBox className="h-8 w-64 max-w-full" />
          <SkeletonBox className="mt-3 h-4 w-96 max-w-full" />
        </div>

        <SkeletonBox className="hidden h-4 w-20 sm:block" />
      </div>

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto bg-transparent pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-nowrap lg:overflow-x-hidden">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="min-w-[210px] max-w-[210px] bg-transparent sm:min-w-[220px] sm:max-w-[220px] lg:w-[calc((100%-4rem)/5)] lg:min-w-[calc((100%-4rem)/5)] lg:max-w-[calc((100%-4rem)/5)] lg:flex-none"
          >
            <div className="h-full overflow-hidden rounded-xl border border-[#EEE4D8] bg-[#FFFDF9]">
              <div className="relative overflow-hidden bg-[#EEE6DB]">
                <SkeletonBox className="h-[250px] w-full rounded-none" />
                <SkeletonBox className="absolute left-3 top-3 h-6 w-20 rounded bg-white/80" />
              </div>

              <div className="p-4">
                <SkeletonBox className="h-5 w-full" />
                <SkeletonBox className="mt-2 h-5 w-4/5" />
                <SkeletonBox className="mt-3 h-4 w-2/3" />

                <div className="mt-4 flex items-end justify-between gap-3">
                  <SkeletonBox className="h-6 w-16" />
                  <SkeletonBox className="h-4 w-24" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureSectionSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-6 rounded-2xl border border-[#EFE4D7] bg-[#FFFDF9] p-6 lg:grid-cols-2 lg:p-8">
        <div>
          <SkeletonBox className="h-4 w-36 rounded-full" />
          <SkeletonBox className="mt-4 h-10 w-80 max-w-full" />
          <SkeletonBox className="mt-3 h-10 w-64 max-w-full" />

          <div className="mt-5 space-y-3">
            <SkeletonBox className="h-4 w-full max-w-xl" />
            <SkeletonBox className="h-4 w-10/12 max-w-lg" />
            <SkeletonBox className="h-4 w-8/12 max-w-md" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(2)].map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-[#EFE4D7] bg-[#FFFDF9] p-5"
            >
              <SkeletonBox className="h-5 w-28" />
              <SkeletonBox className="mt-3 h-4 w-full" />
              <SkeletonBox className="mt-2 h-4 w-10/12" />
              <SkeletonBox className="mt-2 h-4 w-8/12" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F8F3EC_0%,#F7EFE4_35%,#FFFDF9_100%)]">
      {/* Hero skeleton matching the homepage carousel layout */}
      <section className="relative overflow-hidden border-b border-[#EADFD2] bg-[#F7F1E8]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(230,126,34,0.14)_0%,rgba(247,241,232,0.92)_34%,rgba(255,253,249,1)_72%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.12),rgba(247,241,232,0.82),#FFFDF9)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid min-h-[520px] gap-12 lg:grid-cols-[480px_minmax(0,1fr)] lg:items-center">
            {/* Left book visual */}
            <div className="relative hidden min-h-[420px] items-center justify-center lg:flex">
              <div className="absolute h-[310px] w-[230px] -rotate-12 rounded-[32px] border border-[#EADFD2] bg-[#E67E22]/80 shadow-xl" />

              <div className="relative z-10 rounded-[32px] border-[14px] border-white bg-white shadow-[0_30px_80px_rgba(31,31,31,0.12)]">
                <SkeletonBox className="h-[360px] w-[250px] rounded-[22px]" />
              </div>
            </div>

            {/* Right featured text */}
            <div className="max-w-2xl">
              <SkeletonBox className="h-9 w-40 rounded-full" />
              <SkeletonBox className="mt-8 h-4 w-48 rounded-full" />

              <SkeletonBox className="mt-20 h-16 w-full max-w-[460px]" />
              <SkeletonBox className="mt-4 h-6 w-56" />

              <div className="mt-8 flex items-center gap-4">
                <SkeletonBox className="h-10 w-28" />
                <SkeletonBox className="h-4 w-28" />
              </div>

              <div className="mt-8 space-y-3">
                <SkeletonBox className="h-4 w-full max-w-xl" />
                <SkeletonBox className="h-4 w-11/12 max-w-lg" />
                <SkeletonBox className="h-4 w-9/12 max-w-md" />
              </div>

              <SkeletonBox className="mt-8 h-12 w-36 rounded-md" />

              <div className="mt-8 flex items-center gap-4">
                <SkeletonBox className="h-10 w-10 rounded-full" />
                <SkeletonBox className="h-10 w-10 rounded-full" />

                <div className="flex items-center gap-2">
                  <SkeletonBox className="h-2 w-2 rounded-full" />
                  <SkeletonBox className="h-2 w-8 rounded-full" />
                  <SkeletonBox className="h-2 w-2 rounded-full" />
                  <SkeletonBox className="h-2 w-2 rounded-full" />
                  <SkeletonBox className="h-2 w-2 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InfoStripSkeleton />

      <RailSectionSkeleton />

      <FeatureSectionSkeleton />

      <RailSectionSkeleton />

      <RailSectionSkeleton />
    </main>
  );
}
