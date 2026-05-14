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

      <main className="min-h-screen bg-[#F7F4EE] px-4 py-8 sm:px-6 lg:px-8 md:ml-[240px]">
        <div className="mx-auto max-w-[1100px]">
          <section className="rounded-[32px] border border-[#E5E0D8] bg-white p-6 sm:p-8">
            <SkeletonBox className="h-5 w-24 rounded-full" />
            <SkeletonBox className="mt-4 h-12 w-64" />
            <SkeletonBox className="mt-3 h-5 w-80 max-w-full" />
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
            <section className="rounded-[28px] border border-[#E5E0D8] bg-white p-6">
              <SkeletonBox className="h-7 w-40" />

              <div className="mt-6 grid gap-8">
                <div>
                  <SkeletonBox className="h-6 w-40" />

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i}>
                        <SkeletonBox className="h-4 w-28" />
                        <SkeletonBox className="mt-2 h-12 w-full rounded-2xl" />
                      </div>
                    ))}

                    <div className="md:col-span-2">
                      <SkeletonBox className="h-4 w-24" />
                      <SkeletonBox className="mt-2 h-28 w-full rounded-2xl" />
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-[#EEE6DB]" />

                <div>
                  <SkeletonBox className="h-6 w-40" />

                  <div className="mt-4 rounded-2xl border border-[#EEE6DB] bg-[#F7F4EE] p-4">
                    <SkeletonBox className="h-5 w-40" />
                    <SkeletonBox className="mt-2 h-4 w-full" />
                    <SkeletonBox className="mt-2 h-4 w-5/6" />
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <SkeletonBox className="h-4 w-28" />
                      <SkeletonBox className="mt-2 h-12 w-full rounded-2xl" />
                    </div>

                    <div>
                      <SkeletonBox className="h-4 w-36" />
                      <SkeletonBox className="mt-2 h-12 w-full rounded-2xl" />
                    </div>

                    <div className="md:col-span-2">
                      <SkeletonBox className="h-4 w-40" />
                      <SkeletonBox className="mt-2 h-12 w-full rounded-2xl" />
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#EEE6DB] bg-[#F7F4EE] p-4">
                    <SkeletonBox className="h-5 w-52" />
                    <SkeletonBox className="mt-2 h-4 w-full" />
                    <SkeletonBox className="mt-2 h-4 w-5/6" />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <SkeletonBox className="h-12 w-48 rounded-2xl" />
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-6">
                <SkeletonBox className="h-7 w-40" />

                <div className="mt-5 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonBox key={i} className="h-12 w-full rounded-2xl" />
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-6">
                <SkeletonBox className="h-7 w-40" />

                <div className="mt-5 rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] p-4">
                  <div className="flex items-start gap-3">
                    <SkeletonBox className="h-16 w-16 shrink-0 rounded-2xl" />

                    <div className="min-w-0 flex-1">
                      <SkeletonBox className="h-6 w-40" />
                      <SkeletonBox className="mt-2 h-4 w-28" />
                      <SkeletonBox className="mt-4 h-4 w-full" />
                      <SkeletonBox className="mt-2 h-4 w-5/6" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
