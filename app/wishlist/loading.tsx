function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 min-[480px]:px-6 min-[768px]:px-8 min-[1024px]:px-10 min-[1280px]:px-20 min-[1440px]:px-0">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="relative overflow-hidden rounded-[32px] border border-[#EEE7DC] bg-gradient-to-br from-[#FFF8F1] via-[#FFFDF9] to-[#F9F4EC] px-6 py-8 shadow-[0_12px_40px_rgba(31,31,31,0.06)] sm:px-8 sm:py-10">
          <div className="max-w-2xl">
            <SkeletonBox className="h-11 w-64" />
            <SkeletonBox className="mt-3 h-5 w-[22rem] max-w-full" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 min-[480px]:gap-4 min-[768px]:grid-cols-3 min-[768px]:gap-5 min-[1024px]:grid-cols-4 min-[1024px]:gap-6">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[22px] border border-[#E5E0D8] bg-white p-3 shadow-sm min-[480px]:p-4"
            >
              <div className="relative overflow-hidden rounded-2xl bg-[#F7F4EE]">
                <SkeletonBox className="h-40 w-full rounded-2xl min-[480px]:h-52 min-[768px]:h-60 min-[1024px]:h-64" />
                <SkeletonBox className="absolute left-3 top-3 h-7 w-20 rounded-full bg-white/90" />
                <SkeletonBox className="absolute right-3 top-3 h-10 w-10 rounded-full bg-white/90" />
              </div>

              <div className="pt-4">
                <SkeletonBox className="h-5 w-full" />
                <SkeletonBox className="mt-2 h-5 w-4/5" />
                <SkeletonBox className="mt-3 h-4 w-24" />

                <div className="mt-3 flex items-end justify-between gap-2 min-[480px]:gap-3">
                  <div className="min-w-0 flex-1">
                    <SkeletonBox className="h-4 w-24" />
                    <SkeletonBox className="mt-2 h-4 w-16" />
                  </div>

                  <SkeletonBox className="h-7 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
