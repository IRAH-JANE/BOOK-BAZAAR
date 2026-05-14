function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F7F5F1] px-6 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-[#E5E0D8] bg-white p-8 shadow-sm">
        <SkeletonBox className="h-11 w-80 max-w-full" />
        <SkeletonBox className="mt-3 h-5 w-96 max-w-full" />

        <div className="mt-10 space-y-10">
          {/* Personal Information */}
          <section>
            <SkeletonBox className="mb-5 h-8 w-60" />

            <div className="grid gap-4 md:grid-cols-2">
              <SkeletonBox className="h-[52px] w-full rounded-xl" />
              <SkeletonBox className="h-[52px] w-full rounded-xl" />
              <SkeletonBox className="h-[52px] w-full rounded-xl" />
              <SkeletonBox className="h-[52px] w-full rounded-xl" />
              <SkeletonBox className="h-[52px] w-full rounded-xl" />
              <SkeletonBox className="h-[52px] w-full rounded-xl" />
              <SkeletonBox className="h-[52px] w-full rounded-xl md:col-span-2" />
              <SkeletonBox className="h-[52px] w-full rounded-xl" />
              <SkeletonBox className="h-[52px] w-full rounded-xl" />
            </div>
          </section>

          {/* Address Information */}
          <section>
            <SkeletonBox className="mb-5 h-8 w-56" />

            <div className="grid gap-4 md:grid-cols-2">
              <SkeletonBox className="h-[52px] w-full rounded-xl" />
              <SkeletonBox className="h-[52px] w-full rounded-xl" />
              <SkeletonBox className="h-[52px] w-full rounded-xl" />
              <SkeletonBox className="h-[52px] w-full rounded-xl" />
              <SkeletonBox className="h-[52px] w-full rounded-xl md:col-span-2" />
              <SkeletonBox className="h-[52px] w-full rounded-xl" />
              <SkeletonBox className="h-[52px] w-full rounded-xl" />
            </div>
          </section>

          <SkeletonBox className="h-[48px] w-full rounded-full" />
        </div>

        <div className="mt-6 flex justify-center">
          <SkeletonBox className="h-4 w-56" />
        </div>
      </div>
    </main>
  );
}
