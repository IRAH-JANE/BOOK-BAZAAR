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
            <SkeletonBox className="mt-4 h-10 w-72 max-w-full" />
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

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_340px]">
            <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6">
              <SkeletonBox className="h-7 w-44" />
              <SkeletonBox className="mt-3 h-4 w-52" />

              <div className="mt-6 flex h-[240px] items-end gap-3">
                {[...Array(7)].map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-1 flex-col items-center gap-3"
                  >
                    <SkeletonBox
                      className={`w-full rounded-t-xl ${
                        index % 2 === 0 ? "h-24" : "h-40"
                      }`}
                    />
                    <SkeletonBox className="h-3 w-8" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6">
              <SkeletonBox className="h-7 w-44" />
              <SkeletonBox className="mt-3 h-4 w-44" />

              <div className="mt-6 space-y-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index}>
                    <div className="mb-2 flex items-center justify-between">
                      <SkeletonBox className="h-4 w-28" />
                      <SkeletonBox className="h-4 w-10" />
                    </div>
                    <SkeletonBox className="h-3 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_340px]">
            <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6">
              <SkeletonBox className="h-7 w-44" />
              <SkeletonBox className="mt-3 h-4 w-60" />

              <div className="mt-5 space-y-4">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[24px] border border-[#E5E0D8] bg-[#FFFDF9] p-4"
                  >
                    <div className="flex gap-4">
                      <SkeletonBox className="h-24 w-20 shrink-0 rounded-2xl" />
                      <div className="min-w-0 flex-1">
                        <SkeletonBox className="h-6 w-52 max-w-full" />
                        <SkeletonBox className="mt-2 h-4 w-28" />
                        <div className="mt-4 flex gap-2">
                          <SkeletonBox className="h-7 w-20 rounded-full" />
                          <SkeletonBox className="h-7 w-20 rounded-full" />
                        </div>
                      </div>
                      <div className="hidden w-28 shrink-0 md:block">
                        <SkeletonBox className="ml-auto h-7 w-20" />
                        <SkeletonBox className="mt-2 ml-auto h-4 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6">
                <SkeletonBox className="h-7 w-40" />
                <div className="mt-5 space-y-3">
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] px-4 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <SkeletonBox className="h-10 w-10 rounded-xl" />
                        <SkeletonBox className="h-4 w-28" />
                      </div>
                      <SkeletonBox className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6">
                <SkeletonBox className="h-7 w-40" />
                <div className="mt-5 space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] p-4"
                    >
                      <SkeletonBox className="h-5 w-36" />
                      <SkeletonBox className="mt-2 h-4 w-40" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
