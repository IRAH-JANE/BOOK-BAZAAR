function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 text-[#1F1F1F] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <SkeletonBox className="h-10 w-44 rounded-full" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[28px] border border-[#E5E0D8] bg-white p-8 shadow-sm">
            <SkeletonBox className="mb-6 h-20 w-full rounded-3xl" />
            <SkeletonBox className="mb-6 h-12 w-full rounded-2xl" />

            <div className="space-y-5">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="grid gap-5 md:grid-cols-2">
                  <SkeletonBox className="h-12 w-full rounded-2xl" />
                  <SkeletonBox className="h-12 w-full rounded-2xl" />
                </div>
              ))}

              <SkeletonBox className="h-12 w-full rounded-2xl" />
              <SkeletonBox className="h-32 w-full rounded-2xl" />

              {[...Array(3)].map((_, index) => (
                <div key={index} className="grid gap-5 md:grid-cols-2">
                  <SkeletonBox className="h-12 w-full rounded-2xl" />
                  <SkeletonBox className="h-12 w-full rounded-2xl" />
                </div>
              ))}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <SkeletonBox className="h-12 w-full rounded-full sm:w-40" />
                <SkeletonBox className="h-12 w-full rounded-full sm:w-40" />
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-8 shadow-sm">
              <SkeletonBox className="h-6 w-44" />
              <SkeletonBox className="mt-6 h-72 w-full rounded-3xl" />
              <SkeletonBox className="mt-5 h-8 w-3/4" />
              <SkeletonBox className="mt-3 h-4 w-1/2" />
              <SkeletonBox className="mt-3 h-6 w-32" />
            </div>

            <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-8 shadow-sm">
              <SkeletonBox className="h-6 w-52" />

              <div className="mt-5 space-y-3">
                <SkeletonBox className="h-4 w-full" />
                <SkeletonBox className="h-4 w-5/6" />
                <SkeletonBox className="h-4 w-4/5" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
