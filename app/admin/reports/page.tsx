"use client";

import AdminDashboardSkeleton from "@/components/AdminDashboardSkeleton";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Users,
  CircleDollarSign,
  BookOpen,
  ShoppingBag,
  TrendingUp,
  Tags,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

type ProfileRow = {
  created_at: string | null;
};

type OrderRow = {
  created_at: string | null;
  total_amount: number | null;
  order_status: string | null;
};

type BookRow = {
  category_id: number | null;
};

type CategoryRow = {
  id: number;
  name: string;
};

type MonthlyPoint = {
  name: string;
  users: number;
  revenue: number;
  orders: number;
};

type CategoryPoint = {
  name: string;
  value: number;
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

function monthLabel(date: Date) {
  return date.toLocaleString("en-US", { month: "short" });
}

function formatCurrency(value: number | null | undefined) {
  return `₱${(value || 0).toFixed(2)}`;
}

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);

  const [monthlyData, setMonthlyData] = useState<MonthlyPoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryPoint[]>([]);

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [topCategory, setTopCategory] = useState("—");

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);

      try {
        const [usersRes, ordersRes, booksRes, categoriesRes] =
          await Promise.all([
            supabase.from("profiles").select("created_at"),
            supabase
              .from("orders")
              .select("created_at, total_amount, order_status"),
            supabase.from("books").select("category_id"),
            supabase.from("categories").select("id, name"),
          ]);

        const users = (usersRes.data || []) as ProfileRow[];
        const orders = (ordersRes.data || []) as OrderRow[];
        const books = (booksRes.data || []) as BookRow[];
        const categories = (categoriesRes.data || []) as CategoryRow[];

        setTotalUsers(users.length);
        setTotalOrders(orders.length);

        const grossRevenue = orders.reduce(
          (sum, order) => sum + (order.total_amount || 0),
          0,
        );
        setTotalRevenue(grossRevenue);

        const today = new Date();
        const monthlyBuckets: MonthlyPoint[] = [];

        for (let i = 5; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          monthlyBuckets.push({
            name: monthLabel(date),
            users: 0,
            revenue: 0,
            orders: 0,
          });
        }

        users.forEach((user) => {
          if (!user.created_at) return;

          const label = monthLabel(new Date(user.created_at));
          const bucket = monthlyBuckets.find((item) => item.name === label);
          if (bucket) bucket.users += 1;
        });

        orders.forEach((order) => {
          if (!order.created_at) return;

          const label = monthLabel(new Date(order.created_at));
          const bucket = monthlyBuckets.find((item) => item.name === label);
          if (bucket) {
            bucket.orders += 1;
            bucket.revenue += order.total_amount || 0;
          }
        });

        setMonthlyData(monthlyBuckets);

        const counts: Record<number, number> = {};

        books.forEach((book) => {
          if (!book.category_id) return;
          counts[book.category_id] = (counts[book.category_id] || 0) + 1;
        });

        const formattedCategories = categories
          .map((category) => ({
            name: category.name,
            value: counts[category.id] || 0,
          }))
          .filter((item) => item.value > 0)
          .sort((a, b) => b.value - a.value);

        setCategoryData(formattedCategories);
        setTopCategory(formattedCategories[0]?.name || "—");
      } catch (error) {
        console.error("Failed to load reports:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const totalCategoryBooks = useMemo(() => {
    return categoryData.reduce((sum, item) => sum + item.value, 0);
  }, [categoryData]);

if (loading) {
  return <AdminDashboardSkeleton type="reports" />;
}

  return (
    <main className="ml-[240px] min-h-screen bg-[#181614] p-6 text-[#F7F5F1]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#FFFDF9]">
            Reports & Analytics
          </h1>
          <p className="mt-2 text-sm text-[#9A9187]">
            View BookBazaar growth, sales trends, and category performance.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Users"
            value={totalUsers}
            icon={Users}
            tone="text-[#E67E22] bg-[#E67E22]/15"
          />
          <SummaryCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={CircleDollarSign}
            tone="text-green-400 bg-green-500/10"
          />
          <SummaryCard
            title="Total Orders"
            value={totalOrders}
            icon={ShoppingBag}
            tone="text-blue-400 bg-blue-500/10"
          />
          <SummaryCard
            title="Top Category"
            value={topCategory}
            icon={Tags}
            tone="text-[#F5A65B] bg-[#E67E22]/10"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#FFFDF9]">
                  User Growth
                </h3>
                <p className="text-sm text-[#9A9187]">
                  Monthly user registrations for the last 6 months
                </p>
              </div>

              <div className="rounded-full bg-[#E67E22]/10 px-3 py-1 text-xs font-medium text-[#E67E22]">
                Growth
              </div>
            </div>

            <div className="h-[320px] rounded-2xl border border-[#2A2622] bg-[#181614] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="usersFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#E67E22"
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="95%"
                        stopColor="#E67E22"
                        stopOpacity={0.03}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2622" />
                  <XAxis
                    dataKey="name"
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
                    contentStyle={{
                      backgroundColor: "#211D1A",
                      border: "1px solid #312B26",
                      borderRadius: "12px",
                      color: "#F7F5F1",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#E67E22"
                    fill="url(#usersFill)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#FFFDF9]">
                Top Categories
              </h3>
              <p className="text-sm text-[#9A9187]">
                Distribution of listed books by category
              </p>
            </div>

            <div className="h-[260px]">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={92}
                      paddingAngle={3}
                      stroke="#211D1A"
                      strokeWidth={3}
                    >
                      {categoryData.map((_, index) => (
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
                  No category data yet.
                </div>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {categoryData.slice(0, 5).map((item, index) => {
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
              })}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#FFFDF9]">
                  Revenue Trend
                </h3>
                <p className="text-sm text-[#9A9187]">
                  Monthly revenue performance for the last 6 months
                </p>
              </div>

              <div className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                Revenue
              </div>
            </div>

            <div className="h-[320px] rounded-2xl border border-[#2A2622] bg-[#181614] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barCategoryGap={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2622" />
                  <XAxis
                    dataKey="name"
                    stroke="#8E857B"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis stroke="#8E857B" tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value || 0)),
                      "Revenue",
                    ]}
                    contentStyle={{
                      backgroundColor: "#211D1A",
                      border: "1px solid #312B26",
                      borderRadius: "12px",
                      color: "#F7F5F1",
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#22c55e"
                    radius={[10, 10, 0, 0]}
                    maxBarSize={70}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#FFFDF9]">
                Orders Overview
              </h3>
              <p className="text-sm text-[#9A9187]">
                Monthly orders for the last 6 months
              </p>
            </div>

            <div className="h-[320px] rounded-2xl border border-[#2A2622] bg-[#181614] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barCategoryGap={26}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2622" />
                  <XAxis
                    dataKey="name"
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
                    contentStyle={{
                      backgroundColor: "#211D1A",
                      border: "1px solid #312B26",
                      borderRadius: "12px",
                      color: "#F7F5F1",
                    }}
                  />
                  <Bar
                    dataKey="orders"
                    fill="#E67E22"
                    radius={[10, 10, 0, 0]}
                    maxBarSize={64}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          <InsightCard
            icon={TrendingUp}
            title="Growth Insight"
            value={
              monthlyData.length > 0
                ? `${monthlyData[monthlyData.length - 1]?.users || 0} new user(s) this month`
                : "No growth data"
            }
          />

          <InsightCard
            icon={CircleDollarSign}
            title="Revenue Insight"
            value={
              monthlyData.length > 0
                ? `${formatCurrency(monthlyData[monthlyData.length - 1]?.revenue || 0)} this month`
                : "No revenue data"
            }
          />

          <InsightCard
            icon={BookOpen}
            title="Category Insight"
            value={
              topCategory !== "—"
                ? `${topCategory} is leading`
                : "No category data"
            }
          />
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number }>;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#9A9187]">{title}</p>
          <h2 className="mt-2 text-2xl font-bold text-[#FFFDF9]">{value}</h2>
        </div>

        <div className={`rounded-xl p-3 ${tone}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[#E67E22]/10 p-3 text-[#E67E22]">
          <Icon size={18} />
        </div>
        <h3 className="font-semibold text-[#FFFDF9]">{title}</h3>
      </div>

      <p className="mt-4 text-sm leading-7 text-[#D6CEC4]">{value}</p>
    </div>
  );
}
