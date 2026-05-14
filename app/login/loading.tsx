function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-md rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8">
        <SkeletonBox className="h-10 w-32" />
        <SkeletonBox className="mt-3 h-5 w-72 max-w-full" />

        <div className="mt-6 space-y-4">
          <SkeletonBox className="h-[50px] w-full rounded-2xl" />
          <SkeletonBox className="h-[50px] w-full rounded-2xl" />
          <SkeletonBox className="h-[48px] w-full rounded-full" />
        </div>

        <div className="mt-6 flex justify-center">
          <SkeletonBox className="h-4 w-56" />
        </div>
      </div>
    </main>
  );
}
