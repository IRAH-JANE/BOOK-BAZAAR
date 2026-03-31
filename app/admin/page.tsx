"use client";

import AdminDashboardSkeleton from "@/components/AdminDashboardSkeleton";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import {
  Users,
  BookOpen,
  ShoppingBag,
  CircleDollarSign,
  BarChart3,
  Tags,
  Boxes,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type OrderRow = {
  id: number;
  total_amount: number | null;
  order_status: string | null;
  created_at: string | null;
};

type BookRow = {
  id: number;
  category_id: number | null;
  stock_quantity: number | null;
};

type CategoryRow = {
  id: number;
  name: string;
};

type MonthlyChartItem = {
  label: string;
  orders: number;
};

type CategoryChartItem = {
  name: string;
  value: number;
};

type StatusCardItem = {
  key: string;
  label: string;
  value: number;
  tone: string;
};

const PIE_COLORS = [
  "#E67E22",
  "#F5A65B",
  "#D6B48A",
  "#8A8175",
  "#C9B8A6",
  "#B08968",
  "#A68A64",
  "#7F6A58",
];

export default function AdminDashboardPage() {
  const [usersCount, setUsersCount] = useState(0);
  const [booksCount, setBooksCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [revenue, setRevenue] = useState(0);

  const [salesChartData, setSalesChartData] = useState<MonthlyChartItem[]>([]);
  const [categoryChartData, setCategoryChartData] = useState<
    CategoryChartItem[]
  >([]);
  const [statusCards, setStatusCards] = useState<StatusCardItem[]>([]);

  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [uncategorizedCount, setUncategorizedCount] = useState(0);
  const supabase = createSupabaseBrowser();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);

      try {
        const today = new Date();
        const sixMonthsAgo = new Date(
          today.getFullYear(),
          today.getMonth() - 5,
          1,
        );

        const sixMonthsAgoISO = sixMonthsAgo.toISOString();

        const [
          usersRes,
          booksCountRes,
          ordersCountRes,
          allOrdersRes,
          chartOrdersRes,
          booksRes,
          categoriesRes,
        ] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),

          supabase.from("books").select("*", { count: "exact", head: true }),

          supabase.from("orders").select("*", { count: "exact", head: true }),

          supabase.from("orders").select("id, total_amount, order_status"),

          supabase
            .from("orders")
            .select("id, created_at")
            .gte("created_at", sixMonthsAgoISO)
            .order("created_at", { ascending: true }),

          supabase.from("books").select("id, category_id, stock_quantity"),

          supabase.from("categories").select("id, name").order("name"),
        ]);

        const allOrders = (allOrdersRes.data || []) as OrderRow[];
        const books = (booksRes.data || []) as BookRow[];
        const categories = (categoriesRes.data || []) as CategoryRow[];
        const chartOrders =
          (chartOrdersRes.data as Pick<OrderRow, "id" | "created_at">[]) || [];

        setUsersCount(usersRes.count || 0);
        setBooksCount(booksCountRes.count || 0);
        setOrdersCount(ordersCountRes.count || 0);

        const grossSales = allOrders.reduce(
          (sum, order) => sum + (order.total_amount || 0),
          0,
        );

        setRevenue(grossSales * 0.04);

        const monthlyBuckets: MonthlyChartItem[] = [];

        for (let i = 5; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          monthlyBuckets.push({
            label: date.toLocaleString("en-US", { month: "short" }),
            orders: 0,
          });
        }

        chartOrders.forEach((order) => {
          if (!order.created_at) return;

          const label = new Date(order.created_at).toLocaleString("en-US", {
            month: "short",
          });

          const bucket = monthlyBuckets.find((item) => item.label === label);
          if (bucket) bucket.orders += 1;
        });

        setSalesChartData(monthlyBuckets);

        const categoryCounts: Record<number, number> = {};
        let lowStock = 0;
        let outOfStock = 0;
        let uncategorized = 0;

        books.forEach((book) => {
          if (!book.category_id) {
            uncategorized += 1;
          } else {
            categoryCounts[book.category_id] =
              (categoryCounts[book.category_id] || 0) + 1;
          }

          const stock = book.stock_quantity ?? 0;

          if (stock === 0) {
            outOfStock += 1;
          } else if (stock > 0 && stock <= 2) {
            lowStock += 1;
          }
        });

        const formattedCategoryData = categories
          .map((category) => ({
            name: category.name,
            value: categoryCounts[category.id] || 0,
          }))
          .filter((item) => item.value > 0)
          .sort((a, b) => b.value - a.value);

        setCategoryChartData(formattedCategoryData);
        setLowStockCount(lowStock);
        setOutOfStockCount(outOfStock);
        setUncategorizedCount(uncategorized);

        const rawStatusCounts = allOrders.reduce<Record<string, number>>(
          (acc, order) => {
            const status = order.order_status || "unknown";
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          },
          {},
        );

        const preferredStatuses: StatusCardItem[] = [
          {
            key: "pending",
            label: "Pending",
            value: rawStatusCounts.pending || 0,
            tone: "text-[#F5A65B] bg-[#E67E22]/10 border-[#E67E22]/20",
          },
          {
            key: "received",
            label: "Received",
            value: rawStatusCounts.received || 0,
            tone: "text-[#34D399] bg-[#10B981]/10 border-[#10B981]/20",
          },
          {
            key: "out_for_delivery",
            label: "Out for Delivery",
            value: rawStatusCounts.out_for_delivery || 0,
            tone: "text-[#60A5FA] bg-[#3B82F6]/10 border-[#3B82F6]/20",
          },
          {
            key: "cancelled",
            label: "Cancelled",
            value: rawStatusCounts.cancelled || 0,
            tone: "text-[#F87171] bg-[#EF4444]/10 border-[#EF4444]/20",
          },
        ];

        setStatusCards(preferredStatuses);
      } catch (error) {
        console.error("Failed to load admin dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const totalCategoryBooks = useMemo(() => {
    return categoryChartData.reduce((sum, item) => sum + item.value, 0);
  }, [categoryChartData]);

  const topCategory = useMemo(() => {
    return categoryChartData[0] || null;
  }, [categoryChartData]);

  const busiestMonth = useMemo(() => {
    if (!salesChartData.length) return null;
    return [...salesChartData].sort((a, b) => b.orders - a.orders)[0];
  }, [salesChartData]);

  const avgCommissionPerOrder = useMemo(() => {
    if (!ordersCount) return 0;
    return revenue / ordersCount;
  }, [ordersCount, revenue]);

if (loading) {
  return <AdminDashboardSkeleton type="dashboard" />;
}

  return (
    <main className="ml-[240px] min-h-screen bg-[#181614] p-6 text-[#F7F5F1]">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#FFFDF9]">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-[#9A9187]">
              Monitor BookBazaar growth, sales activity, and platform health.
            </p>
          </div>

          <div className="flex w-full max-w-md items-center rounded-xl border border-[#312B26] bg-[#211D1A] px-4 py-3">
            <BarChart3 size={18} className="mr-2 text-[#8E857B]" />
            <span className="text-sm text-[#8E857B]">
              Real-time admin analytics
            </span>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card title="Total Users" value={usersCount} icon={Users} />
          <Card title="Total Books" value={booksCount} icon={BookOpen} />
          <Card title="Total Orders" value={ordersCount} icon={ShoppingBag} />
          <Card
            title="Estimated Revenue"
            value={`₱${revenue.toFixed(2)}`}
            icon={CircleDollarSign}
          />
        </section>

        {/* MAIN ANALYTICS */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
          {/* SALES OVERVIEW */}
          <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#FFFDF9]">
                  Sales Overview
                </h3>
                <p className="text-sm text-[#9A9187]">
                  Orders placed in the last 6 months
                </p>
              </div>

              <span className="rounded-full bg-[#E67E22]/15 px-3 py-1 text-xs font-medium text-[#E67E22]">
                Real Data
              </span>
            </div>

            <div className="h-[320px] rounded-2xl border border-[#2A2622] bg-[#181614] p-4">
              {salesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesChartData} barCategoryGap={24}>
                    <XAxis
                      dataKey="label"
                      stroke="#8E857B"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#8E857B"
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(230, 126, 34, 0.08)" }}
                      contentStyle={{
                        backgroundColor: "#211D1A",
                        border: "1px solid #312B26",
                        borderRadius: "12px",
                        color: "#F7F5F1",
                      }}
                      labelStyle={{ color: "#F7F5F1" }}
                    />
                    <Bar
                      dataKey="orders"
                      radius={[12, 12, 0, 0]}
                      fill="#E67E22"
                      maxBarSize={72}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#9A9187]">
                  No sales data available yet.
                </div>
              )}
            </div>
          </div>

          {/* TOP CATEGORIES */}
          <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#FFFDF9]">
                Top Categories
              </h3>
              <p className="text-sm text-[#9A9187]">
                Distribution of book listings by category
              </p>
            </div>

            <div className="h-[260px]">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={94}
                      paddingAngle={3}
                      stroke="#211D1A"
                      strokeWidth={3}
                    >
                      {categoryChartData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#211D1A",
                        border: "1px solid #312B26",
                        borderRadius: "12px",
                        color: "#F7F5F1",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#9A9187]">
                  No category data available yet.
                </div>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {categoryChartData.length > 0 ? (
                categoryChartData.slice(0, 5).map((item, index) => {
                  const percentage =
                    totalCategoryBooks > 0
                      ? ((item.value / totalCategoryBooks) * 100).toFixed(1)
                      : "0";

                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor:
                              PIE_COLORS[index % PIE_COLORS.length],
                          }}
                        />
                        <span className="text-[#E6DFD5]">{item.name}</span>
                      </div>

                      <span className="text-[#9A9187]">
                        {item.value} ({percentage}%)
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-[#9A9187]">
                  Categories will appear here once books are listed.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* LOWER PANELS */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          {/* ORDER STATUS SUMMARY */}
          <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#FFFDF9]">
                Order Status Summary
              </h3>
              <p className="text-sm text-[#9A9187]">
                Snapshot of current order flow
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {statusCards.map((item) => (
                <div
                  key={item.key}
                  className={`rounded-2xl border p-4 ${item.tone}`}
                >
                  <p className="text-sm font-medium">{item.label}</p>
                  <h4 className="mt-2 text-3xl font-bold text-[#FFFDF9]">
                    {item.value}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          {/* MARKETPLACE INSIGHTS */}
          <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#FFFDF9]">
                Marketplace Insights
              </h3>
              <p className="text-sm text-[#9A9187]">
                High-value admin information
              </p>
            </div>

            <div className="space-y-3">
              <InsightRow
                icon={Tags}
                label="Top Category"
                value={
                  topCategory
                    ? `${topCategory.name} (${topCategory.value})`
                    : "No category data"
                }
              />
              <InsightRow
                icon={BarChart3}
                label="Busiest Month"
                value={
                  busiestMonth
                    ? `${busiestMonth.label} (${busiestMonth.orders} orders)`
                    : "No sales data"
                }
              />
              <InsightRow
                icon={Boxes}
                label="Low Stock Books"
                value={`${lowStockCount} listing(s)`}
              />
              <InsightRow
                icon={AlertTriangle}
                label="Out of Stock"
                value={`${outOfStockCount} listing(s)`}
              />
              <InsightRow
                icon={BookOpen}
                label="Uncategorized Books"
                value={`${uncategorizedCount} listing(s)`}
              />
              <InsightRow
                icon={CircleDollarSign}
                label="Avg. Commission / Order"
                value={`₱${avgCommissionPerOrder.toFixed(2)}`}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#9A9187]">{title}</p>
          <h2 className="mt-2 text-2xl font-bold text-[#FFFDF9]">{value}</h2>
        </div>

        <div className="rounded-xl bg-[#E67E22]/15 p-3 text-[#E67E22]">
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
    <div className="flex items-center justify-between rounded-xl border border-[#2A2622] bg-[#181614] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#E67E22]/10 p-2 text-[#E67E22]">
          <Icon size={16} />
        </div>
        <span className="text-sm text-[#E6DFD5]">{label}</span>
      </div>

      <span className="text-sm font-medium text-[#FFFDF9]">{value}</span>
    </div>
  );
}
