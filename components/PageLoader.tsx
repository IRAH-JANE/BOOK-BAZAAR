type PageLoaderProps = {
  title?: string;
  subtitle?: string;
};

export default function PageLoader({
  title = "Loading page...",
  subtitle = "Please wait while we load your BookBazaar page.",
}: PageLoaderProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F5F1] px-6">
      <div className="flex flex-col items-center text-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#E5E0D8] border-t-[#E67E22]" />
        <h1 className="mt-6 text-2xl font-bold text-[#1F1F1F]">{title}</h1>
        <p className="mt-2 max-w-md text-sm text-[#6B6B6B] sm:text-base">
          {subtitle}
        </p>
      </div>
    </main>
  );
}
