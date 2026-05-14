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
            <SkeletonBox className="h-5 w-32" />
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
            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr]">
              <SkeletonBox className="h-12 w-full rounded-2xl" />
              <SkeletonBox className="h-12 w-full rounded-2xl" />
              <SkeletonBox className="h-12 w-full rounded-2xl" />
              <SkeletonBox className="h-12 w-full rounded-2xl" />
            </div>
          </section>

          <section className="mt-6 space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="rounded-[28px] border border-[#E5E0D8] bg-white p-4 sm:p-5"
              >
                <div className="grid gap-4 lg:grid-cols-[100px_minmax(0,1fr)_170px] lg:items-center">
                  <SkeletonBox className="h-28 w-20 rounded-2xl" />

                  <div className="min-w-0">
                    <SkeletonBox className="h-7 w-52 max-w-full" />
                    <SkeletonBox className="mt-2 h-4 w-32" />
                    <SkeletonBox className="mt-3 h-4 w-28" />
                    <div className="mt-4 flex gap-2">
                      <SkeletonBox className="h-7 w-20 rounded-full" />
                      <SkeletonBox className="h-7 w-20 rounded-full" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <SkeletonBox className="h-11 w-full rounded-2xl" />
                    <SkeletonBox className="h-11 w-full rounded-2xl" />
                    <SkeletonBox className="h-11 w-full rounded-2xl" />
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
