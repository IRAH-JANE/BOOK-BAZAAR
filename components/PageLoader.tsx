type PageLoaderProps = {
  title?: string;
  subtitle?: string;
};

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

export default function PageLoader({ title, subtitle }: PageLoaderProps) {
  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        {/* Optional text (if you still want it) */}
        {(title || subtitle) && (
          <div className="mb-6 text-center">
            {title && (
              <p className="text-lg font-semibold text-[#1F1F1F]">{title}</p>
            )}
            {subtitle && <p className="text-sm text-[#6B6B6B]">{subtitle}</p>}
          </div>
        )}

        {/* Skeleton Card */}
        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8">
          <SkeletonBox className="h-10 w-48" />
          <SkeletonBox className="mt-3 h-5 w-72 max-w-full" />

          <div className="mt-8 space-y-4">
            <SkeletonBox className="h-[50px] w-full rounded-2xl" />
            <SkeletonBox className="h-[50px] w-full rounded-2xl" />
            <SkeletonBox className="h-[50px] w-full rounded-2xl" />
            <SkeletonBox className="h-[48px] w-full rounded-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
