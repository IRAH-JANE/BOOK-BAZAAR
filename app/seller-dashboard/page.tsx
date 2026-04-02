"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import SellerNavbar from "@/components/SellerNavbar";
import {
  BookOpen,
  ShoppingBag,
  CircleDollarSign,
  AlertTriangle,
  PackageCheck,
  TrendingUp,
  ChevronRight,
  Activity,
  Package,
  Boxes,
  Truck,
  Clock3,
  CheckCircle2,
} from "lucide-react";

type SellerBook = {
  id: number;
  title: string | null;
  author: string | null;
  price: number | null;
  stock_quantity: number | null;
  status: string | null;
  sold_count: number | null;
  created_at: string | null;
  image_url?: string | null;
};

type SellerOrderItem = {
  id: number;
  seller_id: string | null;
  item_status: string | null;
  price: number | null;
  quantity: number | null;
  order_id: number | null;
  created_at?: string | null;
  orders:
    | {
        created_at: string | null;
        payment_method?: string | null;
        payment_status?: string | null;
      }
    | {
        created_at: string | null;
        payment_method?: string | null;
        payment_status?: string | null;
      }[]
    | null;
};

function formatCurrency(value: number) {
  return `₱${value.toFixed(2)}`;
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}

function getStatusLabel(status: string | null) {
  const value = (status || "").toLowerCase();

  if (value === "active") return "Available";
  if (value === "sold") return "Sold";
  if (value === "reserved") return "Reserved";
  if (value === "hidden") return "Hidden";

  return status || "Unknown";
}

function getOrderCreatedAt(item: SellerOrderItem) {
  if (Array.isArray(item.orders)) {
    return item.orders[0]?.created_at || null;
  }
  return item.orders?.created_at || null;
}

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

function SellerDashboardSkeleton() {
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
                  <SkeletonBox className="h-11 w-11" />
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
                      className={`w-full rounded-t-xl ${index % 2 === 0 ? "h-24" : "h-40"}`}
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
                        <SkeletonBox className="h-10 w-10" />
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

export default function SellerDashboardPage() {
  const supabase = createSupabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [sellerName, setSellerName] = useState("Seller");

  const [books, setBooks] = useState<SellerBook[]>([]);
  const [sellerOrderItems, setSellerOrderItems] = useState<SellerOrderItem[]>(
    [],
  );

  useEffect(() => {
    const loadSellerDashboard = async () => {
      setLoading(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const [profileRes, booksRes, orderItemsRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, shop_name, public_display_name")
            .eq("id", user.id)
            .maybeSingle(),

          supabase
            .from("books")
            .select(
              "id, title, author, price, stock_quantity, status, sold_count, created_at, image_url",
            )
            .eq("seller_id", user.id)
            .order("created_at", { ascending: false }),

          supabase
            .from("order_items")
            .select(
              `
              id,
              seller_id,
              item_status,
              price,
              quantity,
              order_id,
              orders:order_id (
                created_at,
                payment_method,
                payment_status
              )
              `,
            )
            .eq("seller_id", user.id),
        ]);

        const profileData = profileRes.data as {
          full_name?: string | null;
          shop_name?: string | null;
          public_display_name?: string | null;
        } | null;

        setSellerName(
          profileData?.shop_name ||
            profileData?.public_display_name ||
            profileData?.full_name ||
            "Seller",
        );

        setBooks((booksRes.data as SellerBook[]) || []);
        setSellerOrderItems((orderItemsRes.data as SellerOrderItem[]) || []);
      } catch (error) {
        console.error("Failed to load seller dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSellerDashboard();
  }, [supabase]);

  const totalListings = books.length;

  const activeListings = useMemo(
    () =>
      books.filter((book) => (book.status || "").toLowerCase() === "active")
        .length,
    [books],
  );

  const soldListings = useMemo(
    () =>
      books.filter(
        (book) =>
          (book.status || "").toLowerCase() === "sold" ||
          (book.sold_count ?? 0) > 0 ||
          (book.stock_quantity ?? 0) <= 0,
      ).length,
    [books],
  );

  const hiddenListings = useMemo(
    () =>
      books.filter((book) => (book.status || "").toLowerCase() === "hidden")
        .length,
    [books],
  );

  const lowStockCount = useMemo(
    () =>
      books.filter((book) => {
        const stock = book.stock_quantity ?? 0;
        const status = (book.status || "").toLowerCase();
        return stock > 0 && stock <= 2 && status !== "hidden";
      }).length,
    [books],
  );

  const totalSellerOrders = sellerOrderItems.length;

  const totalBooksSold = useMemo(() => {
    return sellerOrderItems.reduce(
      (sum, item) => sum + (item.quantity ?? 0),
      0,
    );
  }, [sellerOrderItems]);

  const totalRevenueEstimate = useMemo(() => {
    return sellerOrderItems.reduce((sum, item) => {
      const qty = item.quantity ?? 0;
      const price = item.price ?? 0;
      return sum + qty * price;
    }, 0);
  }, [sellerOrderItems]);

  const recentListings = useMemo(() => books.slice(0, 5), [books]);

  const receivedOrders = useMemo(
    () =>
      sellerOrderItems.filter(
        (item) => (item.item_status || "").toLowerCase() === "received",
      ).length,
    [sellerOrderItems],
  );

  const pendingOrders = useMemo(
    () =>
      sellerOrderItems.filter(
        (item) => (item.item_status || "").toLowerCase() === "pending",
      ).length,
    [sellerOrderItems],
  );

  const processingOrders = useMemo(
    () =>
      sellerOrderItems.filter((item) =>
        ["confirmed", "packed", "shipped", "out_for_delivery"].includes(
          (item.item_status || "").toLowerCase(),
        ),
      ).length,
    [sellerOrderItems],
  );

  const cancelledOrders = useMemo(
    () =>
      sellerOrderItems.filter(
        (item) => (item.item_status || "").toLowerCase() === "cancelled",
      ).length,
    [sellerOrderItems],
  );

  const averageOrderValue = useMemo(() => {
    if (!sellerOrderItems.length) return 0;
    return totalRevenueEstimate / sellerOrderItems.length;
  }, [sellerOrderItems, totalRevenueEstimate]);

  const orderStatusData = useMemo(
    () => [
      { label: "Pending", value: pendingOrders },
      { label: "Processing", value: processingOrders },
      { label: "Received", value: receivedOrders },
      { label: "Cancelled", value: cancelledOrders },
    ],
    [pendingOrders, processingOrders, receivedOrders, cancelledOrders],
  );

  const maxOrderStatusValue = useMemo(() => {
    return Math.max(...orderStatusData.map((item) => item.value), 1);
  }, [orderStatusData]);

  const listingStatusData = useMemo(
    () => [
      { label: "Active", value: activeListings },
      { label: "Sold", value: soldListings },
      { label: "Hidden", value: hiddenListings },
      { label: "Low Stock", value: lowStockCount },
    ],
    [activeListings, soldListings, hiddenListings, lowStockCount],
  );

  const maxListingStatusValue = useMemo(() => {
    return Math.max(...listingStatusData.map((item) => item.value), 1);
  }, [listingStatusData]);

  const salesOverviewData = useMemo(() => {
    const labels: string[] = [];
    const values = new Array(7).fill(0);
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      labels.push(
        d.toLocaleDateString("en-US", {
          weekday: "short",
        }),
      );
    }

    sellerOrderItems.forEach((item) => {
      const createdAt = getOrderCreatedAt(item);
      if (!createdAt) return;

      const orderDate = new Date(createdAt);
      const diffMs =
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        ).getTime() -
        new Date(
          orderDate.getFullYear(),
          orderDate.getMonth(),
          orderDate.getDate(),
        ).getTime();

      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 0 || diffDays > 6) return;

      const bucketIndex = 6 - diffDays;
      values[bucketIndex] += (item.price ?? 0) * (item.quantity ?? 0);
    });

    return labels.map((label, index) => ({
      label,
      value: values[index],
    }));
  }, [sellerOrderItems]);

  const maxSalesValue = useMemo(() => {
    return Math.max(...salesOverviewData.map((item) => item.value), 1);
  }, [salesOverviewData]);

  if (loading) {
    return <SellerDashboardSkeleton />;
  }

  return (
    <>
      <SellerNavbar />

      <main className="min-h-screen bg-[#F7F4EE] px-4 py-6 sm:px-6 lg:px-10 xl:px-20 md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px]">
          <section className="relative overflow-hidden rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6 lg:p-8">
            <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-[#FFF3E7] blur-3xl" />

            <div className="relative z-10">
              <p className="inline-flex rounded-full bg-[#FFF3E7] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[#C96A16]">
                Seller Dashboard
              </p>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl lg:text-[2.5rem]">
                Welcome back, {sellerName}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5F5A52] sm:text-base">
                Check your store performance, monitor stock, and review your
                latest listings in one cleaner seller space.
              </p>
            </div>
          </section>

          <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Listings"
              value={totalListings}
              subtitle="All books in your store"
              icon={BookOpen}
            />
            <StatCard
              title="Seller Orders"
              value={totalSellerOrders}
              subtitle="Items linked to you"
              icon={ShoppingBag}
            />
            <StatCard
              title="Books Sold"
              value={totalBooksSold}
              subtitle="Total quantities sold"
              icon={PackageCheck}
            />
            <StatCard
              title="Low Stock"
              value={lowStockCount}
              subtitle="Needs restock soon"
              icon={AlertTriangle}
              warn={lowStockCount > 0}
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_340px]">
            <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[2rem] font-bold tracking-tight text-[#1F1F1F]">
                    Sales Overview
                  </h3>
                  <p className="mt-1 text-sm text-[#5F5A52]">
                    Revenue from the last 7 days based on actual seller orders
                  </p>
                </div>
              </div>

              <div className="flex h-[260px] items-end gap-3 rounded-[24px] border border-[#E5E0D8] bg-[#FFFDF9] p-4 sm:gap-4 sm:p-5">
                {salesOverviewData.map((item) => {
                  const height = `${Math.max((item.value / maxSalesValue) * 100, item.value > 0 ? 12 : 0)}%`;

                  return (
                    <div
                      key={item.label}
                      className="flex flex-1 flex-col items-center justify-end gap-3"
                    >
                      <div className="flex h-full w-full max-w-[72px] items-end rounded-t-2xl bg-[#FFE0BE]">
                        <div
                          className="w-full rounded-t-2xl bg-[#E67E22] transition-all duration-500"
                          style={{ height }}
                          title={formatCurrency(item.value)}
                        />
                      </div>
                      <p className="text-xs font-semibold text-[#8A8175]">
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6">
              <div className="mb-4">
                <h3 className="text-[2rem] font-bold tracking-tight text-[#1F1F1F]">
                  Order Status
                </h3>
                <p className="mt-1 text-sm text-[#5F5A52]">
                  Real-time breakdown from seller orders
                </p>
              </div>

              <div className="space-y-4">
                {orderStatusData.map((item) => (
                  <StatusProgressRow
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    maxValue={maxOrderStatusValue}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_340px]">
            <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[2rem] font-bold tracking-tight text-[#1F1F1F]">
                    Recent Listings
                  </h3>
                  <p className="mt-1 text-sm text-[#5F5A52]">
                    Your latest books in a cleaner, easier-to-scan layout
                  </p>
                </div>

                <Link
                  href="/my-listings"
                  className="hidden items-center gap-1 text-sm font-semibold text-[#E67E22] sm:inline-flex"
                >
                  View all
                  <ChevronRight size={16} />
                </Link>
              </div>

              {recentListings.length > 0 ? (
                <div className="space-y-4">
                  {recentListings.map((book) => (
                    <Link
                      key={book.id}
                      href={`/edit-listing/${book.id}`}
                      className="group block rounded-[24px] border border-[#E5E0D8] bg-[#FFFDF9] p-4 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#EEE6DB] bg-[#F7F4EE]">
                          {book.image_url ? (
                            <img
                              src={book.image_url}
                              alt={book.title || "Book image"}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#9C9489]">
                              <Package size={18} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                              <p className="truncate text-xl font-bold leading-tight text-[#1F1F1F]">
                                {book.title || "Untitled Book"}
                              </p>
                              <p className="mt-1 text-sm text-[#5F5A52]">
                                {book.author || "Unknown Author"}
                              </p>

                              <div className="mt-4 flex flex-wrap gap-2">
                                <span className="rounded-full bg-[#FFF3E7] px-3 py-1 text-xs font-semibold text-[#C96A16]">
                                  {getStatusLabel(book.status)}
                                </span>
                                <span className="rounded-full bg-[#F7F4EE] px-3 py-1 text-xs font-semibold text-[#5F5A52]">
                                  Stock: {book.stock_quantity ?? 0}
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0 md:text-right">
                              <p className="text-[1.9rem] font-bold leading-none text-[#E67E22]">
                                ₱{(book.price ?? 0).toFixed(2)}
                              </p>
                              <p className="mt-3 text-xs text-[#9C9489]">
                                Added {formatDate(book.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-[#D9D2C7] bg-[#FCFBF8] p-8 text-center">
                  <p className="text-lg font-semibold text-[#1F1F1F]">
                    No listings yet
                  </p>
                  <p className="mt-2 text-sm text-[#5F5A52]">
                    Start adding books so buyers can discover your shop faster.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6">
                <div className="mb-4">
                  <h3 className="text-[2rem] font-bold tracking-tight text-[#1F1F1F]">
                    Seller Insights
                  </h3>
                  <p className="mt-1 text-sm text-[#5F5A52]">
                    Important numbers only, without repeated actions
                  </p>
                </div>

                <div className="space-y-3">
                  <InsightRow
                    icon={CircleDollarSign}
                    label="Revenue Estimate"
                    value={formatCurrency(totalRevenueEstimate)}
                  />
                  <InsightRow
                    icon={CheckCircle2}
                    label="Received Orders"
                    value={String(receivedOrders)}
                  />
                  <InsightRow
                    icon={Clock3}
                    label="Pending Orders"
                    value={String(pendingOrders)}
                  />
                  <InsightRow
                    icon={Activity}
                    label="Average Order Value"
                    value={formatCurrency(averageOrderValue)}
                  />
                  <InsightRow
                    icon={Truck}
                    label="Processing Orders"
                    value={String(processingOrders)}
                  />
                </div>
              </div>

              <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6">
                <div className="mb-4">
                  <h3 className="text-[2rem] font-bold tracking-tight text-[#1F1F1F]">
                    Listing Status
                  </h3>
                  <p className="mt-1 text-sm text-[#5F5A52]">
                    Quick breakdown of your store inventory
                  </p>
                </div>

                <div className="space-y-4">
                  {listingStatusData.map((item) => (
                    <StatusProgressRow
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      maxValue={maxListingStatusValue}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6">
                <div className="mb-4">
                  <h3 className="text-[2rem] font-bold tracking-tight text-[#1F1F1F]">
                    Needs Attention
                  </h3>
                  <p className="mt-1 text-sm text-[#5F5A52]">
                    Focus only on items that need action
                  </p>
                </div>

                <div className="space-y-3">
                  {lowStockCount > 0 ? (
                    <AttentionCard
                      href="/my-listings"
                      icon={AlertTriangle}
                      title={`${lowStockCount} low stock item${lowStockCount > 1 ? "s" : ""}`}
                      text="Update stock before buyers miss these listings."
                    />
                  ) : null}

                  {pendingOrders > 0 ? (
                    <AttentionCard
                      href="/seller-orders"
                      icon={ShoppingBag}
                      title={`${pendingOrders} pending order${pendingOrders > 1 ? "s" : ""}`}
                      text="Review your pending seller orders as soon as possible."
                    />
                  ) : null}

                  {processingOrders > 0 ? (
                    <AttentionCard
                      href="/seller-orders"
                      icon={Truck}
                      title={`${processingOrders} processing order${processingOrders > 1 ? "s" : ""}`}
                      text="Some items are already moving and may need updates soon."
                    />
                  ) : null}

                  {lowStockCount === 0 &&
                  pendingOrders === 0 &&
                  processingOrders === 0 ? (
                    <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] p-4">
                      <p className="font-semibold text-[#1F1F1F]">
                        Everything looks good
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#5F5A52]">
                        No urgent seller actions need your attention right now.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  warn = false,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ size?: number }>;
  warn?: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-[#E5E0D8] bg-white p-5 transition hover:shadow-sm sm:rounded-[28px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#9C9489]">{title}</p>
          <h2 className="mt-2 text-3xl font-bold text-[#1F1F1F]">{value}</h2>
          <p className="mt-2 text-sm text-[#5F5A52]">{subtitle}</p>
        </div>

        <div
          className={`rounded-2xl p-3 ${
            warn ? "bg-[#FFF1E8] text-[#E67E22]" : "bg-[#FFF3E7] text-[#E67E22]"
          }`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function InsightRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] px-4 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="rounded-xl bg-[#FFF3E7] p-2 text-[#E67E22]">
          <Icon size={16} />
        </div>
        <span className="truncate text-sm font-medium text-[#1F1F1F]">
          {label}
        </span>
      </div>

      <span className="shrink-0 text-sm font-semibold text-[#1F1F1F]">
        {value}
      </span>
    </div>
  );
}

function AttentionCard({
  href,
  icon: Icon,
  title,
  text,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] p-4 transition hover:bg-white hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[#FFF3E7] p-2 text-[#E67E22]">
          <Icon size={16} />
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-[#1F1F1F]">{title}</p>
          <p className="mt-1 text-sm leading-6 text-[#5F5A52]">{text}</p>
        </div>
      </div>
    </Link>
  );
}

function StatusProgressRow({
  label,
  value,
  maxValue,
}: {
  label: string;
  value: number;
  maxValue: number;
}) {
  const width = `${Math.max((value / maxValue) * 100, value > 0 ? 10 : 0)}%`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-[#1F1F1F]">{label}</p>
        <p className="text-sm font-semibold text-[#E67E22]">{value}</p>
      </div>

      <div className="h-3 rounded-full bg-[#F3ECE3]">
        <div
          className="h-3 rounded-full bg-[#E67E22] transition-all duration-500"
          style={{ width }}
        />
      </div>
    </div>
  );
}
