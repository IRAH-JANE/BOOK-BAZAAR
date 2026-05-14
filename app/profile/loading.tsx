function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F7F4EE] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <section className="rounded-[32px] border border-[#E5E0D8] bg-white p-6 sm:p-8 lg:p-10">
          <SkeletonBox className="h-5 w-28 rounded-full" />
          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <SkeletonBox className="h-20 w-20 rounded-full" />
              <div>
                <SkeletonBox className="h-10 w-72 max-w-full" />
                <div className="mt-3 flex gap-2">
                  <SkeletonBox className="h-7 w-28 rounded-full" />
                  <SkeletonBox className="h-7 w-32 rounded-full" />
                </div>
              </div>
            </div>
            <SkeletonBox className="h-11 w-44 rounded-full" />
          </div>
          <SkeletonBox className="mt-5 h-5 w-96 max-w-full" />
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_380px]">
          <section className="rounded-[28px] border border-[#E5E0D8] bg-white p-6 sm:p-7">
            <SkeletonBox className="h-8 w-56" />

            <div className="mt-6 space-y-8">
              {[...Array(2)].map((_, sectionIndex) => (
                <div key={sectionIndex}>
                  <SkeletonBox className="h-6 w-36" />
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <SkeletonBox className="h-4 w-24" />
                      <SkeletonBox className="mt-2 h-12 w-full" />
                    </div>
                    <div>
                      <SkeletonBox className="h-4 w-20" />
                      <SkeletonBox className="mt-2 h-12 w-full" />
                    </div>
                    <div>
                      <SkeletonBox className="h-4 w-24" />
                      <SkeletonBox className="mt-2 h-12 w-full" />
                    </div>
                  </div>

                  <div className="mt-8 h-px w-full bg-[#EEE6DB]" />
                </div>
              ))}

              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <SkeletonBox className="h-6 w-40" />
                    <SkeletonBox className="mt-2 h-4 w-48" />
                  </div>
                  <SkeletonBox className="h-11 w-24 rounded-2xl" />
                </div>

                <div className="mt-5 space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] p-4"
                    >
                      <SkeletonBox className="h-5 w-32" />
                      <SkeletonBox className="mt-3 h-4 w-52" />
                      <SkeletonBox className="mt-2 h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <SkeletonBox className="h-12 w-40 rounded-2xl" />
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-6">
              <SkeletonBox className="h-8 w-44" />
              <div className="mt-5 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <SkeletonBox key={i} className="h-20 w-full rounded-2xl" />
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-6">
              <SkeletonBox className="h-8 w-44" />
              <SkeletonBox className="mt-2 h-4 w-40" />
              <SkeletonBox className="mt-5 h-11 w-28 rounded-full" />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
