type AdminSkeletonType =
  | "dashboard"
  | "users"
  | "books"
  | "orders"
  | "categories"
  | "reports"
  | "settings"
  | "accounts";

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#2A2521] ${className}`} />
  );
}

function PageShell({
  children,
  maxWidth = "max-w-7xl",
}: {
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <main className="ml-[240px] min-h-screen bg-[#181614] p-6 text-[#F7F5F1]">
      <div className={`mx-auto ${maxWidth}`}>{children}</div>
    </main>
  );
}

function SearchHeaderSkeleton({
  titleWidth = "w-72",
  subtitleWidth = "w-[430px]",
}: {
  titleWidth?: string;
  subtitleWidth?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <SkeletonBox className={`h-10 ${titleWidth} max-w-full rounded-lg`} />
        <SkeletonBox className={`mt-3 h-4 ${subtitleWidth} max-w-full`} />
      </div>

      <div className="flex w-full max-w-md items-center rounded-xl border border-[#312B26] bg-[#211D1A] px-4 py-3">
        <SkeletonBox className="mr-2 h-[18px] w-[18px] rounded-md" />
        <SkeletonBox className="h-4 w-40" />
      </div>
    </div>
  );
}

function PlainHeaderSkeleton({
  titleWidth = "w-64",
  subtitleWidth = "w-[360px]",
}: {
  titleWidth?: string;
  subtitleWidth?: string;
}) {
  return (
    <div className="mb-8">
      <SkeletonBox className={`h-10 ${titleWidth} max-w-full rounded-lg`} />
      <SkeletonBox className={`mt-3 h-4 ${subtitleWidth} max-w-full`} />
    </div>
  );
}

function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  const gridClass =
    count === 3
      ? "sm:grid-cols-3"
      : count === 4
        ? "sm:grid-cols-2 xl:grid-cols-4"
        : "sm:grid-cols-2 xl:grid-cols-5";

  return (
    <section className={`grid gap-4 ${gridClass}`}>
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SkeletonBox className="h-4 w-24" />
              <SkeletonBox className="mt-4 h-8 w-24 rounded-lg" />
            </div>
            <SkeletonBox className="h-11 w-11 rounded-xl" />
          </div>
        </div>
      ))}
    </section>
  );
}

function FilterPillsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className="mt-6">
      <div className="flex flex-wrap gap-3">
        {[...Array(count)].map((_, index) => (
          <SkeletonBox key={index} className="h-11 w-24 rounded-full" />
        ))}
      </div>
    </section>
  );
}

function TableSkeleton({
  titleWidth = "w-28",
  subtitleWidth = "w-64",
  columns = 6,
  rows = 6,
  minWidth = "min-w-[980px]",
}: {
  titleWidth?: string;
  subtitleWidth?: string;
  columns?: number;
  rows?: number;
  minWidth?: string;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
      <div className="mb-4">
        <SkeletonBox className={`h-6 ${titleWidth} rounded-lg`} />
        <SkeletonBox className={`mt-2 h-4 ${subtitleWidth} max-w-full`} />
      </div>

      <div className="overflow-x-auto">
        <div className={`w-full ${minWidth}`}>
          <div
            className="grid gap-4 border-b border-[#2A2622] pb-3"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {[...Array(columns)].map((_, index) => (
              <SkeletonBox key={index} className="h-4 w-20" />
            ))}
          </div>

          <div className="space-y-4 pt-4">
            {[...Array(rows)].map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid gap-4 border-b border-[#26211D] pb-4"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {[...Array(columns)].map((_, colIndex) => (
                  <SkeletonBox
                    key={colIndex}
                    className={`h-4 ${colIndex === 0 ? "w-24" : "w-16"} max-w-full`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InsightPanelsSkeleton({
  count = 2,
  rows = 3,
}: {
  count?: number;
  rows?: number;
}) {
  return (
    <section className="mt-6 grid gap-6 xl:grid-cols-2">
      {[...Array(count)].map((_, panelIndex) => (
        <div
          key={panelIndex}
          className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5"
        >
          <SkeletonBox className="h-6 w-40 rounded-lg" />
          <div className="mt-4 space-y-3">
            {[...Array(rows)].map((__, rowIndex) => (
              <div
                key={rowIndex}
                className="flex items-center justify-between rounded-xl border border-[#2A2622] bg-[#1B1816] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <SkeletonBox className="h-9 w-9 rounded-xl" />
                  <SkeletonBox className="h-4 w-32" />
                </div>
                <SkeletonBox className="h-6 w-12 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <PageShell>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <SkeletonBox className="h-10 w-72 max-w-full rounded-lg" />
          <SkeletonBox className="mt-3 h-4 w-[430px] max-w-full" />
        </div>

        <div className="w-full max-w-md rounded-xl border border-[#312B26] bg-[#211D1A] px-4 py-3">
          <div className="flex items-center">
            <SkeletonBox className="mr-3 h-5 w-5 rounded-md" />
            <SkeletonBox className="h-4 w-44" />
          </div>
        </div>
      </div>

      <StatCardsSkeleton count={4} />

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <SkeletonBox className="h-6 w-40 rounded-lg" />
              <SkeletonBox className="mt-2 h-4 w-52" />
            </div>
            <SkeletonBox className="h-9 w-24 rounded-lg" />
          </div>

          <div className="mt-6 flex h-[280px] items-end gap-4 rounded-2xl border border-[#2B2622] bg-[#1B1816] p-5">
            <SkeletonBox className="h-[35%] flex-1 rounded-t-xl rounded-b-md" />
            <SkeletonBox className="h-[55%] flex-1 rounded-t-xl rounded-b-md" />
            <SkeletonBox className="h-[42%] flex-1 rounded-t-xl rounded-b-md" />
            <SkeletonBox className="h-[72%] flex-1 rounded-t-xl rounded-b-md" />
            <SkeletonBox className="h-[58%] flex-1 rounded-t-xl rounded-b-md" />
            <SkeletonBox className="h-[82%] flex-1 rounded-t-xl rounded-b-md" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
          <div className="mb-4">
            <SkeletonBox className="h-6 w-36 rounded-lg" />
            <SkeletonBox className="mt-2 h-4 w-48" />
          </div>

          <div className="flex items-center justify-center py-6">
            <SkeletonBox className="h-44 w-44 rounded-full" />
          </div>

          <div className="mt-4 space-y-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SkeletonBox className="h-3 w-3 rounded-full" />
                  <SkeletonBox className="h-4 w-24" />
                </div>
                <SkeletonBox className="h-4 w-10" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-4">
          <SkeletonBox className="h-6 w-44 rounded-lg" />
          <SkeletonBox className="mt-2 h-4 w-56" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5"
            >
              <SkeletonBox className="h-4 w-24" />
              <SkeletonBox className="mt-4 h-8 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
        <div className="mb-5">
          <SkeletonBox className="h-6 w-44 rounded-lg" />
          <SkeletonBox className="mt-2 h-4 w-64" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#2E2925] bg-[#1B1816] p-4"
            >
              <SkeletonBox className="h-4 w-28" />
              <SkeletonBox className="mt-4 h-7 w-20 rounded-lg" />
              <SkeletonBox className="mt-3 h-3 w-full" />
              <SkeletonBox className="mt-2 h-3 w-3/4" />
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function UsersSkeleton() {
  return (
    <PageShell>
      <SearchHeaderSkeleton titleWidth="w-72" subtitleWidth="w-[430px]" />
      <StatCardsSkeleton count={5} />
      <FilterPillsSkeleton count={6} />
      <TableSkeleton
        titleWidth="w-24"
        subtitleWidth="w-72"
        columns={7}
        rows={6}
        minWidth="min-w-[980px]"
      />
      <InsightPanelsSkeleton count={2} rows={3} />
    </PageShell>
  );
}

function BooksSkeleton() {
  return (
    <PageShell>
      <SearchHeaderSkeleton titleWidth="w-72" subtitleWidth="w-[460px]" />
      <StatCardsSkeleton count={5} />
      <FilterPillsSkeleton count={6} />
      <TableSkeleton
        titleWidth="w-24"
        subtitleWidth="w-72"
        columns={10}
        rows={6}
        minWidth="min-w-[1200px]"
      />
      <InsightPanelsSkeleton count={2} rows={3} />
    </PageShell>
  );
}

function OrdersSkeleton() {
  return (
    <PageShell>
      <SearchHeaderSkeleton titleWidth="w-72" subtitleWidth="w-[340px]" />
      <StatCardsSkeleton count={3} />
      <FilterPillsSkeleton count={4} />

      <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-7 gap-4 border-b border-[#2A2622] pb-3">
              <SkeletonBox className="h-4 w-10" />
              <SkeletonBox className="h-4 w-16" />
              <SkeletonBox className="h-4 w-14" />
              <SkeletonBox className="h-4 w-18" />
              <SkeletonBox className="h-4 w-14" />
              <SkeletonBox className="h-4 w-16" />
              <SkeletonBox className="h-4 w-14" />
            </div>

            <div className="pt-4">
              <div className="grid grid-cols-7 items-center gap-4">
                <SkeletonBox className="h-5 w-8" />
                <SkeletonBox className="h-5 w-40 max-w-full" />
                <SkeletonBox className="h-5 w-20" />
                <SkeletonBox className="h-8 w-20 rounded-full" />
                <SkeletonBox className="h-8 w-20 rounded-full" />
                <SkeletonBox className="h-5 w-32" />
                <SkeletonBox className="h-5 w-36" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function CategoriesSkeleton() {
  return (
    <PageShell>
      <SearchHeaderSkeleton titleWidth="w-80" subtitleWidth="w-[380px]" />
      <StatCardsSkeleton count={3} />

      <section className="mt-6">
        <div className="mb-6 flex gap-3">
          <SkeletonBox className="h-12 flex-1 rounded-xl" />
          <SkeletonBox className="h-12 w-28 rounded-xl" />
        </div>

        <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
          <div className="mb-4 grid grid-cols-[1.4fr_0.6fr_0.6fr] gap-4 border-b border-[#2A2622] pb-3">
            <SkeletonBox className="h-4 w-24" />
            <SkeletonBox className="h-4 w-20" />
            <SkeletonBox className="h-4 w-20" />
          </div>

          <div className="space-y-4">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[1.4fr_0.6fr_0.6fr] items-center gap-4 border-b border-[#26211D] pb-4"
              >
                <SkeletonBox className="h-4 w-40 max-w-full" />
                <SkeletonBox className="h-4 w-10" />
                <div className="flex gap-2">
                  <SkeletonBox className="h-8 w-8 rounded-md" />
                  <SkeletonBox className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function ReportsSkeleton() {
  return (
    <PageShell>
      <PlainHeaderSkeleton titleWidth="w-80" subtitleWidth="w-[460px]" />
      <StatCardsSkeleton count={4} />

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <SkeletonBox className="h-6 w-32 rounded-lg" />
              <SkeletonBox className="mt-2 h-4 w-72 max-w-full" />
            </div>
            <SkeletonBox className="h-8 w-20 rounded-full" />
          </div>

          <div className="mt-5 rounded-2xl border border-[#2B2622] bg-[#12100F] p-5">
            <div className="relative h-[320px]">
              <div className="absolute inset-0 flex items-end gap-5 px-4 pb-4">
                <SkeletonBox className="h-[22%] flex-1 rounded-t-xl rounded-b-md" />
                <SkeletonBox className="h-[32%] flex-1 rounded-t-xl rounded-b-md" />
                <SkeletonBox className="h-[40%] flex-1 rounded-t-xl rounded-b-md" />
                <SkeletonBox className="h-[28%] flex-1 rounded-t-xl rounded-b-md" />
                <SkeletonBox className="h-[58%] flex-1 rounded-t-xl rounded-b-md" />
                <SkeletonBox className="h-[46%] flex-1 rounded-t-xl rounded-b-md" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
          <SkeletonBox className="h-6 w-40 rounded-lg" />
          <SkeletonBox className="mt-2 h-4 w-60 max-w-full" />

          <div className="flex items-center justify-center py-8">
            <SkeletonBox className="h-44 w-44 rounded-full" />
          </div>

          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <SkeletonBox className="h-3 w-3 rounded-full" />
                  <SkeletonBox className="h-4 w-28" />
                </div>
                <SkeletonBox className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function SettingsSkeleton() {
  return (
    <PageShell maxWidth="max-w-6xl">
      <PlainHeaderSkeleton titleWidth="w-40" subtitleWidth="w-[420px]" />
      <StatCardsSkeleton count={4} />

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-6">
          <SkeletonBox className="h-6 w-40 rounded-lg" />
          <SkeletonBox className="mt-2 h-4 w-56" />

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {[...Array(4)].map((_, index) => (
              <div key={index}>
                <SkeletonBox className="mb-2 h-4 w-32" />
                <SkeletonBox className="h-12 w-full rounded-xl" />
              </div>
            ))}
          </div>

          <div className="mt-5">
            <SkeletonBox className="mb-2 h-4 w-28" />
            <SkeletonBox className="h-32 w-full rounded-xl" />
          </div>

          <div className="mt-5 flex items-center justify-between rounded-2xl border border-[#2A2622] bg-[#1B1816] px-4 py-4">
            <div>
              <SkeletonBox className="h-4 w-40" />
              <SkeletonBox className="mt-2 h-3 w-52" />
            </div>
            <SkeletonBox className="h-7 w-14 rounded-full" />
          </div>

          <SkeletonBox className="mt-5 h-12 w-36 rounded-xl" />
        </div>

        <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-6">
          <SkeletonBox className="h-6 w-36 rounded-lg" />
          <SkeletonBox className="mt-2 h-4 w-44" />

          <div className="mt-5 space-y-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-[#2A2622] bg-[#1B1816] p-4"
              >
                <SkeletonBox className="h-4 w-28" />
                <SkeletonBox className="mt-3 h-8 w-20 rounded-lg" />
                <SkeletonBox className="mt-3 h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function AccountsSkeleton() {
  return (
    <PageShell>
      <SearchHeaderSkeleton titleWidth="w-80" subtitleWidth="w-[460px]" />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SkeletonBox className="h-4 w-28" />
                <SkeletonBox className="mt-4 h-8 w-16 rounded-lg" />
              </div>
              <SkeletonBox className="h-11 w-11 rounded-xl" />
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
        <SkeletonBox className="h-6 w-52 rounded-lg" />
        <SkeletonBox className="mt-2 h-4 w-[520px] max-w-full" />

        <div className="mt-5 flex flex-col gap-3 lg:flex-row">
          <SkeletonBox className="h-12 flex-1 rounded-xl" />
          <SkeletonBox className="h-12 w-44 rounded-xl" />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
        <SkeletonBox className="h-6 w-36 rounded-lg" />
        <SkeletonBox className="mt-2 h-4 w-56" />

        <div className="mt-5 rounded-2xl border border-[#2A2622] bg-[#12100F] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <SkeletonBox className="h-7 w-56 rounded-lg" />
                <SkeletonBox className="h-7 w-24 rounded-full" />
              </div>

              <SkeletonBox className="mt-4 h-4 w-64 max-w-full" />
              <SkeletonBox className="mt-4 h-4 w-24" />
              <SkeletonBox className="mt-3 h-4 w-72 max-w-full" />
            </div>

            <div className="lg:w-[220px] lg:text-right">
              <SkeletonBox className="mb-4 h-4 w-40 lg:ml-auto" />
              <SkeletonBox className="h-12 w-40 rounded-xl lg:ml-auto" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
        <SkeletonBox className="h-6 w-52 rounded-lg" />
        <SkeletonBox className="mt-2 h-4 w-64" />

        <div className="mt-5 space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#2A2622] bg-[#12100F] p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <SkeletonBox className="h-5 w-44 rounded-lg" />
                  <SkeletonBox className="mt-3 h-4 w-56 max-w-full" />
                  <SkeletonBox className="mt-3 h-4 w-36" />
                </div>

                <SkeletonBox className="h-8 w-24 rounded-full" />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <SkeletonBox className="h-10 w-28 rounded-xl" />
                <SkeletonBox className="h-10 w-28 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
        <SkeletonBox className="h-6 w-44 rounded-lg" />
        <SkeletonBox className="mt-2 h-4 w-56" />

        <div className="mt-5 space-y-4">
          {[...Array(2)].map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#2A2622] bg-[#12100F] p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <SkeletonBox className="h-5 w-40 rounded-lg" />
                  <SkeletonBox className="mt-3 h-4 w-52 max-w-full" />
                  <SkeletonBox className="mt-3 h-4 w-36" />
                </div>

                <SkeletonBox className="h-8 w-24 rounded-full" />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <SkeletonBox className="h-10 w-28 rounded-xl" />
                <SkeletonBox className="h-10 w-28 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export default function AdminPageSkeleton({
  type = "dashboard",
}: {
  type?: AdminSkeletonType;
}) {
  switch (type) {
    case "users":
      return <UsersSkeleton />;
    case "books":
      return <BooksSkeleton />;
    case "orders":
      return <OrdersSkeleton />;
    case "categories":
      return <CategoriesSkeleton />;
    case "reports":
      return <ReportsSkeleton />;
    case "settings":
      return <SettingsSkeleton />;
    case "accounts":
      return <AccountsSkeleton />;
    case "dashboard":
    default:
      return <DashboardSkeleton />;
  }
}
