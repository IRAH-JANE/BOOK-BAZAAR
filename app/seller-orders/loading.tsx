import SellerNavbar from "@/components/SellerNavbar";

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

export default function Loading() {
  return (
    <>
      <SellerNavbar />

      <main className="min-h-screen bg-[#F7F4EE] px-4 py-6 sm:px-6 lg:px-10 xl:px-20 md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px]">
          <section className="rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6 lg:p-8">
            <SkeletonBox className="h-5 w-36" />
            <SkeletonBox className="mt-4 h-10 w-64 max-w-full" />
            <SkeletonBox className="mt-3 h-5 w-[420px] max-w-full" />
          </section>

          <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="rounded-[24px] border border-[#E5E0D8] bg-white p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <SkeletonBox className="h-4 w-24" />
                    <SkeletonBox className="mt-4 h-8 w-16" />
                    <SkeletonBox className="mt-2 h-4 w-28" />
                  </div>
                  <SkeletonBox className="h-11 w-11 rounded-xl" />
                </div>
              </div>
            ))}
          </section>

          <section className="mt-6 rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6">
            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <SkeletonBox className="h-12 w-full rounded-2xl" />
              <SkeletonBox className="h-12 w-full rounded-2xl" />
            </div>
          </section>

          <section className="mt-6 space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="rounded-[28px] border border-[#E5E0D8] bg-white p-5"
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_120px]">
                  <div>
                    <SkeletonBox className="h-6 w-40" />
                    <SkeletonBox className="mt-3 h-4 w-60 max-w-full" />
                    <SkeletonBox className="mt-3 h-4 w-44 max-w-full" />

                    <div className="mt-5 rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] p-4">
                      <div className="flex gap-3">
                        <SkeletonBox className="h-20 w-16 shrink-0 rounded-xl" />
                        <div className="min-w-0 flex-1">
                          <SkeletonBox className="h-5 w-3/4" />
                          <SkeletonBox className="mt-2 h-4 w-36" />
                          <SkeletonBox className="mt-3 h-4 w-24" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-end">
                    <SkeletonBox className="h-10 w-24 rounded-2xl" />
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}
